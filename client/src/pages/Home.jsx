import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ChevronDown,
  MoreHorizontal,
  ArrowUpDown,
  Pencil,
  Trash2,
} from "lucide-react";
import axios from "axios";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const navigate = useNavigate();
  const name = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const [bankName, setBankName] = useState("HDFC");
  const [accountType, setAccountType] = useState("Savings");
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAccountId, setCurrentAccountId] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.post(
          `http://localhost:3000/account/edit/${currentAccountId}`,
          { bank_name: bankName, account_type: accountType },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        await axios.post(
          "http://localhost:3000/account/add",
          { bank_name: bankName, account_type: accountType },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
      setIsOpen(false);
      setIsEditing(false);
      setCurrentAccountId(null);
      getAccounts();
    } catch (error) {
      console.error("Error saving account:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this account?")) return;
    try {
      await axios.post(
        `http://localhost:3000/account/remove/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      getAccounts();
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const openEditModal = (account) => {
    setBankName(account.bank_name);
    setAccountType(account.account_type);
    setCurrentAccountId(account.account_id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const openAddModal = () => {
    setBankName("HDFC");
    setAccountType("Savings");
    setIsEditing(false);
    setIsOpen(true);
  };

  const getAccounts = async () => {
    try {
      const response = await axios.get("http://localhost:3000/account", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Updated to match server response structure
      setAccounts(response.data.data.accounts);
    } catch (error) {
      console.error("Error fetching account:", error);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "bank_name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Bank Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div
            className="font-medium text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate(`/account/${row.original.account_id}`)}
          >
            {row.getValue("bank_name")}
          </div>
        ),
      },
      {
        accessorKey: "account_type",
        header: "Account Type",
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("account_type")}</div>
        ),
      },
      {
        accessorKey: "current_balance",
        header: () => <div className="text-right">Balance</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("current_balance") || 0);
          const formatted = new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(amount);

          return <div className="text-right font-medium">{formatted}</div>;
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const account = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-500 hover:text-blue-600"
                onClick={() => openEditModal(account)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-600"
                onClick={() => handleDelete(account.account_id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() =>
                      navigator.clipboard.writeText(account.account_id)
                    }
                  >
                    Copy account ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate(`/account/${account.account_id}`)}
                  >
                    View details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openEditModal(account)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDelete(account.account_id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: accounts,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  useEffect(() => {
    if (token) {
      getAccounts();
    }
  }, [token]);
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {!name && (
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Expense Management
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Signup or signin to manage your expenses efficiently and
            effortlessly.
          </p>
        </div>
      )}
      {name && (
        <div className="w-full max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Accounts</h2>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <form onSubmit={handleSubmit}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={openAddModal}>
                    Add account
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {isEditing
                        ? "Edit account details"
                        : "Fill account details"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="bank-name">Bank name</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between font-normal"
                          >
                            {bankName}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[375px]">
                          <DropdownMenuRadioGroup
                            value={bankName}
                            onValueChange={setBankName}
                          >
                            {["HDFC", "SBI", "BOB", "Axis"].map((bank) => (
                              <DropdownMenuRadioItem key={bank} value={bank}>
                                {bank}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="account-type">Account type</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between font-normal"
                          >
                            {accountType}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[375px]">
                          <DropdownMenuRadioGroup
                            value={accountType}
                            onValueChange={setAccountType}
                          >
                            {["Savings", "Current"].map((type) => (
                              <DropdownMenuRadioItem key={type} value={type}>
                                {type}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit}>
                      {isEditing ? "Save changes" : "Create account"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </form>
            </Dialog>
          </div>

          <div className="flex items-center py-4 gap-4">
            <Input
              placeholder="Filter banks..."
              value={table.getColumn("bank_name")?.getFilterValue() ?? ""}
              onChange={(event) =>
                table.getColumn("bank_name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="rounded-md border overflow-hidden">
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
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      onDoubleClick={() =>
                        navigate(`/account/${row.original.account_id}`)
                      }
                      className="cursor-default"
                    >
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
                      No accounts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
