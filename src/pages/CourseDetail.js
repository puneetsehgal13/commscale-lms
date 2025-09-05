// src/pages/CourseDetail.js
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

export default function CourseDetail() {
  const { id: courseId } = useParams();
  const [userId, setUserId] = useState(null);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progressMap, setProgressMap] = useState({}); // lessonId -> completed:boolean
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id || null;
      setUserId(uid);

      // fetch course
      const { data: courseData, error: cErr } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (cErr) {
        setErrorText(cErr.message || "Failed to load course.");
        setLoading(false);
        return;
      }
      setCourse(courseData);

      // fetch lessons for this course
      const { data: lessonData, error: lErr } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (lErr) {
        setErrorText(lErr.message || "Failed to load lessons.");
        setLoading(false);
        return;
      }
      setLessons(lessonData || []);

      if (uid && (lessonData?.length || 0) > 0) {
        const ids = lessonData.map((x) => x.id);
        const { data: progData, error: pErr } = await supabase
          .from("lesson_progress")
          .select("lesson_id, completed")
          .eq("user_id", uid)
          .in("lesson_id", ids);

        if (!pErr && progData) {
          const map = {};
          progData.forEach((p) => (map[p.lesson_id] = !!p.completed));
          setProgressMap(map);
        }
      }

      setLoading(false);
    })();
  }, [courseId]);

  const completedCount = useMemo(
    () => Object.values(progressMap).filter(Boolean).length,
    [progressMap]
  );
  const totalLessons = lessons.length;
  const pct = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  const toggleProgress = async (lessonId) => {
    if (!userId) return;
    const newVal = !progressMap[lessonId];

    // upsert row (PK is (user_id, lesson_id))
    const { error } = await supabase.from("lesson_progress").upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completed: newVal,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    );

    if (error) {
      alert(error.message);
      return;
    }
    setProgressMap((prev) => ({ ...prev, [lessonId]: newVal }));
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Card>
          <MDBox p={3}>
            {loading && <MDTypography variant="button">Loading…</MDTypography>}
            {errorText && (
              <MDTypography color="error" variant="button">
                {errorText}
              </MDTypography>
            )}

            {!loading && !errorText && (
              <>
                <MDTypography variant="h4" gutterBottom>
                  {course?.title || "Course"}
                </MDTypography>
                <MDTypography variant="button" color="text">
                  {course?.description}
                </MDTypography>
                <MDTypography
                  variant="button"
                  color="text"
                  style={{ display: "block", marginTop: 8 }}
                >
                  Progress: {completedCount}/{totalLessons} ({pct}%)
                </MDTypography>

                <Grid container spacing={2} mt={0.5}>
                  {lessons.map((l) => {
                    const done = !!progressMap[l.id];
                    return (
                      <Grid item xs={12} key={l.id}>
                        <Card style={{ padding: 16 }}>
                          <MDTypography variant="h6">{l.title}</MDTypography>
                          <MDTypography
                            variant="button"
                            color="text"
                            style={{ display: "block", marginTop: 8, whiteSpace: "pre-wrap" }}
                          >
                            {l.content || "No content"}
                          </MDTypography>
                          <MDButton
                            size="small"
                            variant={done ? "outlined" : "gradient"}
                            color={done ? "success" : "info"}
                            style={{ marginTop: 12 }}
                            onClick={() => toggleProgress(l.id)}
                          >
                            {done ? "Mark Incomplete" : "Mark Complete"}
                          </MDButton>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </>
            )}
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}
