import Color from 'color';

export function step(color: Color, step: number, times: number) {
  const hue = color.hue(),
    saturation = color.saturationl(),
    lightness = color.lightness();

  return Color.hsl(hue, saturation, lightness + step * times);
}

export function mix(color1: Color, color2: Color, weight: number) {
  return color1.mix(color2, weight);
}

export const white = Color('#FFFFFF');
export const gray = Color('#666');
export const cyan = Color('#00A0AE');
export const orange = Color('#F58220');
export const red = Color('#FF6666');
export const green = Color('#66AD83');
export const blue = Color('#005CB9');
export const marine = Color('#99CCCC');
export const tangerine = Color('#FCB040');
export const fog = Color('#E7E8EA');
export const purple = mix(Color('#FF6666'), Color('#005CB9'), 0.5);
export const black = mix(Color('#000000'), purple, 0.2);

export const colors = {
  white,
  gray,
  cyan,
  orange,
  red,
  green,
  blue,
  marine,
  tangerine,
  fog,
  purple,
  black,
} as { [index: string]: Color };

const colorKeys = [
  'white',
  'gray',
  'cyan',
  'orange',
  'red',
  'green',
  'blue',
  'marine',
  'tangerine',
  'fog',
  'purple',
  'black',
] as const;

export type ColorKey = typeof colorKeys;
