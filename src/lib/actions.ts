"use server";

import { prisma } from "./prisma";

export const getBusiness = async (bussinessId: string) => {
  return await prisma.business.findUnique({ where: { id: bussinessId } });
};
