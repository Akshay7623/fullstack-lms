import Breadcrumbs from "components/@extended/Breadcrumbs";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useState } from "react";
import { Copy, Edit, Trash } from "iconsax-react";

import {
    Box,
    Typography,
    TextField,
    Switch,
    FormControlLabel,
    Stack,
    Paper,
    Divider,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Tooltip,
} from "@mui/material";
import { useEffect } from "react";
import config from '../config';
import { useEmailPreference } from "../contexts/EmailPreferenceContext";


const maskString = (str, visibleCount = 7) => {
    if (!str) return "";
    const maskLength = Math.max(0, str.length - visibleCount);
    return "*".repeat(maskLength) + str.slice(-visibleCount);
};

const breadcrumbLinks = [
    { title: "settings", to: "/settings" },
];

const razorpayWebhook = `${window.location.origin}/api/payment/webhook`;


const Settings = () => {

    const { settings, setSettings } = useEmailPreference();
    const [openDialog, setOpenDialog] = useState({
        open: false,
        title: "",
        label: "",
    });

    const [inputValue, setInputValue] = useState("");
    const [copied, setCopied] = useState(false);

    const [toast, setToast] = useState({
        open: false,
        message: "",
        severity: "",
    });

    const [razorpaySettings, setRazorpaySettings] = useState({
        razorpaySecret: "*********",
        razorpayKey: "",
    });

    const [openDeleteDialog, setOpenDeleteDialog] = useState({ open: false, field: "" });

    const handleEditOpen = (name) => {
        if (name === "razorpaySecret") {
            setOpenDialog({ open: true, label: "Razorpay Secret Key", title: "Change Razorpay Secret" });
        } else if (name === "razorpayKey") {
            setOpenDialog({ open: true, label: "Razorpay Key ID", title: "Change Razorpay Key ID" });
        }
    };

    const handleDelete = (field) => {
        setOpenDeleteDialog({ open: true, field });
    };

    const handleDeleteConfirm = async () => {
        let keyType = "";

        if (openDeleteDialog.field === "razorpaySecret") {
            keyType = "razorpaySecret";
        } else {
            keyType = "razorpayKey"
        }

        try {
            const token = localStorage.getItem("token");

            const resp = await fetch(`${config.hostUrl}/api/setting/update/key`, {
                method: "PUT",
                body: JSON.stringify({ keyType: keyType, value: "DELETE" }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (resp.status === 200) {
                setRazorpaySettings((prev) => ({ ...prev, [keyType]: "" }));
                setOpenDeleteDialog({ open: false, field: "" });
                setToast({
                    open: true,
                    severity: "success",
                    message: `${openDeleteDialog.field === "razorpaySecret"
                        ? "Razorpay Secret Key"
                        : "Razorpay Key ID"} deleted successfully!`,
                });
            } else {
                setToast({
                    open: true,
                    severity: "error",
                    message: `Some error while deleting ${openDeleteDialog.field === "razorpaySecret"
                        ? "Razorpay Secret Key"
                        : "Razorpay Key ID"}`,
                });
            }

        } catch (Err) {
            setToast({
                open: true,
                severity: "error",
                message: `Some error while deleting ${openDeleteDialog.field === "razorpaySecret"
                    ? "Razorpay Secret Key"
                    : "Razorpay Key ID"}`,
            });
            console.log("Some error while deleting the key", Err);
        }
    };

    const handleDeleteDialogClose = () => {
        setOpenDeleteDialog({ open: false, field: "" });
    };

    const handleChange = async (name) => {

        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${config.hostUrl}/api/setting/update/email_preference`, {
                method: "PUT",
                body: JSON.stringify({ preferenceType: name }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (resp.status === 200) {
                setSettings((prev) => ({ ...prev, [name]: !settings[name] }));
                setToast({ message: "Email preference updated successfully", severity: "success", open: true });
            } else {
                setToast({ message: "Some error while updating email preference", severity: "error", open: true });
            }

        } catch (Err) {
            setToast({ message: "Some error while updating email preference", severity: "error", open: true });
        }
    };

    const handleSave = async () => {
        let keyType = "";

        if (openDialog.label === 'Razorpay Secret Key') {
            keyType = "razorpaySecret";
        } else {
            keyType = "razorpayKey"
        }

        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${config.hostUrl}/api/setting/update/key`, {
                method: "PUT",
                body: JSON.stringify({ keyType: keyType, value: inputValue }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (resp.status === 200) {

                if (keyType === "razorpaySecret") {
                    setRazorpaySettings((prev) => ({ ...prev, razorpaySecret: maskString(inputValue) }))
                } else {
                    setRazorpaySettings((prev) => ({ ...prev, razorpayKey: inputValue }));
                }

                setOpenDialog({ title: "", open: false, label: "" });
                setInputValue("");
                setToast({
                    message: `${openDialog.label === "Razorpay Secret Key"
                        ? "Razorpay Secret Key"
                        : "Razorpay Key ID"} updated successfully!`, severity: "success", open: true
                });
            } else {
                setToast({ message: "Some error while updating the key", severity: "error", open: true });
            }
        } catch (Err) {
            console.log("some error while saving the settings!", Err);
            setToast({ message: "Some error while updating the key", severity: "error", open: true });
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog({ open: false, title: "", label: "" });
        setInputValue("");
    };

    useEffect(() => {

        const getKeyAndId = async () => {
            const token = localStorage.getItem("token");

            const resp = await fetch(`${config.hostUrl}/api/setting/get/key`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await resp.json();

            if (resp.status === 200) {
                setRazorpaySettings({ razorpaySecret: data.secret, razorpayKey: data.id })
            };
        }

        getKeyAndId();
    }, []);

    return (
        <>
            <Breadcrumbs custom heading="settings" links={breadcrumbLinks} />
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

            <Dialog open={openDialog.open} onClose={handleCloseDialog} sx={{
                '& .MuiDialog-paper': {
                    width: '450px',
                    maxWidth: '95%',
                },
            }}
            >
                <DialogTitle>{openDialog.title}</DialogTitle>
                <DialogContent>
                    <TextField
                        label={openDialog.label}
                        autoFocus={true}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value)
                        }}
                        fullWidth
                        sx={{ mt: 1 }}
                        autoComplete="off"

                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={!inputValue}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>


            <Dialog
                open={openDeleteDialog.open}
                onClose={handleDeleteDialogClose}
                sx={{
                    '& .MuiDialog-paper': {
                        width: '380px',
                        maxWidth: '95%',
                    },
                }}
            >
                <DialogTitle>
                    {openDeleteDialog.field === "razorpaySecret"
                        ? "Delete Razorpay Secret Key"
                        : openDeleteDialog.field === "razorpayKey"
                            ? "Delete Razorpay Key ID"
                            : ""}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the{" "}
                        <b>
                            {openDeleteDialog.field === "razorpaySecret"
                                ? "Razorpay Secret Key"
                                : openDeleteDialog.field === "razorpayKey"
                                    ? "Razorpay Key ID"
                                    : ""}
                        </b>
                        ?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteDialogClose}>Cancel</Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={handleDeleteConfirm}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Box p={3}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Email Preferences
                    </Typography>

                    <Stack spacing={2} alignItems="flex-start">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.emailOnTimeChange}
                                    onChange={() => handleChange("emailOnTimeChange")}
                                />
                            }
                            label="Ask to send email for time change"
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.emailOnTrainerAssign}
                                    onChange={() => handleChange("emailOnTrainerAssign")}
                                />
                            }
                            label="Ask to send email for trainer assignment"
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.emailOnLectureCancel}
                                    onChange={() => handleChange("emailOnLectureCancel")}
                                />
                            }
                            label="Ask to send email for lecture cancellation"
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.emailOnLectureReschedule}
                                    onChange={() => handleChange("emailOnLectureReschedule")}
                                />
                            }
                            label="Ask to send email for lecture rescheduling"
                        />
                    </Stack>

                    <Divider sx={{ my: 4 }} />

                    <Typography variant="h6" gutterBottom>
                        Razorpay Configuration
                    </Typography>

                    <Stack spacing={2}>
                        <Box sx={{ maxWidth: 500 }}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <TextField
                                    label="Razorpay Secret Key"
                                    value={razorpaySettings.razorpaySecret}
                                    disabled
                                    fullWidth
                                    sx={{
                                        '& .MuiInputBase-input.Mui-disabled': {
                                            color: 'text.primary',
                                            WebkitTextFillColor: 'inherit',
                                        },
                                        '& .MuiInputLabel-root.Mui-disabled': {
                                            color: 'text.primary',
                                        },
                                    }}
                                />

                                <Tooltip title="Edit" arrow>
                                    <IconButton onClick={() => handleEditOpen("razorpaySecret")}>
                                        <Edit size="20" variant="Linear" />
                                    </IconButton>
                                </Tooltip>
                                <IconButton color="error" onClick={() => handleDelete("razorpaySecret")}>
                                    <Trash size="20" variant="Linear" />
                                </IconButton>
                            </Box>
                            <Typography variant="caption" sx={{ color: "text.secondary", ml: 1, mt: 0.5 }}>
                                Secret key is masked for security reasons.
                            </Typography>
                        </Box>

                        <Box sx={{ maxWidth: 500 }}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <TextField
                                    label="Razorpay Key ID"
                                    value={razorpaySettings.razorpayKey}
                                    disabled
                                    fullWidth
                                    sx={{
                                        '& .MuiInputBase-input.Mui-disabled': {
                                            color: 'text.primary',
                                            WebkitTextFillColor: 'inherit',
                                        },
                                        '& .MuiInputLabel-root.Mui-disabled': {
                                            color: 'text.primary',
                                        },
                                    }}
                                />
                                <Tooltip title="Edit" arrow>
                                    <IconButton onClick={() => handleEditOpen("razorpayKey")}>
                                        <Edit size="20" variant="Linear" />
                                    </IconButton>
                                </Tooltip>
                                <IconButton color="error" onClick={() => handleDelete("razorpayKey")}>
                                    <Trash size="20" variant="Linear" />
                                </IconButton>
                            </Box>
                        </Box>


                        <Box sx={{ maxWidth: 500 }}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <TextField
                                    label="Razorpay Webhook URL"
                                    value={razorpayWebhook}
                                    disabled
                                    fullWidth
                                    sx={{
                                        '& .MuiInputBase-input.Mui-disabled': {
                                            color: 'text.primary',
                                            WebkitTextFillColor: 'inherit',
                                        },
                                        '& .MuiInputLabel-root.Mui-disabled': {
                                            color: 'text.primary',
                                        },
                                    }}
                                />

                                <Tooltip title={copied ? "Copied!" : "Copy webhook URL"} arrow>
                                    <IconButton
                                        onClick={() => {
                                            navigator.clipboard.writeText(razorpayWebhook);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                            setToast({ message: "Webhook copied successfully.", open: true, severity: "success" })
                                        }}
                                        color={copied ? "success" : "primary"}
                                    >
                                        <Copy size={18} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Typography variant="caption" sx={{ color: "text.secondary", ml: 1, mt: 0.5 }}>
                                Click the copy icon to copy your webhook URL.
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>
            </Box>
        </>
    )
}

export default Settings;