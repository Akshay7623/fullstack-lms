import { useEffect, useState } from 'react'
import { Dialog, DialogActions, DialogContent, Button, DialogTitle, FormControl, FormControlLabel, InputLabel, Select, MenuItem, TextField, Checkbox, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import { ConfigProvider, TimePicker } from 'antd';
import dayjs from "dayjs";
import config from '../../config';
import { useEmailPreference } from '../../contexts/EmailPreferenceContext';

const RescheduleDialog = ({ row, showToast, setLectureId, openMailModal, refreshLectures }) => {
    const { settings } = useEmailPreference();

    const [data, setData] = useState({
        _id: row._id,
        open: row.open,
        title: row.title,
        date: row.plannedDate,
        type: row.type,
        trainerId: row.trainerId,
        batchId: row.batchId,
        topic: row.lectureTopic,
        startTime: row.startTime,
        endTime: row.endTime,
        trainers: row.trainers || [],
        rearrangeAll: row.rearrangeAll,
    });

    const [confirmDialog, setConfrimDialog] = useState(false);
    const [errors, setErrors] = useState({});

    const handleCloseReschedule = () => {
        setData({ open: false, title: "", date: null, type: "", trainerId: "", batchId: "", topic: "" });
    };

    const validateForm = () => {
        const err = {};

        if (!data.date) {
            err.date = "Please select a date.";
        }

        if (!data.topic || data.topic.trim().length < 3) {
            err.topic = "Topic must be at least 3 characters.";
        }

        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const submitReschedule = async () => {

        if (!validateForm()) {
            return;
        };

        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${config.hostUrl}/api/lecture/schedule_lecture`, {
                method: "PUT",
                body: JSON.stringify({ _id: data._id, date: data.date, type: data.type, trainerId: data.trainerId, batchId: data.batchId, topic: data.topic, startTime: data.startTime, endTime: data.endTime, rearrangeAll: data.rearrangeAll }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (resp.status === 200) {
                setData({
                    _id: "",
                    open: false,
                    title: "",
                    date: null,
                    type: "",
                    trainerId: "",
                    trainers: [],
                    batchId: "",
                    startTime: "",
                    endTime: "",
                    rearrangeAll: false
                });

                showToast("Lecture Rescheduled successfully", "success");

                if (settings.emailOnLectureReschedule) {
                    setLectureId(data._id);
                    setConfrimDialog(true);
                    refreshLectures();
                }

            } else {
                showToast("Failed to Re schedule lecture. Please try again", "error");
            }
        } catch (Err) {
            console.log("Err is ", Err);
            showToast("Failed to Re schedule lecture. Please try again", "error");
        }
    };

    useEffect(() => {
        setData(prev => ({
            ...prev,
            open: row.open,
            title: row.title,
            date: row.plannedDate,
            type: row.type,
            trainerId: row.trainerId,
            batchId: row.batchId,
            topic: row.lectureTopic,
            startTime: row.startTime,
            endTime: row.endTime,
            trainers: row.trainers,
            rearrangeAll: row.rearrangeAll,
            askToSendMail: row.askToSendMail,
            _id: row._id
        }));

    }, [row]);

    return (
        <>
            <Dialog open={data.open || false} onClose={handleCloseReschedule} fullWidth maxWidth="sm">
                <DialogTitle>{data.title}</DialogTitle>
                <DialogContent>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={data.rearrangeAll}
                                onChange={(e) => {
                                    setData((prev) => ({ ...prev, rearrangeAll: e.target.checked }));
                                    if (!data.rearrangeAll) {
                                        setData((prev) => ({ ...prev, date: row.plannedDate, topic: row.lectureTopic }))
                                    }
                                }
                                }
                            />
                        }
                        label={
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Rearrange all upcoming topics
                                <Typography
                                    component="span"
                                    sx={{ display: "block", fontSize: "0.8rem", color: "text.secondary" }}
                                >
                                    Only check if you haven't made any changes after cancellation
                                    (e.g., added a new lecture on this day)
                                </Typography>
                            </Typography>
                        }
                        sx={{
                            alignItems: "flex-start",
                            mb: 3,
                        }}
                    />
                    <Stack spacing={3}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <MuiDatePicker
                                value={new Date(data.date)}
                                format="dd-MM-yyyy"
                                name="date"
                                onChange={(newValue) => {
                                    setData((prev) => ({ ...prev, date: newValue }))
                                }
                                }
                                slotProps={{
                                    textField: {
                                        error: Boolean(errors.date),
                                        helperText: errors.date,
                                        onFocus: () =>
                                            setErrors((prev) => ({
                                                ...prev,
                                                date: null,
                                            })),
                                    },
                                }}

                                onOpen={() => setErrors((prev) => ({
                                    ...prev,
                                    date: null,
                                }))}
                                disabled={data.rearrangeAll}
                            />

                        </LocalizationProvider>

                        <Stack direction="row" spacing={2}>
                            <ConfigProvider
                                theme={{
                                    token: {
                                        colorPrimary: row.primaryMain,
                                    },
                                    components: {
                                        DatePicker: {
                                            colorPrimary: row.primaryMain,
                                            borderRadius: 6,
                                            colorText:
                                                config.mode === "dark" ? "white" : "#1D2630",
                                            colorTextPlaceholder: row.primaryMain,
                                            colorBgContainer:
                                                config.mode === "dark" ? "#1D2630" : "white",
                                            colorBgElevated:
                                                config.mode === "dark" ? "#1D2630" : "white",
                                            colorTextHeading: row.primaryMain,
                                            controlItemBgActive: row.primaryMain,
                                        },
                                    },
                                }}
                            >
                                <TimePicker.RangePicker
                                    use12Hours
                                    defaultValue={[
                                        dayjs(data.startTime, "HH:mm"),
                                        dayjs(data.endTime, "HH:mm")
                                    ]}
                                    value={[
                                        data.startTime ? dayjs(data.startTime, "HH:mm") : dayjs("14:00", "HH:mm"),
                                        data.endTime ? dayjs(data.endTime, "HH:mm") : dayjs("16:00", "HH:mm")
                                    ]}

                                    onOk={(value) => {
                                        if (value && value[0] && value[1]) {
                                            const [start, end] = value;

                                            if (end.isBefore(start)) {
                                                console.error("⚠️ End time is before start time!");
                                                showToast("End time is before start !", "error");
                                            } else {
                                                setData((prev) => ({ ...prev, startTime: start.format("HH:mm"), endTime: end.format("HH:mm") }));
                                            }
                                        }
                                    }}
                                    minuteStep={5}
                                    format="hh:mm A"
                                />
                            </ConfigProvider>
                        </Stack>
                        <Stack direction="row" spacing={2}>
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel id="select-trainer">Select Trainer</InputLabel>
                                <Select
                                    labelId="select-trainer"
                                    id="trainer-select"
                                    value={data.trainerId}
                                    label="Select Trainer"
                                    onChange={(e) => {
                                        setData((prev) => ({ ...prev, trainerId: e.target.value }))
                                    }}
                                >
                                    {
                                        (row.trainers || []).map((t) => {
                                            return <MenuItem key={t._id} value={t._id}>{t.firstName} {t.lastName}</MenuItem>
                                        })
                                    }
                                </Select>
                            </FormControl>
                        </Stack>
                        <TextField
                            label="Enter Topic"
                            name="topic"
                            fullWidth
                            autoComplete='off'
                            value={data.topic}
                            onChange={(e) =>
                                setData((prev) => ({ ...prev, topic: e.target.value }))
                            }

                            onFocus={(e) => {
                                setErrors((prev) => ({
                                    ...prev,
                                    topic: null,
                                }))
                            }}
                            error={Boolean(errors.topic)}
                            helperText={errors.topic}
                            disabled={data.rearrangeAll}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseReschedule}>Cancel</Button>
                    <Button variant="contained" onClick={() => {
                        if (data.type === 'reschedule') {
                            submitReschedule();
                        }
                    }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={confirmDialog}
                onClose={() => console.log("modal closed !")}
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
        </>
    )
}

export default RescheduleDialog