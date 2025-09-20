import PropTypes from 'prop-types';
import { memo } from 'react';

// material-ui
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

// project-imports
import ControlPanelStyled from 'components/third-party/map/ControlPanelStyled';

// ==============================|| SIDE BY SIDE - CONTROL ||============================== //

function ControlPanel({ mode, onModeChange }) {
  return (
    <ControlPanelStyled>
      <ToggleButtonGroup value={mode} exclusive onChange={onModeChange}>
        <ToggleButton
          sx={(theme) => ({ border: '1px solid', borderColor: 'grey.50', ...theme.applyStyles('dark', { borderColor: 'grey.700' }) })}
          value="side-by-side"
        >
          Side by side
        </ToggleButton>
        <ToggleButton
          sx={(theme) => ({ border: '1px solid', borderColor: 'grey.50', ...theme.applyStyles('dark', { borderColor: 'grey.700' }) })}
          value="split-screen"
        >
          Split screen
        </ToggleButton>
      </ToggleButtonGroup>
    </ControlPanelStyled>
  );
}

export default memo(ControlPanel);

ControlPanel.propTypes = { mode: PropTypes.any, onModeChange: PropTypes.any };
