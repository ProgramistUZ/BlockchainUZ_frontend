"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { SearchBox } from "@/components/search-box";
import { classifySearch, routeForSearch } from "@/lib/search";
import { useAsyncResource } from "@/hooks/use-async-resource";
import { getBlockByHash, getTransactionByHash } from "@/services/api";

type Resolution =
  | { kind: "block"; hash: string }
  | { kind: "tx"; hash: string }
  | { kind: "none" };

async function resolveHash(hash: string): Promise<Resolution> {
  const [block, tx] = await Promise.allSettled([
    getBlockByHash(hash),
    getTransactionByHash(hash),
  ]);
  if (block.status === "fulfilled") return { kind: "block", hash };
  if (tx.status === "fulfilled") return { kind: "tx", hash };
  return { kind: "none" };
}

export default function SearchPage() {
  const t = useTranslations("search");
  const tb = useTranslations("breadcrumbs");
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";
  const kind = useMemo(() => classifySearch(q), [q]);
  const directRoute = useMemo(() => routeForSearch(kind), [kind]);

  useEffect(() => {
    if (directRoute) router.replace(directRoute);
  }, [directRoute, router]);

  const shouldResolveHash = kind.kind === "hash";
  const load = useCallback(
    () =>
      shouldResolveHash
        ? resolveHash(kind.value)
        : Promise.resolve<Resolution>({ kind: "none" }),
    [shouldResolveHash, kind],
  );

  const { data, loading } = useAsyncResource(load, [q, shouldResolveHash]);

  useEffect(() => {
    if (!data) return;
    if (data.kind === "block") router.replace(`/blocks/${data.hash}`);
    else if (data.kind === "tx") router.replace(`/tx/${data.hash}`);
  }, [data, router]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>{tb("home")}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{tb("search")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardContent className="flex flex-col gap-4 py-6">
          <SearchBox initialValue={q} />
          {q && (
            <div className="rounded-md border border-dashed p-4 text-sm">
              {directRoute || (shouldResolveHash && loading) ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Spinner className="size-4" />
                  <span>{t("submit")}…</span>
                </div>
              ) : shouldResolveHash && data?.kind === "none" ? (
                <p className="text-muted-foreground">
                  {t("notFound", { query: q })}
                </p>
              ) : kind.kind === "invalid" ? (
                <p className="text-muted-foreground">{t("invalid")}</p>
              ) : (
                <p className="text-muted-foreground">{t("hint")}</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">{t("hint")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
