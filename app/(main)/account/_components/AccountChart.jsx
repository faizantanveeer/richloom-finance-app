"use client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Card,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import React, { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  Bar,
  YAxis,
  BarChart,
  Tooltip,  
  Rectangle,
} from "recharts";

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last 1 Month", days: 30 },
  "2M": { label: "Last 2 Months", days: 60 },
  "3M": { label: "Last 3 Months", days: 90 },
  ALL: { label: "All Time", days: null },
};

const AccountChart = ({ transactions }) => {
  const [dateRange, setDateRange] = useState("1M");

  const filteredData = useMemo(() => {
    const date = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = date.days
      ? startOfDay(subDays(now, date.days))
      : startOfDay(new Date(0)); // Set to epoch start date

    const filteredTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endOfDay(now);
    });

    const grouped = filteredTransactions.reduce((acc, transaction) => {
      const date = format(new Date(transaction.date), "MMM dd");

      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }

      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }

      if (transaction.type === "INCOME") {
        acc[date].income += transaction.amount;
      } else {
        acc[date].expense += transaction.amount;
      }

      return acc;
    }, {});

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [transactions, dateRange]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);

  return (
    <div className="mt-8">
      <Card>
        <CardHeader className="flex items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle className="text-base font-normal">
              Transaction Overview
            </CardTitle>

            <CardDescription>View your transaction</CardDescription>
          </div>

          <div>
            <Select defaultValue={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select Range" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DATE_RANGES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-around mb-6 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground">Total Income</p>
              <p className="text-lg font-bold text-green-500">
                ${totals.income.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Total Expense</p>
              <p className="text-lg font-bold text-red-500">
                ${totals.expense.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Net Profit</p>
              <p
                className={`text-lg font-bold ${
                  totals.income - totals.expense >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                ${(totals.income - totals.expense).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {filteredData.length === 0 ? (
                <div className="flex items-center justify-center text-5xl h-full text-muted-foreground">No data available</div>
              ):(
              <BarChart
                data={filteredData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip formatter={(value)=> [`$${value}`, undefined]}/>
                <Legend />
                <Bar
                  dataKey="income"
                  name={"Income"}
                  fill="#22c55e"
                  radius={[4,4,0,0]}
                  />
                <Bar
                  dataKey="expense"
                  name={"Expense"}
                  fill="#ef4444"
                  radius={[4,4,0,0]}
                />
              </BarChart>)}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountChart;
