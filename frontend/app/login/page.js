"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  // Signup
  async function handleSignup() {
    const { data, error } = await supabase.auth.signUp({ email });
    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;
    if (user) {
      await axios.post("http://localhost:5000/api/user", {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name || "",
      });
    }

    alert("Check your email for a magic login link!");
  }

  // Login
  async function handleLogin() {
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      alert(error.message);
      return;
    }

    // Supabase doesn’t return full user immediately here,
    // so we fetch session afterwards
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await axios.post("http://localhost:5000/api/user", {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name || "",
      });
    }

    alert("Check your email for login link!");
  }

  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-2xl font-bold mb-4">Login / Signup</h1>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border px-4 py-2 rounded mb-2"
      />
      <div className="flex gap-4">
        <button
          onClick={handleSignup}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Signup
        </button>
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}
