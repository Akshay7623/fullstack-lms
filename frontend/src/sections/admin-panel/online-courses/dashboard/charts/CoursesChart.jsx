import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';

// third-party
import ReactApexChart from 'react-apexcharts';

// project-imports
import { ThemeMode } from 'config';

// Initial chart options
const baseChartOptions = {
  chart: { type: 'bar', toolbar: { show: false }, offsetX: -5 },
  plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
  yaxis: { labels: { show: false } },
  legend: { show: true, position: 'top', horizontalAlign: 'right' },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 3, colors: ['transparent'] },
  grid: { strokeDashArray: 4 },
  tooltip: { y: { formatter: (val) => `$${val} thousands` } },
  xaxis: {
    categories: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
    axisTicks: { show: false }
  }
};

// ==============================|| DASHBOARD - COURSES CHART ||============================== //

export default function CoursesChart({ data }) {
  const theme = useTheme();

  const [chartSeries, setChartSeries] = useState(data);
  const [chartOptions, setChartOptions] = useState(baseChartOptions);

  useEffect(() => {
    setChartOptions((prev) => ({
      ...prev,
      colors: [theme.palette.primary.main, theme.palette.warning.main],
      grid: { ...prev.grid, borderColor: theme.palette.divider },
      xaxis: {
        ...prev.xaxis,
        labels: { style: { colors: theme.palette.text.secondary } },
        axisBorder: { color: theme.palette.divider }
      },
      theme: { mode: theme.palette.mode === ThemeMode.DARK ? 'dark' : 'light' }
    }));
  }, [theme]);

  useEffect(() => {
    setChartSeries(data);
  }, [data]);

  return <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={190} />;
}

CoursesChart.propTypes = { data: PropTypes.array };
