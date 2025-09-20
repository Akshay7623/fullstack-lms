import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';

// third-party
import ReactApexChart from 'react-apexcharts';

// project-imports
import { ThemeMode } from 'config';

// ==============================|| STATISTICS - CHART ||============================== //

// chart options
const areaChartOptions = {
  chart: {
    type: 'area',
    toolbar: { show: false },
    zoom: { enabled: false }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  legend: { show: true, position: 'top', horizontalAlign: 'right' },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      type: 'vertical',
      inverseColors: false,
      opacityFrom: 0.4,
      opacityTo: 0
    }
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: function (val) {
        return `$${val}`;
      }
    }
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      formatter: function (value) {
        return `$${value}`;
      }
    }
  }
};

// ==============================|| DASHBOARD - STATISTICS CARD ||============================== //

export default function StatisticsChart({ data }) {
  const theme = useTheme();
  const [chartSeries, setChartSeries] = useState(data);
  const [chartOptions, setChartOptions] = useState(areaChartOptions);

  useEffect(() => {
    const { mode, text, divider, primary, success } = theme.palette;
    setChartOptions((prev) => ({
      ...prev,
      colors: [primary.main, success.main],
      xaxis: {
        ...prev.xaxis,
        labels: { style: { colors: text.secondary } },
        axisBorder: { color: divider }
      },
      yaxis: { ...prev.yaxis, labels: { ...prev.yaxis.labels, style: { colors: text.secondary } } },
      grid: { borderColor: divider },
      theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' }
    }));
  }, [theme]);

  useEffect(() => {
    setChartSeries(data);
  }, [data]);

  return <ReactApexChart options={chartOptions} series={chartSeries} type="area" height={260} />;
}

StatisticsChart.propTypes = { data: PropTypes.array };
