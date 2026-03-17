import React from "react";
import { useGetStatus, useGetJackpotStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatNumber } from "@/lib/utils";
import { Dices, AlertCircle, Database, TrendingUp, Trophy, Flame, Clock } from "lucide-react";
import type { LoteryType } from "@workspace/api-client-react";

const LOTTERY_NAMES: Record<string, string> = {
  baloto: "Baloto",
  revancha: "Revancha",
  powerball: "Powerball",
};

function JackpotCycleCard({ tipo }: { tipo: LoteryType }) {
  const { data: stats, isLoading } = useGetJackpotStats(tipo);

  if (isLoading || !stats) {
    return (
      <div className="h-full flex items-center justify-center py-6">
        <div className="w-6 h-6 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
      </div>
    );
  }

  const pct = Math.min(100, stats.jackpotProbabilityPct);
  const barColor =
    pct >= 80 ? "bg-red-500" : pct >= 50 ? "bg-amber-500" : "bg-emerald-500";
  const textColor =
    pct >= 80 ? "text-red-400" : pct >= 50 ? "text-amber-400" : "text-emerald-400";

  if (stats.totalJackpots === 0) {
    return (
      <div className="text-center py-4 space-y-2">
        <Trophy className="w-8 h-8 text-muted-foreground mx-auto" />
        <p className="text-xs text-muted-foreground">Sin jackpots registrados</p>
        <Link href={`/${tipo}/jackpots`}>
          <Button variant="outline" size="sm" className="text-xs h-7">Registrar jackpots</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Sorteos sin jackpot
        </span>
        <span className="text-white font-mono font-bold">{stats.currentStreak}</span>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Ciclo promedio</span>
        <span className="text-white font-mono">{stats.avgCycleDraws} sorteos</span>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Último jackpot</span>
        <span className="text-white font-mono">{stats.lastJackpot?.fecha ?? "—"}</span>
      </div>

      {/* Probability thermometer */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Tensión acumulada</span>
          <span className={`font-bold font-mono ${textColor}`}>{pct.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className={`${barColor} h-2 rounded-full transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          Basado en {stats.totalJackpots} jackpots históricos
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: statusData, isLoading, isError } = useGetStatus();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-display tracking-widest animate-pulse">CARGANDO ESTADO...</p>
      </div>
    );
  }

  if (isError || !statusData) {
    return (
      <Card className="border-destructive/50 bg-destructive/10">
        <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-destructive-foreground">Error al conectar con la base de datos. Verifica el servidor API.</p>
        </CardContent>
      </Card>
    );
  }

  const lotteries = ['baloto', 'revancha', 'powerball'] as const;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
          Panel de <span className="text-gradient">Control</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Monitorea el estado de los datos históricos y accede rápidamente a los motores de predicción basados en Monte Carlo.
        </p>
      </div>

      {/* Lottery data cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {lotteries.map((lottery) => {
          const info = statusData.lotteries.find(l => l.tipo === lottery);
          const count = info?.count || 0;
          
          return (
            <Card key={lottery} className="group hover:border-primary/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-transparent transition-all duration-500 opacity-0 group-hover:opacity-100 z-0" />
              
              <CardHeader className="relative z-10">
                <div className="flex justify-between items-start">
                  <CardTitle className="capitalize text-2xl text-white group-hover:text-primary transition-colors">
                    {lottery}
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <Database className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
                <CardDescription>
                  {count > 0 ? `${formatNumber(count)} sorteos registrados` : "Sin datos históricos"}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                
                {count > 0 && info?.oldest && info?.newest ? (
                  <div className="space-y-2 text-sm text-muted-foreground bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between">
                      <span>Desde:</span>
                      <span className="text-white font-mono">{info.oldest}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hasta:</span>
                      <span className="text-white font-mono">{info.newest}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-destructive/20 text-destructive-foreground p-4 rounded-xl text-sm border border-destructive/30">
                    Requiere carga de datos CSV en el módulo de administración.
                  </div>
                )}

                <div className="pt-4 grid grid-cols-2 gap-3">
                  <Link href={`/${lottery}/prediccion`} className="w-full">
                    <Button variant="glow" className="w-full h-11" disabled={count < 50}>
                      <Dices className="w-4 h-4 mr-2" />
                      Predecir
                    </Button>
                  </Link>
                  <Link href={`/${lottery}/frecuencias`} className="w-full">
                    <Button variant="outline" className="w-full h-11" disabled={count === 0}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Análisis
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Jackpot Cycle Panel */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <Flame className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Ciclo del Jackpot</h2>
            <p className="text-sm text-muted-foreground">Tensión acumulada hacia el próximo premio mayor</p>
          </div>
          <Link href="/jackpots" className="ml-auto">
            <Button variant="outline" size="sm" className="text-xs border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
              <Trophy className="w-3 h-3 mr-1" />
              Ver análisis completo
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {lotteries.map((lottery) => (
            <Card key={lottery} className="border-yellow-500/20 bg-yellow-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="capitalize text-lg text-white">{LOTTERY_NAMES[lottery]}</CardTitle>
                  <Trophy className="w-4 h-4 text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <JackpotCycleCard tipo={lottery} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
