import { useState } from "react";
import QRCode from "qrcode";

export default function QRGenerator() {
  const [text, setText] = useState("");
  const [dataUrl, setDataUrl] = useState(null);

  async function generate() {
    if (!text) return;
    try {
      const url = await QRCode.toDataURL(text);
      setDataUrl(url);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} placeholder="Enter URL or text" />
      <button onClick={generate}>Generate</button>

      {dataUrl && (
        <div>
          <img src={dataUrl} alt="qr" />
          <a href={dataUrl} download="qrcode.png">Download PNG</a>
        </div>
      )}
    </div>
  );
}
