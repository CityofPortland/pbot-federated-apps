import { describe, expect, test } from '@jest/globals';
import { green, red, step } from '../src/colors';

describe('colors module', () => {
  test('step modifies lightness', () => {
    const lightness = red.lightness();
    const stepColor = step(red, 8, 1);
    expect(stepColor.lightness() == lightness + 8);
  });
  test('step 0 times is same color', () => {
    expect(green.lightness() == step(green, 8, 0).lightness());
  });
});
