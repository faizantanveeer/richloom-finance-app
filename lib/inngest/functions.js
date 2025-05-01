import { sendEmail } from "@/actions/send-email";
import { db } from "../prisma";
import { inngest } from "./client";
import EmailTemplate from "@/emails/template";

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

      console.log("percentUsed", percentUsed);

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
          react:  EmailTemplate({
            userName: budget.user.name,
            type: "budget-alert",
            data: {
              budgetAmount: parseFloat(budgetAmount).toFixed(1),
              totalExpense: parseFloat(totalExpenses).toFixed(1),
              percentageUsed: percentUsed,
              accountName: defaultAccount.name,
            },
          })
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
