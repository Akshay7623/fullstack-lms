// project-imports
import { lazy } from "react";
import { APP_DEFAULT_PATH } from "config";
import Loadable from "components/Loadable";
import { Breadcrumbs } from "@mui/material";
// import StudentList from "pages/admin-panel/online-courses/student/list";
const OnlineCoursesStudentList = Loadable(lazy(() => import('pages/admin-panel/online-courses/student/list')));


const breadcrumbLinks = [
  { title: "home", to: APP_DEFAULT_PATH },
  { title: "online-courses" },
  { title: "student" },
  { title: "list" },
];

export default function Student() {
  return (
    <>
      <Breadcrumbs custom heading="list" links={breadcrumbLinks} />
      <OnlineCoursesStudentList />
    </>
  );
}
