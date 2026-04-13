import Link from "next/link";
import {
  createPostAction,
  getPostFormOptions,
  INITIAL_POST_FORM_STATE,
} from "../actions";
import { PostForm } from "../components/post-form";

export default async function NewPostPage() {
  const { categories, tags } = await getPostFormOptions();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Create Post</h1>
        <Link href="/admin" className="text-sm font-medium text-zinc-700 hover:underline">
          Back to Posts
        </Link>
      </div>

      <PostForm
        action={createPostAction}
        initialState={INITIAL_POST_FORM_STATE}
        categories={categories}
        tags={tags}
      />
    </section>
  );
}
