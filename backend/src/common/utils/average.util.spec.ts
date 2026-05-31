import { calculateAverage, roundToOneDecimal } from './average.util';

describe('average util', () => {
  it('returns null for empty scores', () => {
    expect(calculateAverage([])).toBeNull();
  });

  it('calculates average correctly', () => {
    expect(calculateAverage([5, 6, 7])).toBe(6);
  });

  it('rounds to one decimal', () => {
    expect(roundToOneDecimal(3.7666)).toBe(3.8);
  });
});
