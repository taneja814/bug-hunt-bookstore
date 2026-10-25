# Bug Hunt: Bookstore

Welcome to the support desk of a small online bookstore. Customers are complaining, and your job is to work out **why** and fix it. There are **5 tickets**, and nobody will tell you where the problems are.

## The tickets

| # | What customers say |
|---|---|
| 1 | "The first books are missing when I browse the catalogue." |
| 2 | "Sorting by price looks wrong." |
| 3 | "Search is flaky, sometimes it just breaks." |
| 4 | "The cart total doesn't add up." |
| 5 | "We've had complaints about stock when the shop is busy." |

Each ticket has its own cause somewhere in the project. Use the app, watch what it does, and read the terminal where the server prints errors. Reproduce each problem first, then fix it.

## Start

1. Open this repo in a Codespace: **Code → Codespaces → Create codespace on main**. Wait a minute or two while it sets everything up.
2. The app starts automatically. When a popup says port 3000 is available, click **Open in Browser** (or open the **Ports** tab and click the link next to 3000).
3. Click around: browse, sort, search, add to cart, buy.

## What's inside

| Part | Where |
|---|---|
| Frontend (the web page) | `public/` |
| Backend (the API) | `server.js` and `lib/` |
| Database (Postgres) | `db/init.sql` holds the data |

## Practice checks

```
npm test
```

This runs a quick check for tickets 1 to 4 so you know when you're on the right track. **Ticket 5 has no practice check**, so you'll have to work out how to test it yourself. The practice checks are lighter than the organisers' real ones, so a pass here doesn't guarantee the ticket is fully fixed.

## Submit your work (this is what counts!)

After you fix a ticket, run:

```
npm run submit
```

This pushes your code to GitHub. **Push after every ticket you fix**, because the organisers run their own, tougher checks on what you pushed. You are ranked by **how many tickets you fixed**, and ties go to whoever got there **first**. Nothing to type, nothing to upload. Your repo must stay **public**.

## Hint bot

Stuck? Use the **"Ask the hint bot"** box at the bottom of the page. You get **5 hints in total**, and each one is a little more specific than the last. Tell it which ticket you're on and what you've tried. It guides you, it never gives the answer.

## Rules

- Fix the real problem. Special-casing the examples you see won't pass the organisers' checks.
- Keep your repo name as it is and keep it public.
- The top finishers will be asked to explain their fixes.
- Ask a volunteer if your Codespace won't load.

Good luck!
