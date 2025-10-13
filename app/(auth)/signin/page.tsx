"use client";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function SignIn() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function signInWithEmail() {
    setStatus(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setStatus(error ? error.message : "Email envoyé. Vérifiez votre boîte mail.");
  }

  async function signInWithGoogle() {
    setStatus(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) setStatus(error.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4 rounded-2xl border bg-background/60 p-8 shadow-2xl backdrop-blur">
        <h1 className="text-2xl font-semibold">Connexion</h1>
        <input
          type="email"
          className="w-full rounded-md border bg-background p-2"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex gap-2">
          <Button onClick={signInWithEmail}>Lien magique</Button>
          <Button variant="secondary" onClick={signInWithGoogle}>
            Continuer avec Google
          </Button>
        </div>
        {status && <p className="text-sm opacity-80">{status}</p>}
      </div>
    </div>
  );
}


