import React, { useState } from "react";
import { useGetJackpotStats, useGetJackpots, useAddJackpot, useDeleteJackpot } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { Trophy, Flame, TrendingUp, AlertCircle, Plus, Trash2, BarChart2 } from "lucide-react";
import type { LoteryType } from "@workspace/api-client-react";

interface JackpotsPageProps {
  initialTipo?: LoteryType;
}

const LOTTERIES: { id: LoteryType; label: string; moneda: string }[] = [
  { id: "baloto", label: "Baloto", moneda: "COP" },
  { id: "revancha", label: "Revancha", moneda: "COP" },
  { id: "powerball", label: "Powerball", moneda: "USD" },
];

function formatMonto(monto: number, moneda: string) {
  if (moneda === "USD") {
    if (monto >= 1_000_000_000) return `$${(monto / 1_000_000_000).toFixed(2)}B`;
    if (monto >= 1_000_000) return `$${(monto / 1_000_000).toFixed(1)}M`;
    return `$${monto.toLocaleString()}`;
  }
  if (monto >= 1_000_000_000) return `$${(monto / 1_000_000_000).toFixed(1)}B COP`;
  if (monto >= 1_000_000) return `$${(monto / 1_000_000).toFixed(0)}M COP`;
  return `$${monto.toLocaleString()} COP`;
}

function AddJackpotForm({ tipo, moneda, onSuccess }: { tipo: LoteryType; moneda: string; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    fecha: "", n1: "", n2: "", n3: "", n4: "", n5: "", especial: "",
    monto: "", numGanadores: "1", sorteosAcumulados: "0", ciudad: "", notas: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const addMut = useAddJackpot();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const nums = [form.n1, form.n2, form.n3, form.n4, form.n5, form.especial, form.monto, form.numGanadores, form.sorteosAcumulados]
      .map(Number);
    if (nums.some(isNaN) || !form.fecha) { setErr("Completa todos los campos numéricos y la fecha (DD/MM/AAAA)"); return; }
    addMut.mutate(
      {
        tipo,
        body: {
          fecha: form.fecha,
          n1: Number(form.n1), n2: Number(form.n2), n3: Number(form.n3),
          n4: Number(form.n4), n5: Number(form.n5), especial: Number(form.especial),
          monto: Number(form.monto), moneda, numGanadores: Number(form.numGanadores),
          sorteosAcumulados: Number(form.sorteosAcumulados),
          ciudad: form.ciudad || null, notas: form.notas || null,
        },
      },
      {
        onSuccess: () => { setOpen(false); onSuccess(); setForm({ fecha: "", n1: "", n2: "", n3: "", n4: "", n5: "", especial: "", monto: "", numGanadores: "1", sorteosAcumulados: "0", ciudad: "", notas: "" }); },
        onError: (e: unknown) => { setErr(e instanceof Error ? e.message : "Error al guardar"); },
      }
    );
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
        <Plus className="w-4 h-4 mr-1" /> Registrar jackpot
      </Button>
    );
  }

  return (
    <Card className="border-yellow-500/30 bg-yellow-500/5 mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-yellow-400">Nuevo Jackpot — {tipo}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Fecha (DD/MM/AAAA)</Label>
              <Input className="h-8 text-sm mt-1" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} placeholder="14/03/2026" />
            </div>
            {["n1","n2","n3","n4","n5"].map(k => (
              <div key={k}>
                <Label className="text-xs text-muted-foreground">{k.toUpperCase()}</Label>
                <Input className="h-8 text-sm mt-1" type="number" value={form[k as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
              </div>
            ))}
            <div>
              <Label className="text-xs text-muted-foreground">{moneda === "USD" ? "PB" : "SB"}</Label>
              <Input className="h-8 text-sm mt-1" type="number" value={form.especial} onChange={e => setForm(f => ({ ...f, especial: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Monto ({moneda})</Label>
              <Input className="h-8 text-sm mt-1" type="number" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} placeholder="27000000000" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Ganadores</Label>
              <Input className="h-8 text-sm mt-1" type="number" value={form.numGanadores} onChange={e => setForm(f => ({ ...f, numGanadores: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Sorteos acumulados</Label>
              <Input className="h-8 text-sm mt-1" type="number" value={form.sorteosAcumulados} onChange={e => setForm(f => ({ ...f, sorteosAcumulados: e.target.value }))} placeholder="0" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Ciudad (opcional)</Label>
              <Input className="h-8 text-sm mt-1" value={form.ciudad} onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))} placeholder="Bogotá" />
            </div>
          </div>
          {err && <p className="text-xs text-red-400">{err}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" variant="glow" disabled={addMut.isPending}>
              {addMut.isPending ? "Guardando..." : "Guardar"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function LotteryJackpotPanel({ tipo, moneda }: { tipo: LoteryType; moneda: string }) {
  const qc = useQueryClient();
  const { data: stats, isLoading: loadingStats } = useGetJackpotStats(tipo);
  const { data: jackpotsData, isLoading: loadingJackpots } = useGetJackpots(tipo);
  const deleteMut = useDeleteJackpot();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: [`/api/jackpots/${tipo}`] });
    qc.invalidateQueries({ queryKey: [`/api/jackpots/stats/${tipo}`] });
  };

  const isLoading = loadingStats || loadingJackpots;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats || !jackpotsData) return null;

  const pct = Math.min(100, stats.jackpotProbabilityPct);
  const barColor = pct >= 80 ? "bg-red-500" : pct >= 50 ? "bg-amber-500" : "bg-emerald-500";
  const textColor = pct >= 80 ? "text-red-400" : pct >= 50 ? "text-amber-400" : "text-emerald-400";

  // Prepare chart data
  const cycleData = stats.cycles.map((c, i) => ({ sorteo: `J${i + 1}`, ciclo: c }));

  const montoData = stats.montosHistory.map(m => ({
    fecha: m.fecha,
    monto: moneda === "USD" ? m.monto / 1_000_000 : m.monto / 1_000_000,
    label: formatMonto(m.monto, moneda),
  }));

  const freqData = stats.numberFrequency
    .filter(f => f.count > 0)
    .sort((a, b) => b.count - a.count);

  const jackpots = jackpotsData.jackpots;

  const noData = stats.totalJackpots === 0;

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-yellow-400">{stats.totalJackpots}</p>
            <p className="text-xs text-muted-foreground mt-1">Jackpots históricos</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-white">{stats.avgCycleDraws}</p>
            <p className="text-xs text-muted-foreground mt-1">Sorteos entre jackpots (prom.)</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-white">{stats.currentStreak}</p>
            <p className="text-xs text-muted-foreground mt-1">Sorteos sin jackpot</p>
          </CardContent>
        </Card>
        <Card className={`border-white/10 ${pct >= 80 ? "bg-red-500/10" : pct >= 50 ? "bg-amber-500/10" : "bg-emerald-500/10"}`}>
          <CardContent className="pt-4 text-center">
            <p className={`text-3xl font-bold ${textColor}`}>{pct.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Tensión acumulada</p>
          </CardContent>
        </Card>
      </div>

      {/* Jackpot probability thermometer */}
      <Card className="border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="w-4 h-4 text-yellow-400" />
            Termómetro de Jackpot
          </CardTitle>
          <CardDescription>
            {noData
              ? "Registra jackpots históricos para calcular la tensión acumulada"
              : `Basado en ${stats.totalJackpots} jackpots. Ciclo promedio: ${stats.avgCycleDraws} sorteos. Racha actual: ${stats.currentStreak} sin jackpot.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
            <div
              className={`${barColor} h-4 rounded-full transition-all duration-1000 flex items-center justify-end pr-2`}
              style={{ width: `${pct}%` }}
            >
              {pct > 15 && <span className="text-[10px] font-bold text-white">{pct.toFixed(0)}%</span>}
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0% — Jackpot reciente</span>
            <span>100% — Muy probable</span>
          </div>
        </CardContent>
      </Card>

      {noData ? (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="py-12 flex flex-col items-center gap-4">
            <Trophy className="w-12 h-12 text-yellow-400/50" />
            <p className="text-muted-foreground text-center text-sm max-w-md">
              No hay jackpots registrados para <strong className="text-white capitalize">{tipo}</strong>. 
              Usa el formulario de abajo para registrar los sorteos con premio mayor y activar todos los análisis.
            </p>
            <AddJackpotForm tipo={tipo} moneda={moneda} onSuccess={invalidate} />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Cycles chart */}
          {cycleData.length > 1 && (
            <Card className="border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  Histograma de Ciclos
                </CardTitle>
                <CardDescription>Sorteos acumulados antes de cada jackpot</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={cycleData}>
                    <XAxis dataKey="sorteo" tick={{ fontSize: 10, fill: "#888" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#888" }} />
                    <Tooltip
                      contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }}
                      formatter={(v: number) => [`${v} sorteos`, "Ciclo"]}
                    />
                    <Bar dataKey="ciclo" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Monto evolution */}
          {montoData.length > 1 && (
            <Card className="border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Evolución del Premio Mayor
                </CardTitle>
                <CardDescription>Monto del jackpot a lo largo del tiempo ({moneda === "USD" ? "millones USD" : "millones COP"})</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={montoData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 9, fill: "#888" }} angle={-30} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 10, fill: "#888" }} />
                    <Tooltip
                      contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }}
                      formatter={(v: number) => [`${v.toFixed(0)}M`, moneda]}
                    />
                    <Line type="monotone" dataKey="monto" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Number frequency heatmap */}
          {freqData.length > 0 && (
            <Card className="border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Frecuencia de Números en Jackpots</CardTitle>
                <CardDescription>¿Qué números han aparecido más veces cuando se ganó el premio mayor?</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={freqData.slice(0, 20)}>
                    <XAxis dataKey="number" tick={{ fontSize: 10, fill: "#888" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#888" }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }}
                      formatter={(v: number) => [`${v} apariciones`, "Frecuencia"]}
                    />
                    <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Antinumbers */}
          {stats.antinumbers.length > 0 && (
            <Card className="border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  Antinúmeros
                </CardTitle>
                <CardDescription>
                  Números que <strong className="text-white">NUNCA</strong> han aparecido en ningún jackpot registrado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {stats.antinumbers.map(n => (
                    <span key={n} className="w-9 h-9 flex items-center justify-center rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono font-bold">
                      {n}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {stats.antinumbers.length} de {tipo === "powerball" ? 69 : 43} números nunca han salido en un jackpot.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Last jackpot info */}
          {stats.lastJackpot && (
            <Card className="border-yellow-500/20 bg-yellow-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-yellow-400 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Último Jackpot Registrado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[stats.lastJackpot.n1, stats.lastJackpot.n2, stats.lastJackpot.n3, stats.lastJackpot.n4, stats.lastJackpot.n5].map((n, i) => (
                    <span key={i} className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold font-mono">
                      {n}
                    </span>
                  ))}
                  <span className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/30 border border-red-500/50 text-red-300 font-bold font-mono">
                    {stats.lastJackpot.especial}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
                  <div><span className="block text-white font-mono">{stats.lastJackpot.fecha}</span>Fecha</div>
                  <div><span className="block text-white font-mono">{formatMonto(stats.lastJackpot.monto, moneda)}</span>Premio</div>
                  <div><span className="block text-white font-mono">{stats.lastJackpot.numGanadores}</span>Ganadores</div>
                  {stats.lastJackpot.ciudad && <div><span className="block text-white font-mono">{stats.lastJackpot.ciudad}</span>Ciudad</div>}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Register form (when data exists, shown as secondary action) */}
      {!noData && (
        <div>
          <AddJackpotForm tipo={tipo} moneda={moneda} onSuccess={invalidate} />
        </div>
      )}

      {/* Jackpot list */}
      {jackpots.length > 0 && (
        <Card className="border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Historial de Jackpots</CardTitle>
            <CardDescription>{jackpots.length} registros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-muted-foreground">
                    <th className="text-left py-2 pr-4">Fecha</th>
                    <th className="text-left py-2 pr-4">Números</th>
                    <th className="text-right py-2 pr-4">Premio</th>
                    <th className="text-right py-2 pr-4">Acumulados</th>
                    <th className="text-right py-2">Ganadores</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {jackpots.map(j => (
                    <tr key={j.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2 pr-4 font-mono text-white">{j.fecha}</td>
                      <td className="py-2 pr-4">
                        <div className="flex gap-1 flex-wrap">
                          {[j.n1, j.n2, j.n3, j.n4, j.n5].map((n, i) => (
                            <span key={i} className="w-6 h-6 flex items-center justify-center rounded-full bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold">{n}</span>
                          ))}
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-red-500/30 text-red-300 font-mono text-[10px] font-bold">{j.especial}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-right text-emerald-400 font-mono">{formatMonto(j.monto, j.moneda)}</td>
                      <td className="py-2 pr-4 text-right text-muted-foreground">{j.sorteosAcumulados}</td>
                      <td className="py-2 text-right text-muted-foreground">{j.numGanadores}</td>
                      <td className="py-2 pl-2">
                        <button
                          onClick={() => { deleteMut.mutate({ id: j.id }, { onSuccess: invalidate }); }}
                          className="text-red-400/50 hover:text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function JackpotsPage({ initialTipo }: JackpotsPageProps) {
  const [activeTipo, setActiveTipo] = useState<LoteryType>(initialTipo ?? "baloto");
  const activeMoneda = LOTTERIES.find(l => l.id === activeTipo)?.moneda ?? "COP";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
          Análisis de <span className="text-yellow-400">Jackpots</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Ciclos históricos, evolución de premios, números favoritos del jackpot y análisis de tensión acumulada.
        </p>
      </div>

      {/* Lottery tabs */}
      <div className="flex gap-2 bg-white/5 rounded-xl p-1 w-fit border border-white/10">
        {LOTTERIES.map(l => (
          <button
            key={l.id}
            onClick={() => setActiveTipo(l.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTipo === l.id
                ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <LotteryJackpotPanel key={activeTipo} tipo={activeTipo} moneda={activeMoneda} />
    </div>
  );
}
