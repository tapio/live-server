module.exports = {
  env: {
    browser: true,
    node: true,
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: `module`,
  },
  extends: ["eslint:recommended"],
  rules: {
    "no-undef": "off",
    "no-console": "off",
  },
};
