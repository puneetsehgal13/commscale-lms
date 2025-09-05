// src/pages/Enrolled.js
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

export default function Enrolled() {
  const [userId, setUserId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id || null;
      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("enrollments")
        .select("course_id, courses ( id, title, description )")
        .eq("user_id", uid);

      if (error) {
        console.error("Supabase select(enrollments) error:", error);
        setErrorText(error.message || "Failed to load enrollments.");
      } else {
        setItems(data || []);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h4" gutterBottom>
              My Learning
            </MDTypography>

            {loading && <MDTypography variant="button">Loading…</MDTypography>}
            {errorText && (
              <MDTypography color="error" variant="button">
                {errorText}
              </MDTypography>
            )}
            {!loading && !errorText && items.length === 0 && (
              <MDTypography variant="button">You’re not enrolled in any course yet.</MDTypography>
            )}

            <Grid container spacing={2} mt={0.5}>
              {items.map((row) => {
                const c = row.courses;
                return (
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
                        variant="outlined"
                        color="info"
                        style={{ marginTop: 12 }}
                        onClick={() => alert("Course viewer coming soon")}
                      >
                        Open course
                      </MDButton>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}
