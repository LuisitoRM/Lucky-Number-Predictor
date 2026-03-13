import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { db } from "@workspace/db";
import {
  historialBalotoTable,
  historialRevanchaTable,
  historialPowerballTable,
} from "@workspace/db";
import { sql, count } from "drizzle-orm";
import {
  GetStatusResponse,
  UploadCsvParams,
  UploadCsvResponse,
  GetHistoryParams,
  GetHistoryQueryParams,
  GetHistoryResponse,
  GetFrequenciesParams,
  GetFrequenciesResponse,
  PredictParams,
  PredictResponse,
} from "@workspace/api-zod";
import { parseCsv, type LotteryType } from "../lib/csv-parser.js";
import { runPrediction, LOTTERY_CONFIG } from "../lib/prediction.js";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

function getTable(tipo: LotteryType) {
  if (tipo === "baloto") return historialBalotoTable;
  if (tipo === "revancha") return historialRevanchaTable;
  return historialPowerballTable;
}

router.get("/status", async (_req: Request, res: Response): Promise<void> => {
  const tipos: LotteryType[] = ["baloto", "revancha", "powerball"];
  const results = await Promise.all(
    tipos.map(async (tipo) => {
      const table = getTable(tipo);
      const [row] = await db
        .select({
          count: count(),
          oldest: sql<string | null>`(array_agg(${table.fecha} ORDER BY to_date(${table.fecha}, 'DD/MM/YYYY') ASC))[1]`,
          newest: sql<string | null>`(array_agg(${table.fecha} ORDER BY to_date(${table.fecha}, 'DD/MM/YYYY') DESC))[1]`,
        })
        .from(table);
      return {
        tipo,
        count: row?.count ?? 0,
        oldest: row?.oldest ?? null,
        newest: row?.newest ?? null,
      };
    })
  );
  res.json(GetStatusResponse.parse({ lotteries: results }));
});

router.post("/upload/:tipo", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  const params = UploadCsvParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Tipo de lotería inválido. Use: baloto, revancha, powerball" });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: "No se recibió ningún archivo" });
    return;
  }

  const tipo = params.data.tipo as LotteryType;

  let parsed;
  try {
    parsed = parseCsv(req.file.buffer, tipo);
  } catch (err: unknown) {
    res.status(400).json({ error: `Error al parsear CSV: ${err instanceof Error ? err.message : String(err)}` });
    return;
  }

  if (parsed.length === 0) {
    res.status(400).json({ error: "El archivo CSV está vacío o no tiene filas válidas" });
    return;
  }

  const table = getTable(tipo);
  let inserted = 0;
  let skipped = 0;

  for (const row of parsed) {
    try {
      const result = await db
        .insert(table)
        .values(row)
        .onConflictDoNothing()
        .returning({ id: table.id });
      if (result.length > 0) {
        inserted++;
      } else {
        skipped++;
      }
    } catch {
      skipped++;
    }
  }

  res.json(
    UploadCsvResponse.parse({
      message: `Carga completada para ${tipo}`,
      inserted,
      skipped,
    })
  );
});

router.get("/history/:tipo", async (req: Request, res: Response): Promise<void> => {
  const params = GetHistoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Tipo de lotería inválido" });
    return;
  }

  const query = GetHistoryQueryParams.safeParse(req.query);
  const page = query.success ? (query.data.page ?? 1) : 1;
  const limit = query.success ? (query.data.limit ?? 50) : 50;
  const offset = (page - 1) * limit;

  const tipo = params.data.tipo as LotteryType;
  const table = getTable(tipo);

  const [totalRow] = await db.select({ count: count() }).from(table);
  const total = totalRow?.count ?? 0;

  const rows = await db
    .select()
    .from(table)
    .orderBy(sql`to_date(${table.fecha}, 'DD/MM/YYYY') DESC`)
    .limit(limit)
    .offset(offset);

  const mapped = rows.map((r) => ({
    id: r.id,
    fecha: r.fecha,
    n1: r.n1,
    n2: r.n2,
    n3: r.n3,
    n4: r.n4,
    n5: r.n5,
    especial: r.especial,
  }));

  res.json(
    GetHistoryResponse.parse({
      tipo,
      page,
      limit,
      total,
      rows: mapped,
    })
  );
});

router.get("/frequencies/:tipo", async (req: Request, res: Response): Promise<void> => {
  const params = GetFrequenciesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Tipo de lotería inválido" });
    return;
  }

  const tipo = params.data.tipo as LotteryType;
  const cfg = LOTTERY_CONFIG[tipo];
  const table = getTable(tipo);

  const rows = await db.select().from(table);
  const totalDraws = rows.length;

  if (totalDraws === 0) {
    res.status(400).json({ error: "No hay datos históricos para esta lotería. Carga un CSV primero." });
    return;
  }

  const mainCounts: Record<number, number> = {};
  const specialCounts: Record<number, number> = {};
  let evenCount = 0;
  let oddCount = 0;
  const sums: number[] = [];

  for (let n = 1; n <= cfg.maxMain; n++) mainCounts[n] = 0;
  for (let n = 1; n <= cfg.maxSpec; n++) specialCounts[n] = 0;

  for (const row of rows) {
    const nums = [row.n1, row.n2, row.n3, row.n4, row.n5];
    const sum = nums.reduce((a, b) => a + b, 0);
    sums.push(sum);

    for (const n of nums) {
      if (n >= 1 && n <= cfg.maxMain) mainCounts[n] = (mainCounts[n] ?? 0) + 1;
      if (n % 2 === 0) evenCount++; else oddCount++;
    }
    if (row.especial >= 1 && row.especial <= cfg.maxSpec) {
      specialCounts[row.especial] = (specialCounts[row.especial] ?? 0) + 1;
    }
  }

  const totalNums = totalDraws * cfg.n;
  const mainNumbers = Object.entries(mainCounts).map(([num, cnt]) => ({
    number: parseInt(num),
    count: cnt,
    percentage: totalNums > 0 ? Math.round((cnt / totalDraws) * 1000) / 10 : 0,
  }));

  const specialBall = Object.entries(specialCounts).map(([num, cnt]) => ({
    number: parseInt(num),
    count: cnt,
    percentage: totalDraws > 0 ? Math.round((cnt / totalDraws) * 1000) / 10 : 0,
  }));

  const sumMin = Math.min(...sums);
  const sumMax = Math.max(...sums);
  const sumAvg = sums.reduce((a, b) => a + b, 0) / sums.length;
  const validSums = sums.filter((s) => s >= cfg.sumRange[0] && s <= cfg.sumRange[1]);
  const validRangePercent = Math.round((validSums.length / sums.length) * 1000) / 10;

  res.json(
    GetFrequenciesResponse.parse({
      tipo,
      totalDraws,
      mainNumbers,
      specialBall,
      evenOddRatio: {
        even: Math.round((evenCount / totalNums) * 1000) / 10,
        odd: Math.round((oddCount / totalNums) * 1000) / 10,
      },
      sumStats: {
        min: sumMin,
        max: sumMax,
        avg: Math.round(sumAvg * 10) / 10,
        validRangeMin: cfg.sumRange[0],
        validRangeMax: cfg.sumRange[1],
        validRangePercent,
      },
    })
  );
});

router.post("/predict/:tipo", async (req: Request, res: Response): Promise<void> => {
  const params = PredictParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Tipo de lotería inválido" });
    return;
  }

  const tipo = params.data.tipo as LotteryType;
  const table = getTable(tipo);

  const rows = await db
    .select()
    .from(table)
    .orderBy(sql`to_date(${table.fecha}, 'DD/MM/YYYY') DESC`)
    .limit(500);

  if (rows.length < 5) {
    res.status(400).json({ error: `Historial insuficiente para ${tipo}. Carga al menos 5 sorteos.` });
    return;
  }

  const result = runPrediction({ rows, tipo });

  res.json(PredictResponse.parse({ tipo, ...result }));
});

export default router;
