import Link from "next/link";
import {
  createCategoryAction,
  deleteCategoryAction,
  listCategories,
  updateCategoryAction,
} from "./actions";

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Categories</h1>
        <Link href="/admin" className="text-sm font-medium text-zinc-700 hover:underline">
          Back to Posts
        </Link>
      </div>

      <form action={createCategoryAction} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Create Category</h2>
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
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-4 py-3">
                    <input
                      form={`update-category-${category.id}`}
                      name="name"
                      defaultValue={category.name}
                      required
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500 transition focus:ring-2"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      form={`update-category-${category.id}`}
                      name="slug"
                      defaultValue={category.slug}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500 transition focus:ring-2"
                    />
                  </td>
                  <td className="px-4 py-3">{category.postCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <form id={`update-category-${category.id}`} action={updateCategoryAction.bind(null, category.id)}>
                        <button type="submit" className="text-blue-700 hover:underline">
                          Save
                        </button>
                      </form>
                      <form action={deleteCategoryAction.bind(null, category.id)}>
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
