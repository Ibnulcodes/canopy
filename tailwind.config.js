module.exports = {
  content: ['./build.js', './static/**/*.{html,js}', './dist/**/*.html'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Outfit', 'Hind Siliguri', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'Hind Siliguri', 'sans-serif'],
        logo: ['Outfit', 'Hind Siliguri', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
