import ProductTable from "@/components/tables/product-table";
import { Card, CardContent } from "@/components/ui/card";
import { getProducts, getCategories } from "@/lib/actions";

export default async function Page({
  params,
}: {
  params: Promise<{ shop: string }>;
}) {
  const { shop } = await params;

  const [products, categories] = await Promise.all([
    getProducts(shop),
    getCategories(),
  ]);

  return (
    <main className="grid grid-cols-3 gap-4 px-4">
      <Card className="col-span-3 border-transparent">
        <ProductTable
          products={products}
          businessId={shop}
          categories={categories}
        />
      </Card>
    </main>
  );
}
