import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedPost = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  tagSlugs: string[];
  published: boolean;
  publishedAt: Date | null;
};

const categories = [
  { name: "Engineering", slug: "engineering" },
  { name: "Product", slug: "product" },
  { name: "Tutorials", slug: "tutorials" },
];

const tags = [
  { name: "Next.js", slug: "nextjs" },
  { name: "Prisma", slug: "prisma" },
  { name: "TypeScript", slug: "typescript" },
  { name: "SQLite", slug: "sqlite" },
  { name: "Deployment", slug: "deployment" },
  { name: "Testing", slug: "testing" },
];

const posts: SeedPost[] = [
  {
    title: "Getting Started with the Blog Platform",
    slug: "getting-started-with-blog-platform",
    excerpt: "A quick tour of the blog architecture and local development flow.",
    content:
      "This sample post introduces the project structure, routing setup, and local workflow for contributors.",
    categorySlug: "engineering",
    tagSlugs: ["nextjs", "typescript"],
    published: true,
    publishedAt: new Date("2026-01-10T09:00:00.000Z"),
  },
  {
    title: "Modeling Content with Prisma and SQLite",
    slug: "modeling-content-with-prisma-and-sqlite",
    excerpt: "How posts, categories, and tags are represented in the database.",
    content:
      "This post explains the schema decisions for categories, tags, and the explicit PostTag join table.",
    categorySlug: "tutorials",
    tagSlugs: ["prisma", "sqlite"],
    published: true,
    publishedAt: new Date("2026-01-18T12:30:00.000Z"),
  },
  {
    title: "Planning a Safe Release Process",
    slug: "planning-a-safe-release-process",
    excerpt: "Operational checklist for shipping changes reliably.",
    content:
      "Draft guidance for release validation, smoke tests, and rollback strategy before production rollout.",
    categorySlug: "product",
    tagSlugs: ["deployment", "testing"],
    published: false,
    publishedAt: null,
  },
];

async function main() {
  await prisma.$transaction([
    prisma.postTag.deleteMany(),
    prisma.post.deleteMany(),
    prisma.category.deleteMany(),
    prisma.tag.deleteMany(),
  ]);

  await prisma.category.createMany({ data: categories });
  await prisma.tag.createMany({ data: tags });

  const categoryRows = await prisma.category.findMany();
  const tagRows = await prisma.tag.findMany();

  const categoryBySlug = new Map(categoryRows.map((category) => [category.slug, category.id]));
  const tagBySlug = new Map(tagRows.map((tag) => [tag.slug, tag.id]));

  for (const post of posts) {
    const categoryId = categoryBySlug.get(post.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category slug: ${post.categorySlug}`);
    }

    const tagIds = post.tagSlugs.map((tagSlug) => {
      const tagId = tagBySlug.get(tagSlug);
      if (!tagId) {
        throw new Error(`Missing tag slug: ${tagSlug}`);
      }
      return tagId;
    });

    await prisma.post.create({
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        published: post.published,
        publishedAt: post.publishedAt,
        categoryId,
        tags: {
          create: tagIds.map((tagId) => ({
            tagId,
          })),
        },
      },
    });
  }

  console.log(
    `Seeded ${categories.length} categories, ${tags.length} tags, and ${posts.length} posts.`,
  );
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
