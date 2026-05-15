export function pickVoteDeadlineFromRow(row: unknown): string | null {
  if (!row || typeof row !== "object") {
    return null;
  }

  const raw = (row as { vote_deadline?: unknown }).vote_deadline;

  return typeof raw === "string" ? raw : null;
}

export function pickEventIdFromRow(row: unknown): string | null {
  if (!row || typeof row !== "object") {
    return null;
  }

  const raw = (row as { id?: unknown }).id;

  return typeof raw === "string" ? raw : null;
}
