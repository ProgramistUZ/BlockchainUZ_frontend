import { SyncIndicator } from "@/components/sync-indicator";

export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <span>&copy; {new Date().getFullYear()} BlockchainUZ</span>
        <SyncIndicator />
      </div>
    </footer>
  );
}
