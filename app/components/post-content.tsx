type PostContentProps = {
  content: string;
};

export function PostContent({ content }: PostContentProps) {
  const paragraphs = content
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);

  return (
    <div className="prose prose-zinc max-w-none">
      {paragraphs.length === 0 ? (
        <p className="text-zinc-700">No content available.</p>
      ) : (
        paragraphs.map((paragraph, index) => (
          <p key={index} className="whitespace-pre-line text-zinc-800">
            {paragraph}
          </p>
        ))
      )}
    </div>
  );
}
