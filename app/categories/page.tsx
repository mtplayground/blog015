import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Categories",
  description: "Browse post categories.",
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      posts: {
        where: {
          published: true,
        },
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-zinc-900">Categories</h1>
        <p className="text-zinc-600">Explore posts grouped by category.</p>
      </header>

      {categories.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-zinc-600">
          No categories yet.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/categories/${category.slug}`}
                className="block rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:bg-zinc-50"
              >
                <p className="text-base font-medium text-zinc-900">{category.name}</p>
                <p className="mt-1 text-sm text-zinc-600">
                  {category.posts.length} published {category.posts.length === 1 ? "post" : "posts"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
