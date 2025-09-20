import PropTypes from 'prop-types';
// material-ui
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// assets
import { ArrowDown2, ArrowUp2 } from 'iconsax-react';

var SortType;

(function (SortType) {
  SortType['ASC'] = 'asc';
  SortType['DESC'] = 'desc';
})(SortType || (SortType = {}));

function SortToggler({ type }) {
  return (
    <Stack
      sx={{
        fontSize: '0.625rem',
        color: 'secondary.light',
        ...(type === SortType.ASC && { '& .caret-up': { color: 'secondary.main' } }),
        ...(type === SortType.DESC && { '& .caret-down': { color: 'secondary.main' } })
      }}
    >
      <ArrowUp2 className="caret-up" size="15" variant="Bold" style={{ fontSize: '0.625rem' }} />
      <ArrowDown2 className="caret-down" size="15" variant="Bold" style={{ fontSize: '0.625rem', marginTop: -8 }} />
    </Stack>
  );
}

// ==============================|| SORT HEADER ||============================== //

export default function HeaderSort({ column, sort }) {
  return (
    <Box {...(sort && { onClick: column.getToggleSortingHandler(), className: 'cursor-pointer prevent-select' })}>
      {{
        asc: <SortToggler type={SortType.ASC} />,
        desc: <SortToggler type={SortType.DESC} />
      }[column.getIsSorted()] ?? <SortToggler />}
    </Box>
  );
}

SortToggler.propTypes = { type: PropTypes.any };

HeaderSort.propTypes = { column: PropTypes.object, sort: PropTypes.bool };
