// src/pages/Courses.js
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Creative Tim layout/components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id || null;
      setUserId(uid);

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase select(courses) error:", error);
        setErrorText(error.message || "Failed to load courses.");
      } else {
        setCourses(data || []);
      }
      setLoading(false);
    })();
  }, []);

  const enroll = async (courseId) => {
    if (!userId) return;
    const { error } = await supabase
      .from("enrollments")
      .insert({ user_id: userId, course_id: courseId });

    if (error) {
      console.error("Enroll error:", error);
      alert(error.message);
    } else {
      alert("Enrolled!");
      window.location.href = "/enrolled";
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h4" gutterBottom>
              Courses
            </MDTypography>

            {loading && <MDTypography variant="button">Loading…</MDTypography>}

            {errorText && (
              <MDTypography color="error" variant="button">
                {errorText}
              </MDTypography>
            )}

            {!loading && !errorText && courses.length === 0 && (
              <MDTypography variant="button">No courses yet.</MDTypography>
            )}

            <Grid container spacing={2} mt={0.5}>
              {courses.map((c) => (
                <Grid item xs={12} md={6} lg={4} key={c.id}>
                  <Card style={{ padding: 16 }}>
                    <MDTypography variant="h6">{c.title}</MDTypography>
                    <MDTypography
                      variant="button"
                      color="text"
                      style={{ display: "block", marginTop: 8 }}
                    >
                      {c.description || "No description"}
                    </MDTypography>
                    <MDButton
                      size="small"
                      variant="gradient"
                      color="info"
                      style={{ marginTop: 12 }}
                      onClick={() => enroll(c.id)}
                    >
                      Enroll
                    </MDButton>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}
