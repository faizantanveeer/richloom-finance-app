import React, { Suspense } from "react";

import CreateAccountDrawer from "@/components/CreateAcountDrawer";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { getDashboardData, getUserAccounts } from "@/actions/dashboard";
import AccountCard from "./_components/AccountCard";
import { getCurrentBudget } from "@/actions/budget";
import BudgetProgress from "./_components/BudgetProgress";
import { ClipLoader } from "react-spinners";
import DashboardOverview from "./_components/DashboardOverview";

const DashboardPage = async () => {
  const accounts = await getUserAccounts();

  const defaultAccount = accounts.find((account) => account.isDefault);

  let budgetData = null;

  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  const transactions = await getDashboardData();

  console.log("Budget Data:", budgetData);
  return (
    <div className="container mx-auto space-y-8">
      {/* Budget Progress */}

      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData.budget}
          currentExpenses={budgetData.currentExpenses}
        />
      )}

      {/* Account Overview */}

      <Suspense fallback={"Loading overview..."}>
        <DashboardOverview accounts={accounts} transactions={transactions} />
      </Suspense>

      {/* Account Grid*/}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 ">
        <CreateAccountDrawer>
          <Card
            className={
              "hover:shadow-md transition-shadow cursor-pointer  h-full"
            }
          >
            <CardContent
              className={
                "flex flex-col text-muted-foreground h-full pt-5 justify-center items-center gap-2"
              }
            >
              <Plus className="h-10 w-10 mb-2" />
              Add Account
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts.length > 0 &&
          accounts.map((account) => {
            return <AccountCard key={account.id} account={account} />;
          })}
      </div>
    </div>
  );
};

export default DashboardPage;
