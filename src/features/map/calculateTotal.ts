export function calculateTotal(kmCost: number, distance: number) {
  const totalDays = Math.ceil(distance / 800);
  const multiplier = 1.1;
  const rawCost = kmCost * distance;
  const result = (rawCost + totalDays * 1000) * multiplier;

  return +result.toFixed(2);
}
