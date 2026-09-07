/* tailwind.config.js v4 generated from Kigen.design */
/* Add to your CSS file */
:root {
  --woodsmoke-50: 0.958 0.000 0.0;
  --woodsmoke-100: 0.888 0.000 0.0;
  --woodsmoke-200: 0.786 0.000 0.0;
  --woodsmoke-300: 0.689 0.000 0.0;
  --woodsmoke-400: 0.603 0.000 0.0;
  --woodsmoke-500: 0.517 0.000 0.0;
  --woodsmoke-600: 0.439 0.000 0.0;
  --woodsmoke-700: 0.356 0.000 0.0;
  --woodsmoke-800: 0.281 0.000 0.0;
  --woodsmoke-900: 0.205 0.000 0.0;
  --woodsmoke-950: 0.178 0.000 0.0;
}
        
/* tailwind.config.js */
module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
      theme: {
        extend: {
          colors: {
            'woodsmoke': {
                50: 'oklch(var(--woodsmoke-50) / <alpha-value>)',
                100: 'oklch(var(--woodsmoke-100) / <alpha-value>)',
                200: 'oklch(var(--woodsmoke-200) / <alpha-value>)',
                300: 'oklch(var(--woodsmoke-300) / <alpha-value>)',
                400: 'oklch(var(--woodsmoke-400) / <alpha-value>)',
                500: 'oklch(var(--woodsmoke-500) / <alpha-value>)',
                600: 'oklch(var(--woodsmoke-600) / <alpha-value>)',
                700: 'oklch(var(--woodsmoke-700) / <alpha-value>)',
                800: 'oklch(var(--woodsmoke-800) / <alpha-value>)',
                900: 'oklch(var(--woodsmoke-900) / <alpha-value>)',
                950: 'oklch(var(--woodsmoke-950) / <alpha-value>)',
            }
          }
        }
      },
  plugins: [],
};