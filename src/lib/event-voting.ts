export function isVotingClosed(voteDeadline: string | null): boolean {
  if (!voteDeadline) {
    return false;
  }

  return Date.now() >= new Date(voteDeadline).getTime();
}
