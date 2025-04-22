import { z } from "zod";

export const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    type: z.enum(["CURRENT", "SAVINGS"]),
    balance: z.string().min(1, { message: "Balance is required" }),
    isDefault: z.boolean().default(false),
})