// ============================================================
// howOldIsMaharshi — Vercel Serverless Function
// Returns Maharshi's exact age, down to the millisecond.
// Special effects if called on his birthday (Nov 2).
// Supports one-time birthday test mode.
// ============================================================

const BIRTHDAY_MONTH = 10;
const BIRTHDAY_DAY = 2;

const BIRTH = new Date("2010-11-02T09:15:00+05:30");

global.testBirthdayMode =
  global.testBirthdayMode || false;

export default function handler(req, res) {
  const now = new Date();

  let years =
    now.getFullYear() - BIRTH.getFullYear();

  let months =
    now.getMonth() - BIRTH.getMonth();

  let days =
    now.getDate() - BIRTH.getDate();

  if (days < 0) {
    months--;

    const prevMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    );

    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const msAlive = now - BIRTH;

  const totalDays = Math.floor(
    msAlive / (1000 * 60 * 60 * 24)
  );

  const totalHours = Math.floor(
    msAlive / (1000 * 60 * 60)
  );

  const totalMinutes = Math.floor(
    msAlive / (1000 * 60)
  );

  const totalSeconds = Math.floor(
    msAlive / 1000
  );

  let nextBday = new Date(
    now.getFullYear(),
    BIRTHDAY_MONTH,
    BIRTHDAY_DAY
  );

  if (nextBday <= now) {
    nextBday = new Date(
      now.getFullYear() + 1,
      BIRTHDAY_MONTH,
      BIRTHDAY_DAY
    );
  }

  const daysUntilBday = Math.ceil(
    (nextBday - now) /
      (1000 * 60 * 60 * 24)
  );

  const actualBirthday =
    now.getMonth() === BIRTHDAY_MONTH &&
    now.getDate() === BIRTHDAY_DAY;

  const testMode =
    global.testBirthdayMode === true;

  global.testBirthdayMode = false;

  const isBirthday =
    actualBirthday || testMode;

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Content-Type",
    "application/json"
  );

  const base = {
    name: "Maharshi",

    born: "2nd November 2010",

    location: "Bharuch, Gujarat, India",

    age: {
      years,
      months,
      days,
    },

    precise: {
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      millisecondsAlive: msAlive,
    },

    nextBirthday: {
      date: "2nd November",
      daysAway: isBirthday
        ? 0
        : daysUntilBday,
    },

    currentlyBuilding: [
      "FreelanceCFO",
      "TrustLens",
    ],

    isBirthday,

    debug: {
      actualBirthday,
      testMode,
    },

    timestamp: now.toISOString(),
  };

  if (isBirthday) {
    return res.status(200).json({
      ...base,

      cake: true,

      message: `🎉 IT'S MAHARSHI'S BIRTHDAY! He is ${years} years old today. Go wish him: hello@maharshis.tech`,

      specialEdition: {
        cakeSlices: years,

        candles: years,

        yearsOfChaos: years,

        hoursAlive: totalHours,

        funFact: `Maharshi has been shipping software for roughly ${Math.floor(
          years * 0.4
        )} of his ${years} years on this planet.`,

        wishHim:
          "https://maharshis.tech/#contact",

        confetti:
          "🎊🎂🎉🥳🎈🎁🎊🎂🎉🥳🎈🎁",
      },
    });
  }

  return res.status(200).json({
    ...base,

    message: `Maharshi is ${years} years, ${months} months, and ${days} days old. He has been alive for ${totalDays.toLocaleString()} days and has used most of them to build things.`,
  });
}
