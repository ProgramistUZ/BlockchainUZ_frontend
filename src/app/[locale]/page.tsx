import { useTranslations } from "next-intl";
import { ArrowRight, Blocks, Receipt, LayoutDashboard } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBox } from "@/components/search-box";

export default function Home() {
  const t = useTranslations("home");
  const tn = useTranslations("nav");

  const tiles = [
    { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
    { href: "/blocks", key: "blocks", icon: Blocks },
    { href: "/transactions", key: "transactions", icon: Receipt },
  ] as const;

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-20 sm:px-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--muted),transparent_70%)]"
        />
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-center">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {t("heading")}
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            {t("description")}
          </p>
          <SearchBox className="max-w-xl" primary />
          <div className="flex items-center gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="/dashboard" />}>
              {tn("dashboard")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/blocks" />}>
              {tn("blocks")}
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Card key={tile.href} className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-3 p-6">
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                  <p className="text-lg font-medium">{tn(tile.key)}</p>
                  <Link
                    href={tile.href}
                    className="mt-auto inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
