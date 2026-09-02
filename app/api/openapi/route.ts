import { CATEGORY_META, REGIONS, STATUS_META } from "@/lib/regions";
import { json } from "@/lib/api";

/** Machine-readable schema, generated from the same constants the app uses,
 *  so the enums here cannot drift away from what the endpoints accept. */
export async function GET() {
  const statuses = Object.keys(STATUS_META);
  const categories = Object.keys(CATEGORY_META);
  const regions = REGIONS.map((r) => r.code);

  const listParam = (name: string, values: string[], description: string) => ({
    name,
    in: "query",
    description,
    schema: { type: "string" },
    examples: { single: { value: values[0] }, multiple: { value: values.slice(0, 2).join(",") } },
  });

  return json({
    openapi: "3.1.0",
    info: {
      title: "Food Ban Tracker API",
      version: "1.0.0",
      description:
        "Food additives and practices banned or restricted in the United States, with the same substance's status in the EU, UK, Canada, Australia/NZ and Japan. Every record carries a link to the primary government source.",
    },
    servers: [{ url: "/", description: "This deployment" }],
    paths: {
      "/api/ingredients": {
        get: {
          summary: "List substances",
          parameters: [
            {
              name: "region",
              in: "query",
              description: "Which regulator's status to return and filter on.",
              schema: { type: "string", enum: regions, default: "US" },
            },
            listParam("status", statuses, "Comma-separated status filter."),
            listParam("category", categories, "Comma-separated category filter."),
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "hasStateAction", in: "query", schema: { type: "boolean" } },
          ],
          responses: { "200": { description: "Matching substances" }, "400": { description: "Invalid filter value" } },
        },
      },
      "/api/ingredients/{slug}": {
        get: {
          summary: "Get one substance in full, with its change history",
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "The substance" }, "404": { description: "Unknown slug" } },
        },
      },
      "/api/latest": {
        get: {
          summary: "Recent verified changes to the legal record",
          parameters: [
            { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
          ],
          responses: { "200": { description: "Changes, newest first" } },
        },
      },
      "/api/compare": {
        get: {
          summary: "Compare named substances across named regions",
          parameters: [
            { name: "ids", in: "query", required: true, schema: { type: "string" }, example: "red-3,titanium-dioxide" },
            listParam("regions", regions, "Comma-separated region codes. Defaults to all."),
          ],
          responses: {
            "200": { description: "Comparison rows" },
            "400": { description: "No slugs given, or an unknown region" },
            "404": { description: "Unknown slug" },
          },
        },
      },
      "/api/scan/{barcode}": {
        get: {
          summary: "Tracked additives on a product's label, by barcode",
          description:
            "Looks the barcode up in Open Food Facts and returns the tracked substances its label lists, most severe first. Label data is crowd-sourced and is weaker evidence than the rulings it is matched against.",
          parameters: [
            {
              name: "barcode",
              in: "path",
              required: true,
              schema: { type: "string", pattern: "^\\d{8,14}$" },
              example: "3017620422003",
            },
          ],
          responses: {
            "200": { description: "The product and its flagged additives; found is false if the barcode is unknown" },
            "400": { description: "Barcode is not 8-14 digits" },
            "502": { description: "Open Food Facts could not be reached" },
          },
        },
      },
      "/api/regions": {
        get: {
          summary: "Tracked regulators and the status vocabulary",
          responses: { "200": { description: "Regions and statuses" } },
        },
      },
    },
    components: {
      schemas: {
        Status: { type: "string", enum: statuses },
        Category: { type: "string", enum: categories },
        Region: { type: "string", enum: regions },
      },
    },
  });
}
