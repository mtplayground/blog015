import Link from "next/link";
import { createTagAction, deleteTagAction, listTags, updateTagAction } from "./actions";

export default async function TagsPage() {
  const tags = await listTags();

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Tags</h1>
        <Link href="/admin" className="text-sm font-medium text-zinc-700 hover:underline">
          Back to Posts
        </Link>
      </div>

      <form action={createTagAction} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Create Tag</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            name="name"
            placeholder="Name"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500 transition focus:ring-2"
          />
          <input
            name="slug"
            placeholder="Slug (optional)"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500 transition focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            Add
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Posts</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-zinc-800">
            {tags.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                  No tags found.
                </td>
              </tr>
            ) : (
              tags.map((tag) => (
                <tr key={tag.id}>
                  <td className="px-4 py-3">
                    <input
                      form={`update-tag-${tag.id}`}
                      name="name"
                      defaultValue={tag.name}
                      required
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500 transition focus:ring-2"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      form={`update-tag-${tag.id}`}
                      name="slug"
                      defaultValue={tag.slug}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500 transition focus:ring-2"
                    />
                  </td>
                  <td className="px-4 py-3">{tag.postCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <form id={`update-tag-${tag.id}`} action={updateTagAction.bind(null, tag.id)}>
                        <button type="submit" className="text-blue-700 hover:underline">
                          Save
                        </button>
                      </form>
                      <form action={deleteTagAction.bind(null, tag.id)}>
                        <button type="submit" className="text-red-700 hover:underline">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
