import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Paper,
    Pagination,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Snackbar,
    Alert,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    RadioGroup,
    FormControlLabel,
    Typography,
    Radio,
    DialogActions,
    useTheme,
    Tooltip,
    Stepper, Step, StepLabel,
    Fade,
    Skeleton,
} from "@mui/material";
import { Grid, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { Empty, Result } from "antd";
import { Bill, WalletMoney, Trash, Copy, Verify, Refresh2, ArrowDown, ArrowLeft, ArrowRight } from "iconsax-react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import config, { modalStyles, textColor } from "../../config";
import { setPagination, getPagination } from '../../../pagination';
import usePayments from "./hooks/usePayments.js";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const steps = ["Lecture List & Payout", "Bank Details", "Status"];

const payoutOptions = [
    {
        value: "neft",
        label: "NEFT/RTGS (Offline)",
        description: "Manual bank transfer via NEFT/RTGS.",
    },
    {
        value: "razorpay",
        label: "Razorpay Payout API",
        description: "Automated payout using Razorpay API.",
    },
];


const APIS = {
    "get-payments": `${config.hostUrl}/api/trainer-payment/get-payments`,
    "get-trainer": `${config.hostUrl}/api/trainer/get-trainer`,
    "settle-payment": `${config.hostUrl}/api/trainer-payment/settle-payment`
};

const ShowPayments = ({ type, openExport }) => {

    const muiTheme = useTheme();
    const primaryMain = muiTheme.palette.primary.main;
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(getPagination('pending_payment') || 10);
    const { payments, totalPage, error, getPayments } = usePayments({ page, pageSize, type });

    const [trainerBank, setTrainerBank] = useState({
        holderName: "",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        loading: true
    });

    const [toast, setToast] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const [selectedPayments, setSelectedPayments] = useState([]);
    const [settleDialogOpen, setSettleDialogOpen] = useState(false);
    const [payoutMethod, setPayoutMethod] = useState("");
    const [dialogStep, setDialogStep] = useState(0);
    const [paymentStatus, setPaymentStatus] = useState("processing");

    const handlePageChange = (value) => {
        setPage(value);
        getPayments(value, pageSize, type);
    };


    const handlePageSizeChange = (event) => {
        setPageSize(event.target.value);
        setPage(1);
        setPagination('pending_payment', event.target.value);
        getPayments(1, event.target.value, type);
    };

    const settlePayment = async (row) => {
        setSelectedPayments([row]);
        setSettleDialogOpen(true);
    };

    const handleCopy = (value, label) => {
        navigator.clipboard.writeText(value);
        setToast({ open: true, message: `${label} copied!`, severity: "success" });
    };

    const closeDialog = () => {
        setSelectedPayments([]);
        setSettleDialogOpen(false);
        setDialogStep(0);
        setPayoutMethod("");
        setPaymentStatus("processing");
    };

    const getTrainerBank = async () => {
        setTrainerBank((prev) => ({ ...prev, loading: true }));
        const trainerId = selectedPayments[0].trainerId;

        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${APIS["get-trainer"]}?trainerId=${trainerId}`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (resp.status === 200) {
                const data = await resp.json();

                setTrainerBank({
                    holderName: data.trainer.accountName,
                    accountNumber: data.trainer.accountNumber,
                    bankName: data.trainer.bankName,
                    ifscCode: data.trainer.ifscCode,
                    loading: false
                });

            } else {
                setToast({ message: "Some error occurred please try again", severity: "error", open: true })
            }

        } catch (Err) {
            console.log("Some server error while fetching bank details", Err);
            setToast({ message: "Some error occurred please try again !", open: true, severity: "error" });
        }
    };

    const submitPayments = async () => {
        setPaymentStatus("processing");

        const paymentIds = selectedPayments.map((p) => p._id);
        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(APIS["settle-payment"], {
                method: "PUT",
                body: JSON.stringify({ paymentIds: paymentIds, paymentMethod: payoutMethod }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (resp.status === 200) {
                getPayments(page, pageSize, type);
                setPaymentStatus("success");
                setToast({ message: "Payout initiated !", open: true, severity: "success" });
            } else {
                const data = await resp.json();
                setToast({ message: data.message, open: true, severity: "error" });
                setPaymentStatus("failed");
            }
        } catch (Err) {
            setPaymentStatus("failed");
            setToast({ message: "Some error occurred please try again !", open: true, severity: "error" });
            console.log("Some error while making payout:", Err);
        }
    };

    useEffect(() => {
        if (error) {
            setToast({ message: "Error while fetching payments details.", open: true, severity: "error" })
        }
    }, [error]);

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

            <Stack direction="row" sx={{ mb: 2, minHeight: 35,mt:2 }}>
                <Button
                    variant="contained"
                    size="small"
                    sx={{
                        width: "auto",
                        display: selectedPayments.length === 0 ? "none" : "inline-flex"
                    }}
                    endIcon={<Bill size={18} />}
                    onClick={() => setSettleDialogOpen(true)}
                >
                    Settle Selected
                </Button>
            </Stack>

            {payments.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Empty description={<Typography variant="body2" color={primaryMain}>No payment records available</Typography>} />
                </Paper>
            ) :
                (
                    <>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Payments
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                color="primary"
                                startIcon={<ArrowDown size={18} />}
                                onClick={() => openExport()}
                                sx={{ minWidth: 120, borderRadius: 0 }}
                            >
                                Export
                            </Button>
                        </Stack>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>

                                        {["pending", "failed"].includes(type) && <TableCell>Select</TableCell>}
                                        <TableCell>Trainer Name</TableCell>
                                        <TableCell>Lecture Topic</TableCell>
                                        <TableCell>Lecture Date</TableCell>
                                        <TableCell>Amount Due</TableCell>
                                        <TableCell>
                                            {
                                                ["pending", "failed"].includes(type) ? (type === "pending" ? "Settle" : "Retry Payment") : "Reference"
                                            }
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {payments.length > 0 &&
                                        payments.map((row) => (
                                            <TableRow key={row._id}>
                                                {
                                                    ["pending", "failed"].includes(type) && <TableCell padding="checkbox">
                                                        <Checkbox
                                                            checked={selectedPayments.includes(row)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {

                                                                    if (selectedPayments.length === 0) {
                                                                        setSelectedPayments([row]);
                                                                    } else {
                                                                        const firstTrainerId = selectedPayments[0].trainerId;

                                                                        if (row.trainerId === firstTrainerId) {
                                                                            setSelectedPayments(prev => [...prev, row]);
                                                                        } else {
                                                                            setToast({
                                                                                open: true,
                                                                                message: "You can only select payments for the same trainer.",
                                                                                severity: "warning"
                                                                            });
                                                                        }
                                                                    }
                                                                } else {
                                                                    setSelectedPayments(prev => prev.filter(p => p._id !== row._id));
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                }

                                                <TableCell>{`${row.firstName} ${row.lastName}`}</TableCell>
                                                <TableCell>{row.lectureTopic}</TableCell>
                                                <TableCell>{dayjs(row.lectureDate).format("DD-MM-YYYY")}</TableCell>
                                                <TableCell>₹{row.amount.toLocaleString("en-IN")}</TableCell>
                                                <TableCell>

                                                    {
                                                        ["pending", "failed"].includes(type) &&
                                                        <Button
                                                            sx={{ borderRadius: 0.5 }}
                                                            variant="contained"
                                                            color={type === "pending" ? "primary" : "secondary"}
                                                            size="small"
                                                            onClick={() => settlePayment(row)}
                                                            endIcon={
                                                                type === "pending" ?
                                                                    <WalletMoney size={18} /> : <Refresh2 size={18} />}
                                                        >
                                                            {type === "pending" ? "Settle" : "Retry Payment"}
                                                        </Button>
                                                    }

                                                    {
                                                        !["pending", "failed"].includes(type) && <Typography color="primary" fontWeight={500}>{new Date(row.updatedAt).toLocaleString()}</Typography>
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    <TableRow>
                                        <TableCell colSpan={[""]} />
                                        <TableCell colSpan={[""]} />
                                        <TableCell colSpan={[""]} />
                                        {
                                            ["pending", "failed"].includes(type) && <TableCell colSpan={[""]} />
                                        }
                                        <TableCell sx={{ fontWeight: "bold" }}>
                                            Total: ₹
                                            {payments
                                                .reduce((sum, row) => sum + row.amount, 0)
                                                .toLocaleString("en-IN")}
                                        </TableCell>
                                        <TableCell />
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>)}

            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
                sx={{ mt: 2 }}
            >
                <Stack direction="row" alignItems="center" spacing={1}>
                    <InputLabel id="per-page-label" sx={{ mb: 0, fontSize: "12px" }}>
                        Row per page
                    </InputLabel>
                    <FormControl size="small" sx={{ minWidth: 50 }}>
                        <Select
                            labelId="per-page-label"
                            value={pageSize}
                            onChange={handlePageSizeChange}
                        >
                            {PAGE_SIZE_OPTIONS.map((size) => (
                                <MenuItem key={size} value={size}>
                                    {size}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
                <Pagination
                    count={totalPage}
                    page={page}
                    onChange={(_, value) => handlePageChange(value)}
                    color="primary"
                    variant="combined"
                    showFirstButton
                    showLastButton
                    sx={{ "& .MuiPaginationItem-root": { my: 0.5 } }}
                />
            </Stack>

            <Dialog
                open={settleDialogOpen}
                onClose={(event, reason) => {
                    if (reason === "backdropClick") return;
                    closeDialog();
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Choose Payout Method</DialogTitle>
                <DialogContent sx={{ overflow: "hidden" }}>

                    <Stepper activeStep={dialogStep} alternativeLabel sx={{ mb: 2 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {dialogStep === 0 && (
                        <Fade in={dialogStep === 0} timeout={700} unmountOnExit>
                            <div>
                                <Table size="small" sx={{ mb: 2 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Trainer Name</TableCell>
                                            <TableCell>Lecture Topic</TableCell>
                                            <TableCell>Lecture Date</TableCell>
                                            <TableCell>Amount</TableCell>
                                            <TableCell>Remove</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedPayments.map((row) => (
                                            <TableRow key={row._id}>
                                                <TableCell>{`${row.firstName} ${row.lastName}`}</TableCell>
                                                <TableCell>{row.lectureTopic}</TableCell>
                                                <TableCell>{dayjs(row.lectureDate).format("DD-MM-YYYY")}</TableCell>
                                                <TableCell>₹{row.amount.toLocaleString("en-IN")}</TableCell>
                                                <TableCell>
                                                    <Tooltip title="Remove">
                                                        <Button
                                                            color="error"
                                                            size="small"
                                                            onClick={() => setSelectedPayments(prev => prev.filter(p => p._id !== row._id))}
                                                        >
                                                            <Trash size={18} />
                                                        </Button>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell colSpan={3} sx={{ fontWeight: "bold" }}>
                                                Subtotal
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: "bold" }}>
                                                ₹{selectedPayments.reduce((sum, row) => sum + row.amount, 0).toLocaleString("en-IN")}
                                            </TableCell>
                                            <TableCell />
                                        </TableRow>
                                    </TableBody>
                                </Table>

                                <RadioGroup
                                    value={payoutMethod}
                                    onChange={(e) => setPayoutMethod(e.target.value)}
                                >
                                    {payoutOptions.map(option => (
                                        <Paper
                                            key={option.value}
                                            elevation={payoutMethod === option.value ? 6 : 2}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                p: 2,
                                                mb: 2,
                                                border: payoutMethod === option.value ? `1px solid ${primaryMain}` : "2px solid transparent",
                                                background: payoutMethod === option.value ? config.mode === "dark" ? "#1D2630" : "#f0f7ff" : "inherit",
                                                cursor: "pointer",
                                                transition: "border 0.2s",
                                            }}
                                            onClick={() => setPayoutMethod(option.value)}
                                        >
                                            <FormControlLabel
                                                value={option.value}
                                                control={
                                                    <Radio
                                                        sx={{
                                                            transform: "scale(1.2)",
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Stack>
                                                        <Typography variant="h6">{option.label}</Typography>
                                                        <Typography variant="body2" color="text.secondary">{option.description}</Typography>
                                                    </Stack>
                                                }
                                                sx={{ flex: 1, m: 0 }}
                                            />
                                        </Paper>
                                    ))}
                                </RadioGroup>

                            </div>
                        </Fade>
                    )}

                    {dialogStep === 1 && (
                        <Fade in={dialogStep === 1} timeout={700} unmountOnExit>
                            <div>
                                <Typography variant="h5" gutterBottom>
                                    Trainer Bank Details
                                </Typography>

                                {trainerBank.loading ? (
                                    [
                                        "Account Holder",
                                        "Bank",
                                        "Account Number",
                                        "IFSC"
                                    ].map((label) => (
                                        <Grid
                                            container item
                                            xs={12}
                                            key={label}
                                            alignItems="center"
                                            sx={{ justifyContent: "space-between", minHeight: 40 }}
                                        >

                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    fontWeight: 700,
                                                    width: "140px"
                                                }}
                                            >
                                                <Skeleton
                                                    variant="text"
                                                    width={110}
                                                    height={24}
                                                    sx={{ borderRadius: 1 }}
                                                />
                                            </Typography>
                                            <Grid
                                                container
                                                item
                                                xs={7}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "flex-end",
                                                    mr: 14
                                                }}
                                            >
                                                <Skeleton
                                                    variant="text"
                                                    width={140}
                                                    height={22}
                                                    sx={{ borderRadius: 1 }}
                                                />
                                                <span style={{ width: 18 }} />
                                                <Skeleton
                                                    variant="circular"
                                                    width={22}
                                                    height={22}
                                                    sx={{ ml: 1 }}
                                                />
                                            </Grid>
                                        </Grid>
                                    ))
                                ) : ([
                                    {
                                        label: "Account Holder",
                                        value: trainerBank?.holderName || "",
                                    },
                                    {
                                        label: "Bank",
                                        value: trainerBank?.bankName || "Bank Name",
                                    },
                                    {
                                        label: "Account Number",
                                        value: trainerBank?.accountNumber || "",
                                    },
                                    {
                                        label: "IFSC",
                                        value: trainerBank?.ifscCode || "IFSC",
                                    }
                                ].map((row) =>
                                    <Grid container item xs={12} key={row.label} alignItems="center" sx={{ justifyContent: "space-between" }}>
                                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 2 }} key={row.label}>
                                            <b>{row.label}:</b>
                                        </Typography>
                                        <Grid container item xs={7} sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", mb: 2, mr: 14 }}>
                                            <Typography variant="body1">
                                                {row.value}
                                            </Typography>
                                            &nbsp;
                                            &nbsp;
                                            &nbsp;
                                            <Tooltip title={`Copy ${row.label}`}>
                                                <Copy
                                                    size={22}
                                                    color={primaryMain}
                                                    cursor="pointer"
                                                    sx={{ ml: 1 }}
                                                    onClick={() => handleCopy(row.value, row.label)}
                                                >
                                                </Copy>
                                            </Tooltip>
                                        </Grid>
                                    </Grid>
                                ))}

                            </div>
                        </Fade>
                    )}

                    {dialogStep === 2 && (

                        <>
                            {paymentStatus === "processing" && (
                                <Result
                                    status="info"
                                    title={<Typography variant="h5" color={textColor}>Processing Payout...</Typography>}
                                    subTitle={<Typography variant="caption" color={textColor}>Please wait while we process the payment.</Typography>}
                                    icon={
                                        <div className="flex justify-center">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                style={{ zIndex: 1 }}
                                            >
                                                <Skeleton variant="circular" width={48} height={48} />
                                            </motion.div>
                                        </div>
                                    }
                                />
                            )}

                            {
                                paymentStatus === "success" && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -45, opacity: 0 }}
                                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 120,
                                            damping: 10,
                                            duration: 0.6
                                        }}
                                    >
                                        <Result
                                            status="success"
                                            title={<Typography variant="h4" color={textColor}>Payout Initiated Successfully !</Typography>}
                                            subTitle={<Typography variant="caption" color={textColor}>The trainer's payment has been successfully processed and a notification has been sent.</Typography>}
                                            icon={<div className="flex justify-center">
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop" }}
                                                    style={{ zIndex: 1 }}
                                                ><Verify size={48} color={primaryMain} />
                                                </motion.div>
                                            </div>}
                                        />
                                    </motion.div>
                                )
                            }

                            {paymentStatus === "failed" && (
                                <Result
                                    status="error"
                                    title={<Typography variant="h4" color={textColor}>Payout Failed</Typography>}
                                    subTitle={<Typography variant="caption" color={textColor}>
                                        Something went wrong while processing the payout. Please try again or use a different method.
                                    </Typography>}
                                />
                            )}
                        </>
                    )}

                </DialogContent>
                <DialogActions>

                    {dialogStep === 0 && (
                        <>
                            <Button
                                sx={{ borderRadius: 0.5 }}
                                onClick={() => {
                                    closeDialog();
                                }}>Cancel</Button>
                            <Button
                                sx={{ borderRadius: 0.5 }}
                                endIcon={<ArrowRight size={10} />}
                                variant="contained"
                                disabled={!payoutMethod || selectedPayments.length === 0}
                                onClick={() => {
                                    setDialogStep(1);
                                    getTrainerBank();
                                }}
                            >
                                Next
                            </Button>
                        </>
                    )}

                    {dialogStep === 1 && (
                        <>
                            <Button
                                sx={{ borderRadius: 0.5 }}
                                startIcon={<ArrowLeft size={10} />}
                                onClick={() => setDialogStep(0)}
                            >Back</Button>
                            <Button
                                sx={{ borderRadius: 0.5 }}
                                variant="contained"
                                onClick={() => {
                                    submitPayments();
                                    setDialogStep(2);
                                }}
                                disabled={trainerBank.loading}
                            >
                                Confirm Payment
                            </Button>
                        </>
                    )}

                    {dialogStep === 2 && (
                        <Button
                            sx={{ borderRadius: 0.5 }}
                            variant="contained"
                            onClick={() => {
                                closeDialog();
                            }}
                            disabled={paymentStatus === "processing"}
                        >
                            Close
                        </Button>
                    )}

                </DialogActions>
            </Dialog >

        </>
    );
};

export default ShowPayments;