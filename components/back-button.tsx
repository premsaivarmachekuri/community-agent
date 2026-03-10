"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BackButton({
  fallbackHref,
  children,
}: {
  fallbackHref: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <Button
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      size="sm"
      variant="ghost"
    >
      <ArrowLeft className="mr-1 h-3 w-3" /> {children}
    </Button>
  );
}
