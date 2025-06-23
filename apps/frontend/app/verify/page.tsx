"use client";

import { Suspense } from "react";
import { VerifySignup } from "@/components/Verify";

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <p className="text-center mt-20">Loading verification page...</p>
      }
    >
      <VerifySignup />
    </Suspense>
  );
}
