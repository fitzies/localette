import DeleteMyBusiness from "@/components/delete-my-business";
import AccountPortal from "@/components/account-portal";
import {
  Card,
  CardContent,
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
    <>
      <main className="flex flex-col md:w-2/3 w-full gap-6 mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account settings, profile information, and security
              preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccountPortal />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Team</CardTitle>
            <CardDescription>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full text-base text-center">
            Coming Soon
          </CardContent>
        </Card>
        <DeleteMyBusiness business={business} />
      </main>
    </>
  );
}
