import { parse } from "csv-parse/sync";

export type LotteryType = "baloto" | "revancha" | "powerball";

export interface ParsedRow {
  fecha: string;
  n1: number;
  n2: number;
  n3: number;
  n4: number;
  n5: number;
  especial: number;
}

function toInt(val: unknown): number {
  const n = parseInt(String(val).trim(), 10);
  if (isNaN(n)) throw new Error(`Invalid number: ${val}`);
  return n;
}

function normalizeDate(val: string): string {
  return val.trim();
}

function detectDelimiter(buffer: Buffer): string {
  const firstLine = buffer.toString("utf8").replace(/^\uFEFF/, "").split(/\r?\n/)[0] ?? "";
  if (firstLine.includes(";")) return ";";
  if (firstLine.includes("\t")) return "\t";
  return ",";
}

export function parseCsv(buffer: Buffer, tipo: LotteryType): ParsedRow[] {
  const delimiter = detectDelimiter(buffer);
  const records: Record<string, string>[] = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    delimiter,
    bom: true,
  });

  return records.map((row, idx) => {
    const keys = Object.keys(row).map((k) => k.trim().toLowerCase());
    const get = (candidates: string[]): string => {
      for (const c of candidates) {
        const found = Object.entries(row).find(([k]) => k.trim().toLowerCase() === c);
        if (found) return found[1];
      }
      throw new Error(`Row ${idx + 1}: missing column. Expected one of: ${candidates.join(", ")}. Got: ${keys.join(", ")}`);
    };

    const fecha = normalizeDate(get(["fecha"]));

    if (tipo === "powerball") {
      return {
        fecha,
        n1: toInt(get(["bola blanca 1", "b1", "n1"])),
        n2: toInt(get(["bola blanca 2", "b2", "n2"])),
        n3: toInt(get(["bola blanca 3", "b3", "n3"])),
        n4: toInt(get(["bola blanca 4", "b4", "n4"])),
        n5: toInt(get(["bola blanca 5", "b5", "n5"])),
        especial: toInt(get(["powerball", "pb", "especial"])),
      };
    } else if (tipo === "revancha") {
      return {
        fecha,
        n1: toInt(get(["r1", "n1"])),
        n2: toInt(get(["r2", "n2"])),
        n3: toInt(get(["r3", "n3"])),
        n4: toInt(get(["r4", "n4"])),
        n5: toInt(get(["r5", "n5"])),
        especial: toInt(get(["rsb", "especial"])),
      };
    } else {
      return {
        fecha,
        n1: toInt(get(["b1", "n1"])),
        n2: toInt(get(["b2", "n2"])),
        n3: toInt(get(["b3", "n3"])),
        n4: toInt(get(["b4", "n4"])),
        n5: toInt(get(["b5", "n5"])),
        especial: toInt(get(["sb", "especial"])),
      };
    }
  });
}
