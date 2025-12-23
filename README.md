# Trumpet Pods - Text Widgets

A digital sales room application that allows users to dynamically create, edit, and manage independent text widgets within a pod. Each widget maintains its own state and persists data across page refreshes.

## Features

- Add multiple text widgets dynamically
- Independent state management per widget
- Persistent storage via backend API
- Delete widgets when no longer needed
- Support for long text (1000+ characters)

## Prerequisites

This project uses **pnpm** as the package manager. Make sure you have it installed:

```bash
# Install pnpm globally
npm install -g pnpm

```

> **Note**: Using `npm install` or `yarn install` will fail due to the enforced pnpm requirement.

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to access the Pod page.

## How to Run with Docker

### Using Docker Compose (Recommended)

```bash
# Build and run
pnpm docker:up

# Or directly with docker-compose
docker-compose up --build

# Stop containers
pnpm docker:down
```

### Using Docker directly

```bash
# Build the Docker image
docker build -t sendtrumpet .

# Run the container
docker run -p 3000:3000 sendtrumpet
```

Open [http://localhost:3000](http://localhost:3000) with your browser to access the Pod page.

## How to Run Tests

```bash
# Run all tests
pnpm test

# Run tests with UI
pnpm test:ui
```

## Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS
- **Backend**: Hono running inside Next.js API routes
- **Testing**: Vitest, React Testing Library
- **Code Quality**: Biome for linting and formatting



