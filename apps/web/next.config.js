/**
 * @type {import('next').NextConfig}
 */

module.exports = {
  experimental: {
    optimizeCss: true,
    // allows importing typescript files from outside of web (e. g. from shared)
    externalDir: true,
  },
};
