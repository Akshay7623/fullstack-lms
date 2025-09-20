import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid2";
import {
  Stack,
  InputLabel,
  MenuItem,
  Select,
  Button,
  Card,
  CardContent,
  Typography,
  Menu,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  FormHelperText,
  Snackbar,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Add, Save2, CloseCircle, MoreCircle } from "iconsax-react";
import { Box } from "@mui/system";
import { TextField } from "@mui/material";
import { Empty, Modal } from "antd";
import CircularProgress from "@mui/material/CircularProgress";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import Alert from "@mui/material/Alert";
import getCourses from "../utils/api/getCourses";
import getTrainers from "../utils/api/getTrainers";
import LectureRow from "./LectureRow";
import { v4 as uuidv4 } from "uuid";
import getBatches from "../utils/api/getBatches";
import validMonths from '../utils/ValidMonths';
import config, { modalStyles, textColor, bgColor } from "../../config";

const batchTransitions = {
  active: [
    { label: "Mark as Archive", value: "archived" },
    { label: "Mark as Semi Active", value: "semi-active" },
  ],
  "semi-active": [
    { label: "Mark as Archive", value: "archived" },
    { label: "Mark as Active", value: "active" },
  ],
  archived: [
    { label: "Mark as Active", value: "active" },
    { label: "Mark as Semi Active", value: "semi-active" },
  ],
};

function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const holidays = [
  { date: "2025-01-01", name: "New Year's Day" },
  { date: "2025-01-14", name: "Makar Sankranti / Pongal" },
  { date: "2025-01-26", name: "Republic Day" },
  { date: "2025-03-17", name: "Holi" },
  { date: "2025-03-29", name: "Mahavir Jayanti" },
  { date: "2025-04-10", name: "Good Friday" },
  { date: "2025-04-14", name: "Ambedkar Jayanti" },
  { date: "2025-04-18", name: "Ram Navami" },
  { date: "2025-04-27", name: "Hanuman Jayanti" },
  { date: "2025-05-01", name: "Labour Day" },
  { date: "2025-06-06", name: "Bakrid / Eid al-Adha" },
  { date: "2025-07-12", name: "Guru Purnima" },
  { date: "2025-08-15", name: "Independence Day" },
  { date: "2025-08-17", name: "Parsi New Year" },
  { date: "2025-08-25", name: "Janmashtami" },
  { date: "2025-09-02", name: "Ganesh Chaturthi" },
  { date: "2025-10-02", name: "Gandhi Jayanti" },
  { date: "2025-10-03", name: "Durga Ashtami" },
  { date: "2025-10-05", name: "Vijaya Dashami / Dussehra" },
  { date: "2025-10-20", name: "Karwa Chauth" },
  { date: "2025-10-30", name: "Diwali" },
  { date: "2025-11-01", name: "Govardhan Puja" },
  { date: "2025-11-02", name: "Bhai Dooj" },
  { date: "2025-11-06", name: "Chhath Puja" },
  { date: "2025-11-20", name: "Guru Nanak Jayanti" },
  { date: "2025-12-25", name: "Christmas" },
];

const holidayMap = new Map();
holidays.forEach((e) => holidayMap.set(e.date, e.name));

const generateLectureDates = (
  startDate,
  count,
  classType,
  holidayMap = new Map()
) => {
  const dates = [];
  let current = new Date(startDate);
  let countAdded = 0;

  while (countAdded < count) {
    const day = current.getDay();
    const dateStr = formatDateLocal(current);
    const holidayName = holidayMap.get(dateStr) || null;

    const isWeekend = day === 6 || day === 0;
    const isWeekday = day !== 6 && day !== 0;

    let shouldAdd = false;

    if (classType === "weekend" && isWeekend) {
      shouldAdd = true;
    } else if (classType === "daily" && isWeekday) {
      shouldAdd = true;
    } else if (classType === "alternate") {
      shouldAdd = true;
    }

    if (shouldAdd) {
      dates.push({
        date: new Date(current),
        holidayName,
      });

      if (!holidayName) {
        countAdded++;
      }
    }

    current.setDate(current.getDate() + (classType === "alternate" ? 2 : 1));
  }

  return dates;
};

const Batch = ({ batchType }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [course, setCourse] = useState("all");
  const [month, setMonth] = useState("all");

  const [courses, setCourses] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addBatchModal, setAddBatchModal] = useState(false);
  const [addCalendarModal, setAddCalendarModal] = useState(false);

  const [errors, setErrors] = useState({});
  const [batches, setBatches] = useState([]);
  const [allBatch, setAllBatch] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [topic, setTopics] = useState([]);

  const [defaultStartTime, setDefaultStartTime] = useState(null);
  const [defaultEndTime, setDefaultEndTime] = useState(null);
  const [filteredTrainer, setFiltedTrainer] = useState([]);

  const [lectureRows, setLectureRows] = useState([]);
  const [rowsToAdd, setRowsToAdd] = useState(1);
  const [isBatchLoading, setIsBatchLoading] = useState(true);

  const [batchFormData, setBatchFormData] = useState({
    month: "",
    year: "",
    courseCode: "",
    courseName: "",
    batchNumber: 1,
    tentativeStartDate: null,
    classType: "",
  });

  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const [studentsModal, setStudentsModal] = useState({
    open: false,
    loading: false,
    students: [],
    batchName: null,
  });

  const navigate = useNavigate();

  const handleLectureRowUpdate = (id, updatedRow) => {
    setLectureRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? updatedRow : row))
    );
  };

  const handleLectureRowRemove = (id) => {
    const remainingRows = lectureRows.filter((row) => row.id !== id);
    setLectureRows(remainingRows);
  };

  const handleScheduleLecture = (id) => {
    const idx = lectureRows.findIndex((row) => row.id === id);
    if (idx === -1) return;

    const updated = [...lectureRows];

    updated[idx].holidayName = null;

    const nonHolidayIndices = updated.map((row, i) => ({ i, isHoliday: !!row.holidayName })).filter(({ isHoliday }) => !isHoliday).map(({ i }) => i);

    for (let j = idx; j < updated.length; j++) {
      if (!updated[j].holidayName) {
        const nextIdx = nonHolidayIndices.find((i) => i > j);
        if (nextIdx !== undefined) {
          updated[j].topic = updated[nextIdx].topic;
        } else {
          updated[j].topic = "";
        }
      }
    }

    setLectureRows(updated);
  };

  const validateBatchForm = () => {
    const errors = {};

    if (!batchFormData.month || !validMonths.includes(batchFormData.month))
      errors.month = "Please select a valid month.";

    const yearNum = Number(batchFormData.year);
    if (!batchFormData.year || isNaN(yearNum) || yearNum < 2025)
      errors.year = "Please select a valid year.";

    if (!batchFormData.courseCode) errors.course = "Please select a course.";

    if (!batchFormData.tentativeStartDate)
      errors.tentativeStartDate = "Please select a tentative start date.";

    if (!batchFormData.classType)
      errors.classType = "Please select a batch class schedule.";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const markBatch = async (_id, status) => {
    const token = localStorage.getItem("token");

    handleMenuClose();

    try {
      const resp = await fetch(`${config.hostUrl}/api/batch/update_status`, {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ _id: _id, status: status }),
      });

      if (resp.status != 200) {
        setToast({
          open: true,
          message: `Failed to mark as semi active`,
          severity: "error",
        });
      } else {
        const filteredBatches = batches.filter((batch) => batch._id != _id);
        setBatches(filteredBatches);

        setToast({
          open: true,
          message: `Marked batch as ${status} successfully`,
          severity: "success",
        });
      }
    } catch (Err) {
      setToast({
        open: true,
        message: `Failed to mark as semi active`,
        severity: "error",
      });
    }
  };

  const handleViewStudents = async (batch) => {
    const batchCode = `${batch.month.slice(0, 3).toUpperCase()}${batch.year}-${batch.courseCode}-${batch.batchNo}`;

    setStudentsModal({
      open: true,
      loading: true,
      students: [],
      batchName: batchCode,
    });

    handleMenuClose();

    try {
      const token = localStorage.getItem("token");
      const batchCode = `${batch.month.slice(0, 3).toUpperCase()}${batch.year}-${batch.courseCode}-${batch.batchNo}`;

      const resp = await fetch(`${config.hostUrl}/api/batch/get/students/${batchCode}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const data = await resp.json();
      setStudentsModal((prev) => ({ ...prev, open: true, loading: false, students: data.students || [], }));

    } catch (err) {
      setStudentsModal((prev) => ({
        ...prev,
        loading: false,
        students: [],
      }));
      setToast({
        open: true,
        message: "Failed to fetch students",
        severity: "error",
      });
    }
  };

  const handleBatchFormChange = (field, value) => {
    if (field === "course") {
      const courseCode = value;
      const courseName = courses.find((c) => c.code === value).name;

      setBatchFormData((prev) => ({
        ...prev,
        courseCode: courseCode,
        courseName: courseName,
      }));
      return;
    }

    setBatchFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBatchNumberChange = (change) => {
    setBatchFormData((prev) => ({
      ...prev,
      batchNumber: prev.batchNumber + change,
    }));
  };

  const handleAddBatch = () => {
    setAddBatchModal(true);
  };

  const openBatchCalendar = async () => {
    if (!validateBatchForm()) return;
    setAddBatchModal(false);
    setAddCalendarModal(true);

    const filtered = trainers.filter(
      (t) => t.course === batchFormData.courseName
    );

    setFiltedTrainer(filtered);
    const course = courses.find((c) => c.name === batchFormData.courseName);
    setTopics(course.topics);
  };

  const handleMonthChange = (e) => {
    const selectedMonth = e.target.value;
    setMonth(selectedMonth);
    let filteredBatches = allBatch;

    if (selectedMonth && selectedMonth !== "all") {
      filteredBatches = filteredBatches.filter(
        (batch) => batch.month === selectedMonth
      );
    }

    if (course && course !== "all") {
      filteredBatches = filteredBatches.filter(
        (batch) => batch.course === course
      );
    }

    setBatches(filteredBatches);
  };

  const handleCourseChange = (e) => {
    const selectedCourse = e.target.value;
    setCourse(selectedCourse);
    let filteredBatches = allBatch;
    if (selectedCourse && selectedCourse !== "all") {
      filteredBatches = filteredBatches.filter(
        (batch) => batch.courseName === selectedCourse
      );
    }

    if (month && month !== "all") {
      filteredBatches = filteredBatches.filter(
        (batch) => batch.month === month
      );
    }

    setBatches(filteredBatches);
  };

  const handleDateChange = (newValue, field) => {
    setBatchFormData((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const handleFocus = (field) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const submitBatch = async () => {
    const lectureErrors = {
      dateErr: null,
      timeErr: null,
      invalidDate: null,
      timeGap: null,
    };

    lectureRows.forEach((row, idx) => {
      if (!row.date) {
        lectureErrors.dateErr = `Row Date is required.`;
      }

      if (!row.startTime || !row.endTime) {
        lectureErrors.timeErr = `Start and End time are required.`;
      } else {
        const start = new Date(row.startTime);
        const end = new Date(row.endTime);
        if (isNaN(start) || isNaN(end)) {
          lectureErrors.invalidDate = `Invalid date/time format.`;
        } else if (start >= end) {
          lectureErrors.timeGap = `End time must be after Start time.`;
        }
      }
    });

    const err = [];

    for (const key in lectureErrors) {
      if (lectureErrors[key]) {
        err.push(lectureErrors[key]);
      }
    }

    if (err.length) {
      setToast({
        open: true,
        message: err.join(" "),
        severity: "error",
      });

      return;
    }

    const token = localStorage.getItem("token");
    try {
      const resp = await fetch(`${config.hostUrl}/api/batch/add`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...batchFormData,
          year: Number(batchFormData.year),
          lectures: lectureRows,
        }),
      });

      const data = await resp.json();

      if (resp.status === 409) {
        setToast({
          open: true,
          message: "This batch already exist !",
          severity: "error",
        });
        return;
      } else if (resp.status === 201) {
        setAllBatch((prev) => [...prev, data.data]);
        setBatches((prev) => [...prev, data.data]);
        setAddBatchModal(false);
        setAddCalendarModal(false);

        setToast({
          open: true,
          message: "Batch Added Successfully!",
          severity: "success",
        });

        setBatchFormData({
          month: "",
          year: "",
          courseCode: "",
          courseName: "",
          batchNumber: 1,
          tentativeStartDate: null,
          classType: "",
        });

        setDefaultStartTime(null);
        setDefaultEndTime(null);
        setRowsToAdd(1);
        setLectureRows([]);
        setTopics([]);

        return;
      }
    } catch (Err) {
      console.log("Err while submiting the batch", Err);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      const courses = await getCourses();
      setCourses(courses);
    };

    const fetchTrainers = async () => {
      const trainers = await getTrainers();
      setTrainers(trainers);
    };

    const fetchBatches = async () => {
      const batches = await getBatches();
      setAllBatch(batches);
      setBatches(batches.filter((b) => b.status === batchType));
      setIsBatchLoading(false);
    };

    fetchCourses();
    fetchTrainers();
    fetchBatches();
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

      <Grid container spacing={2} gap={2}>
        <Grid item xs={12} sm={3}>
          <Stack sx={{ mt: 2, gap: 1 }}>
            <InputLabel id="course-select">Filter By Course</InputLabel>
            <Select
              labelId="course-select"
              size="small"
              name="course"
              value={course}
              onChange={handleCourseChange}
              fullWidth
              displayEmpty
              sx={{
                minWidth: "300px",
                width: "100%",
              }}
              MenuProps={{
                disablePortal: true,
                PaperProps: {
                  sx: {
                    zIndex: 2100,
                    mb: 1,
                    mt: 1,
                  },
                },
              }}
            >
              <MenuItem value="all">All Courses</MenuItem>
              {(courses || []).map((courseItem, index) => {
                if (!courseItem || !courseItem.name) {
                  return null;
                }
                return (
                  <MenuItem key={index} value={courseItem.name}>
                    {courseItem.name}
                  </MenuItem>
                );
              })}
            </Select>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Stack sx={{ mt: 2, gap: 1 }}>
            <InputLabel id="month-select">Filter By Month</InputLabel>
            <Select
              size="small"
              labelId="month-select"
              name="month"
              autoComplete="new"
              value={month}
              onChange={handleMonthChange}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="January">January</MenuItem>
              <MenuItem value="February">February</MenuItem>
              <MenuItem value="March">March</MenuItem>
              <MenuItem value="April">April</MenuItem>
              <MenuItem value="May">May</MenuItem>
              <MenuItem value="June">June</MenuItem>
              <MenuItem value="July">July</MenuItem>
              <MenuItem value="August">August</MenuItem>
              <MenuItem value="September">September</MenuItem>
              <MenuItem value="October">October</MenuItem>
              <MenuItem value="November">November</MenuItem>
              <MenuItem value="December">December</MenuItem>
            </Select>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Stack sx={{ mt: 6, gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="large"
              component={Link}
              onClick={handleAddBatch}
            >
              Add Batch
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {(batches || []).map(
          (item) =>
            item.status === batchType && (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="h6">{`${item.month.slice(0, 3).toUpperCase()}${item.year}-${item.courseCode}-${item.batchNo}`}</Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, item)}
                      >
                        <MoreCircle size={20} />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {`${item.courseName} batch ${item.month} ${item.year}`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )
        )}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            handleMenuClose();
            navigate(`/batches/view/${selectedItem._id}`);
          }}>View Lectures</MenuItem>
          <MenuItem onClick={handleMenuClose}>Academic Calendar</MenuItem>
          <MenuItem onClick={handleMenuClose}>Attendance Summary</MenuItem>

          <MenuItem
            onClick={() => selectedItem && handleViewStudents(selectedItem)}
          >
            View Students
          </MenuItem>
          {batchTransitions[batchType]?.map((item, index) => (
            <MenuItem
              key={index}
              onClick={() =>
                selectedItem && markBatch(selectedItem._id, item.value)
              }
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </Grid>

      {
        !isBatchLoading && batches.length === 0 && (
          <Empty
            description={
              <Typography color="primary">
                No {batchType.split('-').join(" ")} batch found
              </Typography>
            }
          />
        )
      }

      <Modal
        title={<span style={{ color: textColor }}>Add Batch</span>}
        styles={modalStyles}
        centered
        open={addBatchModal}
        onOk={() => setAddBatchModal(false)}
        onCancel={() => {
          setBatchFormData({
            month: "",
            year: "",
            courseName: "",
            courseCode: "",
            batchNumber: 1,
            tentativeStartDate: null,
            classType: "",
          });

          setErrors({
            month: "",
            year: "",
            course: "",
            batchNumber: "",
            tentativeStartDate: "",
            classType: "",
          });
          setAddBatchModal(false);
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
            key="update"
            endIcon={<Save2 size={18} />}
            onClick={openBatchCalendar}
          >
            Submit
          </Button>,
          <Button
            key="close"
            type="primary"
            endIcon={<CloseCircle size={18} />}
            onClick={() => {
              setBatchFormData({
                month: "",
                year: "",
                courseName: "",
                courseCode: "",
                batchNumber: 1,
                tentativeStartDate: null,
                classType: "",
              });

              setErrors({
                month: "",
                year: "",
                courseName: "",
                courseCode: "",
                batchNumber: "",
                tentativeStartDate: "",
                classType: "",
              });
              setAddBatchModal(false);
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
              <TableCell variant="head">Select Month</TableCell>
              <TableCell>
                <Select
                  labelId="month-select"
                  name="month"
                  value={batchFormData.month}
                  onChange={(e) =>
                    handleBatchFormChange("month", e.target.value)
                  }
                  error={Boolean(errors.month)}
                  onFocus={() => handleFocus("month")}
                  fullWidth
                  displayEmpty
                  MenuProps={{
                    disablePortal: true,
                    PaperProps: {
                      sx: {
                        zIndex: 2100,
                        mb: 1,
                        mt: 1,
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Month
                  </MenuItem>
                  <MenuItem value="January">January</MenuItem>
                  <MenuItem value="February">February</MenuItem>
                  <MenuItem value="March">March</MenuItem>
                  <MenuItem value="April">April</MenuItem>
                  <MenuItem value="May">May</MenuItem>
                  <MenuItem value="June">June</MenuItem>
                  <MenuItem value="July">July</MenuItem>
                  <MenuItem value="August">August</MenuItem>
                  <MenuItem value="September">September</MenuItem>
                  <MenuItem value="October">October</MenuItem>
                  <MenuItem value="November">November</MenuItem>
                  <MenuItem value="December">December</MenuItem>
                </Select>
                {errors.month && (
                  <FormHelperText>{errors.month}</FormHelperText>
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Select Year</TableCell>
              <TableCell>
                <Select
                  labelId="year-select"
                  name="year"
                  value={batchFormData.year}
                  onChange={(e) =>
                    handleBatchFormChange("year", e.target.value)
                  }
                  error={Boolean(errors.year)}
                  onFocus={() => handleFocus("year")}
                  fullWidth
                  displayEmpty
                  MenuProps={{
                    disablePortal: true,
                    PaperProps: {
                      sx: {
                        zIndex: 2100,
                        mb: 1,
                        mt: 1,
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Year
                  </MenuItem>
                  <MenuItem value="2024">2024</MenuItem>
                  <MenuItem value="2025">2025</MenuItem>
                  <MenuItem value="2026">2026</MenuItem>
                  <MenuItem value="2027">2027</MenuItem>
                  <MenuItem value="2028">2028</MenuItem>
                </Select>
                {errors.year && <FormHelperText>{errors.year}</FormHelperText>}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Select Course</TableCell>
              <TableCell>
                <Select
                  labelId="course-select"
                  name="course"
                  value={batchFormData.courseCode}
                  onChange={(e) =>
                    handleBatchFormChange("course", e.target.value)
                  }
                  error={Boolean(errors.course)}
                  onFocus={() => handleFocus("course")}
                  fullWidth
                  displayEmpty
                  MenuProps={{
                    disablePortal: true,
                    PaperProps: {
                      sx: {
                        zIndex: 2100,
                        mb: 1,
                        mt: 1,
                      },
                    },
                  }}
                  sx={{
                    minWidth: "300px",
                    width: "100%",
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Course
                  </MenuItem>
                  {(courses || []).map((course, _) => (
                    <MenuItem key={_} value={course.code}>
                      {course.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.course && (
                  <FormHelperText>{errors.course}</FormHelperText>
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell align="center" colSpan={2}>
                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={() => handleBatchNumberChange(-1)}
                    disabled={batchFormData.batchNumber <= 1}
                    sx={{
                      minWidth: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      userSelect: "none",
                      p: 0,
                    }}
                  >
                    -
                  </Button>
                  <Typography
                    variant="h3"
                    sx={{
                      minWidth: "60px",
                      textAlign: "center",
                      fontWeight: "bold",
                      userSelect: "none",
                    }}
                    color="primary"
                  >
                    {batchFormData.batchNumber}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => handleBatchNumberChange(1)}
                    sx={{
                      minWidth: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      userSelect: "none",
                      p: 0,
                    }}
                  >
                    +
                  </Button>
                </Box>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={2}>
                <Typography
                  variant="h3"
                  sx={{
                    minWidth: "60px",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                  color="primary"
                >
                  {batchFormData.month &&
                    batchFormData.year &&
                    batchFormData.courseCode
                    ? `${batchFormData.month.toUpperCase().slice(0, 3)}${batchFormData.year}-${batchFormData.courseCode.toUpperCase()}-${batchFormData.batchNumber}`
                    : ""}
                </Typography>
                {batchFormData.tentativeStartDate && (
                  <Typography
                    variant="body1"
                    sx={{
                      textAlign: "center",
                      mt: 1,
                      color: "text.secondary",
                    }}
                  >
                    Tentative Start:
                    {batchFormData.tentativeStartDate.toLocaleDateString()}
                  </Typography>
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Tentative Start Date</TableCell>
              <TableCell>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={batchFormData.tentativeStartDate}
                    onChange={(newValue) =>
                      handleDateChange(newValue, "tentativeStartDate")
                    }
                    error={Boolean(errors.tentativeStartDate)}
                    onOpen={() => handleFocus("tentativeStartDate")}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: Boolean(errors.tentativeStartDate),
                        helperText: errors.tentativeStartDate || "",
                        sx: {
                          minWidth: "300px",
                          width: "100%",
                        },
                      },
                      popper: {
                        sx: {
                          zIndex: 3000,
                          placement: "top",
                        },
                      },
                    }}
                    disablePast
                    format="dd/MM/yyyy"
                  />
                </LocalizationProvider>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Batch Class Schedule</TableCell>
              <TableCell>
                <Select
                  labelId="class-schedule-select"
                  name="classType"
                  value={batchFormData.classType}
                  onChange={(e) =>
                    handleBatchFormChange("classType", e.target.value)
                  }
                  error={Boolean(errors.classType)}
                  onFocus={() => handleFocus("classType")}
                  fullWidth
                  displayEmpty
                  MenuProps={{
                    disablePortal: true,
                    PaperProps: {
                      sx: {
                        zIndex: 2100,
                        mb: 1,
                        mt: 1,
                      },
                    },
                  }}
                  sx={{
                    minWidth: "300px",
                    width: "100%",
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Batch Class Schedule
                  </MenuItem>
                  <MenuItem value="weekend">
                    Weekend (Saturday & Sunday)
                  </MenuItem>
                  <MenuItem value="daily">
                    Daily (Excluding Saturday & Sunday)
                  </MenuItem>
                  <MenuItem value="alternate">
                    Alternate Days (Gap of 1 Day)
                  </MenuItem>
                </Select>
                {errors.classType && (
                  <FormHelperText>{errors.classType}</FormHelperText>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Modal>

      <Modal
        title={<span style={{ color: textColor }}>Batch Calendar</span>}
        styles={modalStyles}
        centered
        open={addCalendarModal}
        onOk={() => setAddCalendarModal(false)}
        onCancel={() => {
          setBatchFormData({
            month: "",
            year: "",
            courseCode: "",
            courseName: "",
            batchNumber: 1,
            tentativeStartDate: null,
            classType: "",
          });
          setDefaultStartTime(null);
          setDefaultEndTime(null);
          setRowsToAdd(1);
          setLectureRows([]);
          setTopics([]);
          setAddCalendarModal(false);
        }}
        width={{
          xs: "90%",
          sm: "90%",
          md: "90%",
          lg: "90%",
          xl: "90%",
          xxl: "50%",
        }}
        maskClosable={false}
        zIndex={2000}
        footer={[
          <Button
            key="update"
            endIcon={<Save2 size={18} />}
            onClick={submitBatch}
          >
            Submit
          </Button>,
          <Button
            key="close"
            type="primary"
            endIcon={<CloseCircle size={18} />}
            onClick={() => {
              setBatchFormData({
                month: "",
                year: "",
                courseCode: "",
                courseName: "",
                batchNumber: 1,
                tentativeStartDate: null,
                classType: "",
              });
              setDefaultStartTime(null);
              setDefaultEndTime(null);
              setRowsToAdd(1);
              setLectureRows([]);
              setTopics([]);
              setAddCalendarModal(false);
            }}
          >
            Close
          </Button>,
        ]}
      >
        <Box
          display="flex"
          alignItems="center"
          gap={2}
          sx={{ mt: 2, flexWrap: "wrap" }}
        >
          <TextField
            label="Enter Rows"
            type="number"
            value={rowsToAdd}
            onChange={(e) => setRowsToAdd(e.target.value)}
            size="small"
            sx={{ width: 100 }}
            onWheel={(e) => e.target.blur()}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TimePicker
              label="Default Start"
              value={defaultStartTime}
              onChange={setDefaultStartTime}
              slotProps={{
                textField: {
                  size: "small",
                  sx: { minWidth: 120, maxWidth: 140 },
                },
                popper: {
                  sx: {
                    zIndex: 3000,
                  },
                },
              }}
            />

            <TimePicker
              label="Default End"
              value={defaultEndTime}
              onChange={setDefaultEndTime}
              slotProps={{
                textField: {
                  size: "small",
                  sx: { minWidth: 120, maxWidth: 140 },
                },
                popper: {
                  sx: {
                    zIndex: 3000,
                  },
                },
              }}
            />
          </LocalizationProvider>

          <IconButton
            onClick={() => {
              let startDate = batchFormData.tentativeStartDate;

              if (lectureRows.length) {
                const lastDate = lectureRows[lectureRows.length - 1].date;
                startDate = new Date(lastDate);
                if (batchFormData.classType === "alternate") {
                  startDate.setDate(startDate.getDate() + 2);
                } else {
                  startDate.setDate(startDate.getDate() + 1);
                }
              }

              const dates = generateLectureDates(
                startDate,
                rowsToAdd,
                batchFormData.classType,
                holidayMap
              );

              let topicIndex = lectureRows.filter(
                (row) => !row.holidayName
              ).length;

              const newRows = dates.map(({ date, holidayName }) => {
                const isHoliday = !!holidayName;

                const row = {
                  id: uuidv4(),
                  date,
                  holidayName,
                  startTime: defaultStartTime,
                  endTime: defaultEndTime,
                  topic: isHoliday ? "" : topic[topicIndex] || "",
                  trainer: "",
                };

                if (!isHoliday) topicIndex++;
                return row;
              });

              setLectureRows([...lectureRows, ...newRows]);
            }}
          >
            <Add variant="Outline" />
          </IconButton>
          <Typography sx={{ color: (theme) => theme.palette.text.primary }}>
            OR
          </Typography>

          <Button
            variant="contained"
            onClick={() => {
              let startDate = batchFormData.tentativeStartDate;

              const dates = generateLectureDates(
                startDate,
                topic.length,
                batchFormData.classType,
                holidayMap
              );

              let topicIndex = 0;

              const newRows = dates.map(({ date, holidayName }, idx) => {
                const isHoliday = !!holidayName;

                const row = {
                  id: uuidv4(),
                  date,
                  holidayName,
                  startTime: defaultStartTime,
                  endTime: defaultEndTime,
                  topic: isHoliday ? "" : topic[topicIndex] || "",
                  trainer: "",
                };

                if (!isHoliday) topicIndex++;
                return row;
              });

              setLectureRows(newRows);
            }}
          >
            Add All Topics
          </Button>
        </Box>

        <Table className="mt-2">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Lecture Topic</TableCell>
              <TableCell>Trainer</TableCell>
              <TableCell>Remove</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lectureRows.map((row, idx) => (
              <LectureRow
                key={row.id}
                initialRow={row}
                index={idx}
                id={row.id}
                trainerList={filteredTrainer}
                topics={topic}
                onUpdate={handleLectureRowUpdate}
                onRemove={handleLectureRowRemove}
                onScheduleLecture={handleScheduleLecture}
              />
            ))}
          </TableBody>
        </Table>
      </Modal>

      <Modal
        title={
          <span style={{ color: textColor }}>
            Students in {studentsModal.batchName}
          </span>
        }
        styles={modalStyles}
        open={studentsModal.open}
        onCancel={() => setStudentsModal({ ...studentsModal, open: false })}
        centered
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
            type="primary"
            endIcon={<CloseCircle size={18} />}
            onClick={() => setStudentsModal({ ...studentsModal, open: false })}
          >
            Close
          </Button>,
        ]}
      >
        {studentsModal.loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={200}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {studentsModal.students.length === 0 ? (
              <Empty
                description={
                  <Typography color="primary">
                    No students found in this batch
                  </Typography>
                }
              />
            ) : (
              <Table
                sx={{
                  backgroundColor: bgColor,
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Enrollment Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentsModal.students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>
                        <Typography variant="h6">{student.firstName} {student.lastName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>{student.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>{student.mobileNumber}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>{new Date(student.
                          registrationDate).toLocaleDateString("en-IN")}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="caption"
                          sx={{
                            px: 1,
                            py: 0.5,
                            bgcolor: "success.main",
                            color: "white",
                            borderRadius: 1,
                          }}
                        >
                          Active
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        )}
      </Modal>
    </>
  );
};

export default Batch;