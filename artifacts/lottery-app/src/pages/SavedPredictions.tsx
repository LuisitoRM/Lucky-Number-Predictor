import React from "react";
import {
  useGetSavedPredictions,
  useDeleteSavedPrediction,
  useComparePrediction,
  type LoteryType,
  type SavedPrediction,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LotteryBall } from "@/components/LotteryBall";
import {
  Bookmark,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Dices,
  Trophy,
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const LOTTERY_LABELS: Record<string, string> = {
  baloto: "Baloto",
  revancha: "Revancha",
  powerball: "Powerball",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function AciertosBadge({ aciertos, especial }: { aciertos: number; especial: boolean }) {
  const total = aciertos + (especial ? 1 : 0);
  const color =
    total >= 5
      ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
      : total >= 4
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
      : total >= 3
      ? "text-blue-400 bg-blue-400/10 border-blue-400/30"
      : "text-muted-foreground bg-white/5 border-white/10";

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold", color)}>
      {total >= 5 ? <Trophy className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
      {aciertos} principal{aciertos !== 1 ? "es" : ""}
      {especial && " + especial"}
    </span>
  );
}

function PredictionCard({
  pred,
  tipo,
  onDelete,
  onCompare,
  isDeleting,
  isComparing,
  compareError,
}: {
  pred: SavedPrediction;
  tipo: LoteryType;
  onDelete: () => void;
  onCompare: () => void;
  isDeleting: boolean;
  isComparing: boolean;
  compareError?: string | null;
}) {
  const nums = [pred.n1, pred.n2, pred.n3, pred.n4, pred.n5];
  const hasResult = pred.aciertos !== null;

  return (
    <Card className="bg-white/[0.02] border-white/10 hover:border-white/20 transition-colors">
      <CardContent className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">
              Generada el {formatDate(pred.fechaGeneracion)}
            </p>
            <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">
              {pred.metodologia}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-red-400 shrink-0"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="w-3 h-3 border border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>

        {/* Balls */}
        <div className="flex flex-wrap gap-2 items-center">
          {nums.map((n, i) => (
            <LotteryBall key={i} number={n} type="main" lottery={tipo} delay={0} />
          ))}
          <div className="w-px h-8 bg-white/10 mx-1" />
          <LotteryBall number={pred.especial} type="special" lottery={tipo} delay={0} />
          <span className="text-xs text-muted-foreground ml-1">Σ {pred.suma}</span>
        </div>

        {/* Comparison result */}
        {hasResult ? (
          <div className="pt-2 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Sorteo del{" "}
                <span className="text-white font-medium">{pred.fechaSorteo}</span>
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground/50 hover:text-primary shrink-0"
                title="Recomparar con sorteo posterior"
                onClick={onCompare}
                disabled={isComparing}
              >
                {isComparing ? (
                  <div className="w-3 h-3 border border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AciertosBadge aciertos={pred.aciertos!} especial={pred.aciertosEspecial ?? false} />
              {pred.premio && pred.premio !== "Sin premio" && (
                <span className="text-xs font-semibold text-yellow-400">{pred.premio}</span>
              )}
              {pred.premio === "Sin premio" && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Sin premio
                </span>
              )}
            </div>
            {compareError && (
              <p className="text-[11px] text-amber-400/90 flex items-start gap-1.5 leading-tight">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {compareError}
              </p>
            )}
          </div>
        ) : (
          <div className="pt-2 border-t border-white/5 space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-primary/30 text-primary hover:bg-primary/10"
              onClick={onCompare}
              disabled={isComparing}
            >
              {isComparing ? (
                <><div className="w-3.5 h-3.5 border border-primary/30 border-t-primary rounded-full animate-spin mr-2" />Comparando...</>
              ) : (
                <><RefreshCw className="w-3.5 h-3.5 mr-2" />Comparar con sorteo posterior</>
              )}
            </Button>
            {compareError && (
              <p className="text-[11px] text-amber-400/90 flex items-start gap-1.5 leading-tight">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {compareError}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LotterySection({ tipo }: { tipo: LoteryType }) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useGetSavedPredictions(tipo);
  const deleteMutation = useDeleteSavedPrediction();
  const compareMutation = useComparePrediction();
  const [compareErrors, setCompareErrors] = React.useState<Record<number, string>>({});

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [`/api/saved/${tipo}`] });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
        Cargando...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 text-destructive text-sm p-4 bg-destructive/10 rounded-xl border border-destructive/30">
        <AlertCircle className="w-4 h-4 shrink-0" />
        Error al cargar las predicciones.
      </div>
    );
  }

  const predictions = data?.predictions ?? [];

  const handleCompare = (id: number) => {
    setCompareErrors((prev) => ({ ...prev, [id]: "" }));
    compareMutation.mutate(
      { id },
      {
        onSuccess: invalidate,
        onError: (err: unknown) => {
          const msg =
            (err as { data?: { error?: string } })?.data?.error ??
            "No hay sorteo posterior registrado. Carga el resultado del próximo sorteo primero.";
          setCompareErrors((prev) => ({ ...prev, [id]: msg }));
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white capitalize flex items-center gap-2">
          <span className={cn(
            "inline-block w-2 h-2 rounded-full",
            tipo === "powerball" ? "bg-red-500" : "bg-amber-400"
          )} />
          {LOTTERY_LABELS[tipo]}
          <span className="text-sm font-normal text-muted-foreground">
            ({predictions.length}/3)
          </span>
        </h2>
        <Link href={`/${tipo}/prediccion`}>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary text-xs">
            <Dices className="w-3.5 h-3.5 mr-1.5" />
            Generar nueva
          </Button>
        </Link>
      </div>

      {predictions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border border-dashed border-white/10 rounded-2xl">
          <Bookmark className="w-8 h-8 mb-3 opacity-30" />
          <p className="text-sm">No hay predicciones guardadas para {LOTTERY_LABELS[tipo]}</p>
          <Link href={`/${tipo}/prediccion`}>
            <Button variant="link" size="sm" className="mt-2 text-primary text-xs">
              Generar y guardar una combinación
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictions.map((pred) => (
            <PredictionCard
              key={pred.id}
              pred={pred}
              tipo={tipo}
              isDeleting={deleteMutation.isPending && deleteMutation.variables?.id === pred.id}
              isComparing={compareMutation.isPending && compareMutation.variables?.id === pred.id}
              compareError={compareErrors[pred.id]}
              onDelete={() =>
                deleteMutation.mutate({ id: pred.id }, { onSuccess: invalidate })
              }
              onCompare={() => handleCompare(pred.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SavedPredictionsPage() {
  return (
    <div className="space-y-10 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
          <Bookmark className="w-3.5 h-3.5" />
          Seguimiento de Predicciones
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Predicciones Guardadas
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Guarda hasta 3 combinaciones por lotería y compáralas con el último sorteo registrado para evaluar el rendimiento del motor.
        </p>
      </div>

      <div className="space-y-10">
        {(["baloto", "revancha", "powerball"] as LoteryType[]).map((tipo) => (
          <LotterySection key={tipo} tipo={tipo} />
        ))}
      </div>
    </div>
  );
}
