# Returni-backpay-app
backpay app for customer retention courtesy of anesu


# RETURNi

### Customer Retention Platform for Local Businesses

---

# Project Proposal

## 1. Executive Summary

RETURNi is a digital customer retention platform designed to help small and medium-sized businesses increase repeat customers and grow revenue. Many local shops struggle to track their customers or encourage them to return after their first purchase. RETURNi solves this problem by providing a simple rewards and analytics system that helps businesses identify, engage, and retain their customers.

Through a combination of QR-based customer identification, automated rewards, and intelligent data analysis, RETURNi enables businesses to build stronger relationships with their customers while improving long-term profitability.

The platform also creates economic opportunities through a network of local agents who recruit businesses onto the platform and support their adoption.

RETURNi’s mission is to become the **customer retention infrastructure for small businesses across Africa**.

---

## 2. Problem Statement

Small businesses across many developing markets face a major challenge: they do not know their customers.

Most shops operate without systems that track:

* customer visits
* purchase patterns
* customer loyalty
* repeat business

As a result:

* Businesses lose customers after the first purchase
* Marketing is inefficient and unfocused
* Owners cannot measure customer loyalty or retention

Large corporations solve this using loyalty programs, CRM systems, and advanced analytics. However, these solutions are often expensive or complex for small businesses.

There is currently a gap in the market for a **simple, affordable customer retention platform designed specifically for small local businesses.**

---

## 3. Solution

RETURNi provides a simple platform that allows businesses to identify their customers, reward loyalty, and encourage repeat visits.

The platform consists of three primary components:

### Merchant Dashboard

Business owners gain access to a simple dashboard where they can:

* Track customer visits
* Send rewards and promotions
* Monitor repeat customers
* View business analytics
* Measure retention rates

### Customer Rewards System

Customers interact with businesses using QR codes or phone numbers. The system automatically records visits and rewards loyalty.

Examples of rewards include:

* Points for each purchase
* Discounts after multiple visits
* Cashback rewards
* Loyalty incentives

These rewards encourage customers to return more frequently.

### Agent Network

RETURNi operates through a network of local agents who:

* Recruit businesses to the platform
* Help merchants onboard and learn the system
* Provide ongoing support

Agents are compensated through sign-up incentives and revenue sharing.

This decentralized model allows the platform to scale rapidly within local communities.

---

## 4. Technology Platform

RETURNi is built as a cloud-based platform with the following components:

* Merchant dashboard for business owners
* Customer interaction via QR codes and phone numbers
* Secure cloud database for customer and transaction data
* Rewards and loyalty engine
* Analytics and reporting tools

In later phases, RETURNi will integrate machine learning models to provide predictive insights such as:

* Customer churn prediction
* Optimal reward recommendations
* Customer segmentation
* Sales trend analysis

These insights will help businesses make better marketing decisions and maximize customer retention.

---

## 5. Market Opportunity

Small and medium-sized enterprises represent the majority of businesses in many emerging markets. However, most operate without digital tools that help them retain customers.

Key sectors that can benefit from RETURNi include:

* restaurants and cafes
* salons and barbershops
* retail shops
* gyms and fitness centers
* car washes
* pharmacies
* service businesses

These businesses rely heavily on repeat customers but currently lack systems to track or incentivize loyalty.

By providing an affordable and easy-to-use platform, RETURNi can unlock significant value within this market.

---

## 6. Business Model

RETURNi generates revenue through multiple channels.

### Merchant Sign-Up Fee

Businesses pay a small one-time onboarding fee when joining the platform.

### Monthly Subscription

Businesses pay a monthly fee to access the platform’s features, analytics, and reward system.

### Commission on Promotions

The platform may collect a small percentage from promotional campaigns or reward transactions.

### Premium Analytics (Future)

Advanced insights and predictive analytics can be offered as premium services for larger businesses.

---

## 7. Competitive Advantage

RETURNi differentiates itself through several key strengths.

**Simplicity**
The system is designed specifically for small businesses that may have limited technical knowledge.

**Low Cost**
The platform is affordable compared to traditional CRM or loyalty software.

**Agent-Based Growth**
Local agents accelerate adoption by building trust within communities.

**Data Intelligence**
Machine learning will enable businesses to make smarter decisions about customer engagement.

**Scalability**
The platform can expand to multiple cities and countries once the core infrastructure is established.

---

## 8. Growth Strategy

The initial launch strategy focuses on neighborhood-level adoption.

Phase 1:

* Recruit local agents
* Onboard early merchants
* Build initial customer base

Phase 2:

* Expand merchant network across the city
* Increase consumer participation
* Improve data analytics

Phase 3:

* Expand to additional cities
* Introduce advanced analytics and machine learning
* Develop strategic partnerships

This step-by-step expansion ensures controlled growth while refining the platform.

---

## 9. Impact

RETURNi will create value for multiple stakeholders.

Businesses benefit from:

* higher customer retention
* improved marketing effectiveness
* better business insights

Customers benefit from:

* loyalty rewards
* personalized promotions
* stronger relationships with local businesses

Communities benefit from:

* stronger local economies
* increased small business competitiveness
* new income opportunities through agent networks

---

## 10. Investment Opportunity

RETURNi is seeking investment to accelerate product development, merchant acquisition, and market expansion.

Funding will be used for:

* software development and infrastructure
* merchant onboarding and marketing
* agent network development
* data analytics and machine learning capabilities

With the right investment and strategic support, RETURNi has the potential to become a leading customer retention platform for small businesses across emerging markets.

---

## 11. Conclusion

Customer retention is one of the most important drivers of business success. Yet millions of small businesses lack the tools needed to build lasting customer relationships.

RETURNi bridges this gap by providing a simple, powerful, and scalable platform that enables businesses to understand their customers and keep them coming back.

By combining technology, data, and local distribution networks, RETURNi has the potential to transform how small businesses grow and compete in the modern economy.


# ⚡ 1. Design for Power Cuts First (Offline-First Architecture)

In Zimbabwe, electricity can disappear anytime. So the system must **continue working even without power or internet**.

### Best approach: **Offline-first apps**

How it works:

1. Shop device records transaction locally.
2. Data is saved on the device.
3. When internet returns → it syncs to the server.

Example flow:

```
Customer buys bread
↓
Shop scans QR
↓
Points saved locally
↓
Internet returns later
↓
System syncs data
```

Technology that supports this:

* **SQLite local database**
* **Service Workers**
* **Progressive Web Apps (PWA)**

This allows shops to still operate during outages.

---

# 📱 2. Avoid Heavy Apps (Use Web Apps Instead)

A big mistake would be building:

❌ Android + iOS heavy apps

Better approach:

✅ **Progressive Web App (PWA)**

Advantages:

* Works on **cheap phones**
* Can run **offline**
* Updates automatically
* Very low data usage

A shop can simply open:

```
shop.returni.app
```

in a browser.

---

# 📶 3. Assume Internet Is Slow

Your system must function even on **2G or weak 3G networks**.

Design rules:

✔ Small API requests
✔ No heavy images
✔ Minimal animations
✔ Compress all data

Example:

Bad request:

```
Send full customer profile
```

Better request:

```
Send:
customer_id
points
timestamp
```

Small packets = faster sync.

---

# 🧾 4. QR Codes Are Perfect for Zimbabwe

Why QR works well:

* No hardware needed
* Cheap to print
* Works offline
* Fast customer onboarding

Example shop setup:

```
QR poster at counter
Customer scans
Customer enters phone number
Points added
```

No electricity required beyond the phone.

---

# 💬 5. Integrate WhatsApp Instead of a Customer App

People in Zimbabwe already live on WhatsApp.

Instead of forcing customers to download an app:

Use WhatsApp notifications.

Example messages:

```
Hi Tendai 👋

You earned 10 points at Joe's Tuckshop.

You now have 60 points.

40 more points = Free Drink.
```

Benefits:

✔ No downloads
✔ Familiar interface
✔ High engagement

---

# 🧠 6. Keep the Server Cloud-Based

Even if local power goes down, the platform stays online.

Recommended hosting:

* DigitalOcean
* AWS
* Hetzner

This ensures RETURNi stays operational.

---

# 🔋 7. Merchant Hardware Strategy

Most shops won’t have fancy equipment.

Recommended device:

* Cheap Android phone
* Old tablet
* Low-power laptop

Power backup ideas:

* Power banks
* Solar chargers
* Small UPS

Even **$15 solar power banks** can keep the system alive.

---

# 📊 8. Data Sync Strategy

Your system should sync data **only when needed**.

Example:

```
Queue transactions
↓
Detect internet
↓
Batch upload
↓
Clear queue
```

This reduces:

* data usage
* battery drain
* network stress

---


# 🏗️ Ideal RETURNi Architecture

Simple version:

```
Merchant Phone
      ↓
Offline Web App
      ↓
API Server
      ↓
Database
      ↓
Analytics + ML
```

---



Start with **the simplest version possible**.

Phase 1 (MVP):

✔ QR code scan
✔ Phone number capture
✔ Points system
✔ Merchant dashboard



Just **data collection**.

---

# 🧠 Founder Advice

Your biggest risk is not technology.

It is:

```
Merchant adoption
```

If **50 shops start using RETURNi daily**, you’ve already won.

Everything else can improve later.

---

# 🔥 One Idea That Could Make RETURNi Explode

Add **EcoCash / mobile money rewards** later.

Example:

```
Spend $10
Get $0.50 cashback
```

---

# 🚀 Setup & Deployment (Vercel)

## Quick Start

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Create Supabase project** (free at [supabase.com](https://supabase.com))
   - New project → Run the SQL in `supabase/schema.sql` in the SQL Editor

3. **Environment variables**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase URL and anon key from Project Settings → API

4. **Run locally**
   ```bash
   npm run dev
   ```

## Deploy to Vercel

1. Push to GitHub and import in [Vercel](https://vercel.com)
2. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy

## Features

- **Merchant Setup** – Create business profile
- **Merchant Dashboard** – Visits, analytics, unique customers
- **QR Code** – Print for customers to scan
- **Scan & Add Points** – Phone capture, 10 points per visit
- **Offline-first** – Visits saved locally when offline, sync when online
- **PWA** – Install on phone, works like an app

what to build 

### 0. Goal and constraints (what I’m optimizing for)

- **Goal**: Turn the current MVP into a **pilot-ready RETURNi** that:
  - Supports **merchants, agents, clients, admins** with different dashboards.
  - Implements **transaction → backpay (4%) → QR link → WhatsApp → claim**.
  - Fits your **Bulawayo pilot**: 10 agents, ~20 merchants, manual EcoCash cashflow.
- **Constraints / choices**:
  - Stay on **Next.js + Supabase + PWA**.
  - **No WhatsApp Business API** – use **manual WhatsApp deep links**.
  - Philosophically **online-first**, but app won’t completely break on short network glitches.
  - Keep it **simple and understandable**, so you can explain it to your group and merchants.

---

### 1. Clean up and re-orient the current system

**What I’ll do conceptually (no code yet):**

- **Review current features**:
  - Merchant setup/login
  - Dashboard with “visits”
  - Scan page with phone and offline queue
- Decide what to **keep vs. repurpose**:
  - Keep: PWA, Supabase client, basic dashboard UI, offline Dexie setup.
  - Repurpose: “visits” → real **transactions + backpay**.
  - Remove/ignore: anything that doesn’t fit the new money+backpay model.

This gives a clean mental base: from “loyalty visits” to “money transactions + backpay”.

---

### 2. Redesign the data model around money + roles

On Supabase I would **extend/adjust the schema** to match the new story:

- **Users**
  - `id, name, phone, email, role ('admin' | 'agent' | 'merchant_user' | 'client')`
- **Merchants**
  - `id, name, business_name, owner_user_id, agent_id, backpay_percent (default 4%)`
- **Agents**
  - `id, user_id`
- **Clients**
  - `id, phone` (and optional name)
- **Transactions**
  - `id, merchant_id, client_id, amount, currency, created_at`
- **BackpayRecords**
  - `id, transaction_id, merchant_id, client_id`
  - `backpay_amount`
  - `status ('unclaimed' | 'claimed' | 'expired')`
  - `qr_token` (random, non-guessable)
  - `expires_at`
- **BackpayClaims**
  - `id, backpay_record_id, claimed_at, claimed_by_merchant_id`
- **AgentCommissions (optional now or later)**
  - `id, agent_id, merchant_id, month, commission_amount, status ('pending' | 'paid')`

**Plan:**
- Migrate from simple `visits`/`points` to this model.
- Keep the schema minimal but flexible enough for analytics and money flows.

---

### 3. Add proper auth and role-based dashboards

I’ll turn the single-merchant experience into a **multi-role app**:

- **Auth layer**
  - Use Supabase auth (or similar) so each human has a `role`.
- **Routing**
  - `/merchant/...` – only `merchant_user`.
  - `/agent/...` – only `agent`.
  - `/admin/...` – only `admin`.
  - Client web UI is optional now, likely minimal or via magic token link.

- **Dashboards**
  - **Merchant**:
    - “New Transaction” (amount + client phone).
    - “Scan to claim backpay”.
    - Monthly summary.
  - **Agent**:
    - List of their merchants.
    - For each: active/inactive, last activity, fee status.
    - Total expected commission this month.
  - **Admin**:
    - All merchants.
    - All agents.
    - Revenue summary, commissions summary.

**Plan:**
- Introduce a simple **role-based layout** system (one nav per role).
- Protect pages on the server so users don’t see routes outside their role.

---

### 4. Implement the core money flow: “New transaction → backpay → QR → WhatsApp”

This is the heart of RETURNi.

#### 4.1 New transaction (merchant side)

When a client buys:

1. Merchant opens **“New Transaction”** screen.
2. Inputs:
   - Amount
   - Client phone (or scan client’s existing QR that encodes their ID/phone later).
3. System:
   - Looks up/creates the **client** by phone.
   - Creates a **Transaction** record.
   - Calculates **backpay_amount = amount × backpay_percent** (start with 4% fixed).
   - Creates a **BackpayRecord** with status `unclaimed` and a unique `qr_token`.

#### 4.2 Generate QR + WhatsApp link

Using the `qr_token`:

- Create a **link** like:
  - `https://returni.app/bp/<token>`
- Generate:
  - A **QR code** for in-person scanning.
  - A **WhatsApp deep link**:
    - `https://wa.me/<client_phone>?text=<encoded message + link>`
- Show to merchant:
  - Button: **“Open WhatsApp to send QR”**.
  - Merchant taps → WhatsApp opens with pre-filled message → merchant sends it.

**Plan:**
- Replace the existing “scan & add points” page with this **New Transaction** flow.
- Keep the QR + link generation purely on our side, sending itself is manual (their WhatsApp).

---

### 5. Implement the claim flow: “Client returns with QR → merchant scans → backpay claimed”

When client comes back:

1. Client opens WhatsApp message → shows QR (or taps link).
2. Merchant opens **“Scan Backpay”** screen (camera scanner).
3. System:
   - Reads token from QR or from URL.
   - Looks up **BackpayRecord**.
   - If `status = 'unclaimed'` and not expired:
     - Marks as `claimed`.
     - Creates a **BackpayClaim** record.
4. Merchant decides how to apply:
   - For now, we just record it (discount/cash is handled physically).
5. Dashboard updates:
   - Merchant sees total backpay given vs claimed.
   - Client’s history shows that claim has been used (later, if we give them a view).

**Plan:**
- Refactor the current “scan” page to understand **backpay tokens**, not just phone numbers.
- Keep the interface very simple: big camera preview, clear success/error states.

---

### 6. Money side: receipts for merchants, commissions for agents

#### 6.1 Merchant monthly receipts

At month end:

- System computes per merchant:
  - Number of transactions.
  - Total amount processed.
  - Total backpay granted (money they’ve promised to customers).
  - Their **RETURNi fee = $5** for that month.

Merchant UI:

- “Billing” section:
  - Shows this month’s fee and previous months (paid/unpaid).
  - Button to **view/print/download** a simple receipt.

Your process:

- If not paid via EcoCash yet:
  - Agent visits with that summary visible in the dashboard.
  - Collects EcoCash/cash.
  - You (or agent) mark “paid” in the system.

#### 6.2 Agent commissions

For each agent:

- System knows:
  - Which merchants they recruited (via `agent_id` on merchant).
  - Which merchants have **paid** this month.

Commission logic:

- For each **paid merchant**:
  - Commission = **$1.50** (30% of $5) – or whatever you decide.
- Agent dashboard:
  - Shows:
    - “X merchants active this month”
    - “Your expected payout: $Y”
- At month-end:
  - You confirm the numbers and pay via EcoCash.
  - Mark their payout as `paid` for that month.

**Plan:**
- Add simple backend calculations (monthly aggregates) and present them in:
  - Merchant “Billing” view.
  - Agent “Earnings” view.
  - Admin “Revenue & Commissions” view.

---

### 7. Online-first behavior and soft offline support

To match your philosophy but keep merchants sane:

- **Online requirements**:
  - Login.
  - Creating a new transaction (ideally).
  - Claiming backpay (ideally).
  - Viewing dashboards and billing.
- **Soft offline fallback** (short outages only):
  - If network blips for a moment:
    - Queue the transaction (amount, phone, merchant).
    - Mark locally: “Pending sync”.
    - As soon as internet returns:
      - Sync to server.
      - Then generate WhatsApp link and show it.

You can still tell merchants:
- “This is an online system; you must have data.”  
But the implementation won’t kill their business if Econet/Econet misbehaves for 30 seconds.

**Plan:**
- Reuse your existing IndexedDB/Dexie setup, but:
  - Change the data it stores from “points visits” to “pending transactions/backpay creation”.
  - Add clear UI indicators: “X operations pending sync”.

---

### 8. Admin oversight and safety

For you (as founder/admin):

- Simple **Admin dashboard**:
  - Merchants list with:
    - Status (active/inactive).
    - Last activity.
    - Fee status this month.
  - Agents list with:
    - Number of merchants.
    - Expected commissions.
  - High-level numbers:
    - Total merchants.
    - Total monthly fees.
    - Total backpay liability (sum of unclaimed backpay).

- Safety / control:
  - Ability to:
    - Deactivate a merchant (e.g., if they don’t pay or abuse the system).
    - Adjust backpay percentage per merchant (later).

**Plan:**
- Use simple tables + filters first; no need for fancy charts in v1.

---

### 9. Rollout and testing plan (practical, for your neighborhood)

Before touching more merchants:

1. **You + 1–2 trusted merchants**:
   - Run through full flows:
     - New transaction
     - Backpay generation
     - WhatsApp send
     - Client comes back, QR scanned, claim.
   - Confirm:
     - It’s not too slow on cheap Android phones.
     - The UI text makes sense.

2. **Train early agents with a script**:
   - How to pitch to merchants.
   - How to onboard.
   - How to check the dashboard.
   - How their commission shows.

3. **Then invite the first ~10–20 merchants**:
   - Give them the 2-week cancellation window.
   - Make sure you’re reachable for support.

---

### In short – what I will build, in order

1. **Reframe the current app** around transactions + backpay instead of points/visits.
2. **Extend the database** for roles, transactions, backpay records, claims, and commissions.
3. Add **role-based auth and dashboards** for merchant, agent, admin.
4. Build the **New Transaction → backpay + WhatsApp link** flow.
5. Build the **QR-based claim** flow on return visits.
6. Implement **monthly receipts for merchants** and **commission summaries for agents**.
7. Tune the **online-first + soft offline** behavior.
8. Add a **simple admin panel** so you see the whole system.
9. Test with a few real merchants and then roll it to your agents + 20-pilot plan.

If this sequence matches your vision, we can then go step by step implementing it in your existing project.