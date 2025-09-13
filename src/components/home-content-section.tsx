import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { InstagramIcon, TelegramIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";

export default function HomeContentSection() {
  return (
    <section id="why" className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
        <img
          className="rounded-(--radius) grayscale"
          src="https://images.unsplash.com/photo-1528041401798-ffb747bd33a5?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="team image"
          height=""
          width=""
          loading="lazy"
        />

        <div className="grid gap-6 md:grid-cols-2 md:gap-12">
          <h2 className="text-4xl font-medium">
            Localette unites homegrown businesses, making it easier for
            customers to discover and support local brands.
          </h2>
          <div className="space-y-6">
            <p>
              Localette is the platform for people to discover local businesses,
              by connecting passionate shoppers with unique products and
              services from their community.
            </p>

            <div className="flex gap-3">
              <Button asChild size="sm" variant={"link"} className="gap-2">
                <Link href="#">
                  <HugeiconsIcon icon={InstagramIcon} className="size-5" />
                </Link>
              </Button>
              <Button asChild size="sm" variant={"link"} className="gap-2">
                <Link href="#">
                  <HugeiconsIcon icon={TelegramIcon} className="size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
