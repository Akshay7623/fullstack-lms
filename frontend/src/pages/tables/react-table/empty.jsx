import PropTypes from "prop-types";
import { useMemo, useState } from "react";

// material-ui
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { Add, SearchNormal1 } from "iconsax-react";
import { Link } from "react-router-dom";

// third-party
import {
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  flexRender,
  useReactTable,
} from "@tanstack/react-table";

// project-imports
import MainCard from "components/MainCard";
import {
  CSVExport,
  DebouncedInput,
  EmptyTable,
  Filter,
} from "components/third-party/react-table";
import makeData from "data/react-table";
import Grid from "@mui/material/Grid2";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

function ReactTable({ columns, data }) {
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [enrolledDate, setEnrolledDate] = useState("all_time");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const hanldeEnrolledDate = (e) => {
    setEnrolledDate(e.target.value);
  };

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, globalFilter },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleSearch = () => {
    console.log("searching....");
  };

  let headers = [];
  return (
    <MainCard content={false}>
      <Grid container spacing={0}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ m: 2, gap: 1 }}>
            <InputLabel id="search">Search</InputLabel>
            <DebouncedInput
              name="search"
              value={globalFilter ?? ""}
              onFilterChange={(value) => setGlobalFilter(String(value))}
              placeholder={`Search by name, email or mobile`}
              autoComplete="off"
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ m: 2, gap: 1 }}>
            <InputLabel id="batch-select">Batch</InputLabel>
            <Select labelId="batch-select" name="batch" autoComplete="new">
              <MenuItem value="course1">Batch1</MenuItem>
              <MenuItem value="course2">Batch2</MenuItem>
              <MenuItem value="course3">Batch3</MenuItem>
              <MenuItem value="course4">Batch4</MenuItem>
            </Select>
          </Stack>
        </Grid>

        <Grid size={{ xs: 6, sm: 6 }}>
          <Stack sx={{ mx: 2, gap: 1, mb: 2 }}>
            <InputLabel id="course-select">Course</InputLabel>
            <Select labelId="course-select" name="course" autoComplete="new">
              <MenuItem value="course1">course1</MenuItem>
              <MenuItem value="course2">course2</MenuItem>
              <MenuItem value="course3">course3</MenuItem>
              <MenuItem value="course4">course4</MenuItem>
            </Select>
          </Stack>
        </Grid>

        <Grid size={{ xs: 6, sm: 6 }}>
          <Stack sx={{ mx: 2, gap: 1, mb: 2 }}>
            <InputLabel id="course-select">Enrolled Date</InputLabel>
            <Select
              labelId="course-select"
              name="course"
              autoComplete="new"
              onChange={hanldeEnrolledDate}
              value={enrolledDate}
            >
              <MenuItem value="" disabled>
                Select Enrolled Date
              </MenuItem>
              <MenuItem value="yesterday">Yesterday</MenuItem>
              <MenuItem value="last_7_days">Last 7 days</MenuItem>
              <MenuItem value="last_30_days">Last 30 days</MenuItem>
              <MenuItem value="this_month">This month</MenuItem>
              <MenuItem value="last_month">Last month</MenuItem>
              <MenuItem value="this_year">This year</MenuItem>
              <MenuItem value="last_year">Last year</MenuItem>
              <MenuItem value="all_time">All time</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>

            {enrolledDate === "custom" && (
              <div style={{ marginTop: "10px" }}>
                <label>Start Date: </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Start Date"
                />
                <label style={{ marginLeft: "10px" }}>End Date: </label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  placeholderText="End Date"
                />
              </div>
            )}
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
                size="large"
                component={Link}
                onClick={handleSearch}
              >
                Search
              </Button>
              <CSVExport
                {...{
                  data: table
                    .getSelectedRowModel()
                    .flatRows.map((row) => row.original),
                  headers,
                  filename: "student-list.csv",
                }}
              />
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
                startIcon={<Add />}
                size="large"
                component={Link}
                to={"/student/add"}
              >
                Add Student
              </Button>
              <Button
                size="large"
                variant="outlined"
                component={Link}
                to={"/admin-panel/online-course/student/applied"}
              >
                Applied Student List
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id} {...header.column.columnDef.meta}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id} {...header.column.columnDef.meta}>
                    {header.column.getCanFilter() && (
                      <Filter column={header.column} table={table} />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow
                sx={{ "&.MuiTableRow-root:hover": { bgcolor: "transparent" } }}
              >
                <TableCell colSpan={table.getAllColumns().length}>
                  <EmptyTable msg="No Data" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            {table.getFooterGroups().map((footerGroup) => (
              <TableRow key={footerGroup.id}>
                {footerGroup.headers.map((footer) => (
                  <TableCell key={footer.id} {...footer.column.columnDef.meta}>
                    {footer.isPlaceholder
                      ? null
                      : flexRender(
                          footer.column.columnDef.header,
                          footer.getContext()
                        )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableFooter>
        </Table>
      </TableContainer>
    </MainCard>
  );
}

export default function EmptyReactTable() {
  const data = useMemo(() => makeData(0), []);

  const columns = useMemo(
    () => [
      {
        header: "Admission Date",
        footer: "Admission Date",
        accessorKey: "Admission Date",
      },
      {
        header: "Name",
        footer: "Name",
        accessorKey: "name",
      },
      {
        header: "Contact",
        footer: "Contact",
        accessorKey: "contact",
      },
      {
        header: "Course",
        footer: "Course",
        accessorKey: "course",
      },
      {
        header: "Onboarding",
        footer: "Onboarding",
        accessorKey: "Onboarding",
      },
      {
        header: "Payment",
        footer: "Payment",
        accessorKey: "payment",
      },
      {
        header: "Actions",
        footer: "Actions",
        accessorKey: "actions",
      },
    ],
    []
  );

  return <ReactTable columns={columns} data={data} />;
}

ReactTable.propTypes = { columns: PropTypes.array, data: PropTypes.array };
