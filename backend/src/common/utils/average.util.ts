export function calculateAverage(scores: number[]): number | null {
  if (scores.length === 0) {
    return null;
  }

  const total = scores.reduce((sum, score) => sum + score, 0);
  return total / scores.length;
}

export function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}
