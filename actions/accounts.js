"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializedTransaction = (obj) => {
  const serialzed = { ...obj };

  if (obj.balance) {
    serialzed.balance = obj.balance.toNumber();
  }

  if (obj.amount) {
    serialzed.amount = obj.amount.toNumber();
  }

  return serialzed;
};

export async function updateDefaultAccount(accountId) {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("User not authenticated");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User Not Found");

    await db.accounts.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    const account = await db.accounts.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: {
        isDefault: true,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializedTransaction(account) };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to update default account",
    };
  }
}

export async function getAccountWithTransaction(accountId) {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("User not authenticated");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User Not Found");

    const account = await db.accounts.findUnique({
      where: {
        id: accountId,
        userId: user.id,
      },
      include: {
        transactions: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // Count the number of transactions separately
    const transactionCount = await db.transactions.count({
      where: {
        accountId: accountId,
      },
    });

    if (!account) {
      return null;
    }

    return {
      ...serializedTransaction(account),
      transactions: account.transactions.map(serializedTransaction),
      transactionCount, // Include the transaction count
    };
  } catch (error) {
    return { error: error.message };
  }
}

export async function bulkDeleteTransactions(transactionIds) {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("User not authenticated");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User Not Found");

    const transactions = await db.transactions.findMany({
      where: {
        id: {
          in: transactionIds,
        },
        account: {
          userId: user.id,
        },
      },
      include: {
        account: true, // Include account information to verify balances
      },
    });

    // Convert amounts to numbers and calculate balance changes
    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const amount = Number(transaction.amount);
      if (isNaN(amount)) {
        throw new Error(`Invalid amount for transaction ${transaction.id}`);
      }
      
      const change = transaction.type === "EXPENSE" ? amount : -amount;
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    // Delete Transactions and Update Account Balances
    await db.$transaction(async (tx) => {
      await tx.transactions.deleteMany({
        where: {
          id: { in: transactionIds },
          account: {
            userId: user.id,
          },
        },
      });

      for (const [accountId, balanceChange] of Object.entries(accountBalanceChanges)) {
        // Ensure balanceChange is a number
        const numericChange = Number(balanceChange);
        if (isNaN(numericChange)) {
          throw new Error(`Invalid balance change for account ${accountId}`);
        }

        await tx.accounts.update({
          where: {
            id: accountId,
          },
          data: {
            balance: {
              increment: numericChange,
            },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");
    return { success: true };
  } catch (error) {
    console.error("Bulk delete error:", error);
    return { success: false, error: error.message };
  }
}