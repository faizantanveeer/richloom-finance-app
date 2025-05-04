"use server";
import { transactionSchema } from "@/app/lib/formSchema";
import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeAmount = (obj) => {
  if (!obj) throw new Error("No object provided to serialize");
  if (typeof obj.amount === "undefined") throw new Error("Amount is missing");

  return {
    ...obj,
    amount: typeof obj.amount === "number" ? obj.amount : obj.amount.toNumber(),
  };
};

export async function createTransaction(data) {
  const { userId } = await auth();

  if (!userId) throw new Error("User not authenticated");

  // Arcjet rate limit check
  const req = await request();

  const decision = await aj.protect(req, {
    userId,
    requested: 1, // number of tokens to consume
  });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      const { remaining, reset } = decision.reason;
      console.error({
        code: "RATE_LIMIT_EXCEEDED",
        details: { remaining, resetInSeconds: reset },
      });

      throw new Error("Too many requests. Please try again later.");
    }

    throw new Error("Request Blocked.");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User Not Found");

  const accounts = await db.accounts.findUnique({
    where: {
      id: data.accountId,
      userId: user.id,
    },
  });

  if (!accounts) throw new Error("Account not found");

  const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
  const newBalance = accounts.balance.toNumber() + balanceChange;

  const transaction = await db.$transaction(async (tx) => {
    const newTransaction = await tx.transactions.create({
      data: {
        ...data,
        userId: user.id,
        nextRecurringDate:
          data.isRecurring && data.recurringInterval
            ? calculateNextReccuringDate(data.date, data.recurringInterval)
            : null,
      },
    });

    await tx.accounts.update({
      where: { id: data.accountId },
      data: { balance: newBalance },
    });

    return { newTransaction };
  });

  revalidatePath("/dashboard");
  revalidatePath(`/account/${data.accountId}`);

  return {
    success: true,
    data: serializeAmount(transaction.newTransaction),
  };
}

// Helper to calculate recurring date
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
