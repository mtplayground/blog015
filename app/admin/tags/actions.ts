import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type TagRow = {
  id: number;
  name: string;
  slug: string;
  postCount: number;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function createUniqueTagSlug(baseValue: string, excludeId?: number): Promise<string> {
  const baseSlug = slugify(baseValue) || "tag";

  const existing = await prisma.tag.findMany({
    where: {
      slug: {
        startsWith: baseSlug,
      },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: {
      slug: true,
    },
  });

  const existingSlugs = new Set(existing.map((tag) => tag.slug));
  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (existingSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

function revalidateTagPaths() {
  revalidatePath("/admin/tags");
  revalidatePath("/admin");
}

export async function listTags(): Promise<TagRow[]> {
  try {
    const tags = await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      postCount: tag._count.posts,
    }));
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    throw new Error("Unable to load tags.");
  }
}

export async function createTagAction(formData: FormData): Promise<void> {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();

  if (!name) {
    return;
  }

  try {
    const slug = await createUniqueTagSlug(rawSlug || name);

    await prisma.tag.create({
      data: {
        name,
        slug,
      },
    });
  } catch (error) {
    console.error("Failed to create tag:", error);
    return;
  }

  revalidateTagPaths();
}

export async function updateTagAction(tagId: number, formData: FormData): Promise<void> {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();

  if (!name) {
    return;
  }

  try {
    const existing = await prisma.tag.findUnique({
      where: { id: tagId },
      select: { id: true },
    });

    if (!existing) {
      return;
    }

    const slug = await createUniqueTagSlug(rawSlug || name, tagId);

    await prisma.tag.update({
      where: { id: tagId },
      data: {
        name,
        slug,
      },
    });
  } catch (error) {
    console.error("Failed to update tag:", error);
    return;
  }

  revalidateTagPaths();
}

export async function deleteTagAction(tagId: number): Promise<void> {
  "use server";

  try {
    await prisma.$transaction([
      prisma.postTag.deleteMany({
        where: { tagId },
      }),
      prisma.tag.delete({
        where: { id: tagId },
      }),
    ]);
  } catch (error) {
    console.error("Failed to delete tag:", error);
    return;
  }

  revalidateTagPaths();
}
