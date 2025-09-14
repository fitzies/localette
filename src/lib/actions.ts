"use server";

import { prisma } from "./prisma";

export const getBusiness = async (bussinessId: string) => {
  return await prisma.business.findUnique({ where: { id: bussinessId } });
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

export const getCategories = async () => {
  return await prisma.category.findMany({
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
    isAvailable?: boolean;
    isVisible?: boolean;
  }
) => {
  const product = await prisma.product.update({
    where: { id: productId },
    data: updateData,
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
