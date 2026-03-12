import React, { useRef, useState } from "react";
import { useUploadCsv, useGetStatus, type LoteryType } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, UploadCloud, CheckCircle, FileText, AlertCircle } from "lucide-react";

export default function AdminPage() {
  const { data: statusData, refetch } = useGetStatus();
  const { mutateAsync: uploadCsv, isPending } = useUploadCsv();
  
  const [selectedLottery, setSelectedLottery] = useState<LoteryType>('baloto');
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{message: string, inserted: number, type: 'success'|'error'} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const res = await uploadCsv({ tipo: selectedLottery, data: { file } });
      setUploadResult({
        type: 'success',
        message: res.message,
        inserted: res.inserted
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      refetch(); // refresh status
    } catch (err: any) {
      setUploadResult({
        type: 'error',
        message: err?.data?.error || "Error al subir el archivo",
        inserted: 0
      });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Database className="text-primary w-8 h-8" />
          Gestión de Datos
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Ingesta masiva de resultados históricos. Sube archivos CSV con el formato requerido para actualizar el motor de predicción.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Form */}
        <Card className="lg:col-span-2 border-white/10 bg-card/60">
          <CardHeader>
            <CardTitle>Cargar Historial CSV</CardTitle>
            <CardDescription>
              El archivo debe contener cabeceras. Los duplicados serán ignorados automáticamente por fecha.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="flex gap-4">
              {(['baloto', 'revancha', 'powerball'] as LoteryType[]).map((l) => (
                <button
                  key={l}
                  onClick={() => { setSelectedLottery(l); setUploadResult(null); }}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium capitalize transition-all ${
                    selectedLottery === l 
                      ? 'bg-primary/20 border-primary text-primary' 
                      : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <div 
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                file ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
              }`}
            >
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              
              {!file ? (
                <div className="flex flex-col items-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-white font-medium mb-1">Click para seleccionar archivo</p>
                  <p className="text-xs text-muted-foreground">Solo formato .CSV soportado</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FileText className="w-12 h-12 text-primary mb-4" />
                  <p className="text-white font-medium mb-1">{file.name}</p>
                  <p className="text-xs text-muted-foreground mb-4">{(file.size / 1024).toFixed(2)} KB</p>
                  <Button variant="outline" size="sm" onClick={() => { setFile(null); if(fileInputRef.current) fileInputRef.current.value=""; }}>
                    Cambiar archivo
                  </Button>
                </div>
              )}
            </div>

            <Button 
              className="w-full" 
              size="lg" 
              variant="glow"
              disabled={!file || isPending}
              onClick={handleUpload}
            >
              {isPending ? "Procesando e insertando..." : "Subir e Ingestar Datos"}
            </Button>

            {uploadResult && (
              <div className={`p-4 rounded-xl flex items-start gap-3 border ${
                uploadResult.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-destructive/10 border-destructive/20 text-destructive-foreground'
              }`}>
                {uploadResult.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" /> : <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />}
                <div>
                  <p className="font-medium">{uploadResult.type === 'success' ? 'Éxito' : 'Error'}</p>
                  <p className="text-sm opacity-90">{uploadResult.message}</p>
                  {uploadResult.type === 'success' && uploadResult.inserted > 0 && (
                    <p className="text-xs mt-1 font-mono">+{uploadResult.inserted} nuevos registros</p>
                  )}
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Status Sidebar */}
        <Card className="border-white/10 bg-card/60">
          <CardHeader>
            <CardTitle className="text-lg">Estado Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {statusData?.lotteries.map((l) => (
                <div key={l.tipo} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="capitalize text-white font-medium">{l.tipo}</span>
                    <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{l.count} regs</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-muted-foreground/50 rounded-full" style={{ width: Math.min(100, (l.count / 2000) * 100) + '%' }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
