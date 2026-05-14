"use client";

import { useFormStatus } from "react-dom";

import { PendingOverlay } from "@/components/pending-overlay";

export function FormStatusOverlay() {
  const { pending } = useFormStatus();

  return <PendingOverlay show={pending} />;
}
