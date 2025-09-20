import PropTypes from 'prop-types';
// material-ui
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';

// assets
import { ArrowRight2 } from 'iconsax-react';

// ==============================|| DASHBOARD - COURSE LIST ||============================== //

export default function CourseListCard({ data, title }) {
  return (
    <MainCard content={false} sx={{ height: 1 }}>
      <Box sx={{ p: 2.5 }}>
        <Typography variant="h5">{title}</Typography>
      </Box>
      <List disablePadding>
        {data.map((value, index) => (
          <ListItemButton divider dense key={index} sx={{ px: 2.5, py: 1.5, m: 0, borderRadius: 0 }}>
            <ListItemAvatar sx={{ minWidth: 40 }}>
              <Avatar alt="course image" variant="rounded" src={value.image} sx={{ background: 'none' }} />
            </ListItemAvatar>
            <ListItemText sx={{ mx: 1.25 }} primary={<Typography>{value.title}</Typography>} />
            <ArrowRight2 size={16} />
          </ListItemButton>
        ))}
      </List>
    </MainCard>
  );
}

CourseListCard.propTypes = { title: PropTypes.string, data: PropTypes.array };
