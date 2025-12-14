# News Website - Next.js Project

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, create a `.env.local` file with the following variables:

```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=https://newswebsite.runasp.net/api
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build for Production

```bash
npm run build
npm start
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

### Environment Variables for Vercel

Make sure to add these environment variables in your Vercel project settings:

- `NEXTAUTH_SECRET` - A random secret string (you can generate one using `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your Vercel deployment URL (e.g., `https://your-project.vercel.app`)
- `NEXT_PUBLIC_API_URL` - Your API URL (e.g., `https://newswebsite.runasp.net/api`)

### Important Notes for Vercel Deployment

1. **Build Command**: The build command is set to `npm run build` (without turbopack) for Vercel compatibility
2. **Node Version**: Vercel will automatically use Node.js 20.x
3. **Framework**: Next.js 15.5.6 is configured

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
