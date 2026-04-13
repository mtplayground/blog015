export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 text-sm text-zinc-600">
        <p>© {year} Blog015. All rights reserved.</p>
      </div>
    </footer>
  );
}
