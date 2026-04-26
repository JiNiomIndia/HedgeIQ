# The AI advisor

The AI advisor is a chat panel on the right side of the dashboard. It's powered by Claude (Anthropic). You ask questions in plain English about options, hedging, or any unfamiliar term, and you get a streaming answer that's tailored to your portfolio context.

![AI advisor chat with question and streaming response](/help-screenshots/ai-advisor.svg)

## What it does

Three things, primarily:

1. **Explains options in plain English.** Type *"What's a protective put?"* and you'll get a paragraph that's actually useful, not a Wikipedia regurgitation. Ask follow-ups and the conversation continues with context.
2. **Walks through specific recommendations.** When you've run the hedge calculator, click **Explain** on any of the three cards. The advisor opens a chat with that specific contract pre-loaded as context: *"Why is the $10 strike a better deal than the $10.50?"*
3. **Answers questions about your positions.** It has read-only context about which tickers you hold and how many shares — so *"Which of my holdings should I be most worried about going into earnings season?"* gets a real answer based on the upcoming earnings dates of stocks in your portfolio.

It does **not**:

- Give personalized financial advice or recommend specific trades. The product disclaimer makes this explicit and the advisor itself is prompted to refuse.
- Have access to your account balances, your bank info, or anything beyond the symbols and quantities of your positions.
- Execute trades, place orders, or change anything. It's read-only conversation.

## How to ask a question

Two ways:

### Type and press Enter

The simplest. The chat input at the bottom of the panel takes free text. Press Enter (or click the send arrow) to submit. The response streams in word-by-word; you can read it as it appears.

### Click a quick-reply chip

Above the input field, four to six chips appear with common questions: *"Explain the calculator results,"* *"What's IV?"*, *"Should I hedge before earnings?"*. Clicking one sends the question for you. The chips refresh based on what you've recently done in the dashboard — clicked a position, ran the calculator, etc.

## Streaming responses

Responses arrive incrementally — you don't wait for the full answer to render. This matches how Claude generates text under the hood and makes long answers feel faster. While streaming, the input is locked and a small "stop" button appears next to the send arrow if you want to interrupt.

If your network drops mid-response, the partial answer is preserved. Refresh and re-ask if you want a full answer.

## Multi-turn conversation

Each message in the chat retains context from the previous messages within the same session. *"Tell me about protective puts → How does that compare to a collar? → Which would be cheaper for AAL?"* — the advisor stitches the conversation together.

A "session" is one continuous chat. When you click **Clear**, the conversation history is wiped and the next message starts fresh. The advisor doesn't remember anything across sessions, which is intentional — privacy by default.

## Daily limits

Free tier: **5 calls per day**, resetting at midnight UTC.

Pro tier: **unlimited**.

A "call" is one message you send. Streaming a long response counts as one call regardless of length. Clicking **Explain** on a hedge calculator card counts as one call.

When you hit the limit, the input disables and a banner appears: *"You've used today's 5 AI calls. Reset in 4h 12m."* You can still browse, run the hedge calculator, and use the dashboard — only the AI is rate-limited.

See [/help/11-daily-limits](/help/11-daily-limits) for more on what counts and what doesn't.

## Privacy

We never send your personally identifiable information to Claude. Specifically:

- Your email is **not** sent.
- Your password and authentication tokens are **not** sent.
- Your broker connection details and account numbers are **not** sent.
- The model only sees: the symbols and share counts of your positions (so it can answer questions about them), and the conversation transcript itself.

Anthropic's data retention policy means your conversation may be logged on their side for a limited window for abuse monitoring. Anthropic does **not** train models on API conversations by default, and HedgeIQ's API integration uses the standard non-training contract.

If you want to be extra careful, don't paste anything sensitive into the chat. The advisor doesn't need it to do its job.

## The "Clear" button

Top-right of the chat panel. Wipes the conversation history. There's no undo. Use this when:

- You're done with a topic and want to start a fresh thread.
- You've shared something specific (a position, a number) and don't want it to influence the next question.
- You're handing the screen to someone else.

## Why Claude?

We chose Claude over alternatives for three reasons:

1. **Refusal behavior on financial advice.** Claude's training makes it unusually careful about giving specific trade recommendations, which matches our product disclaimer. We don't want the AI making concrete buy/sell calls.
2. **Long context windows.** Claude's 200k token context means we can include your entire position list plus the conversation history without truncation.
3. **Streaming quality.** Token-by-token streaming feels noticeably faster than competing models for users.

The model version we currently use is `claude-3-5-sonnet-latest`. We may upgrade as new versions ship.

## Tips for better answers

- **Be specific.** *"Should I hedge AAL?"* gets a vague answer. *"I own 5,000 shares of AAL at $11.30 and earnings is in 3 weeks. What hedging strategies are worth considering?"* gets a useful answer.
- **Ask for comparisons.** Claude is good at *"compare X to Y."* Use that.
- **Push back.** If the answer feels generic, ask *"why specifically for my position?"* and you'll usually get something tailored.
- **Use it for vocabulary.** Anytime you see a term you don't know — IV, theta, contango, whatever — paste it in and ask. Faster than Googling.
