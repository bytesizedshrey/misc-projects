# Development

This guide provides instructions on how to set up and run the project locally.

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (Latest LTS version recommended)
- [pnpm](https://pnpm.io/)
- [Git](https://git-scm.com/)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/zzzzshawn/zzzzshawn.cloud.git
cd zzzzshawn.cloud
```

### 2. Install dependencies

```bash
pnpm i
```

### 3. Configure Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Then, update the necessary environment variables inside `.env.local` (e.g. `NEXT_PUBLIC_NASA_API_KEY` for the optional NASA APOD widget).

### 4. Run the development server

```bash
pnpm dev
```

The application should now be available at [http://localhost:3000](http://localhost:3000).

## Building for Production

```bash
pnpm build
```

After building, start the application with:

```bash
pnpm start
```

## Scripts

| Command       | Description                    |
| ------------- | ------------------------------ |
| `pnpm dev`   | Start the development server   |
| `pnpm build` | Build the application          |
| `pnpm start` | Start the production server    |
| `pnpm lint`  | Run ESLint                     |
