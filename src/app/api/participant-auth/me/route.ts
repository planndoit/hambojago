import { NextResponse } from "next/server";

import { getCurrentParticipantAccount } from "@/lib/participant-auth";

export async function GET() {
  const account = await getCurrentParticipantAccount();

  if (!account) {
    return NextResponse.json({ account: null });
  }

  return NextResponse.json({
    account: {
      username: account.username,
      displayName: account.display_name,
      avatarUrl: account.avatar_url
    }
  });
}
