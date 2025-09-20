import Breadcrumbs from "components/@extended/Breadcrumbs";
import { useEffect, useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import LectureTable from "./LectureTable";

const breadcrumbLinks = [{ title: "batches", to: "/batches/active" }];

const SemiActiveBatches = () => {
  const location = useLocation();
  const path = location.pathname.split("/").pop();

  useEffect(() => {
    // console.log("fetch batches and set to state variable");
  }, []);
  
  return (
    <>
      <Breadcrumbs custom={true} heading={"calendar"} links={breadcrumbLinks} />
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

      <LectureTable />
    </>
  );
};

export default SemiActiveBatches;