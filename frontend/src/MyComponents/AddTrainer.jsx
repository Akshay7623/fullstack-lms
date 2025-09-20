import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Breadcrumbs from "components/@extended/Breadcrumbs";
import MainCard from "components/MainCard";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import {
  Chip,
  Autocomplete,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormHelperText,
  IconButton,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router";
import cities from "./utils/cities";
import states from "./utils/states";
import config from "../config";
import getModule from "./utils/api/getModule";
import { CloseCircle } from "iconsax-react";
import { Box } from "@mui/system";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const RequiredLabel = ({ children }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
    {children}
    <span style={{ color: "red", marginLeft: 2 }}>*</span>
  </span>
);

const AddTrainer = () => {
  const [course, setCourse] = useState([]);
  const [modules, setModules] = useState([]);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    city: "",
    state: "",
    registrationDate: null,
    course: "",
    gender: "",
    dateOfBirth: null,
    address: "",
    panCard: "",
    govtIdType: "",
    govtId: "",
    modules: [],
    professionalSummary: "",
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    bankName:"",
    rate: "",
    resume: null,
    id_document: null,
  });

  const goveIds = ["Aadhar Card", "PAN Card", "Voter Card", "Passport"];

  const handleFormInput = (e) => {
    let { name, value } = e.target;

    if (name === "ifscCode" || name === "panCard") {
      value = value.toUpperCase();
    }

    if (name === "address") {
      value = value.slice(0, 100);
    }

    if (name === "professionalSummary") {
      value = value.slice(0, 300);
    }

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.mobileNumber.match(/^\d{10}$/))
      newErrors.mobileNumber = "Enter a valid 10-digit mobile number";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Enter a valid email address";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.registrationDate)
      newErrors.registrationDate = "Registration Date is required";
    if (!form.gender.trim()) newErrors.gender = "Please select gender";
    if (!form.rate.trim()) newErrors.rate = "Rate is required";
    if (!form.course) newErrors.course = "Please select a course";
    if (!form.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";

    if (form.panCard.trim().length > 0 && form.panCard.trim().length < 10) {
      newErrors.panCard = "Please enter valid PAN number";
    }

    if (form.govtIdType && !form.govtId.trim()) {
      newErrors.govtId = "Please enter the selected ID number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!validateForm()) return;

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, value.join(","));
      } else if (key === "photo" && value && value.startsWith("data:image")) {
        const arr = value.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const file = new File([u8arr], "photo.png", { type: mime });

        formData.append("photo", file);
      } else if (key === "id_document") {
        if (typeof value === "object") {
          formData.append("id_document", value ?? "");
        } else {
          const arr = value.split(",");
          const mime = arr[0].match(/:(.*?);/)[1];
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const file = new File([u8arr], "photo.png", { type: mime });
          formData.append("id_document", file);
        }
      } else {
        formData.append(key, value ?? "");
      }
    });

    const resp = await fetch(`${config.hostUrl}/api/trainer/add`, {
      method: "post",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await resp.json();

    if (resp.status === 201) {
      navigate("/trainers/list");
    } else if (resp.status === 409) {
      setToast({
        open: true,
        message: "Email Aready exist",
        severity: "error",
      });
    } else if (resp.status === 400) {
      setToast({
        open: true,
        message: data.message,
        severity: "error",
      });
    } else {
      setToast({
        open: true,
        message: "Some server error",
        severity: "error",
      });
    }
  };

  const handleFocus = (e) => {
    const fieldName = e.target.name;
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleDateChange = (newValue, name) => {
    setForm((prevForm) => ({
      ...prevForm,
      [name]: newValue,
    }));
  };

  const handleModule = (e, val) => {
    setForm((prev) => ({ ...prev, modules: val }));
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const resp = await fetch(`${config.hostUrl}/api/course/get`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await resp.json();
        if (resp.status === 200 && Array.isArray(data.data)) {
          setCourse(data.data);
        } else {
          setCourse([]);
        }
      } catch {
        setCourse([]);
      }
    };

    async function fetchModules() {
      const modules = await getModule();
      setModules(modules.map((mod) => mod.name));
    }
    fetchCourses();
    fetchModules();
  }, []);

  return (
    <MainCard title="Basic Information" contentSX={{ p: 2.5 }}>
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
      <Grid container spacing={2.5}>
        <Grid item size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <RequiredLabel>
              <InputLabel htmlFor="first-name">First Name</InputLabel>
            </RequiredLabel>
            <TextField
              fullWidth
              id="first-name"
              placeholder="Enter first name"
              autoFocus
              onChange={handleFormInput}
              value={form.firstName}
              name="firstName"
              autoComplete="new"
              onFocus={handleFocus}
              error={Boolean(errors.firstName)}
              helperText={errors.firstName}
            />
          </Stack>
        </Grid>

        <Grid item size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <RequiredLabel>
              <InputLabel htmlFor="last-name">Last Name</InputLabel>
            </RequiredLabel>
            <TextField
              fullWidth
              id="last-name"
              placeholder="Enter last name"
              onChange={handleFormInput}
              value={form.lastName}
              name="lastName"
              autoComplete="new"
              onFocus={handleFocus}
              error={Boolean(errors.lastName)}
              helperText={errors.lastName}
            />
          </Stack>
        </Grid>

        <Grid item size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <RequiredLabel>
              <InputLabel htmlFor="mobile-number">Mobile Number</InputLabel>
            </RequiredLabel>
            <TextField
              fullWidth
              id="mobile-number"
              placeholder="Enter mobile number"
              type="tel"
              onChange={handleFormInput}
              value={form.mobileNumber}
              name="mobileNumber"
              autoComplete="new"
              onFocus={handleFocus}
              error={Boolean(errors.mobileNumber)}
              helperText={errors.mobileNumber}
            />
          </Stack>
        </Grid>

        <Grid item size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <RequiredLabel>
              <InputLabel htmlFor="email">Email</InputLabel>
            </RequiredLabel>
            <TextField
              fullWidth
              id="email"
              placeholder="Enter email"
              type="email"
              onChange={handleFormInput}
              onFocus={handleFocus}
              value={form.email}
              name="email"
              autoComplete="new"
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
          </Stack>
        </Grid>

        <Grid item size={{ xs: 12, sm: 6 }}>
          <RequiredLabel>
            <Autocomplete
              options={cities}
              value={form.city}
              onChange={(e, newValue) =>
                setForm({ ...form, city: newValue || "" })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="City"
                  autoComplete="off"
                  name="city"
                  error={Boolean(errors.city)}
                  helperText={errors.city}
                  onFocus={handleFocus}
                />
              )}
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "zIndex",
                      enabled: true,
                      phase: "write",
                      fn({ state }) {
                        state.elements.popper.style.zIndex = "2100";
                      },
                    },
                  ],
                },
              }}
              fullWidth
            />
          </RequiredLabel>
        </Grid>

        <Grid item size={{ xs: 12, sm: 6 }}>
          <RequiredLabel>
            <Autocomplete
              options={states}
              value={form.state}
              onChange={(e, newValue) =>
                setForm({ ...form, state: newValue || "" })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="State"
                  autoComplete="new-state"
                  name="state"
                  error={Boolean(errors.state)}
                  helperText={errors.state}
                  onFocus={handleFocus}
                />
              )}
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "zIndex",
                      enabled: true,
                      phase: "write",
                      fn({ state }) {
                        state.elements.popper.style.zIndex = "2100";
                      },
                    },
                  ],
                },
              }}
              fullWidth
            />
          </RequiredLabel>
        </Grid>

        <Grid item size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <RequiredLabel>
              <InputLabel>Registration Date</InputLabel>
            </RequiredLabel>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={form.registrationDate}
                name="registrationDate"
                onChange={(newValue) =>
                  handleDateChange(newValue, "registrationDate")
                }
                format="dd-MM-yyyy"
                slotProps={{
                  textField: {
                    error: Boolean(errors.registrationDate),
                    helperText: errors.registrationDate,
                    onFocus: handleFocus,
                  },
                }}
                onOpen={() =>
                  handleFocus({ target: { name: "registrationDate" } })
                }
              />
            </LocalizationProvider>
          </Stack>
        </Grid>

        <Grid item size={{ xs: 12, sm: 6 }}>
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
              onFocus={() => handleFocus({ target: { name: "course" } })}
            >
              {course.map((courseItem, idx) => (
                <MenuItem key={courseItem._id} value={courseItem.name}>
                  {courseItem.name}
                </MenuItem>
              ))}
            </Select>

            {errors.course && (
              <FormHelperText sx={{ color: "error.main" }}>
                {errors.course}
              </FormHelperText>
            )}
          </Stack>
        </Grid>

        <Grid item size={{ xs: 12, sm: 6 }}>
          <Autocomplete
            multiple
            options={modules}
            value={form.modules}
            onChange={(e, newVal) => handleModule(e, newVal)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={index}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Modules"
                placeholder="Select modules"
              />
            )}
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: "zIndex",
                    enabled: true,
                    phase: "write",
                    fn({ state }) {
                      state.elements.popper.style.zIndex = "2100";
                    },
                  },
                ],
              },
            }}
            sx={{ width: "100%" }}
          />
        </Grid>

        <Grid item size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="pan-card">Pan Card</InputLabel>
            <TextField
              fullWidth
              id="pan-card"
              placeholder="Enter PAN Card"
              type="text"
              onChange={handleFormInput}
              value={form.panCard?.toUpperCase()}
              name="panCard"
              autoComplete="new"
              error={Boolean(errors.panCard)}
              helperText={errors.panCard}
              onFocus={handleFocus}
            />
          </Stack>
        </Grid>

        <Grid container item spacing={2.5} xs={12}>
          <Grid item xs={12} sm={4}>
            <Stack sx={{ gap: 1 }}>
              <RequiredLabel>
                <InputLabel id="gender-label">Gender</InputLabel>
              </RequiredLabel>
              <Select
                value={form.gender}
                onChange={(e) => {
                  handleFormInput(e);
                }}
                id="gender"
                labelId="gender-label"
                name="gender"
                autoComplete="new"
                onFocus={() => handleFocus({ target: { name: "gender" } })}
                sx={{
                  width: "120px",
                }}
              >
                <MenuItem value="" disabled>
                  Select Gender
                </MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </Select>
              {errors.gender && (
                <FormHelperText sx={{ color: "error.main" }}>
                  {errors.gender}
                </FormHelperText>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack sx={{ gap: 1 }}>
              <RequiredLabel>
                <InputLabel>Date of Birth</InputLabel>
              </RequiredLabel>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  onChange={(newValue) =>
                    handleDateChange(newValue, "dateOfBirth")
                  }
                  value={form.dateOfBirth}
                  name="dateOfBirth"
                  format="dd-MM-yyyy"
                  slotProps={{
                    textField: {
                      error: Boolean(errors.dateOfBirth),
                      helperText: errors.dateOfBirth,
                      onFocus: handleFocus,
                    },
                  }}
                  onOpen={() =>
                    handleFocus({ target: { name: "dateOfBirth" } })
                  }
                />
              </LocalizationProvider>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack sx={{ gap: 1 }}>
              <RequiredLabel>
                <InputLabel htmlFor="rate">Rate (per hour)</InputLabel>
              </RequiredLabel>
              <TextField
                fullWidth
                id="rate"
                placeholder="Enter rate"
                type="number"
                onChange={handleFormInput}
                value={form.rate}
                name="rate"
                autoComplete="off"
                inputProps={{
                  onWheel: (e) => e.target.blur(),
                  min: 0,
                }}
                onFocus={handleFocus}
                error={Boolean(errors.rate)}
                helperText={errors.rate}
              />
            </Stack>
          </Grid>
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
              value={form.address}
              name="address"
              autoComplete="new"
              inputProps={{ maxLength: 100 }}
              helperText={`${100 - (form.address?.length || 0)} characters left`}
            />
          </Stack>
        </Grid>

        <Grid size={12}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="professional-summary">
              Professional Summary
            </InputLabel>
            <TextField
              id="professional-summary"
              name="professionalSummary"
              placeholder="Professional Summary"
              value={form.professionalSummary}
              onChange={handleFormInput}
              inputProps={{ maxLength: 300 }}
              helperText={`${300 - (form.professionalSummary?.length || 0)} characters left`}
              fullWidth
              multiline
              rows={3}
            />
          </Stack>
        </Grid>

        <Grid item size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="account-name">Account Holder Name</InputLabel>
            <TextField
              fullWidth
              id="account-name"
              placeholder="Enter account holder name"
              onChange={handleFormInput}
              value={form.accountName || ""}
              name="accountName"
              autoComplete="new"
              type="text"
            />
          </Stack>
        </Grid>

        <Grid item size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="account-number">Account Number</InputLabel>
            <TextField
              fullWidth
              id="account-number"
              placeholder="Enter account number"
              onChange={handleFormInput}
              value={form.accountNumber || ""}
              type="text"
              name="accountNumber"
              autoComplete="new"
            />
          </Stack>
        </Grid>

        <Grid item size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="ifsc-code">IFSC Code</InputLabel>
            <TextField
              fullWidth
              id="ifsc-code"
              placeholder="Enter IFSC code"
              onChange={handleFormInput}
              value={form.ifscCode?.toUpperCase() || ""}
              name="ifscCode"
              autoComplete="new"
              type="text"
            />
          </Stack>
        </Grid>

        <Grid item size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="bank-name">Bank Name</InputLabel>
            <TextField
              fullWidth
              id="bank-name"
              placeholder="Enter Bank Name"
              onChange={handleFormInput}
              value={form?.bankName}
              name="bankName"
              autoComplete="off"
              type="text"
            />
          </Stack>
        </Grid>

        <Grid item size={{ xs: 12, sm: 6 }}>
          <Select
            name="govtIdType"
            value={form.govtIdType}
            onChange={handleFormInput}
            fullWidth
            displayEmpty
            MenuProps={{
              disablePortal: true,
              PaperProps: {
                sx: {
                  zIndex: 2100,
                },
              },
            }}
          >
            <MenuItem value="" disabled>
              Select ID Type
            </MenuItem>
            {goveIds.map((id, index) => (
              <MenuItem key={index} value={id}>
                {id}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        <Grid item size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Govt ID Number"
            name="govtId"
            value={form.govtId}
            onChange={handleFormInput}
            autoComplete="off"
            fullWidth
            onFocus={handleFocus}
            error={Boolean(errors.govtId)}
            helperText={errors.govtId}
          />
        </Grid>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={3}
          alignItems="flex-start"
        >
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="photo">Photo</InputLabel>
            {!form.photo ? (
              <Button variant="outlined" component="label">
                Upload Photo
                <input
                  type="file"
                  accept="jpg,.jpeg,.png,image/jpeg,image/jpg,image/png"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        handleFormInput({
                          target: {
                            name: "photo",
                            value: ev.target.result,
                          },
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </Button>
            ) : (
              <Box
                sx={{ position: "relative", display: "inline-block", mt: 1 }}
              >
                <img
                  src={form.photo}
                  alt="Trainer"
                  style={{
                    maxWidth: 120,
                    maxHeight: 120,
                    borderRadius: 8,
                    border: "1px solid #eee",
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => setForm((prev) => ({ ...prev, photo: "" }))}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    bgcolor: "rgba(255,255,255,0.8)",
                    color: "red",
                    zIndex: 2,
                    "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                  }}
                >
                  <CloseCircle size={20} color="red" />
                </IconButton>
              </Box>
            )}
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="resume">Resume</InputLabel>

            {!form.resume ? (
              <Button variant="outlined" component="label">
                Upload Resume
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleFormInput({
                        target: { name: "resume", value: file },
                      });
                    }
                  }}
                />
              </Button>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  {form.resume.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setForm((prev) => ({ ...prev, resume: null }))}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.8)",
                    color: "red",
                    "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                  }}
                >
                  <CloseCircle size={20} color="red" />
                </IconButton>
              </Box>
            )}
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="resume">ID</InputLabel>

            {!form.id_document ? (
              <Button variant="outlined" component="label">
                Upload ID
                <input
                  type="file"
                  accept=".pdf,jpg,.jpeg,.png,image/jpeg,image/jpg,image/png"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file.type.startsWith("image/")) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        handleFormInput({
                          target: {
                            name: "id_document",
                            value: ev.target.result,
                          },
                        });
                      };
                      reader.readAsDataURL(file);
                    } else {
                      handleFormInput({
                        target: { name: "id_document", value: file },
                      });
                    }
                  }}
                />
              </Button>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                {typeof form.id_document === "string" &&
                form.id_document?.startsWith("data:image/") ? (
                  <Box
                    sx={{
                      position: "relative",
                      display: "inline-block",
                      mt: 1,
                    }}
                  >
                    <img
                      src={form.id_document}
                      alt="Id document"
                      style={{
                        maxWidth: 120,
                        maxHeight: 120,
                        borderRadius: 8,
                        border: "1px solid #eee",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, id_document: "" }))
                      }
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(255,255,255,0.8)",
                        color: "red",
                        zIndex: 2,
                        "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                      }}
                    >
                      <CloseCircle size={20} color="red" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex" }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {form.id_document?.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, id_document: null }))
                      }
                      sx={{
                        bgcolor: "rgba(255,255,255,0.8)",
                        color: "red",
                        "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                      }}
                    >
                      <CloseCircle size={20} color="red" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            )}
          </Stack>
        </Stack>

        <Grid size={12} sx={{ textAlign: "end" }}>
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </Grid>
      </Grid>
    </MainCard>
  );
};

const breadcrumbLinks = [
  { title: "trainers", to: "/trainers/list" },
  { title: "add-trainer" },
];

export default function AddTrainerPage() {
  return (
    <>
      <Breadcrumbs custom heading="add-trainer" links={breadcrumbLinks} />
      <AddTrainer />
    </>
  );
}