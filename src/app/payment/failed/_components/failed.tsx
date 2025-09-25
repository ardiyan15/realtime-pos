"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { Ban, CheckCircle } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Failed() {
  return (
    <div className="w-full flex flex-col justify-content-center items-center gap-4">
      <Ban className="size-32 text-red-500" />
      <h1 className="text-15 font-bold">Payment Failled</h1>
      <Link href="/order">
        <Button>Back To Order</Button>
      </Link>
    </div>
  );
}
