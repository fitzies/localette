import Features from "@/components/features";
import HomeContentSection from "@/components/home-content-section";
import Nav from "@/components/nav";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket, StarsIcon } from "lucide-react";
import Link from "next/link";

export default async function Page() {
  return (
    <>
      <Nav />

      <main className="overflow-hidden flex flex-col gap-20">
        <section id="home" className="relative my-4">
          <div className="relative py-24 lg:py-28">
            <div className="mx-auto max-w-7xl px-6 md:px-12">
              <div className="text-center sm:mx-auto sm:w-10/12 lg:mr-auto lg:mt-0 lg:w-4/5">
                <Link
                  href="/"
                  className="rounded-(--radius) mx-auto flex w-fit items-center gap-2 border p-1 pr-3"
                >
                  <span className="bg-muted rounded-[calc(var(--radius)-0.25rem)] px-2 py-1 text-xs">
                    <StarsIcon className="text-zinc-600 size-4" />
                  </span>
                  <span className="text-sm">
                    Join early for greater exposure
                  </span>
                  <span className="bg-(--color-border) block h-4 w-px"></span>

                  <ArrowRight className="size-4" />
                </Link>

                <h1 className="mt-8 text-4xl font-semibold md:text-5xl xl:text-5xl xl:[line-height:1.125]">
                  Small Home Hustle. <br /> Get Local Exposure Now!
                </h1>
                <p className="mx-auto mt-8 hidden max-w-2xl text-wrap text-lg sm:block">
                  Localatte connects Singapore's home-based businesses with
                  eager customers, offering a simple platform to showcase goods
                  and boost local exposure. Join early to grow your venture into
                  a community favorite!
                </p>
                <p className="mx-auto mt-6 max-w-2xl text-wrap sm:hidden">
                  Highly customizable components for building modern websites
                  and applications, with your personal spark.
                </p>

                <div className="my-8">
                  {/* <Button size="lg" asChild>
                    <Link href="/creation">
                      <Rocket className="relative size-4" />
                      <span className="text-nowrap">Get Started</span>
                    </Link>
                  </Button> */}
                </div>
              </div>
              {/* <div className="w-2/3 mx-auto pt-16">
              <img
              src="/undraw_phone-camera_9r54.svg"
              alt="Phone camera illustration showing local business promotion"
              className="w-full h-auto"
              />
              </div> */}
              {/* <Card className="mx-auto w-2/3"></Card> */}
            </div>
          </div>
        </section>
        <Features />
        <HomeContentSection />
        {/* <Faq /> */}
      </main>
    </>
  );
}
