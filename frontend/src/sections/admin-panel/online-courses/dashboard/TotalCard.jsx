import PropTypes from 'prop-types';
// material-ui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import { ToatlChart } from './charts/TotalChart';
import MainCard from 'components/MainCard';

// assets
import { ArrowUp } from 'iconsax-react';

// ==============================|| DASHBOARD - TOTAL CARD ||============================== //

export default function TotalCard({ title, amount, percentage, color, data }) {
  const isPositivePercentage = percentage > 0;

  const formattedAmount = Intl.NumberFormat().format(amount);
  const formattedPercentage = `${isPositivePercentage ? '+' : '-'}${Math.abs(percentage)}%`;
  const arrowRotation = isPositivePercentage ? 'rotate(45deg)' : 'rotate(135deg)';

  return (
    <MainCard content={false} sx={{ p: 2.5 }}>
      <Stack sx={{ gap: 1 }}>
        <Typography variant="body2">{title}</Typography>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
          <Typography variant="h3">{formattedAmount}</Typography>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', gap: 0.25, '& .arrow-up': { color: 'success.main' }, '& .arrow-down': { color: 'error.main' } }}
          >
            <Typography variant="body2">{formattedPercentage}</Typography>
            <ArrowUp size={16} className={isPositivePercentage ? 'arrow-up' : 'arrow-down'} style={{ transform: arrowRotation }} />
          </Stack>
        </Stack>
        <ToatlChart color={color} data={data} />
      </Stack>
    </MainCard>
  );
}

TotalCard.propTypes = {
  title: PropTypes.string,
  amount: PropTypes.number,
  percentage: PropTypes.number,
  color: PropTypes.string,
  data: PropTypes.array
};
