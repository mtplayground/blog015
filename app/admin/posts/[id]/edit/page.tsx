import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getEditablePost,
  getPostFormOptions,
  INITIAL_POST_FORM_STATE,
  updatePostAction,
} from "../../actions";
import { PostForm } from "../../components/post-form";

type EditPostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const postId = Number.parseInt(id, 10);

  if (Number.isNaN(postId) || postId <= 0) {
    notFound();
  }

  const [post, { categories, tags }] = await Promise.all([
    getEditablePost(postId),
    getPostFormOptions(),
  ]);

  if (!post) {
    notFound();
  }

  const initialState = {
    ...INITIAL_POST_FORM_STATE,
    values: post.values,
  };

  const editAction = updatePostAction.bind(null, post.id);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Edit Post</h1>
        <Link href="/admin" className="text-sm font-medium text-zinc-700 hover:underline">
          Back to Posts
        </Link>
      </div>

      <PostForm
        action={editAction}
        initialState={initialState}
        categories={categories}
        tags={tags}
        submitLabel="Update Post"
        pendingLabel="Updating..."
      />
    </section>
  );
}
