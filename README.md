# localhostshrey 🌐

> Personal portfolio website of **Shrey** — full stack dev · mern · cooked 24/7

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12-black?logo=framer)](https://www.framer.com/motion)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://docker.com)

## 🔗 Links

- **GitHub:** [@bytesizedshrey](https://github.com/bytesizedshrey)
- **Twitter:** [@bytesizedshrey](https://x.com/bytesizedshrey)

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/ui
- **Animations:** Framer Motion
- **Analytics:** Vercel Analytics
- **Containerization:** Docker

---

## 📁 Project Structure

```
localhostshrey/
├── app/                    # Next.js App Router
│   ├── (root)/
│   │   ├── (home)/         # Home page
│   │   └── projects/       # Projects page
│   ├── fonts/              # Local fonts (Glancyr, GeistMono)
│   ├── globals.css
│   └── layout.tsx
├── components/             # React components
│   ├── Footer/
│   ├── Grid/
│   ├── Links/
│   ├── Profile/
│   ├── Projects/
│   ├── Spam/
│   ├── TechStack/
│   ├── Tools/
│   ├── magicui/            # Magic UI components
│   ├── theme/              # Theme provider & toggler
│   └── ui/                 # Shadcn UI components
├── config/                 # Navbar config
├── constants/              # Site-wide constants (socials, tech stack)
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── public/                 # Static assets
│   ├── assets/             # Images & media
│   └── icons/              # SVG icons
├── types/                  # TypeScript type definitions
├── docker-compose.yml      # Docker Compose config
├── Dockerfile              # Docker container setup
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Local Development

```bash
# Clone the repo
git clone https://github.com/bytesizedshrey/localhostshrey.git
cd localhostshrey

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### 🐳 Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t localhostshrey .
docker run -p 3000:3000 localhostshrey
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

---

## 📄 License

MIT © [bytesizedshrey](https://github.com/bytesizedshrey)
