# Why am I building this app?

I often go to McDonald’s, and many times I’ve seen staff—already extremely busy 
and under pressure—having to call out order numbers repeatedly and wait until the customer comes. 
I’m building this to see if an AI(LLM) that announces order numbers on their behalf could reduce 
that burden and improve efficiency. I’m specifically using an LLM for scalability and to have 
the flexibility to call out order numbers in more human-like, varied ways.

## Notes
	1.	This app is being built as a test for DDB Group.
	2.	The LLM will be implemented using WebLLM.
	3.	TTS will use the Web Speech API.
	4.	It will be built as a web app that runs in the browser.
	5.	It uses Next.js and will be hosted on Vercel.
	6.	Tailwind CSS and HeadlessUI will be used.
	7.	Redis KV DB will be used to save money.
	8.	Authentication will be omitted.

## Next.js Installation (using Typescript)
[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app)
```bash
npx create-next-app@latest
# Need to install the following packages:
# create-next-app@15.5.0
# Ok to proceed? (y) 
# ✔ What is your project named? … order-voice
# ✔ Would you like to use TypeScript? … No / Yes
# ✔ Which linter would you like to use? › ESLint
# ✔ Would you like to use Tailwind CSS? … No / Yes
# ✔ Would you like your code inside a `src/` directory? … No / Yes
# ✔ Would you like to use App Router? (recommended) … No / Yes
# ✔ Would you like to use Turbopack? (recommended) … No / Yes
# ✔ Would you like to customize the import alias (`@/*` by default)? … No / Yes
# ✔ What import alias would you like configured? … @/*
```

## Vercel Hosting
Create a project on Vercel and link it to the repository.
```bash
vercel login
vercel link
vercel env pull .env.development.local
```

### Vercel CI/CD Setting
When a commit is pushed to the main repository, Vercel will build and deploy the app.
Move `vercel` to `Vercel Project > Settings > Git > Ignored Build Step`
```shell
if [[ "$VERCEL_GIT_COMMIT_REF" == "main" ]]; then echo " [v] - Build can proceed"; exit 1; else echo " [-] - Build cancelled"; exit 0; fi;
```

