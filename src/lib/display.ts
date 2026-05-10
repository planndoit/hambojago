export function firstDisplayCharacter(text: string) {
  const trimmed = text.trim();

  if (!trimmed) {
    return "?";
  }

  const segmenter = new Intl.Segmenter("ko", { granularity: "grapheme" });
  const first = [...segmenter.segment(trimmed)][0]?.segment;

  return first ? first.toUpperCase() : "?";
}
