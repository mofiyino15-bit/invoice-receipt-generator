# Bok Invoice App — Conversation Handoff

## Project Overview
A fully functioning React/TypeScript invoice and receipt generator app called **Bok**, built in Google AI Studio and deployed to Vercel.

---

## GitHub Repo
https://github.com/mofiyino15-bit/invoice-receipt-generator

## Live Site
Deployed on **Vercel** (check your Vercel dashboard for the exact URL)

## Tech Stack
- React + TypeScript
- Vite
- Tailwind CSS (custom design system)
- Component-based architecture

---

## What Has Been Done
- ✅ Downloaded zip from Google AI Studio
- ✅ Uploaded all files to GitHub repo (with folder structure intact)
- ✅ Fixed app starting route: `App.tsx` — changed `useState<string>("login")` to `useState<string>("landing")` so app starts on Landing page
- ✅ Deployed to Vercel

---

## Outstanding Issue — Gray Frame Around PDF Modal

### What the problem is
On the Invoice Detail page, when you click the **PDF button**, a modal opens. There is a **large gray box/frame surrounding the entire modal from the outside** that should not be there.

### What was tried
- Changed `bg-grey-50` to `bg-grey-50/0` on the modal card div in `src/components/InvoiceDetail.tsx`
- This did NOT fix it — the gray frame is still visible on the live Vercel site

### Where to look next
The gray frame may be coming from the **overlay div padding** or another wrapper. In `src/components/InvoiceDetail.tsx`, look at:

```
className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4
```

The `p-4` padding on the overlay div may be contributing. Also check any parent wrapper divs around the modal card.

### Important
- The app uses a **custom design system** — only use existing design tokens (e.g. `bg-grey-50`, `bg-white`, etc.)
- Do NOT introduce new Tailwind classes that don't exist in the design system
- The user wants the gray frame either **deleted** or set to **opacity zero**
- Do NOT touch anything inside the modal itself — only the outer gray frame

---

## File Structure (from zip)
```
bok-2/
├── index.html
├── metadata.json
├── package.json
├── README.md
├── styles.md
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── types.ts
    └── components/
        ├── AddClient.tsx
        ├── BokLogo.tsx
        ├── ClientDetail.tsx
        ├── ClientsList.tsx
        ├── CreateInvoice.tsx
        ├── Dashboard.tsx
        ├── FinancialSnapshot.tsx
        ├── FollowUpIntelligence.tsx
        ├── Header.tsx
        ├── InvoiceDetail.tsx  ← main file with the issue
        ├── InvoicesList.tsx
        ├── Landing.tsx
        ├── Login.tsx
        ├── ProductLibrary.tsx
        ├── ProfileSettings.tsx
        ├── QuickActions.tsx
        ├── RecentInvoices.tsx
        ├── Reports.tsx
        ├── Sidebar.tsx
        └── SignUp.tsx
```

---

## Notes for Next Session
- The user has **no coding knowledge** — all instructions must be simple and non-technical
- Guide them to make changes directly in **GitHub's web editor** (pencil icon)
- Always ask for screenshots when unsure what the user is seeing
- The user is working to a **deadline** so keep things fast and clear
