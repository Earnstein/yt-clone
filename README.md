# YouTube Clone

This is a YouTube clone project built with [Next.js](https://nextjs.org), [Clerk](https://clerk.com/) for authentication, [Drizzle ORM](https://orm.drizzle.team/) for database management, [Upstash](https://upstash.com/) for rate limiting and Redis, [Tailwind CSS](https://tailwindcss.com/) for styling, [tRPC](https://trpc.io/) for building typesafe APIs, and [React Query](https://tanstack.com/query) for data fetching and caching.

## Prerequisites

Before running the project, make sure you have the following:

- [Node.js](https://nodejs.org/) installed (version 14 or higher)
- [Bun](https://bun.sh/) installed (optional, but recommended for faster development)
- Accounts and API keys for the following services:
  - [Clerk](https://clerk.com/) for authentication
  - [Upstash](https://upstash.com/) for Redis and rate limiting
  - [Vercel](https://vercel.com/) for deployment (optional)
  - [ngrok](https://ngrok.com/) for tunneling in local development

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/youtube-clone.git
   cd youtube-clone
   ```

2. Install the dependencies:

   ```bash
   bun install
   # or
   npm install
   ```

3. Set up the environment variables:

   Create a `.env` file in the root directory of the project and add the following variables:

   ```
   DATABASE_URL=your-database-url
   CLERK_API_KEY=your-clerk-api-key
   CLERK_SIGNING_SECRET=your-clerk-signing-secret
   UPSTASH_REDIS_URL=your-upstash-redis-url
   UPSTASH_REDIS_TOKEN=your-upstash-redis-token
   ```

   Replace the placeholders with your actual values.

4. Run the database migrations:

   ```bash
   bun run db:push for quick migrations without generating sql files
   # or
   bun run db:generate to generate sql migration files and bun run db:migrate to run them
   ```

5. Start the development server:

   ```bash
   bun run dev
   # or
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000).

6. Set up ngrok for tunneling:

   To sync the database via webhooks during local development, use ngrok to expose your local server to the internet:

   ```bash
   bun run dev:ngrok
   ```

   This will create a public URL that you can use to configure webhooks in your Clerk dashboard.

## Features

- User authentication with Clerk
- Video browsing and playback
- Categories and search functionality
- User playlists and liked videos
- Rate limiting with Upstash
- Responsive design with Tailwind CSS
- Typesafe API with tRPC
- Efficient data fetching and caching with React Query

## Deployment

To deploy the application, you can use [Vercel](https://vercel.com/). Make sure to set up the necessary environment variables in your Vercel project settings.

## License

This project is licensed under the [MIT License](LICENSE).
