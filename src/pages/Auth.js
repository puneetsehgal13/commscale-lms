// src/pages/Auth.js
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function AuthPage() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div style={{ maxWidth: 420, margin: "80px auto" }}>
      <h2 style={{ textAlign: "center" }}>Commscale LMS — Sign in</h2>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]}
        redirectTo={`${window.location.origin}/dashboard`}
      />
    </div>
  );
}
