# PROMPT 6 — Logo, Video & Go Live
## Final step. Run after PROMPT_5.

---

## Step 1 — Add your logo

Place your Sentavita logo file in the `/public/` folder, named exactly `logo.png`.
It will appear automatically in the Nav and Hero — both already have `<Image src="/logo.png">` with a SVG fallback if the file is not found.

If your logo is on a white background and you need it to appear white on the dark site, add this style to the Image tag in Hero.tsx:
```
style={{ objectFit:'contain', filter:'brightness(0) invert(1)' }}
```
If your logo is already white/transparent, remove the filter line.

---

## Step 2 — Add your video

Download a horse video from pexels.com/videos (search "horse jumping" or "horse gallop") — download the 1080p MP4.

Place it in the `/public/` folder named exactly `horse.mp4`.

The video tag is already in Hero.tsx. Adjust the opacity (currently `0.18`) to taste:
- `0.1` = very subtle, almost invisible
- `0.18` = the default — cinematic dark feel
- `0.25` = more visible, brighter

---

## Step 3 — next.config.ts
```typescript
import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}
export default nextConfig
```

---

## Step 4 — Create admin users in Supabase

1. Go to your Supabase project → Authentication → Users
2. Click "Add user" → enter email and password
3. Repeat for each team member
4. They sign in at `/login`

---

## Step 5 — Set up Resend for contact form emails (optional but recommended)

1. Go to resend.com → create free account
2. Add and verify your domain (sentavita.io)
3. Create an API key
4. Add to .env.local:
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
   CONTACT_EMAIL=hello@sentavita.io

Without this the contact form still works — messages save to the database but no email notification is sent.

---

## Step 6 — Deploy to Vercel

```bash
npm install -g vercel
vercel
```
When prompted, add all environment variables from `.env.local`.

Or push to GitHub and import at vercel.com → New Project.

---

## Step 7 — Add your custom domain

In Vercel → Project Settings → Domains → Add `sentavita.io`
Follow the DNS instructions Vercel provides.

---

## Final checklist

### Files
- [ ] `/public/logo.png` — your Sentavita logo
- [ ] `/public/horse.mp4` — hero background video

### Environment variables (all filled in .env.local and Vercel)
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] LINKEDIN_ACCESS_TOKEN
- [ ] LINKEDIN_PERSON_URN
- [ ] RESEND_API_KEY
- [ ] CONTACT_EMAIL
- [ ] NEXT_PUBLIC_SITE_URL (set to https://sentavita.io once live)

### Supabase
- [ ] Schema SQL executed
- [ ] Seed SQL executed
- [ ] post-media storage bucket created (public)
- [ ] Storage RLS policies applied
- [ ] At least one admin user created

### Test every page
- [ ] `/` — hero loads, fonts correct, video visible, apply button links to portal
- [ ] `/team` — team members show correctly
- [ ] `/articles` — articles list, links to LinkedIn
- [ ] `/journal` — empty state or posts if seeded
- [ ] `/contact` — form submits, confirmation screen shows
- [ ] `/login` — signs in, redirects to /admin
- [ ] `/admin` — dashboard loads, sidebar visible
- [ ] `/admin/content` — edit a field, confirm it updates on the public site
- [ ] `/admin/team` — add/edit/remove a team member
- [ ] `/admin/articles` — add/edit/remove an article
- [ ] `/admin/posts/new` — create a post, upload an image, publish
- [ ] `/admin/linkedin` — draft a post, publish it
- [ ] `/admin/analytics` — page views appearing
- [ ] `/admin/messages` — submit a contact form, see it appear here

---

## URL reference — full site map

| Public URL           | Page                                    |
|---------------------|-----------------------------------------|
| /                   | Home — hero, about, apply button        |
| /team               | Team members                            |
| /articles           | LinkedIn publications                   |
| /journal            | Journal post feed                       |
| /journal/[slug]     | Individual post (text, images, video, PDF) |
| /contact            | Contact form                            |

| Admin URL           | Purpose                                 |
|---------------------|-----------------------------------------|
| /login              | Team sign-in                            |
| /admin              | Dashboard — stats and quick links       |
| /admin/content      | Edit all public website text            |
| /admin/team         | Add/edit/remove team members            |
| /admin/articles     | Add/edit/remove LinkedIn articles       |
| /admin/posts        | Journal post list                       |
| /admin/posts/new    | Write a new post                        |
| /admin/posts/[id]   | Edit an existing post                   |
| /admin/linkedin     | Draft and publish LinkedIn posts        |
| /admin/analytics    | Page view analytics                     |
| /admin/messages     | Read and reply to contact messages      |

---

## Confirm: PROMPT_6 COMPLETE — SITE IS LIVE
