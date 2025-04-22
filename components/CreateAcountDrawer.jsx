import React, { useEffect, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "@/app/lib/formSchema";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import useFetch from "@/hooks/user-fetch";
import createAccount from "@/actions/dashboard";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const CreateAcountDrawer = ({ children }) => {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const {
    loading: createAccountLoading,
    data: newAccount,
    fn: createAccontFn,
    error,
  } = useFetch(createAccount);

  const onSubmit = async (data) => {
    if (!createAccountLoading) {
      createAccontFn(data);
    }
  };

  useEffect(() => {
    if (newAccount && !createAccountLoading) {
      toast.success("Account created successfully");
      reset();
      setOpen(false);
    }
  }, [newAccount, createAccountLoading]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to create account");
      setOpen(false);
    }
  }, [error]);

  useEffect(() => {
    if (open) {
      reset(); // Reset form to initial values
    }
  }, [open, reset]);
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create a New Account</DrawerTitle>
          <DrawerDescription>
            Fill out the form below to add a new account.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 py-2 overflow-y-auto flex-1">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 ">
              <label htmlFor="name" className="text-sm font-medium">
                Account Name
              </label>
              <Input
                id="name"
                placeholder="e.g., Name Checking"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-4 ">
              <label htmlFor="type" className="text-sm font-medium">
                Select Account Type
              </label>
              <Select
                onValueChange={(value) => setValue("type", value)}
                defaultValue={watch("type")}
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Saving</SelectItem>
                </SelectContent>
              </Select>

              {errors.type && (
                <p className="text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-4 ">
              <label htmlFor="balance" className="text-sm font-medium">
                Initial Balance
              </label>
              <Input
                id="balance"
                step="0.01"
                type={"number"}
                placeholder="0.00"
                {...register("balance")}
              />
              {errors.balance && (
                <p className="text-red-500">{errors.balance.message}</p>
              )}
            </div>

            <div className="space-y-4 flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <label
                  htmlFor="isDefault"
                  className="text-sm font-medium curosr-pointer"
                >
                  Make it default
                </label>

                <p className="text-sm text-muted-foreground">
                  This account will be selected by default for transactions
                </p>
              </div>
              <Switch
                id="isDefault"
                onCheckedChange={(checked) => setValue("isDefault", checked)}
                checked={watch("isDefault")}
              />

              {errors.isDefault && (
                <p className="text-red-500">{errors.isDefault.message}</p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <DrawerClose asChild>
                <Button type="button" variant={"outline"} className={"flex-1"}>
                  Cancel
                </Button>
              </DrawerClose>

              <Button
                type="submit"
                className={"flex-1"}
                disabled={createAccountLoading}
              >
                {createAccountLoading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateAcountDrawer;
