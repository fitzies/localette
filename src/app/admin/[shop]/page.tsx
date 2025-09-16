import DashboardLoading from "@/components/loading/dashboard-loading";
import OrdersTable from "@/components/tables/orders-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { getBusiness, getOrders } from "@/lib/actions";
import { Coins, Box, Eye, Users } from "lucide-react";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ shop: string }>;
}) {
  const { shop } = await params;

  const business = await getBusiness(shop);
  const orders = await getOrders(shop);

  if (!business) {
    return <DashboardLoading />;
  }

  return (
    <main className="grid grid-cols-4 gap-4 ">
      <Card>
        <CardHeader>
          <CardDescription>Sales</CardDescription>
          <CardTitle>$0.00</CardTitle>
          <CardAction>
            <Coins className="text-zinc-400 size-5" />
          </CardAction>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Orders</CardDescription>
          <CardTitle>{business.orders.length}</CardTitle>
          <CardAction>
            <Box className="text-zinc-400 size-5" />
          </CardAction>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Views</CardDescription>
          <CardTitle>0</CardTitle>
          <CardAction>
            <Eye className="text-zinc-400 size-5" />
          </CardAction>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Customers</CardDescription>
          <CardTitle>0</CardTitle>
          <CardAction>
            <Users className="text-zinc-400 size-5" />
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="col-span-4 py-4">
        <CardContent>
          <OrdersTable businessId={shop} orders={orders} />
        </CardContent>
      </Card>
      {business.products.length <= 0 ? (
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>You have no products</CardTitle>
            <CardDescription>
              Create a product and category now for customers to purchase
            </CardDescription>
            <CardAction>
              <Button size="sm" variant={"outline"} asChild>
                <Link href={`/admin/${business.id}/products`}>
                  Create a product
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      ) : null}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Ongoing Orders</CardTitle>
          <CardDescription>Current orders being processed</CardDescription>
        </CardHeader>
        <CardContent className="w-full text-center text-zinc-400">
          No orders at the moment
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
        <CardContent className="w-full text-center text-zinc-400">
          No orders at the moment
        </CardContent>
      </Card>
    </main>
  );
}
