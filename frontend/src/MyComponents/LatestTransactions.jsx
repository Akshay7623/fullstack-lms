import Breadcrumbs from "components/@extended/Breadcrumbs";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Pagination,
  TextField,
  Button,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { DocumentDownload } from "iconsax-react";
import Stack from "@mui/material/Stack";
import * as Papa from "papaparse";
import { useEffect, useState } from "react";
import { Modal } from "antd";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import config, { modalStyles, textColor } from "../config";
import { setPagination, getPagination } from "../../pagination";


const breadcrumbLinks = [
  { title: "transaction" },
  { title: "latest-transactions" },
];

const PAGE_SIZE_OPTIONS = [25, 50, 100];

const LatestTransactions = () => {
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(getPagination("latest_transactions") || 25);
  const [exportModal, setExportModal] = useState(false);
  const [totalPage, setTotalPage] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateError, setDateError] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });


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
      // show custom toast messages
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
    setPagination("latest_transactions", event.target.value);
  };

  const downloadCSV = async () => {
    setExportLoading(true);

    if (!startDate || !endDate) {
      setDateError("Please select both start date and end date.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = `${config.hostUrl}/api/transaction/export?startDate=${startDate}&endDate=${endDate}`;
      const resp = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (resp.status === 404) {
        setToast({
          open: true,
          message: "No transactions found between given dates",
          severity: "warning",
        });
        setExportLoading(false);
        return;
      }

      if (!resp.ok) {
        setToast({
          open: true,
          message: "Failed to fetch transactions.",
          severity: "error",
        });
        setExportLoading(false);
        return;
      }

      const { data } = await resp.json();

      if (!data || !Array.isArray(data) || data.length === 0) {
        setToast({
          open: true,
          message: "No transaction data available for export",
          severity: "warning",
        });
        setExportLoading(false);
        return;
      }

      const filteredData = data.map((item) => {
        const dt = new Date(item.datetime);
        return {
          "First name": item.studentId?.firstName || "",
          "Last name": item.studentId?.lastName || "",
          Email: item.studentId?.email || "",
          Mobile: item.studentId?.mobileNumber || "",
          Amount: item.amount || "",
          Course: item.studentId?.course || "",
          Program: item.studentId?.program || "",
          Date: dt.toLocaleDateString("en-IN"),
          Time: dt
            .toLocaleTimeString("en-IN")
            .replace("am", "AM")
            .replace("pm", "PM"),
          "Payment mode": item.paymentMode || "",
          "Payment ID": item.paymentReferenceId || "",
        };
      });

      const csv = Papa.unparse(filteredData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      const urlBlob = URL.createObjectURL(blob);
      a.href = urlBlob;
      a.download = `transactions_${new Date(startDate).toLocaleDateString("en-IN")}_to_${new Date(endDate).toLocaleDateString("en-IN")}.csv`;
      a.click();
      URL.revokeObjectURL(urlBlob);

      setToast({
        open: true,
        message: "CSV file downloaded successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error during export:", error);
      setToast({
        open: true,
        message: "Error exporting transactions",
        severity: "error",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const searchByName = async (text) => {

    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${config.hostUrl}/api/transaction/search?name=${text}`,{ method: "GET", headers: { Authorization: `Bearer ${token}`}});
      const data = await resp.json();

      if(resp.status === 200) {
        setTransactions(data.data);
        setTotalPage(1);
      } else {
        console.log("Some error while fetching data");
      }

      setSearchLoading(false);
    } catch (Err) {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (!search.trim()) {
      setSearchLoading(false);
      getTransactions(page, pageSize);
      return;
    }

    setSearchLoading(true);

    const handler = setTimeout(() => {
      searchByName(search.trim());
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  return (
    <>
      <Breadcrumbs
        custom
        heading="latest-transactions"
        links={breadcrumbLinks}
      />

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

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ mb: 2 }}
        justifyContent="space-between"
      >
        <TextField
          id="student-search"
          size="medium"
          placeholder="Search by name"
          autoComplete="off"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          sx={{ width: "35%" }}
          InputProps={{
            endAdornment: searchLoading ? (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ) : null,
          }}
        />

        <Button
          variant="outlined"
          color="primary"
          size="small"
          endIcon={<DocumentDownload size={18} />}
          onClick={() => setExportModal(true)}
        >
          Export
        </Button>
      </Stack>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableBody>
            {(transactions || []).map((row, idx) => (
                <TableRow key={row._id}>
                  <TableCell sx={{ width: 40, fontWeight: 500 }}>
                    {(page - 1) * pageSize + idx + 1}
                  </TableCell>
                  <TableCell>
                    {row.studentId?.firstName} {row.studentId?.lastName} paid ₹
                    {row.amount?.toString().toLocaleString("en-IN")} via  {row.paymentMode} mode on{" "}
                    {new Date(row.datetime).toLocaleDateString("en-IN")} at{" "}
                    {new Date(row.datetime)
                      .toLocaleTimeString("en-IN")
                      .replace("am", "AM")
                      .replace("pm", "PM")}
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

      <Modal
        title={<span style={{ color: textColor }}>Export Transactions</span>}
        styles={modalStyles}
        centered
        open={exportModal}
        onOk={() => setExportModal(false)}
        onCancel={() => {
          setStartDate(null);
          setEndDate(null);
          setExportModal(false);
        }}
        width={{
          xs: "90%",
          sm: "80%",
          md: "70%",
          lg: "60%",
          xl: "50%",
          xxl: "40%",
        }}
        zIndex={2000}
        footer={[
          <Stack
            key="footer-btn"
            direction="row"
            justifyContent="center"
            sx={{ mt: 2 }}
          >
            {exportLoading ? (
              <CircularProgress size={20} />
            ) : (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                endIcon={<DocumentDownload size={18} />}
                onClick={() => downloadCSV()}
              >
                Export
              </Button>
            )}
          </Stack>,
        ]}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack direction="row" spacing={2} sx={{ mb: 3, mt: 3 }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              format="DD/MM/YYYY"
              sx={{ zIndex: 2100 }}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  helperText: dateError && !startDate ? dateError : "",
                  error: Boolean(dateError && !startDate),
                },
                popper: { sx: { zIndex: 2100 } },
              }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  helperText: dateError && !endDate ? dateError : "",
                  error: Boolean(dateError && !endDate),
                },
                popper: { sx: { zIndex: 2100 } },
              }}
            />
          </Stack>
        </LocalizationProvider>
      </Modal>
    </>
  );
};

export default LatestTransactions;