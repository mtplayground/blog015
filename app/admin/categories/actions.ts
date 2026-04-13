import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type CategoryRow = {
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

async function createUniqueCategorySlug(baseValue: string, excludeId?: number): Promise<string> {
  const baseSlug = slugify(baseValue) || "category";

  const existing = await prisma.category.findMany({
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

  const existingSlugs = new Set(existing.map((category) => category.slug));
  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (existingSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

function revalidateCategoryPaths() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin");
}

export async function listCategories(): Promise<CategoryRow[]> {
  try {
    const categories = await prisma.category.findMany({
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

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      postCount: category._count.posts,
    }));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw new Error("Unable to load categories.");
  }
}

export async function createCategoryAction(formData: FormData): Promise<void> {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();

  if (!name) {
    return;
  }

  try {
    const slug = await createUniqueCategorySlug(rawSlug || name);

    await prisma.category.create({
      data: {
        name,
        slug,
      },
    });
  } catch (error) {
    console.error("Failed to create category:", error);
    return;
  }

  revalidateCategoryPaths();
}

export async function updateCategoryAction(categoryId: number, formData: FormData): Promise<void> {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();

  if (!name) {
    return;
  }

  try {
    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!existing) {
      return;
    }

    const slug = await createUniqueCategorySlug(rawSlug || name, categoryId);

    await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        slug,
      },
    });
  } catch (error) {
    console.error("Failed to update category:", error);
    return;
  }

  revalidateCategoryPaths();
}

export async function deleteCategoryAction(categoryId: number): Promise<void> {
  "use server";

  try {
    await prisma.category.delete({
      where: { id: categoryId },
    });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return;
  }

  revalidateCategoryPaths();
}
