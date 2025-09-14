import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getBusiness } from "@/lib/actions";

export default async function Page({
  params,
}: {
  params: Promise<{ shop: string }>;
}) {
  const { shop } = await params;

  const business = await getBusiness(shop);

  return (
    <main className="grid grid-cols-3 gap-4 ">
      <Card>
        <CardHeader>
          <CardDescription>Sales</CardDescription>
          <CardTitle>$0.00</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Orders</CardDescription>
          <CardTitle>0</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Views</CardDescription>
          <CardTitle>0</CardTitle>
        </CardHeader>
      </Card>
      <Card className="col-span-3"></Card>
    </main>
  );
}
