import { TableCell, TableRow, Select, MenuItem, Button } from "@mui/material";
import { Stack } from "@mui/system";
import { TickCircle, Trash } from "iconsax-react";
import { useState } from "react";

const PendingStudentRow = ({ row, confirmAction, courses }) => {
  const [studentData, setStudentData] = useState(row);

  const hanldeCourseChange = (event) => {
    setStudentData({
      ...studentData,
      courseId: event.target.value,
    });
  };

  const handleProgramChange = (event) => {
    setStudentData({ ...studentData, program: event.target.value });
  };

  return (
    <TableRow>
      <TableCell>
        {new Date(studentData.registrationDate).toLocaleDateString("en-IN")}
      </TableCell>

      <TableCell>
        {studentData.firstName} {studentData.lastName}
      </TableCell>

      <TableCell>{studentData.mobileNumber}</TableCell>

      <TableCell>
        <Select value={studentData.courseId} onChange={hanldeCourseChange}>
          {(courses || []).map((c) => {
            return (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            );
          })}
        </Select>
      </TableCell>
      <TableCell>
        <Select value={studentData.program} onChange={handleProgramChange}>
          <MenuItem value="certification">Certification</MenuItem>
          <MenuItem value="diploma">Diploma</MenuItem>
          <MenuItem value="master diploma">Master Diploma</MenuItem>
        </Select>
      </TableCell>

      <TableCell>
        <Stack>₹{studentData.paid.toLocaleString("en-IN")}</Stack>
      </TableCell>
      <TableCell>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => confirmAction("approve", row._id, studentData)}
          endIcon={<TickCircle size={18} />}
        >
          CONFIRM
        </Button>
      </TableCell>

      <TableCell>
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={() => confirmAction("reject", row._id, studentData)}
          endIcon={<Trash size={18} />}
        >
          REJECT 
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default PendingStudentRow;
