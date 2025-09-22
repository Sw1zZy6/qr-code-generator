import { supabase } from "../lib/supabaseClient";
import { syncUser } from "../utils/syncUser";

export default function SignupPage() {
  async function handleSignup(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
      return;
    }

    // ✅ Sync with backend
    await syncUser();
    alert("Signed up and synced!");
  }

  return (
    <form onSubmit={handleSignup}>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Sign Up</button>
    </form>
  );
}
