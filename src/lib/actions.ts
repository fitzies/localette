"use server";

import { prisma } from "./prisma";

export const getBusiness = async (bussinessId: string) => {
  return await prisma.business.findUnique({
    where: { id: bussinessId },
    include: { orders: true, products: true },
  });
};

export const getProducts = async (businessId: string) => {
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
};

export const getCategories = async (businessId: string) => {
  return await prisma.category.findMany({
    where: { businessId },
    orderBy: { name: "asc" },
  });
};

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
  return {
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
  return {
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
};

export const deleteProduct = async (productId: string) => {
  return await prisma.product.delete({
    where: { id: productId },
  });
};

export const createCategory = async (categoryData: {
  name: string;
  icon: string;
  description?: string;
  businessId: string;
}) => {
  return await prisma.category.create({
    data: categoryData,
  });
};

export const updateCategory = async (
  categoryId: string,
  categoryData: {
    name: string;
    icon: string;
    description?: string;
  }
) => {
  return await prisma.category.update({
    where: { id: categoryId },
    data: categoryData,
  });
};

export const deleteCategory = async (categoryId: string) => {
  return await prisma.category.delete({
    where: { id: categoryId },
  });
};

export const getOrders = async (businessId: string) => {
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
};
