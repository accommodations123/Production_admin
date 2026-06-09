// src/components/charts/BarChart.js
import React, { useRef, useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ data, title, height = 300 }) => {
  const chartRef = useRef(null);
  const [gradient, setGradient] = useState(null);

  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      const ctx = chart.ctx;
      const gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
      gradientFill.addColorStop(0, 'rgba(0, 22, 45, 1)');
      gradientFill.addColorStop(1, 'rgba(0, 22, 45, 0.6)');
      setGradient(gradientFill);
    }
  }, [chartRef]);

  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        label: title,
        data: data.values || [],
        backgroundColor: gradient || 'rgba(0, 22, 45, 0.8)',
        borderRadius: 4,
        barThickness: 'flex',
        maxBarThickness: 40,
        hoverBackgroundColor: 'rgba(203, 41, 38, 0.8)', // Hover color (secondary brand color)
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
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
        cornerRadius: 8,
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
          color: '#64748b'
        }
      }
    }
  };

  return (
    <div style={{ height }}>
      <Bar ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default BarChart;