"use client";
import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [text, setText] = useState("");
  const [qrCode, setQrCode] = useState("");

  const handleGenerate = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/qr/generate", {
        text,
      });
      setQrCode(res.data.qrCode);
    } catch (error) {
      console.error("QR generation failed:", error);
      alert("Something went wrong generating QR code");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-500 p-6">
      <h1 className="text-3xl font-bold mb-6">QR Code Generator</h1>

      <input
        type="text"
        placeholder="Enter text or URL"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="border rounded-lg px-4 py-2 w-80 mb-4"
      />

      <button
        onClick={handleGenerate}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
      >
        Generate
      </button>

      {qrCode && (
        <div className="mt-6">
          <img src={qrCode} alt="Generated QR Code" className="border p-2" />
        </div>
      )}
    </div>
  );
}
