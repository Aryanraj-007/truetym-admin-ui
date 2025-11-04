const path = require('path');

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames.map((f) => path.relative(process.cwd(), f)).join(' --file ')}`;

module.exports = {
  // '**/*.{js,jsx,ts,tsx}': [
  //   buildEslintCommand,
  //   // (filenames) => {
  //   //   const files = filenames.map((f) => path.relative(process.cwd(), f)).join(' ');
  //   //   return `jest --bail --findRelatedTests --passWithNoTests --coverage ${files}`;
  //   // },
  // ],
  '**/*.{js,jsx,ts,tsx}': [buildEslintCommand, 'prettier --cache --write'],
  '**/*.{json,css,md}': ['prettier --cache --write'],
};
