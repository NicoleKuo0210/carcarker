// tailwind.config.js
export const content = [
    './myplant/src/app/**/*.{js,ts,jsx,tsx}', // for app directory
    './myplant/src/component/**/*.{js,ts,jsx,tsx}', // for pages directory
];
export const theme = {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
};
export const plugins = [];
