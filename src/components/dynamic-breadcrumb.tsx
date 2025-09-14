"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function DynamicBreadcrumb() {
  const pathname = usePathname();

  // Extract page name from pathname
  const getPageName = (path: string) => {
    const segments = path.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    // Handle dynamic routes like [shop]
    if (segments.includes("admin") && segments.length === 2) {
      return "Dashboard";
    }

    // Capitalize and format page names
    return lastSegment
      ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
      : "Dashboard";
  };

  const currentPage = getPageName(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/admin">Admin Panel</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{currentPage}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
