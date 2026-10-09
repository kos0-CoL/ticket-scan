import type { Config } from 'tailwindcss';
import { getTailwindColors, designTokens } from '@ticketscan/ui/src/palette';

const colors = getTailwindColors();

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ...colors,
        background: '#FFFFFF',
        surface: '#F8FAFC',
      },
      spacing: designTokens.spacing,
      borderRadius: designTokens.borderRadius,
      boxShadow: designTokens.boxShadow,
      transitionDuration: designTokens.transitionDuration,
      transitionTimingFunction: designTokens.transitionTiming,
      zIndex: designTokens.zIndex,
      fontFamily: designTokens.fontFamily,
    },
  },
  plugins: [],
};

export default config;
