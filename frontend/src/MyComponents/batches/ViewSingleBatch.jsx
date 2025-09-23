import { useParams } from "react-router";
import {
    Table,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Pagination,
    Dialog,
    DialogTitle,
    DialogActions,
    Chip,
    Autocomplete,
    CardContent,
    Card,
    CircularProgress,
} from "@mui/material";
import { useCallback, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import { ConfigProvider, Empty, Modal } from "antd";
import { useEffect, useState } from "react";
import enGB from "antd/locale/en_GB";
import { DatePicker } from "antd";
import axios from "axios";
import { Stack } from "@mui/system";
import { CloseCircle, SearchNormal1, TagCross, Send2, TextItalic, TextUnderline, Code, Link as LinkIcon, AddCircle } from "iconsax-react";
import { Tooltip } from '@mui/material';
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { TextBold } from 'iconsax-react';
import { List as BulletListIcon, ListOrdered as OrderedListIcon, Strikethrough } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import duration from "dayjs/plugin/duration";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from '@tiptap/starter-kit'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Blockquote from '@tiptap/extension-blockquote'
import CodeBlock from '@tiptap/extension-code-block'
import HardBreak from '@tiptap/extension-hard-break'
import Heading from "@tiptap/extension-heading";
import getBatches from "../utils/api/getBatches";
import getCourses from "../utils/api/getCourses";
import getTrainers from "../utils/api/getTrainers";
import Logo from '../images/unnamed.png'
import HeadingSelector from "./HeadingSelector";
import config, { modalStyles, textColor, bgColor } from "../../config";
import buildEmailHtml from '../utils/emailWrapperCss';
import LectureSkeleton from "./LectureSkeleton";
import RescheduleDialog from '../components/RescheduleDialog';
import EditTopicDialog from "../components/EditTopic";
import CancelDialog from "../components/CancelDialog";
import AddLinkPopover from "../components/AddLinkPopover";
import ScheduleDialog from "../components/ScheduleDialog";
import { getPagination, setPagination } from "../../../pagination";
import Breadcrumbs from "components/@extended/Breadcrumbs";
import './EmailTemplate.css';
import { useEmailPreference } from "../../contexts/EmailPreferenceContext";
import LectureTopicInput from "./LectureTopicInput.jsx";
import AntTable from "./AntTable.jsx";
import MarkLectureDialog from "../components/MarkLectureDialog.jsx";
// import ShowLectureRow from "./ShowLectureRow";


dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

const { RangePicker } = DatePicker;

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const ViewSingleBatch = () => {
    const theme = useTheme();
    const primaryMain = theme.palette.primary.main;
    const { id } = useParams();
    const { settings } = useEmailPreference();
    const breadcrumbLinks = [{ title: "batch", to: `/batches/view/${id}` }];

    const [anchorEl, setAnchorEl] = useState(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [pageSize, setPageSize] = useState(getPagination('single_batch') || 10);
    const [page, setPage] = useState(1);

    const [mailModal, setMailModal] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ message: "", open: false, label: "" });
    const [currentLectureId, setCurrentLectureId] = useState(null);
    const [editorContent, setEditorContent] = useState("");
    const [subject, setSubject] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [lectureLoading, setLectureLoading] = useState(false);
    const [lectureType, setLectureType] = useState("upcoming");

    const [editTopicBox, setEditTopicBox] = useState({
        open: false,
        initialTopic: "",
        onClose: () => null,
        onSave: () => null
    });

    // single state variable
    const [count, setCount] = useState(0);
    const [trainer, setTrainer] = useState("");
    const [course, setCourse] = useState("");
    const [topic, setTopicGlobal] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    // array ? multiple state variable

    const [trainers, setTrainers] = useState([]);
    const [batches, setBatches] = useState([]);
    const [courses, setCourses] = useState([]);
    const [courseName, setCourseName] = useState("");
    const [batchKeyName, setBatchKeyName] = useState({});

    const [allEmails, setAllEmails] = useState([]);
    const [emails, setEmails] = useState([]);
    const [totalPage, setTotalPage] = useState(1);
    const [rows, setRows] = useState([]);
    const [courseTrainers, setCourseTrainers] = useState({});
    const [scheduleDialog, setScheduleDialog] = useState(false);

    const [cancelDialog, setCancelDialog] = useState({
        open: false,
        onClose: () => null,
        onSubmit: () => null,
    });

    const [markCompletedDialog, setMarkCompletedDialog] = useState({
        open: false,
        date: null,
        startTime: "",
        endTime: "",
        lectureId: "",
        trainerName: "",
        onOk: null,
        onClose: null,
    });

    const [toast, setToast] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const [currentRow, setCurrentRow] = useState({});

    function useDebouncedCallback(callback, delay) {
        const timeoutRef = useRef();

        const debouncedFunction = useCallback((...args) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        }, [callback, delay]);

        return debouncedFunction;
    };

    const debouncedUpdate = useDebouncedCallback(() => {
        setCount(c => c + 1);
    }, 200);


    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: false,
                orderedList: false,
                listItem: false,
                HTMLAttributes: {
                    allowClasses: true,
                }
            }),
            Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
            Bold,
            BulletList,
            OrderedList,
            ListItem,
            Italic,
            Underline,
            Strike,
            Link,
            Image,
            Blockquote,
            CodeBlock,
            HardBreak,
            Heading
        ],
        onSelectionUpdate: ({ editor }) => {
            debouncedUpdate();
        },
        content: editorContent
    });

    const handleEmails = (e, newVal) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const newlyAdded = newVal.filter(email => !(emails || []).includes(email));

        if (newlyAdded.length > 0) {
            const invalid = newlyAdded.find(email => !emailRegex.test(email));

            if (invalid) {
                setToast({ message: "Invalid email entered !", severity: "error", open: true });
                return;
            }
        }

        setEmails(newVal);
    };

    const handleLinkClick = (event) => {
        if (!anchorEl) {
            if (editor.isActive('link')) {
                const attrs = editor.getAttributes('link');
                setLinkUrl(attrs.href || '');
            } else {
                setLinkUrl('');
            }
            setAnchorEl(event.currentTarget);
        } else {
            setAnchorEl(null);
        }
    };

    const applyLink = (link) => {
        if (!link) {
            editor.chain().focus().unsetLink().run();
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: link }).run();
        }
        setAnchorEl(null);
    };

    const handleDateRange = (e) => {
        setStartDate(e[0]);
        setEndDate(e[1]);
    };

    const handlePageSizeChange = (event) => {
        setRows([]);
        setPageSize(event.target.value);
        setPage(1);
        fetchLectures(1, event.target.value);
        setPagination('single_batch', event.target.value);
    };

    const fetchLectures = async (page, pageSize, overrides = {}) => {
        try {
            const token = localStorage.getItem("token");
            setLectureLoading(true);
            const params = {
                courseId: course,
                trainerId: trainer,
                batchId: id,
                topic: topic.trim() || "",
                startDate: startDate ? new Date(startDate.$d).toISOString() : undefined,
                endDate: endDate ? new Date(endDate.$d).toISOString() : undefined,
                page,
                pageSize,
                type: lectureType,
                ...overrides
            };

            const { data } = await axios.get(`${config.hostUrl}/api/lecture/get`, {
                params,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setRows(data.data);
            setTotalPage(Math.ceil(data.total / pageSize));
        } catch (err) {
            console.error("Failed to fetch lectures", err);
        } finally {
            setLectureLoading(false);
        }
    };

    const handlePageChange = (value) => {
        setRows([]);
        setPage(value);
        fetchLectures(value, pageSize);
    };

    const hanldeSearch = () => {
        fetchLectures(page, pageSize);
    };

    const validateEmailModal = () => {
        const newErrors = {};

        if (!emails || emails.length === 0) {
            newErrors.emails = "Please provide at least one email.";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = (emails || []).filter(email => !emailRegex.test(email));

        if (invalidEmails.length > 0) {
            newErrors.emails = `Invalid email(s)`;
        }

        if (!subject || subject.trim().length === 0) {
            newErrors.subject = "Subject is required.";
        }

        const content = editor.getText().trim();
        if (!content || content.length === 0) {
            newErrors.content = "Email body must not be empty.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const changeTime = async (lectureId, newTime) => {

        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${config.hostUrl}/api/lecture/update_time`, {
                method: "put", body: JSON.stringify({ time: newTime, lectureId: lectureId }), headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (resp.status === 200) {
                if (settings.emailOnTimeChange) {
                    setConfirmDialog({ message: "Notify Student(s) About Time change ?", open: true, label: "time" });
                    setCurrentLectureId(lectureId);
                } else {
                    setCurrentLectureId("");
                }

                return true;
            } else {
                return false;
            }

        } catch (Err) {
            console.log("Some error while changing the time, Err: ", Err);
            return false;
        }
    };

    const assignTrainer = async (lectureId, trainerId) => {
        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${config.hostUrl}/api/lecture/assign_trainer`, {
                method: "PUT",
                body: JSON.stringify({ lectureId: lectureId, trainerId: trainerId }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await resp.json();

            if (resp.status === 200) {

                if (settings.emailOnTrainerAssign) {
                    setAllEmails([data.lectureInfo.email]);
                    setEmails([data.lectureInfo.email]);

                    setConfirmDialog({ message: "Notify trainer about lecture schedule ?", open: true, label: "trainer" });
                    setCurrentLectureId(lectureId);
                };

                return true;
            } else {
                return false;
            }
        } catch (Err) {
            console.log("Some error while assinging the trainer, Err:", Err);
            return false;
        }
    };

    const sendLectureScheduleMail = async (lectureId) => {
        const lectId = lectureId ? lectureId : currentLectureId;
        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${config.hostUrl}/api/lecture/get_info/${lectId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await resp.json();

            if (resp.status === 200) {
                const student_emails = data.lectureInfo.student_emails;
                const trainer_email = data.lectureInfo.trainer_email;
                setAllEmails([...student_emails, trainer_email]);
                setEmails([...student_emails, trainer_email]);
                const formattedDate = dayjs.utc(data.lectureInfo.date).tz("Asia/Kolkata").format("DD MMMM YYYY, dddd");
                const startTimeAmPm = dayjs(data.lectureInfo.start, "HH:mm").format("h:mm A");
                let start = dayjs(data.lectureInfo.start, "HH:mm");
                let end = dayjs(data.lectureInfo.end, "HH:mm");
                if (end.isBefore(start)) end = end.add(1, "day");
                const totalDuration = dayjs.duration(end.diff(start)).format("HH:mm");


                setSubject(`[Upcoming Lecture Schedule] - Time: ${startTimeAmPm}, ${formattedDate}`);
                setEditorContent(`<div class="email-wrapper"><h3>Hello Everyone,</h3><p>We hope this message finds you well. Below are the details for your upcoming class:</p> <div class="section"> <h3>Class Information:</h3>
                <strong><div>Date: ${formattedDate}</div></strong>
                <strong><div>Start Time: ${startTimeAmPm} (Asia/Kolkata)</div></strong>
                   <strong><div>Duration: ${totalDuration}</div></strong>
                    <strong><div>Topic: ${data.lectureInfo.topic}</div></strong>
                    <strong><div>Faculty: ${data.lectureInfo.faculty}</div></strong>
            </div>
            <div class="section">
                <h3>For Online Students:</h3>
                <p><a href="${data.lectureInfo.link}">Join Meeting Link</a></p>
            </div>
            <div class="section">
                <h3>For Offline Students & Faculty:</h3>
                <p>Venue: Boston Institute of Analytics, Office No. 411, 4th Floor, Shilp Zaveri, Above Westside, Shyamal Cross Rd, Ahmedabad, Gujarat 380015</p>
            </div>
            <div class="note">
                <strong>Note for Students:</strong> Kindly bring your laptop to the session.  
                For online attendees, please keep your camera off and microphone muted when not speaking. Use the chat for questions.
            </div>
            <div class="note">
                <strong>Note for Faculty:</strong> Please be present at the venue and also join the online meeting so that online students can participate.
            </div>
            <p>If you have any questions or need further information, feel free to reach out to your campus coordinator.</p>
            <p>We look forward to an engaging session!</p>
            <img class="image_logo" src=${Logo} alt="logo"/>
            <div class="footer">
                <p>Best Regards,  </p>
                <p>Academics Team   </p>
                Boston Institute of Analytics  
                HQ: 50 Milk Street, 18th Floor, Boston, MA 02109.  
                Boston | London | Dubai | Doha | Lahore | Mumbai | Delhi | Bengaluru  
                Web: <a href="http://www.bostoninstituteofanalytics.org/">www.bostoninstituteofanalytics.org</a></p>
                <p>Copyright © 2024 Boston Institute of Analytics LLC. All Rights Reserved.</p>
            </div>
        </div>`);
                setMailModal(true);


            } else {
                setToast({ message: "Some error while fetching lecture information, Please try again", severity: "error", open: true });
            }

        } catch (Err) {
            console.log("Some error while fetching lecture information", Err);
            setCurrentLectureId(null);
            setAllEmails([]);
            setEmails([]);
            setEditorContent(``);
            setSubject('');
            setToast({ message: "Some error while fetching lecture information, Please try again", severity: "error", open: true });
        }
    };

    const sendMailHandler = async () => {
        setConfirmDialog({ message: "", open: false, label: "" });
        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${config.hostUrl}/api/lecture/get_info/${currentLectureId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await resp.json();
            if (resp.status === 200) {
                const student_emails = data.lectureInfo.student_emails;
                const trainer_email = data.lectureInfo.trainer_email;
                setAllEmails([...student_emails, trainer_email]);
                setEmails([...student_emails, trainer_email]);
                const formattedDate = dayjs.utc(data.lectureInfo.date).tz("Asia/Kolkata").format("DD MMMM YYYY, dddd");
                const startTimeAmPm = dayjs(data.lectureInfo.start, "HH:mm").format("h:mm A");
                let start = dayjs(data.lectureInfo.start, "HH:mm");
                let end = dayjs(data.lectureInfo.end, "HH:mm");
                if (end.isBefore(start)) end = end.add(1, "day");
                const totalDuration = dayjs.duration(end.diff(start)).format("HH:mm");

                setSubject(`[Time Change] - New Time: ${startTimeAmPm}, ${formattedDate}`);
                setEditorContent(`<div class="email-wrapper"><h3>Hello Everyone,</h3><p>We hope this message finds you well. Below are the details for your upcoming class:</p> <div class="section"> <h3>Class Information:</h3>
                <strong><div>Date: ${formattedDate}</div></strong>
                <strong><div>Start Time: ${startTimeAmPm} (Asia/Kolkata)</div></strong>
                   <strong><div>Duration: ${totalDuration}</div></strong>
                    <strong><div>Topic: ${data.lectureInfo.topic}</div></strong>
                    <strong><div>Faculty: ${data.lectureInfo.faculty}</div></strong>
            </div>
            <div class="section">
                <h3>For Online Students:</h3>
                <p><a href="${data.lectureInfo.link}">Join Meeting Link</a></p>
            </div>
            <div class="section">
                <h3>For Offline Students & Faculty:</h3>
                <p>Venue: Boston Institute of Analytics, Office No. 411, 4th Floor, Shilp Zaveri, Above Westside, Shyamal Cross Rd, Ahmedabad, Gujarat 380015</p>
            </div>
            <div class="note">
                <strong>Note for Students:</strong> Kindly bring your laptop to the session.  
                For online attendees, please keep your camera off and microphone muted when not speaking. Use the chat for questions.
            </div>
            <div class="note">
                <strong>Note for Faculty:</strong> Please be present at the venue and also join the online meeting so that online students can participate.
            </div>
            <p>If you have any questions or need further information, feel free to reach out to your campus coordinator.</p>
            <p>We look forward to an engaging session!</p>
            <img class="image_logo" src=${Logo} alt="logo"/>
            <div class="footer">
                <p>Best Regards,  </p>
                <p>Academics Team   </p>
                Boston Institute of Analytics  
                HQ: 50 Milk Street, 18th Floor, Boston, MA 02109.  
                Boston | London | Dubai | Doha | Lahore | Mumbai | Delhi | Bengaluru  
                Web: <a href="http://www.bostoninstituteofanalytics.org/">www.bostoninstituteofanalytics.org</a></p>
                <p>Copyright © 2024 Boston Institute of Analytics LLC. All Rights Reserved.</p>
            </div>
        </div>`);
                setMailModal(true);
            } else {
                setToast({ message: "Some error while fetching lecture information, Please try again", severity: "error", open: true });
            }

        } catch (Err) {
            console.log("Some error while fetching lecture information", Err);
            setToast({ message: "Some error while fetching lecture information, Please try again", severity: "error", open: true });
        }
    };

    const sendMailTrainer = async () => {
        setConfirmDialog({ message: "", open: false, label: "" });
        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${config.hostUrl}/api/lecture/get_info/${currentLectureId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await resp.json();

            if (resp.status === 200) {
                const formattedDate = dayjs.utc(data.lectureInfo.date).tz("Asia/Kolkata").format("DD MMMM YYYY, dddd");
                const startTimeAmPm = dayjs(data.lectureInfo.start, "HH:mm").format("h:mm A");
                let start = dayjs(data.lectureInfo.start, "HH:mm");
                let end = dayjs(data.lectureInfo.end, "HH:mm");
                if (end.isBefore(start)) end = end.add(1, "day");

                setSubject("New Lecture Assignment");
                setEditorContent(`<div style={{ whiteSpace: "pre-line", fontFamily: "Arial, sans-serif", lineHeight: 1.5 }}>
      <p>Dear <strong>${data.lectureInfo.faculty}</strong>,</p>

      <p>
        You have been assigned a new lecture for the batch on <strong>${formattedDate}</strong> (${startTimeAmPm} - ${end.format("h:mm A")}),<br />
        covering the topic: <strong>"${data.lectureInfo.topic}"</strong>.
      </p>

      <p>Please prepare accordingly.</p>

      <p>Regards,<br />[Your Organization Name]</p>
    </div>`);
                setMailModal(true);
            }

        } catch (Err) {
            console.log("Some error while fetching lecture information", Err);
        }
    };

    const sendMail = async () => {
        if (!validateEmailModal()) {
            return;
        }
        setLoading(true);
        const html = editor.getHTML();
        const htmlContent = html.replace("<p><strong>Note for Students:", "<p class='note'><strong>Note for Students:").replace("<p><strong>Note for Faculty:", "<p class='note'><strong>Note for Faculty:")
        const htmlWithCss = buildEmailHtml(htmlContent);

        try {
            const token = localStorage.getItem("token");

            const resp = await fetch(`${config.hostUrl}/api/lecture/send_mail`, {
                method: "POST",
                body: JSON.stringify({ emails: emails, body: htmlWithCss, subject: subject }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (resp.status === 200) {
                setCurrentLectureId("");
                setEditorContent("");
                setSubject("");
                setEmails([]);
                setAllEmails([]);
                setMailModal(false);
                setToast({ message: "Email sent successfully", severity: "success", open: true });
            } else {
                setToast({ message: "Error while sending an email", severity: "error", open: true });
            }
            setLoading(false);
        } catch (Err) {
            setLoading(false);
            setToast({ message: "Error while sending an email", severity: "error", open: true });
            console.log("Some error while sending an email", Err);
        }
    };

    const sendMailTo = async (lectureId, to) => {

        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${config.hostUrl}/api/lecture/get_info/${lectureId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await resp.json();

            if (resp.status === 200) {
                const student_emails = data.lectureInfo.student_emails;
                const trainer_email = data.lectureInfo.trainer_email;

                setSubject("");
                setMailModal(true);
                setEditorContent(`
          <div></div>
          <div></div>
          <br/>
          <img class="image_logo" src=${Logo} alt="logo"/>
            <div class="footer">
                <p>Best Regards,  </p>
                <p>Academics Team   </p>
                Boston Institute of Analytics  
                HQ: 50 Milk Street, 18th Floor, Boston, MA 02109.  
                Boston | London | Dubai | Doha | Lahore | Mumbai | Delhi | Bengaluru  
                Web: <a href="http://www.bostoninstituteofanalytics.org/">www.bostoninstituteofanalytics.org</a></p>
                <p>Copyright © 2024 Boston Institute of Analytics LLC. All Rights Reserved.</p>
            </div>`);

                if (to === "student") {
                    setAllEmails([...student_emails]);
                    setEmails([...student_emails]);
                } else if (to === "trainer") {
                    setAllEmails([trainer_email]);
                    setEmails([trainer_email]);
                } else {
                    setAllEmails([...student_emails, trainer_email]);
                    setEmails([...student_emails, trainer_email]);
                }
            } else {
                setToast({ message: "Error while fetching data", severity: "error", open: true });
            }
        } catch (Err) {
            console.log("Error while fetching lecture data ", Err);
            setToast({ message: "Error while fetching data", severity: "error", open: true });
        }
    };

    const showToast = (message, severity) => {
        setToast({
            open: true,
            message: message,
            severity: severity,
        })
    };

    const hanldeClear = () => {
        setStartDate(null);
        setEndDate(null);
        setCourse("");
        setTrainer("");
        setTopicGlobal("");
        setPage(1);
        fetchLectures(1, pageSize, {
            courseId: "",
            trainerId: "",
            batchId: "",
            topic: "",
            startDate: undefined,
            endDate: undefined
        });
    };

    const handleConfirmCancel = async (reason, rescheduleAll, id) => {
        if (!reason.trim()) {
            setToast({
                open: true,
                severity: "warning",
                message: "Please provide a reason for cancellation.",
            });
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${config.hostUrl}/api/lecture/cancel_lecture`, {
                method: 'PUT',
                body: JSON.stringify({ lectureId: id, reason: reason, reschedule: rescheduleAll }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (resp.status === 200) {
                setCancelDialog({
                    open: false,
                    onClose: () => null,
                    onSubmit: () => null,
                });

                fetchLectures(page, pageSize);

                if (settings.emailOnLectureCancel) {
                    setConfirmDialog({ message: "Notify Student(s) About Lecture cancellation ?", open: true, label: "cancel" })
                }

            } else {
                setToast({ message: "Failed to cancel the lecture. Please try again.", severity: "error", open: true });
            }

        } catch (Err) {
            setToast({ message: "Failed to cancel the lecture. Please try again.", severity: "error", open: true });
            console.log("Some error while cancelling the lecture :", Err);
        }
    };

    const cancelLecture = (row) => {
        const lectureId = row._id;
        setCancelDialog({
            open: true,
            onClose: () => setCancelDialog({ open: false, onClose: () => null, onSubmit: () => null }),
            onSubmit: (e, rescheduleAll) => handleConfirmCancel(e, rescheduleAll, lectureId),
        });
    };

    const rescheduleLecture = (row) => {
        setCurrentRow({ ...row, title: "Reschedule Lecture", type: "reschedule", primaryMain: primaryMain, open: true, trainers: courseTrainers[row.courseName], rearrangeAll: false });
    };

    const saveTopic = async (lectureId, topic) => {

        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${config.hostUrl}/api/lecture/edit_topic`, {
                method: "PUT",
                body: JSON.stringify({ lectureId, topic }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (resp.status === 200) {
                setToast({ message: "Topic updated successfully.", severity: "success", open: true });
                refreshLectures();
                setEditTopicBox({ open: false, initialTopic: "", onClose: () => null, onSave: () => null });
            } else {
                setToast({ message: "Failed to update topic. Please try again.", severity: "error", open: true })
            }
        } catch (Err) {
            console.log("Some error while ", Err);
            setToast({ message: "Failed to update topic. Please try again.", severity: "error", open: true })
        }
    };

    const editTopic = (lectureId, topic) => {
        setEditTopicBox({
            open: true,
            initialTopic: topic,
            onSave: (t) => saveTopic(lectureId, t),
            onClose: () => setEditTopicBox({ open: false, initialTopic: "", })
        })
    };

    const setLectureId = (id) => setCurrentLectureId(id)
    const refreshLectures = () => fetchLectures(page, pageSize)

    const removeLecture = (lecturedId) => {
        setConfirmDialog({ message: "Are you sure you want to permanently remove this lecture?", open: true, label: "remove" });
        setCurrentLectureId(lecturedId);
    };

    const confirmLectureDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${config.hostUrl}/api/lecture/delete/${currentLectureId}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (resp.status === 200) {
                setCurrentLectureId(null);
                setConfirmDialog({ message: "", open: false, label: "" });
                refreshLectures();
                setToast({ message: "Lecture deleted successfully.", severity: "success", open: true });
            }

        } catch (Err) {
            console.log("Some error while deleting the lecture !", Err);
            showToast({ message: "An error occurred while deleting the lecture. Please try again.", severity: "error", open: true })
        }
    };

    const sendNotification = (isCalncelled, lectureId) => {

        if (!isCalncelled) {
            sendLectureScheduleMail(lectureId);
        } else {
            // sendLectureCancelMail()
        }
    };

    const changeDate = async (lectureId, newDate) => {

        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${config.hostUrl}/api/lecture/update_date`, {
                method: "put", body: JSON.stringify({ newDate: newDate, lectureId: lectureId }), headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (resp.status === 200) {
                return true;
            } else {
                return false;
            }

        } catch (Err) {
            console.log("Some error while changing the date, Err: ", Err);
            return false;
        }
    };

    const markCompleted = async (row) => {
        const { startTime, endTime } = row;
        setMarkCompletedDialog({
            open: true,
            date: row.plannedDate,
            startTime: startTime,
            endTime: endTime,
            trainerName: row.trainerName,
            lectureId: row._id,
            onClose: () => {
                setMarkCompletedDialog({
                    open: false,
                    date: null,
                    startTime: "",
                    endTime: "",
                    lectureId: "",
                    onClose: null,
                    trainerName: "",
                    onClose: () => null
                })
            },
        });
    };

    const confirmLectureComplete = async (e, lectureId) => {

        if (!e || !e[0] || !e[1]) {
            setToast({ message: "Please select both start and end time.", severity: "warning", open: true });
            return;
        }
        const startTime = e[0].format("HH:mm");
        const endTime = e[1].format("HH:mm");

        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${config.hostUrl}/api/lecture/mark_completed`, {
                method: "PUT",
                body: JSON.stringify({ lectureId, startTime, endTime }),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (resp.status === 200) {
                setMarkCompletedDialog({
                    open: false,
                    date: null,
                    startTime: "",
                    endTime: "",
                    lectureId: "",
                    trainerName: "",
                    onClose: null,
                });
                setToast({ message: "Lecture marked as completed.", severity: "success", open: true });
                refreshLectures();
            } else {
                setToast({ message: "Failed to mark as completed. Please try again.", severity: "error", open: true });
            }

        } catch (Err) {
            console.log("Some error while confirming the lecture", Err);
        }
    };

    useEffect(() => {
        const fetchCourses = async () => {
            const courses = await getCourses();
            setCourses(courses);
        };

        const fetchTrainers = async () => {
            const trainers = await getTrainers();

            const courseTrainerDict = {};

            trainers.forEach((t) => {
                if (courseTrainerDict[t.course]) {
                    courseTrainerDict[t.course].push(t);
                } else {
                    courseTrainerDict[t.course] = [t];
                }
            });

            setCourseTrainers(courseTrainerDict);
            setTrainers(trainers);
        };

        const fetchBatches = async () => {
            const batches = await getBatches();
            const bkn = {};

            batches.forEach((b) => {
                if (!bkn[b._id]) {
                    bkn[b._id] = b;
                }
            });

            setBatchKeyName(bkn);
            setBatches([batches.find((b) => b._id === id)]);
            setCourseName(batches.find((b) => b._id === id)?.courseName || "");
        };

        fetchCourses();
        fetchTrainers();
        fetchBatches();

        fetchLectures(1, pageSize);
    }, []);

    useEffect(() => {
        if (editor && editorContent) {
            editor.commands.setContent(editorContent);
        }
    }, [editorContent, editor]);

    return (
        <Box sx={{ p: 3 }}>
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
            <Breadcrumbs
                customHeading={true}
                custom={true}
                heading={batchKeyName[id] ? `Batch ${batchKeyName[id]?.month.slice(0, 3).toUpperCase()}${batchKeyName[id]?.year}-${batchKeyName[id]?.courseCode}-${batchKeyName[id]?.batchNo}` : 'Batch'}
                links={breadcrumbLinks}
            />

            <Dialog
                open={confirmDialog.open}
                onClose={() => console.log("modal closed !")}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    <Typography
                        variant="caption"
                    >{confirmDialog.message}
                    </Typography>
                </DialogTitle>

                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ message: "", open: false, label: "" })}>No</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (confirmDialog.label === "time") {
                                sendMailHandler();
                            } else if (confirmDialog.label === "trainer") {
                                sendMailTrainer();
                            } else if (confirmDialog.label === "cancel") {
                                // sendMailCancelled //
                                // open Mail Modal Email editor here
                            } else if (confirmDialog.label === "remove") {
                                confirmLectureDelete();
                            }
                        }}
                        color={confirmDialog.label === "remove" ? "error" : "primary"}
                    >
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>

            <EditTopicDialog open={editTopicBox.open} onClose={() => editTopicBox.onClose()} initialTopic={editTopicBox.initialTopic} onSave={(t) => editTopicBox.onSave(t)} />
            <CancelDialog onClose={cancelDialog.onClose} onSubmit={cancelDialog.onSubmit} open={cancelDialog.open} />
            <ScheduleDialog open={scheduleDialog} setLectureId={setLectureId} onClose={() => setScheduleDialog(false)} batches={batches} trainers={trainers} showToast={showToast} refreshLectures={refreshLectures} openMailModal={sendLectureScheduleMail} />
            <RescheduleDialog row={currentRow} showToast={showToast} setLectureId={setLectureId} openMailModal={sendLectureScheduleMail} refreshLectures={refreshLectures} />


            <MarkLectureDialog
                open={markCompletedDialog.open}
                onClose={markCompletedDialog.onClose}
                trainerName={markCompletedDialog.trainerName}
                lectureDate={markCompletedDialog.date}
                startTime={markCompletedDialog.startTime}
                endTime={markCompletedDialog.endTime}
                primaryMain={primaryMain}
                onConfirm={(e) => confirmLectureComplete(e, markCompletedDialog.lectureId)}
            />

            <Modal
                title={<span style={{ color: textColor }}>Send Email</span>}
                styles={modalStyles}
                centered
                open={mailModal}
                onOk={sendMail}
                onCancel={() => {
                    setMailModal(false);
                }}
                width={{
                    xs: "90%",
                    sm: "90%",
                    md: "90%",
                    lg: "90%",
                    xl: "90%",
                    xxl: "50%",
                }}
                maskClosable={false}
                zIndex={2000}
                footer={[
                    <div key="footer-buttons" style={{ display: 'flex', gap: 8, justifyContent: "end" }}>
                        <Button
                            key="close"
                            type="primary"
                            endIcon={<CloseCircle size={18} />}
                            sx={{ mt: 1 }}
                            onClick={() => {
                                setMailModal(false);
                            }}
                        >
                            Close
                        </Button>,
                        <Button
                            key="update"
                            endIcon={loading ? <CircularProgress size={18} /> : <Send2 size={18} />}
                            onClick={sendMail}
                            variant="contained"
                            sx={{ mt: 1 }}
                            disabled={loading || emails.length === 0}
                        >
                            {loading ? "Sending" : "Send"}
                        </Button>,
                    </div>
                ]}
            >

                <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    mt: 1,
                }}>
                    <Autocomplete
                        multiple
                        disableCloseOnSelect
                        freeSolo={true}
                        options={allEmails || []}
                        value={emails || []}
                        onChange={(e, newVal) => handleEmails(e, newVal)}
                        ListboxProps={{
                            style: {
                                maxHeight: 300,
                                overflowY: 'auto',
                            }
                        }}
                        onFocus={() => setErrors((prev) => ({ ...prev, emails: "" }))}
                        sx={{
                            width: "100%",
                            '& .MuiAutocomplete-tag': {
                                whiteSpace: 'nowrap'
                            }
                        }}

                        renderTags={(value, getTagProps) => (
                            <div
                                style={{
                                    maxHeight: "200px",
                                    overflowY: 'auto',
                                    width: '100%'
                                }}
                            >
                                {value.map((option, index) => (
                                    <Chip
                                        variant="outlined"
                                        label={option}
                                        {...getTagProps({ index })}
                                        key={index}
                                        style={{ whiteSpace: 'nowrap' }}
                                    />
                                ))}
                            </div>
                        )}

                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Emails"
                                placeholder="Select email"
                                error={Boolean(errors.emails)}
                                helperText={errors.emails || ''}
                            />
                        )}
                        slotProps={{
                            popper: {
                                modifiers: [
                                    {
                                        name: "zIndex",
                                        enabled: true,
                                        phase: "write",
                                        fn({ state }) {
                                            state.elements.popper.style.zIndex = "2100";
                                        },
                                    },
                                ],
                            },
                        }}
                    />
                </Box>

                <TextField
                    fullWidth
                    label="Subject"
                    autoComplete="off"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    sx={{ mt: 2 }}
                    placeholder="Enter email subject"
                    error={Boolean(errors.subject)}
                    onFocus={() => setErrors((prev) => ({ ...prev, subject: "" }))}
                    helperText={errors.subject || ''}
                />

                <Card variant="outlined" sx={{ mt: 2 }}>

                    <CardContent>

                        <Stack direction="row" spacing={1} mb={2}>
                            <Tooltip title="Bold" slotProps={{
                                popper: {
                                    sx: {
                                        zIndex: 3001
                                    }
                                }
                            }}>
                                <Button
                                    variant={editor.isActive("bold") ? "contained" : "outlined"}
                                    onClick={() => {
                                        editor.chain().focus().toggleBold().run();
                                        setCount(c => c + 1);
                                    }}
                                    size="small"
                                >
                                    <TextBold size="14" variant="Linear" />
                                </Button>
                            </Tooltip>

                            <Tooltip title="Italic" slotProps={{
                                popper: {
                                    sx: {
                                        zIndex: 3001
                                    }
                                }
                            }}>
                                <Button
                                    variant={editor.isActive("italic") ? "contained" : "outlined"}
                                    onClick={() => {
                                        editor.chain().focus().toggleItalic().run();
                                        setCount(c => c + 1);
                                    }}
                                >
                                    <TextItalic size="14" variant="Linear" />
                                </Button>
                            </Tooltip>

                            <Tooltip title="Underline" slotProps={{
                                popper: {
                                    sx: {
                                        zIndex: 3001
                                    }
                                }
                            }}>
                                <Button
                                    variant={editor.isActive("underline") ? "contained" : "outlined"}
                                    onClick={() => {
                                        editor.chain().focus().toggleUnderline().run();
                                        setCount(c => c + 1);
                                    }}
                                >
                                    <TextUnderline size="14" variant="Linear" />
                                </Button>
                            </Tooltip>

                            <Tooltip title="Bullet List" slotProps={{
                                popper: {
                                    sx: {
                                        zIndex: 3001
                                    }
                                }
                            }}>
                                <Button
                                    variant={editor.isActive("bulletList") ? "contained" : "outlined"}
                                    onClick={() => {
                                        editor.chain().focus().toggleBulletList().run();
                                        setCount(c => c + 1);
                                    }}
                                >
                                    <BulletListIcon size={14} />
                                </Button>
                            </Tooltip>

                            <Tooltip title="Ordered List" slotProps={{
                                popper: {
                                    sx: {
                                        zIndex: 3001
                                    }
                                }
                            }}>
                                <Button
                                    variant={editor.isActive("orderedList") ? "contained" : "outlined"}
                                    onClick={() => {
                                        editor.chain().focus().toggleOrderedList().run();
                                        setCount(c => c + 1);
                                    }}
                                >
                                    <OrderedListIcon size={14} />
                                </Button>
                            </Tooltip>

                            <Tooltip title="Strikethrough" slotProps={{
                                popper: {
                                    sx: {
                                        zIndex: 3001
                                    }
                                }
                            }}>
                                <Button
                                    variant={editor.isActive("strike") ? "contained" : "outlined"}
                                    onClick={() => {
                                        editor.chain().focus().toggleStrike().run();
                                        setCount(c => c + 1);
                                    }}
                                >
                                    <Strikethrough size={14} />
                                </Button>
                            </Tooltip>

                            <Tooltip title="Code Block" slotProps={{
                                popper: {
                                    sx: {
                                        zIndex: 3001
                                    }
                                }
                            }}>
                                <Button
                                    variant={editor.isActive("codeBlock") ? "contained" : "outlined"}
                                    onClick={() => {
                                        editor.chain().focus().toggleCodeBlock().run();
                                        setCount(c => c + 1);
                                    }}
                                >
                                    <Code size="14" variant="Linear" />
                                </Button>
                            </Tooltip>

                            <Tooltip title="Insert Link" slotProps={{
                                popper: {
                                    sx: {
                                        zIndex: 3001
                                    }
                                }
                            }}>
                                <Button
                                    variant={editor.isActive("link") ? "contained" : "outlined"}

                                    onClick={(e) => {
                                        handleLinkClick(e);
                                    }}
                                >
                                    <LinkIcon size={14} />
                                </Button>
                            </Tooltip>

                            <HeadingSelector editor={editor} setCount={setCount} />

                            <AddLinkPopover
                                anchorEl={anchorEl}
                                onClose={() => setAnchorEl(null)}
                                onApply={(url) => {
                                    applyLink(url);
                                }}
                                initialUrl={linkUrl}
                            />
                        </Stack>

                    </CardContent>

                    <Box
                        sx={{
                            minHeight: "200px",
                            border: "1px solid",
                            borderColor: "divider",
                            padding: 2,
                            bgcolor: "background.default",
                            color: "text.primary",
                            "& .ProseMirror": {
                                outline: "none",
                                minHeight: "200px",
                            },
                        }}
                    >
                        <EditorContent editor={editor} className="tiptap-editor" />
                    </Box>
                </Card>

            </Modal>

            <Typography
                variant="h6"
                sx={{ mb: 2, color: theme.palette.primary.main }}
            >
                Lecture Schedule
            </Typography>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 2,
                    mb: 3,
                }}
            >
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
                            },
                        },
                    }}
                >
                    <RangePicker
                        style={{ height: 42 }}
                        onChange={handleDateRange}
                        value={startDate && endDate ? [startDate, endDate] : []}
                    />
                </ConfigProvider>

                <FormControl size="small">
                    <InputLabel>Trainer</InputLabel>
                    <Select
                        value={trainer}
                        onChange={(e) => setTrainer(e.target.value)}
                        label="Trainer"
                    >
                        <MenuItem value="">All</MenuItem>
                        {(trainers.filter((t) => t.course === courseName) || []).map((t, i) => (
                            <MenuItem key={i} value={t._id}>
                                {t.firstName} {t.lastName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <LectureTopicInput setTopicGlobal={setTopicGlobal} />

                <FormControl size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                        value={lectureType}
                        onChange={(e) => {
                            setLectureType(e.target.value);
                            fetchLectures(page, pageSize, { type: e.target.value })
                        }}
                        label="Type"
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="upcoming">Upcoming</MenuItem>
                        <MenuItem value="complete">Completed</MenuItem>
                    </Select>
                </FormControl>


                <Button
                    variant="contained"
                    startIcon={<SearchNormal1 />}
                    size="small"
                    onClick={hanldeSearch}
                >
                    Search
                </Button>

                <Button
                    variant="contained"
                    startIcon={<TagCross />}
                    size="small"
                    onClick={hanldeClear}
                > Clear </Button>

                <Button
                    variant="contained"
                    startIcon={<AddCircle />}
                    size="small"
                    onClick={() => setScheduleDialog(true)}
                > Schedule Lecture </Button>
            </Box>

            {lectureLoading ? (
                <LectureSkeleton number={pageSize} />
            ) : rows.length === 0 ? (
                <Empty
                    className='mt-5'
                    description={
                        <Typography color="primary">
                            No Lecture found
                        </Typography>
                    }
                />
            ) : (
                <AntTable
                    rows={rows}
                    trainerList={courseTrainers}
                    batchKeyName={batchKeyName}
                    changeTime={changeTime}
                    assignTrainer={assignTrainer}
                    cancelLecture={cancelLecture}
                    rescheduleLecture={rescheduleLecture}
                    editTopic={editTopic}
                    removeLecture={removeLecture}
                    sendMail={sendMailTo}
                    sendNotification={sendNotification}
                    changeDate={changeDate}
                    showToast={showToast}
                    markCompleted={markCompleted}
                />
            )}

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
        </Box>
    );
};

export default ViewSingleBatch;