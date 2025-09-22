import PropTypes from "prop-types";
import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Checkbox,
  Button,
  Divider,
  Stack,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import { Modal } from "antd";
import { Empty } from "antd";
import {
  Add,
  Edit,
  Trash,
  SearchNormal1,
  CloseCircle,
  Save2,
  TickCircle,
  Danger,
  DocumentDownload,
  TagCross,
  ShieldTick,
} from "iconsax-react";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import MainCard from "components/MainCard";
import IconButton from "components/@extended/IconButton";
import Breadcrumbs from "components/@extended/Breadcrumbs";
import EmptyReactTable from "pages/tables/react-table/empty";

import {
  DebouncedInput,
  HeaderSort,
  RowSelection,
  TablePagination,
} from "components/third-party/react-table";
import { useTheme } from "@mui/material/styles";
import enGB from "antd/locale/en_GB";
import { ConfigProvider } from "antd";
import { CircularProgress, TextField, Tooltip } from "@mui/material";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import config, { modalStyles, textColor, bgColor } from "../config";

import getCourses from "./utils/api/getCourses";
import { getPagination } from "../../pagination";

dayjs.extend(isBetween);
dayjs.extend(utc);

const { RangePicker } = DatePicker;

const isPanCard = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

const isAadhar = (aadhar) => {
  const aadharRegex = /^\d{12}$/;
  return aadharRegex.test(aadhar);
};

function capitalize(str) {
  if (typeof str !== "string" || !str.length) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const convertJsonToCsv = (jsonData) => {
  if (!jsonData || !jsonData.length) return "";

  const fieldMap = {
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    registrationDate: "Registration Date",
    course: "Course",
    mobileNumber: "Mobile Number",
    panCard: "Pan Card",
    aadharCard: "Aadhar Card",
    gender: "Gender",
    parentName: "Parent Name",
    parentMobile: "Parent Mobile",
    dateOfBirth: "Date Of Birth",
    residenceAddress: "Residence Address",
    program: "Program",
    onBoarding: "Status",
    batch: "Batch",
    paid: "Paid Amount",
    pending: "Pending Amount",
    total: "Total Amount",
  };

  const keys = Object.keys(fieldMap);
  const header = Object.values(fieldMap);

  const formatLocalDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date)) return "";
      return date.toLocaleDateString("en-IN"); // e.g., "25/06/2000"
    } catch (e) {
      return "";
    }
  };

  const csvRows = [
    header.join(","), // header row
    ...jsonData.map((row) =>
      keys
        .map((key) => {
          let value = row[key];

          if (key === "registrationDate" || key === "dateOfBirth") {
            value = formatLocalDate(value);
          }

          return `"${(value ?? "").toString().replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ];

  return csvRows.join("\n");
};

function ReactTable({
  columns,
  courses,
  batches,
  allStudents,
  setAllStudents,
  students,
  setStudents,
}) {
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const [batchOptions, setBatchOptions] = useState([]);
  const [courseNameBatches, setCourseNameBatches] = useState({});

  const [sorting, setSorting] = useState([]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [filters, setFilters] = useState({
    search: "",
    batch: "all_batch",
    course: "all_course",
    enrolledDate: "all_time",
  });
  const [openBatchDialog, setOpenBatchDialog] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("");

  const muiTheme = useTheme();
  const primaryMain = muiTheme.palette.primary.main;

  const table = useReactTable({
    data: students ?? [],
    columns: columns ?? [],
    state: { columnFilters, sorting, rowSelection, globalFilter },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
  });

  const pageRows = table.getPaginationRowModel().rows;

  const pagePaid = pageRows.reduce((sum, row) => sum + row.original.paid, 0);

  const pagePending = pageRows.reduce(
    (sum, row) => sum + row.original.pending,
    0
  );
  const pageTotal = pageRows.reduce((sum, row) => sum + row.original.total, 0);

  const selectedStudents = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  const handleChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generateFileName = () => {
    const batch = filters.batch !== "all_batch" ? filters.batch : "AllBatches";
    const course =
      filters.course !== "all_course"
        ? filters.course.replace(/\s+/g, "")
        : "AllCourses";
    const dateFilter =
      filters.enrolledDate !== "all_time" ? filters.enrolledDate : "AllTime";
    const search = filters.search ? `Search-${filters.search}` : "";

    const start = formatDate(startDate);
    const end = formatDate(endDate);
    const dateRange = start && end ? `From-${start}_To-${end}` : "";

    const parts = [batch, course, dateFilter, dateRange, search].filter(
      Boolean
    );
    return `Students-${parts.join("_")}.csv`;
  };

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
  };

  const handleDownload = (data, filtered) => {
    const csv = convertJsonToCsv(data);
    const fileName = filtered
      ? "Students-AllBatches_AllCourses_AllTime.csv"
      : generateFileName();

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDateRange = (e) => {
    setStartDate(e[0]);
    setEndDate(e[1]);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = filters.search.toLowerCase();
    const courseFilter = filters.course.toLowerCase();
    const batchFilter = filters.batch.toLowerCase();
    const dateFilter = filters.enrolledDate;

    const now = dayjs();
    let start_date = null;
    let end_date = null;

    switch (dateFilter) {
      case "yesterday":
        start_date = now.subtract(1, "day").startOf("day");
        end_date = now.subtract(1, "day").endOf("day");
        break;
      case "last7days":
        start_date = now.subtract(7, "day").startOf("day");
        end_date = now.endOf("day");
        break;
      case "last30days":
        start_date = now.subtract(30, "day").startOf("day");
        end_date = now.endOf("day");
        break;
      case "thisMonth":
        start_date = now.startOf("month");
        end_date = now.endOf("month");
        break;
      case "lastMonth":
        start_date = now.subtract(1, "month").startOf("month");
        end_date = now.subtract(1, "month").endOf("month");
        break;
      case "thisYear":
        start_date = now.startOf("year");
        end_date = now.endOf("year");
        break;
      case "lastYear":
        start_date = now.subtract(1, "year").startOf("year");
        end_date = now.subtract(1, "year").endOf("year");
        break;
      case "custom":
        if (startDate && endDate) {
          start_date = dayjs(startDate).startOf("day");
          end_date = dayjs(endDate).endOf("day");
        }
        break;
      case "all_time":
      default:
        break;
    }

    const filtered = allStudents.filter((item) => {
      const matchesSearch =
        item.firstName.toLowerCase().includes(searchTerm) ||
        item.lastName.toLowerCase().includes(searchTerm) ||
        item.email.toLowerCase().includes(searchTerm) ||
        item.mobileNumber.includes(searchTerm);

      const matchesCourse =
        courseFilter === "all_course" ||
        item.course.toLowerCase() === courseFilter;

      const matchesBatch =
        batchFilter === "all_batch" || item.batch.toLowerCase() === batchFilter;

      const itemDate = dayjs(item.registrationDate);

      const matchesDate =
        dateFilter === "all_time" ||
        (start_date &&
          end_date &&
          itemDate.isBetween(start_date, end_date, null, "[]"));

      return matchesSearch && matchesCourse && matchesBatch && matchesDate;
    });

    setStudents(filtered);
  };

  const assignBatchToStudents = async (selectedBatch, selectedStudents) => {
    const allId = selectedStudents.map((s) => s._id);

    try {
      const token = localStorage.getItem("token");

      const resp = await fetch(`${config.hostUrl}/api/batch/assignbatch`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          _ids: allId,
          batch: selectedBatch,
        }),
      });

      if (resp.status !== 200) {
        setToast({
          open: true,
          message:
            "An error occurred while assigning the batch. Please try again.",
          severity: "error",
        });
      } else {
        setAllStudents((prev) =>
          prev.map((student) =>
            allId.includes(student._id)
              ? { ...student, batch: selectedBatch }
              : student
          )
        );

        setStudents((prev) =>
          prev.map((student) =>
            allId.includes(student._id)
              ? { ...student, batch: selectedBatch }
              : student
          )
        );

        setRowSelection({});
        setSelectedBatch("");

        setToast({
          open: true,
          message: "Batch assigned successfully to selected students.",
          severity: "success",
        });
      }
    } catch (err) {
      setToast({
        open: true,
        message:
          "An error occurred while assigning the batch. Please try again.",
        severity: "error",
      });
    }
  };

  const hanldeClear = (e) => {
    e.preventDefault();

    setFilters({
      search: "",
      batch: "all_batch",
      course: "all_course",
      enrolledDate: "all_time",
    });

    setStudents(allStudents);
  };

  let headers = [];

  columns.map(
    (columns) =>
      columns.accessorKey &&
      headers.push({
        label: typeof columns.header === "string" ? columns.header : "#",
        key: columns.accessorKey,
      })
  );

  const handleOpenBatchDialog = () => setOpenBatchDialog(true);

  const handleCloseBatchDialog = () => {
    setOpenBatchDialog(false);
    setSelectedBatch("");
  };

  const hanldeBatchAssign = () => {
    setOpenBatchDialog(true);
  };

  useEffect(() => {
    const allBatch = batches.map((b) => {
      return {
        batchName: `${b.month.slice(0, 3).toUpperCase()}${b.year}-${b.courseCode}-${b.batchNo}`,
        courseName: b.courseName,
      };
    });

    const batchCodeName = {};

    allBatch.forEach((b) => {
      if (batchCodeName[b.courseName]) {
        batchCodeName[b.courseName].push(b.batchName);
      } else {
        batchCodeName[b.courseName] = [b.batchName];
      }
    });

    setCourseNameBatches(batchCodeName);
    setBatchOptions(allBatch);
  }, [batches]);

  return (
    <MainCard content={false}>
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
        <DialogTitle>Assign Batch</DialogTitle>
        <DialogContent>
          <InputLabel id="batch-select-label" sx={{ mb: 1 }}>
            Select Batch
          </InputLabel>
          <Select
            labelId="batch-select-label"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            fullWidth
            MenuProps={{
              disablePortal: true,
              PaperProps: { sx: { zIndex: 2100, minWidth: "250px" } },
            }}
          >
            {(courseNameBatches[selectedStudents[0]?.course] || []).map(
              (batchName, idx) => (
                <MenuItem key={batchName + idx} value={batchName}>
                  {batchName}
                </MenuItem>
              )
            )}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBatchDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              assignBatchToStudents(selectedBatch, selectedStudents);
              setOpenBatchDialog(false);
            }}
            disabled={!selectedBatch}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={0}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ m: 2, gap: 1 }}>
            <InputLabel id="search">Search</InputLabel>
            <DebouncedInput
              name="search"
              value={filters.search}
              onFilterChange={(value) =>
                setFilters((prev) => ({ ...prev, search: value }))
              }
              placeholder={`Search by name, email or mobile`}
              autoComplete="off"
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ m: 2, gap: 1 }}>
            <InputLabel id="batch-select">Batch</InputLabel>
            <Select
              labelId="batch-select"
              name="batch"
              autoComplete="new"
              onChange={handleChange}
              value={filters.batch}
            >
              <MenuItem value="all_batch">All Batch</MenuItem>
              {(batchOptions || []).map((value, idx) => {
                return (
                  <MenuItem key={value.batchName} value={value.batchName}>
                    {value.batchName}
                  </MenuItem>
                );
              })}
            </Select>
          </Stack>
        </Grid>

        <Grid size={{ xs: 6, sm: 6 }}>
          <Stack sx={{ mx: 2, gap: 1, mb: 2 }}>
            <InputLabel id="course-select">Course</InputLabel>
            <Select
              labelId="course-select"
              autoComplete="new"
              name="course"
              value={filters.course}
              onChange={handleChange}
            >
              <MenuItem value="all_course">All Courses</MenuItem>

              {(courses || []).map((value, _) => {
                return (
                  <MenuItem key={value._id} value={value.name}>
                    {value.name}
                  </MenuItem>
                );
              })}
            </Select>
          </Stack>
        </Grid>

        <Grid size={{ xs: 6, sm: 6 }}>
          <Stack sx={{ mx: 2, gap: 1, mb: 2 }}>
            <InputLabel id="enrolled-date">Enrolled Date</InputLabel>
            <Select
              labelId="enrolled-date"
              name="enrolledDate"
              onChange={handleChange}
              value={filters.enrolledDate}
              autoComplete="new"
            >
              <MenuItem value="" disabled>
                Select Enrolled Date
              </MenuItem>
              <MenuItem value="all_time">All time</MenuItem>
              <MenuItem value="yesterday">Yesterday</MenuItem>
              <MenuItem value="last7days">Last 7 days</MenuItem>
              <MenuItem value="last30days">Last 30 days</MenuItem>
              <MenuItem value="thisMonth">This month</MenuItem>
              <MenuItem value="lastMonth">Last month</MenuItem>
              <MenuItem value="thisYear">This year</MenuItem>
              <MenuItem value="lastYear">Last year</MenuItem>
              <MenuItem value="custom">Custom Date Range</MenuItem>
            </Select>
            
            {filters.enrolledDate === "custom" && (
              <ConfigProvider
                locale={enGB}
                theme={{
                  components: {
                    DatePicker: {
                      colorPrimary: primaryMain,
                      borderRadius: 6,
                      colorText: textColor,
                      colorTextPlaceholder: primaryMain,
                      colorBgContainer: "primary.main",
                      colorBgElevated: bgColor,
                      colorTextHeading: primaryMain,
                    },
                  },
                }}
              >
                <RangePicker
                  style={{ height: 42 }}
                  onChange={handleDateRange}
                />
              </ConfigProvider>
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 12 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack
              direction="row"
              sx={{
                gap: 2,
                alignItems: "center",
                flexWrap: "wrap",
                mx: 2,
                mb: 2,
              }}
            >
              <Button
                variant="contained"
                startIcon={<SearchNormal1 />}
                size="medium"
                onClick={handleSearch}
              >
                Search
              </Button>

              <Button
                variant="contained"
                startIcon={<TagCross />}
                component={Link}
                size="medium"
                onClick={hanldeClear}
              >
                Clear
              </Button>

              {selectedStudents.length > 0 && (
                <Button
                  variant="contained"
                  startIcon={<ShieldTick />}
                  size="medium"
                  component={Link}
                  onClick={hanldeBatchAssign}
                >
                  Assign Batch
                </Button>
              )}

              <Tooltip
                title="Export all data into csv"
                style={{ cursor: "pointer" }}
                onClick={() => handleDownload(allStudents, true)}
              >
                <Box sx={{ color: "text.secondary" }}>
                  <DocumentDownload
                    size={28}
                    variant="Outline"
                    style={{ marginTop: 4, marginRight: 4, marginLeft: 4 }}
                  />
                </Box>
              </Tooltip>

              <Tooltip
                title="Export filtered data into csv"
                style={{ cursor: "pointer" }}
                onClick={() => handleDownload(students, false)}
              >
                <Box sx={{ color: "text.secondary" }}>
                  <DocumentDownload
                    size={28}
                    variant="Outline"
                    style={{ marginTop: 4, marginRight: 4, marginLeft: 4 }}
                  />
                </Box>
              </Tooltip>
            </Stack>

            <Stack
              direction="row"
              sx={{
                gap: 2,
                alignItems: "center",
                flexWrap: "wrap",
                mx: 2,
                mb: 2,
              }}
            >
              <Button
                variant="contained"
                startIcon={<Add />}
                size="medium"
                component={Link}
                to={"/student/add"}
              >
                Add Student
              </Button>
              <Button
                size="medium"
                variant="outlined"
                component={Link}
                to={"/student/pending-enrollments"}
              >
                Pending Enrollments
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      <Stack>
        <RowSelection selected={Object.keys(rowSelection).length} />
        <TableContainer>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    if (
                      header.column.columnDef.meta !== undefined &&
                      header.column.getCanSort()
                    ) {
                      Object.assign(header.column.columnDef.meta, {
                        className:
                          header.column.columnDef.meta.className +
                          " cursor-pointer prevent-select",
                      });
                    }

                    return (
                      <TableCell
                        key={header.id}
                        {...header.column.columnDef.meta}
                        onClick={header.column.getToggleSortingHandler()}
                        {...(header.column.getCanSort() &&
                          header.column.columnDef.meta === undefined && {
                          className: "cursor-pointer prevent-select",
                        })}
                      >
                        {header.isPlaceholder ? null : (
                          <Stack
                            direction="row"
                            sx={{ gap: 1, alignItems: "center" }}
                          >
                            <Box>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </Box>
                            {header.column.getCanSort() && (
                              <HeaderSort column={header.column} />
                            )}
                          </Stack>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TableRow>
            <TableCell colSpan={5}>
              <strong>Page Total</strong>
            </TableCell>
            <TableCell align="right">
              <strong>₹{pagePaid}</strong>
            </TableCell>
            <TableCell align="right">
              <strong>₹{pagePending}</strong>
            </TableCell>
            <TableCell align="right">
              <strong>₹{pageTotal}</strong>
            </TableCell>
          </TableRow>
        </TableContainer>

        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <TablePagination
              {...{
                setPageSize: table.setPageSize,
                setPageIndex: table.setPageIndex,
                getState: table.getState,
                getPageCount: table.getPageCount,
                initialPageSize : getPagination('student') || 10
              }}
            />
          </Box>
        </>
      </Stack>
    </MainCard>
  );
}

function StudentList({
  batches,
  courses,
  allStudents,
  setAllStudents,
  students,
  setStudents,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [openResponsive, setOpenResponsive] = useState(false);
  const [errors, setErrors] = useState({});
  const [editModal, setEditModal] = useState(false);
  const [feesModal, setFeesModal] = useState(false);
  const [feesLoading, setFeesLoading] = useState(false);

  const [feesData, setFeesData] = useState([]);

  const [studentData, setStudentData] = useState({
    firstName: "",
    lastName: "",
    course: "",
    program: "",
    email: "",
    mobileNumber: "",
    dateOfBirth: "",
    panCard: "",
    aadharCard: "",
    residenceAddress: "",
    courseName: "",
    parentName: "",
    parentMobile: "",
  });

  const [studentImages, setStudentImages] = useState({
    studentPhoto: null,
    aadharCardFront: null,
    aadharCardBack: null,
    panCardPhoto: null,
  });

  const [imagePreviews, setImagePreviews] = useState({
    studentPhoto: "",
    aadharCardFront: "",
    aadharCardBack: "",
    panCardPhoto: "",
  });

  function validateStudentForm(form) {
    const errors = {};
    if (!form.firstName?.trim()) errors.firstName = "First name is required";
    if (!form.lastName?.trim()) errors.lastName = "Last name is required";
    if (!form.email?.trim()) errors.email = "Email is required";
    if (!form.course) errors.course = "Course is required";
    if (!form.program) errors.program = "Program is required";
    if (!form.mobileNumber?.trim())
      errors.mobileNumber = "Mobile number is required";
    if (form.email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email))
      errors.email = "Invalid email format";
    if (form.mobileNumber && !/^\d{10}$/.test(form.mobileNumber))
      errors.mobileNumber = "Invalid mobile number";
    // if (!form.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
    if (form.panCard && form.panCard.trim() && !isPanCard(form.panCard.trim()))
      errors.panCard = "Invalid PAN card number";
    if (
      form.aadharCard &&
      form.aadharCard.trim() &&
      !isAadhar(form.aadharCard.trim())
    )
      errors.aadharCard = "Invalid Aadhar card number";
    if (
      form.parentMobile &&
      form.parentMobile.trim() &&
      !/^\d{10}$/.test(form.parentMobile.trim())
    )
      errors.parentMobile = "Invalid parent mobile number";
    return errors;
  }

  const handleImageChange = (e, key) => {
    const file = e.target.files[0];
    if (file && !["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setToast({
        open: true,
        message: "Only JPG, JPEG, and PNG files are allowed.",
        severity: "error",
      });
      return;
    }
    setStudentImages((prev) => ({ ...prev, [key]: file }));
    setImagePreviews((prev) => ({
      ...prev,
      [key]: file ? URL.createObjectURL(file) : "",
    }));
  };

  const handleEditInput = (e) => {
    setStudentData((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.name === "panCard"
          ? e.target.value.toUpperCase()
          : e.target.value,
    }));
  };

  function camelCaseToNormal(text) {
    if (!text || typeof text !== "string") return "";
    return text
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  }

  const updateDetails = async (_id) => {
    const validationErrors = validateStudentForm(studentData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      Object.entries(studentData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      [
        "studentPhoto",
        "aadharCardFront",
        "aadharCardBack",
        "panCardPhoto",
      ].forEach((key) => {
        if (studentImages[key] instanceof File) {
          formData.append(key, studentImages[key]);
        } else if (
          (!imagePreviews[key] &&
            (!studentData.studentDocuments ||
              !studentData.studentDocuments[key])) ||
          (studentData.studentDocuments &&
            studentData.studentDocuments[key] === "")
        ) {
          formData.append(key, "");
        }
      });

      const resp = await fetch(`${config.hostUrl}/api/student/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (resp.status === 200) {
        setEditModal(false);
        const data = await resp.json();
        setAllStudents((prev) =>
          prev.map((stu) =>
            stu._id === data.student._id ? { ...stu, ...data.student } : stu
          )
        );

        setStudents((prev) =>
          prev.map((stu) =>
            stu._id === data.student._id ? { ...stu, ...data.student } : stu
          )
        );

        setToast({
          open: true,
          message: "Student details updated successfully!",
          severity: "success",
        });
      } else {
        setToast({
          open: true,
          message: "Failed to update student details!",
          severity: "error",
        });
      }
    } catch (err) {
      setToast({
        open: true,
        message: "Failed to update student details!",
        severity: "error",
      });
    }
  };

  const handleView = (data) => {
    const courseData = courses.find((course) => course.name === data.course);
    setStudentData({
      ...data,
      course: courseData._id,
      courseName: data.course,
    });
    setStudentImages(data.studentDocuments);
    setOpenResponsive(true);
  };

  const handleEdit = () => {
    setOpenResponsive(false);
    setEditModal(true);
  };

  const handleEditModal = (data) => {
    const courseData = courses.find((course) => course.name === data.course);
    setStudentData({
      ...data,
      course: courseData._id,
      courseName: data.course,
    });
    setStudentImages(data.studentDocuments);
    setEditModal(true);
  };

  const confirmDrop = async () => {
    if (!toDeleteId) {
      setToast({
        open: true,
        message: "No student selected for deletion.",
        severity: "error",
      });
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const resp = await fetch(
        `${config.hostUrl}/api/student/drop?_id=${toDeleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (resp.status === 200) {
        setAllStudents((prev) => prev.filter((stu) => stu._id !== toDeleteId));
        setStudents((prev) => prev.filter((stu) => stu._id !== toDeleteId));
        setToast({
          open: true,
          message: "Student dropped successfully.",
          severity: "success",
        });
      } else {
        setToast({
          open: true,
          message: "Failed to drop student.",
          severity: "error",
        });
      }
    } catch (err) {
      setToast({
        open: true,
        message: "Error occurred while dropping student.",
        severity: "error",
      });
    }
    setToDeleteId(null);
    setIsModalOpen(false);
  };

  const handleViewPayment = async (id) => {
    const token = localStorage.getItem("token");
    setFeesLoading(true);
    setFeesModal(true);

    try {
      const resp = await fetch(`${config.hostUrl}/api/student/fees?id=${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await resp.json();

      if (resp.status === 200) {
        setFeesData(data.data);
      }

      setFeesLoading(false);
    } catch (err) {
      setFeesLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setIsModalOpen(null);
  };

  const handleDelete = (id) => {
    setToDeleteId(id);
    setIsModalOpen(true);
  };

  const handleRowCheckboxToggle = (row, table) => {
    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((r) => r.original);
    const clickedStudent = row.original;

    if (row.getIsSelected()) {
      row.toggleSelected(false);
      return;
    }

    if (selectedRows.length === 0) {
      row.toggleSelected(true);
      return;
    }

    const existingCourse = selectedRows[0].course;
    const isSameCourse = clickedStudent.course === existingCourse;

    if (isSameCourse) {
      row.toggleSelected(true);
    } else {
      setToast({
        open: true,
        message: "You can only select students from the same course.",
        severity: "warning",
      });
      row.toggleSelected(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: () => (
          <Checkbox
            disabled
            inputProps={{ "aria-label": "Select all disabled" }}
          />
        ),
        cell: ({ row, table }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={() => handleRowCheckboxToggle(row, table)}
            inputProps={{ "aria-label": "Select student" }}
          />
        ),
      },
      {
        accessorKey: "registrationDate",
        header: "Admission Date",
        cell: ({ row }) => {
          const utcDate = row.original.registrationDate;
          const localDate = utcDate
            ? dayjs(utcDate).local().format("DD/MM/YYYY")
            : "";
          return <div>{localDate}</div>;
        },
      },
      {
        header: "Name",
        cell: ({ row }) => {
          return (
            <>
              <Stack direction="row" sx={{ gap: 1.5, alignItems: "center" }}>
                <div style={{ display: "block" }}>
                  <Typography
                    color="primary.main"
                    fontWeight={600}
                    sx={{ textDecoration: "underline", cursor: "pointer" }}
                    onClick={() => handleView(row.original)}
                  >
                    {row.original.firstName} {row.original.lastName}
                  </Typography>
                  <Typography color="primary.main">
                    {row.original.batch != ""
                      ? row.original.batch
                      : "Batch Not Assigned"}
                  </Typography>
                </div>
              </Stack>
            </>
          );
        },
      },
      {
        header: "Contact",
        cell: ({ row }) => (
          <div style={{ display: "block" }}>
            <Typography>{row.original.email}</Typography>
            <Typography>{"+91 " + row.original.mobileNumber}</Typography>
          </div>
        ),
      },
      {
        header: "Course",
        cell: ({ row }) => (
          <div style={{ display: "block" }}>
            <Typography>{row.original.course}</Typography>
            <Typography color="gray">
              {capitalize(row.original.program)}
            </Typography>
          </div>
        ),
      },
      {
        header: "Onboarding",
        cell: ({ row }) => {
          const [value, setValue] = useState(row.original.onBoarding);
          const [toast, setToast] = useState({
            open: false,
            message: "",
            severity: "success",
          });

          const defaultOnboard = row.original.onBoarding;

          const handleChange = async (e) => {
            try {
              const token = localStorage.getItem("token");
              const resp = await fetch(`${config.hostUrl}/api/onboard/update`, {
                method: "put",
                body: JSON.stringify({
                  _id: row.original._id,
                  onBoarding: e.target.value,
                }),
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });

              if (resp.status == 200) {
                setToast({
                  open: true,
                  message: "Onboard Status updated Successfully",
                  severity: "success",
                });
                setValue(e.target.value);
              } else {
                setToast({
                  open: true,
                  message: "Couldn't update Onboard status please try again",
                  severity: "error",
                });
              }
            } catch (Err) {
              setToast({
                open: true,
                message: "Couldn't update Onboard status please try again",
                severity: "error",
              });
              setValue(defaultOnboard);
            }
          };

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
              <InputLabel id="status-select">Select Status</InputLabel>
              <Select
                sx={{ width: 100 }}
                labelId="status-select"
                name="status"
                autoComplete="new"
                onChange={(e) => handleChange(e)}
                value={value}
              >
                <MenuItem value="Ringing">Ringing</MenuItem>
                <MenuItem value="Message Sent">Message Sent</MenuItem>
                <MenuItem value="Done">Done</MenuItem>
              </Select>
            </>
          );
        },
      },
      {
        header: "Payment",
        cell: ({ row }) => {
          const data = [
            {
              label: "Paid",
              value: row.original.paid,
              style: {
                color: "primary.main",
                cursor: "pointer",
                textDecoration: "underline",
              },
            },
            { label: "Pending", value: row.original.pending, style: {} },
            { label: "Total", value: row.original.total, style: {} },
          ];

          return (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                textAlign: "center",
                boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
                padding: "7px",
                borderRadius: "5px",
              }}
            >
              {data.map((item) => (
                <Typography
                  key={item.label}
                  variant="subtitle2"
                  sx={{ ...item.style, cursor: "pointer " }}
                  color={item.style.color}
                  onClick={() => handleViewPayment(row.original._id)}
                >
                  {item.label}
                </Typography>
              ))}
              {data.map((item) => (
                <Typography
                  key={item.label + "-value"}
                  variant="body1"
                  sx={{ ...item.style, cursor: "pointer " }}
                  onClick={() => handleViewPayment(row.original._id)}
                >
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(item.value)}
                </Typography>
              ))}
            </div>
          );
        },
      },
      {
        header: "Actions",
        meta: {
          className: "cell-center",
        },
        cell: ({ row }) => {
          return (
            <>
              <Select
                sx={{ width: 80, justifyItems: "center" }}
                labelId="action-select"
                name="action"
                autoComplete="new"
                value=""
              >
                <MenuItem
                  value="edit"
                  sx={{ justifyContent: "center", display: "flex" }}
                >
                  <IconButton
                    color="primary"
                    onClick={() => handleEditModal(row.original)}
                  >
                    <Edit />
                  </IconButton>
                </MenuItem>
                <MenuItem
                  value="delete"
                  sx={{ justifyContent: "center", display: "flex" }}
                >
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(row.original._id)}
                  >
                    <Trash />
                  </IconButton>
                </MenuItem>
              </Select>
            </>
          );
        },
      },
    ],
    [courses, batches]
  );

  // if (loading) return <EmptyReactTable />;

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

      <ReactTable
        columns={columns}
        courses={courses}
        batches={batches}
        allStudents={allStudents}
        setAllStudents={setAllStudents}
        students={students}
        setStudents={setStudents}
      />

      <Modal
        title={
          <span style={{ color: textColor, display: "flex" }}>
            Are you sure want to drop this student ? &nbsp;{" "}
            <Danger className="mt-1" size="22" />
          </span>
        }
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        styles={modalStyles}
        zIndex={2000}
        footer={[
          <Button
            key="close"
            type="primary"
            endIcon={<TickCircle size={18} />}
            onClick={() => {
              confirmDrop();
            }}
          >
            Confirm
          </Button>,
          <Button
            key="update"
            endIcon={<CloseCircle size={18} />}
            onClick={closeDeleteModal}
          >
            Cancel
          </Button>,
        ]}
      ></Modal>

      <Modal
        title={<span style={{ color: textColor }}>View Details</span>}
        styles={modalStyles}
        centered
        open={openResponsive}
        onOk={() => setOpenResponsive(false)}
        onCancel={() => setOpenResponsive(false)}
        width={{
          xs: "90%",
          sm: "80%",
          md: "70%",
          lg: "60%",
          xl: "50%",
          xxl: "40%",
        }}
        zIndex={2000}
        footer={[
          <Button
            key="close"
            endIcon={<CloseCircle size={18} />}
            onClick={() => setOpenResponsive(false)}
          >
            Close
          </Button>,
          <Button
            key="edit"
            type="primary"
            endIcon={<Edit size={18} />}
            onClick={() => {
              handleEdit(studentData.email);
            }}
          >
            Edit
          </Button>,
        ]}
      >
        <Table
          sx={{
            backgroundColor: bgColor,
          }}
        >
          <TableBody>
            <TableRow>
              <TableCell variant="head">Name</TableCell>
              <TableCell>
                {studentData.firstName} {studentData.lastName}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell variant="head">Course Name</TableCell>
              <TableCell>{studentData.courseName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell variant="head">Course Program</TableCell>
              <TableCell>{capitalize(studentData.program)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell variant="head">Email</TableCell>
              <TableCell>{studentData.email}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell variant="head">Mobile Number</TableCell>
              <TableCell>{studentData.mobileNumber}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell variant="head">Date of Birth</TableCell>
              <TableCell>
                {studentData.dateOfBirth
                  ? dayjs(studentData.dateOfBirth).local().format("DD/MM/YYYY")
                  : ""}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell variant="head">PAN Card</TableCell>
              <TableCell>{studentData.panCard}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell variant="head">Aadhar Card</TableCell>
              <TableCell>{studentData.aadharCard}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell variant="head">Current Address</TableCell>
              <TableCell>{studentData.residenceAddress}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell variant="head">Student Documents</TableCell>
              <TableCell>
                {studentData.studentDocuments &&
                  Object.keys(studentData.studentDocuments).length > 0 ? (
                  <Table>
                    <TableBody>
                      {Object.entries(studentData.studentDocuments)
                        .filter(([_, value]) => value && value !== "")
                        .map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell
                              variant="head"
                              sx={{
                                py: 0,
                                px: 1,
                                cursor: "pointer",
                                color: "#4680FF",
                              }}
                            >
                              <a
                                href={`${config.hostUrl}/uploads/${value}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {camelCaseToNormal(key)}
                              </a>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  "-"
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Modal>

      <Modal
        title={<span style={{ color: textColor }}>Update Details</span>}
        styles={modalStyles}
        centered
        open={editModal}
        onOk={() => setEditModal(false)}
        onCancel={() => setEditModal(false)}
        width={{
          xs: "90%",
          sm: "80%",
          md: "70%",
          lg: "60%",
          xl: "50%",
          xxl: "40%",
        }}
        zIndex={2000}
        footer={[
          <Button
            key="update"
            endIcon={<Save2 size={18} />}
            onClick={() => updateDetails(studentData._id)}
          >
            Save
          </Button>,
          <Button
            key="close"
            type="primary"
            endIcon={<CloseCircle size={18} />}
            onClick={() => {
              setEditModal(false);
            }}
          >
            Close
          </Button>,
        ]}
      >
        <Table
          sx={{
            backgroundColor: bgColor,
          }}
        >
          <TableBody>
            <TableRow>
              <TableCell variant="head">First name</TableCell>
              <TableCell>
                <TextField
                  label="Name"
                  variant="outlined"
                  name="firstName"
                  fullWidth
                  sx={{ mb: 1, mt: 1 }}
                  value={studentData.firstName}
                  onChange={handleEditInput}
                  autoComplete="new"
                  error={Boolean(errors.firstName)}
                  helperText={errors.firstName}
                  onFocus={(e) =>
                    setErrors((prev) => ({
                      ...prev,
                      [e.target.name]: null,
                    }))
                  }
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Last name</TableCell>
              <TableCell>
                <TextField
                  label="Name"
                  variant="outlined"
                  name="lastName"
                  fullWidth
                  sx={{ mb: 1, mt: 1 }}
                  value={studentData.lastName}
                  onChange={handleEditInput}
                  autoComplete="new"
                  error={Boolean(errors.lastName)}
                  helperText={errors.lastName}
                  onFocus={(e) =>
                    setErrors((prev) => ({
                      ...prev,
                      [e.target.name]: null,
                    }))
                  }
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Date of Birth</TableCell>
              <TableCell>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <MuiDatePicker
                    label="Date of Birth"
                    value={
                      studentData.dateOfBirth
                        ? dayjs(studentData.dateOfBirth)
                        : null
                    }
                    onChange={(newValue) => {
                      setStudentData((prev) => ({
                        ...prev,
                        dateOfBirth: newValue
                          ? newValue.format("YYYY-MM-DD")
                          : "",
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        dateOfBirth: null,
                      }));
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: { mb: 1, mt: 1 },
                        error: Boolean(errors.dateOfBirth),
                        helperText: errors.dateOfBirth,
                      },
                      popper: {
                        sx: { zIndex: 2100 },
                      },
                      paper: {
                        sx: { zIndex: 2100 },
                      },
                    }}
                    disableFuture
                  />
                </LocalizationProvider>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Course</TableCell>
              <TableCell>
                <Select
                  sx={{ width: "100%" }}
                  labelId="course-name"
                  autoComplete="new"
                  name="course"
                  value={studentData.course}
                  onChange={(e) =>
                    setStudentData((prev) => ({
                      ...prev,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  MenuProps={{
                    disablePortal: true,
                    PaperProps: {
                      sx: {
                        zIndex: 2100,
                        mb: 1,
                        mt: 1,
                        minWidth: "300px",
                        maxWidth: "100%",
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Course
                  </MenuItem>

                  {(courses || []).map((item) => (
                    <MenuItem key={item._id} value={item._id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Course Program</TableCell>
              <TableCell>
                <Select
                  sx={{ width: "100%" }}
                  labelId="program"
                  autoComplete="new"
                  name="program"
                  value={studentData.program}
                  onChange={(e) =>
                    setStudentData((prev) => ({
                      ...prev,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  MenuProps={{
                    disablePortal: true,
                    PaperProps: {
                      sx: {
                        zIndex: 2100,
                        mb: 1,
                        mt: 1,
                        minWidth: "300px",
                        maxWidth: "100%",
                      },
                    },
                  }}
                >
                  <MenuItem value="certification">Certification</MenuItem>
                  <MenuItem value="diploma">Diploma</MenuItem>
                  <MenuItem value="master diploma">Master Diploma</MenuItem>
                </Select>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Email</TableCell>
              <TableCell>
                <TextField
                  label="Email"
                  variant="outlined"
                  name="email"
                  fullWidth
                  sx={{ mb: 1, mt: 1 }}
                  value={studentData.email}
                  onChange={handleEditInput}
                  autoComplete="new"
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  onFocus={(e) =>
                    setErrors((prev) => ({
                      ...prev,
                      [e.target.name]: null,
                    }))
                  }
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Mobile Number</TableCell>
              <TableCell>
                <TextField
                  label="Mobile Number"
                  variant="outlined"
                  name="mobileNumber"
                  fullWidth
                  sx={{ mb: 1, mt: 1 }}
                  value={studentData.mobileNumber}
                  onChange={handleEditInput}
                  autoComplete="new"
                  error={Boolean(errors.mobileNumber)}
                  helperText={errors.mobileNumber}
                  onFocus={(e) =>
                    setErrors((prev) => ({
                      ...prev,
                      [e.target.name]: null,
                    }))
                  }
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">PAN Card</TableCell>
              <TableCell>
                <TextField
                  label="PAN Card"
                  variant="outlined"
                  name="panCard"
                  fullWidth
                  sx={{ mb: 1, mt: 1 }}
                  value={studentData.panCard}
                  onChange={handleEditInput}
                  autoComplete="new"
                  error={Boolean(errors.panCard)}
                  helperText={errors.panCard}
                  onFocus={(e) =>
                    setErrors((prev) => ({
                      ...prev,
                      [e.target.name]: null,
                    }))
                  }
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Aadhar Card</TableCell>
              <TableCell>
                <TextField
                  label="Aadhar Card"
                  variant="outlined"
                  name="aadharCard"
                  fullWidth
                  sx={{ mb: 1, mt: 1 }}
                  value={studentData.aadharCard}
                  onChange={handleEditInput}
                  autoComplete="new"
                  error={Boolean(errors.aadharCard)}
                  helperText={errors.aadharCard}
                  onFocus={(e) =>
                    setErrors((prev) => ({
                      ...prev,
                      [e.target.name]: null,
                    }))
                  }
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Current Address</TableCell>
              <TableCell>
                <TextField
                  label="Current Address"
                  variant="outlined"
                  name="residenceAddress"
                  fullWidth
                  sx={{ mb: 1, mt: 1 }}
                  value={studentData.residenceAddress}
                  onChange={handleEditInput}
                  autoComplete="new"
                  multiline
                  minRows={2}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Parent Name</TableCell>
              <TableCell>
                <TextField
                  label="Parent Name"
                  variant="outlined"
                  name="parentName"
                  fullWidth
                  sx={{ mb: 1, mt: 1 }}
                  value={studentData.parentName}
                  onChange={handleEditInput}
                  autoComplete="new"
                  error={Boolean(errors.parentName)}
                  helperText={errors.parentName}
                  onFocus={(e) =>
                    setErrors((prev) => ({
                      ...prev,
                      [e.target.name]: null,
                    }))
                  }
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Parent Mobile</TableCell>
              <TableCell>
                <TextField
                  label="Parent Mobile"
                  variant="outlined"
                  name="parentMobile"
                  fullWidth
                  sx={{ mb: 1, mt: 1 }}
                  value={studentData.parentMobile}
                  onChange={handleEditInput}
                  autoComplete="new"
                  error={Boolean(errors.parentMobile)}
                  helperText={errors.parentMobile}
                  onFocus={(e) =>
                    setErrors((prev) => ({
                      ...prev,
                      [e.target.name]: null,
                    }))
                  }
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Student Photo</TableCell>
              <TableCell>
                {imagePreviews.studentPhoto ||
                  studentData.studentDocuments?.studentPhoto ? (
                  <Box
                    sx={{
                      position: "relative",
                      display: "inline-block",
                    }}
                  >
                    <img
                      src={
                        imagePreviews.studentPhoto ||
                        `${config.hostUrl}/uploads/${studentData.studentDocuments.studentPhoto}`
                      }
                      alt="Student"
                      style={{
                        width: 80,
                        height: 80,
                        marginLeft: 8,
                        borderRadius: 4,
                        objectFit: "cover",
                        border: "1px solid #eee",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        setStudentImages((prev) => ({
                          ...prev,
                          studentPhoto: null,
                        }));
                        setImagePreviews((prev) => ({
                          ...prev,
                          studentPhoto: "",
                        }));
                        setStudentData((prev) => ({
                          ...prev,
                          studentDocuments: {
                            ...prev.studentDocuments,
                            studentPhoto: "",
                          },
                        }));
                      }}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(255,255,255,0.8)",
                        color: "red",
                        zIndex: 1,
                        "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                      }}
                    >
                      <CloseCircle size={20} color="red" />
                    </IconButton>
                  </Box>
                ) : (
                  <>
                    <input
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      type="file"
                      style={{ display: "none" }}
                      id="student-photo-upload"
                      onChange={(e) => handleImageChange(e, "studentPhoto")}
                    />
                    <label htmlFor="student-photo-upload">
                      <Button
                        variant="contained"
                        component="span"
                        color="primary"
                      >
                        Upload
                      </Button>
                    </label>
                  </>
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Aadhar Card Front</TableCell>
              <TableCell>
                {imagePreviews.aadharCardFront ||
                  studentData.studentDocuments?.aadharCardFront ? (
                  <Box
                    sx={{
                      position: "relative",
                      display: "inline-block",
                    }}
                  >
                    <img
                      src={
                        imagePreviews.aadharCardFront ||
                        `${config.hostUrl}/uploads/${studentData.studentDocuments.aadharCardFront}`
                      }
                      alt="Aadhar Front"
                      style={{
                        width: 100,
                        height: 60,
                        marginLeft: 8,
                        borderRadius: 4,
                        objectFit: "cover",
                        border: "1px solid #eee",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        setStudentImages((prev) => ({
                          ...prev,
                          aadharCardFront: null,
                        }));
                        setImagePreviews((prev) => ({
                          ...prev,
                          aadharCardFront: "",
                        }));
                        setStudentData((prev) => ({
                          ...prev,
                          studentDocuments: {
                            ...prev.studentDocuments,
                            aadharCardFront: "",
                          },
                        }));
                      }}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(255,255,255,0.8)",
                        color: "red",
                        zIndex: 1,
                        "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                      }}
                    >
                      <CloseCircle size={20} color="red" />
                    </IconButton>
                  </Box>
                ) : (
                  <>
                    <input
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      type="file"
                      style={{ display: "none" }}
                      id="aadhar-front-upload"
                      onChange={(e) => handleImageChange(e, "aadharCardFront")}
                    />
                    <label htmlFor="aadhar-front-upload">
                      <Button
                        variant="contained"
                        component="span"
                        color="primary"
                      >
                        Upload
                      </Button>
                    </label>
                  </>
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Aadhar Card Back</TableCell>
              <TableCell>
                {imagePreviews.aadharCardBack ||
                  studentData.studentDocuments?.aadharCardBack ? (
                  <Box
                    sx={{
                      position: "relative",
                      display: "inline-block",
                    }}
                  >
                    <img
                      src={
                        imagePreviews.aadharCardBack ||
                        `${config.hostUrl}/uploads/${studentData.studentDocuments.aadharCardBack}`
                      }
                      alt="Aadhar Back"
                      style={{
                        width: 100,
                        height: 60,
                        marginLeft: 8,
                        borderRadius: 4,
                        objectFit: "cover",
                        border: "1px solid #eee",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        setStudentImages((prev) => ({
                          ...prev,
                          aadharCardBack: null,
                        }));
                        setImagePreviews((prev) => ({
                          ...prev,
                          aadharCardBack: "",
                        }));
                        setStudentData((prev) => ({
                          ...prev,
                          studentDocuments: {
                            ...prev.studentDocuments,
                            aadharCardBack: "",
                          },
                        }));
                      }}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(255,255,255,0.8)",
                        color: "red",
                        zIndex: 1,
                        "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                      }}
                    >
                      <CloseCircle size={20} color="red" />
                    </IconButton>
                  </Box>
                ) : (
                  <>
                    <input
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      type="file"
                      style={{ display: "none" }}
                      id="aadhar-back-upload"
                      onChange={(e) => handleImageChange(e, "aadharCardBack")}
                    />
                    <label htmlFor="aadhar-back-upload">
                      <Button
                        variant="contained"
                        component="span"
                        color="primary"
                      >
                        Upload
                      </Button>
                    </label>
                  </>
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">PAN Card</TableCell>
              <TableCell>
                {imagePreviews.panCardPhoto ||
                  studentData.studentDocuments?.panCardPhoto ? (
                  <Box
                    sx={{
                      position: "relative",
                      display: "inline-block",
                    }}
                  >
                    <img
                      src={
                        imagePreviews.panCardPhoto ||
                        `${config.hostUrl}/uploads/${studentData.studentDocuments.panCardPhoto}`
                      }
                      alt="PAN Card"
                      style={{
                        width: 100,
                        height: 60,
                        marginLeft: 8,
                        borderRadius: 4,
                        objectFit: "cover",
                        border: "1px solid #eee",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        setStudentImages((prev) => ({
                          ...prev,
                          panCardPhoto: null,
                        }));
                        setImagePreviews((prev) => ({
                          ...prev,
                          panCardPhoto: "",
                        }));
                        setStudentData((prev) => ({
                          ...prev,
                          studentDocuments: {
                            ...prev.studentDocuments,
                            panCardPhoto: "",
                          },
                        }));
                      }}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(255,255,255,0.8)",
                        color: "red",
                        zIndex: 1,
                        "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                      }}
                    >
                      <CloseCircle size={20} color="red" />
                    </IconButton>
                  </Box>
                ) : (
                  <>
                    <input
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      type="file"
                      style={{ display: "none" }}
                      id="pan-card-upload"
                      onChange={(e) => handleImageChange(e, "panCardPhoto")}
                    />
                    <label htmlFor="pan-card-upload">
                      <Button
                        variant="contained"
                        component="span"
                        color="primary"
                      >
                        Upload
                      </Button>
                    </label>
                  </>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Modal>

      <Modal
        title={<span style={{ color: textColor }}>Fees Details</span>}
        styles={modalStyles}
        mousePosition={null}
        centered
        open={feesModal}
        onCancel={() => {
          setFeesModal(false);
          setFeesData([]);
        }}
        width={{
          xs: "90%",
          sm: "80%",
          md: "70%",
          lg: "60%",
          xl: "50%",
          xxl: "40%",
        }}
        zIndex={2000}
        footer={[
          <Button
            key="close"
            endIcon={<CloseCircle size={18} />}
            onClick={() => {
              setFeesModal(false);
              setFeesData([]);
            }}
          >
            Close
          </Button>,
        ]}
      >
        {feesLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Table
            sx={{
              backgroundColor: bgColor,
              color: textColor,
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Reference Id</TableCell>
                <TableCell>Mode</TableCell>
              </TableRow>
            </TableHead>
            {feesData && feesData.length > 0 ? (
              feesData.map((fee, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    {new Date(fee.datetime).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell>
                    {new Date(fee.datetime)
                      .toLocaleTimeString("en-IN")
                      .replace("pm", "PM")
                      .replace("am", "AM")}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(fee.amount)}
                  </TableCell>
                  <TableCell>{fee.paymentReferenceId}</TableCell>
                  <TableCell>{fee.paymentMode?.toUpperCase()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Empty description={
                    <Typography color="primary">
                      No pending enrollments found
                    </Typography>
                  } />
                </TableCell>
              </TableRow>
            )}
          </Table>
        )}
      </Modal>
    </>
  );
}

const breadcrumbLinks = [
  { title: "student", to: "/student/view" },
  { title: "student-details" },
];

export default function StudentListPage() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);

  const [allStudents, setAllStudents] = useState([]);
  const [students, setStudents] = useState([]);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    const getBatches = async () => {
      const resp = await fetch(`${config.hostUrl}/api/batch/get`, {
        method: "get",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (resp.status == 200) {
        const data = await resp.json();
        setBatches(data.data);
      }
    };

    async function fetchCourses() {
      const courses = await getCourses();
      setCourses(courses);
    }

    const getStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const resp = await fetch(`${config.hostUrl}/api/student/get`, {
          method: "get",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (resp.status != 200) {
          setToast({
            open: true,
            message: "Some error while fetching data",
            severity: "error",
          });
        } else {
          const data = await resp.json();
          setAllStudents(data.data);
          setStudents(data.data);
        }
      } catch (Err) {
        setToast({
          open: true,
          message: "Some error while fetching data",
          severity: "error",
        });
      }
    };

    fetchCourses();
    getBatches();
    getStudents();
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
      <Breadcrumbs custom heading="list" links={breadcrumbLinks} />
      <StudentList
        batches={batches}
        courses={courses}
        allStudents={allStudents}
        setAllStudents={setAllStudents}
        students={students}
        setStudents={setStudents}
      />
    </>
  );
}

ReactTable.propTypes = { data: PropTypes.array, columns: PropTypes.array };