// src/pages/Courses.js
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      setUserId(sessionData?.session?.user?.id || null);

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setCourses(data || []);
      setLoading(false);
    })();
  }, []);

  const enroll = async (courseId) => {
    if (!userId) return;
    const { error } = await supabase
      .from("enrollments")
      .insert({ user_id: userId, course_id: courseId });
    if (error) alert(error.message);
    else alert("Enrolled!");
  };

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Courses</h2>
      {courses.length === 0 ? (
        <p>No courses yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {courses.map((c) => (
            <li
              key={c.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <strong>{c.title}</strong>
              <div style={{ marginTop: 6, color: "#555" }}>
                {c.description || "No description"}
              </div>
              <button style={{ marginTop: 8 }} onClick={() => enroll(c.id)}>
                Enroll
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
