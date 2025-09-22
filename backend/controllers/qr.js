// backend/src/controllers/qr.js
import QRCode from "qrcode";
import * as Jimp from "jimp";

import { supabaseServer } from "../lib/supabase.js";

export const generateQR = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text required" });

    // 1) try to authenticate incoming user via Bearer token (optional)
    const authHeader = req.headers.authorization || "";
    let userId = null;
    let plan = "FREE";

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const { data: userData, error: userErr } =
        await supabaseServer.auth.getUser(token);
      if (!userErr && userData?.user) {
        userId = userData.user.id;
        // fetch profile plan
        const { data: profile, error: profileErr } = await supabaseServer
          .from("profiles")
          .select("plan")
          .eq("id", userId)
          .maybeSingle();
        if (!profileErr && profile) plan = profile.plan ?? "FREE";
      }
    }

    // 2) enforce limit for FREE authenticated users (5 per day)
    if (userId && plan === "FREE") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { count, error: cntErr } = await supabaseServer
        .from("qrs")
        .select("id", { count: "exact", head: false })
        .eq("user_id", userId)
        .gte("created_at", startOfDay.toISOString());
      const used = cntErr ? 0 : count || 0;
      if (used >= 5) {
        return res
          .status(403)
          .json({ error: "Daily limit reached — upgrade to Pro" });
      }
    }

    // 3) make QR (high error correction so logo works later)
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 1,
      scale: 6,
    });

    let finalDataUrl = dataUrl;

    // 4) add watermark for FREE/unauthenticated users (server side)
    if (!userId || plan === "FREE") {
      const imgBuffer = Buffer.from(dataUrl.split(",")[1], "base64");
      const image = await Jimp.read(imgBuffer);
      const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
      const textToPrint = "Generated with QRApp — upgrade to remove";
      // position bottom-left with small padding
      const x = 10;
      const y = image.bitmap.height - 24;
      image.print(font, x, y, textToPrint);
      const outBuf = await image.getBufferAsync(Jimp.MIME_PNG);
      finalDataUrl = `data:image/png;base64,${outBuf.toString("base64")}`;
    }

    // 5) save record (if authenticated) for counting/history
    if (userId) {
      await supabaseServer.from("qrs").insert([{ user_id: userId, text }]);
    }

    return res.json({ qr: finalDataUrl });
  } catch (err) {
    console.error("generateQR error:", err);
    return res.status(500).json({ error: "server error" });
  }
};
