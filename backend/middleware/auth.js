import jwt from "jsonwebtoken";

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

export const verifyAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET);
    req.user = decoded; // user info now available in controllers
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
