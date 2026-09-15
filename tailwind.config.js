/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],

  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: {
        back: "#E8F3FC",
        white: "#FFFFFF",
        primary: "#18335E",
        secondary: "#73C0FF",
        gray: {
          100: "#C7CED3",
          300: "#A2AAB0",
        },
      },
      fontFamily: {
        maru: ["Mulmaru"],
      },
    },
  },

  plugins: [],
};
