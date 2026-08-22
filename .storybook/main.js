const config = {
  stories: ['../src/design-system/**/*.stories.js'],
  framework: {
    name: '@storybook/html-vite',
    options: {}
  },
  addons: ['@storybook/addon-a11y'],
  staticDirs: ['../src/assets']
};

export default config;
