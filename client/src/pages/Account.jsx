import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, ArrowUpDown, Trash2, Plus } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

// Transaction categories from server
const TRANSACTION_CATEGORIES = {
  income: [
    "Salary",
    "Freelance",
    "Investment",
    "Gift",
    "Refund",
    "Other Income",
  ],
  expense: [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Education",
    "Other",
  ],
};

export const Account = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [transactions, setTransactions] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    transaction_amount: "",
    transaction_type: "debit",
    transaction_category: "Food",
    transaction_description: "",
  });
  const [accountBalance, setAccountBalance] = useState(0);

  const getTransactions = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/account/transaction/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // Updated to match server response structure
      setTransactions(response.data.data.transactions);
      setAccountBalance(response.data.data.currentBalance);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      await axios.delete("http://localhost:3000/account/transaction/remove/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { id: transactionId },
      });
      getTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:3000/account/transaction/add/${id}`,
        newTransaction,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setNewTransaction({
        transaction_amount: "",
        transaction_type: "debit",
        transaction_category: "Food",
        transaction_description: "",
      });
      setShowAddForm(false);
      getTransactions();
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert(error.response?.data?.message || "Error adding transaction");
    }
  };

  useEffect(() => {
    getTransactions();
  }, [id]);

  // Get available categories based on transaction type
  const availableCategories =
    newTransaction.transaction_type === "credit"
      ? TRANSACTION_CATEGORIES.income
      : TRANSACTION_CATEGORIES.expense;

  const columns = useMemo(
    () => [
      {
        accessorKey: "transaction_date",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = new Date(row.getValue("transaction_date"));
          return <div>{date.toLocaleDateString()}</div>;
        },
      },
      {
        accessorKey: "transaction_category",
        header: "Category",
        cell: ({ row }) => (
          <div className="capitalize">
            {row.getValue("transaction_category")}
          </div>
        ),
      },
      {
        accessorKey: "transaction_description",
        header: "Description",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {row.getValue("transaction_description") || "-"}
          </div>
        ),
      },
      {
        accessorKey: "transaction_type",
        header: "Type",
        cell: ({ row }) => (
          <div
            className={`capitalize font-medium ${
              row.getValue("transaction_type") === "credit"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {row.getValue("transaction_type")}
          </div>
        ),
      },
      {
        accessorKey: "transaction_amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("transaction_amount") || 0);
          const formatted = new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(amount);

          return (
            <div
              className={`text-right font-medium ${
                row.getValue("transaction_type") === "credit"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {row.getValue("transaction_type") === "credit" ? "+" : "-"}
              {formatted}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const transaction = row.original;
          return (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteTransaction(transaction.transaction_id)}
              className="text-red-600 hover:text-red-800 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: transactions,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Account Transactions</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p
              className={`text-lg font-bold ${
                accountBalance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(accountBalance)}
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 border rounded-md bg-card">
          <h2 className="text-lg font-semibold mb-4">Add New Transaction</h2>
          <form onSubmit={addTransaction} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  value={newTransaction.transaction_amount}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      transaction_amount: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  placeholder="Enter amount"
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={newTransaction.transaction_type}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      transaction_type: e.target.value,
                      transaction_category:
                        e.target.value === "credit" ? "Salary" : "Food",
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                >
                  <option value="debit">Debit (Expense)</option>
                  <option value="credit">Credit (Income)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  value={newTransaction.transaction_category}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      transaction_category: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newTransaction.transaction_description}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      transaction_description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Add Transaction</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
