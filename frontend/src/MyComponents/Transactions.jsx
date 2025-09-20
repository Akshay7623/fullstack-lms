import { useState, useEffect } from "react";
import Breadcrumbs from "components/@extended/Breadcrumbs";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  Stack,
  MenuItem,
  Pagination,
  InputLabel,
  FormControl,
  Select,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Typography } from "@mui/material";
import { pdf } from "@react-pdf/renderer";
import ReceiptPDF from "./components/ReceiptPDF";
import config from "../config";
import { Receipt, Send2 } from "iconsax-react";
import { getPagination, setPagination } from "../../pagination";

const capitlize = (str) =>
  str
    .split(" ")
    .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1))
    .join(" ");
const breadcrumbLinks = [{ title: "transaction" }, { title: "receipt" }];
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const campusInfo = {
  accountName: "Aquiras Systems Pvt Ltd",
  gstn: "24AAWCA2282K1Z9",
};

const corporateInfo = {
  accountName: "Boston Institute Of Analytics Global Education Pvt Ltd",
  bank: "Yes Bank, Andheri West Branch",
  accountNumber: "001063400006737",
  ifscCode: "YESB0000010",
  gstn: "27AALCB3720G1ZT",
  pan: "AALCB3720G",
};

const metaData = {
  title: "Boston Institute Of Analytics",
  termAndConditionUrl:
    "https://bostoninstituteofanalytics.org/terms-and-conditions/",
  website: "www.bostoninstituteofanalytics.org",
};

function getTimeRemaining(lastSentAt) {
  if (!lastSentAt) return 0;
  const sent = new Date(lastSentAt).getTime();
  const now = Date.now();
  const diff = sent + 24 * 60 * 60 * 1000 - now;
  return diff > 0 ? diff : 0;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(getPagination('receipt') || 10);
  const [totalPage, setTotalPage] = useState(1);
  const [sending, setSending] = useState({});

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [timerTick, setTimerTick] = useState(0);

  const getTransactions = async (page, pageSize) => {
    try {
      const token = localStorage.getItem("token");
      const url = `${config.hostUrl}/api/transaction/get?page=${page}&pageSize=${pageSize}`;
      const resp = await fetch(url, {
        method: "get",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();

      if (resp.status === 200) {
        setTotalPage(Math.ceil(data.total / pageSize));
        setTransactions(data.data);
      }
    } catch (Err) {
      console.log("Error while fetching data ", Err);
    }
  };

  const sendMail = async (row) => {
    setSending((prev) => ({ ...prev, [row._id]: true }));
    const data = {
      studentInfo: {
        name: `${row.studentId.firstName} ${row.studentId.lastName}`,
        mobile: row.studentId.mobileNumber,
        email: row.studentId.email,
        date: new Date(row.datetime).toLocaleDateString("en-IN"),
        receiptNo: row.paymentReferenceId.replace("order_", "").toUpperCase(),
        purpose: "Fees Payment",
        paymentMode: row.paymentMode.toUpperCase(),
        campus: "Ahmedabad",
        referenceNumber: row.paymentReferenceId,
        amount: row.amount,
      },

      campusInfo: { ...campusInfo },
      corporateInfo: { ...corporateInfo },
      metaData: { ...metaData },
    };

    try {
      const blob = await pdf(<ReceiptPDF data={data} />).toBlob();
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("receipt", blob, "Receipt.pdf");
      formData.append("email", row.studentId.email);
      formData.append("_id", row._id);

      const resp = await fetch(`${config.hostUrl}/api/transaction/send-mail`, {
        method: "post",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (resp.status === 200) {
        setTransactions((prevTransactions) => prevTransactions.map((txn) => txn._id === row._id ? { ...txn, lastReceiptSentAt: new Date().toISOString() } : txn));
        setToast({
          open: true,
          message: `Fee receipt sent successfully to ${row.studentId.email}`,
          severity: "success",
        });
      } else {
      }
      setSending((prev) => ({ ...prev, [row._id]: false }));
    } catch (Err) {
      setToast({
        open: true,
        message: `Error while sending mail to ${row.studentId.email}`,
        severity: "error",
      });
      console.log("Error while viewing sending mail ", Err);
      setSending((prev) => ({ ...prev, [row._id]: false }));
    }
  };

  const viewReceipt = async (row) => {
    const data = {
      studentInfo: {
        name: `${row.studentId.firstName} ${row.studentId.lastName}`,
        mobile: row.studentId.mobileNumber,
        email: row.studentId.email,
        date: new Date(row.datetime).toLocaleDateString("en-IN"),
        receiptNo: row.paymentReferenceId.replace("order_", "").toUpperCase(),
        purpose: "Fees Payment",
        paymentMode: row.paymentMode.toUpperCase(),
        campus: "Ahmedabad",
        referenceNumber: row.paymentReferenceId,
        amount: row.amount,
      },

      campusInfo: { ...campusInfo },
      corporateInfo: { ...corporateInfo },
      metaData: { ...metaData },
    };

    try {
      const blob = await pdf(<ReceiptPDF data={data} />).toBlob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl);
    } catch (Err) {
      // set Err toast
      console.log("Error while viewing receipt", Err);
    }
  };

  const handlePageChange = (value) => {
    setPage(value);
    getTransactions(value, pageSize);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1);
    getTransactions(1, event.target.value);
  };

  useEffect(() => {
    getTransactions(page, pageSize);
    const interval = setInterval(() => setTimerTick((tick) => tick + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Breadcrumbs custom heading="view-transactions" links={breadcrumbLinks} />
      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
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

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Send Mail</TableCell>
              <TableCell>View Receipt</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((row) => (
              <TableRow key={row._id}>
                <TableCell>
                  {new Date(row.datetime).toLocaleDateString("en-IN")}
                </TableCell>

                <TableCell>
                  {new Date(row.datetime)
                    .toLocaleTimeString("en-IN")
                    .replace("am", "AM")
                    .replace("pm", "PM")}
                </TableCell>
                <TableCell>
                  <Stack>
                    {row.studentId?.firstName} {row.studentId?.lastName}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      component="span"
                    >
                      {row.studentId?.course}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      component="span"
                    >
                      ({capitlize(row.studentId?.program)})
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack>
                    {row.studentId?.mobileNumber}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      component="span"
                    >
                      {row.studentId?.email}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack>
                    ₹{row.amount.toLocaleString("en-IN")}
                    <Typography color="text.secondary">
                      {capitlize(row.paymentMode)}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  {(() => {
                    const timeRemaining = getTimeRemaining(
                      row.lastReceiptSentAt
                    );

                    if (sending[row._id]) {
                      return <CircularProgress size={20} />;
                    }

                    if (timeRemaining > 0) {
                      const hours = Math.floor(timeRemaining / 3600000);
                      const minutes = Math.floor(
                        (timeRemaining % 3600000) / 60000
                      );
                      const seconds = Math.floor(
                        (timeRemaining % 60000) / 1000
                      );

                      return (
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          disabled
                          endIcon={<Send2 />}
                        >
                          {`${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`}
                        </Button>
                      );
                    }

                    return (
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        endIcon={<Send2 />}
                        onClick={() => sendMail(row)}
                      >
                        Send Mail
                      </Button>
                    );
                  })()}
                </TableCell>

                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    endIcon={<Receipt />}
                    onClick={() => viewReceipt(row)}
                  >
                    View Receipt
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
              onChange={(e) => {
                handlePageSizeChange(e);
                setPagination('receipt', Number(e.target.value));
              }}
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
    </>
  );
};

export default Transactions;
