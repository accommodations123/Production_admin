// src/components/charts/LineChart.js
import React, { useRef, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({ data, title, height = 300 }) => {
  const chartRef = useRef(null);
  const [gradient, setGradient] = useState(null);

  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      const ctx = chart.ctx;
      const gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
      gradientFill.addColorStop(0, 'rgba(0, 22, 45, 0.4)'); // Brand Dark Blue
      gradientFill.addColorStop(1, 'rgba(0, 22, 45, 0.0)');
      setGradient(gradientFill);
    }
  }, [chartRef]);

  /* ======================================================
     CHART DATA CONSTRUCTION
  ====================================================== */
  // Enhanced to support multiple datasets if provided in data.datasets
  const chartData = data.datasets ? {
    labels: data.labels || [],
    datasets: data.datasets
  } : {
    labels: data.labels || [],
    datasets: [
      {
        label: title,
        data: data.values || [],
        borderColor: 'rgb(0, 22, 45)', // Brand Dark Blue
        backgroundColor: gradient || 'rgba(0, 22, 45, 0.1)',
        tension: 0.4, // Smooth curve
        fill: true,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: 'rgb(0, 22, 45)',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        // Show legend if there are multiple datasets
        display: !!data.datasets
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        border: {
          display: false
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.04)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#64748b'
        }
      },
      x: {
        border: {
          display: false
        },
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#64748b'
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <div style={{ height }}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default LineChart;