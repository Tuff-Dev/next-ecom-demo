"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center flex-col">
      <h2 className="text-3xl text-center">Payment Successful!</h2>
      {orderId && <p className="text-gray-500 mt-2">Order ID: {orderId}</p>}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
