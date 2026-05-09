const COOKIE_NAME = "birthday_mode";
const COOKIE_VALUE = "enabled";

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

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return null;
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) {
    return null;
  }

  return JSON.parse(raw);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

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
      maxAge: 300,
      path: "/api",
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
