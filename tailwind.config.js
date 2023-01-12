const Color = require('color');
const defaultTheme = require('tailwindcss/defaultTheme');
const typography = require('@tailwindcss/typography');

const TINTS = {
  100: 0.9,
  200: 0.75,
  300: 0.6,
  400: 0.3,
};

const SHADES = {
  600: 0.9,
  700: 0.6,
  800: 0.45,
  900: 0.3,
};

function tint(color, intensity) {
  const r = Math.round(color.red() + (255 - color.red()) * intensity),
    g = Math.round(color.green() + (255 - color.green()) * intensity),
    b = Math.round(color.blue() + (255 - color.blue()) * intensity);
  return Color([r, g, b]);
}

function shade(color, intensity) {
  const r = Math.round(color.red() * intensity),
    g = Math.round(color.green() * intensity),
    b = Math.round(color.blue() * intensity);
  return Color([r, g, b]);
}

function mix(color1, color2, weight) {
  return Color(color1).mix(Color(color2), weight);
}

function generateColors(colorHex) {
  const color = Color(colorHex);

  const colors = {
    100: '',
    200: '',
    300: '',
    400: '',
    500: color.hex(),
    600: '',
    700: '',
    800: '',
    900: '',
  };

  for (const t in TINTS) {
    colors[t] = tint(color, TINTS[t]).hex();
  }

  for (const s in SHADES) {
    colors[s] = shade(color, SHADES[s]).hex();
  }

  return colors;
}

module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx,md}',
    './docs/**/*.{vue,ts,md}',
    '../../packages/components/src/**/*.{vue,js,ts,jsx,tsx,md}',
  ],
  theme: {
    fontFamily: {
      sans: ['"Open Sans"', ...defaultTheme.fontFamily.sans],
      serif: ['Merriweather', ...defaultTheme.fontFamily.serif],
    },
    extend: {
      colors: {
        transparent: 'transparent',
        inherit: 'inherit',
        current: 'currentColor',
        black: mix('#000000', mix('#FF6666', '#005CB9', 0.5).hex(), 0.2).hex(),
        white: '#ffffff',
        gray: generateColors('#666'),
        cyan: generateColors('#00A0AE'),
        orange: generateColors('#F58220'),
        red: generateColors('#FF6666'),
        green: generateColors('#66AD83'),
        blue: generateColors('#005CB9'),
        marine: generateColors('#99CCCC'),
        tangerine: generateColors('#FCB040'),
        fog: generateColors('#E7E8EA'),
        purple: generateColors(mix('#FF6666', '#005CB9', 0.5).hex()),
      },
      height: {
        'screen-50': '50vh',
        '(screen-16)': 'calc(100vh - 4rem)',
      },
    },
  },
  plugins: [typography()],
};
