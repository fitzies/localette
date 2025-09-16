import CustomersTable from "@/components/tables/customers-table";
import { Card, CardContent } from "@/components/ui/card";
import { getCustomers } from "@/lib/actions";

export default async function Page({
  params,
}: {
  params: Promise<{ shop: string }>;
}) {
  const { shop } = await params;

  const customers = await getCustomers(shop);

  return (
    <main className="grid grid-cols-3 gap-4 px-4">
      <Card className="col-span-3 border-transparent">
        <CustomersTable customers={customers} businessId={shop} />
      </Card>
    </main>
  );
}
