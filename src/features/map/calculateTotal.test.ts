import { calculateTotal } from './calculateTotal';

describe('calculateTotal', () => {
  test('less than 800km', () => {
    expect(calculateTotal(1, 100)).toBe(1210);
  });

  test('multiple of 800km', () => {
    expect(calculateTotal(2, 1600)).toBe(5720);
  });

  test('a little higher than 800km', () => {
    expect(calculateTotal(3, 820)).toBe(4906);
  });
});
