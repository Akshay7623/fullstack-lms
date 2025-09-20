import { Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Paper,Pagination,Select,MenuItem,FormControl,InputLabel,Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { useEffect, useState } from "react";
import config from "../../config";
import { setPagination, getPagination } from '../../../pagination';

const dummyData = [
  {
    id: 1,
    trainer: "John Doe",
    topic: "React Basics",
    date: "2024-06-01",
    amount: 2000,
    reference: "2024-06-01 10:15 AM",
  },
  {
    id: 2,
    trainer: "Jane Smith",
    topic: "Node.js Intro",
    date: "2024-06-03",
    amount: 2500,
    reference: "2024-06-03 09:30 AM",
  },
  {
    id: 3,
    trainer: "Amit Patel",
    topic: "Python Advanced",
    date: "2024-06-05",
    amount: 3000,
    reference: "2024-06-05 02:45 PM",
  },
  {
    id: 4,
    trainer: "Sara Lee",
    topic: "UI/UX Design",
    date: "2024-06-07",
    amount: 1800,
    reference: "2024-06-07 11:00 AM",
  },
  {
    id: 5,
    trainer: "Mohit Sharma",
    topic: "C Programming",
    date: "2024-06-09",
    amount: 2200,
    reference: "2024-06-09 04:20 PM",
  },
  {
    id: 6,
    trainer: "Emily Clark",
    topic: "SEO Fundamentals",
    date: "2024-06-10",
    amount: 2100,
    reference: "2024-06-10 01:10 PM",
  },
  {
    id: 7,
    trainer: "Priya Singh",
    topic: "Bootstrap 5",
    date: "2024-06-11",
    amount: 1900,
    reference: "2024-06-11 03:00 PM",
  },
  {
    id: 8,
    trainer: "Rahul Verma",
    topic: "JavaScript ES6",
    date: "2024-06-12",
    amount: 2300,
    reference: "2024-06-12 10:40 AM",
  },
  {
    id: 9,
    trainer: "Anjali Mehra",
    topic: "PHP Advanced",
    date: "2024-06-13",
    amount: 2600,
    reference: "2024-06-13 12:30 PM",
  },
  {
    id: 10,
    trainer: "Vikram Patel",
    topic: "Data Structures",
    date: "2024-06-14",
    amount: 2400,
    reference: "2024-06-14 09:50 AM",
  },
  {
    id: 11,
    trainer: "Sneha Kapoor",
    topic: "HTML & CSS",
    date: "2024-06-15",
    amount: 1700,
    reference: "2024-06-15 11:25 AM",
  },
  {
    id: 12,
    trainer: "Rohit Sinha",
    topic: "Django Basics",
    date: "2024-06-16",
    amount: 2800,
    reference: "2024-06-16 02:00 PM",
  },
  {
    id: 13,
    trainer: "Meera Nair",
    topic: "React Hooks",
    date: "2024-06-17",
    amount: 2100,
    reference: "2024-06-17 03:30 PM",
  },
  {
    id: 14,
    trainer: "Arjun Rao",
    topic: "Node.js APIs",
    date: "2024-06-18",
    amount: 2500,
    reference: "2024-06-18 10:10 AM",
  },
  {
    id: 15,
    trainer: "Divya Joshi",
    topic: "Python for Data Science",
    date: "2024-06-19",
    amount: 3200,
    reference: "2024-06-19 01:45 PM",
  },
  {
    id: 16,
    trainer: "Karan Malhotra",
    topic: "MongoDB Essentials",
    date: "2024-06-20",
    amount: 2000,
    reference: "2024-06-20 11:55 AM",
  },
  {
    id: 17,
    trainer: "Asha Menon",
    topic: "Express.js",
    date: "2024-06-21",
    amount: 2200,
    reference: "2024-06-21 09:20 AM",
  },
  {
    id: 18,
    trainer: "Suresh Kumar",
    topic: "Laravel Basics",
    date: "2024-06-22",
    amount: 2700,
    reference: "2024-06-22 04:10 PM",
  },
  {
    id: 19,
    trainer: "Neha Gupta",
    topic: "Angular Fundamentals",
    date: "2024-06-23",
    amount: 2600,
    reference: "2024-06-23 12:05 PM",
  },
  {
    id: 20,
    trainer: "Amitabh Roy",
    topic: "Vue.js Introduction",
    date: "2024-06-24",
    amount: 2100,
    reference: "2024-06-24 03:15 PM",
  },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const SettledPayments = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(getPagination("settled_payment") || 10);
  const [payments, setPayments] = useState([]);
  const [totalPage, setTotalPage] = useState(10);


  const handlePageChange = (value) => {
    setPage(value);
    // getSettledPayments(value,pageSize);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1);
    setPagination('settled_payment', event.target.value);
    //call this after backend integration
    //getSettledPayments(1,event.target.value);
  };

  const getSettledPayments = async (page, pageSize) => {
    const token = localStorage.getItem("token");

    try {
      const url = `${config.hostUrl}/api/settled-payments?page=${page}&pageSize=${pageSize}`;
      const resp = await fetch(url, {
        method: "get",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await resp.json();
      console.log("final output data is ", data);
    } catch (Err) {
      console.log("Error while fetching data", Err);
      // throw toast error for better user experience
    }
  };

  useEffect(() => {
    setPayments(dummyData);
    // call getSettledPayments function after getting data set to state variable
  }, []);

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Trainer Name</TableCell>
              <TableCell>Lecture Topic</TableCell>
              <TableCell>Lecture Date</TableCell>
              <TableCell>Amount Due</TableCell>
              <TableCell>Reference</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.length > 0 &&
              payments.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.trainer}</TableCell>
                  <TableCell>{row.topic}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>₹{row.amount.toLocaleString("en-IN")}</TableCell>
                  <TableCell>
                    <Typography color="primary" fontWeight={500}>
                      {row.reference}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}

            <TableRow>
              <TableCell colSpan={3} />
              <TableCell sx={{ fontWeight: "bold" }}>
                Total: ₹
                {dummyData
                  .reduce((sum, row) => sum + row.amount, 0)
                  .toLocaleString("en-IN")}
              </TableCell>
              <TableCell />
            </TableRow>
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
    </>
  );
};

export default SettledPayments;
