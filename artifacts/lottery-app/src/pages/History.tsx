import React, { useState } from "react";
import { useGetHistory, type LoteryType } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, History as HistoryIcon } from "lucide-react";

export default function HistoryPage({ tipo }: { tipo: string }) {
  const validTipo = tipo as LoteryType;
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data, isLoading, isError } = useGetHistory(validTipo, { page, limit });

  const specialName = tipo === 'baloto' ? 'SB' : tipo === 'revancha' ? 'RSB' : 'PB';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white capitalize flex items-center gap-3">
            <HistoryIcon className="text-primary w-8 h-8" />
            Historial {tipo}
          </h1>
          <p className="text-muted-foreground mt-2">
            Registro inmutable de sorteos anteriores utilizados para el entrenamiento del modelo.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-white/5 bg-card/60 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold">Fecha Sorteo</th>
                <th className="px-6 py-4 font-semibold text-center">N1</th>
                <th className="px-6 py-4 font-semibold text-center">N2</th>
                <th className="px-6 py-4 font-semibold text-center">N3</th>
                <th className="px-6 py-4 font-semibold text-center">N4</th>
                <th className="px-6 py-4 font-semibold text-center">N5</th>
                <th className="px-6 py-4 font-semibold text-center text-primary">{specialName}</th>
                <th className="px-6 py-4 font-semibold text-right">Suma</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      Cargando registros...
                    </div>
                  </td>
                </tr>
              ) : isError || !data || data.rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                    No se encontraron registros. Por favor sube el archivo CSV.
                  </td>
                </tr>
              ) : (
                data.rows.map((row) => {
                  const suma = row.n1 + row.n2 + row.n3 + row.n4 + row.n5;
                  return (
                    <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-white/90">
                        {row.fecha}
                      </td>
                      <td className="px-6 py-4 text-center font-mono">{row.n1}</td>
                      <td className="px-6 py-4 text-center font-mono">{row.n2}</td>
                      <td className="px-6 py-4 text-center font-mono">{row.n3}</td>
                      <td className="px-6 py-4 text-center font-mono">{row.n4}</td>
                      <td className="px-6 py-4 text-center font-mono">{row.n5}</td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-primary bg-primary/5">{row.especial}</td>
                      <td className="px-6 py-4 text-right font-mono text-muted-foreground">{suma}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {data && data.total > 0 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/20">
            <span className="text-sm text-muted-foreground">
              Mostrando página <span className="font-semibold text-white">{page}</span> de <span className="font-semibold text-white">{Math.ceil(data.total / limit)}</span>
              {" "} ({data.total} total)
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(data.total / limit)}
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
