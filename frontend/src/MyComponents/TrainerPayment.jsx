import { useState } from "react";
import { Button, Dialog, DialogActions, DialogTitle, Typography, Stack, useTheme, DialogContent, IconButton, CircularProgress, Snackbar, Alert } from "@mui/material";
import Breadcrumbs from "components/@extended/Breadcrumbs";
import ShowPayments from "./payments/ShowPayments.jsx";
import { ButtonGroup } from '@mui/material';
import { ArrowDown, CloseCircle } from "iconsax-react";
import { DatePicker, ConfigProvider } from "antd";
import config, { bgColor, textColor } from "../config.js";
import enGB from "antd/locale/en_GB";
const { RangePicker } = DatePicker;
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { saveAs } from "file-saver";

dayjs.extend(utc);
dayjs.extend(timezone);

const statuses = ['Pending', 'Settled', 'Processing', 'Failed'];
const colors = ["warning", "primary", "info", "error"];

const breadcrumbLinks = [
  { title: "trainers", to: "/trainers/list" },
  { title: "trainer-payments" },
];

const TrainerPayment = () => {
  const theme = useTheme();
  const primaryMain = theme.palette.primary.main;
  const [active, setActive] = useState('Pending');
  const [LoadingExport, setLoadingExport] = useState(false);
  const [exportModal, setExportModal] = useState({
    open: false,
    type: "",
    startDate: null,
    endDate: null
  });

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const exportToCSV = (data, startDate, endDate, type) => {

    if (!data || data.length === 0) {
      setToast({ message: "No data to export", open: true, "severity": "warning" });
      console.warn("No data to export");
      return;
    }

    const formatIST = (date) => dayjs(date).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm");

    const headers = [
      "First Name",
      "Last Name",
      "Lecture Date (IST)",
      "Lecture Topic",
      "Amount",
      "Lecture Hour",
      "Status",
    ];

    const rows = data.map((item) => [
      item.firstName,
      item.lastName,
      formatIST(item.lectureDate),
      item.lectureTopic,
      item.amount,
      item.lectureHour,
      item.status,
    ]);

    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");

    const filename = `payments_${type}_${dayjs(startDate).format("YYYY-MM-DD")}_to_${dayjs(endDate).format("YYYY-MM-DD")}.csv`;

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    setExportModal({
      open: false,
      type: "",
      startDate: null,
      endDate: null
    });

    setToast({ message: "CSV file downloaded successfully.", open: true, "severity": "success" })

    saveAs(blob, filename);
  };

  const downloadCSV = async () => {
    const start = exportModal.startDate?.tz("Asia/Kolkata").startOf("day").utc().format()
    const end = exportModal.endDate?.tz("Asia/Kolkata").endOf("day").utc().format();
    const type = exportModal.type.toLocaleLowerCase();

    setLoadingExport(true);

    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${config.hostUrl}/api/trainer-payment/get-payments-by-date?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}&type=${type}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (resp.status === 200) {
        const data = await resp.json();
        exportToCSV(data.data, start, end, type);
      } else {
        setToast({ message: "Error while downloading the file please try again.", open: true, severity: "error" })
      }

    } catch (Err) {
      setToast({ message: "Some error while downloading the file please try again.", open: true, severity: "error" })
      console.log("Error while downloading the csv file.", Err);
    } finally {
      setLoadingExport(false);
    }
  }

  const openExportDialog = () => {
    setExportModal({ open: true, type: active, startDate: null, endDate: null });
  }
  
  return (
    <>
      <Breadcrumbs custom heading="trainer-payments" links={breadcrumbLinks} />
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

      <ButtonGroup variant="contained"
        sx={{
          backgroundColor: 'transparent',
          boxShadow: 'none',
          borderRadius: 2,
          border: 'none'
        }}>
        {statuses.map((status, index) => (
          <Button
            key={status}
            color={colors[index]}
            variant={active === status ? "contained" : "outlined"}
            onClick={() => setActive(status)}
            sx={{ borderRadius: 0 }}
          >
            {status}
          </Button>
        ))}

      </ButtonGroup>

      <Dialog
        open={exportModal.open}
        onClose={() => console.log("modal closed !")}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          <Typography
            variant="body1"
            fontWeight="500"
          >
            Download {exportModal.type} Payments
          </Typography>

          <IconButton
            aria-label="close"
            onClick={() => setExportModal({ open: false, type: "", startDate: null, endDate: null })}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[600],
            }}
          >
            <CloseCircle size="20" variant="Bold" />
          </IconButton>
        </DialogTitle>
        <DialogContent >
          <ConfigProvider
            locale={enGB}
            theme={{
              components: {
                DatePicker: {
                  colorPrimary: primaryMain,
                  borderRadius: 6,
                  colorText: textColor,
                  colorTextPlaceholder: primaryMain,
                  colorBgContainer: "primary.main",
                  colorBgElevated: bgColor,
                  colorTextHeading: primaryMain,
                  colorBgContainerHover: "red"
                },
              },
            }}
          >
            <RangePicker
              value={[exportModal.startDate, exportModal.endDate]}
              onChange={(dates) => {
                const startDate = dates[0];
                const endDate = dates[1];
                setExportModal((prev) => ({ ...prev, startDate: startDate, endDate: endDate }));
              }}
              format="DD-MM-YYYY"
            />
          </ConfigProvider>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "start", mx: 2 }}>

          <Button
            variant="contained"
            size="small"
            startIcon={LoadingExport ? <CircularProgress size={16} /> : <ArrowDown size={10} />}
            onClick={downloadCSV}
            sx={{
              borderRadius: 0.5
            }}
            disabled={!exportModal.startDate || !exportModal.endDate || LoadingExport}
          >
            Download
          </Button>

          <Button
            onClick={() => setExportModal({
              open: false,
              type: null,
              startDate: null,
              endDate: null
            })}
            color="primary"
            variant="outlined"
            size="small"
            sx={{
              borderRadius: 0.5
            }}>
            Cancel
          </Button>

        </DialogActions>
      </Dialog >

      {active === "Pending" && <ShowPayments type="pending" openExport={openExportDialog} />}
      {active === "Settled" && <ShowPayments type="settled" openExport={openExportDialog} />}
      {active === "Processing" && <ShowPayments type="processing" openExport={openExportDialog} />}
      {active === "Failed" && <ShowPayments type="failed" openExport={openExportDialog} />}
    </>
  );
};

export default TrainerPayment;