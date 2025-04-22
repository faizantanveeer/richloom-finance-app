"use client";
import { updateDefaultAccount } from "@/actions/accounts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRef } from "react";

import { Switch } from "@/components/ui/switch";
import useFetch from "@/hooks/user-fetch";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";
import { toast } from "sonner";

const AccountCard = ({ account }) => {
  const { name, type, id, balance, isDefault } = account || {};

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    error,
    data: updatedAccount,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (event) => {
    event.preventDefault();
    if (isDefault) {
      toast.warning("This account is already the default account");
      return;
    }
    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount && !updateDefaultLoading) {
      const timeout = setTimeout(() => {
        toast.success("Default account updated successfully");
      }, 300); // wait a little so the checkmark animation feels natural
      return () => clearTimeout(timeout);
    }
  }, [updateDefaultLoading, updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }),
    [error];

  return (
    <div>
      <Card className={"hover:shadow-md transition-shadow group relative"}>
        <Link href={`/account/${id}`}>
          <CardHeader className={"flex items-center justify-between pb-2"}>
            <CardTitle className={"font-medium text-sm capitalize"}>
              {name}
            </CardTitle>
            <Switch
              className={"cursor-pointer"}
              checked={isDefault}
              onClick={handleDefaultChange}
              disabled={updateDefaultLoading}
            />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${parseFloat(balance).toFixed(2)}
            </p>
            <p className="text-muted-foreground  text-xs mt-0.5">
              {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}{" "}
              Account
            </p>
          </CardContent>
          <CardFooter
            className={
              "mt-4 flex justify-between text-sm text-muted-foreground"
            }
          >
            <div className="flex items-center">
              <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
              Income
            </div>

            <div className="flex items-center">
              <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
              Expense
            </div>
          </CardFooter>
        </Link>
      </Card>
    </div>
  );
};

export default AccountCard;
