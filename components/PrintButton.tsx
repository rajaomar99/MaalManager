"use client";

import { Button } from "@/components/ui/button";
import { Download, MessageCircle } from "lucide-react";

interface ShareButtonsProps {
  products: {
    name: string;
    currentStock: number;
    minStock: number;
    unit: string;
    reorderQty: number;
  }[];
}

export function ShareButtons({ products }: ShareButtonsProps) {
  function buildText() {
    const lines = products.map(
      (p) =>
        `• ${p.name}: ${p.currentStock}/${p.minStock} ${p.unit}s — reorder ${p.reorderQty}`
    );
    return `Low Stock Alerts (${products.length} items):\n${lines.join("\n")}`;
  }

  function handleDownload() {
    const text = buildText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "low-stock-alerts.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(buildText());
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="lg" className="gap-2" onClick={handleDownload}>
        <Download className="h-4 w-4" />
        Download
      </Button>
      <Button variant="outline" size="lg" className="gap-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950/40" onClick={handleWhatsApp}>
        <MessageCircle className="h-4 w-4" />
        Share on WhatsApp
      </Button>
    </div>
  );
}
