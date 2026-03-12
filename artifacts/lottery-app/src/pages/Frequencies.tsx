import React, { useMemo } from "react";
import { useGetFrequencies, type LoteryType } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { LineChart, BarChart2, Hash, PieChart } from "lucide-react";

export default function FrequenciesPage({ tipo }: { tipo: string }) {
  const validTipo = tipo as LoteryType;
  const { data, isLoading, isError } = useGetFrequencies(validTipo);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return <div className="text-center text-destructive mt-20">Error cargando frecuencias o datos insuficientes.</div>;
  }

  // Sort top 15 hot numbers
  const hotNumbers = [...data.mainNumbers].sort((a, b) => b.count - a.count).slice(0, 15);
  // Sort top 10 special balls
  const specialBalls = [...data.specialBall].sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-3xl font-extrabold text-white capitalize flex items-center gap-3">
          <LineChart className="text-accent w-8 h-8" />
          Análisis Estadístico: {tipo}
        </h1>
        <p className="text-muted-foreground mt-2">
          Basado en {data.totalDraws} sorteos históricos procesados.
        </p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Rango Óptimo Suma</p>
                <h4 className="text-2xl font-bold text-white">{data.sumStats.validRangeMin} - {data.sumStats.validRangeMax}</h4>
              </div>
              <Hash className="text-primary w-5 h-5 opacity-50" />
            </div>
            <p className="text-xs text-primary mt-2">Contiene el {data.sumStats.validRangePercent}% de ganadores</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Suma Promedio</p>
                <h4 className="text-2xl font-bold text-white">{data.sumStats.avg.toFixed(1)}</h4>
              </div>
              <BarChart2 className="text-accent w-5 h-5 opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Max histórica: {data.sumStats.max}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 md:col-span-2">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-3">Distribución Par / Impar</p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-primary font-medium">Pares ({data.evenOddRatio.even}%)</span>
                  <span className="text-accent font-medium">Impares ({data.evenOddRatio.odd}%)</span>
                </div>
                <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden flex">
                  <div className="h-full bg-primary" style={{ width: `${data.evenOddRatio.even}%` }} />
                  <div className="h-full bg-accent" style={{ width: `${data.evenOddRatio.odd}%` }} />
                </div>
              </div>
              <PieChart className="text-muted-foreground w-8 h-8 opacity-30 shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <Card className="col-span-1 border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Top 15 Números Principales (Calientes)</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hotNumbers} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="number" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#06b6d4' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {hotNumbers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(188, 86%, ${Math.max(30, 70 - index * 2)}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Top Especiales ({tipo === 'baloto' ? 'SB' : tipo === 'revancha' ? 'RSB' : 'PB'})</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={specialBalls} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="number" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#e11d48' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {specialBalls.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(359, 87%, ${Math.max(40, 75 - index * 3)}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
