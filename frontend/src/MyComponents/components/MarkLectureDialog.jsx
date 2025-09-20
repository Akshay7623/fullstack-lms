
import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, Typography, Stack, TextField, DialogActions, Button } from "@mui/material";
import { ConfigProvider, TimePicker } from "antd";
import config, { textColor } from "../../config";
import dayjs from "dayjs";

function getTotalHours(startTime, endTime) {
  const start = dayjs(startTime, "HH:mm");
  let end = dayjs(endTime, "HH:mm");
  if (end.isBefore(start)) end = end.add(1, "day");
  const duration = end.diff(start, "minute");
  return (duration / 60).toFixed(2);
}

const MarkLectureDialog = ({
  primaryMain,
  open,
  onClose,
  trainerName,
  lectureDate,
  startTime,
  endTime,
  onConfirm,
}) => {
  const [start, setStart] = useState(dayjs(startTime, "HH:mm"));
  const [end, setEnd] = useState(dayjs(endTime, "HH:mm"));
  const hours = getTotalHours(start, end);

  useEffect(() => {
    setStart(dayjs(startTime, "HH:mm"));
    setEnd(dayjs(endTime, "HH:mm"));
  }, [startTime, endTime]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Mark Lecture as completed</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography>
            <b>Trainer:</b> {trainerName || "-"}
          </Typography>
          <Typography>
            <b>Date:</b> {dayjs(lectureDate).format("DD-MM-YYYY")}
          </Typography>
          <Typography>
            <b>Total Hours:</b> {hours}
          </Typography>
          <Typography>
            <b>Time:</b>
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: primaryMain,
                },
                components: {
                  DatePicker: {
                    colorPrimary: primaryMain,
                    borderRadius: 6,
                    colorText: textColor,
                    colorTextPlaceholder: primaryMain,
                    colorBgContainer:
                      config.mode === "dark" ? "#1D2630" : "transparent",
                    colorBgElevated:
                      config.mode === "dark" ? "#1D2630" : "white",
                    colorTextHeading: primaryMain,
                    controlItemBgActive: primaryMain,
                  },
                },
              }}
            >
              <TimePicker.RangePicker
                use12Hours
                defaultValue={[
                  dayjs(start, "HH:mm"),
                  dayjs(end, "HH:mm"),
                ]}

                value={[
                  dayjs(start, "HH:mm"),
                  dayjs(end, "HH:mm")
                ]}

                onChange={(values) => {
                  if (values && values && values[1]) {
                    const [s, e] = values;
                    setStart(s);
                    setEnd(e);
                  }
                }}
                minuteStep={5}
                format="hh:mm A"
              />

            </ConfigProvider>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => onConfirm && onConfirm([start, end])}
          disabled={!start || !end}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MarkLectureDialog;