import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import Breadcrumbs from "components/@extended/Breadcrumbs";
import MainCard from "components/MainCard";
import IconButton from "components/@extended/IconButton";
import { CloseCircle } from "iconsax-react";
import { Box } from "@mui/system";
import { useNavigate } from "react-router";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import config from "../config";

const breadcrumbLinks = [{ title: "student" }, { title: "add" }];

const isPanCard = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

const isAadhar = (aadhar) => {
  const aadharRegex = /^\d{12}$/;
  return aadharRegex.test(aadhar);
};

const RequiredLabel = ({ children }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
    {children}
    <span style={{ color: "red", marginLeft: 2 }}>*</span>
  </span>
);

function AddStudent() {
  const [courses, setCourses] = useState([]);
  const [errors, setErrors] = useState({});

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    registrationDate: null,
    course: "",
    program: "",
    mobileNumber: "",
    gender: "male",
    parentName: "",
    parentMobile: "",
    dateOfBirth: null,
    residenceAddress: "",
    panCard: "",
    aadharCard: "",
  });

  const navigate = useNavigate();

  function validateForm(form) {
    const errors = {};

    if (!form.firstName.trim()) errors.firstName = "First name is required";
    if (!form.lastName.trim()) errors.lastName = "Last name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    if (!form.registrationDate)
      errors.registrationDate = "Registration date is required";
    if (!form.course) errors.course = "Course is required";
    if (!form.program) errors.program = "Program is required";
    if (!form.mobileNumber.trim())
      errors.mobileNumber = "Mobile number is required";
    if (form.email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email))
      errors.email = "Invalid email format";

    if (form.mobileNumber && !/^\d{10}$/.test(form.mobileNumber))
      errors.mobileNumber = "Invalid mobile number";

    if (!form.dateOfBirth) errors.dateOfBirth = "Date of birth is required";

    if (form.panCard && form.panCard.trim() && !isPanCard(form.panCard.trim()))
      errors.panCard = "Invalid PAN card number";

    if (
      form.aadharCard &&
      form.aadharCard.trim() &&
      !isAadhar(form.aadharCard.trim())
    )
      errors.aadharCard = "Invalid Aadhar card number";

    setErrors(errors);
    return errors;
  }

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

  const handleFormInput = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: name === "panCard" ? value.toUpperCase() : value,
    }));
  };

  const handleImageChange = (e, key) => {
    const file = e.target.files[0];
    if (file && !["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      alert("Only JPG, JPEG, and PNG files are allowed.");
      return;
    }
    setStudentImages((prev) => ({ ...prev, [key]: file }));
    setImagePreviews((prev) => ({
      ...prev,
      [key]: file ? URL.createObjectURL(file) : "",
    }));
  };

  const handleRemoveImage = (key) => {
    setStudentImages((prev) => ({ ...prev, [key]: null }));
    setImagePreviews((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    [
      "studentPhoto",
      "aadharCardFront",
      "aadharCardBack",
      "panCardPhoto",
    ].forEach((key) => {
      if (studentImages[key]) {
        formData.append(key, studentImages[key]);
      }
    });

    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${config.hostUrl}/api/student/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (resp.status === 200) {
        navigate("/student/view");
      } else {
        setToast({
          open: false,
          message: "Failed to add student.",
          severity: "success",
        });
      }
    } catch (err) {
      setToast({
        open: false,
        message: "Failed to add student.",
        severity: "success",
      });
    }
  };

  const handleDateChange = (newValue, name) => {
    setForm((prevForm) => ({
      ...prevForm,
      [name]: newValue,
    }));
  };

  useEffect(() => {
    const getCourses = async () => {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${config.hostUrl}/api/course/get`, {
        method: "get",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (resp.ok) {
        const data = await resp.json();
        setCourses(data.data);
      }
    };

    getCourses();
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
      <MainCard title="Basic Information" contentSX={{ p: 2.5 }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <RequiredLabel>
                <InputLabel htmlFor="first-name">First Name</InputLabel>
              </RequiredLabel>

              <TextField
                fullWidth
                id="first-name"
                autoFocus
                autoComplete="new"
                placeholder="Enter first name"
                name="firstName"
                onChange={handleFormInput}
                value={form.firstName}
                error={Boolean(errors.firstName)}
                helperText={errors.firstName}
                onFocus={(e) =>
                  setErrors((prev) => ({ ...prev, [e.target.name]: null }))
                }
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <RequiredLabel>
                <InputLabel htmlFor="last-name">Last Name</InputLabel>
              </RequiredLabel>
              <TextField
                fullWidth
                id="last-name"
                autoComplete="new"
                name="lastName"
                placeholder="Enter last name"
                onChange={handleFormInput}
                value={form.lastName}
                error={Boolean(errors.lastName)}
                helperText={errors.lastName}
                onFocus={(e) =>
                  setErrors((prev) => ({ ...prev, [e.target.name]: null }))
                }
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <RequiredLabel>
                <InputLabel htmlFor="email">Email</InputLabel>
              </RequiredLabel>
              <TextField
                fullWidth
                id="email"
                autoComplete="new"
                placeholder="Enter email"
                type="email"
                onChange={handleFormInput}
                value={form.email}
                name="email"
                error={Boolean(errors.email)}
                helperText={errors.email}
                onFocus={(e) =>
                  setErrors((prev) => ({ ...prev, [e.target.name]: null }))
                }
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <RequiredLabel>
                <InputLabel>Registration Date</InputLabel>
              </RequiredLabel>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={form.registrationDate}
                  format="dd-MM-yyyy"
                  name="registrationDate"
                  onChange={(newValue) =>
                    handleDateChange(newValue, "registrationDate")
                  }
                  slotProps={{
                    textField: {
                      error: Boolean(errors.registrationDate),
                      helperText: errors.registrationDate,
                      onFocus: () =>
                        setErrors((prev) => ({
                          ...prev,
                          registrationDate: null,
                        })),
                    },
                  }}
                />
              </LocalizationProvider>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <RequiredLabel>
                <InputLabel id="course-select">Course</InputLabel>
              </RequiredLabel>
              <Select
                value={form.course}
                labelId="course-select"
                name="course"
                onChange={handleFormInput}
                autoComplete="new"
                error={Boolean(errors.course)}
                onOpen={(e) => setErrors((prev) => ({ ...prev, course: null }))}
              >
                {(courses || []).map((courseItem, _) => (
                  <MenuItem key={courseItem._id} value={courseItem._id}>
                    {courseItem.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.course && (
                <span style={{ color: "#d32f2f", fontSize: 12 }}>
                  {errors.course}
                </span>
              )}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <RequiredLabel>
                <InputLabel id="program-select">Program</InputLabel>
              </RequiredLabel>
              <Select
                value={form.program}
                labelId="program-select"
                name="program"
                onChange={handleFormInput}
                autoComplete="new"
                error={Boolean(errors.program)}
                onOpen={() => setErrors((prev) => ({ ...prev, program: null }))}
              >
                <MenuItem value="certification">Certification</MenuItem>
                <MenuItem value="diploma">Diploma</MenuItem>
                <MenuItem value="master diploma">Master Diploma</MenuItem>
              </Select>
              {errors.program && (
                <span style={{ color: "#d32f2f", fontSize: 12 }}>
                  {errors.program}
                </span>
              )}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <RequiredLabel>
                <InputLabel htmlFor="mobile-number">Mobile Number</InputLabel>
              </RequiredLabel>
              <TextField
                fullWidth
                id="mobile-number"
                autoComplete="new"
                placeholder="Enter mobile number"
                type="tel"
                onChange={handleFormInput}
                name="mobileNumber"
                value={form.mobileNumber}
                error={Boolean(errors.mobileNumber)}
                helperText={errors.mobileNumber}
                onFocus={(e) =>
                  setErrors((prev) => ({ ...prev, [e.target.name]: null }))
                }
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="pan-card">Pan Card</InputLabel>
              <TextField
                fullWidth
                id="pan-card"
                placeholder="Enter PAN Card"
                type="text"
                onChange={handleFormInput}
                value={form.panCard}
                name="panCard"
                autoComplete="new"
                error={Boolean(errors.panCard)}
                helperText={errors.panCard}
                onFocus={(e) =>
                  setErrors((prev) => ({ ...prev, [e.target.name]: null }))
                }
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="aadhar-card">Aadhar Card</InputLabel>
              <TextField
                fullWidth
                id="aadhar-card"
                placeholder="Enter Aadhar number"
                type="text"
                onChange={handleFormInput}
                value={form.aadharCard}
                name="aadharCard"
                autoComplete="new"
                error={Boolean(errors.aadharCard)}
                helperText={errors.aadharCard}
                onFocus={(e) =>
                  setErrors((prev) => ({ ...prev, [e.target.name]: null }))
                }
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                value={form.gender}
                onChange={handleFormInput}
                id="gender-label"
                labelId="gender-label"
                name="gender"
                autoComplete="new"
              >
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="male">Male</MenuItem>
              </Select>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <RequiredLabel>
                <InputLabel>Date of Birth</InputLabel>
              </RequiredLabel>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  onChange={(newValue) => {
                    handleDateChange(newValue, "dateOfBirth");
                    setErrors((prev) => ({ ...prev, dateOfBirth: null }));
                  }}
                  value={form.dateOfBirth}
                  format="dd-MM-yyyy"
                  name="dateOfBirth"
                  slotProps={{
                    textField: {
                      error: Boolean(errors.dateOfBirth),
                      helperText: errors.dateOfBirth,
                    },
                  }}
                />
              </LocalizationProvider>
              {errors.dateOfBirth && (
                <span style={{ color: "#d32f2f", fontSize: 12 }}>
                  {errors.dateOfBirth}
                </span>
              )}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="parent-name">Parents Name</InputLabel>
              <TextField
                fullWidth
                id="parent-name"
                placeholder="Enter parents name"
                onChange={handleFormInput}
                value={form.parentName}
                name="parentName"
                autoComplete="new"
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="parent-mobile">
                Parents Mobile Number
              </InputLabel>
              <TextField
                fullWidth
                id="parent-mobile"
                placeholder="Enter parents mobile number"
                type="text"
                onChange={handleFormInput}
                value={form.parentMobile}
                name="parentMobile"
                autoComplete="new"
              />
            </Stack>
          </Grid>

          <Grid size={12}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="residence-add">Residence Address</InputLabel>
              <TextField
                fullWidth
                id="residence-add"
                placeholder="Enter address"
                multiline
                rows={2}
                onChange={handleFormInput}
                value={form.residenceAddress}
                name="residenceAddress"
                autoComplete="new"
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Student Photo</InputLabel>
              {imagePreviews.studentPhoto ? (
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={imagePreviews.studentPhoto}
                    alt="Student"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 4,
                      objectFit: "cover",
                      border: "1px solid #eee",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveImage("studentPhoto")}
                    sx={{
                      top: 2,
                      right: 2,
                      bgcolor: "rgba(255,255,255,0.8)",
                      color: "red",
                      zIndex: 2,
                      p: "2px",
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
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Aadhar Card Front</InputLabel>
              {imagePreviews.aadharCardFront ? (
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={imagePreviews.aadharCardFront}
                    alt="Aadhar Front"
                    style={{
                      width: 100,
                      height: 60,
                      borderRadius: 4,
                      objectFit: "cover",
                      border: "1px solid #eee",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveImage("aadharCardFront")}
                    sx={{
                      top: 2,
                      right: 2,
                      bgcolor: "rgba(255,255,255,0.8)",
                      color: "red",
                      zIndex: 2,
                      p: "2px",
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
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Aadhar Card Back</InputLabel>
              {imagePreviews.aadharCardBack ? (
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={imagePreviews.aadharCardBack}
                    alt="Aadhar Back"
                    style={{
                      width: 100,
                      height: 60,
                      borderRadius: 4,
                      objectFit: "cover",
                      border: "1px solid #eee",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveImage("aadharCardBack")}
                    sx={{
                      top: 2,
                      right: 2,
                      bgcolor: "rgba(255,255,255,0.8)",
                      color: "red",
                      zIndex: 2,
                      p: "2px",
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
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>PAN Card</InputLabel>

              {imagePreviews.panCardPhoto ? (
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={imagePreviews.panCardPhoto}
                    alt="Pan Card"
                    style={{
                      width: 100,
                      height: 60,
                      borderRadius: 4,
                      objectFit: "cover",
                      border: "1px solid #eee",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveImage("panCardPhoto")}
                    sx={{
                      top: 2,
                      right: 2,
                      bgcolor: "rgba(255,255,255,0.8)",
                      color: "red",
                      zIndex: 2,
                      p: "2px",
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
            </Stack>
          </Grid>

          <Grid size={12} sx={{ textAlign: "end" }}>
            <Button variant="contained" onClick={handleSubmit}>
              Submit
            </Button>
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
}

export default function AddStudentPage() {
  return (
    <>
      <Breadcrumbs custom heading="add-student" links={breadcrumbLinks} />
      <AddStudent />
    </>
  );
}
