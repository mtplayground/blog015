import "server-only";

import { prisma } from "@/lib/prisma";

export type AdminPostRow = {
  id: number;
  title: string;
  status: "Published" | "Draft";
  categoryName: string;
  date: Date;
};

export async function listAdminPosts(): Promise<AdminPostRow[]> {
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        published: true,
        publishedAt: true,
        createdAt: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return posts
      .map((post) => ({
        id: post.id,
        title: post.title,
        status: post.published ? ("Published" as const) : ("Draft" as const),
        categoryName: post.category?.name ?? "Uncategorized",
        date: post.publishedAt ?? post.createdAt,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error("Failed to fetch posts for admin dashboard:", error);
    throw new Error("Unable to load posts for the admin dashboard.");
  }
}
