import { getTranslations } from "next-intl/server";
import { HomeIcon, SearchIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-mono text-6xl font-semibold tracking-tight text-primary">
        404
      </p>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button nativeButton={false} render={<Link href="/" />}>
          <HomeIcon className="size-4" aria-hidden="true" />
          {t("home")}
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/blocks" />}
        >
          <SearchIcon className="size-4" aria-hidden="true" />
          {t("browseBlocks")}
        </Button>
      </div>
    </div>
  );
}
