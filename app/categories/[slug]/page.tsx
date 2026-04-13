import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/app/components/post-card";
import { prisma } from "@/lib/prisma";

type CategoryPostsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CategoryPostsPage({ params }: CategoryPostsPageProps) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!category) {
    notFound();
  }

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      categoryId: category.id,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      publishedAt: true,
      createdAt: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      tags: {
        select: {
          tag: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          tag: {
            name: "asc",
          },
        },
      },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-10">
      <nav>
        <Link href="/" className="text-sm font-medium text-zinc-700 hover:underline">
          ← Back to home
        </Link>
      </nav>

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-zinc-900">Category: {category.name}</h1>
        <p className="text-zinc-600">Published posts in this category.</p>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-zinc-600">
          No published posts found for this category.
        </p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              title={post.title}
              slug={post.slug}
              excerpt={post.excerpt ?? post.content.slice(0, 180)}
              date={post.publishedAt ?? post.createdAt}
              category={post.category}
              tags={post.tags.map((tagLink) => tagLink.tag)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
