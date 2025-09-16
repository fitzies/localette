"use server";

import { cache } from "react";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "./prisma";

export const getBusiness = cache(async (bussinessId: string) => {
  return await prisma.business.findUnique({
    where: { id: bussinessId },
    include: { orders: true, products: true },
  });
});

export const getProducts = cache(async (businessId: string) => {
  const products = await prisma.product.findMany({
    where: { businessId },
    include: {
      category: true,
      options: {
        include: {
          choices: true,
        },
      },
    },
  });

  // Convert Decimal objects to numbers for client components
  return products.map((product) => ({
    ...product,
    price: Number(product.price),
    weight: product.weight ? Number(product.weight) : null,
    options: product.options.map((option) => ({
      ...option,
      choices: option.choices.map((choice) => ({
        ...choice,
        price: choice.price ? Number(choice.price) : null,
      })),
    })),
  }));
});

export const getCategories = cache(async (businessId: string) => {
  return await prisma.category.findMany({
    where: { businessId },
    orderBy: { name: "asc" },
  });
});

export const createProduct = async (productData: {
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isVisible: boolean;
  sku: string | null;
  weight: number | null;
  businessId: string;
  categoryId: string | null;
  options?: Array<{
    title: string;
    type: "TEXT" | "NUMBER" | "DATE" | "CHECKBOX" | "SELECTION";
    position: number;
    choices: Array<{
      label: string;
      value: string;
      price?: number;
    }>;
  }>;
}) => {
  const { options, ...productDataWithoutOptions } = productData;

  const product = await prisma.product.create({
    data: {
      ...productDataWithoutOptions,
      options: options
        ? {
            create: options.map((option) => ({
              title: option.title,
              type: option.type,
              position: option.position,
              choices: {
                create: option.choices.map((choice) => ({
                  label: choice.label,
                  value: choice.value,
                  price: choice.price || null,
                })),
              },
            })),
          }
        : undefined,
    },
    include: {
      category: true,
      options: {
        include: {
          choices: true,
        },
      },
    },
  });

  // Convert Decimal objects to numbers for client components
  const result = {
    ...product,
    price: Number(product.price),
    weight: product.weight ? Number(product.weight) : null,
    options: product.options.map((option) => ({
      ...option,
      choices: option.choices.map((choice) => ({
        ...choice,
        price: choice.price ? Number(choice.price) : null,
      })),
    })),
  };

  // Invalidate cache for products and business data
  revalidateTag(`products-${productData.businessId}`);
  revalidatePath(`/admin/${productData.businessId}/products`);

  return result;
};

export const updateProduct = async (
  productId: string,
  updateData: {
    name?: string;
    description?: string | null;
    price?: number;
    imageUrl?: string | null;
    isAvailable?: boolean;
    isVisible?: boolean;
    sku?: string | null;
    weight?: number | null;
    categoryId?: string | null;
    options?: Array<{
      id?: string;
      title: string;
      type: "TEXT" | "NUMBER" | "DATE" | "CHECKBOX" | "SELECTION";
      position: number;
      choices: Array<{
        id?: string;
        label: string;
        value: string;
        price?: number;
      }>;
    }>;
  }
) => {
  const { options, ...productDataWithoutOptions } = updateData;

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      ...productDataWithoutOptions,
      options: options
        ? {
            deleteMany: {}, // Remove existing options
            create: options.map((option) => ({
              title: option.title,
              type: option.type,
              position: option.position,
              choices: {
                create: option.choices.map((choice) => ({
                  label: choice.label,
                  value: choice.value,
                  price: choice.price || null,
                })),
              },
            })),
          }
        : undefined,
    },
    include: {
      category: true,
      options: {
        include: {
          choices: true,
        },
      },
    },
  });

  // Convert Decimal objects to numbers for client components
  const result = {
    ...product,
    price: Number(product.price),
    weight: product.weight ? Number(product.weight) : null,
    options: product.options.map((option) => ({
      ...option,
      choices: option.choices.map((choice) => ({
        ...choice,
        price: choice.price ? Number(choice.price) : null,
      })),
    })),
  };

  // Invalidate cache for products and business data
  revalidateTag(`products-${updateData.categoryId || "unknown"}`);
  revalidatePath(`/admin/*/products`);

  return result;
};

export const deleteProduct = async (productId: string) => {
  const result = await prisma.product.delete({
    where: { id: productId },
  });

  // Invalidate cache for products
  revalidateTag(`products-${result.businessId}`);
  revalidatePath(`/admin/${result.businessId}/products`);

  return result;
};

export const createCategory = async (categoryData: {
  name: string;
  icon: string;
  description?: string;
  businessId: string;
}) => {
  const result = await prisma.category.create({
    data: categoryData,
  });

  // Invalidate cache for categories
  revalidateTag(`categories-${categoryData.businessId}`);
  revalidatePath(`/admin/${categoryData.businessId}/categories`);

  return result;
};

export const updateCategory = async (
  categoryId: string,
  categoryData: {
    name: string;
    icon: string;
    description?: string;
  }
) => {
  const result = await prisma.category.update({
    where: { id: categoryId },
    data: categoryData,
  });

  // Invalidate cache for categories
  revalidateTag(`categories-${result.businessId}`);
  revalidatePath(`/admin/${result.businessId}/categories`);

  return result;
};

export const deleteCategory = async (categoryId: string) => {
  const result = await prisma.category.delete({
    where: { id: categoryId },
  });

  // Invalidate cache for categories
  revalidateTag(`categories-${result.businessId}`);
  revalidatePath(`/admin/${result.businessId}/categories`);

  return result;
};

export const getOrders = cache(async (businessId: string) => {
  const orders = await prisma.order.findMany({
    where: { businessId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Convert Decimal objects to numbers for client components
  return orders.map((order) => ({
    ...order,
    total: Number(order.total),
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
    })),
  }));
});

export const getCustomers = cache(async (businessId: string) => {
  try {
    // Import clerkClient here to avoid issues with Next.js SSR
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();

    // Get all orders for this business to extract unique user IDs
    const orders = await prisma.order.findMany({
      where: { businessId },
      select: {
        userId: true,
        total: true,
        createdAt: true,
        status: true,
      },
    });

    // Get unique user IDs
    const uniqueUserIds = [...new Set(orders.map((order) => order.userId))];

    // Fetch user details from Clerk for each unique user ID
    const customerPromises = uniqueUserIds.map(async (userId) => {
      try {
        const user = await client.users.getUser(userId);

        // Calculate customer statistics
        const userOrders = orders.filter((order) => order.userId === userId);
        const totalSpent = userOrders.reduce(
          (sum, order) => sum + Number(order.total),
          0
        );
        const orderCount = userOrders.length;
        const lastOrderDate = userOrders.reduce((latest, order) => {
          return !latest || order.createdAt > latest ? order.createdAt : latest;
        }, null as Date | null);
        const firstOrderDate = userOrders.reduce((earliest, order) => {
          return !earliest || order.createdAt < earliest
            ? order.createdAt
            : earliest;
        }, null as Date | null);

        // Customer status based on order count and recency
        const daysSinceLastOrder = lastOrderDate
          ? Math.floor(
              (new Date().getTime() - new Date(lastOrderDate).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : null;

        let status = "New";
        if (orderCount >= 5) {
          status = "VIP";
        } else if (orderCount >= 2) {
          status = "Regular";
        }
        if (daysSinceLastOrder && daysSinceLastOrder > 30) {
          status = "Inactive";
        }

        return {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          imageUrl: user.imageUrl || null,
          phoneNumber: user.phoneNumbers[0]?.phoneNumber || null,
          createdAt: new Date(user.createdAt),
          lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt) : null,
          // Order statistics
          orderCount,
          totalSpent,
          lastOrderDate,
          firstOrderDate,
          status,
          daysSinceLastOrder,
        };
      } catch (error) {
        console.error(`Failed to fetch user ${userId}:`, error);
        // Return a placeholder for users we can't fetch
        return {
          id: userId,
          email: `${userId.slice(0, 8)}...@unknown.com`,
          firstName: "Unknown",
          lastName: "User",
          imageUrl: null,
          phoneNumber: null,
          createdAt: new Date(),
          lastSignInAt: null,
          orderCount: orders.filter((order) => order.userId === userId).length,
          totalSpent: orders
            .filter((order) => order.userId === userId)
            .reduce((sum, order) => sum + Number(order.total), 0),
          lastOrderDate: orders
            .filter((order) => order.userId === userId)
            .reduce((latest, order) => {
              return !latest || order.createdAt > latest
                ? order.createdAt
                : latest;
            }, null as Date | null),
          firstOrderDate: orders
            .filter((order) => order.userId === userId)
            .reduce((earliest, order) => {
              return !earliest || order.createdAt < earliest
                ? order.createdAt
                : earliest;
            }, null as Date | null),
          status: "Unknown",
          daysSinceLastOrder: null,
        };
      }
    });

    const customers = await Promise.all(customerPromises);

    // Sort by total spent (descending)
    return customers.sort((a, b) => b.totalSpent - a.totalSpent);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
});
