/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // We switched from 'tailwindcss' to '@tailwindcss/postcss'
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};

export default config;