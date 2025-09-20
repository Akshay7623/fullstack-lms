import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import ButtonBase from '@mui/material/ButtonBase';
import Grid from '@mui/material/Grid2';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// project-imports
import ColorOptions from './ColorOptions';
import Avatar from 'components/@extended/Avatar';

// ==============================|| PRODUCT - COLOR ||============================== //

function Color({ bg, id, colors, label, handelFilter }) {
  return (
    <Grid>
      <Tooltip title={label}>
        <ButtonBase
          sx={(theme) => ({
            borderRadius: '50%',
            '&:focus-visible': { outline: `2px solid ${theme.palette.secondary.dark}`, outlineOffset: 2 }
          })}
          onClick={() => handelFilter('colors', id)}
        >
          <Avatar
            color="inherit"
            size="sm"
            sx={(theme) => ({
              bgcolor: bg,
              color: 'secondary.lighter',
              ...theme.applyStyles('dark', {
                color: 'secondary.800'
              }),
              border: '3px solid',
              borderColor: colors.some((item) => item === id) ? 'secondary.light' : 'background.paper'
            })}
          >
            {' '}
          </Avatar>
        </ButtonBase>
      </Tooltip>
    </Grid>
  );
}

// ==============================|| PRODUCT - COLOR ||============================== //

export default function Colors({ colors, handelFilter }) {
  const [isColorsLoading, setColorLoading] = useState(true);
  useEffect(() => {
    setColorLoading(false);
  }, []);

  return (
    <>
      {isColorsLoading ? (
        <Grid size={12}>
          <Skeleton variant="rectangular" width="100%" height={158} />
        </Grid>
      ) : (
        <Stack>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Color
          </Typography>
          <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
            {ColorOptions.map((color, index) => (
              <Color key={index} id={color.value} bg={color.bg} label={color.label} colors={colors} handelFilter={handelFilter} />
            ))}
          </Grid>
        </Stack>
      )}
    </>
  );
}

Color.propTypes = {
  bg: PropTypes.string,
  id: PropTypes.string,
  colors: PropTypes.array,
  label: PropTypes.string,
  handelFilter: PropTypes.any
};

Colors.propTypes = { colors: PropTypes.array, handelFilter: PropTypes.func };
