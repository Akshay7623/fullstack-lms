import PropTypes from 'prop-types';
// material-ui
import Badge from '@mui/material/Badge';

// project-imports
import AvatarStatus from './AvatarStatus';
import Avatar from 'components/@extended/Avatar';

import { ImagePath, getImageUrl } from 'utils/getImageUrl';

// ==============================|| CHAT - USER AVATAR WITH STATUS ICON ||============================== //

export default function UserAvatar({ user }) {
  return (
    <Badge
      overlap="circular"
      badgeContent={<AvatarStatus status={user.online_status} />}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={(theme) => ({
        '& .MuiBox-root': { width: 6, height: 6 },
        '& .MuiBadge-badge': { top: '3%', right: '25%' },
        padding: 0,
        minWidth: 12,
        '& svg': { bgcolor: 'background.paper', borderRadius: '50%', ...theme.applyStyles('dark', { bgcolor: 'text.primary' }) }
      })}
    >
      <Avatar alt={user.name} src={user.avatar && getImageUrl(`${user.avatar}`, ImagePath.USERS)} />
    </Badge>
  );
}

UserAvatar.propTypes = { user: PropTypes.any };
