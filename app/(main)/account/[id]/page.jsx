import { getAccountWithTransaction } from "@/actions/accounts";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";
import TransactionTable from "../_components/TransactionTable";
import AccountChart from "../_components/AccountChart";
import { BarLoader } from "react-spinners";

const AccountPage = async ({ params }) => {
  const { id } = await params;

  const AccountData = await getAccountWithTransaction(id);

  if (!AccountData) {
    return notFound();
  }

  const { transactions, transactionCount, ...account } = AccountData;

  return ( 
    <div className="py-5 px-5  ">
      <div className=" flex gap-4 items-center justify-between">
        <div className=" flex flex-col justify-between text-left">
          <h1 className="text-5xl sm:text-6xl font-bold gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0).toUpperCase() +
              account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>

        <div className="text-right  flex flex-col justify-between items-center">
          <div className="text-2xl sm:text-3xl font-bold">
            ${parseFloat(account.balance).toFixed(2)}
            <p className="text-sm text-muted-foreground">
              {transactionCount} Transactions
            </p>
          </div>
        </div>
      </div>

      {/* Chart Section */}

      <Suspense
        fallback={
          <BarLoader className="mt-4 " width={"100%"} color="#008f39" />
        }
      >
        <AccountChart transactions={transactions}></AccountChart>
      </Suspense>



      {/* Transaction Table */}
      <Suspense
        fallback={
          <BarLoader className="mt-4 " width={"100%"} color="#008f39" />
        }
      >
        <TransactionTable transactions={transactions} />
      </Suspense>
    </div>
  );
};

export default AccountPage;
