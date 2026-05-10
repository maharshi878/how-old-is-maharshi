const COOKIE_NAME = "birthday_mode";
const COOKIE_VALUE = "enabled";
const COOKIE_MAX_AGE_SECONDS = 300;

function buildCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (options.path) {
    parts.push(`Path=${options.path}`);
  }

  if (options.httpOnly) {
    parts.push("HttpOnly");
  }

  if (options.secure) {
    parts.push("Secure");
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  return parts.join("; ");
}

async function parseJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }

  return await new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
    });

    req.on("end", () => {
      if (!raw) {
        resolve(null);
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://www.maharshis.tech"
  );
  
  res.setHeader(
    "Access-Control-Allow-Credentials",
    "true"
  );
  let body;
  try {
    body = await parseJsonBody(req);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON",
    });
  }

  const keyword =
    typeof body?.keyword === "string"
      ? body.keyword.trim()
      : "";

  if (!keyword) {
    return res.status(400).json({
      success: false,
      message: "Keyword required",
    });
  }

  if (keyword !== process.env.BIRTHDAY_SECRET) {
    return res.status(401).json({
      success: false,
      message: "Invalid keyword",
    });
  }

  res.setHeader(
    "Set-Cookie",
    buildCookie(COOKIE_NAME, COOKIE_VALUE, {
      maxAge: COOKIE_MAX_AGE_SECONDS,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    })
  );
  res.setHeader("Cache-Control", "no-store");

  return res.status(200).json({
    success: true,
    message:
      "Birthday mode enabled for next request",
  });
}
