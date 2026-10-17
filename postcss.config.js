export default {
  plugins: {
    // Tailwind 4 (issue #9): the plugin moved out of `tailwindcss`, and
    // Lightning CSS handles prefixing, so autoprefixer is gone too.
    '@tailwindcss/postcss': {},
  },
};
