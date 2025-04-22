import { getAccountWithTransaction } from "@/actions/accounts";
import { notFound } from "next/navigation";
import React from "react";

const AccountPage = async ({ params }) => {
  const { id } = params;

  const AccountData = await getAccountWithTransaction(id);

  if (!AccountData) {
    return notFound();
  }

  const { transactions, transactionCount, ...account } = AccountData;

  return (
    <div className="py-8 px-5 flex gap-4 items-center justify-between  ">
      <div className=" flex flex-col justify-between text-left">
        <h1 className="text-5xl sm:text-6xl font-bold gradient-title capitalize">{account.name}</h1>
        <p className="text-muted-foreground">{account.type.charAt(0).toUpperCase() + account.type.slice(1).toLowerCase()} Account</p>
      </div>

      <div className="text-right  flex flex-col justify-between items-center">
        <div className="text-2xl sm:text-3xl font-bold">
            ${parseFloat(account.balance).toFixed(2)}
            <p className="text-sm text-muted-foreground">{transactionCount} Transactions</p>
        </div>
      </div>


      {/* Chart Section */}


      {/* Transaction Table */}
    </div>
  );
};

export default AccountPage;
