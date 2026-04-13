import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type AdminPostRow = {
  id: number;
  title: string;
  status: "Published" | "Draft";
  categoryName: string;
  date: Date;
};

export type PostFormOption = {
  id: number;
  name: string;
};

export type PostFormValues = {
  title: string;
  excerpt: string;
  body: string;
  categoryId: string;
  tagIds: string[];
  published: boolean;
};

export type PostFormState = {
  message: string | null;
  fieldErrors: Partial<Record<keyof PostFormValues, string>>;
  values: PostFormValues;
};

export const INITIAL_POST_FORM_STATE: PostFormState = {
  message: null,
  fieldErrors: {},
  values: {
    title: "",
    excerpt: "",
    body: "",
    categoryId: "",
    tagIds: [],
    published: false,
  },
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

async function createUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugify(title) || "post";

  const existing = await prisma.post.findMany({
    where: {
      slug: {
        startsWith: baseSlug,
      },
    },
    select: {
      slug: true,
    },
  });

  const existingSlugs = new Set(existing.map((post) => post.slug));
  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (existingSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

function parseIntegerId(rawValue: string): number | null {
  const parsed = Number.parseInt(rawValue, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

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

export async function getPostFormOptions(): Promise<{
  categories: PostFormOption[];
  tags: PostFormOption[];
}> {
  try {
    const [categories, tags] = await Promise.all([
      prisma.category.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.tag.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return { categories, tags };
  } catch (error) {
    console.error("Failed to fetch post form options:", error);
    throw new Error("Unable to load categories and tags.");
  }
}

export async function createPostAction(
  _previousState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  "use server";

  const values: PostFormValues = {
    title: String(formData.get("title") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    categoryId: String(formData.get("categoryId") ?? ""),
    tagIds: formData.getAll("tagIds").map((value) => String(value)),
    published: formData.get("published") === "on",
  };

  const fieldErrors: PostFormState["fieldErrors"] = {};

  if (!values.title) {
    fieldErrors.title = "Title is required.";
  }

  if (!values.body) {
    fieldErrors.body = "Body is required.";
  }

  if (values.excerpt.length > 300) {
    fieldErrors.excerpt = "Excerpt must be 300 characters or fewer.";
  }

  const categoryId = values.categoryId ? parseIntegerId(values.categoryId) : null;
  if (values.categoryId && !categoryId) {
    fieldErrors.categoryId = "Select a valid category.";
  }

  const parsedTagIds = Array.from(
    new Set(values.tagIds.map((value) => parseIntegerId(value)).filter((id): id is number => id !== null)),
  );

  if (values.tagIds.length !== parsedTagIds.length) {
    fieldErrors.tagIds = "Select valid tags.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors,
      values,
    };
  }

  try {
    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      });

      if (!categoryExists) {
        return {
          message: "Selected category does not exist.",
          fieldErrors: { categoryId: "Select a valid category." },
          values,
        };
      }
    }

    if (parsedTagIds.length > 0) {
      const matchingTagsCount = await prisma.tag.count({
        where: {
          id: {
            in: parsedTagIds,
          },
        },
      });

      if (matchingTagsCount !== parsedTagIds.length) {
        return {
          message: "One or more selected tags are invalid.",
          fieldErrors: { tagIds: "Select valid tags." },
          values,
        };
      }
    }

    const slug = await createUniqueSlug(values.title);

    await prisma.post.create({
      data: {
        title: values.title,
        slug,
        excerpt: values.excerpt || null,
        content: values.body,
        published: values.published,
        publishedAt: values.published ? new Date() : null,
        categoryId,
        tags: parsedTagIds.length
          ? {
              create: parsedTagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
      },
    });
  } catch (error) {
    console.error("Failed to create post:", error);
    return {
      message: "Failed to create post. Please try again.",
      fieldErrors: {},
      values,
    };
  }

  revalidatePath("/admin");
  redirect("/admin");
}
