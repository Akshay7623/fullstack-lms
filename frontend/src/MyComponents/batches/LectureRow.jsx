import debounce from "lodash.debounce";
import { useState, useMemo, useEffect } from "react";
import { TableRow, TableCell, Typography, TextField, Button, Select, MenuItem, IconButton } from "@mui/material";
import { CloseCircle } from "iconsax-react";
import { DatePicker, TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";

function LectureRow({
  id,
  index,
  initialRow,
  topicList,
  trainerList,
  onUpdate,
  onRemove,
  onScheduleLecture,
}) {
  const [row, setRow] = useState(initialRow);

  // Debounced onUpdate to parent

  const debouncedOnUpdate = useMemo(
    () =>
      debounce((idx, updatedRow) => {
        onUpdate(id, updatedRow);
      }, 300),
    [onUpdate]
  );

  useEffect(() => {
    return () => {
      debouncedOnUpdate.cancel();
    };
  }, [debouncedOnUpdate]);

  const isHoliday = !!row.holidayName;

  const handleUpdate = (field, value) => {
    const updatedRow = { ...row, [field]: value };
    setRow(updatedRow);
    debouncedOnUpdate(id, updatedRow);
  };

  const scheduleLecture = () => {
    onScheduleLecture(id);
  };

  return (
    <TableRow
      style={{
        backgroundColor: isHoliday ? "rgb(160 86 86 / 23%)" : "inherit",
      }}
    >
      <TableCell>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            value={row.date}
            onChange={(newDate) => handleUpdate("date", newDate)}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                sx: { width: 140 },
              },
              popper: { sx: { zIndex: 2100 } },
            }}
            disablePast
            format="dd/MM/yyyy"
          />
        </LocalizationProvider>

        {isHoliday && (
          <>
            <br />
            <Typography variant="caption" color="error">
              &nbsp; {row.holidayName}
            </Typography>
            <br />
            <Button
              variant="outlined"
              size="small"
              onClick={scheduleLecture}
              sx={{ mt: 1 }}
            >
              Schedule Lecture
            </Button>
          </>
        )}
      </TableCell>

      <TableCell>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <TimePicker
            label="Start Time"
            value={row.startTime}
            onChange={(time) => handleUpdate("startTime", time)}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                sx: { width: 140 },
              },
              popper: { sx: { zIndex: 2100 } },
            }}
          />
        </LocalizationProvider>
      </TableCell>

      <TableCell>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <TimePicker
            label="End Time"
            value={row.endTime}
            onChange={(time) => handleUpdate("endTime", time)}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                sx: { width: 140 },
              },
              popper: { sx: { zIndex: 2100 } },
            }}
          />
        </LocalizationProvider>
      </TableCell>

      <TableCell>
        <TextField
          value={row.topic}
          onChange={(e) => handleUpdate("topic", e.target.value)}
          size="small"
          autoComplete="off"
          sx={{ width: 240 }}
        />
      </TableCell>

      <TableCell>
        <Select
          value={row.trainer}
          onChange={(e) => handleUpdate("trainer", e.target.value)}
          size="small"
          fullWidth
          displayEmpty
          sx={{ minWidth: 120 }}
          MenuProps={{
            disablePortal: true,
            PaperProps: { sx: { zIndex: 2100 } },
          }}
        >
          <MenuItem value="">
            <em>Select Trainer</em>
          </MenuItem>
          {(trainerList || []).map((t) => (
            <MenuItem key={t._id} value={t._id}>
              {t.firstName} {t.lastName}
            </MenuItem>
          ))}
        </Select>
      </TableCell>

      <TableCell>
        <IconButton color="error" onClick={() => onRemove(id)}>
          <CloseCircle size={18} />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

export default LectureRow;