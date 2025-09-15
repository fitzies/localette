"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleXIcon,
  Columns3Icon,
  EllipsisIcon,
  FilterIcon,
  ListFilterIcon,
  EyeIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  orderId: string;
  productId: string;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
};

type Order = {
  id: string;
  orderNumber: string;
  userId: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "COMPLETED"
    | "CANCELLED";
  total: number;
  deliveryType: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  businessId: string;
  items: OrderItem[];
};

interface OrdersTableProps {
  orders: Order[];
  businessId: string;
  onOrderUpdate?: (orders: Order[]) => void;
}

// Custom filter function for multi-column searching
const multiColumnFilterFn: FilterFn<Order> = (row, columnId, filterValue) => {
  const searchableRowContent = `${row.original.orderNumber} ${
    row.original.notes || ""
  } ${row.original.userId}`.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

const statusFilterFn: FilterFn<Order> = (
  row,
  columnId,
  filterValue: string[]
) => {
  if (!filterValue?.length) return true;
  const status = row.getValue(columnId) as string;
  return filterValue.includes(status);
};

const deliveryTypeFilterFn: FilterFn<Order> = (
  row,
  columnId,
  filterValue: string[]
) => {
  if (!filterValue?.length) return true;
  const deliveryType = row.getValue(columnId) as string;
  return filterValue.includes(deliveryType);
};

const columns: ColumnDef<Order>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 28,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Order",
    accessorKey: "orderNumber",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div>
          <div className="font-medium">{row.getValue("orderNumber")}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.items.length} item
            {row.original.items.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    ),
    size: 200,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },
  {
    header: "Customer",
    accessorKey: "userId",
    cell: ({ row }) => {
      const userId = row.getValue("userId") as string;
      return <div className="text-sm">{userId.slice(0, 8)}...</div>;
    },
    size: 120,
  },
  {
    header: "Items",
    accessorKey: "items",
    cell: ({ row }) => {
      const items = row.original.items;
      return (
        <div className="space-y-1">
          {items.slice(0, 2).map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-sm">
              {item.product.imageUrl ? (
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="h-6 w-6 rounded object-cover"
                />
              ) : (
                <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    {item.product.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="truncate">{item.product.name}</span>
              <span className="text-muted-foreground">×{item.quantity}</span>
            </div>
          ))}
          {items.length > 2 && (
            <div className="text-xs text-muted-foreground">
              +{items.length - 2} more
            </div>
          )}
        </div>
      );
    },
    size: 200,
  },
  {
    header: "Total",
    accessorKey: "total",
    cell: ({ row }) => {
      const total = row.getValue("total") as number;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(total);
      return <div className="font-medium">{formatted}</div>;
    },
    size: 120,
  },
  {
    header: "Delivery",
    accessorKey: "deliveryType",
    cell: ({ row }) => {
      const deliveryType = row.getValue("deliveryType") as string;
      const isPickup = deliveryType === "pickup";
      return (
        <Badge variant={isPickup ? "secondary" : "outline"}>
          {isPickup ? "Pickup" : "Dine-in"}
        </Badge>
      );
    },
    size: 100,
    filterFn: deliveryTypeFilterFn,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      const statusConfig = {
        PENDING: { label: "Pending", className: "bg-yellow-500 text-white" },
        CONFIRMED: { label: "Confirmed", className: "bg-blue-500 text-white" },
        PREPARING: {
          label: "Preparing",
          className: "bg-orange-500 text-white",
        },
        READY: { label: "Ready", className: "bg-green-500 text-white" },
        COMPLETED: { label: "Completed", className: "bg-gray-500 text-white" },
        CANCELLED: { label: "Cancelled", className: "bg-red-500 text-white" },
      };

      const config =
        statusConfig[status as keyof typeof statusConfig] ||
        statusConfig.PENDING;

      return <Badge className={cn(config.className)}>{config.label}</Badge>;
    },
    size: 120,
    filterFn: statusFilterFn,
  },
  {
    header: "Created",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-sm">
          {date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      );
    },
    size: 140,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 60,
    enableHiding: false,
  },
];

export default function OrdersTable({
  orders,
  businessId,
  onOrderUpdate,
}: OrdersTableProps) {
  const id = useId();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "createdAt",
      desc: true,
    },
  ]);

  const [data, setData] = useState<Order[]>(orders);

  // Update local data when props change
  useEffect(() => {
    setData(orders);
  }, [orders]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  });

  // Get unique status values
  const uniqueStatusValues = useMemo(() => {
    return [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "COMPLETED",
      "CANCELLED",
    ];
  }, []);

  // Get unique delivery type values
  const uniqueDeliveryTypes = useMemo(() => {
    return ["pickup", "dine-in"];
  }, []);

  // Get counts for each status
  const statusCounts = useMemo(() => {
    const counts = new Map();
    uniqueStatusValues.forEach((status) => {
      const count = data.filter((order) => order.status === status).length;
      counts.set(status, count);
    });
    return counts;
  }, [data, uniqueStatusValues]);

  // Get counts for each delivery type
  const deliveryTypeCounts = useMemo(() => {
    const counts = new Map();
    uniqueDeliveryTypes.forEach((type) => {
      const count = data.filter((order) => order.deliveryType === type).length;
      counts.set(type, count);
    });
    return counts;
  }, [data, uniqueDeliveryTypes]);

  const selectedStatuses = useMemo(() => {
    const filterValue = table.getColumn("status")?.getFilterValue() as string[];
    return filterValue ?? [];
  }, [table.getColumn("status")?.getFilterValue()]);

  const selectedDeliveryTypes = useMemo(() => {
    const filterValue = table
      .getColumn("deliveryType")
      ?.getFilterValue() as string[];
    return filterValue ?? [];
  }, [table.getColumn("deliveryType")?.getFilterValue()]);

  const handleStatusChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("status")?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table
      .getColumn("status")
      ?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  const handleDeliveryTypeChange = (checked: boolean, value: string) => {
    const filterValue = table
      .getColumn("deliveryType")
      ?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table
      .getColumn("deliveryType")
      ?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Filter by order number, notes, or user ID */}
          <div className="relative">
            <Input
              id={`${id}-input`}
              ref={inputRef}
              className={cn(
                "peer min-w-60 ps-9",
                Boolean(table.getColumn("orderNumber")?.getFilterValue()) &&
                  "pe-9"
              )}
              value={
                (table.getColumn("orderNumber")?.getFilterValue() ??
                  "") as string
              }
              onChange={(e) =>
                table.getColumn("orderNumber")?.setFilterValue(e.target.value)
              }
              placeholder="Filter by order number, notes, or user..."
              type="text"
              aria-label="Filter by order number, notes, or user"
            />
            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
              <ListFilterIcon size={16} aria-hidden="true" />
            </div>
            {Boolean(table.getColumn("orderNumber")?.getFilterValue()) && (
              <button
                className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Clear filter"
                onClick={() => {
                  table.getColumn("orderNumber")?.setFilterValue("");
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
              >
                <CircleXIcon size={16} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Filter by status */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <FilterIcon
                  className="-ms-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Status
                {selectedStatuses.length > 0 && (
                  <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                    {selectedStatuses.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto min-w-36 p-3" align="start">
              <div className="space-y-3">
                <div className="text-muted-foreground text-xs font-medium">
                  Status Filters
                </div>
                <div className="space-y-3">
                  {uniqueStatusValues.map((value, i) => (
                    <div key={value} className="flex items-center gap-2">
                      <Checkbox
                        id={`${id}-status-${i}`}
                        checked={selectedStatuses.includes(value)}
                        onCheckedChange={(checked: boolean) =>
                          handleStatusChange(checked, value)
                        }
                      />
                      <Label
                        htmlFor={`${id}-status-${i}`}
                        className="flex grow justify-between gap-2 font-normal"
                      >
                        {value}{" "}
                        <span className="text-muted-foreground ms-2 text-xs">
                          {statusCounts.get(value)}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Filter by delivery type */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <FilterIcon
                  className="-ms-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Delivery
                {selectedDeliveryTypes.length > 0 && (
                  <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                    {selectedDeliveryTypes.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto min-w-36 p-3" align="start">
              <div className="space-y-3">
                <div className="text-muted-foreground text-xs font-medium">
                  Delivery Filters
                </div>
                <div className="space-y-3">
                  {uniqueDeliveryTypes.map((value, i) => (
                    <div key={value} className="flex items-center gap-2">
                      <Checkbox
                        id={`${id}-delivery-${i}`}
                        checked={selectedDeliveryTypes.includes(value)}
                        onCheckedChange={(checked: boolean) =>
                          handleDeliveryTypeChange(checked, value)
                        }
                      />
                      <Label
                        htmlFor={`${id}-delivery-${i}`}
                        className="flex grow justify-between gap-2 font-normal"
                      >
                        {value === "pickup" ? "Pickup" : "Dine-in"}{" "}
                        <span className="text-muted-foreground ms-2 text-xs">
                          {deliveryTypeCounts.get(value)}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Toggle columns visibility */}
          <DropdownMenu>
            {/* <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Columns3Icon
                  className="-ms-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                View
              </Button>
            </DropdownMenuTrigger> */}
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
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
                      onSelect={(event) => event.preventDefault()}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="bg-background overflow-hidden rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className="h-11"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              "flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            if (
                              header.column.getCanSort() &&
                              (e.key === "Enter" || e.key === " ")
                            ) {
                              e.preventDefault();
                              header.column.getToggleSortingHandler()?.(e);
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: (
                              <ChevronUpIcon
                                className="shrink-0 opacity-60"
                                size={16}
                                aria-hidden="true"
                              />
                            ),
                            desc: (
                              <ChevronDownIcon
                                className="shrink-0 opacity-60"
                                size={16}
                                aria-hidden="true"
                              />
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="last:py-0">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
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
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-8">
        {/* Results per page */}
        <div className="flex items-center gap-3">
          <Label htmlFor={id} className="max-sm:sr-only">
            Rows per page
          </Label>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger id={id} className="w-fit whitespace-nowrap">
              <SelectValue placeholder="Select number of results" />
            </SelectTrigger>
            <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
              {[5, 10, 25, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Page number information */}
        <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
          <p
            className="text-muted-foreground text-sm whitespace-nowrap"
            aria-live="polite"
          >
            <span className="text-foreground">
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
              -
              {Math.min(
                Math.max(
                  table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    table.getState().pagination.pageSize,
                  0
                ),
                table.getRowCount()
              )}
            </span>{" "}
            of{" "}
            <span className="text-foreground">
              {table.getRowCount().toString()}
            </span>
          </p>
        </div>

        {/* Pagination buttons */}
        <div>
          <Pagination>
            <PaginationContent>
              {/* First page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.firstPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to first page"
                >
                  <ChevronFirstIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Previous page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                >
                  <ChevronLeftIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Next page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                >
                  <ChevronRightIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Last page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.lastPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to last page"
                >
                  <ChevronLastIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

function RowActions({ row }: { row: Row<Order> }) {
  const order = row.original;

  const handleStatusChange = async (newStatus: string) => {
    try {
      // TODO: Implement order status update API call
      toast.success("Order status updated!", {
        description: `Order ${
          order.orderNumber
        } is now ${newStatus.toLowerCase()}.`,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status", {
        description: "Please try again.",
      });
    }
  };

  const handleViewDetails = () => {
    // TODO: Implement order details view
    toast.info("Order details", {
      description: `Viewing details for order ${order.orderNumber}`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button
            size="icon"
            variant="ghost"
            className="shadow-none"
            aria-label="Order actions"
          >
            <EllipsisIcon size={16} aria-hidden="true" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleViewDetails}>
          <EyeIcon size={16} className="mr-2" />
          <span>View Details</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {[
                "PENDING",
                "CONFIRMED",
                "PREPARING",
                "READY",
                "COMPLETED",
                "CANCELLED",
              ].map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={order.status === status}
                >
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
