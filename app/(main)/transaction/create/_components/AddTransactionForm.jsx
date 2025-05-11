"use client";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/formSchema";
import CreateAcountDrawer from "@/components/CreateAcountDrawer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import useFetch from "@/hooks/user-fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import RecieptScanner from "./RecieptScanner";

const  AddTransactionForm = ({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}) => {
  const router = useRouter();

  const searchParams =  useSearchParams();
  const editId = searchParams?.get("edit");
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    getValues,
  } = useForm({
    resolver: zodResolver(transactionSchema),

    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description,
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            accountId: accounts.find((acc) => acc.id === accounts.accountId)
              ?.id,
            amount: "",
            date: new Date(), // Updated to use new Date() for the date field
            type: "EXPENSE",
            description: "",
            isRecurring: false,
          },
  });

  const {
    loading: transactionLoading,
    error,
    data: transactionResult,
    fn: transactionFn,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const onSubmit = async (data) => {
    try {
      // console.log("Submitting data:", data);

      const transactionData = {
        ...data,
        amount: parseFloat(data.amount),
      };

      if (editMode) {
        await transactionFn(transactionData, editId);
      } else {
        await transactionFn(transactionData);
      }
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        editMode
          ? "Transaction updated successfully"
          : "Transaction created successfully"
      );
      router.push(`/account/${transactionResult.data.accountId}`);
      reset();
    }
  }, [transactionResult, transactionLoading, editMode]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "An error occurred");
    }
  }, [error]);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  const handleScanComplete = (scannedData) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString());
      setValue("date", new Date(scannedData.date));

      if (scannedData.description) {
        setValue("description", scannedData.description);
      }

      if (scannedData.category) {
        const matchedCategory = categories.find(
          (cat) => cat.name.toLowerCase() === scannedData.category.toLowerCase()
        );
        if (matchedCategory) {
          setValue("category", matchedCategory.id);
        }
      }
    }
  };
  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* AI Receipt Scanner */}
      {!editMode && <RecieptScanner onScanComplete={handleScanComplete} />}

      <div className="space-y-4">
        <label htmlFor="type" className="text-sm font-medium">
          Type
        </label>
        <Select
          onValueChange={(value) => setValue("type", value)}
          defaultValue={type}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>

        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>
      <div className="items-center justify-center grid gap-6 md:grid-cols-2 ">
        <div className="space-y-4  h-full">
          <label htmlFor="type" className="text-sm font-medium">
            Amount
          </label>
          <Input
            type={"number"}
            step="0.01"
            placeholder="0.00"
            {...register("amount")}
          />

          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-4 h-full">
          <label htmlFor="type" className="text-sm font-medium">
            Account
          </label>
          <Select
            onValueChange={(value) => setValue("accountId", value)}
            value={watch("accountId")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} (${parseFloat(account.balance).toFixed(2)})
                </SelectItem>
              ))}

              <CreateAcountDrawer>
                <Button
                  variant="ghost"
                  className="w-full select-none  items-center text-sm outline-none"
                >
                  Create Account
                </Button>
              </CreateAcountDrawer>
            </SelectContent>
          </Select>

          {errors.accountId && (
            <p className="text-sm text-red-500">{errors.accountId.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4 h-full">
        <label htmlFor="type" className="text-sm font-medium">
          Category
        </label>
        <Select
          onValueChange={(value) => setValue("category", value)}
          defaultValue={getValues("category")}
          value={watch("category")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>
      <div className="space-y-4 h-full">
        <label htmlFor="type" className="text-sm font-medium">
          Date
        </label>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full pl-3  text-left font-normal"
            >
              {date ? format(date, "PPP") : <span>Pick a Date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => setValue("date", date)}
              disabled={(date) =>
                date > new Date() || date < new Date("1990-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-4  h-full">
        <label htmlFor="type" className="text-sm font-medium">
          Description
        </label>
        <Input
          type={"text"}
          placeholder="Enter Description"
          {...register("description")}
        />

        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-4 flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <label
            htmlFor="isDefault"
            className="text-sm font-medium curosr-pointer"
          >
            Recurring Transaction
          </label>

          <p className="text-sm text-muted-foreground">
            Set up a recurring schedule for this transaction
          </p>
        </div>
        <Switch
          id="isDefault"
          checked={isRecurring}
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
        />
      </div>
      {isRecurring && (
        <div className="space-y-4 h-full">
          <label htmlFor="type" className="text-sm font-medium">
            Recurring Interval
          </label>
          <Select
            onValueChange={(value) => setValue("recurringInterval", value)}
            defaultValue={getValues("recurringInterval")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>

          {errors.recurringInterval && (
            <p className="text-sm text-red-500">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-4 justify-between items-center w-full">
        <Button
          variant="outline"
          type="button"
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          variant="default"
          type="submit"
          className="flex-1 min-w-0 cursor-pointer"
          disabled={transactionLoading}
        >
          {transactionLoading ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              {editMode ? "Updating..." : "Creating..."}
            </>
          ) : editMode ? (
            "Update Transaction"
          ) : (
            "Create Transaction"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddTransactionForm;
