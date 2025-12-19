import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faArrowUp, faArrowDown, faMinus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../api/axiosInstance';
import './ProgressGraph.css';

const ProgressGraph = ({ username }) => {
  const [progressData, setProgressData] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [trend, setTrend] = useState('neutral'); // 'up', 'down', 'neutral'
  const [percentageChange, setPercentageChange] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  // Fetch progress data from API
  useEffect(() => {
    const fetchProgressData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get('/learning-path-graph/');

        if (response.data && response.data.plans && response.data.plans.length > 0) {
          setPlans(response.data.plans);
          // Select the first plan by default (most recent)
          processPlansData(response.data.plans, 0);
        } else {
          setError('No learning path data available');
          setProgressData([]);
        }
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError('Failed to load progress data');
        setProgressData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgressData();
  }, [username]);

  // Process plans data for the selected plan
  const processPlansData = (plansData, planIndex) => {
    if (!plansData || plansData.length === 0) return;

    const selectedPlan = plansData[planIndex];
    if (!selectedPlan || !selectedPlan.graph) return;

    // Transform API data to the format needed for the graph
    const data = selectedPlan.graph.map((item, index) => ({
      day: item.day,
      points: item.points,
      date: new Date(Date.now() - (selectedPlan.graph.length - 1 - index) * 24 * 60 * 60 * 1000)
    }));

    setProgressData(data);
    setSelectedPlanIndex(planIndex);

    // Calculate trend based on points
    if (data.length >= 2) {
      const recentPoints = data.slice(-3).reduce((sum, d) => sum + d.points, 0);
      const olderPoints = data.slice(0, Math.min(3, data.length)).reduce((sum, d) => sum + d.points, 0);

      if (olderPoints === 0 && recentPoints === 0) {
        setTrend('neutral');
        setPercentageChange(0);
      } else if (olderPoints === 0) {
        setTrend('up');
        setPercentageChange(100);
      } else {
        const change = ((recentPoints - olderPoints) / olderPoints) * 100;
        setPercentageChange(Math.abs(change).toFixed(1));
        if (change > 5) setTrend('up');
        else if (change < -5) setTrend('down');
        else setTrend('neutral');
      }
    }
  };

  // Handle plan selection change
  const handlePlanChange = (e) => {
    const newIndex = parseInt(e.target.value, 10);
    processPlansData(plans, newIndex);
  };

  // Draw the graph
  useEffect(() => {
    if (!canvasRef.current || progressData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size with device pixel ratio for sharp rendering
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find min/max points for scaling
    const points = progressData.map(d => d.points);
    const maxPoints = Math.max(...points, 10); // Minimum scale of 10
    const minPoints = 0;
    const pointsRange = maxPoints - minPoints;

    // Calculate graph points
    const graphPoints = progressData.map((d, i) => ({
      x: padding.left + (i / Math.max(progressData.length - 1, 1)) * graphWidth,
      y: padding.top + graphHeight - ((d.points - minPoints) / pointsRange) * graphHeight,
      points: d.points,
      day: d.day,
      date: d.date
    }));

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    if (trend === 'up') {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
    } else if (trend === 'down') {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.02)');
    } else {
      gradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
      gradient.addColorStop(1, 'rgba(102, 126, 234, 0.02)');
    }

    // Draw filled area under the line
    if (graphPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(graphPoints[0].x, height - padding.bottom);
      graphPoints.forEach(point => ctx.lineTo(point.x, point.y));
      ctx.lineTo(graphPoints[graphPoints.length - 1].x, height - padding.bottom);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (graphHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Draw points labels
      const pointsLabel = Math.round(maxPoints - (pointsRange / 4) * i);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(pointsLabel.toString(), padding.left - 8, y + 3);
    }

    // Draw the main line
    if (graphPoints.length > 1) {
      ctx.beginPath();
      ctx.moveTo(graphPoints[0].x, graphPoints[0].y);

      // Use bezier curves for smooth line
      for (let i = 1; i < graphPoints.length; i++) {
        const xc = (graphPoints[i].x + graphPoints[i - 1].x) / 2;
        const yc = (graphPoints[i].y + graphPoints[i - 1].y) / 2;
        ctx.quadraticCurveTo(graphPoints[i - 1].x, graphPoints[i - 1].y, xc, yc);
      }
      ctx.quadraticCurveTo(
        graphPoints[graphPoints.length - 2].x,
        graphPoints[graphPoints.length - 2].y,
        graphPoints[graphPoints.length - 1].x,
        graphPoints[graphPoints.length - 1].y
      );

      // Line style based on trend
      if (trend === 'up') {
        ctx.strokeStyle = '#10b981';
      } else if (trend === 'down') {
        ctx.strokeStyle = '#ef4444';
      } else {
        ctx.strokeStyle = '#667eea';
      }
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // Draw data points
    graphPoints.forEach((point, i) => {
      // Larger point for last data point
      const isLast = i === graphPoints.length - 1;
      const radius = isLast ? 6 : 4;

      // Outer circle
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#667eea';
      ctx.fill();

      // Inner circle
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius - 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Pulse effect on last point
      if (isLast) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = trend === 'up' ? 'rgba(16, 185, 129, 0.4)' : trend === 'down' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(102, 126, 234, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw day labels
    ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';

    if (graphPoints.length > 0) {
      // Show first, middle, and last day labels
      ctx.fillText(`Day ${progressData[0].day}`, graphPoints[0].x, height - 8);
      if (progressData.length > 2) {
        const midIndex = Math.floor(progressData.length / 2);
        ctx.fillText(`Day ${progressData[midIndex].day}`, graphPoints[midIndex].x, height - 8);
      }
      ctx.fillText(`Day ${progressData[progressData.length - 1].day}`, graphPoints[graphPoints.length - 1].x, height - 8);
    }

  }, [progressData, trend]);

  // Calculate stats
  const totalPoints = progressData.reduce((sum, d) => sum + d.points, 0);
  const currentPoints = progressData.length > 0 ? progressData[progressData.length - 1].points : 0;
  const activeDays = progressData.filter(d => d.points > 0).length;
  const selectedPlan = plans[selectedPlanIndex];

  if (isLoading) {
    return (
      <div className="progress-graph-container">
        <div className="progress-graph-loading">
          <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
          <span>Loading progress...</span>
        </div>
      </div>
    );
  }

  if (error || plans.length === 0) {
    return (
      <div className="progress-graph-container">
        <div className="progress-graph-header">
          <div className="progress-title">
            <FontAwesomeIcon icon={faChartLine} className="progress-icon" />
            <span>Learning Progress</span>
          </div>
        </div>
        <div className="progress-graph-empty">
          <p>{error || 'No learning path data available'}</p>
          <span>Complete learning path activities to see your progress!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-graph-container">
      <div className="progress-graph-header">
        <div className="progress-title">
          <FontAwesomeIcon icon={faChartLine} className="progress-icon" />
          <span>Learning Progress</span>
        </div>
        <div className={`progress-trend ${trend}`}>
          <FontAwesomeIcon
            icon={trend === 'up' ? faArrowUp : trend === 'down' ? faArrowDown : faMinus}
          />
          <span>{percentageChange}%</span>
        </div>
      </div>

      {/* Plan Selector */}
      {plans.length > 1 && (
        <div className="progress-plan-selector">
          <select
            value={selectedPlanIndex}
            onChange={handlePlanChange}
            className="plan-select"
          >
            {plans.map((plan, index) => (
              <option key={plan.plan_id} value={index}>
                Plan {plan.plan_id} ({plan.total_days} days)
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="progress-stats-row">
        <div className="progress-stat">
          <span className="stat-value">{totalPoints}</span>
          <span className="stat-label">Total Points</span>
        </div>
        <div className="progress-stat">
          <span className="stat-value">{currentPoints}</span>
          <span className="stat-label">Latest Points</span>
        </div>
        <div className="progress-stat">
          <span className="stat-value">{activeDays}/{selectedPlan?.total_days || progressData.length}</span>
          <span className="stat-label">Active Days</span>
        </div>
      </div>

      <div className="progress-canvas-wrapper">
        <canvas ref={canvasRef} className="progress-canvas" />
      </div>

      <div className="progress-footer">
        <span className="progress-period">
          {selectedPlan ? `${selectedPlan.total_days} day learning path` : 'Learning path progress'}
        </span>
      </div>
    </div>
  );
};

export default ProgressGraph;
