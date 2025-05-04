import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z.string().min(1, { message: "Balance is required" }),
  isDefault: z.boolean().default(false),
});

export const transactionSchema = z.object({
  type: z.enum(["EXPENSE", "INCOME"]),
  amount: z.string().min(1, { message: "Amount is required" }),
  description: z.string().optional(),
  date: z.date({
    required_error: "Date is required",
  }),
  accountId: z.string().min(1, { message: "Account is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  isRecurring: z.boolean().default(false),
  recurringInterval: z
    .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
    .optional(),
}).superRefine((data, ctx) => {
    if(data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring interval is required when isRecurring is true",
        path: ["recurringInterval"],
      });
    }
});
