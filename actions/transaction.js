"use server";
import { transactionSchema } from "@/app/lib/formSchema";
import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { parse } from "date-fns";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

export async function scanReceipt(file) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const arrayBuffer = await file.arrayBuffer();

    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object.`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      return {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        merchantName: data.merchantName,
        category: data.category,
      };
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      throw new Error("Invalid response format from Gemini.");
    }
  } catch (error) {
    console.error("Error processing receipt: " + error.message);
    throw new Error("Failed to scan receipt: ");
  }
}
