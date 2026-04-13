import type { Metadata } from "next";
import { Pagination } from "./components/pagination";
import { PostCard } from "./components/post-card";
import { prisma } from "@/lib/prisma";

const POSTS_PER_PAGE = 5;

export const metadata: Metadata = {
  title: "Home",
  description: "Browse published posts on Blog015.",
  openGraph: {
    title: "Blog015",
    description: "Browse published posts on Blog015.",
    url: "/",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Blog015",
      },
    ],
  },
};

type HomePageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

function normalizePage(rawPage?: string): number {
  const parsed = Number.parseInt(rawPage ?? "1", 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const requestedPage = normalizePage(resolvedSearchParams?.page);
  const totalPosts = await prisma.post.count({
    where: {
      published: true,
    },
  });

  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);

  const posts = await prisma.post.findMany({
    where: {
      published: true,
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
    skip: (currentPage - 1) * POSTS_PER_PAGE,
    take: POSTS_PER_PAGE,
  });

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-zinc-900">Latest Posts</h1>
        <p className="text-zinc-600">Published posts, sorted newest first.</p>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-zinc-600">
          No published posts yet.
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

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </main>
  );
}
