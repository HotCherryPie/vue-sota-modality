import { base } from './eslint.config.base.js';

const toolingFiles = ['*.config.*'];
const browserFiles = ['src/**/*.*'];

export default base(
  {
    tooling: toolingFiles,
    browser: browserFiles,
  },
  [
    {
      name: 'omg-eslint-please-work',
      files: ['**/*.vue'],
      rules: {
        // TODO: remove after fix
        'vue/define-props-destructuring': 'off',
      },
    },
  ],
);
