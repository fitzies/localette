import { getBusiness } from "@/lib/actions";
import { LogoBanner } from "@/components/branding/logo-banner";
import { BrandIdentity } from "@/components/branding/brand-identity";
import { ContactInfo } from "@/components/branding/contact-info";
import { SocialLinks } from "@/components/branding/social-links";
import { TriangleAlert } from "lucide-react";
import Alert from "@/components/alert";

export default async function Page({
  params,
}: {
  params: Promise<{ shop: string }>;
}) {
  const { shop } = await params;
  const business = await getBusiness(shop);

  if (!business) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Business Not Found
          </h2>
          <p className="text-gray-600">
            Unable to load business information. Please try again.
          </p>
        </div>
      </div>
    );
  }

  // Check for missing information
  const missingInfo = [];

  if (!business.logo) missingInfo.push("brand logo");
  if (!business.banner) missingInfo.push("brand banner");
  if (!business.description) missingInfo.push("description");
  if (!business.category) missingInfo.push("category");
  if (!business.brandKeywords) missingInfo.push("brand keywords");
  if (!business.email) missingInfo.push("email");
  if (!business.phone) missingInfo.push("phone");
  if (!business.address1) missingInfo.push("address");
  if (!business.instagram && !business.facebook)
    missingInfo.push("social media links");

  const alertText =
    missingInfo.length > 0
      ? `Some information is missng, you need to setup your ${missingInfo.join(
          ", "
        )}.`
      : "All branding information is complete! 🎉";

  return (
    <>
      {missingInfo.length > 0 && (
        <Alert text={alertText} color="amber" className="w-2/3 mx-auto" />
      )}
      <main className="flex flex-col md:w-2/3 w-full gap-6 mx-auto">
        <LogoBanner
          businessId={business.id}
          logo={business.logo}
          banner={business.banner}
        />

        <BrandIdentity
          businessId={business.id}
          name={business.name}
          description={business.description}
          category={business.category}
          brandColor={business.brandColor}
          brandKeywords={business.brandKeywords}
        />

        <ContactInfo
          businessId={business.id}
          email={business.email}
          phone={business.phone}
          address1={business.address1}
          address2={business.address2}
          unitNumber={business.unitNumber}
          postalCode={business.postalCode}
        />

        <SocialLinks
          businessId={business.id}
          instagram={business.instagram}
          facebook={business.facebook}
        />
      </main>
    </>
  );
}
