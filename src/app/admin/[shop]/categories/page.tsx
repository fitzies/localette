import CreateCategory from "@/components/create-category";
import OnboardingDialog from "@/components/onboarding-dialog";
import { getCategories } from "@/lib/actions";

export default async function Page({
  params,
}: {
  params: Promise<{ shop: string }>;
}) {
  const { shop } = await params;
  const categories = await getCategories(shop);

  const onboardingSteps = [
    {
      title: "What are Categories?",
      description:
        "Categories help you organise your products into groups, such as 'Indian Food', 'Beverages', or 'Desserts'. This makes it easier for customers to browse and find what they’re looking for.",
    },
    {
      title: "Why Create Categories?",
      description:
        "Adding categories gives your store a clean and professional look. Customers can quickly see what types of products you offer and navigate your store more easily.",
    },
    {
      title: "Examples of Categories",
      description:
        "You might have categories like 'Indian Food' for curries and naan, or 'Snacks' for quick bites. This helps customers understand what each product is and where it belongs.",
    },
  ];

  return (
    <main className="flex flex-col gap-2">
      <OnboardingDialog
        image="https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        show={categories.length === 0}
        steps={onboardingSteps}
      />
      <CreateCategory categories={categories} />
    </main>
  );
}
