import { useToast as useShadcnToast } from "@/components/ui/use-toast";

// Wrapper around the existing toaster if needed, 
// but we'll use a simpler custom implementation since we are generating all files.
import { useState, useEffect } from "react";

type ToastProps = {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
};

let toastCount = 0;

export function useToast() {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);

  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    const id = toastCount++;
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  return { toast, toasts };
}
