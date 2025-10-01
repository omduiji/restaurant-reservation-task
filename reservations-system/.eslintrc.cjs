module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    'plugin:tailwindcss/recommended', // Add this line
  ],
  plugins: ['tailwindcss'], // Add this line
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'tailwindcss/no-custom-classname': 'off', // Optional: disable if you use custom classes
  },
}
