"use client";

import * as React from "react";
import { getBusiness } from "@/lib/functions";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  HelpCircle,
  Store,
  LifeBuoy,
  Send,
  PaintRoller,
  ChevronDownIcon,
  Eye,
  Edit,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
// import { NavUser } from "@/components/nav-user";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavOthers } from "./nav-others";
import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [businessName, setBusinessName] = React.useState("Localette");
  const [businessId, setBusinessId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // React.useEffect(() => {
  //   const fetchBusiness = async () => {
  //     try {
  //       const response = await getBusiness();
  //       if (response.success && response.business) {
  //         setBusinessName(response.business.businessName);
  //         setBusinessId(response.business.id);
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch business:", error);
  //       // Keep default name if fetch fails
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchBusiness();
  // }, []); // Empty dependency array ensures this only runs once

  // Create navigation data with business ID
  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: businessId ? `/admin/${businessId}` : "/admin",
        icon: LayoutDashboard,
        isActive: true,
      },
      {
        title: "Orders",
        url: businessId ? `/admin/${businessId}/orders` : "/admin/orders",
        icon: ShoppingCart,
      },
      {
        title: "Products",
        url: businessId ? `/admin/${businessId}/products` : "/admin/products",
        icon: Package,
        items: [
          {
            title: "Products",
            url: businessId
              ? `/admin/${businessId}/products`
              : "/admin/products",
          },
          {
            title: "Categories",
            url: businessId
              ? `/admin/${businessId}/categories`
              : "/admin/categories",
          },
        ],
      },
      {
        title: "Customers",
        url: businessId ? `/admin/${businessId}/customers` : "/admin/customers",
        icon: Users,
      },
    ],
    others: [
      {
        title: "Branding",
        url: businessId ? `/admin/${businessId}/branding` : "/admin/branding",
        icon: PaintRoller,
      },
      {
        title: "Settings",
        url: businessId ? `/admin/${businessId}/settings` : "/admin/settings",
        icon: Settings,
      },
    ],
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size={"lg"}>
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Store className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span
                      className={`truncate font-medium ${
                        isLoading
                          ? "animate-pulse text-transparent bg-zinc-100 w-1/2 rounded-full"
                          : ""
                      }`}
                    >
                      {businessName}
                    </span>
                    <span className="truncate text-xs">Admin Panel</span>
                  </div>
                  {/* <ChevronDownIcon className="size-4 opacity-60" /> */}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 p-1">
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="px-2 py-1.5 text-sm">
                    <a
                      href={businessId ? `/${businessId}/view` : "/view"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye
                        size={14}
                        className="opacity-60"
                        aria-hidden="true"
                      />
                      View Store
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="px-2 py-1.5 text-sm">
                    <a
                      href={
                        businessId
                          ? `/admin/${businessId}/branding`
                          : "/admin/branding"
                      }
                    >
                      <Edit
                        size={14}
                        className="opacity-60"
                        aria-hidden="true"
                      />
                      Edit
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavOthers items={data.others} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
