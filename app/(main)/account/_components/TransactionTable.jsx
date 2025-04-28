"use client";
import { bulkDeleteTransactions } from "@/actions/accounts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { categoryColors } from "@/data/catergory";
import useFetch from "@/hooks/user-fetch";
import { format, formatDate } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";
import { map } from "zod";

const TransactionTable = ({ transactions }) => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(15);

  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    order: "desc",
  });

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim(); // Changed variable name here
      result = result.filter(
        (transaction) => transaction.description.toLowerCase().includes(term) // Using the new variable name here
      );
    }

    // Filter by Recurring

    if (recurringFilter) {
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") {
          return transaction.isRecurring;
        }
        return !transaction.isRecurring;
      });
    }

    // Filter by type

    if (typeFilter) {
      result = transactions.filter((transaction) => {
        if (typeFilter === "INCOME") {
          return transaction.type === "INCOME";
        }
        return transaction.type === "EXPENSE";
      });
    }

    // Apply Sort Filter

    if (sortConfig) {
      result.sort((a, b) => {
        let comparison = 0;

        switch (sortConfig.field) {
          case "date":
            comparison =
              new Date(a.date).getTime() - new Date(b.date).getTime();
            break;
          case "category":
            comparison = (a.category || "").localeCompare(b.category || "");
            break;
          case "amount":
            comparison = (a.amount || 0) - (b.amount || 0);
            break;
          case "description":
            comparison = (a.description || "").localeCompare(
              b.description || ""
            );
            break;
          default:
            comparison = 0;
        }

        return sortConfig.order === "asc" ? comparison : -comparison;
      });
    }

    return result; // Don't forget to return the result
  }, [transactions, typeFilter, searchTerm, recurringFilter, sortConfig]);

  const handleSort = (field) => {
    setSortConfig((current) => {
      // If clicking the same field, toggle order
      if (current.field === field) {
        return {
          field,
          order: current.order === "asc" ? "desc" : "asc",
        };
      }
      // If clicking a new field, default to descending (or ascending if you prefer)
      return {
        field,
        order: "desc", // or "asc" if you want new fields to default to ascending
      };
    });
  };

  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((i) => i !== id) : [...current, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === filteredAndSortedTransactions.length
        ? []
        : filteredAndSortedTransactions.map((t) => t.id)
    );
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setSelectedIds([]);
  };

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
  } = useFetch(bulkDeleteTransactions);

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transactions?`
      )
    )
      return;

    try {
      await deleteFn(selectedIds);
    } catch (error) {
      toast.error("Failed to delete transactions");
    }
  };

  useEffect(() => {
    const availableIds = new Set(transactions.map((t) => t.id));
    setSelectedIds((current) => current.filter((id) => availableIds.has(id)));
  }, [transactions]);

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.error("Transactions Deleted Successfully");
      setSelectedIds([]);
    }
    if (deleted && !deleteLoading) {
    }
  }, [deleted, deleteLoading]);

  const RECURRING_INTERVALS = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
  };

  return (
    <div className="space-y-4 mt-9">
      {/* Filters */}

      {deleteLoading && (
        <BarLoader className="mt-4 " width={"100%"} color="#9333ea" />
      )}

      <div className="flex items-center flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5  h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search Transaction ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">INCOME</SelectItem>
              <SelectItem value="EXPENSE">EXPENSE</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={recurringFilter}
            onValueChange={(value) => setRecurringFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring Only</SelectItem>
              <SelectItem value="non-recurring">Non-Recurring Only</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <div>
              <Button
                variant={"destructive"}
                onClick={handleBulkDelete}
                className="cursor-pointer"
              >
                <Trash className="h-4 w-4" />
                Delete Selected ({selectedIds.length})
              </Button>
            </div>
          )}

          {(searchTerm || typeFilter || recurringFilter) && (
            <Button
              variant={"outline"}
              size={"icon"}
              onClick={handleClearFilters}
              title="Clear Filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader background="bg-muted">
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  className={"cursor-pointer"}
                  checked={
                    filteredAndSortedTransactions.length ===
                      selectedIds.length &&
                    filteredAndSortedTransactions.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>

              <TableHead
                className="cursor-pointer "
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center ">
                  Date{" "}
                  {sortConfig.field === "date" &&
                    (sortConfig.order === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer">
                <div className="flex items-center">Description</div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category{" "}
                  {sortConfig.field === "category" &&
                    (sortConfig.order === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center">
                  Amount{" "}
                  {sortConfig.field === "amount" &&
                    (sortConfig.order === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer">Recurring</TableHead>
              <TableHead className="cursor-pointer" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No Transactions Found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTransactions
                .slice(0, visibleCount)
                .map((transactions) => {
                  return (
                    <TableRow key={transactions.id}>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          className="cursor-pointer"
                          onCheckedChange={() => handleSelect(transactions.id)}
                          checked={selectedIds.includes(transactions.id)}
                        />
                      </TableHead>
                      <TableCell className="font-medium">
                        {format(new Date(transactions.date), "PP")}
                      </TableCell>
                      <TableCell>{transactions.description}</TableCell>
                      <TableCell className="capitalize">
                        <span
                          className="px-2 py-1 rounded text-sm text-white"
                          style={{
                            background: categoryColors[transactions.category],
                          }}
                        >
                          {transactions.category}
                        </span>
                      </TableCell>
                      <TableCell
                        className={`text-right ${
                          transactions.type === "EXPENSE"
                            ? "text-red-500"
                            : "text-green-500"
                        } font-medium`}
                      >
                        {transactions.type === "EXPENSE" ? "-" : "+"} $
                        {transactions.amount.toFixed(2)}
                      </TableCell>

                      <TableCell className="text-center">
                        {transactions.isRecurring ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge
                                  variant="outline"
                                  className="gap-1  bg-purple-100 text-purple-700 hover:bg-purple-200"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                  {
                                    RECURRING_INTERVALS[
                                      transactions.recurringInterval
                                    ]
                                  }
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="flex gap-1 items-center text-sm">
                                  <div className="font-medium">Next Date:</div>
                                  <div>
                                    {format(
                                      new Date(transactions.nextRecurringDate),
                                      "PP"
                                    )}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Badge variant="outline" className="gap-1  ">
                            <Clock className="h-3 w-3" />
                            One-Time
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="p-0 w-8 h-8 rounded-sm data-[state=open]:bg-muted"
                            >
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              className={"cursor-pointer"}
                              onClick={() => {
                                router.push(
                                  `/transaction/create?edit=${transactions.id}`
                                );
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                deleteFn([transactions.id]);
                              }}
                              className={"cursor-pointer text-destructive"}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
        {visibleCount < filteredAndSortedTransactions.length && (
          <div className="flex justify-center my-4">
            <Button
              variant="outline"
              onClick={() => setVisibleCount((prev) => prev + 10)}
              className="w-fit"
            >
              Load More...
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionTable;
