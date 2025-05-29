This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
excelidarw link : https://excalidraw.com/#room=04c33a4ec6f51f6d8f2d,blutQMgTYTEuMoa4g8zkJA

in this application user login/signup and then can create multiple forms. forms of two types(normal forms to get normal information and exam forms to conduct exams online).normal forms have three types of questions text, multiple choice questons(only one option to be selected) and checkbox(multiple options can be selected). in exam forms there are 4 options and only one option is correct.after creating a form(user can update the form) user can publish a form and can generate a public link which can be shared to anyone. someone who have access to that link can go to that link. there before filling the form they have to submit their name and email id and then they can fill up the form(normal/exam) type form.if the user again try to visit that link with that same email then he/she can see the responses and socres(in case of exam type forms). on the user side who created the form can see all the responses for a particular form (for both types) and also have a feature to generate an excel file of that response.user can anytime ubpublish the form. thennoone can fillup that form with that link.
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
