/* tailwind.config.js v4 generated from Kigen.design */
/* Add to your CSS file */
:root {
  --scarlet-50: 0.960 0.020 21.4;
  --scarlet-100: 0.900 0.052 21.1;
  --scarlet-200: 0.808 0.109 22.5;
  --scarlet-300: 0.727 0.169 25.5;
  --scarlet-400: 0.651 0.236 31.5;
  --scarlet-500: 0.598 0.225 32.3;
  --scarlet-600: 0.521 0.196 32.3;
  --scarlet-700: 0.436 0.164 32.2;
  --scarlet-800: 0.340 0.128 32.3;
  --scarlet-900: 0.242 0.091 32.2;
  --scarlet-950: 0.183 0.070 31.9;
}
        
/* tailwind.config.js */
module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
      theme: {
        extend: {
          colors: {
            'scarlet': {
                50: 'oklch(var(--scarlet-50) / <alpha-value>)',
                100: 'oklch(var(--scarlet-100) / <alpha-value>)',
                200: 'oklch(var(--scarlet-200) / <alpha-value>)',
                300: 'oklch(var(--scarlet-300) / <alpha-value>)',
                400: 'oklch(var(--scarlet-400) / <alpha-value>)',
                500: 'oklch(var(--scarlet-500) / <alpha-value>)',
                600: 'oklch(var(--scarlet-600) / <alpha-value>)',
                700: 'oklch(var(--scarlet-700) / <alpha-value>)',
                800: 'oklch(var(--scarlet-800) / <alpha-value>)',
                900: 'oklch(var(--scarlet-900) / <alpha-value>)',
                950: 'oklch(var(--scarlet-950) / <alpha-value>)',
            }
          }
        }
      },
  plugins: [],
};