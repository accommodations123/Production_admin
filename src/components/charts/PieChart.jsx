// src/components/charts/PieChart.js
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data, title, height = 300 }) => {
  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        data: data.values || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // Blue
          'rgba(34, 197, 94, 0.8)',  // Green
          'rgba(249, 115, 22, 0.8)', // Orange
          'rgba(239, 68, 68, 0.8)',  // Red
          'rgba(168, 85, 247, 0.8)', // Purple
          'rgba(236, 72, 153, 0.8)', // Pink
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%', // Makes it a doughnut
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        }
      },
      title: {
        display: false
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  return (
    <div style={{ height, position: 'relative' }}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Optional: Add total or center text here if needed later */}
        {/* <div className="text-center">
             <div className="text-sm text-gray-400">Total</div>
             <div className="text-2xl font-bold text-gray-800">{data.values?.reduce((a, b) => a + b, 0) || 0}</div>
           </div> */}
      </div>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default PieChart;