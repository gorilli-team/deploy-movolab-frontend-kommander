const path = require('path');

module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss')('./tailwind.config.js'),
        require('autoprefixer'),
      ],
    },
  },
  babel: {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: '>0.25%, not dead',
          corejs: 3,
          useBuiltIns: 'entry',
        },
      ],
    ],
  },
  webpack: {
    configure: (webpackConfig) => {
      const babelLoader = webpackConfig.module.rules.find(
        (rule) => rule.oneOf !== undefined
      ).oneOf.find(
        (rule) =>
          rule.loader &&
          rule.loader.includes('babel-loader')
      );

      if (babelLoader) {
        babelLoader.include = [
          ...(Array.isArray(babelLoader.include)
            ? babelLoader.include
            : [babelLoader.include]),
          path.resolve(__dirname, 'node_modules/rxjs-interop'),
        ];
      }

      return webpackConfig;
    },
  },
};
