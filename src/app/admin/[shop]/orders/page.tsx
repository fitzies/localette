import OrdersTable from "@/components/tables/orders-table";
import { Card, CardContent } from "@/components/ui/card";
import { getOrders } from "@/lib/actions";

export default async function Page({
  params,
}: {
  params: Promise<{ shop: string }>;
}) {
  const { shop } = await params;

  const orders = await getOrders(shop);

  return (
    <main className="grid grid-cols-3 gap-4 px-4">
      <Card className="col-span-3 border-transparent">
        <OrdersTable orders={orders} businessId={shop} />
      </Card>
    </main>
  );
}
