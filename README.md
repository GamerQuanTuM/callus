# Video Platform

A modern, full-stack video sharing platform built with Next.js, featuring real-time video feeds, user interactions, and social features.

## Features

- **Video Feed**: Infinite scroll video feed with smooth animations
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Video Upload**: Upload and share videos with descriptions
- **Social Interactions**: Like, bookmark, and follow users
- **Real-time Updates**: Optimistic UI updates for better user experience
- **Responsive Design**: Mobile-first design with touch gestures and keyboard controls
- **Video Controls**: Play/pause, mute/unmute, and smooth video transitions

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Motion** - Animation library for React
- **Lucide React** - Beautiful icons

### Backend
- **tRPC** - Type-safe API layer
- **Drizzle ORM** - TypeScript ORM for PostgreSQL
- **PostgreSQL** - Primary database
- **Neon** - Serverless PostgreSQL platform
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Drizzle Kit** - Database migrations

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon account)
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/GamerQuanTuM/callus.git
cd video-platform
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp example.env .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

4. Set up the database:
```bash
pnpm drizzle-kit push
```

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

The application uses the following main entities:

- **Users**: User profiles with authentication
- **Videos**: Video content with metadata
- **Likes**: User video interactions
- **Bookmarks**: Saved videos
- **Follows**: User relationships

## API Routes

### Authentication
- `POST /api/auth.login` - User login
- `POST /api/auth.register` - User registration

### Videos
- `GET /api/video.feed` - Get video feed with pagination
- `POST /api/video.upload` - Upload new video
- `POST /api/video.like` - Toggle video like
- `POST /api/video.bookmark` - Toggle video bookmark

### Users
- `GET /api/user/profile` - Get user profile
- `POST /api/user/follow` - Toggle user follow

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (private)/         # Protected routes
│   ├── (public)/          # Public routes
│   └── api/               # API routes
├── components/            # Reusable UI components
├── constants/             # Application constants
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── db/               # Database configuration
│   ├── trpc/             # tRPC configuration
│   └── storage/          # File storage utilities
├── providers/            # React context providers
└── types/                # TypeScript type definitions
```

## Development

### Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Database Migrations

```bash
# Push schema changes to database
pnpm drizzle-kit push

# Generate migration files
pnpm drizzle-kit generate

# View migration status
pnpm drizzle-kit check
```

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment

1. Build the application:
```bash
pnpm build
```

2. Start the production server:
```bash
pnpm start
```

