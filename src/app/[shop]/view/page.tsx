import { AvailabilityDisplay } from "@/components/availability-display";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { getBusiness } from "@/lib/actions";

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

  const color = `bg-${business.brandColor}-400`;
  const bg = `bg-gradient-to-b from-${business.brandColor}-50 to-${business.brandColor}-50 min-h-screen`;

  return (
    <main className={`w-full flex flex-col min-h-screen ${bg}`}>
      <div className={`w-full h-44 ${color}`}>
        {business.banner ? <img src={business.banner} /> : null}
      </div>
      <div className="w-1/4 mx-auto flex flex-col items-center justify-start my-10 gap-4">
        <Avatar
          className="h-36 w-36 "
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
        <h1 className="text-3xl font-semibold">{business.name}</h1>
        <p className="text-base font-medium text-center">
          {business.description}
        </p>
        {business.timeSlots ? (
          <AvailabilityDisplay availability={JSON.parse(business.timeSlots)} />
        ) : null}
        <Card className="w-full"></Card>
      </div>
    </main>
  );
}
