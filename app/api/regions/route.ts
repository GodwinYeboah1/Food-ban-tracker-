import { REGIONS, STATUS_META } from "@/lib/regions";
import { json } from "@/lib/api";

export async function GET() {
  return json({
    data: REGIONS.map((r) => ({
      code: r.code,
      name: r.name,
      short_name: r.shortName,
      regulator: r.regulator,
      list_type: r.listType,
      note: r.note,
      source_url: r.sourceUrl,
    })),
    statuses: Object.entries(STATUS_META).map(([key, m]) => ({
      key,
      label: m.label,
      description: m.description,
    })),
  });
}
