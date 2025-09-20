import PropTypes from 'prop-types';
// material-ui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';

// ============================|| DASHBOARD - COURSE CARD ||============================ //

export default function CourseCard({ title, counter, icon, color, bgcolor, percentage }) {
  const IconPrimary = icon;
  const primaryIcon = icon ? <IconPrimary /> : null;

  return (
    <MainCard content={false} sx={{ p: 2.5 }}>
      <Stack direction="row" gap={2} alignItems="center">
        <Avatar variant="rounded" sx={{ bgcolor, color }} size="md">
          {primaryIcon}
        </Avatar>
        <Stack width={1}>
          <Typography color="text.secondary">{title}</Typography>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5">{counter}</Typography>
            <Typography color={color}>{percentage}%</Typography>
          </Stack>
        </Stack>
      </Stack>
    </MainCard>
  );
}

CourseCard.propTypes = {
  title: PropTypes.string,
  counter: PropTypes.string,
  icon: PropTypes.any,
  color: PropTypes.string,
  bgcolor: PropTypes.string,
  percentage: PropTypes.number
};
