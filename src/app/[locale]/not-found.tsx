import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-lg text-zinc-500">Page not found</p>
      <Link
        href="/"
        className="rounded-full bg-foreground px-5 py-2.5 text-background transition-colors hover:bg-foreground/90"
      >
        Go home
      </Link>
    </div>
  );
}
