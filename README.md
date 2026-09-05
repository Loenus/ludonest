Roadmap

[X] ideazione database
[X] connessione a Supabase/Firebase
[X] refactoring codice
[X] login
[ ] Sistemare le prenotazioni... sia lato getore sia lato gamer.
[ ] "Trova il tuo tavolo" con la mappa


sono tutti utenti.
tutti gli utenti possono proporre di amministrare UN solo ludopub.
(ci sono poi superadmin, tipo me e basta, che pososno fare tutto, tra cui accettare le proposte di creazione di ludopub)
se un utente amministra un ludopub, allora può accedere a tutte le info dettagliate del ludopub e può creare eventi e modificarne le informazioni. insomma può amministrarlo.
un utente normale (o comunque, un utente che non amministra quel ludopub) può prenotare un tavolo a quel ludopub.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
