"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type CopyInviteLinkButtonProps = {
  url: string;
};

export function CopyInviteLinkButton({ url }: CopyInviteLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      className="w-full"
      onClick={() => void copy()}
      type="button"
      variant="secondary"
    >
      {copied ? (
        <>
          <Check className="size-4 text-orange-600" />
          복사했어요
        </>
      ) : (
        <>
          <Link2 className="size-4" />
          링크 복사
        </>
      )}
    </Button>
  );
}
