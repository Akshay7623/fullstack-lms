import { Button, IconButton, Menu, MenuItem, Select, TableCell, TableRow, useTheme } from '@mui/material';
import { ConfigProvider, TimePicker, Popconfirm } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { More } from 'iconsax-react';
import config, { textColor } from "../../config";

const ShowLectureRow = ({ row, idx, trainerList, batchKeyName, changeTime, showToast, assignTrainer, cancelLecture, rescheduleLecture, editTopic, removeLecture, sendMail, sendNotification }) => {

  const theme = useTheme();
  const primaryMain = theme.palette.primary.main;

  const existingTime = { start: row.startTime, end: row.endTime };
  const [existingTrainerId, setExistinTrainerId] = useState(row.trainerId)
  const [time, setTime] = useState({ start: row.startTime, end: row.endTime });
  const [hours, setHours] = useState(dayjs(row.endTime, "HH:mm").diff(dayjs(row.startTime, "HH:mm"), "hour", true).toFixed(2))
  const [trainerId, setTrainerId] = useState(row.trainerId);
  const selectedTrainer = trainerList[row.courseName]?.find((t) => t._id === trainerId);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [subAnchor, setSubAnchor] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOk = async () => {
    setConfirmLoading(true);
    const ans = await changeTime(row._id, time);
    setConfirmLoading(false);

    if (ans) {
      setShowConfirm(false);
      showToast("Lecture time updated successfully.", "success");
      setHours(dayjs(time.end, "HH:mm").diff(dayjs(time.start, "HH:mm"), "hour", true).toFixed(2));
    } else {
      showToast("Could not update the time. Please try again.", "error")
    }
  };

  const hanldeTrainerAssignOk = async () => {
    setConfirmLoading(true);
    const ans = await assignTrainer(row._id, trainerId);
    setConfirmLoading(false);

    if (ans) {
      setExistinTrainerId(trainerId);
      showToast("Trainer Assigned successfully.", "success");
    } else {
      showToast("Could not assign trainer. Please try again.", "error")
    }
  };

  const handleNo = () => {
    setTime(existingTime);
    setShowConfirm(false);
  };

  useEffect(() => {
    setTime({ start: row.startTime, end: row.endTime });
    setHours(
      dayjs(row.endTime, "HH:mm").diff(dayjs(row.startTime, "HH:mm"), "hour", true).toFixed(2)
    );
    setTrainerId(row.trainerId);
    setExistinTrainerId(row.trainerId);
  }, [row]);


  if (!row) {
    return <>
    </>
  };

  console.log(row.plannedDate);

  return (

    // <Popconfirm
    //       open={new Date(row.plannedDate) < new Date()}
    //       title="Mark Lecture "
    //       description={`Mark Lecture as Completed `}
    //       onConfirm={()=>console.log("handle confirm here")}
    //       onCancel={() => console.log("handle cancallation here !")}
    //       okText="Yes"
    //       cancelText="No"
    //       styles={{
    //         body: {
    //           borderRadius: 6,
    //         },
    //       }}
    //       okButtonProps={{
    //         style: {
    //           backgroundColor: primaryMain
    //         },
    //         loading: confirmLoading
    //       }}
    //       cancelButtonProps={{
    //         style: {
    //           borderColor: primaryMain,
    //           color: primaryMain
    //         }
    //       }}
    //     >

       
    <TableRow
      key={idx}
      sx={{
        backgroundColor: row.isCancelled
          ? "#f4433642"
          : row.holidayName
            ? "#ff980052"
            : "inherit",
        "&:hover": {
          backgroundColor: row.isCancelled
            ? "#f4433642"
            : row.holidayName
              ? "#ff980052"
              : "inherit",
        },
      }}
    >
      <TableCell>
        {dayjs(row.plannedDate).format("DD-MM-YYYY")}
      </TableCell>

      <TableCell>
        <Popconfirm
          open={showConfirm}
          title="Change Time"
          description={`Change lecture time to ${dayjs(time.start, "HH:mm").format("hh:mm A")} - ${dayjs(time.end, "HH:mm").format("hh:mm A")}`}
          onConfirm={handleOk}
          onCancel={handleNo}
          okText="Yes"
          cancelText="No"
          styles={{
            body: {
              borderRadius: 6,
            },
          }}
          okButtonProps={{
            style: {
              backgroundColor: primaryMain
            },
            loading: confirmLoading
          }}
          cancelButtonProps={{
            style: {
              borderColor: primaryMain,
              color: primaryMain
            }
          }}
        >
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
                    config.mode === "dark" ? "#1D2630" : "white",
                  colorBgElevated:
                    config.mode === "dark" ? "#1D2630" : "white",
                  colorTextHeading: primaryMain,
                  controlItemBgActive: primaryMain,
                },
              },
            }}
          >
            <span>
              <TimePicker.RangePicker
                use12Hours
                defaultValue={[
                  dayjs(time.start, "HH:mm"),
                  dayjs(time.end, "HH:mm"),
                ]}
                value={[
                  dayjs(time.start, "HH:mm"),
                  dayjs(time.end, "HH:mm")
                ]}

                onOk={(value) => {
                  if (value && value[0] && value[1]) {
                    const [start, end] = value;

                    if (end.isBefore(start)) {
                      console.error("⚠️ End time is before start time!");
                      showToast("End time is before start !", "error")
                    } else {
                      const newTime = { start: start.format("HH:mm"), end: end.format("HH:mm") }
                      setTime(newTime);
                    }
                  }
                }}

                onOpenChange={(e) => {
                  if (!e) {
                    if (JSON.stringify(existingTime) !== JSON.stringify(time)) {
                      setShowConfirm(true);
                    }
                  }
                }}

                minuteStep={5}
                format="hh:mm A"
                disabled={row.isCancelled || row.holidayName}
              />
            </span>
          </ConfigProvider>
        </Popconfirm>
      </TableCell>

      <TableCell>
        {hours}
      </TableCell>

      <TableCell>{`${batchKeyName[row.batchId]?.month.slice(0, 3).toUpperCase()}${batchKeyName[row.batchId]?.year}-${batchKeyName[row.batchId]?.courseCode}-${batchKeyName[row.batchId]?.batchNo}`}</TableCell>
      <TableCell>{row.courseName}</TableCell>

      <TableCell
        sx={{
          color:
            row.holidayName || row.isCancelled ? "red" : "inherit",
        }}
      >
        {row.isCancelled
          ? `${row.lectureTopic} (Cancelled)`
          : !row.holidayName
            ? row.lectureTopic
            : row.holidayName}
      </TableCell>

      <TableCell>
        <Popconfirm
          open={existingTrainerId !== trainerId}
          title="Assign Trainer"
          description={`Assign ${selectedTrainer?.firstName} ${selectedTrainer?.lastName} as a Trainer to This Lecture `}
          onConfirm={hanldeTrainerAssignOk}
          onCancel={() => setTrainerId(existingTrainerId)}
          okText="Yes"
          cancelText="No"
          styles={{
            body: {
              borderRadius: 6,
            },
          }}
          okButtonProps={{
            style: {
              backgroundColor: primaryMain
            },
            loading: confirmLoading
          }}
          cancelButtonProps={{
            style: {
              borderColor: primaryMain,
              color: primaryMain
            }
          }}
        >
          <Select
            labelId="trainer-select"
            value={(trainerList[row.courseName] || []).some(t => t._id === trainerId) ? trainerId : ""}
            onChange={(e) => setTrainerId(e.target.value)}
            displayEmpty
            disabled={row.isCancelled || row.holidayName}

            renderValue={(selected) => {
              if (!selected) return <em>No Trainer Assigned</em>;
              const t = (trainerList[row.courseName] || []).find(tr => tr._id === selected);
              return t ? `${t.firstName} ${t.lastName}` : "";
            }}

          >
            <MenuItem value="" disabled>
              <em>No Trainer Assigned</em>
            </MenuItem>
            {(trainerList[row.courseName] || []).map((t) => (
              <MenuItem key={t._id} value={t._id}>
                {t.firstName} {t.lastName}
              </MenuItem>
            ))}
          </Select>

        </Popconfirm>
      </TableCell>

      <TableCell>
        <Button
          href={row.recordLink}
          target="_blank"
          sx={{
            textTransform: "none",
            borderBottom: "1px solid #fff",
          }}
        >
          Meet
        </Button>
      </TableCell>
      <TableCell>{row.cancellationReason || "-"}</TableCell>
      <TableCell>
        <IconButton size="small" aria-label="open menu" onClick={handleClick}>
          <More size={18} />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          <MenuItem
            onClick={() => {
              handleClose();
              if (row.holidayName) {
                // Remove holiday logic
                console.log("Removing holiday for", row._id);
                // Call API to remove holiday
                // showToast("Holiday removed successfully", "success");
              } else if (!row.isCancelled) {
                cancelLecture(row);
              }
              else {
                console.log("Rescheduling lecture for", row._id);
                rescheduleLecture(row);
                // Open reschedule flow
              }
            }}
            sx={{
              color: row.holidayName
                ? "orange"
                : row.isCancelled
                  ? "green"
                  : "red"
            }}
          >
            {row.holidayName
              ? "Remove Holiday"
              : row.isCancelled
                ? "Reschedule Lecture"
                : "Cancel Lecture"}
          </MenuItem>

          {!row.holidayName && !row.isCancelled &&
            <MenuItem onClick={() => {
              if (!row.holidayName && !row.isCancelled) {
                handleClose();
                editTopic(row._id, row.lectureTopic);
              }
            }}>
              Edit Topic
            </MenuItem>
          }

          <MenuItem onClick={() => {
            handleClose();
            sendNotification(row.isCancelled, row._id);
          }}>
            Send Notification
          </MenuItem>

          {
            row.isCancelled &&
            <MenuItem onClick={() => {
              handleClose();
              removeLecture(row._id);
            }}>
              Remove
            </MenuItem>
          }

          <MenuItem
            onMouseEnter={(e) => setSubAnchor(e.currentTarget)}
            onClick={(e) => setSubAnchor(e.currentTarget)}
          >
            Send Email →
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={subAnchor}
          open={Boolean(subAnchor)}
          onClose={() => setSubAnchor(null)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          MenuListProps={{
            onMouseLeave: () => setSubAnchor(null)
          }}
        >
          <MenuItem onClick={() => {
            handleClose();
            sendMail(row._id, "student");
          }}>Student</MenuItem>
          <MenuItem onClick={() => {
            if (!row.trainerId) {
              return showToast("Trainer not assigned", "warning");
            }
            handleClose();
            sendMail(row._id, "trainer")
          }}>Trainer</MenuItem>
          <MenuItem onClick={() => {
            handleClose();
            sendMail(row._id, "both");
          }}>Trainer + Student</MenuItem>
        </Menu>
      </TableCell>
    </TableRow>

    //  </Popconfirm>
  )
}

export default ShowLectureRow