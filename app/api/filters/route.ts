import { getFilterOptions } from "@/lib/program-intelligence";

export async function GET() {
  return Response.json(getFilterOptions());
}
