# howOldIsMaharshi

> A Vercel serverless function that returns my exact age on every API call.
> 
> Because hardcoding `age: 15` is not how builders think.

**Live:** `https://apis.with.maharshis.tech/howOldIsMaharshi`

---

## Response

```json
{
  "name": "Maharshi",
  "born": "2nd November 2010",
  "location": "Surat, Gujarat, India",
  "age": {
    "years": 15,
    "months": 5,
    "days": 8
  },
  "precise": {
    "totalDays": 5242,
    "totalHours": 125808,
    "totalMinutes": 7548480,
    "totalSeconds": 452908800
  },
  "nextBirthday": {
    "date": "2nd November",
    "daysAway": 206
  },
  "currentlyBuilding": ["FreelanceCFO", "TrustLens"],
  "isBirthday": false,
  "message": "Maharshi is 15 years, 5 months, and 8 days old. He has been alive for 5,242 days and has used most of them to build things.",
  "timestamp": "2026-04-10T12:00:00.000Z"
}
```

## 🎂 Birthday response (Nov 2 only)

```json
{
  "isBirthday": true,
  "cake": true,
  "message": "🎉 IT'S MAHARSHI'S BIRTHDAY! He is 16 years old today. Go wish him: hello@maharshis.tech",
  "specialEdition": {
    "cakeSlices": 16,
    "candles": 16,
    "yearsOfChaos": 16,
    "funFact": "Maharshi has been shipping software for roughly 6 of his 16 years on this planet.",
    "wishHim": "https://maharshis.tech/#contact",
    "confetti": "🎊🎂🎉🥳🎈🎁🎊🎂🎉🥳🎈🎁"
  }
}
```

---

## Deploy

```bash
# 1. Clone / copy this folder
# 2. Install Vercel CLI
npm i -g vercel

# 3. Deploy
vercel --prod

# 4. Visit
# https://your-project.vercel.app/api/howOldIsMaharshi
```

No dependencies. No npm install needed. Pure Node.js.

---

## Use in your portfolio

```js
const res = await fetch("https://howoldismaharshi.vercel.app/api/howOldIsMaharshi");
const data = await res.json();
document.getElementById("age").textContent = data.age.years;

if (data.isBirthday) {
  // 🎉 go wild
}
```

---

*Built by [Maharshi](https://maharshis.tech) — because hardcoding your age is a code smell.*
