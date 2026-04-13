import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

function getSiteUrl(): string {
  const rawBaseUrl = process.env.BASE_URL ?? "http://localhost:8080";
  return rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const [posts, categories, tags] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    }),
    prisma.category.findMany({
      where: {
        posts: {
          some: {
            published: true,
          },
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    }),
    prisma.tag.findMany({
      where: {
        posts: {
          some: {
            post: {
              published: true,
            },
          },
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    }),
  ]);

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...posts.map((post) => ({
      url: `${siteUrl}/posts/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categories.map((category) => ({
      url: `${siteUrl}/categories/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...tags.map((tag) => ({
      url: `${siteUrl}/tags/${tag.slug}`,
      lastModified: tag.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  return entries;
}
