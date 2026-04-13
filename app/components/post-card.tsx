import Link from "next/link";

type PostCardProps = {
  title: string;
  slug: string;
  excerpt: string;
  date: Date;
  category: {
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    name: string;
    slug: string;
  }>;
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(value);
}

export function PostCard({ title, slug, excerpt, date, category, tags }: PostCardProps) {
  return (
    <article className="space-y-3 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-900">
        <Link href={`/posts/${slug}`} className="hover:underline">
          {title}
        </Link>
      </h2>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600">
        <span>{formatDate(date)}</span>
        <span>•</span>
        {category ? (
          <Link href={`/category/${category.slug}`} className="hover:underline">
            {category.name}
          </Link>
        ) : (
          <span>Uncategorized</span>
        )}
      </div>

      <p className="text-zinc-700">{excerpt}</p>

      {tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2 text-xs text-zinc-700">
          {tags.map((tag) => (
            <li key={tag.slug}>
              <Link
                href={`/tag/${tag.slug}`}
                className="rounded-full bg-zinc-100 px-2 py-1 transition hover:bg-zinc-200"
              >
                #{tag.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
