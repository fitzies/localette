import OrdersTable from "@/components/tables/orders-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Coins, Box, Eye, Users } from "lucide-react";

export default function DashboardLoading() {
  return (
    <main className="grid grid-cols-4 gap-4 ">
      <Card>
        <CardHeader>
          <CardDescription>Sales</CardDescription>
          <CardTitle className="text-transparent bg-zinc-200 w-1/2 rounded-3xl animate-pulse">
            $40,362
          </CardTitle>
          <CardAction>
            <Coins className="text-zinc-400 size-5" />
          </CardAction>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Orders</CardDescription>
          <CardTitle className="text-transparent bg-zinc-200 w-1/2 rounded-3xl animate-pulse">
            100
          </CardTitle>
          <CardAction>
            <Box className="text-zinc-400 size-5" />
          </CardAction>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Views</CardDescription>
          <CardTitle className="text-transparent bg-zinc-200 w-1/2 rounded-3xl animate-pulse">
            100
          </CardTitle>
          <CardAction>
            <Eye className="text-zinc-400 size-5" />
          </CardAction>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Customers</CardDescription>
          <CardTitle className="text-transparent bg-zinc-200 w-1/2 rounded-3xl animate-pulse">
            100
          </CardTitle>
          <CardAction>
            <Users className="text-zinc-400 size-5" />
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="col-span-4 py-4 ">
        <CardContent></CardContent>
      </Card>
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Ongoing Orders</CardTitle>
          <CardDescription>Current orders being processed</CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <p className="text-transparent bg-zinc-200 rounded-3xl animate-pulse">
            No orders at the moment
          </p>
        </CardContent>
      </Card>
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Order Volume Over Time</CardTitle>
          <CardDescription>
            A visual representation of the number of orders placed within a
            selected period.
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full ">
          <p className="text-transparent bg-zinc-200 rounded-3xl animate-pulse">
            No orders at the moment
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
