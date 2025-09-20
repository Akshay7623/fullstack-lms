import { useEffect, useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import Breadcrumbs from "components/@extended/Breadcrumbs";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import config from "../../config";
import Batch from "./Batch";

const breadcrumbLinks = [{ title: "batches", to: "/batches/active" }];

const ActiveBatches = () => {
  const location = useLocation();
  const path = location.pathname.split("/").pop();

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });


  useEffect(() => {
    // setCourses(dummyCourses);
    // authentication here
  }, []);

  return (
    <>
      <Snackbar
        open={toast.open}
        autoHideDuration={1500}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ zIndex: 2100 }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      <Breadcrumbs
        custom={true}
        heading={"active-batches"}
        links={breadcrumbLinks}
      />

      <ToggleButtonGroup value={path} exclusive color="primary">
        <ToggleButton value="active" component={Link} to="/batches/active">
          Active
        </ToggleButton>
        <ToggleButton
          value="semi-active"
          component={Link}
          to="/batches/semi-active"
        >
          Semi Active
        </ToggleButton>
        <ToggleButton value="archived" component={Link} to="/batches/archived">
          Archived
        </ToggleButton>
        <ToggleButton value="calendar" component={Link} to="/batches/calendar">
          Calendar
        </ToggleButton>
      </ToggleButtonGroup>

      <Batch batchType="active" />
    </>
  );
};

export default ActiveBatches;