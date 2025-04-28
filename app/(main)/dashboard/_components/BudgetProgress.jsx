"use client";
import { updateBudget } from "@/actions/budget";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import useFetch from "@/hooks/user-fetch";
import { Check, Pen, Pencil, X } from "lucide-react";
import React, { useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";

const BudgetProgress = ({ initialBudget, currentExpenses }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [newBudget, setNewBudget] = React.useState(
    initialBudget?.amount?.toString() || ""
  );

  const percentUsed = initialBudget
    ? ((currentExpenses / initialBudget.amount) * 100).toFixed(2)
    : 0;

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  const handleBudget = async () => {
    // Logic to handle the budget update
    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid budget amount.");
      return;
    }

    await updateBudgetFn(amount);
  };

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "0");
    setIsEditing(false);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);
      toast.success("Budget updated successfully!");
    }
  }, [updatedBudget]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget.");
    }
  }, [error]);

  return (
    <div className="">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex-1">
            <CardTitle>Monthly Budget (Default Account)</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {isLoading ? (
                <div className="flex justify-center items-center">
                  {/* Using ClipLoader spinner from react-spinners */}
                  <ClipLoader
                    color="#737373"
                    loading={isLoading}
                    size={16}
                    className="mr-1"
                  />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              ) : (
                <>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={newBudget} // Fallback to "0" if newBudget is undefined
                        onChange={(e) => setNewBudget(e.target.value)}
                        className="w-34"
                        autoFocus
                        placeholder="Enter Amount"
                        disabled={isLoading}
                      />
                      <Button
                        variant={"ghost"}
                        size={"icon"}
                        className="cursor-pointer"
                        disabled={isLoading}
                        onClick={() => handleBudget()}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        variant={"ghost"}
                        className="cursor-pointer"
                        size={"icon"}
                        disabled={isLoading}
                        onClick={() => handleCancel()}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <CardDescription>
                        {initialBudget
                          ? `$${currentExpenses.toFixed(
                              2
                            )} of $${initialBudget.amount.toFixed(2)} spent`
                          : "No budget set"}
                      </CardDescription>

                      <Button
                        variant={"ghost"}
                        size={"icon"}
                        onClick={() => setIsEditing(true)}
                        className="border"
                      >
                        <Pencil className="h-6 w-6" />
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {initialBudget && (
            <div className="space-y-2">
              <Progress
                value={percentUsed}
                extraStyles={
                  percentUsed >= 90
                    ? "bg-red-500"
                    : percentUsed >= 75
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }
              />
            </div>
          )}
          <div className="mt-2 flex items-center justify-between text-muted-foreground">
            <p className="text-sm">
              {`Remaining: $${(initialBudget.amount - currentExpenses).toFixed(
                2
              )}`}
            </p>
            <p className="text-sm">{parseFloat(percentUsed).toFixed(1)}% used</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetProgress;
