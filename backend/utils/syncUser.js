import { supabase } from "../lib/supabaseClient";
import axios from "axios";

export async function syncUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    console.error("No session, user not logged in.");
    return;
  }

  const token = session.access_token;

  await axios.post(
    "http://localhost:5000/api/user", // backend endpoint
    { id: session.user.id, email: session.user.email },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}
