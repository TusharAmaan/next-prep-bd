/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // We switched from 'tailwindcss' to '@tailwindcss/postcss'
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;