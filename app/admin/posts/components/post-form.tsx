"use client";

import { useActionState } from "react";
import type { PostFormOption, PostFormState } from "../actions";

type PostFormProps = {
  action: (state: PostFormState, formData: FormData) => Promise<PostFormState>;
  initialState: PostFormState;
  categories: PostFormOption[];
  tags: PostFormOption[];
  submitLabel?: string;
  pendingLabel?: string;
};

export function PostForm({
  action,
  initialState,
  categories,
  tags,
  submitLabel = "Create Post",
  pendingLabel = "Saving...",
}: PostFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      {state.message ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}

      <div className="space-y-1">
        <label htmlFor="title" className="text-sm font-medium text-zinc-800">
          Title
        </label>
        <input
          id="title"
          name="title"
          defaultValue={state.values.title}
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500 transition focus:ring-2"
        />
        {state.fieldErrors.title ? <p className="text-sm text-red-700">{state.fieldErrors.title}</p> : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="excerpt" className="text-sm font-medium text-zinc-800">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          defaultValue={state.values.excerpt}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500 transition focus:ring-2"
        />
        {state.fieldErrors.excerpt ? (
          <p className="text-sm text-red-700">{state.fieldErrors.excerpt}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="body" className="text-sm font-medium text-zinc-800">
          Body
        </label>
        <textarea
          id="body"
          name="body"
          rows={12}
          defaultValue={state.values.body}
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500 transition focus:ring-2"
        />
        {state.fieldErrors.body ? <p className="text-sm text-red-700">{state.fieldErrors.body}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="categoryId" className="text-sm font-medium text-zinc-800">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={state.values.categoryId}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500 transition focus:ring-2"
          >
            <option value="">Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {state.fieldErrors.categoryId ? (
            <p className="text-sm text-red-700">{state.fieldErrors.categoryId}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="tagIds" className="text-sm font-medium text-zinc-800">
            Tags
          </label>
          <select
            id="tagIds"
            name="tagIds"
            multiple
            defaultValue={state.values.tagIds}
            className="h-36 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500 transition focus:ring-2"
          >
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-500">Hold Ctrl/Cmd to select multiple tags.</p>
          {state.fieldErrors.tagIds ? <p className="text-sm text-red-700">{state.fieldErrors.tagIds}</p> : null}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-zinc-800">
        <input
          type="checkbox"
          name="published"
          defaultChecked={state.values.published}
          className="h-4 w-4 rounded border-zinc-300 text-zinc-900"
        />
        Publish immediately
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
