import React, { useState } from "react";
import { usePredict, type LoteryType } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LotteryBall } from "@/components/LotteryBall";
import { ComparisonSection } from "@/components/ComparisonSection";
import { Dices, AlertTriangle, Cpu, CheckCircle2 } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function PredictionPage({ tipo }: { tipo: string }) {
  const validTipo = tipo as LoteryType;
  
  const { mutate, isPending, data, isError, error } = usePredict();
  const [isRevealing, setIsRevealing] = useState(false);

  const handlePredict = () => {
    setIsRevealing(true);
    mutate({ tipo: validTipo }, {
      onSettled: () => {
        // Keep revealing state active to allow animations to play
        setTimeout(() => setIsRevealing(false), 2000); 
      }
    });
  };

  const specialBallName = tipo === 'baloto' ? 'Super Balota' : tipo === 'revancha' ? 'RSB' : 'Powerball';

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center p-3 mb-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
          <Cpu className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white capitalize tracking-tight">
          Motor <span className="text-gradient">{tipo}</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Generación estocástica basada en frecuencias ponderadas y filtrado Monte Carlo (10,000 iteraciones).
        </p>
      </div>

      <div className="flex justify-center">
        <Button 
          size="lg" 
          variant="glow"
          className="h-16 px-12 text-xl rounded-full"
          onClick={handlePredict}
          disabled={isPending || isRevealing}
        >
          {isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
              Ejecutando Monte Carlo...
            </>
          ) : (
            <>
              <Dices className="w-6 h-6 mr-3" />
              Generar Combinación Óptima
            </>
          )}
        </Button>
      </div>

      {isError && (
        <div className="bg-destructive/10 border border-destructive/50 text-destructive-foreground p-6 rounded-2xl flex items-center gap-4 max-w-2xl mx-auto mt-8">
          <AlertTriangle className="w-8 h-8 shrink-0" />
          <p>{(error as any)?.data?.error || "Error al generar la predicción. Verifica que exista historial suficiente."}</p>
        </div>
      )}

      <div className="min-h-[300px] flex flex-col items-center justify-center mt-12">
        <AnimatePresence mode="wait">
          {isPending ? (
             <motion.div 
               key="loading"
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.8 }}
               className="flex flex-col items-center text-primary space-y-6"
             >
               <div className="relative w-32 h-32">
                 <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                   <Dices className="w-10 h-10 animate-pulse" />
                 </div>
               </div>
               <p className="font-mono text-sm tracking-widest">ANALIZANDO MATRICES...</p>
             </motion.div>
          ) : data && (
            <motion.div 
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full space-y-12"
            >
              {/* Balls Container */}
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 bg-black/20 p-8 sm:p-12 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                
                {data.numeros.map((num, i) => (
                  <LotteryBall 
                    key={`main-${num}-${i}`} 
                    number={num} 
                    type="main" 
                    lottery={validTipo} 
                    delay={i * 0.15} 
                  />
                ))}
                
                <div className="w-px h-12 sm:h-16 bg-white/10 mx-2"></div>
                
                <LotteryBall 
                  key={`special-${data.especial}`} 
                  number={data.especial} 
                  type="special" 
                  lottery={validTipo} 
                  delay={data.numeros.length * 0.15 + 0.2} 
                />
              </div>

              {/* Stats & Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <Card className="bg-white/[0.02] border-white/5">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Suma Principal</p>
                    <p className="text-3xl font-mono font-bold text-white flex items-center gap-2">
                      {data.suma}
                      {data.sumaEnRangoValido && (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {data.sumaEnRangoValido ? "Dentro del 70% histórico" : "Fuera del rango óptimo"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/[0.02] border-white/5">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Simulaciones</p>
                    <p className="text-3xl font-mono font-bold text-primary">
                      {formatNumber(data.validSimulations)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Válidas de {formatNumber(data.totalSimulations)} iteraciones
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/[0.02] border-white/5">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Base Histórica</p>
                    <p className="text-3xl font-mono font-bold text-accent">
                      {data.basedOnDraws}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sorteos recientes analizados
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Methodology Tag */}
              <div className="text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-muted-foreground font-mono">
                  {data.metodologia}
                </span>
              </div>

              {/* Historical Comparison */}
              <ComparisonSection
                tipo={validTipo}
                predictedNumbers={data.numeros}
                predictedSpecial={data.especial}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-16 text-center border-t border-white/10 pt-8">
        <p className="text-sm text-muted-foreground/60 max-w-2xl mx-auto">
          <strong className="text-muted-foreground">Descargo de responsabilidad:</strong> Esta herramienta analiza patrones históricos para sugerir combinaciones con mayor coherencia estadística basada en frecuencias. <span className="text-white/70">No predice el resultado del sorteo.</span> La lotería es estrictamente un juego de azar independiente en cada iteración.
        </p>
      </div>

    </div>
  );
}
