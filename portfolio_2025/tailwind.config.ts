import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Cybersecurity theme colors
				cyber: {
					dark: '#1A1F2C',
					darker: '#141824',
					darkest: '#0F131C',
					blue: '#0EA5E9',
					green: '#4ADE80',
					purple: '#8B5CF6',
					neon: {
						blue: '#30CAFF',
						green: '#7BFF56',
						purple: '#9B87F5',
					},
				},
				'cyber-dark': '#1A1F2C',
				'cyber-darker': '#141824',
				'cyber-darkest': '#0F131C',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'terminal-blink': 'blink 1s step-end infinite',
				'typing': 'typing 3.5s steps(40, end)',
				'float': 'float 6s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite alternate',
				'matrix-rain': 'matrix-rain 20s linear infinite',
				'scanner': 'scanner 3s ease-in-out infinite',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'blink': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0' },
				},
				'typing': {
					'from': { width: '0' },
					'to': { width: '100%' },
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'glow': {
					'from': { textShadow: '0 0 5px #8B5CF6, 0 0 10px #8B5CF6, 0 0 15px #8B5CF6' },
					'to': { textShadow: '0 0 10px #8B5CF6, 0 0 20px #8B5CF6, 0 0 30px #8B5CF6' },
				},
				'matrix-rain': {
					'0%': { transform: 'translateY(-50vh)', opacity: '1' },
					'95%': { opacity: '1' },
					'100%': { transform: 'translateY(100vh)', opacity: '0' },
				},
				'scanner': {
					'0%, 100%': { transform: 'translateY(0)', opacity: '0.5' },
					'50%': { transform: 'translateY(100%)', opacity: '1' },
				}
			},
			fontFamily: {
				'mono': ['JetBrains Mono', 'monospace'],
				'cyber': ['Chakra Petch', 'sans-serif'],
			},
			boxShadow: {
				'neu-inset': 'inset 3px 3px 7px rgba(0, 0, 0, 0.5), inset -3px -3px 7px rgba(70, 70, 90, 0.15)',
				'neu': '5px 5px 10px rgba(0, 0, 0, 0.3), -5px -5px 10px rgba(70, 70, 90, 0.15)',
				'terminal': '0 0 5px hsl(var(--terminal-green)), 0 0 20px rgba(123, 255, 86, 0.4)',
				'neon-purple': '0 0 5px hsl(var(--neon-purple)), 0 0 20px rgba(155, 135, 245, 0.4)',
				'neon-blue': '0 0 5px hsl(var(--neon-blue)), 0 0 20px rgba(48, 202, 255, 0.4)',
			},
			backgroundImage: {
				'cyber-grid': 'linear-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px)',
				'matrix-rain': 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(123, 255, 86, 0.2) 100%)',
				'neo-circuit': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='none'/%3E%3Cpath d='M10 10h80v80H10z' stroke='rgba(14, 165, 233, 0.15)' stroke-width='1' fill='none'/%3E%3Cpath d='M30 10v80M50 10v80M70 10v80M10 30h80M10 50h80M10 70h80' stroke='rgba(14, 165, 233, 0.1)' stroke-width='0.5' stroke-dasharray='5,5' fill='none'/%3E%3C/svg%3E\")",
			},
			textShadow: {
				'neon': '0 0 5px hsl(var(--neon-purple)), 0 0 10px hsl(var(--neon-purple))',
				'terminal': '0 0 5px hsl(var(--terminal-green)), 0 0 10px hsl(var(--terminal-green))',
			},
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		function({ addUtilities }) {
			const newUtilities = {
				'.text-shadow-neon': {
					textShadow: '0 0 5px hsl(var(--neon-purple)), 0 0 10px hsl(var(--neon-purple))',
				},
				'.text-shadow-terminal': {
					textShadow: '0 0 5px hsl(var(--terminal-green)), 0 0 10px hsl(var(--terminal-green))',
				},
				'.text-gradient-cyber': {
					background: 'linear-gradient(to right, hsl(var(--neon-blue)), hsl(var(--neon-purple)))',
					'-webkit-background-clip': 'text',
					'-webkit-text-fill-color': 'transparent',
				},
				'.neumorphic': {
					boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.3), -5px -5px 10px rgba(70, 70, 90, 0.15)',
					backgroundColor: 'hsl(var(--background))',
					borderRadius: '1rem',
				},
				'.neumorphic-inset': {
					boxShadow: 'inset 3px 3px 7px rgba(0, 0, 0, 0.5), inset -3px -3px 7px rgba(70, 70, 90, 0.15)',
					backgroundColor: 'hsl(var(--background))',
					borderRadius: '1rem',
				},
			}
			addUtilities(newUtilities)
		}
	],
} satisfies Config;
