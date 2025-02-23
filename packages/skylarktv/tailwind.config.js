// The Tailwind config is used in app or package directories so we can safely ignore this error
// eslint-disable-next-line import/no-extraneous-dependencies
const plugin = require("tailwindcss/plugin");
// eslint-disable-next-line import/no-extraneous-dependencies
const forms = require("@tailwindcss/forms");
// eslint-disable-next-line import/no-extraneous-dependencies
const aspectRatio = require("@tailwindcss/aspect-ratio");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        sub1: ["16px", "20px"],
        sub2: ["13px", "20px"],
        sub3: ["12px", "20px"],
        ol1: ["11px", "11px"],
        ol2: ["10px", "10px"],
      },
      colors: {
        skylark: {
          blue: "#226DFF",
          darkblue: "#2165EE",
          black: "#0E1825",
          orange: "#ff6c51",
        },
        skylarktv: {
          primary: "var(--skylarktv-primary-color)",
          accent: "var(--skylarktv-accent-color)",
          header: "var(--skylarktv-header-color)",
          purple: {
            50: "#EDE8F9",
            100: "#D0C7F0",
            300: "#917CDE",
            400: "#7760D6",
            500: "#5B45CE",
            700: "#4138BE",
          },
          pink: {
            400: "#FF7E96",
            500: "#FF385C",
            600: "#D82646",
          },
        },
        gray: {
          50: "#F7F7FC",
          100: "#F3F3FB",
          200: "#E9E9EF",
          300: "#D8D8E1",
          400: "#B4B4BD",
          500: "#95949D",
          600: "#6E6C74",
          800: "#3C3A41",
          900: "#1B1A20",
        },
        button: {
          secondary: "rgba(104, 108, 119, 0.65)",
          tertiary: "rgba(27, 26, 32, 0.25)",
        },
      },
      fontFamily: {
        display: "Figtree",
        body: "Figtree",
        "skylark-branding": "Inter",
      },
      spacing: {
        gutter: "0.5rem",
        "sm-gutter": "1rem",
        "md-gutter": "3rem",
        "lg-gutter": "5rem",
        "xl-gutter": "7rem",
        "mobile-header": "3.5rem",
      },
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      minWidth: (theme) => ({
        ...theme("spacing"),
      }),
      maxWidth: (theme) => ({
        ...theme("spacing"),
      }),
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [
    forms,
    aspectRatio,
    // eslint-disable-next-line import/no-extraneous-dependencies, global-require
    require("@tailwindcss/typography"),
    plugin(({ addUtilities }) => {
      addUtilities({
        ".hide-scrollbar": {
          /* IE and Edge */
          "-ms-overflow-style": "none",

          /* Firefox */
          "scrollbar-width": "none",

          /* Safari and Chrome */
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        ".bg-page-gradient": {
          "background-color": "var(--tw-gradient-to)",
          "background-image":
            "radial-gradient(circle 50vw at 50% -20vw, var(--tw-gradient-from), var(--tw-gradient-to))",
          "background-size": "100% 100%",
          "background-repeat": "no-repeat",
        },
      });
    }),
  ],
};
