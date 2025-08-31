module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: [
          '.ios.js',
          '.android.js',
          '.ios.jsx',
          '.android.jsx',
          '.js',
          '.jsx',
          '.json',
          '.ts',
          '.tsx',
        ],
        root: ['.'],
        alias: {
          // This needs to be mirrored in tsconfig.json
          assets: './src/assets',
          components: './src/components',
          screens: './src/screens',
          navigations: './src/navigations',
          utils: './src/utils',
          store: './src/store',
          hooks: './src/hooks',
          api: './src/api',
        },
      },
    ],
  ],
};
