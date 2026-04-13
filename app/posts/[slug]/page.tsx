import Link from "next/link";
import { notFound } from "next/navigation";
import { PostContent } from "@/app/components/post-content";
import { prisma } from "@/lib/prisma";

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(value);
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
    },
    select: {
      slug: true,
    },
  });

  return posts.map((post) => ({ slug: post.slug }));
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { slug } = await params;

  const post = await prisma.post.findFirst({
    where: {
      slug,
      published: true,
    },
    select: {
      title: true,
      content: true,
      excerpt: true,
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
  });

  if (!post) {
    notFound();
  }

  const displayDate = post.publishedAt ?? post.createdAt;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-10">
      <nav>
        <Link href="/" className="text-sm font-medium text-zinc-700 hover:underline">
          ← Back to home
        </Link>
      </nav>

      <article className="space-y-5 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold text-zinc-900">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600">
            <span>{formatDate(displayDate)}</span>
            <span>•</span>
            {post.category ? (
              <Link href={`/categories/${post.category.slug}`} className="hover:underline">
                {post.category.name}
              </Link>
            ) : (
              <span>Uncategorized</span>
            )}
          </div>

          {post.excerpt ? <p className="text-zinc-700">{post.excerpt}</p> : null}

          {post.tags.length > 0 ? (
            <ul className="flex flex-wrap gap-2 text-xs text-zinc-700">
              {post.tags.map((tagLink) => (
                <li key={tagLink.tag.slug}>
                  <Link
                    href={`/tags/${tagLink.tag.slug}`}
                    className="rounded-full bg-zinc-100 px-2 py-1 transition hover:bg-zinc-200"
                  >
                    #{tagLink.tag.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        <PostContent content={post.content} />
      </article>
    </main>
  );
}
