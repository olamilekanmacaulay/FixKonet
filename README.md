# FixKonet

FixKonet is a lightweight **job and gig matching platform** designed for Nigeria’s informal sector.  
It connects **clients** (households & small businesses) with **artisans** (plumbers, electricians, cleaners, tailors, tutors, etc.) in their area.  

The MVP focuses on **visibility, trust, and simplicity**:
- Clients can post jobs and find nearby artisans.
- Artisans can register skills, apply to jobs, and build credibility with ratings.
- Ratings & reviews build trust over time.
- Lightweight **PWA** so it works on low-end devices with limited internet.

---

## 🚀 Features (MVP)
- 📱 **Phone OTP login** (no complex signup).
- 👨‍🔧 **Artisan Profiles** (skills, bio, ratings).
- 📋 **Job Posting** (title, budget, location, description).
- 🔔 **Job Notifications** (push + SMS fallback).
- ⭐ **Ratings & Reviews** (trust system).
- 🌍 **Lightweight PWA** (offline support, fast loading).

---

## 🛠️ Tech Stack
- **Frontend (PWA):** React / Next.js
- **Backend API:** Node.js (Express)
- **Database:** MongoDB
- **Auth:** Firebase Auth or Twilio Verify (phone OTP)
- **Notifications:** Firebase Cloud Messaging
- **Deployment:** Vercel (frontend) + Render/Heroku (backend)
- **SMS Gateway (Fallback):** Termii / Africa’s Talking

---

## 🗄️ Database Schema (MVP)
Key tables:
- `users` → clients & artisans
- `jobs` → job posts by clients
- `job_applications` → artisans applying to jobs
- `reviews` → ratings & feedback
- `notifications` → alerts for users


---

## 📌 Roadmap
- **Phase 1:** Core MVP (profiles, jobs, ratings).
- **Phase 2:** ID verification, trust badges, and escrow payments.
- **Phase 3:** Geo-location matching & agent onboarding.
- **Phase 4:** Expansion across cities & more skill categories.

---

## 👩🏾‍💻 Contributing
1. Fork the repo
2. Clone your fork:  
   ```bash
   git clone https://github.com/yourusername/fixconnect.git
