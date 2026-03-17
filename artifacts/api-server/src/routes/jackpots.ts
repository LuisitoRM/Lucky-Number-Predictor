import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import {
  jackpotsTable,
  historialBalotoTable,
  historialRevanchaTable,
  historialPowerballTable,
} from "@workspace/db";
import { sql, eq, count } from "drizzle-orm";
import {
  GetJackpotsParams,
  GetJackpotStatsParams,
  AddJackpotParams,
  AddJackpotBody,
  AddJackpotResponse,
  GetJackpotsResponse,
  GetJackpotStatsResponse,
  DeleteJackpotParams,
  DeleteJackpotResponse,
} from "@workspace/api-zod";
import { LOTTERY_CONFIG } from "../lib/prediction.js";
import type { LotteryType } from "../lib/prediction.js";

const router: IRouter = Router();

function getHistorialTable(tipo: LotteryType) {
  if (tipo === "baloto") return historialBalotoTable;
  if (tipo === "revancha") return historialRevanchaTable;
  return historialPowerballTable;
}

// GET /api/jackpots/stats/:tipo — BEFORE /:tipo to avoid route collision
router.get("/jackpots/stats/:tipo", async (req: Request, res: Response): Promise<void> => {
  const params = GetJackpotStatsParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Tipo inválido" }); return; }

  const tipo = params.data.tipo as LotteryType;
  const cfg = LOTTERY_CONFIG[tipo];
  const histTable = getHistorialTable(tipo);

  const jackpots = await db
    .select()
    .from(jackpotsTable)
    .where(eq(jackpotsTable.tipo, tipo))
    .orderBy(sql`to_date(${jackpotsTable.fecha}, 'DD/MM/YYYY') ASC`);

  const totalJackpots = jackpots.length;
  const lastJackpot = jackpots.length > 0 ? jackpots[jackpots.length - 1]! : null;

  const cycles = jackpots.map((j) => j.sorteosAcumulados).filter((c) => c > 0);
  const avgCycleDraws = cycles.length > 0
    ? Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length)
    : 0;

  // Current streak: draws after last jackpot date
  let currentStreak = 0;
  if (lastJackpot) {
    const [streakRow] = await db
      .select({ count: count() })
      .from(histTable)
      .where(sql`to_date(${histTable.fecha}, 'DD/MM/YYYY') > to_date(${lastJackpot.fecha}, 'DD/MM/YYYY')`);
    currentStreak = streakRow?.count ?? 0;
  } else {
    const [totalRow] = await db.select({ count: count() }).from(histTable);
    currentStreak = totalRow?.count ?? 0;
  }

  // Jackpot probability (logistic-like: grows as currentStreak approaches avgCycle)
  const jackpotProbabilityPct = avgCycleDraws > 0
    ? Math.min(99, Math.round((currentStreak / avgCycleDraws) * 80 * 10) / 10)
    : 0;

  // Monto history
  const montosHistory = jackpots.map((j) => ({ fecha: j.fecha, monto: j.monto }));

  // Number frequency in jackpot draws
  const mainFreq: Record<number, number> = {};
  for (let n = 1; n <= cfg.maxMain; n++) mainFreq[n] = 0;

  for (const j of jackpots) {
    for (const num of [j.n1, j.n2, j.n3, j.n4, j.n5]) {
      if (num >= 1 && num <= cfg.maxMain) {
        mainFreq[num] = (mainFreq[num] ?? 0) + 1;
      }
    }
  }

  const numberFrequency = Object.entries(mainFreq).map(([n, cnt]) => ({
    number: parseInt(n),
    count: cnt,
  }));

  const antinumbers = numberFrequency
    .filter((f) => f.count === 0)
    .map((f) => f.number);

  res.json(
    GetJackpotStatsResponse.parse({
      tipo,
      totalJackpots,
      lastJackpot: lastJackpot
        ? {
            ...lastJackpot,
            ciudad: lastJackpot.ciudad ?? null,
            notas: lastJackpot.notas ?? null,
          }
        : null,
      avgCycleDraws,
      currentStreak,
      jackpotProbabilityPct,
      cycles,
      montosHistory,
      numberFrequency,
      antinumbers,
    })
  );
});

// GET /api/jackpots/:tipo
router.get("/jackpots/:tipo", async (req: Request, res: Response): Promise<void> => {
  const params = GetJackpotsParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Tipo inválido" }); return; }

  const tipo = params.data.tipo;
  const jackpots = await db
    .select()
    .from(jackpotsTable)
    .where(eq(jackpotsTable.tipo, tipo))
    .orderBy(sql`to_date(${jackpotsTable.fecha}, 'DD/MM/YYYY') DESC`);

  res.json(
    GetJackpotsResponse.parse({
      tipo,
      jackpots: jackpots.map((j) => ({
        ...j,
        ciudad: j.ciudad ?? null,
        notas: j.notas ?? null,
      })),
    })
  );
});

// POST /api/jackpots/:tipo
router.post("/jackpots/:tipo", async (req: Request, res: Response): Promise<void> => {
  const params = AddJackpotParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Tipo inválido" }); return; }

  const body = AddJackpotBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Datos inválidos", detail: body.error.issues }); return; }

  const tipo = params.data.tipo;
  const data = body.data;

  const [inserted] = await db
    .insert(jackpotsTable)
    .values({
      tipo,
      fecha: data.fecha,
      n1: data.n1,
      n2: data.n2,
      n3: data.n3,
      n4: data.n4,
      n5: data.n5,
      especial: data.especial,
      monto: data.monto,
      moneda: data.moneda ?? "COP",
      numGanadores: data.numGanadores ?? 1,
      sorteosAcumulados: data.sorteosAcumulados ?? 0,
      ciudad: data.ciudad ?? null,
      notas: data.notas ?? null,
    })
    .onConflictDoNothing()
    .returning();

  if (!inserted) {
    res.status(409).json({ error: "Ya existe un jackpot para esa fecha y lotería" });
    return;
  }

  res.json(
    AddJackpotResponse.parse({
      ...inserted,
      ciudad: inserted.ciudad ?? null,
      notas: inserted.notas ?? null,
    })
  );
});

// DELETE /api/jackpots/item/:id
router.delete("/jackpots/item/:id", async (req: Request, res: Response): Promise<void> => {
  const params = DeleteJackpotParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "ID inválido" }); return; }

  await db.delete(jackpotsTable).where(eq(jackpotsTable.id, params.data.id));
  res.json(DeleteJackpotResponse.parse({ message: "Jackpot eliminado" }));
});

export default router;
