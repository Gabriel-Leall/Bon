/* tailwind.config.js v4 generated from Kigen.design */
/* Add to your CSS file */
:root {
  --alabaster-50: 0.982 0.002 247.8;
  --alabaster-100: 0.960 0.003 247.9;
  --alabaster-200: 0.895 0.010 252.8;
  --alabaster-300: 0.819 0.018 248.0;
  --alabaster-400: 0.735 0.026 248.2;
  --alabaster-500: 0.644 0.022 245.8;
  --alabaster-600: 0.547 0.020 248.2;
  --alabaster-700: 0.449 0.015 244.5;
  --alabaster-800: 0.345 0.012 243.2;
  --alabaster-900: 0.236 0.008 240.2;
  --alabaster-950: 0.176 0.005 248.1;
}
        
/* tailwind.config.js */
module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
      theme: {
        extend: {
          colors: {
            'alabaster': {
                50: 'oklch(var(--alabaster-50) / <alpha-value>)',
                100: 'oklch(var(--alabaster-100) / <alpha-value>)',
                200: 'oklch(var(--alabaster-200) / <alpha-value>)',
                300: 'oklch(var(--alabaster-300) / <alpha-value>)',
                400: 'oklch(var(--alabaster-400) / <alpha-value>)',
                500: 'oklch(var(--alabaster-500) / <alpha-value>)',
                600: 'oklch(var(--alabaster-600) / <alpha-value>)',
                700: 'oklch(var(--alabaster-700) / <alpha-value>)',
                800: 'oklch(var(--alabaster-800) / <alpha-value>)',
                900: 'oklch(var(--alabaster-900) / <alpha-value>)',
                950: 'oklch(var(--alabaster-950) / <alpha-value>)',
            }
          }
        }
      },
  plugins: [],
};