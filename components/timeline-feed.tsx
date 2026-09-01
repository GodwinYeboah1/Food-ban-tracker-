import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { REGION_BY_CODE } from "@/lib/regions";
import { getIngredient } from "@/lib/ingredients";
import type { ChangeEvent } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { RelativeTime } from "./relative-time";

export function TimelineFeed({ events, limit }: { events: ChangeEvent[]; limit?: number }) {
  const shown = limit ? events.slice(0, limit) : events;

  return (
    <ol className="relative">
      {shown.map((event, i) => {
        const region = REGION_BY_CODE[event.region];

        return (
          <li key={event.id} className="relative pb-8 pl-7 last:pb-0">
            {i < shown.length - 1 && (
              <span className="absolute top-3 left-[5px] h-full w-px bg-border" aria-hidden />
            )}
            <span className="absolute top-2 left-0 size-2.5 rounded-full border-2 border-background bg-muted-foreground" aria-hidden />

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
              <time dateTime={event.date} className="tnum font-medium text-foreground">
                {formatDate(event.date)}
              </time>
              <span aria-hidden>·</span>
              <span>{event.state ? `${event.state}, ${region.shortName}` : region.shortName}</span>
              <RelativeTime date={event.date} className="before:mr-2.5 before:content-['·']" />
            </div>

            <h3 className="mt-1.5 leading-snug font-medium">{event.title}</h3>
            <p className="measure mt-2 text-sm leading-relaxed text-muted-foreground">{event.detail}</p>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <StatusBadge status={event.status} />
              {event.ingredients.slice(0, 4).map((slug) => {
                const ing = getIngredient(slug);
                if (!ing) return null;
                return (
                  <Link
                    key={slug}
                    href={`/ingredients/${slug}`}
                    className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                  >
                    {ing.name}
                  </Link>
                );
              })}
              {event.ingredients.length > 4 && (
                <span className="text-xs text-muted-foreground">+{event.ingredients.length - 4} more</span>
              )}
            </div>

            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
              {event.sources.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground underline decoration-border underline-offset-2 hover:text-foreground"
                >
                  {s.label}
                  <ArrowUpRight className="size-3" />
                </a>
              ))}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
