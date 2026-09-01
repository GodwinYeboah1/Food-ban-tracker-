import { getIngredient } from "@/lib/ingredients";
import { TIMELINE } from "@/lib/timeline";
import { apiError, json } from "@/lib/api";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ingredient = getIngredient(slug);
  if (!ingredient) return apiError(`No ingredient with slug "${slug}"`, 404);

  return json({
    data: {
      ...ingredient,
      history: TIMELINE.filter((e) => e.ingredients.includes(slug)).map((e) => ({
        date: e.date,
        region: e.region,
        state: e.state ?? null,
        title: e.title,
        detail: e.detail,
        status: e.status,
        sources: e.sources,
      })),
    },
  });
}
