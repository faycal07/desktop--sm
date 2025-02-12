/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@material-tailwind/react/components/**/*.{js,jsx}",
    "./node_modules/@heroicons/react/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: "#f5f5dc", // Beige color
      },
    },
  },
  plugins: [],
}



