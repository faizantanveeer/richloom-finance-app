"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import React, { useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = [
  "#FF0080", // Hot Pink
  "#00FFFF", // Cyan
  "#FF4500", // Orange Red
  "#32CD32", // Lime Green
  "#FF1493", // Deep Pink
  "#00CED1", // Dark Turquoise
  "#FFD700", // Gold
  "#9370DB", // Medium Purple
  "#FF6347", // Tomato
  "#20B2AA", // Light Sea Green
  "#FFA500", // Orange
  "#8A2BE2", // Blue Violet
];

const DashboardOverview = ({ accounts, transactions }) => {
  const [selectedAccount, setSelectedAccount] = useState(
    accounts.find((a) => a.isDefault?.id) || accounts[0]?.id
  );
  const [expanded, setExpanded] = useState(false);

  const accountTransactions = transactions.filter(
    (t) => t.accountId === selectedAccount
  );

  const recentTransactions = accountTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const currentDate = new Date();
  const currentMonthExpense = accountTransactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      t.type === "EXPENSE" &&
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });

  // Group Expense by Category

  const expenseByCategory = currentMonthExpense.reduce((acc, transaction) => {
    const category = transaction.category || "Uncategorized";

    if (!acc[category]) {
      acc[category] = 0;
    }

    acc[category] += transaction.amount;
    return acc;
  }, {});

  // Format for Pie Chart

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  const renderColorfulLegendText = (value) => {
    return <span style={{ color: "#333" }}>{value}</span>;
  };

  const pieChartData = Object.entries(expenseByCategory).map(
    ([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
      value: amount,
    })
  );

  const getTransformedData = () => {
    if (expanded || pieChartData.length <= 6) return pieChartData;

    const top6 = pieChartData.slice(0, 6);
    const others = pieChartData.slice(6);
    const othersTotal = others.reduce((acc, item) => acc + item.value, 0);

    return [...top6, { name: "Others", value: othersTotal, isOthers: true }];
  };

  const transformedData = getTransformedData();

  console.log("Transformed Data:", transformedData);

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-normal">
            Recent Transactions
          </CardTitle>
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>

            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          <div>
            {recentTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No recent transactions
              </p>
            ) : (
              recentTransactions.map((transaction) => {
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between space-y-4"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {transaction.description || "Untitled Description"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.date), "PP")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex items-center",
                          transaction.type === "EXPENSE"
                            ? "text-red-500"
                            : "text-green-500"
                        )}
                      >
                        {transaction.type === "EXPENSE" ? (
                          <ArrowDownRight className="mr-1 h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="mr-1 h-4 w-4" />
                        )}
                        ${transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
      {/* Pie Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-normal">
            Monthly Expense Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-3">
          {pieChartData.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No expenses this month
            </p>
          ) : (
            <div className="h-[300px] p-0">
              <ResponsiveContainer className="border flex items-center justify-center p-0">
                <div className="overflow-x-auto md:overflow-visible max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden">
                  <div
                    className={`transition-all duration-300 min-w-[400px] md:min-w-full ${
                      expanded ? "min-h-[400px]" : "min-h-[300px]"
                    }`}
                    style={{
                      WebkitOverflowScrolling: "touch",
                    }}
                  >
                    <PieChart width={400} height={300}>
                      <Pie
                        data={transformedData}
                        cx="45%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        innerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                        onClick={(data, index) => {
                          if (data.isOthers) setExpanded(true);
                        }}
                      >
                        {transformedData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value, name) => [
                          `$${value.toFixed(2)}`,
                          name,
                        ]}
                      />
                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        className="capitalize text-xs sm:text-sm"
                        wrapperStyle={{
                          paddingLeft: "20px",
                          fontSize: "inherit",
                          lineHeight: "1.6",
                          maxHeight: "200px",
                          overflowY: "auto",
                          paddingRight: "10px",
                        }}
                        iconSize={12}
                        iconType="circle"
                        formatter={(value) => (
                          <span
                            style={{
                              color: "#374151",
                              fontWeight: "500",
                              marginLeft: "8px",
                              fontSize: "inherit",
                            }}
                          >
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                    {expanded && (
                      <button
                        className="mt-2 text-blue-500 underline text-sm"
                        onClick={() => setExpanded(false)}
                      >
                        Show Less
                      </button>
                    )}
                  </div>
                </div>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
