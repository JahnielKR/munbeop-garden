# Monetization ecosystem — Munbeop Garden

_Date: 2026-06-20 · Status: **APPROVED DIRECTION — implementation DEFERRED to launch** · Owner: solo-dev_

> **Why deferred:** the app still has features/games to ship before launch. The
> exact free⇄premium split can only be finalized once the full launch feature set
> exists. This document locks the **model, prices, rails, legal, and the gating
> _principle + classification framework_** now, so that at launch we just run each
> finished feature through the framework (§4) and build it (§11). Do **not**
> implement gating/billing until the launch feature set is complete.

Grounded in a June-2026 competitor study (Bunpro, WaniKani, Renshuu, Lingory) — see
the `project_monetization_research` memory for raw numbers and sources.

---

## 0. TL;DR

- **Model:** Freemium + subscription + lifetime — the proven shape of this niche, copied from **Bunpro** (our exact analog: a grammar SRS app).
- **Two tiers:** **Sprout (Free)** and **Garden Premium**. Premium has three *purchase options* (monthly / yearly / lifetime), not three feature tiers.
- **Paywall on the ENGINE, not the content.** Free users *read* the whole Library and *try* the loop (**3 practice sessions/day**); Premium unlocks **unlimited practice + full progression**.
- **Cloud sync stays FREE** (table stakes; the old pricing page wrongly sold it — audit finding).
- **Prices:** Monthly **$4.99 / ₩6,500** · Yearly **$44.99 / ₩59,000** · Lifetime **$129 / ₩169,000** (sale → ~$99 / ₩129,000).
- **Rails (both at launch):** **Paddle (Merchant-of-Record)** = the workhorse that serves the actual audience (VN/TH/JP/LATAM + everyone) and absorbs worldwide tax; **PortOne** = the Korean-domestic add-on (KakaoPay/Toss). Paddle integrated first, PortOne before launch. **Not Stripe** (§6).
- **Refund:** 14 days, no questions.
- **Privacy:** keep **"no third-party trackers"** — a real differentiator; name only the payment processor.
- **No grandfathering needed** — current user base is the dev + one friend, so there's no install base to protect.

---

## 1. Why this model (competitor evidence)

| App | Model | Monthly | Yearly | Lifetime | Paywall line | Trackers |
|---|---|---|---|---|---|---|
| **Bunpro** ⭐ | freemium+sub+LT | $5 | $50 | $150 | reading free, **SRS+decks paid** | clean (Stripe only) |
| WaniKani | sub+LT | $9 | $89 | $299 (sale ~$199) | **levels 1–3 free**, rest paid | Google Analytics |
| Renshuu | freemium+sub+LT | $6.99 | $49.99 | ~$110 | generous free, Pro = higher limits | RevenueCat/Sentry/Google |
| Lingory (KO) | freemium+sub | $6.99 | — | none | lessons paid | heavy tracking |

Takeaways: **Bunpro is the template** (same niche/scale/posture); **lifetime is standard** and great for cash-flow; **clean privacy is a differentiator** we already own; **price slightly under Bunpro** to enter as a newcomer.

---

## 2. The gating PRINCIPLE (fixed) + provisional split

**Principle (locked):** the wall is *quantity of practice*, never *access to content*. A free user is never told "you can't see this grammar" — only "you've used today's free practice; go unlimited." This is the least-hostile, highest-converting wall (Bunpro-proven, WaniKani-adjacent). Cloud sync is never gated.

**Provisional split** (to be re-confirmed at launch via §4 once all features exist):

### Sprout (Free)
- Browse the **entire Library** (all TOPIK 1–6 grammar reference, meanings, usage notes).
- **3 practice sessions/day** (a session = one draw of 3 grammar × 3 contexts).
- **Garden**: grows from that practice; all zones visible, full progression naturally capped by the daily limit.
- **Escape-room**: levels **1–2 free** (hook).
- **Stats**: the 4 hero cards only.
- **Cloud sync** ✅ · **8 UI locales** ✅.

### Garden Premium
- **Unlimited practice** (the core unlock — the wall).
- **All decks** + **custom decks / custom grammars / custom contexts**.
- **Full garden progression** (all zones/trees/weather/milestones).
- **All escape-room levels** + **all future games/modes** (decided per-feature at launch).
- **Full stats** (mastery distribution, weekly rhythm, toughest, contexts).
- **Data export (.json)**.

> **Locked sub-decisions:** free daily limit = **3 sessions/day** (A); custom grammars/decks = **Premium** (B). The built-in TOPIK catalog stays fully free to browse.

---

## 3. Prices (locked)

| Option | USD | KRW | Notes |
|---|---|---|---|
| Monthly | **$4.99** | **₩6,500** | entry; just under Bunpro's $5 |
| Yearly | **$44.99** | **₩59,000** | ~2.5 months free; the featured/recommended option |
| Lifetime | **$129** | **₩169,000** | ≈3 years of yearly; **sale → $99 / ₩129,000** |

KRW uses Korean price psychology (round thousands). MoR fees (~5%) + FX absorbed in margin; these are list prices.

### Lifetime guidance (owner Q: "is lifetime good?")
Yes — include it. It funds development upfront and fits long-haul SRS users; it's expected in this niche. Guardrails: (1) price ≈ **3 years of the yearly** so it only "wins" for very long-term users (hence $129, up from the earlier $119); (2) sell via **periodic sales**, not as a permanent cheap option; (3) only commit the lifetime promise **once the launch scope is stable** — "lifetime to everything forever" is a big promise while features are still landing. This is the single biggest reason the whole billing rollout is deferred to launch.

---

## 4. Feature-classification framework (use at launch for each finished feature)

Because more features/games are coming, classify each one at launch with these rules:

1. **Is it content to read/browse?** → **Free** (never gate the catalog).
2. **Is it the practice engine or volume?** → **Premium** (unlimited) / **Free** (limited). The daily cap is the wall.
3. **Is it progression/reward built on practice volume?** (garden zones, trophies) → naturally follows the practice cap; visible to free, fully unlocked via Premium.
4. **Is it a standalone game/mode (e.g. escape-room, future games)?** → first 1–2 units **Free** as a hook, rest **Premium**.
5. **Is it a power-user authoring tool?** (custom grammars/decks/contexts) → **Premium**.
6. **Is it depth/insight?** (advanced stats, detailed breakdowns) → teaser **Free**, full **Premium**.
7. **Is it table stakes / data ownership?** (sync, account, data export-as-portability) → **Free** (sync) or low-friction; never weaponize lock-in.

At launch: list every shipped feature, run it through 1–7, and freeze the split.

---

## 5. Purchase points (where the upsell lives)

1. **`/pricing` page** — honest 2-tier with the 3 Premium options (§8).
2. **Soft paywall modal** — when a free user finishes the day's 3rd session: _"That's today's free practice — go unlimited."_ (highest-intent moment).
3. **Locked escape-room / game units** — "Premium" stamp → CTA.
4. **Stats teaser** — hero cards free, the rest blurred with a "Garden Premium" overlay → CTA.
5. **Settings → "Garden Premium"** — current plan, renewal date, manage/upgrade, restore purchase, billing-portal link.
6. **Account menu badge** — "Premium" plaque vs "Upgrade" link.
7. **Trial-ending banner** — days 25–30 → CTA.
8. **Onboarding** — one subtle mention at the end of first-run.

All CTAs route through a single `useCheckout()` that opens the right rail (Paddle by default; PortOne for KR users).

---

## 6. Payment rails (architecture)

**Why not Stripe:** (1) **MoR vs PSP** — Stripe is a processor, so *you* remain merchant of record and owe **VAT/sales-tax worldwide** (EU OSS, UK, ~45 US states, JP, AU…); a Merchant-of-Record (Paddle/Lemon Squeezy) is the legal seller and handles all of it. (2) **Korea** — Stripe doesn't offer merchant accounts to Korea-based businesses; using it needs a foreign entity (Stripe Atlas US LLC) + US tax.

**Decision (both at launch):**
- **Paddle (MoR) — the workhorse.** One integration sells to every country with tax handled. **This is what actually serves the stated audience (Vietnamese, Thai, Japanese, Latinos) and everyone else.** Integrate first.
- **PortOne (아임포트) — the Korea add-on.** Native **KakaoPay / Toss / Naver Pay / local cards** in KRW for **Korean** buyers specifically (it does *not* cover VN/TH/JP/LATAM — Paddle does). Needs **사업자등록** (feasible, Korea-resident). Integrate before launch as requested, as the second rail.
- **Avoid web→App/Play IAP** (30% cut). If native (Capacitor) ships later, store IAP becomes mandatory *there* — separate track.

**Rail selection at checkout:** default Paddle; offer PortOne when the user's locale/region is Korea (and let them choose). `useCheckout()` abstracts this.

**Integration shape (Paddle, same pattern for PortOne):**
```
client CTA → Paddle Checkout (overlay/hosted)
           → Paddle webhook (subscription.created/updated/canceled, transaction.completed)
           → Supabase Edge Function (verify provider signature)
           → upsert user_entitlements (service-role only)
client reads entitlement (RLS: own row) → gates features reactively
```
Entitlement is **server-authoritative** (webhook-driven), never set by the client.

---

## 7. Data model (Supabase)

New table `user_entitlements` (one row/user), written ONLY by the webhook Edge Function (service role); user reads own row.

| column | type | notes |
|---|---|---|
| `user_id` | uuid PK FK→auth.users | owner |
| `plan` | text | `free` \| `premium` |
| `source` | text | `trial` \| `paddle` \| `portone` |
| `status` | text | `active` \| `canceled` \| `expired` |
| `is_lifetime` | boolean | true for lifetime purchase |
| `current_period_end` | timestamptz null | recurring; null for lifetime |
| `trial_ends_at` | timestamptz null | set at signup (+30d) |
| `provider_customer_id` | text null | Paddle/PortOne customer id |
| `provider_subscription_id` | text null | for cancel/manage |
| `updated_at` | timestamptz | |

- **RLS:** `select` where `auth.uid() = user_id`; **no** client writes (webhook service-role only).
- **Derived `isPremium`** (client): `plan==='premium' && (is_lifetime || status==='active' || now < trial_ends_at)`. Centralize in `useEntitlement()` + an auth-adjacent store; gate every feature off it.
- **No grandfather backfill needed** (user base = dev + one friend). At launch, those two accounts can simply be set to premium manually via the table.
- Entitlements are read-mostly + webhook-written, so they live **outside** the per-key `StorageAdapter` (a dedicated read in `useEntitlement`), not as a `STORAGE_KEYS` entry.

---

## 8. `/pricing` rewrite (do at launch)

Replace the placeholder (Sprout/Grove/Forest selling already-free features — audit-flagged) with the honest 2-tier model:
- **Sprout (Free)** card: free feature list (browse Library, 3 practice/day, escape-room L1–2, sync, 8 locales).
- **Garden Premium** card (featured): the unlock list + a **3-way price toggle** (Monthly / Yearly⭐ / Lifetime); KRW for KR locale, USD otherwise.
- All copy as **i18n keys** in 8 locales (current page is hardcoded English — audit finding). New keys: `pricing.tiers.*`, `pricing.cta.*`, `pricing.cadence.*`.
- Extend `tests/unit/settings/stale-copy.test.ts` to assert the page renders from i18n and the free tier drops any paid-gated wording.

---

## 9. Legal (privacy & terms)

- **Keep "no third-party trackers."** With Paddle as MoR, **Paddle is the seller** and must be named in the privacy policy (payment data goes to Paddle/PortOne, not us) — that's a *payment-processor* disclosure, not a tracker, so the promise holds. (Contrast: WaniKani=GA, Renshuu=RevenueCat/Sentry/Google.)
- **Refund:** **14 days, no questions** (locked — owner: 60 is overkill, 2 weeks is plenty). EU's 14-day statutory aligns and is handled by Paddle anyway.
- **Cancellation:** anytime; access until period end (no immediate cut). Lifetime is non-recurring.
- **Content ownership:** the user owns their custom grammars/decks/contexts; data export honors portability.
- Replace the `TODO(v8.1)` placeholder copy on `/policies`, `/pricing`, `/features` with real, i18n'd text (audit follow-up).

---

## 10. Phased rollout (all at/just-before launch — DEFERRED until feature-complete)

- **Phase 0 — Honest pricing + entitlement skeleton (no charging).** Rewrite `/pricing` (i18n, 2-tier), add `user_entitlements` table + RLS + `useEntitlement()`, show plan in Settings/Account. Can land a bit earlier (removes the misrepresentation) but isn't urgent pre-launch. _(medium)_
- **Phase 1 — Paddle integration + gating + trial.** Paddle account/products, `useCheckout()`, webhook Edge Function, 30-day no-CC trial, the feature gates (3/day cap, premium games/levels, stats teaser, custom decks), purchase-point UX (§5). _(large)_
- **Phase 2 — PortOne (Korea) rail.** 사업자등록, PortOne integration (KakaoPay/Toss), KRW live for KR users, dual-rail selection in `useCheckout()`. Before launch, per owner. _(large)_
- **Phase 3 — Growth.** Lifetime sales, student discount, win-back/trial-ending emails (needs telemetry + email infra from audit follow-ups). _(medium)_

**Pre-implementation gate:** the launch feature set must be complete; then run §4 over every feature to freeze the split before Phase 1.

---

## 11. Model pros/cons for a solo-dev

- **Subscription** — predictable recurring revenue, but demands continuous content to justify renewals; constant churn.
- **Lifetime** — cash upfront (funds dev + Supabase), fits long-haul SRS users; but mortgages future revenue against perpetual cost → sell via sales, price ≈3yr.
- **Freemium** — maximizes trials; converts only if the wall sits on the engine, not the content.
- **The Bunpro combo (all three)** is the niche's proven equilibrium and what this plan adopts.

---

## 12. Locked decisions (2026-06-20)

| # | Decision | Choice |
|---|---|---|
| A | Free daily practice limit | **3 sessions/day** |
| B | Custom grammars/decks | **Premium** |
| C | Prices | **§3 confirmed** (lifetime nudged to $129/₩169,000 for ~3yr) |
| D | Grandfather existing users | **Not needed** (user base = dev + friend) |
| E | Refund window | **14 days, no questions** |
| F | Payment rails | **Both at launch — Paddle first (serves the real audience), PortOne second (Korea-domestic)** |

**Remaining at launch:** enumerate the full shipped feature set, classify each via §4, freeze the split, then execute §10.
