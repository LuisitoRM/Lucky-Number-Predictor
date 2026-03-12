import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LotteryBallProps {
  number: number;
  type: "main" | "special";
  lottery: "baloto" | "revancha" | "powerball";
  delay?: number;
  animate?: boolean;
}

export function LotteryBall({ number, type, lottery, delay = 0, animate = true }: LotteryBallProps) {
  let bgClass = "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900";
  let borderClass = "border-slate-300";
  let shadowClass = "shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.3),0_10px_20px_rgba(0,0,0,0.4)]";

  if (type === "main") {
    if (lottery === "baloto") {
      bgClass = "bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-950";
      borderClass = "border-amber-400";
    } else if (lottery === "revancha") {
      bgClass = "bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-950";
      borderClass = "border-amber-400";
    } else if (lottery === "powerball") {
      bgClass = "bg-gradient-to-br from-white to-gray-200 text-black";
      borderClass = "border-gray-200";
    }
  } else {
    // Special Balls
    if (lottery === "baloto" || lottery === "revancha" || lottery === "powerball") {
      bgClass = "bg-gradient-to-br from-red-400 to-red-600 text-white";
      borderClass = "border-red-500";
      shadowClass = "shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.4),0_10px_20px_rgba(220,38,38,0.5)]";
    }
  }

  const content = (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full font-display font-bold text-xl sm:text-2xl border-2",
        "w-12 h-12 sm:w-16 sm:h-16",
        bgClass,
        borderClass,
        shadowClass
      )}
    >
      {/* Glossy highlight for 3D sphere effect */}
      <div className="absolute top-[10%] left-[15%] w-[40%] h-[30%] rounded-full bg-white/40 blur-[2px] rotate-[-45deg]" />
      
      <span className="relative z-10 drop-shadow-sm">{number}</span>
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.2, y: 50, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: delay,
      }}
      whileHover={{ scale: 1.1, y: -5 }}
    >
      {content}
    </motion.div>
  );
}
