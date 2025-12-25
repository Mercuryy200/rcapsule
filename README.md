# Closet Organizer

A full-stack wardrobe management application that helps you catalog, organize, and create outfit combinations from your clothing collection.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://closet-organizer-rima-nafougui.vercel.app)
[![GitHub](https://img.shields.io/badge/github-repo-blue)](https://github.com/Mercuryy200/ClosetOrganizer)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Features

- **Secure Authentication**: Sign in with Google or GitHub using NextAuth.js or with email
- **Wardrobe Cataloging**: Add, edit, and delete clothing items with image uploads
- **Smart Organization**: Filter items by category, color, season, and custom tags
- **Outfit Creation**: Combine clothing items to create and save outfit combinations
- **Advanced Search**: Quickly find items across your entire wardrobe
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Real-time Updates**: Instant synchronization of your wardrobe data

## Tech Stack

- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js with OAuth (Google, GitHub)
- **Deployment**: Vercel
- **Performance**: 95+ Lighthouse score

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase account and project
- Google and/or GitHub OAuth credentials

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Mercuryy200/ClosetOrganizer.git
cd ClosetOrganizer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

4. Set up the database:

Run the SQL migrations in your Supabase project to create the necessary tables and Row Level Security policies.

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses a normalized PostgreSQL schema with the following main tables:

![Schema](public/images/supabase-schema-closet.png)

All tables implement Row Level Security (RLS) to ensure users can only access their own data.

## Deployment

The application is deployed on Vercel with automatic CI/CD:

1. Push to the main branch
2. Vercel automatically builds and deploys
3. Environment variables are configured in Vercel dashboard

## Performance

- Server-side rendering with Next.js App Router
- Optimized image loading and compression
- Lighthouse score: 95+
- Fast page loads and smooth interactions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Rima Nafougui - [@Mercuryy200](https://github.com/Mercuryy200)

Project Link: [https://github.com/Mercuryy200/ClosetOrganizer](https://github.com/Mercuryy200/ClosetOrganizer)

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
