"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getUserNotifications() {
  const user = await getCurrentUser();
  if (!user) return [];

  return prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

export async function markNotificationAsRead(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false };

  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { isRead: true },
  });

  revalidatePath("/");
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const user = await getCurrentUser();
  if (!user) return { success: false };

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/");
  return { success: true };
}
