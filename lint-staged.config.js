module.exports = {
  'apps/**/*.{ts,tsx,html}': ['prettier --write', 'eslint --fix'],
  'libs/**/*.{ts,tsx,html}': ['prettier --write', 'eslint --fix'],
};
