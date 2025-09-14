import { getBusiness } from "@/lib/actions";

export default async function Page({
  params,
}: {
  params: Promise<{ shop: string }>;
}) {
  const { shop } = await params;

  const business = await getBusiness(shop);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {JSON.stringify(business)}
    </div>
  );
}
