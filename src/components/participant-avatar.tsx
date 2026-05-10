import Image from "next/image";

import { firstDisplayCharacter } from "@/lib/display";
import { cn } from "@/lib/utils";

type ParticipantAvatarProps = {
  name: string;
  avatarUrl: string | null;
  size?: number;
  className?: string;
};

export function ParticipantAvatar({
  name,
  avatarUrl,
  size = 36,
  className
}: ParticipantAvatarProps) {
  const initial = firstDisplayCharacter(name);

  if (avatarUrl) {
    return (
      <span
        className={cn("relative shrink-0 overflow-hidden rounded-full bg-orange-100", className)}
        style={{ width: size, height: size }}
      >
        <Image alt="" className="object-cover" fill sizes={`${size}px`} src={avatarUrl} />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-200 to-orange-300 text-sm font-black text-orange-950",
        className
      )}
      style={{ width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.38)) }}
    >
      {initial}
    </span>
  );
}
