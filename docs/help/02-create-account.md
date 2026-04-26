# Creating your account

You don't need a credit card and you don't need to verify a phone number. You'll be on the dashboard in under thirty seconds.

## Step-by-step

### 1. Go to the landing page

Visit [hedgeiq.app](/) (or wherever you're reading this — the **Open the app** button at the top right will get you there).

### 2. Click "Get started — free"

The primary call-to-action button on the hero section. There's also a **Sign in** link in the navbar if you already have an account; clicking that and then choosing "Create one" works equally well.

### 3. Enter an email and a password

Two fields. Two requirements:

- Your email has to look like an email — `you@example.com`. We use it to identify your account; we don't send marketing.
- Your password has to be at least **8 characters**. We hash passwords with PBKDF2 (600k iterations, SHA-256). Use a password manager if you can.

We don't currently require email verification. That's a feature we'll add at GA, but during the open beta we keep the friction low.

![HedgeIQ sign-up form](/help-screenshots/signup.svg)

### 4. You're in

Sign-up sends you straight to the dashboard. There's no welcome email, no setup wizard, no tour you have to dismiss. The next thing you'll want to do is [connect a broker](/help/03-connect-broker) — there's a big button waiting for you in the empty positions panel.

## Free tier vs Pro

Both tiers include unlimited dashboard access, unlimited broker connections, and unlimited hedge-calculator runs. The difference is the AI advisor:

| Feature                          | Free                | Pro                   |
| -------------------------------- | ------------------- | --------------------- |
| Connected brokers                | Unlimited           | Unlimited             |
| Live positions view              | Unlimited           | Unlimited             |
| Hedge calculator runs            | Unlimited           | Unlimited             |
| Options chain lookups            | Unlimited           | Unlimited             |
| AI advisor calls per day         | **5**               | Unlimited             |
| Streaming responses              | Yes                 | Yes                   |
| Multi-turn conversation          | Yes                 | Yes                   |
| Priority support                 | No                  | Yes                   |
| Export to CSV                    | Coming soon         | Coming soon           |

A "call" is a question you ask the AI advisor or a row you click that triggers an "explain this option" pop-up. Loading the dashboard, refreshing positions, or browsing the options chain doesn't count.

Pricing for Pro will be finalized when we leave beta. Free-tier users will be grandfathered in for at least 30 days after pricing announcement, with plenty of warning.

## What if I forget my password?

Right now, password recovery isn't self-serve. We're an early-stage product and the security of getting recovery flow right matters more than shipping it on day one. If you've forgotten your password, **email [contact@hedgeiq.app](mailto:contact@hedgeiq.app)** from the email address you signed up with and we'll reset it manually, usually within a few business hours.

If you remember your password but want to change it, that flow lives in **Settings → Account** (coming in the next release). For now, contact support and we'll handle it.

## Why no email verification?

Two reasons:

1. **Friction.** Beta users want to evaluate the product, not click a link in their inbox.
2. **Trust model.** During beta the email is just an identifier. It doesn't gate sensitive actions because there *aren't* any sensitive actions yet — we don't move money, we don't trade, and we don't store anything you'd be embarrassed to see leak. (We don't *want* to leak anything either, of course; see the [security page](/security) for what we do.)

When we add billing, we'll add email verification at the same time.

## Security notes

- Passwords are never stored in plain text. We use PBKDF2-HMAC-SHA256 with 600,000 iterations and a per-user random salt.
- Sessions use signed JWT tokens with a 7-day expiry, stored in `httpOnly` cookies.
- HedgeIQ is served over HTTPS only (HSTS preloaded).
- Rate limits cap login attempts at 10 per minute per IP to slow brute-force attempts.

If you found a security issue, please email [contact@hedgeiq.app](mailto:contact@hedgeiq.app) — we have a responsible-disclosure policy and we'll respond within 24 hours.
