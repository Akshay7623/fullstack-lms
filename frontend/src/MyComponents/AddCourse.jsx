import { useState } from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Breadcrumbs from "components/@extended/Breadcrumbs";
import MainCard from "components/MainCard";
import { useNavigate } from "react-router";
import { CloseCircle } from "iconsax-react";
import IconButton from "@mui/material/IconButton";
import config from "../config";

import { Box, InputAdornment } from "@mui/material";

export default function CoursesAddPage() {
  const [form, setForm] = useState({
    name: "",
    code: "",
    duration: "",
    status: "active",
    details: "",
    prices: {
      certification: "",
      diploma: "",
      masterDiploma: "",
    },
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [topics, setTopics] = useState([]);
  const [topicRows, setTopicRows] = useState(0);
  const [topicInput, setTopicInput] = useState("");

  const navigate = useNavigate();

  const handleForm = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

  const handleFocus = (e) => {
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const formValidation = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Course name is required";
    if (!form.code.trim()) newErrors.code = "Course code is required";
    if (!form.duration.trim())
      newErrors.duration = "Course duration is required";

    if (!form.status) newErrors.status = "Course status is required";
    if (!form.details.trim()) newErrors.details = "Course details are required";

    if (Number(form.prices.certification) < 0) {
      newErrors.certification = "Certification price must be zero or positive";
    }

    if (Number(form.prices.diploma) < 0) {
      newErrors.diploma = "Diploma price must be zero or positive";
    }

    if (Number(form.prices.masterDiploma) < 0) {
      newErrors.masterDiploma = "Master Diploma price must be zero or positive";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function trimTrailingEmptyTopics(topics) {
    let trimmed = [...topics];
    while (trimmed.length > 0 && trimmed[trimmed.length - 1].trim() === "") {
      trimmed.pop();
    }
    return trimmed;
  }

  const submitAddCourse = async (e) => {
    e.preventDefault();

    if (!formValidation()) {
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("duration", form.duration);
    formData.append("status", form.status);
    formData.append("details", form.details);
    formData.append("code", form.code);
    formData.append(
      "prices",
      JSON.stringify({
        certification: Number(form.prices.certification),
        diploma: Number(form.prices.diploma),
        masterDiploma: Number(form.prices.masterDiploma),
      })
    );

    trimTrailingEmptyTopics(topics).forEach((t) => { formData.append("topics", t) });

    formData.append("img", image);

    try {
      const submit = await fetch(`${config.hostUrl}/api/course/add`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await submit.json();
      if (submit.status == 200) {
        setToast({
          open: true,
          message: "Course added successfully",
          severity: "success",
        });
        navigate("/courses");
      } else {
        setToast({
          open: true,
          message: "Failed to add course.",
          severity: "error",
        });
      }
    } catch (Err) {
      setToast({
        open: true,
        message: "Failed to add course.",
        severity: "error",
      });
    }
  };

  let breadcrumbLinks = [
    { title: "courses", to: "/courses" },
    { title: "add" },
  ];

  return (
    <>
      <Breadcrumbs custom heading="add-course" links={breadcrumbLinks} />
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
      <MainCard title="Add Course" contentSX={{ p: 2.5 }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="course-name">Name</InputLabel>
              <TextField
                fullWidth
                id="course-name"
                placeholder="Enter course name"
                autoFocus
                value={form.name}
                onChange={handleForm}
                name="name"
                error={Boolean(errors.name)}
                helperText={errors.name}
                onFocus={handleFocus}
                autoComplete="off"
              />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="course-code">Code</InputLabel>
              <TextField
                fullWidth
                id="course-code"
                placeholder="Enter course code"
                value={form.code}
                onChange={handleForm}
                name="code"
                error={Boolean(errors.code)}
                helperText={errors.code}
                onFocus={handleFocus}
                autoComplete="off"
              />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="course-duration">Duration</InputLabel>
              <TextField
                fullWidth
                id="course-duration"
                placeholder="Enter course duration"
                value={form.duration}
                onChange={handleForm}
                name="duration"
                error={Boolean(errors.duration)}
                helperText={errors.duration}
                onFocus={handleFocus}
                autoComplete="off"
              />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={form.status}
                onChange={handleForm}
                onFocus={handleFocus}
              >
                <MenuItem value="deactive">Deactive</MenuItem>
                <MenuItem value="active">Active</MenuItem>
              </Select>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Prices</InputLabel>
              <TextField
                label="Certification Price"
                type="number"
                name="certification"
                value={form.prices.certification}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    prices: { ...prev.prices, certification: e.target.value },
                  }))
                }
                sx={{ mb: 1 }}
                placeholder="Enter certification price"
                fullWidth
                onWheel={(e) => e.target.blur()}
                autoComplete="off"
                error={Boolean(errors.certification)}
                helperText={errors.certification}
                onFocus={handleFocus}
              />
              <TextField
                label="Diploma Price"
                type="number"
                name="diploma"
                value={form.prices.diploma}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    prices: { ...prev.prices, diploma: e.target.value },
                  }))
                }
                placeholder="Enter diploma price"
                fullWidth
                onWheel={(e) => e.target.blur()}
                sx={{ mb: 1 }}
                autoComplete="off"
                error={Boolean(errors.diploma)}
                helperText={errors.diploma}
                onFocus={handleFocus}
              />
              <TextField
                label="Master Diploma Price"
                type="number"
                name="masterDiploma"
                value={form.prices.masterDiploma}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    prices: { ...prev.prices, masterDiploma: e.target.value },
                  }))
                }
                placeholder="Enter master diploma price"
                fullWidth
                onWheel={(e) => e.target.blur()}
                autoComplete="off"
                error={Boolean(errors.masterDiploma)}
                helperText={errors.masterDiploma}
                onFocus={handleFocus}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="course-details">Details</InputLabel>
              <TextField
                fullWidth
                id="course-details"
                placeholder="Enter course details"
                multiline
                rows={3}
                value={form.details}
                onChange={handleForm}
                autoComplete="off"
                name="details"
                inputProps={{ maxLength: 300 }}
                helperText={`${300 - (form.details?.length || 0)} characters left`}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 12 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <TextField
                label="Number of Topics"
                type="number"
                size="medium"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                inputProps={{ min: 1 }}
                sx={{ width: 120 }}
                autoComplete="off"
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const n = parseInt(topicInput, 10);

                  if (n > 0) {
                    setTopicRows(n);
                    if (topics.length) {
                      setTopics((prev) => [...prev, ...Array(n).fill("")]);
                    } else {
                      setTopics(Array(n).fill(""));
                    }
                  }
                }}
              >
                Add Topics
              </Button>
            </Stack>

            <Stack
              direction="row"
              sx={{ mb: 2, flexWrap: "wrap", gap: "10px" }}
            >
              {Array.from({ length: topics.length }).map((_, idx) => (
                <Grid item key={idx}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TextField
                      label={`Topic ${idx + 1}`}
                      value={topics[idx] || ""}
                      onChange={(e) => {
                        const newTopics = [...topics];
                        newTopics[idx] = e.target.value;
                        setTopics(newTopics);
                      }}
                      sx={{ minWidth: 180, maxWidth: 220 }}
                      autoComplete="off"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              color="error"
                              aria-label="Remove topic"
                              onClick={() => {
                                const newTopics = topics.filter(
                                  (_, i) => i !== idx
                                );
                                setTopics(newTopics);
                              }}
                              edge="end"
                              size="small"
                            >
                              <CloseCircle size={18} color="orange" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="course-image">Course Image</InputLabel>
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
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    marginTop: 10,
                    maxWidth: "100%",
                    maxHeight: 200,
                    borderRadius: 8,
                    objectFit: "cover",
                    border: "1px solid #ddd",
                  }}
                />
              )}
            </Stack>
          </Grid>

          <Grid size={12} sx={{ textAlign: "end" }}>
            <Button variant="contained" onClick={submitAddCourse}>
              Add Course
            </Button>
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
}
