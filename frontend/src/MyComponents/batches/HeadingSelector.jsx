import React, { useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

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

export default HeadingSelector;