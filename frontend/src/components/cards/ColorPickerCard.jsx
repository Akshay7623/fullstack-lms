import PropTypes from 'prop-types';
import { useState, useId } from 'react';

import Input from '@mui/material/Input';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import ColorPreview from 'components/ColorPreview';
import MainCard from 'components/MainCard';

// ==============================|| COLOR PICKER CARD ||============================== //

export default function ColorPickerCard({ color, cardSx, onColorChange }) {
  const [selectedColor, setSelectedColor] = useState(color);

  // Generate a unique ID for the component
  const uniqueId = useId();

  const handleColorChange = (event) => {
    setSelectedColor(event.target.value);
    if (onColorChange) onColorChange(event.target.value);
  };

  const triggerColorPicker = (id) => {
    const inputElement = document.getElementById(id);
    if (inputElement) inputElement.click();
  };

  // Include the unique ID in the color input ID
  const colorInputId = `color-picker-${uniqueId}`;

  return (
    <MainCard content={false} sx={{ px: 2.5, py: 1.25, ...cardSx }}>
      <Stack direction="row" sx={{ gap: 1.25, alignItems: 'center' }}>
        {/* Hidden color input */}
        <Input
          id={colorInputId}
          type="color"
          value={selectedColor}
          onChange={handleColorChange}
          sx={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', p: 0, m: 0, border: 'none' }}
          inputProps={{ 'aria-hidden': true }}
        />
        <div onClick={() => triggerColorPicker(colorInputId)} style={{ cursor: 'pointer' }}>
          <ColorPreview color={selectedColor} />
        </div>
        <Typography>{selectedColor}</Typography>
      </Stack>
    </MainCard>
  );
}

ColorPickerCard.propTypes = { color: PropTypes.string, cardSx: PropTypes.any, onColorChange: PropTypes.func };
