import React, { useMemo, useState } from "react";
import { Table, Select, Popconfirm, TimePicker, Button, Dropdown, message, ConfigProvider, DatePicker } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { Button as MuiButton } from "@mui/material";
import dayjs from "dayjs";
import classNames from "classnames";
import config, { bgColor, textColor } from "../../config"
import { useTheme } from "@mui/material";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from "dayjs/plugin/timezone";

dayjs.extend(customParseFormat);
dayjs.extend(timezone);

const TrainerCell = React.memo(function TrainerCell({
  row,
  trainerState,
  showTrainerConfirm,
  trainerList,
  assignTrainer,
  setTrainerState,
  setShowTrainerConfirm,
  confirmLoading,
  primaryMain,
  showToast
}) {
  const key = row._id;
  const value = trainerState[key] ?? row.trainerId;
  const showConfirm = showTrainerConfirm[key];
  const trainers = trainerList[row.courseName] || [];
  const selectedTrainer = trainers.find((t) => t._id === value);

  return (
    <>
      {showConfirm ? (
        <Popconfirm
          title="Assign Trainer"
          open={showConfirm}
          description={
            selectedTrainer
              ? `Assign ${selectedTrainer.firstName} ${selectedTrainer.lastName} as Trainer?`
              : "Assign Trainer"
          }
          okText="Yes"
          cancelText="No"
          onConfirm={async () => {
            const ans = await assignTrainer(row._id, value);

            if (ans) {
              showToast("Trainer assigned successfully.", "success");
            } else {
              showToast("Could not assign trainer. Please try again.", "error");
            }
            setShowTrainerConfirm((s) => ({ ...s, [key]: false }));
          }}
          onCancel={() => {
            setTrainerState((s) => ({ ...s, [key]: row.trainerId }));
            setShowTrainerConfirm((s) => ({ ...s, [key]: false }));
          }}
          okButtonProps={{
            style: { backgroundColor: primaryMain },
            loading: confirmLoading
          }}
          cancelButtonProps={{
            style: { borderColor: primaryMain, color: primaryMain }
          }}
        >
          <span />
        </Popconfirm>
      ) : null}

      <Select
        value={value}
        style={{ minWidth: 120 }}
        onChange={(newVal) => {
          setTrainerState((s) => ({ ...s, [key]: newVal }));
          if (newVal !== row.trainerId && newVal !== undefined) {
            setShowTrainerConfirm((s) => ({ ...s, [key]: true }));
          } else {
            setShowTrainerConfirm((s) => ({ ...s, [key]: false }));
          }
        }}
        disabled={row.isCancelled || row.holidayName}
        placeholder="No Trainer Assigned"
        allowClear
        popupMatchSelectWidth={false}
        className={
          config.mode === "dark"
            ? "lecture-trainer-select-dark"
            : "lecture-trainer-select-light"
        }
      >
        {trainers.map((tr) => (
          <Select.Option key={tr._id} value={tr._id}>
            {tr.firstName} {tr.lastName}
          </Select.Option>
        ))}
      </Select>
    </>
  );
});

const ActionsCell = React.memo(
  ({
    row,
    primaryMain,
    cancelLecture,
    editTopic,
    sendNotification,
    removeLecture,
    rescheduleLecture,
    sendMail,
  }) => {

    const menuItems = useMemo(() => {

      return [
        {
          key: "cancel",
          label: row.holidayName
            ? "Remove Holiday"
            : row.isCancelled
              ? "Reschedule Lecture"
              : "Cancel Lecture",
          onClick: () => {
            if (row.holidayName) {
              // holiday removal logic
            } else if (!row.isCancelled) {
              cancelLecture(row);
            } else {
              rescheduleLecture(row);
            }
          },
          style: {
            color: row.holidayName
              ? "orange"
              : row.isCancelled
                ? "green"
                : "red",
          },
        },
        ...(!row.holidayName && !row.isCancelled
          ? [
            {
              key: "edit",
              label: "Edit Topic",
              onClick: () => editTopic(row._id, row.lectureTopic),
            },
          ]
          : []),
        {
          key: "notify",
          label: "Send Notification",
          onClick: () => sendNotification(row.isCancelled, row._id),
        },
        ...(row.isCancelled
          ? [
            {
              key: "remove",
              label: "Remove",
              onClick: () => removeLecture(row._id),
            },
          ]
          : []),
        {
          key: "sendMail",
          label: "Send Email",
          children: [
            {
              key: "student",
              label: "Student",
              onClick: () => sendMail(row._id, "student"),
            },
            {
              key: "trainer",
              label: "Trainer",
              onClick: () => {
                if (!row.trainerId) {
                  return message.warning("Trainer not assigned");
                }
                sendMail(row._id, "trainer");
              },
            },
            {
              key: "both",
              label: "Trainer + Student",
              onClick: () => sendMail(row._id, "both"),
            },
          ],
        },
      ];
    }, [
      row,
      cancelLecture,
      editTopic,
      sendNotification,
      removeLecture,
      rescheduleLecture,
      sendMail,
    ]);

    return (
      <ConfigProvider
        theme={{
          token: {
            colorBgElevated: bgColor,
            colorText: textColor,
            colorPrimary: primaryMain,
            colorBgContainer: bgColor,
          },
        }}
      >
        <Dropdown menu={{ items: menuItems }} trigger={["click"]} destroyOnClose>
          <Button color={primaryMain} icon={<MoreOutlined />} />
        </Dropdown>
      </ConfigProvider>
    );
  }
);

const AntTable = ({
  rows,
  trainerList,
  batchKeyName,
  changeTime,
  assignTrainer,
  cancelLecture,
  rescheduleLecture,
  editTopic,
  removeLecture,
  sendMail,
  sendNotification,
  changeDate,
  showToast,
  markCompleted
}) => {
  const [timeState, setTimeState] = useState({});
  const [editingDateRowId, setEditingDateRowId] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [trainerState, setTrainerState] = useState({});
  const [showTrainerConfirm, setShowTrainerConfirm] = useState({});
  const [pendingDate, setPendingDate] = useState(null);
  const [showConfirmDate, setShowConfirmDate] = useState({});

  const theme = useTheme();
  const primaryMain = theme.palette.primary.main;
  const getKey = (row) => row._id || row.key;

  const columns = [
    {
      title: "Planned Date",
      dataIndex: "plannedDate",
      fixed: "left",
      render: (date, row) => {
        const dateFormat = "DD-MM-YYYY";
        const indianDate = dayjs(date).tz("Asia/Kolkata").startOf("day");

        if (editingDateRowId === row._id) {

          return (<>
            <ConfigProvider
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
                  },
                },
              }}
            >
              <DatePicker
                autoFocus
                defaultValue={indianDate}
                format={dateFormat}
                onChange={async (newDate) => {

                  if (!newDate) return;
                  setPendingDate(newDate);
                  setShowConfirmDate((s) => ({ ...s, [row._id]: true }));
                  setEditingDateRowId(null);
                }}

                disabled={row.isCancelled || row.holidayName}
              />
            </ConfigProvider>
          </>
          );
        }

        return (
          <>          {showConfirmDate[row._id] ? (
            <Popconfirm
              zIndex={2000}
              title="Change Lecture Date"
              description={`Change lecture date to ${dayjs(pendingDate).format(
                dateFormat
              )}?`}
              open={showConfirmDate[row._id]}
              okText="Yes"
              cancelText="No"
              okButtonProps={{
                style: { backgroundColor: primaryMain },
                loading: confirmLoading,
              }}
              cancelButtonProps={{
                style: { borderColor: primaryMain, color: primaryMain },
              }}
              onConfirm={async () => {
                setConfirmLoading(true);
                const ans = await changeDate(row._id, pendingDate.$d);
                setConfirmLoading(false);

                if (ans) {
                  showToast("Lecture date updated successfully", "success");
                  row.plannedDate = pendingDate;
                } else {
                  showToast("Failed to update lecture date", "error");
                }

                setShowConfirmDate((s) => ({ ...s, [row._id]: false }));
                setEditingDateRowId(null);
                setPendingDate(null);
              }}
              onCancel={() => {
                setShowConfirmDate((s) => ({ ...s, [row._id]: false }));
                setEditingDateRowId(null);
                setPendingDate(null);
              }}
            >
              <span />
            </Popconfirm>
          ) : null}
            <span
              style={{ cursor: "pointer", color: primaryMain, userSelect: "none" }}
              onClick={() => setEditingDateRowId(row._id)}
              className="p-1 mr-[4rem]"
            >
              {indianDate.format(dateFormat)}
            </span>
          </>
        );
      },
    },
    {
      title: "Time",
      dataIndex: "times",
      fixed: 'left',
      width: 250,
      render: (text, row) => {
        const key = getKey(row);
        const value = timeState[key] || { start: row.startTime, end: row.endTime };

        const showConfirm = () => {
          if (timeState[key]) {
            if (row.startTime !== timeState[key].start || row.endTime !== timeState[key].end) {
              return true;
            } else {
              return false;
            }
          }
        }

        return (
          <>
            {showConfirm ? (
              <Popconfirm
                title="Change Time"
                open={showConfirm()}
                description={`Change lecture time to ${dayjs(value.start, "HH:mm").format("hh:mm A")} - ${dayjs(value.end, "HH:mm").format("hh:mm A")}`}
                okText="Yes"
                cancelText="No"
                onConfirm={async () => {
                  setConfirmLoading(true);
                  const ans = await changeTime(row._id, value);
                  setConfirmLoading(false);
                  if (ans) {
                    timeState[key] = undefined;
                    row.startTime = value.start;
                    row.endTime = value.end;
                    showToast("Lecture time updated successfully.", "success");
                  } else {
                    timeState[key] = undefined;
                    showToast("Could not update the time. Please try again.", "error");
                  }
                }}
                styles={{
                  body: {
                    borderRadius: 6,
                  },
                }}
                onCancel={() => {
                  setTimeState((s) => ({ ...s, [key]: { start: row.startTime, end: row.endTime } }));
                }}
                okButtonProps={{
                  style: {
                    backgroundColor: primaryMain
                  }, loading: confirmLoading
                }}

                cancelButtonProps={{
                  style: {
                    borderColor: primaryMain,
                    color: primaryMain
                  }
                }}
              >
                <span />
              </Popconfirm>
            ) : null}

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
              <span>
                <TimePicker.RangePicker
                  use12Hours

                  defaultValue={[
                    dayjs(value.start, "HH:mm"),
                    dayjs(value.end, "HH:mm"),
                  ]}

                  value={[
                    dayjs(value.start, "HH:mm"),
                    dayjs(value.end, "HH:mm")
                  ]}

                  onChange={(values) => {
                    if (values && values && values[1]) {
                      const [start, end] = values;

                      if (end.isBefore(start)) {
                        showToast("End time is before start", "error");
                      } else {
                        setTimeState((s) => ({
                          ...s,
                          [key]: {
                            start: start.format("HH:mm"),
                            end: end.format("HH:mm"),
                          },
                        }));
                      }
                    }
                  }}


                  minuteStep={5}
                  format="hh:mm A"
                  disabled={row.isCancelled || row.holidayName}
                />
              </span>
            </ConfigProvider>


          </>
        );
      },
    },
    {
      title: "Hours",
      dataIndex: "hours",
      render: (text, row) => {
        const from = dayjs(row.startTime, "HH:mm");
        const to = dayjs(row.endTime, "HH:mm");
        return to.diff(from, "hour", true).toFixed(2);
      },
    },
    {
      title: "Batch",
      dataIndex: "batch",
      render: (text, row) =>
        `${batchKeyName[row.batchId]?.month.slice(0, 3).toUpperCase()}${batchKeyName[row.batchId]?.year}-${batchKeyName[row.batchId]?.courseCode}-${batchKeyName[row.batchId]?.batchNo}`,
    },
    {
      title: "Course Name",
      dataIndex: "courseName",
    },
    {
      title: "Topic",
      dataIndex: "lectureTopic",
      render: (text, row) =>
        row.isCancelled
          ? `${row.lectureTopic} (Cancelled)`
          : row.holidayName
            ? row.holidayName
            : row.lectureTopic,
    },
    {
      title: "Trainer",
      dataIndex: "trainerId",
      render: (_, row) => {

        return (
          <TrainerCell
            row={row}
            trainerState={trainerState}
            showTrainerConfirm={showTrainerConfirm}
            trainerList={trainerList}
            assignTrainer={assignTrainer}
            setTrainerState={setTrainerState}
            setShowTrainerConfirm={setShowTrainerConfirm}
            confirmLoading={confirmLoading}
            primaryMain={primaryMain}
            config={config}
            showToast={showToast}
          />
        );
      },
    },
    {
      title: "Meet",
      dataIndex: "recordLink",
      width: 100,
      render: (link) =>
        link ? (
          <Button type="link" href={link} target="_blank">
            Meet
          </Button>
        ) : (
          "-"
        ),
    },
    {
      title: "Cancellation Reason",
      dataIndex: "cancellationReason",
      width: 210,
      render: (text) => text || "-",
    },
    {
      title: "Mark As",
      dataIndex: "markAs",
      render: (_, row) => {
        if(row.status === "completed") {
          return <MuiButton disabled>Completed</MuiButton>
        }
        if (new Date().setHours(0, 0, 0, 0) > new Date(row.plannedDate).setHours(0, 0, 0, 0) && !row.isCancelled) {
          return <MuiButton onClick={()=>markCompleted(row)} >Mark Completed</MuiButton>
        }
      }
    },
    {
      title: "Actions",
      dataIndex: "actions",
      fixed: 'right',
      render: (_, row) => {
        return <ActionsCell
          row={row}
          primaryMain={primaryMain}
          cancelLecture={cancelLecture}
          editTopic={editTopic}
          sendNotification={sendNotification}
          removeLecture={removeLecture}
          rescheduleLecture={rescheduleLecture}
          sendMail={sendMail} />
      },
    }
  ];

  // Conditional row styling
  const rowClassName = (row) =>
    classNames({
      "ant-table-row-cancelled": row.isCancelled,
      "ant-table-row-holiday": row.holidayName,
    });

  // Don't forget to add corresponding CSS
  // .ant-table-row-cancelled { background: #f4433642 !important; }
  // .ant-table-row-holiday { background: #ff980052 !important; }

  return (
    <Table
      columns={columns}
      dataSource={rows}
      rowKey={getKey}
      rowClassName={rowClassName}
      pagination={false}
      // bordered
      scroll={{ x: "max-content" }}
      rowHoverable={false}
      className={config.mode === "dark" ? "dark-theme-table" : "light-theme-table" + ' lecture-table'}
      style={{ color: textColor }}
    />
  );
};

export default AntTable;
