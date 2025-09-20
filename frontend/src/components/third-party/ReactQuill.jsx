import { forwardRef, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';

// third-party
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// project-imports
import { ThemeDirection } from 'config';
import useConfig from 'hooks/useConfig';

// ==============================|| EDITOR - QUILL ||============================== //

const ReactQuillDemo = forwardRef(({ defaultText, borderRadius = 0.5, onChange, sx = {} }, ref) => {
  const { themeDirection } = useConfig();
  const [text, setText] = useState(defaultText || '');

  const handleChange = (value) => {
    setText(value);
    onChange && onChange(value);
  };

  return (
    <Box
      sx={[
        (theme) => ({
          '& .quill': {
            bgcolor: 'background.paper',
            borderRadius: borderRadius,
            '& .ql-toolbar': {
              bgcolor: 'background.default',
              borderColor: theme.palette.secondary.light,
              borderTopLeftRadius: theme.spacing(borderRadius),
              borderTopRightRadius: theme.spacing(borderRadius),
              '& .ql-stroke': { stroke: theme.palette.text.secondary },
              '& .ql-picker': { color: 'text.secondary' }
            },
            '& .ql-snow .ql-picker-options': {
              backgroundColor: 'background.paper'
            },
            '& .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-label, .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-options':
              {
                borderColor: theme.palette.secondary.light
              },
            '& .ql-container': {
              borderColor: `${theme.palette.secondary.light} !important`,
              borderBottomLeftRadius: theme.spacing(borderRadius),
              borderBottomRightRadius: theme.spacing(borderRadius),
              '& .ql-editor': { minHeight: 135 }
            },
            '& .ql-snow .ql-picker:not(.ql-color-picker):not(.ql-icon-picker) svg': {
              position: themeDirection === ThemeDirection.RTL ? 'initial' : 'absolute'
            }
          }
        }),
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
    >
      <ReactQuill value={text} ref={ref} onChange={handleChange} />
    </Box>
  );
});

export default ReactQuillDemo;
