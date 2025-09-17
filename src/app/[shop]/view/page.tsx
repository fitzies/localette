import { AvailabilityDisplay } from "@/components/availability-display";
import { ProductCard } from "@/components/product-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getBusiness } from "@/lib/actions";
import {
  getBrandColorClass,
  getBrandBackgroundClass,
  formatPrice,
} from "@/lib/utils";
import { Product } from "@prisma/client";
import { InstagramIcon, FacebookIcon } from "lucide-react";

export default async function Page({
  params,
}: {
  params: Promise<{ shop: string }>;
}) {
  const { shop } = await params;
  const business = await getBusiness(shop);

  if (!business) {
    return <>Loading</>;
  }

  const color = getBrandColorClass(business.brandColor);
  const bg = "bg-white"; //getBrandBackgroundClass(business.brandColor);

  return (
    <main className={`w-full flex flex-col min-h-screen ${bg} pb-12`}>
      <div className={`w-full h-44 ${color} relative`}>
        {business.banner ? (
          <img
            src={business.banner}
            className="w-full h-full object-cover"
            alt="Business banner"
          />
        ) : null}
        <div className="absolute bottom-[-4.5rem] w-full flex justify-center">
          <Avatar
            className="h-36 w-36"
            style={{
              color: "transparent",
              borderRadius: "120px",
              border: "4px solid white",
              cursor: "pointer",
              backgroundColor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {business.logo ? (
              <AvatarImage src={business.logo} alt="Kelly King" />
            ) : null}
            <AvatarFallback>{business.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="md:w-1/5 w-11/12 mx-auto flex flex-col items-center justify-start mt-20 gap-6">
        <h1 className="text-3xl font-semibold">{business.name}</h1>
        <p className="text-base font-medium text-center">
          {business.description}
        </p>
        {business.timeSlots ? (
          <AvailabilityDisplay availability={JSON.parse(business.timeSlots)} />
        ) : null}

        {/* Categories and Products */}
        {((business as any).categories &&
          (business as any).categories.length > 0) ||
        ((business as any).products &&
          (business as any).products.some((p: any) => !p.categoryId)) ? (
          <div className="w-full space-y-6 mt-4">
            {/* Social Media Cards */}
            <div className="w-full space-y-4">
              {business.instagram && (
                <Card>
                  <CardContent className="w-full flex items-center">
                    <a
                      href={`https://instagram.com/${business.instagram.replace(
                        "@",
                        ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <InstagramIcon className="w-6 h-6 text-[#E4405F]" />
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          Instagram
                        </span>
                        <span className="text-sm text-muted-foreground">
                          @{business.instagram.replace("@", "")}
                        </span>
                      </div>
                    </a>
                  </CardContent>
                </Card>
              )}

              {business.facebook && (
                <Card>
                  <CardContent className="w-full flex items-center">
                    <a
                      href={
                        business.facebook.startsWith("http")
                          ? business.facebook
                          : `https://facebook.com/${business.facebook}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <FacebookIcon className="w-6 h-6 text-[#1877F2]" />
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          Facebook
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {business.facebook}
                        </span>
                      </div>
                    </a>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Categorized Products */}
            {(business as any).categories &&
              (business as any).categories.length > 0 &&
              (business as any).categories.map((category: any) => (
                <Card key={category.id} className="w-full">
                  <CardHeader>
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                    {category.description && (
                      <CardDescription>{category.description}</CardDescription>
                    )}
                    <CardAction className="text-2xl">
                      {category.icon}
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    {/* Products in this category */}
                    {category.products && category.products.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {category.products.map((product: Product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            brandColor={business.brandColor || undefined}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No products in this category yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}

            {/* Uncategorized Products */}
            {(business as any).products &&
              (business as any).products.filter((p: any) => !p.categoryId)
                .length > 0 && (
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="text-xl">Everything else</CardTitle>
                    <CardDescription>Our available items</CardDescription>
                    <CardAction className="text-2xl">⭐</CardAction>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {(business as any).products
                        .filter((product: Product) => !product.categoryId)
                        .map((product: Product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            brandColor={business.brandColor || undefined}
                          />
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        ) : (
          <Card className="w-full">
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No categories available yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
