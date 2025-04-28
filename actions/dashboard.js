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

export async function createAccount(data) {
  try {
    const { userId } = await auth();
    console.log(userId);

    if (!userId) throw new Error("User not authenticated");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User Not Found");

    const balanceFloat = parseFloat(data.balance);

    if (isNaN(balanceFloat)) throw new Error("Invalid balance amount");

    const existingAccount = await db.accounts.findMany({
      where: {
        userId: user.id,
      },
    });

    const shouldBeDefault =
      existingAccount.length === 0 ? true : data.isDefault;

    // If this account should be default, unset other default accounts
    if (shouldBeDefault) {
      await db.accounts.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const account = await db.accounts.create({
      data: {
        ...data,
        userId: user.id,
        balance: balanceFloat,
        isDefault: shouldBeDefault,
      },
    });

    const serialzedAccount = serializedTransaction(account);
    revalidatePath("/dashboard");
    return { success: true, data: serialzedAccount };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getUserAccounts() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User Not Found");

    const accounts = await db.accounts.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    const serializedAccounts = accounts.map(serializedTransaction);

    return serializedAccounts;
  } catch (error) {
    throw new Error(error.message);
  }
}
