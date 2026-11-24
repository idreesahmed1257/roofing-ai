import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  issue_summary: string;
  preferred_time?: string;
  createdAt: string;
};

const LEADS_PATH = path.join(process.cwd(), "data", "leads.json");

async function readLeads(): Promise<Lead[]> {
  try {
    const raw = await readFile(LEADS_PATH, "utf8");
    return JSON.parse(raw) as Lead[];
  } catch {
    return [];
  }
}

export async function saveLead(
  input: Omit<Lead, "id" | "createdAt">,
): Promise<Lead> {
  const leads = await readLeads();
  const lead: Lead = {
    ...input,
    id: `lead_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  leads.push(lead);
  await mkdir(path.dirname(LEADS_PATH), { recursive: true });
  await writeFile(LEADS_PATH, JSON.stringify(leads, null, 2), "utf8");
  return lead;
}
