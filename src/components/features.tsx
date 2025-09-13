import {
  Cpu,
  Fingerprint,
  Pencil,
  Settings2,
  Sparkles,
  Zap,
} from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            Built for local business success
          </h2>
          <p>
            Streamline your operations with our comprehensive business
            management tools.
          </p>
        </div>

        <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="size-4" />
              <h3 className="text-sm font-medium">Management Interface</h3>
            </div>
            <p className="text-sm">
              A centralized dashboard for efficiently tracking and managing
              orders in real-time.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings2 className="size-4" />
              <h3 className="text-sm font-medium">Inventory Monitoring</h3>
            </div>
            <p className="text-sm">
              Provides real-time visibility into stock levels with alerts for
              low inventory and automated reordering.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4" />
              <h3 className="text-sm font-medium">Local Payment Methods</h3>
            </div>
            <p className="text-sm">
              Offers a variety of payment options tailored to local preferences
              for a secure and convenient checkout experience.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="size-4" />
              <h3 className="text-sm font-medium">Analytics Dashboard</h3>
            </div>
            <p className="text-sm">
              Provides insights into customer behavior and purchasing trends for
              informed marketing decisions.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Fingerprint className="size-4" />
              <h3 className="text-sm font-medium">Order Notifications</h3>
            </div>
            <p className="text-sm">
              Sends real-time updates to customers about their order status,
              enhancing communication.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Pencil className="size-4" />
              <h3 className="text-sm font-medium">Catalog Showcase</h3>
            </div>
            <p className="text-sm">
              Showcase your products in a curated catalog, promoting them to a
              wider audience for increased visibility.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
