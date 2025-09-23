import { Modal } from 'antd';
import { Autocomplete, Button, Card, CardContent, Chip, CircularProgress, Stack, TextField, Tooltip, Box, Popover, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { CloseCircle, Code, Send2, TextBold, TextItalic, TextUnderline, Link as LinkIcon } from 'iconsax-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { List as BulletListIcon, ListOrdered as OrderedListIcon, Strikethrough } from "lucide-react";
import config, { modalStyles, textColor } from '../../config';
import buildEmailHtml from '../utils/emailWrapperCss';


const AddLinkPopover = ({ anchorEl, onClose, onApply, initialUrl = "", showToast }) => {

    const open = Boolean(anchorEl);
    const id = open ? "add-link-popover" : undefined;

    const [linkUrl, setLinkUrl] = useState(initialUrl);

    useEffect(() => {
        if (open) {
            setLinkUrl(initialUrl);
        }
    }, [open, initialUrl]);

    const handleApply = () => {
        if (!linkUrl.trim()) {
            onClose();
            return;
        }

        try {
            new URL(linkUrl);
            onApply(linkUrl);
            onClose();
        } catch {
            showToast({ message: "Please enter a valid URL", severity: "error", open: true });
        }
    };

    return (
        <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            sx={{ zIndex: 3001 }}
        >
            <Stack spacing={1} p={2} sx={{ width: 300 }}>
                <TextField
                    placeholder="Enter URL"
                    variant="outlined"
                    autoComplete="off"
                    size="small"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleApply();
                        }
                        if (e.key === "Escape") {
                            onClose();
                        }
                    }}
                    autoFocus
                />
                <Button variant="contained" onClick={handleApply} size="small">
                    Apply
                </Button>
            </Stack>
        </Popover>
    );
};

const HeadingSelector = ({ editor, setCount }) => {
    const currentHeadingLevel = editor.isActive('heading')
        ? editor.getAttributes('heading').level
        : '';

    const [headingLevel, setHeadingLevel] = useState(currentHeadingLevel);

    const handleChange = (event) => {
        const level = event.target.value;
        setHeadingLevel(level);
        if (level === '') {
            editor.chain().focus().setParagraph().run();
        } else {
            editor.chain().focus().toggleHeading({ level }).run();
        }
        setCount(c => c + 1);
    };

    return (
        <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel id="heading-select-label">Heading</InputLabel>
            <Select
                labelId="heading-select-label"
                id="heading-select"
                value={headingLevel}
                label="Heading"
                onChange={handleChange}
                MenuProps={{
                    disablePortal: true,
                    PaperProps: {
                        sx: {
                            zIndex: 2100,
                            mb: 1,
                            mt: 1,
                            minWidth: "300px",
                            maxWidth: "100%",
                        },
                    },
                }}
            >
                <MenuItem value="">
                    <em>Paragraph</em>
                </MenuItem>
                {[1, 2, 3, 4, 5, 6].map(level => (
                    <MenuItem key={level} value={level}>
                        H{level}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

const SendMailModal = ({ open, onClose, initialEmails = [], initialSubject = "", initialContent = "", showToast, replacerFn = (e) => e }) => {

    const [loading, setLoading] = useState(false);
    const [allEmails, setAllEmails] = useState([...initialEmails]);
    const [selectedEmails, setSelectedEmails] = useState([...initialEmails]);
    const [subject, setSubject] = useState(initialSubject);
    const [editorContent, setEditorContent] = useState(initialContent);
    const [anchorEl, setAnchorEl] = useState(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [count, setCount] = useState(0);

    const [errors, setErrors] = useState({});

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


    const validateForm = () => {
        const newErrors = {};

        if (!selectedEmails || selectedEmails.length === 0) {
            newErrors.emails = "Please provide at least one email.";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = (selectedEmails || []).filter(email => !emailRegex.test(email));

        if (invalidEmails.length > 0) {
            newErrors.emails = `Invalid email(s)`;
        }

        if (!subject || subject.trim().length === 0) {
            newErrors.subject = "Subject is required.";
        }

        const content = editor.getText().trim();
        console.log("content is ", content);

        if (!content || content.length === 0) {
            newErrors.content = "Email body must not be empty.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleEmails = (e, newVal) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const newlyAdded = newVal.filter(email => !(selectedEmails || []).includes(email));

        if (newlyAdded.length > 0) {
            const invalid = newlyAdded.find(email => !emailRegex.test(email));
            if (invalid) {
                showToast({ message: "Invalid email entered !", severity: "error", open: true });
                return;
            }
        }

        setSelectedEmails(newVal);
    };

    const sendMail = async () => {

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        const html = editor.getHTML();
        const replacedHtml = replacerFn(html);
        const htmlWithCss = buildEmailHtml(replacedHtml);

        try {
            const token = localStorage.getItem("token");

            const resp = await fetch(`${config.hostUrl}/api/lecture/send_mail`, {
                method: "POST",
                body: JSON.stringify({ emails: selectedEmails, body: htmlWithCss, subject: subject }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (resp.status === 200) {
                extendedOnClose();
                showToast({ message: "Email sent successfully", severity: "success", open: true });
            } else {
                showToast({ message: "Error while sending an email", severity: "error", open: true });
            }
            setLoading(false);
        } catch (Err) {
            setLoading(false);
            showToast({ message: "Error while sending an email", severity: "error", open: true });
            console.log("Some error while sending an email", Err);
        }
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

    const extendedOnClose = () => {
        setLoading(false);
        setAllEmails([]);
        setEditorContent("");
        setSubject("");
        setErrors({});
        setAnchorEl(null);
        setLinkUrl('');
        setCount(0);
        if (editor) {
            editor.commands.setContent("");
        }
        onClose();
    };

    useEffect(() => {
        if (editor && editorContent) {
            editor.commands.setContent(editorContent);
        }
    }, [editorContent, editor]);

    useEffect(() => {
        setAllEmails([...initialEmails]);
        setSelectedEmails([...initialEmails]);
        setSubject(initialSubject);
        setEditorContent(initialContent);

    }, [initialEmails, initialSubject, initialContent])

    return (
        <>
            <Modal
                title={<span style={{ color: textColor }}>Send Email</span>}
                styles={modalStyles}
                centered
                open={open}
                onCancel={extendedOnClose}
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
                    <Box key="mail-footer" sx={{ mt: 1, display: "flex", justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                            key="close"
                            type="primary"
                            variant='outlined'
                            endIcon={<CloseCircle size={18} />}
                            sx={{ borderRadius: 0.5 }}
                            onClick={extendedOnClose}
                            size="small"
                        >
                            Close
                        </Button>
                        <Button
                            key="send"
                            sx={{ borderRadius: 0.5 }}
                            endIcon={loading ? <CircularProgress size={16} /> : <Send2 size={18} />}
                            onClick={sendMail}
                            variant="contained"
                            disabled={loading || allEmails.length === 0}
                            size="small"
                        >
                            {loading ? "Sending" : "Send"}
                        </Button>
                    </Box>
                ]}
            >

                <Box
                    sx={{
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
                        value={selectedEmails || []}
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
                            }} arrow>
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
                            }} arrow>
                                <Button
                                    variant={editor.isActive("italic") ? "contained" : "outlined"}
                                    onClick={() => {
                                        editor.chain().focus().toggleItalic().run();
                                        setCount(c => c + 1);
                                    }}
                                    size="small"
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
                            }} arrow>
                                <Button
                                    variant={editor.isActive("underline") ? "contained" : "outlined"}
                                    onClick={() => {
                                        editor.chain().focus().toggleUnderline().run();
                                        setCount(c => c + 1);
                                    }}
                                    size="small"
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
                            }} arrow>
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
                            }} arrow>
                                <Button
                                    variant={editor.isActive("orderedList") ? "contained" : "outlined"}
                                    onClick={() => {
                                        editor.chain().focus().toggleOrderedList().run();
                                        setCount(c => c + 1);
                                    }}
                                >
                                    <OrderedListIcon size={14} />
                                </Button>
                            </Tooltip >

                            <Tooltip title="Strikethrough" slotProps={{
                                popper: {
                                    sx: {
                                        zIndex: 3001
                                    }
                                }
                            }} arrow>
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
                            }} arrow>
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
                            }} arrow>
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
                                showToast={showToast}
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
        </>
    )
};

export default SendMailModal;