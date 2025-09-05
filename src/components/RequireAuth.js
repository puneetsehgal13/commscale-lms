// src/components/RequireAuth.js
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "../lib/supabase";

export default function RequireAuth({ children }) {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) return null; // loading
  if (!session) {
    window.location.href = "/auth";
    return null;
  }
  return children;
}

RequireAuth.propTypes = {
  children: PropTypes.node,
};
