module.exports = {
  globDirectory: "public/",
  globPatterns: ["**/*.{png,html,css}"],
  swDest: "public/sw.js",
  runtimeCaching: [
    {
      urlPattern: /\/$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "my-cache-index",
      },
    },
  ],
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
};
