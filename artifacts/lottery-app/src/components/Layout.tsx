import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Dices, 
  UploadCloud, 
  LineChart, 
  History,
  Activity,
  Bookmark,
  Trophy
} from "lucide-react";
import type { LoteryType } from "@workspace/api-client-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden selection:bg-primary/30">
      {/* Background Image / Texture */}
      <div 
        className="fixed inset-0 z-[-1] opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/tech-bg.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Sidebar */}
      <aside className="w-full md:w-72 glass-panel border-r border-white/10 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span className="font-display font-bold text-xl tracking-wide text-white">Neural<span className="text-primary">Expert</span></span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto">
          
          <div className="space-y-2">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">General</p>
            <Link 
              href="/" 
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                location === "/" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <Link 
              href="/jackpots" 
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                location === "/jackpots" ? "bg-yellow-500/10 text-yellow-400 font-medium" : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <Trophy className="w-5 h-5" />
              Análisis Jackpots
            </Link>
            <Link 
              href="/admin" 
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                location === "/admin" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <UploadCloud className="w-5 h-5" />
              Gestión de Datos
            </Link>
          </div>

          {(['baloto', 'revancha', 'powerball'] as LoteryType[]).map((lottery) => (
            <div key={lottery} className="space-y-2">
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider capitalize">
                {lottery}
              </p>
              
              <Link 
                href={`/${lottery}/prediccion`} 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  location === `/${lottery}/prediccion` ? "bg-white/10 text-white font-medium shadow-sm" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <Dices className="w-5 h-5" />
                Predicción
              </Link>
              
              <Link 
                href={`/${lottery}/frecuencias`} 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  location === `/${lottery}/frecuencias` ? "bg-white/10 text-white font-medium shadow-sm" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <LineChart className="w-5 h-5" />
                Frecuencias
              </Link>
              
              <Link 
                href={`/${lottery}/historial`} 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  location === `/${lottery}/historial` ? "bg-white/10 text-white font-medium shadow-sm" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <History className="w-5 h-5" />
                Historial
              </Link>

              <Link 
                href={`/${lottery}/jackpots`} 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  location === `/${lottery}/jackpots` ? "bg-yellow-500/10 text-yellow-400 font-medium shadow-sm" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <Trophy className="w-5 h-5" />
                Jackpots
              </Link>

              <Link 
                href={`/${lottery}/guardadas`} 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  location === `/${lottery}/guardadas` ? "bg-white/10 text-white font-medium shadow-sm" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <Bookmark className="w-5 h-5" />
                Guardadas
              </Link>
            </div>
          ))}

        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
