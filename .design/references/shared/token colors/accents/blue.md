/* tailwind.config.js v4 generated from Kigen.design */
/* Add to your CSS file */
:root {
  --dodger-blue-50: 0.958 0.020 267.3;
  --dodger-blue-100: 0.895 0.051 268.1;
  --dodger-blue-200: 0.803 0.099 264.6;
  --dodger-blue-300: 0.717 0.147 259.9;
  --dodger-blue-400: 0.638 0.198 253.3;
  --dodger-blue-500: 0.585 0.182 253.3;
  --dodger-blue-600: 0.509 0.159 253.4;
  --dodger-blue-700: 0.425 0.131 253.1;
  --dodger-blue-800: 0.331 0.104 253.7;
  --dodger-blue-900: 0.232 0.073 253.5;
  --dodger-blue-950: 0.178 0.055 252.8;
}
        
/* tailwind.config.js */
module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
      theme: {
        extend: {
          colors: {
            'dodger-blue': {
                50: 'oklch(var(--dodger-blue-50) / <alpha-value>)',
                100: 'oklch(var(--dodger-blue-100) / <alpha-value>)',
                200: 'oklch(var(--dodger-blue-200) / <alpha-value>)',
                300: 'oklch(var(--dodger-blue-300) / <alpha-value>)',
                400: 'oklch(var(--dodger-blue-400) / <alpha-value>)',
                500: 'oklch(var(--dodger-blue-500) / <alpha-value>)',
                600: 'oklch(var(--dodger-blue-600) / <alpha-value>)',
                700: 'oklch(var(--dodger-blue-700) / <alpha-value>)',
                800: 'oklch(var(--dodger-blue-800) / <alpha-value>)',
                900: 'oklch(var(--dodger-blue-900) / <alpha-value>)',
                950: 'oklch(var(--dodger-blue-950) / <alpha-value>)',
            }
          }
        }
      },
  plugins: [],
};