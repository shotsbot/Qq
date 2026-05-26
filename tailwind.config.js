/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        slate: {
          150: "#e2e8f0", // Custom intermediate colors if any
          250: "#cbd5e1",
          450: "#94a3b8",
          550: "#64748b",
          650: "#475569",
          850: "#1e293b",
        }
      }
    },
  },
  plugins: [],
}
