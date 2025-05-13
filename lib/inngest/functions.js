import { sendEmail } from "@/actions/send-email";
import { db } from "../prisma";
import { inngest } from "./client";
import EmailTemplate from "@/emails/template";
import next from "next";
import { getMonth } from "date-fns";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const CheckBudgetAlert = inngest.createFunction(
  {
    id: "check-budget-alert",
    name: "Check Budget Alert",
  },
  {
    event: "budget/alert.check",
    cron: "0 */6 * * *", // Runs every 6 hours
  },
  async ({ step }) => {
    // Fetch all budgets with their users and default accounts
    const budgets = await step.run("fetch-budgets", async () => {
      return await db.budgets.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
      });
    });

    // Process each budget
    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue;

      // Calculate expenses for current month
      const { expense } = await step.run(
        `calculate-expenses-${budget.id}`,
        async () => {
          const currentDate = new Date();

          const startOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          );

          const endOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
          );
          const expense = await db.transactions.aggregate({
            where: {
              userId: budget.userId,
              type: "EXPENSE",
              accountId: defaultAccount.id,
              date: {
                gte: startOfMonth,
                lte: endOfMonth,
              },
            },
            _sum: {
              amount: true,
            },
          });

          return { expense };
        }
      );

      const totalExpenses = parseFloat(expense._sum?.amount) || 0;
      const budgetAmount = parseFloat(budget.amount);
      const percentUsed = Number(
        ((totalExpenses / budgetAmount) * 100).toFixed(2)
      );

      // console.log("percentUsed", percentUsed);

      // Check if we should send alert
      const lastAlertDate = budget.lastAlertSent
        ? new Date(budget.lastAlertSent)
        : null;
      const currentDate = new Date();

      const shouldSendAlert =
        (percentUsed >= 80 && !budget.lastAlertSent) ||
        (lastAlertDate && isNewMonth(lastAlertDate, currentDate));

      await sendEmail({
        to: budget.user.email,
        subject: `Budget Alert for ${defaultAccount.name}`,
        react: EmailTemplate({
          userName: budget.user.name,
          type: "budget-alert",
          data: {
            budgetAmount: parseFloat(budgetAmount).toFixed(1),
            totalExpense: parseFloat(totalExpenses).toFixed(1),
            percentageUsed: percentUsed,
            accountName: defaultAccount.name,
          },
        }),
      });

      // Update last alert date
      await db.budgets.update({
        where: { id: budget.id },
        data: { lastAlertSent: currentDate },
      });
    }
  }
);

function isNewMonth(lastAlertDate, currentDate) {
  return (
    lastAlertDate.getFullYear() !== currentDate.getFullYear() ||
    lastAlertDate.getMonth() !== currentDate.getMonth()
  );
}

export const triggerRecurringTransaction = inngest.createFunction(
  {
    id: "trigger-recurring-transaction",
    name: "Trigger Recurring Transaction",
  },
  {
    cron: "0 0 * * *", // Runs every day at midnight
  },
  async ({ step }) => {
    // 1. Fetch all recurring transactions

    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",

      async () => {
        return await db.transactions.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { lastProcessed: null }, //never processed
              {
                nextRecurringDate: {
                  // Due date passed
                  lte: new Date(),
                },
              },
            ],
          },
        });
      }
    );

    // console.log("Recurring transactions:", recurringTransactions);

    // 2. create event for each transaction

    // ✅ Fix: send events when transactions exist
    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((transaction) => ({
        name: "transaction.recurring.process",
        data: {
          transactionId: transaction.id,
          userId: transaction.userId, // fixed typo from "usedId"
        },
      }));

      await inngest.send(events); // ✅ Correct method name
    }

    return { triggered: recurringTransactions.length };
  }
);

export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    throttle: {
      limit: 10,
      period: "1m",
      key: "event.data.userId",
    },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    if (!event?.data?.transactionId || !event?.data?.userId) {
      console.error("Invalid event data", event);
      return { error: "Missing required event data" };
    }

    await step.run("process-recurring-transaction", async () => {
      const transaction = await db.transactions.findFirst({
        where: {
          id: event.data.transactionId,
          userId: event.data.userId,
        },
      });

      if (!transaction || !isTransactionDue(transaction)) {
        throw new Error("Transaction not found or not due");
      }

      await db.$transaction(async (tx) => {
        await tx.transactions.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            accountId: transaction.accountId,
            userId: transaction.userId,
            isRecurring: false,
          },
        });

        const balanceChange =
          transaction.type === "EXPENSE"
            ? -transaction.amount.toNumber()
            : transaction.amount.toNumber();

        await tx.accounts.update({
          where: { id: transaction.accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });

        await tx.transactions.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextReccuringDate(
              new Date(),
              transaction.recurringInterval
            ),
          },
        });
      });
    });
  }
);

function isTransactionDue(transaction) {
  // if no lastprocessed date, it means transaction is due
  if (!transaction.lastProcessed) return true;

  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);

  return nextDue <= today;
}

function calculateNextReccuringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      throw new Error("Invalid interval provided");
  }

  return date;
}

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  {
    cron: "0 0 1 * *", // Runs on the first day of every month at midnight
  },
  async ({ step }) => {
    // Fetch all users
    const users = await step.run("fetch-users", async () => {
      return await db.user.findMany({
        include: {
          accounts: true,
        },
      });
    });


    // Process each user
    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
    
        const stats = await getMonthlyStats(user.id, lastMonth);
    
    
        if (!stats || stats.transactionCount === 0) {
          return;
        }
    
        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
        });
    
        const insights = await generateFiniancialInsights(stats, monthName);
    
        await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report - ${monthName}`,
          react: EmailTemplate({
            userName: user.name,
            type: "monthly-report",
            data: {
              stats,
              month: monthName,
              insights,
            },
          }),
        });
      });
    }

    return { processed: users.length };
  }
);

const generateFiniancialInsights = async (stats, month) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: $${stats.totalIncome}
    - Total Expenses: $${stats.totalExpenses}
    - Net Income: $${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: $${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
};

const getMonthlyStats = async (userId, month) => {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = await db.transactions.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  if (!transactions || transactions.length === 0) {
    return {
      totalExpense: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: 0,
    };
  }

  const stats = transactions.reduce(
    (stats, t) => {
      const amount = t.amount.toNumber();
      if (t.type === "EXPENSE") {
        stats.totalExpense += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }

      return stats;
    },
    {
      totalExpense: 0,
      totalIncome: 0,
      byCategory: {},
    }
  );

  stats.transactionCount = transactions.length;
  return stats;
};

