import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Paper,
  Stack,
  Button,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Pagination,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useEffect, useState } from "react";
import Breadcrumbs from "components/@extended/Breadcrumbs";
import config from "../config";
import { Empty } from "antd";
import getCourse from "./utils/api/getCourses";
import PendingStudentRow from "./components/PendingStudentRow";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { getPagination, setPagination } from "../../pagination";

const breadcrumbLinks = [
  { title: "student", to: "/student/view" },
  { title: "pending-enrollments" },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const PendingEnrollments = () => {
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(getPagination("enrollment") || 10);
  const [courses, setCourses] = useState([]);
  const [openBatchDialog, setOpenBatchDialog] = useState(false);
  const [action, setAction] = useState("");
  const [selectedStudent, setSelectedStudent] = useState({});

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const getStudents = async () => {
    const token = localStorage.getItem("token");

    try {
      const url = `${config.hostUrl}/api/student/pending-enrollments`;
      const resp = await fetch(url, {
        method: "get",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();

      if (resp.status === 200) {
        return data;
      } else if (resp.status === 404) {
        return [];
      }

    } catch (Err) {
      console.log("Error while fetching data ", Err);
      setToast({
        open: true,
        message: "Error while fetching data",
        severity: "error",
      });
    }
  };

  const handleConfirm = async () => {
    setOpenBatchDialog(false);
    const { _id, courseId, program } = selectedStudent;

    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(
        `${config.hostUrl}/api/student/confirm-addmission`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ _id, courseId, program }),
        }
      );


      if (resp.status === 200) {
        setStudents((prevStudents) =>
          prevStudents.filter((student) => student._id !== _id)
        );
        setToast({
          open: true,
          message: "Admission confirmed successfully",
          severity: "success",
        });
      } else {
        setToast({
          open: true,
          message: "Error while confirming admission",
          severity: "error",
        });
      }
    } catch (Err) {
      setToast({
        open: true,
        message: "Error while confirming admission",
        severity: "error",
      });
    }
  };

  const handleReject = async () => {
    setOpenBatchDialog(false);
    const { _id } = selectedStudent;

    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(
        `${config.hostUrl}/api/student/reject-addmission`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ _id }),
        }
      );

      if (resp.status === 200) {
        setStudents((prevStudents) =>
          prevStudents.filter((student) => student._id !== _id)
        );
        setToast({
          open: true,
          message: "Admission rejected successfully",
          severity: "success",
        });
      } else {
        setToast({
          open: true,
          message: "Error while rejecting admission",
          severity: "error",
        });
      }
    } catch (Err) {
      setToast({
        open: true,
        message: "Error while rejecting admission",
        severity: "error",
      });
    }
  };

  const confirmAction = async (status, _id, data) => {
    setAction(status);
    const { courseId, program } = data;
    setOpenBatchDialog(true);
    setSelectedStudent({ _id, courseId, program });
  };

  const handlePageChange = (value) => {
    setPage(value);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1);
  };

  const handleCloseBatchDialog = () => {
    setOpenBatchDialog(false);
  };

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedStudents = students.slice(startIndex, endIndex);
  const totalPage = Math.ceil(students.length / pageSize);

  useEffect(() => {
    const fetchStundents = async () => {
      const data = await getStudents();
      setStudents(data);
    };

    const fetchCourses = async () => {
      const data = await getCourse();
      setCourses(
        data.map((c) => {
          return { _id: c._id, name: c.name };
        })
      );
    };

    fetchStundents();
    fetchCourses();
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

      <Dialog
        open={openBatchDialog}
        onClose={handleCloseBatchDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {action === "approve" ? "Confirm" : "Reject"} Addmission
        </DialogTitle>
        <DialogContent>
          Are you sure you want to {action === "approve" ? "confirm" : "reject"}{" "}
          the admission ?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBatchDialog}>Cancel</Button>

          {action === "approve" ? (
            <Button variant="contained" onClick={handleConfirm}>
              Confirm
            </Button>
          ) : (
            <Button variant="contained" onClick={handleReject} color="error">
              Reject
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Breadcrumbs
        custom={true}
        heading="pending-enrollments"
        links={breadcrumbLinks}
      />

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Program</TableCell>
              <TableCell>Fees Paid</TableCell>
              <TableCell>Confirm Addmission</TableCell>
              <TableCell>Reject Addmission</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {(paginatedStudents || []).map((row) => (
              <PendingStudentRow
                key={row._id}
                row={row}
                confirmAction={confirmAction}
                courses={courses}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {paginatedStudents.length === 0 && (
        <Box
          sx={{
            display: "flex",
            alignSelf: "center",
            mt:4
          }}
        >
          <Empty
            description={
              <Typography color="primary">
                No pending enrollments found
              </Typography>
            }
          />
        </Box>
      )}

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mt: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <InputLabel id="per-page-label" sx={{ mb: 0, fontSize: "12px" }}>
            Row per page
          </InputLabel>
          <FormControl size="small" sx={{ minWidth: 50 }}>
            <Select
              labelId="per-page-label"
              value={pageSize}
              onChange={(e)=>{
                handlePageSizeChange(e);
                setPagination("enrollment", e.target.value);
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Pagination
          count={totalPage}
          page={page}
          onChange={(_, value) => handlePageChange(value)}
          color="primary"
          variant="combined"
          showFirstButton
          showLastButton
          sx={{ "& .MuiPaginationItem-root": { my: 0.5 } }}
        />
      </Stack>
    </>
  );
};

export default PendingEnrollments;