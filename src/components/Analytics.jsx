import React, { useEffect, useState } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axiosInstance from '../api/axiosInstance';
import './Analytics.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAverageScores = async () => {
      try {
        const response = await axiosInstance.get('/average-score/');
        const data = response.data;

        // Transform backend data: keys are chapter numbers, values are scores
        const chapterNumbers = Object.keys(data).sort((a, b) => Number(a) - Number(b));
        const labels = chapterNumbers.map(num => `Chapter ${num}`);
        const scores = chapterNumbers.map(num => Number(data[num]));

        setChartData({
          labels,
          datasets: [
            {
              label: 'Average Score (%)',
              data: scores,
              backgroundColor: '#00C1D4',
              borderColor: '#001B6C',
              borderWidth: 1,
              borderRadius: 6,
              hoverBackgroundColor: '#001B6C'
            }
          ]
        });
      } catch (error) {
        setChartData({
          labels: [],
          datasets: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAverageScores();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#001B6C',
          font: { weight: 'bold' }
        }
      },
      title: {
        display: true,
        text: 'Student Progress by Chapter',
        color: '#001B6C',
        font: { size: 20, weight: 'bold' },
        padding: 20
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#001B6C' }
      },
      y: {
        beginAtZero: true,
        max: 10,
        grid: { color: 'rgba(0, 193, 212, 0.1)' },
        ticks: {
          color: '#001B6C',
          callback: value => `${value}%`
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    }
  };

  return (
    <div className="analytics-container">
      <Container className="analytics-content">
        <h2 className="analytics-title">Analytics Dashboard</h2>
        <div className="chart-wrapper" style={{ minHeight: 400 }}>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
              <Spinner animation="border" variant="info" />
            </div>
          ) : (
            <Bar data={chartData} options={options} />
          )}
        </div>
      </Container>
    </div>
  );
};

export default Analytics;