module.exports = {
  mode: 'jit',
  content: ['public/index.html', 'src/**/*.js', 'src/**/*.jsx'],
  theme: {
    extend: {
      colors: {
        settings: { blue: '#305597' },
        slate: {
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        gray: {
          100: '#EBF1F5',
          200: '#D9E3EA',
          300: '#C5D2DC',
          400: '#9BA9B4',
          500: '#707D86',
          600: '#55595F',
          700: '#33363A',
          800: '#25282C',
          900: '#151719',
        },
        purple: {
          100: '#F4F4FF',
          200: '#E2E1FF',
          300: '#CBCCFF',
          400: '#ABABFF',
          500: '#8D8DFF',
          600: '#5D5DFF',
          700: '#4B4ACF',
          800: '#38379C',
          900: '#262668',
        },
        blue: {
          500: '#305597',
        },
        customblue: {
          lighter: '#5c7bb5',
          darker: '#31579d',
          DEFAULT: '#004E98',
        },
        lightblue: {
          lighter: '#5c7bb5',
          darker: '#305a88',
          DEFAULT: '#3A6EA5',
        },
        darkgray: {
          DEFAULT: '#C0C0C0'
        },
        customgray: '#A6A6A6',
      },
      spacing: {
        '9/16': '56.25%',
        '3/4': '75%',
        '1/1': '100%',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        'architects-daughter': ['"Architects Daughter"', 'sans-serif'],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3.25rem',
        '6xl': '4rem',
      },
      inset: {
        full: '100%',
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight: '-0.01em',
        normal: '0',
        wide: '0.01em',
        wider: '0.02em',
        widest: '0.4em',
      },
      minWidth: {
        10: '2.5rem',
      },
      scale: {
        98: '.98',
      },
      customForms: (theme) => ({
        default: {
          'input, textarea, multiselect, select, checkbox, radio': {
            backgroundColor: 'transparent',
            borderColor: theme('colors.gray.700'),
            borderRadius: theme('borderRadius.sm'),
            '&:focus': {
              outline: undefined,
              boxShadow: undefined,
              borderColor: theme('colors.gray.500'),
            },
          },
          'input, textarea, multiselect, select': {
            backgroundColor: 'transparent',
            fontSize: undefined,
            lineHeight: undefined,
            paddingTop: theme('spacing.3'),
            paddingRight: theme('spacing.4'),
            paddingBottom: theme('spacing.3'),
            paddingLeft: theme('spacing.4'),
          },
          'input, textarea': {
            '&::placeholder': {
              color: theme('colors.gray.500'),
            },
          },
          select: {
            paddingRight: theme('spacing.10'),
            iconColor: theme('colors.gray.500'),
          },
          'checkbox, radio': {
            color: theme('colors.purple.600'),
            backgroundColor: 'transparent',
          },
        },
      }),
      transitionProperty: {
        'max-height': 'max-height'
      },
      screens: {
        print: { raw: 'print' },
        screen: { raw: 'screen' },
      },
      animation: {
        fadein: "fadein 0.1s ease-in",
        slidein: "slidein 0.05s ease-in",
      },
      keyframes: {
        fadein: {
          from: {
            opacity: 0,
          },
          to: {
            opacity: 100,
          },
        },
        slidein: {
          from: {
            top: -20,
            position: 'relative'
          },
          to: {
            top: 0,
            position: 'relative'
          },
        },
      },
    },
  },
  variants: {
    backgroundColor: ['responsive', 'hover', 'focus', 'group-hover'],
    textColor: ['responsive', 'hover', 'focus', 'group-hover'],
    translate: ['responsive', 'hover', 'focus', 'group-hover'],
    boxShadow: ['responsive', 'hover', 'focus', 'focus-within'],
    opacity: ['responsive', 'hover', 'focus', 'group-hover'],
  },
  plugins: [require('@tailwindcss/forms')],
};
