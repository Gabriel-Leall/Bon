/* tailwind.config.js v4 generated from Kigen.design */
/* Add to your CSS file */
:root {
  --dull-lavender-50: 0.957 0.014 299.8;
  --dull-lavender-100: 0.907 0.032 299.6;
  --dull-lavender-200: 0.830 0.060 300.3;
  --dull-lavender-300: 0.761 0.086 300.7;
  --dull-lavender-400: 0.696 0.111 300.1;
  --dull-lavender-500: 0.639 0.134 300.3;
  --dull-lavender-600: 0.560 0.161 300.5;
  --dull-lavender-700: 0.465 0.148 300.4;
  --dull-lavender-800: 0.358 0.115 300.0;
  --dull-lavender-900: 0.246 0.079 299.9;
  --dull-lavender-950: 0.183 0.059 300.6;
}
        
/* tailwind.config.js */
module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
      theme: {
        extend: {
          colors: {
            'dull-lavender': {
                50: 'oklch(var(--dull-lavender-50) / <alpha-value>)',
                100: 'oklch(var(--dull-lavender-100) / <alpha-value>)',
                200: 'oklch(var(--dull-lavender-200) / <alpha-value>)',
                300: 'oklch(var(--dull-lavender-300) / <alpha-value>)',
                400: 'oklch(var(--dull-lavender-400) / <alpha-value>)',
                500: 'oklch(var(--dull-lavender-500) / <alpha-value>)',
                600: 'oklch(var(--dull-lavender-600) / <alpha-value>)',
                700: 'oklch(var(--dull-lavender-700) / <alpha-value>)',
                800: 'oklch(var(--dull-lavender-800) / <alpha-value>)',
                900: 'oklch(var(--dull-lavender-900) / <alpha-value>)',
                950: 'oklch(var(--dull-lavender-950) / <alpha-value>)',
            }
          }
        }
      },
  plugins: [],
};