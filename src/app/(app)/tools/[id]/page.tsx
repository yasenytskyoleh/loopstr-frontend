import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileTextIcon,
} from "@/components/ui/icons";
import { catalogRoutes } from "@/features/catalog/catalog.config";
import { createCatalogGateway } from "@/features/catalog/gateway/create-catalog-gateway";
import { isAvailable } from "@/features/catalog/catalog.utils";
import { ToolGallery } from "@/features/catalog/components/tool-gallery";
import { ToolInfoTiles } from "@/features/catalog/components/tool-info-tiles";

type ToolDetailsParams = { params: Promise<{ id: string }> };

/** Shared within a single request so `generateMetadata` and the page render the
 *  tool with one gateway call, not two. */
const loadTool = cache((id: string) => createCatalogGateway().getTool(id));

export async function generateMetadata({
  params,
}: ToolDetailsParams): Promise<Metadata> {
  const { id } = await params;
  const tool = await loadTool(id);
  return { title: tool ? `${tool.name} · loopstr` : "Tool not found · loopstr" };
}

/** Read-only tool details (HOME-01 AC #4). No reservation/booking controls —
 *  browsing only. Unknown ids render the 404. */
export default async function ToolDetailsPage({ params }: ToolDetailsParams) {
  const { id } = await params;
  const tool = await loadTool(id);
  if (!tool) notFound();

  return (
    <article className="flex flex-col gap-6">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-content-secondary"
      >
        <Link
          href={catalogRoutes.home}
          className="rounded-sm hover:text-content-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Browse tools
        </Link>
        <ChevronRightIcon className="size-4" />
        <span aria-current="page" className="text-content-primary">
          {tool.name}
        </span>
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-content-primary">
          {tool.name}
        </h1>
        {!isAvailable(tool) && (
          <span className="rounded-full bg-canvas px-2.5 py-1 text-xs font-medium text-content-secondary">
            Currently unavailable
          </span>
        )}
      </div>

      <ToolGallery photos={tool.photos} name={tool.name} />
      <ToolInfoTiles tool={tool} />

      <details open className="group rounded-xl border border-line bg-surface">
        <summary className="flex cursor-pointer list-none items-center gap-2 p-5 font-medium text-content-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
          <FileTextIcon className="size-5 text-content-secondary" />
          About this tool
          <ChevronDownIcon className="ml-auto size-5 text-content-secondary transition-transform group-open:rotate-180" />
        </summary>
        <p className="px-5 pb-5 leading-relaxed text-content-secondary">
          {tool.description}
        </p>
      </details>
    </article>
  );
}
