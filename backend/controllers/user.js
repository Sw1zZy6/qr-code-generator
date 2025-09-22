import prisma from "../lib/prisma.js";

export const createOrUpdateUser = async (req, res) => {
  try {
    const { id, email, fullName } = req.body;

    const user = await prisma.profile.upsert({
      where: { id },
      update: {
        fullName,
      },
      create: {
        id,
        fullName,
        plan: "FREE",
      },
    });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user profile" });
  }
};
