import { Card, Avatar, Typography, Box, Stack, Chip, OutlinedInput, CircularProgress, TextField, Autocomplete, Snackbar, Alert } from "@mui/material";
import {
  Add,
  Call,
  Sms,
  Edit,
  SearchNormal1,
  SearchNormal,
  CloseCircle,
  Eye,
  Box1,
  TagCross,
} from "iconsax-react";
import { Link } from "react-router-dom";
import InputLabel from "@mui/material/InputLabel";
import Breadcrumbs from "components/@extended/Breadcrumbs";
import { IconButton } from "@mui/material";
import Grid from "@mui/material/Grid2";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { DebouncedInput } from "components/third-party/react-table";
import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { Modal } from "antd";
import cities from "./utils/cities";
import states from "./utils/states";
import getCourses from "./utils/api/getCourses";
import getModule from "./utils/api/getModule";
import getBatches from './utils/api/getBatches';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import config, { modalStyles, textColor, bgColor } from "../config";

const breadcrumbLinks = [
  { title: "trainers", to: "/trainers/list" },
  { title: "trainer-details" },
];

const Trainers = () => {
  const [name, setName] = useState("");
  const [module, setModule] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [allTrainers, setAllTrainers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [batches, setBatches] = useState({});
  const [documetId, setDocumentId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [errors, setErrors] = useState({});

  const [trainerData, setTrainerData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    gender: "",
    rate: "",
    city: "",
    state: "",
    course: "",
    modules: [],
    professionalSummary: "",
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    panCard: "",
    govtId: "",
    batches: [],
    dateOfBirth: null,
    photo: "",
    address: "",
    bankName: "",
    resume: null,
    id_document: null,
  });

  const validateEditForm = (data) => {
    const newErrors = {};

    if (!data.firstName.trim()) newErrors.firstName = "First name is required";
    if (!data.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!String(data.mobileNumber).match(/^\d{10}$/))
      newErrors.mobileNumber = "Enter a valid 10-digit mobile number";
    if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Enter a valid email address";
    if (!data.city?.trim()) newErrors.city = "City is required";
    if (!data.state?.trim()) newErrors.state = "State is required";
    if (!data.gender.trim()) newErrors.gender = "Please select gender";
    if (!data.rate && data.rate !== 0) newErrors.rate = "Rate is required";
    if (!data.course) newErrors.course = "Please select a course";
    if (!data.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";

    if (data.panCard.trim() && data.panCard.trim().length !== 10)
      newErrors.panCard = "Please enter valid PAN number";

    if (data.govtIdType && !data.govtId.trim())
      newErrors.govtId = "Please enter the selected ID number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [oldPhoto, setOldPhoto] = useState("");
  const [isNewResumeUploaded, setIsNewResumeUploaded] = useState(false);

  const handleSearch = () => {
    let filtered = allTrainers;

    if (name.trim()) {
      const search = name.trim().toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.firstName?.toLowerCase().includes(search) ||
          t.lastName?.toLowerCase().includes(search)
      );
    }

    if (selectedCourse) {
      filtered = filtered.filter((t) => t.course === selectedCourse);
    }

    if (module.trim()) {
      const searchModule = module.trim().toLowerCase();
      filtered = filtered.filter(
        (t) =>
          Array.isArray(t.modules) &&
          t.modules.some((mod) => mod.toLowerCase().includes(searchModule))
      );
    }

    setTrainers(filtered);
  };

  const handleClear = () => {
    setModule("");
    setSelectedCourse("");
    setName("");
    setTrainers(allTrainers);
  };

  const handleEdit = (_id) => {
    const data = trainers.find((trainer) => trainer._id === _id);
    setTrainerData(data);
    setEditModal(true);
    setOldPhoto(data.photo);
  };

  const openResume = (link) => {
    window.open(link);
  };


  const handleEditInput = (e) => {
    if (e.target.name === "ifscCode" || e.target.name === "panCard") {
      e.target.value = e.target.value.toUpperCase();
    }

    setTrainerData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleModule = (val) => {
    setTrainerData((prev) => ({ ...prev, modules: val }));
  };

  const handleBatch = (_, val) => {
    setTrainerData((prev) => ({ ...prev, batches: val }));
  };

  const updateDetails = async () => {
    if (!validateEditForm(trainerData)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      Object.entries(trainerData).forEach(([key, value]) => {
        if (value === null || value === undefined) return;

        if (Array.isArray(value)) {
          formData.append(key, value);
          return;
        }

        if (value instanceof File) {
          formData.append(key, value);
          return;
        }

        formData.append(key, value);
      });

      if (trainerData.photo === null) formData.append("removePhoto", "true");

      if (documetId) {
        formData.append("id_document", documetId);
      }

      const resp = await fetch(`${config.hostUrl}/api/trainer/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await resp.json();

      if (resp.ok) {
        setToast({
          open: true,
          severity: "success",
          message: "Trainer details updated successfully",
        });

        setEditModal(false);
        setDocumentId(null);
        setTrainers((prev) =>
          prev.map((t) =>
            String(t._id) === String(data.data._id) ? data.data : t
          )
        );
        setAllTrainers((prev) =>
          prev.map((t) =>
            String(t._id) === String(data.data._id) ? data.data : t
          )
        );
      } else {
        setToast({
          open: true,
          severity: "error",
          message: "Failed to update trainer",
        });
      }
      setIsNewResumeUploaded(false);
    } catch (err) {
      console.error(err);
      setIsNewResumeUploaded(false);
      setToast({
        open: true,
        severity: "error",
        message: "Network error — please try again",
      });
    }
  };

  const handleDateChange = (newValue, name) => {
    setTrainerData((prevForm) => ({
      ...prevForm,
      [name]: newValue,
    }));
  };

  const goveIds = ["Aadhar Card", "PAN Card", "Voter Card", "Passport"];

  const getPhotoSrc = (photo) =>
    !photo
      ? ""
      : typeof photo === "string"
        ? `${config.hostUrl}/uploads/trainer/${photo}`
        : URL.createObjectURL(photo);

  useEffect(() => {
    async function fetchCourses() {
      const courses = await getCourses();
      setCourses(courses);
    }

    async function fetchModules() {
      const modules = await getModule();
      setModules(modules.map((mod) => mod.name));
    }

    async function fetchTrainers() {
      const token = localStorage.getItem("token");

      const resp = await fetch(`${config.hostUrl}/api/trainer/get`, {
        method: "get",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();

      if (resp.status === 200) {
        setAllTrainers(data.data);
        setTrainers(data.data);
      }
    }

    async function fetchBatches() {
      const data = await getBatches();
      const courseWiseBatch = {}
      data.forEach((b) => {
        if (courseWiseBatch[b.courseName]) {
          const code = `${b.month.slice(0, 3).toUpperCase()}${b.year}-${b.courseCode}-${b.batchNo}`;
          courseWiseBatch[b.courseName].push(code);
        } else {
          const code = `${b.month.slice(0, 3).toUpperCase()}${b.year}-${b.courseCode}-${b.batchNo}`;
          courseWiseBatch[b.courseName] = [code];
        }
      });

      setBatches(courseWiseBatch);
    };

    fetchCourses();
    fetchModules();
    fetchTrainers();
    fetchBatches();
  }, []);

  return (
    <>
      <Breadcrumbs custom={true} heading="trainers" links={breadcrumbLinks} />
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
      <Box>
        <Grid container spacing={0}>
          <Grid size={{ xs: 4, sm: 4 }}>
            <Stack sx={{ m: 2, gap: 1 }}>
              <InputLabel id="search">Search</InputLabel>
              <DebouncedInput
                name="search"
                value={name ?? ""}
                onFilterChange={(value) => setName(String(value))}
                placeholder={`Search by name`}
                autoComplete="off"
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 4, sm: 4 }}>
            <Stack sx={{ m: 2, gap: 1 }}>
              <InputLabel id="course-select">Course</InputLabel>
              <Select
                labelId="course-select"
                value={selectedCourse}
                name="course"
                autoComplete="new"
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                {(courses || []).map((e, index) => (
                  <MenuItem key={index} value={e.name}>
                    {e.name}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          </Grid>

          <Grid size={{ xs: 4, sm: 4 }}>
            <Stack sx={{ m: 2, gap: 1 }}>
              <InputLabel htmlFor="module-input">Module</InputLabel>
              <OutlinedInput
                id="module-input"
                name="module"
                value={module}
                onChange={(e) => setModule(e.target.value)}
                placeholder="Enter module name"
                autoComplete="off"
                fullWidth
                size="medium"
                startAdornment={<SearchNormal size="18" />}
                sx={{ minWidth: 100 }}
              />
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
                  size="medium"
                  onClick={handleClear}
                >
                  Clear
                </Button>
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
                  startIcon={<Box1 />}
                  size="medium"
                  component={Link}
                  to={"/trainers/module"}
                >
                  Modules
                </Button>

                <Button
                  variant="contained"
                  startIcon={<Add />}
                  size="medium"
                  component={Link}
                  to={"/trainers/add"}
                >
                  Add Trainer
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        {loading ? (
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
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexWrap: "wrap",
              justifyContent: "center",
              mt: 4,
            }}
          >
            {trainers.map((trainer, idx) => (
              <Card
                key={idx}
                sx={{
                  width: 250,
                  borderRadius: 2,
                  boxShadow: 3,
                  p: 2,
                  textAlign: "center",
                }}
              >
                <Stack alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      position: "relative",
                      width: 90,
                      height: 90,
                      mt: -6,
                      mb: 1,
                      borderRadius: "50%",
                      overflow: "hidden",
                      boxShadow: 2,
                      cursor: "pointer",
                      "&:hover .avatar-overlay": {
                        opacity: 1,
                      },
                      "&:hover .edit-btn": {
                        opacity: 1,
                      },
                    }}
                  >
                    <Avatar
                      src={`${config.hostUrl}/uploads/trainer/${trainer.photo}`}
                      alt={trainer.name}
                      sx={{
                        width: 90,
                        height: 90,
                        border: "3px solid #fff",
                        boxShadow: 2,
                      }}
                    />
                    <Box
                      className="avatar-overlay"
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        bgcolor: "rgba(0,0,0,0.4)",
                        opacity: 0,
                        transition: "opacity 0.3s",
                        borderRadius: "50%",
                        zIndex: 1,
                      }}
                    />
                    <IconButton
                      className="edit-btn"
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "#fff",
                        bgcolor: "primary.main",
                        opacity: 0,
                        transition: "opacity 0.3s",
                        zIndex: 2,
                        "&:hover": { bgcolor: "primary.dark", opacity: 0.2 },
                      }}
                      size="small"
                      onClick={() => handleEdit(trainer._id)}
                    >
                      <Edit size={22} />
                    </IconButton>
                  </Box>

                  <Typography variant="h5" sx={{ mt: 1 }}>
                    {trainer.firstName} {trainer.lastName}
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: "#f5f5f5",
                      borderRadius: 1,
                      px: 2,
                      py: 1,
                      mt: 1,
                      boxShadow:
                        "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                    }}
                  >
                    <Typography variant="h5" color="primary">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(trainer.rate)}
                    </Typography>
                    <Typography variant="subtitle2" color="primary">
                      Rate/hr
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Call size={16} style={{ marginRight: 4 }} />{" "}
                      {trainer.mobileNumber}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Sms size={16} style={{ marginRight: 4 }} />{" "}
                      {trainer.email}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      justifyContent: "center",
                    }}
                  >
                    {trainer.modules.map((module, i) => (
                      <Chip
                        key={i}
                        label={module}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Stack>
              </Card>
            ))}
          </Box>
        )}

        <Modal
          title={<span style={{ color: textColor }}>Update Details</span>}
          styles={modalStyles}
          centered
          open={editModal}
          onOk={() => setEditModal(false)}
          onCancel={() => {
            setIsNewResumeUploaded(false);
            setEditModal(false);
          }}
          width={{
            xs: "90%",
            sm: "90%",
            md: "90%",
            lg: "90%",
            xl: "50%",
            xxl: "40%",
          }}
          zIndex={2000}
          footer={[
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              key="footer-actions"
              mt={2}
            >

              <Box>
                {trainerData.resume && <Button
                  color="primary"
                  endIcon={<Eye size={18} />}
                  onClick={() =>
                    openResume(`${config.hostUrl}/uploads/trainer/${trainerData.resume}`)
                  }
                  sx={{ minWidth: 120 }}
                >
                  View Resume
                </Button>}

                {trainerData.id_document &&
                  <Button color="primary"
                    endIcon={<Eye size={18} />}
                    onClick={() =>
                      openResume(
                        `${config.hostUrl}/uploads/trainer/${trainerData.id_document}`
                      )
                    }
                    sx={{ minWidth: 120 }} >
                    View ID
                  </Button>}
              </Box>


              <Button
                color="primary"
                endIcon={<CloseCircle size={18} />}
                onClick={() => setEditModal(false)}
                sx={{ minWidth: 120 }}
              >
                Close
              </Button>
            </Box>,
          ]}
        >
          <Box sx={{ px: 2, py: 1, backgroundColor: bgColor, width: "100%" }}>
            <Box display="flex" gap={2}>
              <Box
                sx={{
                  position: "relative",
                  minHeight: 140,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                flex={1}
              >
                {typeof trainerData.photo === "string" && trainerData.photo && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setTrainerData((prev) => ({ ...prev, photo: null }));
                    }}
                    sx={{
                      position: "absolute",
                      top: 4,
                      left: 4,
                      bgcolor: "rgba(255,255,255,0.9)",
                      color: "error.main",
                      "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                      zIndex: 3,
                    }}
                  >
                    <CloseCircle size={18} />
                  </IconButton>
                )}

                <label htmlFor="edit-photo-input">
                  <Avatar
                    src={getPhotoSrc(trainerData.photo)}
                    alt={trainerData.name || "Trainer photo"}
                    sx={{
                      width: 125,
                      height: 125,
                      border: "3px solid #fff",
                      boxShadow: 2,
                      cursor: "pointer",
                      "&:hover": { opacity: 0.8 },
                    }}
                  />
                  <input
                    id="edit-photo-input"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setTrainerData((prev) => ({ ...prev, photo: file }));
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
              </Box>

              {trainerData.photo instanceof File && (
                <IconButton
                  size="small"
                  onClick={() =>
                    setTrainerData((prev) => ({ ...prev, photo: oldPhoto }))
                  }
                  sx={{
                    height: 32,
                    width: 32,
                    alignSelf: "flex-start",
                    mt: 1,
                    color: "error.main",
                    bgcolor: "rgba(255,255,255,0.7)",
                    "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                  }}
                >
                  <CloseCircle size={20} />
                </IconButton>
              )}

              <Box flex={1}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="First Name"
                    name="firstName"
                    value={trainerData.firstName}
                    onChange={(e) =>
                      setTrainerData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    autoComplete="new"
                    fullWidth
                    onFocus={() => setErrors((p) => ({ ...p, firstName: "" }))}
                    error={Boolean(errors.firstName)}
                    helperText={errors.firstName}
                  />
                </Grid>
              </Box>

              <Box flex={1}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Last Name"
                    name="lastName"
                    value={trainerData.lastName}
                    onChange={(e) =>
                      setTrainerData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    fullWidth
                    autoComplete="new"
                    onFocus={() => setErrors((p) => ({ ...p, lastName: "" }))}
                    error={Boolean(errors.lastName)}
                    helperText={errors.lastName}
                  />
                </Grid>
              </Box>

              <Box flex={1}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Mobile"
                    name="mobileNumber"
                    value={trainerData.mobileNumber}
                    onChange={handleEditInput}
                    fullWidth
                    autoComplete="new"
                    onFocus={() =>
                      setErrors((p) => ({ ...p, mobileNumber: "" }))
                    }
                    error={Boolean(errors.mobileNumber)}
                    helperText={errors.mobileNumber}
                  />
                </Grid>
              </Box>
            </Box>

            <Box display="flex" gap={2} mt={2}>
              <Box flex={1}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Email"
                    name="email"
                    value={trainerData.email}
                    onChange={handleEditInput}
                    fullWidth
                    autoComplete="new"
                    onFocus={() => setErrors((p) => ({ ...p, email: "" }))}
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                  />
                </Grid>
              </Box>

              <Box flex={1}>
                <Grid item xs={12} md={4}>
                  <Select
                    name="gender"
                    value={trainerData.gender}
                    onChange={handleEditInput}
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
                      Select Gender
                    </MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </Select>
                </Grid>
              </Box>

              <Box flex={1}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Rate / Hour"
                    name="rate"
                    value={trainerData.rate}
                    onChange={handleEditInput}
                    fullWidth
                    autoComplete="new"
                    onFocus={() => setErrors((p) => ({ ...p, rate: "" }))}
                    error={Boolean(errors.rate)}
                    helperText={errors.rate}
                  />
                </Grid>
              </Box>
            </Box>

            <Box display="flex" gap={2} mt={2}>
              <Box flex={1}>
                <Grid item xs={12} md={4}>
                  <Autocomplete
                    options={cities}
                    value={trainerData.city}
                    onChange={(_, newValue) =>
                      setTrainerData({ ...trainerData, city: newValue ?? "" })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="City"
                        autoComplete="new-city"
                        onFocus={() => setErrors((p) => ({ ...p, city: "" }))}
                        error={Boolean(errors.city)}
                        helperText={errors.city}
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
                </Grid>
              </Box>

              <Box flex={1}>
                <Grid item xs={12} md={4}>
                  <Autocomplete
                    options={states}
                    value={trainerData.state}
                    onChange={(e, newValue) =>
                      setTrainerData({ ...trainerData, state: newValue ?? "" })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="State"
                        autoComplete="new-state"
                        onFocus={() => setErrors((p) => ({ ...p, state: "" }))}
                        error={Boolean(errors.state)}
                        helperText={errors.state}
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
                </Grid>
              </Box>

              <Box flex={1}>
                <Grid item xs={12} sm={4}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel sx={{ fontSize: "10px", lineHeight: 1 }}>
                      Date of Birth
                    </InputLabel>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        format="dd-MM-yyyy"
                        onChange={(newValue) =>
                          handleDateChange(newValue, "dateOfBirth")
                        }
                        value={
                          trainerData.dateOfBirth
                            ? new Date(trainerData.dateOfBirth)
                            : null
                        }
                        slotProps={{
                          textField: {
                            error: Boolean(errors.dateOfBirth),
                            helperText: errors.dateOfBirth,
                            name: "dateOfBirth",
                          },
                          popper: {
                            sx: { zIndex: 2100 },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Stack>
                </Grid>
              </Box>
            </Box>

            <Box display="flex" gap={2} mt={2}>
              <Box flex={1}>
                <Grid item xs={12} md={4}>
                  <Select
                    name="course"
                    value={trainerData.course}
                    onChange={handleEditInput}
                    fullWidth
                    displayEmpty
                    MenuProps={{
                      disablePortal: true,
                      PaperProps: { sx: { zIndex: 2100 } },
                    }}
                  >
                    <MenuItem value="" disabled>
                      Select Course
                    </MenuItem>
                    {(courses || []).map((course, index) => (
                      <MenuItem key={index} value={course.name}>
                        {course.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
              </Box>

              <Box flex={1}>
                <Autocomplete
                  multiple
                  options={modules}
                  disableCloseOnSelect
                  value={trainerData.modules}
                  onChange={(e, newVal) => handleModule(newVal)}
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
              </Box>
            </Box>

            <Box display={"flex"} gap={2} mt={2}>
              <Box flex={1}>
                <Grid item xs={12}>
                  <TextField
                    label="Professional Summary"
                    name="professionalSummary"
                    value={trainerData.professionalSummary}
                    onChange={handleEditInput}
                    inputProps={{ maxLength: 300 }}
                    helperText={`${300 - (trainerData.professionalSummary?.length || 0)} characters left`}
                    fullWidth
                    multiline
                    rows={3}
                    autoComplete="new"
                  />
                </Grid>
              </Box>
            </Box>

            <Box display={"flex"} gap={2} mt={2}>
              <Box flex={1}>
                <Grid item xs={12}>
                  <TextField
                    label="Residence Address"
                    name="address"
                    value={trainerData.address}
                    onChange={handleEditInput}
                    inputProps={{ maxLength: 100 }}
                    helperText={`${100 - (trainerData.address?.length || 0)} characters left`}
                    fullWidth
                    multiline
                    rows={3}
                    autoComplete="new"
                  />
                </Grid>
              </Box>
            </Box>

            <Box display={"flex"} gap={2} mt={2}>
              <Box flex={1}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Account Name"
                    name="accountName"
                    value={trainerData.accountName}
                    autoComplete="new"
                    onChange={handleEditInput}
                    fullWidth
                  />
                </Grid>
              </Box>
              <Box flex={1}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Account Number"
                    name="accountNumber"
                    value={trainerData.accountNumber}
                    autoComplete="new"
                    onChange={handleEditInput}
                    fullWidth
                  />
                </Grid>
              </Box>

              <Box flex={1}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="IFSC Code"
                    name="ifscCode"
                    value={trainerData.ifscCode?.toUpperCase()}
                    autoComplete="new"
                    onChange={handleEditInput}
                    fullWidth
                  />
                </Grid>
              </Box>
            </Box>

            <Box display={"flex"} mt={2} gap={2}>
              <Box flex={1}>
                <Grid item xs={12}>
                  <TextField
                    label="Bank Name"
                    name="bankName"
                    value={trainerData.bankName}
                    onChange={handleEditInput}
                    autoComplete="new"
                    fullWidth
                  />
                </Grid>
              </Box>

              <Box flex={1}>
                <Grid item xs={12}>
                  <TextField
                    label="PAN No linked to Bank A/C"
                    name="panCard"
                    value={trainerData.panCard?.toUpperCase()}
                    onChange={handleEditInput}
                    autoComplete="new"
                    fullWidth
                  />
                </Grid>
              </Box>
            </Box>

            <Box display={"flex"} gap={2} mt={2}>
              <Box flex={1}>
                <Select
                  name="govtIdType"
                  value={trainerData.govtIdType}
                  onChange={handleEditInput}
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
              </Box>

              <Box flex={1}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Govt ID Number"
                    name="govtId"
                    value={trainerData.govtId}
                    onChange={handleEditInput}
                    autoComplete="new"
                    fullWidth
                  />
                </Grid>
              </Box>
            </Box>

            <Box display={"flex"} gap={2} mt={2}>
              <Box flex={1}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  freeSolo={false}
                  options={batches?.[trainerData.course] ?? []}
                  value={trainerData.batches}
                  onChange={(e, newVal) => handleBatch(e, newVal)}
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
                      label="Batch"
                      placeholder="Select batch"
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

                <Box display={"flex"} mt={2} gap={2}>
                  <Box flex={1}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={updateDetails}
                    >
                      Submit
                    </Button>
                  </Box>
                </Box>
              </Box>
              <Box
                flex={1}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mt: 1,
                  color: "text.primary",
                }}
              >
                {!isNewResumeUploaded ? (
                  <Button variant="outlined" component="label">
                    {trainerData.resume ? "Update Resume" : "Upload Resume"}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setIsNewResumeUploaded(true);

                        if (file) {
                          handleEditInput({
                            target: { name: "resume", value: file },
                          });
                        }
                      }}
                    />
                  </Button>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {trainerData.resume?.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setTrainerData((prev) => ({ ...prev, resume: null }));
                        setIsNewResumeUploaded(false);
                      }}
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

                {!documetId ? (
                  <Button sx={{ ml: 2 }} variant="outlined" component="label">
                    {trainerData.id_document ? "Update ID" : "Upload ID"}
                    <input
                      type="file"
                      accept=".pdf,jpg,.jpeg,.png,image/jpeg,image/jpg,image/png"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files[0];
                        console.log("file is", file);
                        if (file) {
                          setDocumentId(file);
                        }
                      }}
                    />
                  </Button>
                ) : (
                  <Box
                    sx={{ display: "flex", alignItems: "center", mt: 1, ml: 2 }}
                  >
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {documetId?.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setDocumentId(null)}
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
            </Box>
          </Box>
        </Modal>
      </Box>
    </>
  );
};

export default Trainers;
