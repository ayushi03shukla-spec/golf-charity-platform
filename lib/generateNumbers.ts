export function generateNumbers() {
  const numbers = new Set<number>();

  while (numbers.size < 6) {
    numbers.add(Math.floor(Math.random() * 49) + 1);
  }

  return Array.from(numbers).sort((a, b) => a - b);
}