import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import CardMedia from "@mui/material/CardMedia";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid2";
import Pagination from "@mui/material/Pagination";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
  Stack,
  Select,
  MenuItem,
  InputLabel,
  InputAdornment,
} from "@mui/material";
import Breadcrumbs from "components/@extended/Breadcrumbs";
import IconButton from "components/@extended/IconButton";
import MainCard from "components/MainCard";
import { GRID_COMMON_SPACING } from "config";
import { Modal } from "antd";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { TextField } from "@mui/material";
import { Add, CloseCircle, Edit, Save2, TickCircle } from "iconsax-react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import SHA1 from "crypto-js/sha1";
import Tooltip from "@mui/material/Tooltip";
import config, { modalStyles, textColor, bgColor } from '../config';

function hashTopics(topics) {
  return SHA1(topics.join("||")).toString();
}

const breadcrumbLinks = [{ title: "courses" }, { title: "view" }];

export default function CoursesViewPage() {
  const [totalPage, setTotalPage] = useState(0);
  const [originalTopicsHash, setOriginalTopicsHash] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [page, setPage] = useState(1);
  const [courses, setCourses] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [courseData, setCourseData] = useState({
    _id: "",
    name: "",
    duration: "",
    prices: {
      certification: "",
      diploma: "",
      masterDiploma: "",
    },
    status: "",
    details: "",
    code: "",
    topics: [],
  });
  const [toDelete, setToDelete] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const pageSize = 8;

  const validateForm = (form) => {
    const newErrors = {};

    if (!form.name || !form.name.trim())
      newErrors.name = "Course name is required";

    if (!form.duration || !form.duration.trim())
      newErrors.duration = "Course duration is required";

    if (!form.code || !form.code.trim())
      newErrors.code = "Course code is required";

    const cert = form.prices.certification;
    const dip = form.prices.diploma;
    const master = form.prices.masterDiploma;

    if (Number(cert) < 0)
      newErrors.certification = "Certification price must be zero or positive";
    if (Number(dip) < 0)
      newErrors.diploma = "Diploma price must be zero or positive";
    if (Number(master) < 0)
      newErrors.masterDiploma = "Master Diploma price must be zero or positive";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (file && !["image/jpeg", "image/png"].includes(file.type)) {
      setToast({
        open: true,
        message: "Only JPG, JPEG, and PNG files are allowed!",
        severity: "error",
      });
      event.target.value = "";
      return;
    } else {
      if (file) {
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handlePageChange = (_, value) => {
    setPage(value);
  };

  const ItemRow = ({ title, value }) => {
    return (
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          py: 1,
        }}
      >
        <Typography sx={{ color: "text.secondary" }}>{title}</Typography>
        <Typography>{value}</Typography>
      </Stack>
    );
  };

  const fetchCourse = async () => {
    const token = localStorage.getItem("token");

    try {
      const resp = await fetch(`${config.hostUrl}/api/course/get`, {
        method: "get",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const finalResp = await resp.json();

      if (resp.status == 200 && finalResp?.data?.length > 0) {
        return finalResp.data;
      } else {
        return null;
      }
    } catch (Err) {
      console.log("Some error while fetching data", Err);
      return null;
    }
  };

  const updateDetails = async (_id) => {
    if (!validateForm(courseData)) {
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("_id", courseData._id);
    formData.append("name", courseData.name);
    formData.append("duration", courseData.duration);
    formData.append("status", courseData.status);
    formData.append("details", courseData.details);
    formData.append("code", courseData.code);
    formData.append(
      "prices",
      JSON.stringify({
        certification: Number(courseData.prices.certification),
        diploma: Number(courseData.prices.diploma),
        masterDiploma: Number(courseData.prices.masterDiploma),
      })
    );

    const currentTopicsHash = hashTopics(courseData.topics);

    if (currentTopicsHash !== originalTopicsHash) {
      courseData.topics.forEach((t) => {
        formData.append("topics", t);
      });
    }

    if (image instanceof File) {
      formData.append("img", image);
    } else {
      formData.append("existingImage", image);
    }

    try {
      const resp = await fetch(`${config.hostUrl}/api/course/update`, {
        method: "put",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();

      if (resp.status == 200) {
        setEditModal(false);
        setToast({
          open: true,
          message: "Course updated successfully!",
          severity: "success",
        });

        const index = courses.findIndex((course) => course._id == _id);
        const newCourse = courses;
        newCourse[index] = data.course;
        setCourses(newCourse);
      } else {
        setToast({
          open: true,
          message: "Failed to update course.",
          severity: "error",
        });
      }
    } catch (error) {
      setToast({
        open: true,
        message: "Some error occurred.",
        severity: "error",
      });
      console.log("Some error", error);
    }
  };

  const hanldeFocus = (e) => {
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const handleDeleteCourse = async (_id) => {
    setToDelete(_id);
    setDeleteModal(true);
  };

  const handleEditInput = (e) => {
    setCourseData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem("token");

    if (toDelete) {
      try {
        const resp = await fetch(
          `${config.hostUrl}/api/course/delete/${toDelete}`,
          {
            method: "delete",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await resp.json();

        if (resp.status == 200) {
          const remainingCourse = courses.filter(
            (course) => course._id !== toDelete
          );
          setCourses(remainingCourse);
          setDeleteModal(false);
          setToDelete(null);
          setToast({
            open: true,
            message: "Course deleted successfully",
            severity: "success",
          });
        } else {
          setToast({
            open: true,
            message: "Failed to delete course.",
            severity: "error",
          });
        }
      } catch (Err) {
        setToast({
          open: true,
          message: "Failed to delete course.",
          severity: "error",
        });
      }
    } else {
      // throw custom error like please refresh page something like that
    }
  };

  const OpenEditModal = (_id) => {
    const data = courses.find((course) => course._id == _id);
    setCourseData({
      _id: data._id,
      name: data.name,
      duration: data.duration,
      prices: {
        certification: data.prices.certification,
        diploma: data.prices.diploma,
        masterDiploma: data.prices.masterDiploma,
      },
      status: data.status,
      details: data.details,
      code: data.code,
      topics: data.topics,
    });
    setImagePreview(`${config.hostUrl}/uploads/${data.img}`);
    setOriginalTopicsHash(hashTopics(data.topics || []));
    setImage(data.img);
    setEditModal(true);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  useEffect(() => {
    async function fetchData() {
      const data = await fetchCourse();
      if (data) {
        setCourses(data);
        setPage(1);
        setTotalPage(Math.ceil(data.length / pageSize));
      }
    }
    fetchData();
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
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <Breadcrumbs custom heading="view-courses" links={breadcrumbLinks} />
        <Button
          variant="contained"
          startIcon={<Add />}
          component={Link}
          to="/courses/add"
        >
          Add Course
        </Button>
      </Stack>

      <Grid container spacing={GRID_COMMON_SPACING}>
        {courses && courses.length > 0 ? (
          courses
            .slice((page - 1) * pageSize, page * pageSize)
            .map((course, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                <MainCard content={false} sx={{ p: 1.25 }}>
                  <Box sx={{ position: "relative", width: 1 }}>
                    <CardMedia
                      component="img"
                      height="auto"
                      image={`${config.hostUrl}/uploads/${course.img}`}
                      alt="Course Image"
                      sx={{ width: 1, display: "block", borderRadius: 1 }}
                    />
                    <Badge
                      sx={{
                        position: "absolute",
                        top: 15,
                        right: 25,
                        ".MuiBadge-badge": {
                          p: 0.5,
                          borderRadius: 0.5,
                          bgcolor: "background.paper",
                        },
                      }}
                      badgeContent={course.tag}
                    />
                  </Box>

                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 0.5,
                      mt: 2.5,
                      mb: 1.25,
                    }}
                  >
                    <Stack sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          width: 1,
                        }}
                      >
                        {course.title}
                      </Typography>
                      <Stack
                        direction="row"
                        sx={{
                          alignItems: "center",
                          gap: 0.5,
                          color: "warning.main",
                        }}
                      ></Stack>
                    </Stack>
                    <IconButton
                      size="small"
                      color="secondary"
                      sx={{ minWidth: 30 }}
                      onClick={() => OpenEditModal(course._id)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Stack>

                  <Divider />
                  <Stack>
                    <ItemRow title="Name" value={course.name} />
                    <ItemRow title="Duration" value={course.duration} />
                    <Divider />
                    <ItemRow
                      title="Status"
                      value={course.status[0]
                        ?.toUpperCase()
                        .concat(course.status.split("").slice(1).join(""))}
                    />
                    <Divider />
                    <ItemRow title="Code" value={course.code} />
                    <Divider />

                    <Stack sx={{ my: 1 }}>
                      <ItemRow title="Prices:" />
                      <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: "warning.main" }}
                        >
                          Certification:₹
                          {Number(
                            String(course.prices.certification).replace(
                              /[^\d]/g,
                              ""
                            )
                          ).toLocaleString("en-IN")}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "info.main" }}>
                          Diploma: ₹
                          {Number(
                            String(course.prices.diploma).replace(/[^\d]/g, "")
                          ).toLocaleString("en-IN")}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "success.main" }}
                        >
                          Master Diploma: ₹
                          {Number(
                            String(course.prices.masterDiploma).replace(
                              /[^\d]/g,
                              ""
                            )
                          ).toLocaleString("en-IN")}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        mt: 1,
                        minHeight: 48,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {course.details}
                    </Typography>
                  </Stack>

                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ mt: 1.25 }}
                    endIcon={<CloseCircle size={18} />}
                    onClick={() => handleDeleteCourse(course._id)}
                  >
                    Delete Course
                  </Button>
                </MainCard>
              </Grid>
            ))
        ) : (
          <>
            <Typography variant="h5" color="text.secondary">
              No courses available
            </Typography>
          </>
        )}
      </Grid>
      
      <Stack sx={{ alignItems: "flex-end", mt: 2.5 }}>
        <Pagination
          count={totalPage}
          onChange={handlePageChange}
          size="medium"
          page={page}
          showFirstButton
          showLastButton
          variant="combined"
          color="primary"
        />
      </Stack>

      <Modal
        title={<span style={{ color: textColor }}>Update Course Details</span>}
        styles={modalStyles}
        centered
        open={editModal}
        onOk={() => setEditModal(false)}
        onCancel={() => setEditModal(false)}
        width={{
          xs: "90%",
          sm: "80%",
          md: "80%",
          lg: "70%",
          xl: "60%",
          xxl: "50%",
        }}
        zIndex={2000}
        footer={[
          <Button
            key="update"
            endIcon={<Save2 size={18} />}
            onClick={() => updateDetails(courseData._id)}
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
        <Table sx={{ backgroundColor: bgColor }}>
          <TableBody>
            <TableRow>
              <TableCell variant="head">Course Name</TableCell>
              <TableCell>
                <TextField
                  label="Course Name"
                  variant="outlined"
                  name="name"
                  fullWidth
                  sx={{ mb: 1, mt: 1 }}
                  value={courseData.name}
                  onChange={handleEditInput}
                  autoComplete="off"
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  onFocus={hanldeFocus}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Course Duration</TableCell>
              <TableCell>
                <TextField
                  label="Course Duration"
                  variant="outlined"
                  name="duration"
                  fullWidth
                  sx={{ mb: 1, mt: 1 }}
                  value={courseData.duration}
                  onChange={handleEditInput}
                  autoComplete="off"
                  error={Boolean(errors.duration)}
                  helperText={errors.duration}
                  onFocus={hanldeFocus}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Course code</TableCell>
              <TableCell>
                <TextField
                  label="Course Code"
                  variant="outlined"
                  name="code"
                  fullWidth
                  sx={{ mb: 1, mt: 1 }}
                  value={courseData.code}
                  onChange={handleEditInput}
                  autoComplete="off"
                  error={Boolean(errors.code)}
                  helperText={errors.code}
                  onFocus={hanldeFocus}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Course Price</TableCell>
              <TableCell>
                <TextField
                  label="Certification Price"
                  type="text"
                  name="certification"
                  value={courseData.prices.certification}
                  onChange={(e) =>
                    setCourseData((prev) => ({
                      ...prev,
                      prices: { ...prev.prices, certification: e.target.value },
                    }))
                  }
                  placeholder="Enter certification price"
                  onWheel={(e) => e.target.blur()}
                  fullWidth
                  sx={{ mb: 1, mt: 2 }}
                  error={Boolean(errors.certification)}
                  helperText={errors.certification}
                  onFocus={hanldeFocus}
                />
                <TextField
                  label="Diploma Price"
                  type="text"
                  name="diploma"
                  value={courseData.prices.diploma}
                  onChange={(e) =>
                    setCourseData((prev) => ({
                      ...prev,
                      prices: { ...prev.prices, diploma: e.target.value },
                    }))
                  }
                  placeholder="Enter diploma price"
                  onWheel={(e) => e.target.blur()}
                  fullWidth
                  sx={{ mb: 1, mt: 1 }}
                  error={Boolean(errors.diploma)}
                  helperText={errors.diploma}
                  onFocus={hanldeFocus}
                />
                <TextField
                  label="Master Diploma Price"
                  type="text"
                  name="masterDiploma"
                  value={courseData.prices.masterDiploma}
                  onChange={(e) =>
                    setCourseData((prev) => ({
                      ...prev,
                      prices: { ...prev.prices, masterDiploma: e.target.value },
                    }))
                  }
                  placeholder="Enter master diploma price"
                  onWheel={(e) => e.target.blur()}
                  fullWidth
                  sx={{ mb: 1, mt: 1 }}
                  error={Boolean(errors.masterDiploma)}
                  helperText={errors.masterDiploma}
                  onFocus={hanldeFocus}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Course Status</TableCell>
              <TableCell>
                <Select
                  name="status"
                  value={courseData.status}
                  onChange={handleEditInput}
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
                    Select Status
                  </MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="deactive">Deactive</MenuItem>
                </Select>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Course Details</TableCell>
              <TableCell>
                <TextField
                  label="Course Details"
                  name="details"
                  placeholder="Enter Course Details"
                  value={courseData.details}
                  onChange={handleEditInput}
                  inputProps={{ maxLength: 300 }}
                  helperText={`${300 - (courseData.details?.length || 0)} characters left`}
                  fullWidth
                  multiline
                  sx={{ mb: 1, mt: 1 }}
                  rows={3}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Topics</TableCell>
              <TableCell>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {(courseData.topics || []).map((topic, idx) => (
                    <Grid item key={idx}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          minWidth: 220,
                          maxWidth: 240,
                        }}
                      >
                        <TextField
                          label={`Topic ${idx + 1}`}
                          value={topic}
                          onChange={(e) => {
                            const newTopics = [...courseData.topics];
                            newTopics[idx] = e.target.value;
                            setCourseData((prev) => ({
                              ...prev,
                              topics: newTopics,
                            }));
                          }}
                          autoComplete="off"
                          fullWidth
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  color="error"
                                  aria-label="Remove topic"
                                  onClick={() => {
                                    const newTopics = courseData.topics.filter(
                                      (_, i) => i !== idx
                                    );
                                    setCourseData((prev) => ({
                                      ...prev,
                                      topics: newTopics,
                                    }));
                                  }}
                                  size="small"
                                  edge="end"
                                  sx={{
                                    padding: "2px",
                                    "&:hover": { background: "transparent" },
                                  }}
                                >
                                  <CloseCircle size={14} color="orange" />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Tooltip
                          title="Add a topic"
                          arrow
                          PopperProps={{
                            sx: { zIndex: 2200 },
                          }}
                        >
                          <IconButton
                            color="primary"
                            aria-label="Add topic"
                            sx={{ ml: 1 }}
                            onClick={() => {
                              const newTopics = [...courseData.topics];
                              newTopics.splice(idx + 1, 0, "");
                              setCourseData((prev) => ({
                                ...prev,
                                topics: newTopics,
                              }));
                            }}
                            size="small"
                          >
                            <Add size={20} color="green" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                  <Tooltip
                    title="Add a topic"
                    arrow
                    PopperProps={{
                      sx: { zIndex: 2200 },
                    }}
                  >
                    <IconButton
                      color="primary"
                      aria-label="Add topic"
                      sx={{ mt: 1 }}
                      onClick={() => {
                        setCourseData((prev) => ({
                          ...prev,
                          topics: [...(prev.topics || []), ""],
                        }));
                      }}
                      size="medium"
                    >
                      <Add size={22} color="green" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">Course Image</TableCell>
              <TableCell>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="course-image"></InputLabel>
                  <input
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    id="course-image"
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="course-image">
                    <Button
                      variant="contained"
                      color="primary"
                      component="span"
                      sx={{ mb: 1 }}
                    >
                      Upload Image
                    </Button>
                    {image && (
                      <span style={{ marginLeft: 12, verticalAlign: "middle" }}>
                        {image.name}
                      </span>
                    )}
                  </label>

                  {imagePreview && (
                    <Box
                      sx={{
                        position: "relative",
                        display: "inline-block",
                        mt: 1,
                      }}
                    >
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: 200,
                          borderRadius: 8,
                          objectFit: "cover",
                          border: "1px solid #ddd",
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={handleRemoveImage}
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
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Modal>

      <Modal
        title={
          <span style={{ color: textColor }}>
            Are you sure want to delete{" "}
            {courses && courses.find((e) => e._id == toDelete)?.name} ?
          </span>
        }
        closable={{ "aria-label": "Custom Close Button" }}
        open={deleteModal}
        onCancel={() => setDeleteModal(false)}
        styles={modalStyles}
        zIndex={2000}
        footer={[
          <Button
            key="close"
            type="primary"
            endIcon={<TickCircle size={18} />}
            onClick={() => {
              confirmDelete();
            }}
          >
            Confirm
          </Button>,
          <Button
            key="update"
            endIcon={<CloseCircle size={18} />}
            onClick={() => setDeleteModal(false)}
          >
            Cancel
          </Button>,
        ]}
      ></Modal>
    </>
  );
}
