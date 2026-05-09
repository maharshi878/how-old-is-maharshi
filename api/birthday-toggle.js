global.testBirthdayMode =
  global.testBirthdayMode || false;

export default function handler(req, res) {
  const { keyword } = req.query;

  if (
    !keyword ||
    keyword !== process.env.BIRTHDAY_SECRET
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid keyword",
    });
  }

  global.testBirthdayMode = true;

  return res.status(200).json({
    success: true,
    message:
      "Birthday mode enabled for next request",
  });
}
