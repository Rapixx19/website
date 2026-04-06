# Sentavita Website — Complete Build Guide

## What you are building
A full website + admin CMS for Sentavita:
- 5 public pages: Home, Team, Articles, Journal, Contact
- Full admin at /admin: content editor, team, articles, posts with media, LinkedIn publisher, analytics, message inbox
- Supabase auth (your team signs in at /login)
- Page view analytics
- Email notification on contact form (Resend, free)
- LinkedIn publishing API

---

## Order to paste into Cursor (CMD+L each time)
Run each prompt fully before starting the next.

| File | What it builds | Est. time |
|------|----------------|-----------|
| PROMPT_0_SETUP.md | Project structure, DB schema, seed data | 5 min |
| PROMPT_1_WEBSITE.md | All public pages + components | 12 min |
| PROMPT_2_AUTH.md | Login page, middleware, admin shell | 8 min |
| PROMPT_3_ADMIN_DASHBOARD.md | Dashboard, content, team, analytics, messages | 12 min |
| PROMPT_4_LINKEDIN.md | LinkedIn API + post composer | 8 min |
| PROMPT_5_POSTS.md | Journal posts with image/video/PDF uploads | 10 min |
| PROMPT_6_DEPLOY.md | Logo, video, Vercel deployment | 10 min |

---

## CRITICAL instruction — paste this at the start of EVERY Cursor session
> "Copy all code blocks exactly as written into the file paths specified.
> Do not convert inline styles to Tailwind. Do not rewrite components.
> Preserve all rgba values, font declarations, and animation keyframes precisely."

---

## What you need before starting

1. **Node.js** — nodejs.org if not installed
2. **Supabase account** — free at supabase.com → create project → copy URL and keys
3. **Your logo** — sentavita-logo.png ready to copy into /public/ as logo.png
4. **A horse video** — free MP4 from pexels.com/videos → download 1080p → copy to /public/ as horse.mp4
5. **LinkedIn credentials** — ~10 minutes to set up, instructions in PROMPT_4
6. **Resend account** — free at resend.com, for contact form emails (optional)

---

## Colour reference — do not change these
| Name  | Hex       | Used for                        |
|-------|-----------|---------------------------------|
| Navy  | #08090D   | Page background                 |
| Teal  | #1B8A8F   | Accents, borders, particles     |
| Gold  | #E8A82A   | Apply button, rules, accents    |
| Cream | #DDD8CE   | Body text                       |
| White | #ffffff   | Headings, logo                  |

---

## Adding team members to admin
Supabase → Authentication → Users → Add user → enter email and password
Anyone you add can sign in at /login and manage the site.
