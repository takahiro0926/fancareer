import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cw: {
          bg: '#FAF6EF',
          surface: '#FFFFFF',
          ink: '#24303A',
          muted: '#6B7280',
          border: '#E3DCCF',
          teal: '#2F7A6B',
          'teal-light': '#4F9686',
          'teal-soft': '#EFF7F5',
          orange: '#E8734A',
          'orange-dark': '#C1552E',
          'orange-soft': '#FDEEE7',
          navy: '#1F2A33',
          'navy-soft': '#9CA9B2',
        },
      },
      fontFamily: {
        heading: ['"Zen Maru Gothic"', 'sans-serif'],
        body: ['"BIZ UDPGothic"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
