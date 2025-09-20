import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Stack,
    Typography,
    useTheme,
    Box,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers";
import { ConfigProvider, TimePicker } from "antd";
import dayjs from "dayjs";
import config from "../../config";
import { useEmailPreference } from '../../contexts/EmailPreferenceContext';

const ScheduleDialog = ({ open, onClose, batches, trainers, showToast, refreshLectures, setLectureId, openMailModal }) => {
    const { settings } = useEmailPreference();
    const theme = useTheme();
    const primaryMain = theme.palette.primary.main;
    const filteredBatches = batches.filter((b) => b.status === "active");

    const [data, setData] = useState({
        date: null,
        topic: "",
        trainerId: "",
        batchId: "",
        startTime: "",
        endTime: "",
        recordLink: "",
        type: "add",
    });

    const [filteredTrainers, setFilteredTrainers] = useState([]);
    const [errors, setErrors] = useState({});
    const [confirmDialog, setConfrimDialog] = useState(false);

    const validateForm = () => {
        const err = {};
        if (!data.date) err.date = "Please select a date.";
        if (!data.startTime || !data.endTime) {
            err.time = "Please select start and end time.";
        } else {
            const start = dayjs(data.startTime, "HH:mm");
            const end = dayjs(data.endTime, "HH:mm");

            if (end.isBefore(start)) {
                err.time = "End time cannot be before start time.";
            }
        }

        if (!data.topic.trim()) err.topic = "Please enter a topic.";
        if (!data.batchId) err.batchId = "Please select a batch.";
        if (!data.trainerId) err.trainerId = "Please select a trainer.";

        if (data.recordLink.trim()) {
            try {
                new URL(data.recordLink);
            } catch {
                err.recordLink = "Please enter a valid URL.";
            }
        }
        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${config.hostUrl}/api/lecture/schedule_lecture`, {
                method: "PUT",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const respdata = await resp.json();

            if (resp.status === 200) {
                showToast("Lecture scheduled successfully.", "success");
                refreshLectures();
                onClose();
                setData({
                    date: null,
                    topic: "",
                    trainerId: "",
                    batchId: "",
                    startTime: "",
                    endTime: "",
                    recordLink: "",
                    type: "add",
                });

                if (settings.emailOnLectureReschedule) {
                    setLectureId(respdata.data._id);
                    setConfrimDialog(true);
                }

            } else {
                showToast("Failed to schedule lecture. Please try again.", "error");
            }
        } catch (err) {
            console.error("Error scheduling lecture:", err);
            showToast("Failed to schedule lecture. Please try again.", "error");
        }
    };

    return (
        <Box>
            <Dialog open={open} onClose={(event, reason) => {
                if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
                    onClose();
                    setData({
                        date: null,
                        topic: "",
                        trainerId: "",
                        batchId: "",
                        startTime: "",
                        endTime: "",
                        recordLink: "",
                        type: "add",
                    });
                    setErrors({});
                }
            }} maxWidth="sm" fullWidth>
                <DialogTitle>Schedule New Lecture</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} mt={1}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <MuiDatePicker
                                label="Date"
                                value={data.date}
                                format="dd-MM-yyyy"
                                onChange={(newValue) => setData((prev) => ({ ...prev, date: newValue }))}
                                slotProps={{
                                    textField: {
                                        error: Boolean(errors.date),
                                        helperText: errors.date,
                                    },
                                }}
                                onOpen={() => setErrors((prev) => ({ ...prev, date: null }))}
                            />
                        </LocalizationProvider>

                        <ConfigProvider
                            theme={{
                                token: {
                                    colorPrimary: primaryMain,
                                },
                                components: {
                                    DatePicker: {
                                        colorPrimary: primaryMain,
                                        borderRadius: 6,
                                        colorText:
                                            config.mode === "dark" ? "white" : "#1D2630",
                                        colorTextPlaceholder: primaryMain,
                                        colorBgContainer:
                                            config.mode === "dark" ? "#1D2630" : "white",
                                        colorBgElevated:
                                            config.mode === "dark" ? "#1D2630" : "white",
                                        colorTextHeading: primaryMain,
                                        controlItemBgActive: primaryMain,
                                    },
                                },
                            }}
                        >
                            <TimePicker.RangePicker
                                use12Hours
                                format="hh:mm A"
                                minuteStep={5}
                                value={[
                                    data.startTime ? dayjs(data.startTime, "HH:mm") : null,
                                    data.endTime ? dayjs(data.endTime, "HH:mm") : null,
                                ]}
                                onOk={(value) => {

                                    if (value && value[0] && value[1]) {
                                        const [start, end] = value;
                                        if (end.isBefore(start)) {
                                            showToast("End time cannot be before start time.", "error");
                                        } else {
                                            setData((prev) => ({
                                                ...prev,
                                                startTime: start.format("HH:mm"),
                                                endTime: end.format("HH:mm"),
                                            }));
                                            setErrors((prev) => ({ ...prev, time: null }));
                                        }
                                    }
                                }}

                            />
                            {errors.time && (
                                <Typography color="error" variant="caption">
                                    {errors.time}
                                </Typography>
                            )}
                        </ConfigProvider>

                        <FormControl fullWidth>
                            <InputLabel id="batch-label">Select Batch</InputLabel>
                            <Select
                                labelId="batch-label"
                                value={data.batchId}
                                onChange={(e) => setData((prev) => ({ ...prev, batchId: e.target.value }))}
                                onOpen={() => setErrors((prev) => ({ ...prev, batchId: null }))}
                            >
                                {filteredBatches.map((b) => (
                                    <MenuItem key={b._id} value={b._id} data-coursename={b.courseName} onClick={() => {
                                        const filteredTrainers = trainers.filter((t) => t.course === b.courseName);
                                        setFilteredTrainers(filteredTrainers);
                                        setData((prev) => ({ ...prev, trainerId: "" }));
                                    }}>
                                        {b.courseCode}-{b.batchNo} ({b.month} {b.year})
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.batchId && <Typography color="error" variant="caption">{errors.batchId}</Typography>}
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel id="trainer-label">Select Trainer</InputLabel>
                            <Select
                                labelId="trainer-label"
                                value={data.trainerId}
                                onChange={(e) => setData((prev) => ({ ...prev, trainerId: e.target.value }))}
                                onOpen={(e) => {
                                    setErrors((prev) => ({ ...prev, trainerId: null }));
                                }}
                            >
                                {filteredTrainers.map((t) => (
                                    <MenuItem key={t._id} value={t._id}>
                                        {t.firstName} {t.lastName}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.trainerId && <Typography color="error" variant="caption">{errors.trainerId}</Typography>}
                        </FormControl>

                        <TextField
                            label="Lecture Topic"
                            autoComplete="off"
                            fullWidth
                            value={data.topic}
                            onChange={(e) => setData((prev) => ({ ...prev, topic: e.target.value }))}
                            error={Boolean(errors.topic)}
                            helperText={errors.topic}
                            onFocus={() => setErrors((prev) => ({ ...prev, topic: null }))}
                        />

                        <TextField
                            label="Recording Link (optional)"
                            fullWidth
                            value={data.recordLink}
                            onChange={(e) => setData((prev) => ({ ...prev, recordLink: e.target.value }))}
                            error={Boolean(errors.recordLink)}
                            helperText={errors.recordLink}
                            onFocus={() => { setErrors((prev) => ({ ...prev, recordLink: null })) }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {

                        onClose();
                        setData({
                            date: null,
                            topic: "",
                            trainerId: "",
                            batchId: "",
                            startTime: "",
                            endTime: "",
                            recordLink: "",
                            type: "add",
                        });
                        setErrors({});

                    }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={confirmDialog}
                onClose={() => null}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    <Typography variant="caption">Notify student(s) about lecture schedule ?
                    </Typography>
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => setConfrimDialog(false)}>No</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setConfrimDialog(false)
                            openMailModal();
                        }}
                    >
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >


    );
};

export default ScheduleDialog;