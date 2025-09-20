import PropTypes from 'prop-types';
// material-ui
import Box from '@mui/material/Box';

// assets
import { Clock, MinusCirlce, TickCircle } from 'iconsax-react';

// ==============================|| CHAT - AVATAR STATUS ICONS ||============================== //

export default function AvatarStatus({ status }) {
  switch (status) {
    case 'available':
      return (
        <Box component="span" sx={{ color: 'success.main' }}>
          <TickCircle size={14} variant="Bold" />
        </Box>
      );

    case 'do_not_disturb':
      return (
        <Box component="span" sx={(theme) => ({ color: 'secondary.main', ...theme.applyStyles('dark', { color: 'secondary.light' }) })}>
          <MinusCirlce size={14} variant="Bold" />
        </Box>
      );
    case 'offline':
      return (
        <Box component="span" sx={{ color: 'warning.main' }}>
          <Clock size={14} variant="Bold" />
        </Box>
      );

    default:
      return null;
  }
}

AvatarStatus.propTypes = { status: PropTypes.string };
