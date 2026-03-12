import React, { useState } from "react";
import { useGetHistory, type LoteryType } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Target, BarChart2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ComparisonSectionProps {
  tipo: LoteryType;
  predictedNumbers: number[];
  predictedSpecial: number;
}

interface PrizeInfo {
  label: string;
  level: number;
  color: string;
}

function getPrize(mainMatches: number, specialMatch: boolean, tipo: string): PrizeInfo {
  if (tipo === "powerball") {
    if (mainMatches === 5 && specialMatch) return { label: "🏆 JACKPOT", level: 9, color: "text-yellow-400" };
    if (mainMatches === 5)                 return { label: "🥇 2do Premio", level: 8, color: "text-yellow-300" };
    if (mainMatches === 4 && specialMatch) return { label: "🥈 3er Premio", level: 7, color: "text-slate-300" };
    if (mainMatches === 4)                 return { label: "🥉 4to Premio", level: 6, color: "text-amber-600" };
    if (mainMatches === 3 && specialMatch) return { label: "🎖 5to Premio", level: 5, color: "text-emerald-400" };
    if (mainMatches === 3)                 return { label: "6to Premio",    level: 4, color: "text-emerald-300" };
    if (mainMatches === 2 && specialMatch) return { label: "7mo Premio",    level: 3, color: "text-blue-400" };
    if (mainMatches === 1 && specialMatch) return { label: "8vo Premio",    level: 2, color: "text-blue-300" };
    if (specialMatch)                      return { label: "9no Premio",    level: 1, color: "text-blue-200" };
    return { label: "Sin premio", level: 0, color: "text-muted-foreground" };
  } else {
    if (mainMatches === 5 && specialMatch) return { label: "🏆 JACKPOT",   level: 8, color: "text-yellow-400" };
    if (mainMatches === 5)                 return { label: "🥇 2do Premio", level: 7, color: "text-yellow-300" };
    if (mainMatches === 4 && specialMatch) return { label: "🥈 3er Premio", level: 6, color: "text-slate-300" };
    if (mainMatches === 4)                 return { label: "🥉 4to Premio", level: 5, color: "text-amber-600" };
    if (mainMatches === 3 && specialMatch) return { label: "🎖 5to Premio", level: 4, color: "text-emerald-400" };
    if (mainMatches === 3)                 return { label: "6to Premio",    level: 3, color: "text-emerald-300" };
    if (mainMatches === 2 && specialMatch) return { label: "7mo Premio",    level: 2, color: "text-blue-400" };
    if (specialMatch)                      return { label: "8vo Premio",    level: 1, color: "text-blue-300" };
    return { label: "Sin premio", level: 0, color: "text-muted-foreground" };
  }
}

function matchNumbers(predicted: number[], actual: number[]): number[] {
  const actualSet = new Set(actual);
  return predicted.filter((n) => actualSet.has(n));
}

export function ComparisonSection({ tipo, predictedNumbers, predictedSpecial }: ComparisonSectionProps) {
  const [enabled, setEnabled] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading } = useGetHistory(
    tipo,
    { page: 1, limit: 300 },
    { query: { enabled } }
  );

  const specialName = tipo === "baloto" ? "SB" : tipo === "revancha" ? "RSB" : "PB";

  const results = React.useMemo(() => {
    if (!data?.rows) return [];
    return data.rows
      .map((row) => {
        const actualMain = [row.n1, row.n2, row.n3, row.n4, row.n5];
        const matched = matchNumbers(predictedNumbers, actualMain);
        const specialMatch = row.especial === predictedSpecial;
        const prize = getPrize(matched.length, specialMatch, tipo);
        return { row, matched, specialMatch, prize };
      })
      .sort((a, b) => b.prize.level - a.prize.level || b.matched.length - a.matched.length);
  }, [data, predictedNumbers, predictedSpecial, tipo]);

  const winners = results.filter((r) => r.prize.level > 0);
  const bestPrize = results[0]?.prize;
  const totalAnalyzed = results.length;

  const displayed = showAll ? winners : winners.slice(0, 10);

  return (
    <div className="mt-10 border-t border-white/10 pt-10">
      <div className="flex flex-col items-center gap-4 mb-6 text-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <BarChart2 className="w-5 h-5" />
          <span className="font-semibold text-white">Verificación Histórica</span>
        </div>
        <p className="text-sm text-muted-foreground max-w-lg">
          Compara la combinación generada contra los sorteos reales del historial para calcular qué premios habrían resultado.
        </p>
        {!enabled && (
          <Button variant="outline" onClick={() => setEnabled(true)} className="mt-2">
            <Target className="w-4 h-4 mr-2" />
            Analizar coincidencias
          </Button>
        )}
      </div>

      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-white/[0.02] border-white/5">
                    <CardContent className="p-4 text-center space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Sorteos analizados</p>
                      <p className="text-2xl font-mono font-bold text-white">{totalAnalyzed}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/[0.02] border-white/5">
                    <CardContent className="p-4 text-center space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Sorteos con premio</p>
                      <p className="text-2xl font-mono font-bold text-emerald-400">{winners.length}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/[0.02] border-white/5">
                    <CardContent className="p-4 text-center space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Mejor resultado</p>
                      <p className={`text-lg font-bold ${bestPrize?.level > 0 ? bestPrize.color : "text-muted-foreground"}`}>
                        {bestPrize?.level > 0 ? bestPrize.label : "Sin aciertos"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Results Table */}
                {winners.length === 0 ? (
                  <Card className="bg-white/[0.02] border-white/5">
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>Ningún sorteo histórico coincide con esta combinación en categoría premiada.</p>
                      <p className="text-xs mt-1 opacity-60">Intenta generar una nueva combinación.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="overflow-hidden border-white/5 bg-card/60">
                    <CardHeader className="pb-2 pt-4 px-6 border-b border-white/5">
                      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        Sorteos con coincidencias ({winners.length})
                      </CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-b border-white/10">
                          <tr>
                            <th className="px-4 py-3 text-left">Fecha</th>
                            <th className="px-4 py-3 text-center">Números sorteados</th>
                            <th className="px-4 py-3 text-center">{specialName}</th>
                            <th className="px-4 py-3 text-center">Aciertos</th>
                            <th className="px-4 py-3 text-center">{specialName} ✓</th>
                            <th className="px-4 py-3 text-center">Premio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayed.map(({ row, matched, specialMatch, prize }) => {
                            const actualMain = [row.n1, row.n2, row.n3, row.n4, row.n5];
                            const matchedSet = new Set(matched);
                            return (
                              <tr
                                key={row.id}
                                className={`border-b border-white/5 transition-colors ${prize.level >= 6 ? "bg-yellow-500/5" : prize.level >= 3 ? "bg-emerald-500/5" : "hover:bg-white/[0.02]"}`}
                              >
                                <td className="px-4 py-3 font-medium text-white/80 whitespace-nowrap">{row.fecha}</td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-1.5 justify-center flex-wrap">
                                    {actualMain.map((n, i) => (
                                      <span
                                        key={i}
                                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border ${
                                          matchedSet.has(n)
                                            ? "bg-primary/30 border-primary text-white"
                                            : "bg-white/5 border-white/20 text-muted-foreground"
                                        }`}
                                      >
                                        {n}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span
                                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border ${
                                      specialMatch
                                        ? "bg-red-500/30 border-red-400 text-white"
                                        : "bg-white/5 border-white/20 text-muted-foreground"
                                    }`}
                                  >
                                    {row.especial}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center font-mono font-bold">
                                  <span className={matched.length >= 3 ? "text-primary" : "text-white/60"}>
                                    {matched.length}/5
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {specialMatch ? (
                                    <span className="text-red-400 font-bold">Sí</span>
                                  ) : (
                                    <span className="text-muted-foreground/40">No</span>
                                  )}
                                </td>
                                <td className={`px-4 py-3 text-center text-xs font-semibold ${prize.color}`}>
                                  {prize.label}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {winners.length > 10 && (
                      <div className="p-3 border-t border-white/5 flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAll(!showAll)}
                          className="text-muted-foreground text-xs"
                        >
                          {showAll ? (
                            <><ChevronUp className="w-3 h-3 mr-1" /> Mostrar menos</>
                          ) : (
                            <><ChevronDown className="w-3 h-3 mr-1" /> Ver todos ({winners.length})</>
                          )}
                        </Button>
                      </div>
                    )}
                  </Card>
                )}

                {/* Percentage */}
                {totalAnalyzed > 0 && (
                  <p className="text-center text-xs text-muted-foreground/60">
                    Tasa de aciertos: <span className="text-white/70 font-mono">
                      {((winners.length / totalAnalyzed) * 100).toFixed(1)}%
                    </span> ({winners.length} de {totalAnalyzed} sorteos analizados)
                  </p>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
