# Gemini API Setup Guide

A complete reference for setting up the Google Gemini API in a Next.js project, based on a working implementation.

---

## 1. Get Your API Key

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **"Create API Key"**
3. Copy the key — it starts with `AIzaSy...`

> **Keep this key secret.** Never commit it to GitHub. It should only ever live in `.env.local`.

---

## 2. Install the Package

```bash
npm install @google/generative-ai
```

The version that works reliably is **`^0.24.1`**. Your `package.json` should have:

```json
"@google/generative-ai": "^0.24.1"
```

---

## 3. Add the Key to `.env.local`

Create a `.env.local` file in the **root of your project** (same level as `package.json`):

```env
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyYOUR_KEY_HERE
```

> **Important:** The prefix `NEXT_PUBLIC_` is required if you call Gemini from **client-side** components (browser). If you call it only from server-side API routes, use `GEMINI_API_KEY` (no prefix) instead — but client-side is what works in this setup.

Make sure `.env.local` is in your `.gitignore`:

```
# .gitignore
.env.local
```

---

## 4. Create the Gemini Helper File

Create `src/lib/gemini.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

// ✅ Working model name — DO NOT change unless you know a newer stable one
// Model: gemini-3-flash-preview
// This is the fast, free-tier compatible model that works with the SDK above.

export async function getGeminiResponse(
  prompt: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[] = []
) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    const chat = model.startChat({
      history: [
        // Optional: inject a system prompt via the first exchange
        {
          role: 'user',
          parts: [{ text: 'You are a helpful assistant.' }],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood! How can I help you?' }],
        },
        ...history, // pass previous messages for multi-turn chat
      ],
    })

    const result = await chat.sendMessage(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini error:', error)
    throw error
  }
}
```

---

## 5. The Correct Model Name

> ⚠️ This is the most common source of errors. Using wrong model names causes silent failures or `404` errors.

| Model Name | Status | Use Case |
|---|---|---|
| `gemini-3-flash-preview` | ✅ **Works — use this** | Fast, multi-turn chat, free tier |
| `gemini-1.5-flash` | ✅ Works (older) | Fallback if above fails |
| `gemini-1.5-pro` | ✅ Works | Higher quality, slower |
| `gemini-pro` | ⚠️ Deprecated | Avoid |
| `gemini-ultra` | ❌ Not in SDK | Do not use |
| `gemini-2.0-flash-exp` | ⚠️ Experimental | May break |

**Use `gemini-3-flash-preview` for all new projects** — it is the fastest, free, and currently working.

---

## 6. Using It in a Component

```typescript
'use client'

import { getGeminiResponse } from '@/lib/gemini'

const handleAsk = async () => {
  const response = await getGeminiResponse('Explain photosynthesis simply.')
  console.log(response)
}
```

For **multi-turn chat** (remembering conversation history):

```typescript
const history = [
  { role: 'user', parts: [{ text: 'What is a p-value?' }] },
  { role: 'model', parts: [{ text: 'A p-value is the probability...' }] },
]

const response = await getGeminiResponse('Give an example.', history)
```

---

## 7. Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `API key not valid` | Key is wrong or not loaded | Check `.env.local`, restart `npm run dev` |
| `Model not found` | Wrong model name string | Use `gemini-3-flash-preview` exactly |
| `undefined` response | Key missing `NEXT_PUBLIC_` prefix | Add `NEXT_PUBLIC_` to the env var name |
| Works locally, fails on Vercel | Env var not set in Vercel dashboard | Go to Vercel → Project → Settings → Env Variables → add it there |
| `CORS error` | Calling Gemini from server without proper setup | Use `NEXT_PUBLIC_` for client-side calls |

---

## 8. Vercel Deployment Checklist

When deploying to Vercel, environment variables must be added **manually** in the dashboard:

1. Go to your project on [vercel.com](https://vercel.com)
2. **Settings → Environment Variables**
3. Add: `NEXT_PUBLIC_GEMINI_API_KEY` = `AIzaSy...`
4. Set environment to **Production**, **Preview**, and **Development**
5. Click **Save** → Redeploy

> `.env.local` is never uploaded to GitHub or Vercel — you must always add it in the dashboard.

---

## Quick Reference Card

```
Package:    npm install @google/generative-ai@^0.24.1
Model:      gemini-3-flash-preview
Env var:    NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...
File:       src/lib/gemini.ts
```
