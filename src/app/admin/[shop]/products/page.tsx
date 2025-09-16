import OnboardingDialog from "@/components/onboarding-dialog";
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
    getCategories(shop),
  ]);

  const onboardingSteps = [
    {
      title: "Why Create Products?",
      description:
        "Products are the heart of your business. They're what you sell to your customers, whether it's homemade food, crafts, or other goods.",
    },
    {
      title: "Products Drive Sales",
      description:
        "Having well-defined products makes it easier for customers to see what you offer, place orders, and become repeat buyers.",
    },
    {
      title: "Grow Your Business",
      description:
        "Offering products helps you reach more customers, build your reputation, and stand out in your local community.",
    },
  ];

  return (
    <main className="grid grid-cols-3 gap-4 px-4">
      <Card className="col-span-3 border-transparent">
        <ProductTable
          products={products}
          businessId={shop}
          categories={categories}
        />
      </Card>
      <OnboardingDialog
        show={products.length <= 0}
        image="https://plus.unsplash.com/premium_photo-1661609658924-bf1316ebdcb0?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c2luZ2Fwb3JlJTIwZm9vZHxlbnwwfHwwfHx8MA%3D%3D"
        steps={onboardingSteps}
      />
    </main>
  );
}
