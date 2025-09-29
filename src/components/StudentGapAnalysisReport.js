import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import './StudentGapAnalysisReport.css';

const StudentGapAnalysisReport = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const sessionFromState = location.state?.session;

  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  // Initial fetch if sessionFromState exists or to fetch available sessions
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (sessionFromState) {
          const response = await axiosInstance.post(`/gap-analysis-report/`, sessionFromState);
          setGapData(response.data);
        } else {
          const response = await axiosInstance.get(`/allsessionsdata/`);
          console.log('Fetched sessions:', response.data.sessions);
          setSessions(response.data.sessions || []);
        }
      } catch (err) {
        setError('Failed to fetch session or gap analysis data.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [sessionFromState]);

  // Manual trigger when "Run Gap Analysis" button is clicked
  const runGapAnalysis = async () => {
    if (!selectedSession) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.post(`/gap-analysis-report/`, selectedSession);
      setGapData(response.data);
    } catch (err) {
      setError('Failed to fetch gap analysis data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="gap-analysis-loading">Loading...</div>;
  if (error) return <div className="gap-analysis-error">{error}</div>;

  // If session is not passed and no gap data yet
  if (!sessionFromState && !gapData && sessions.length > 0) {
    return (
      <div className="gap-analysis-report">
        <h2>Select a Session for Gap Analysis</h2>
        <select
        onChange={(e) => {
            const selected = sessions.find(s => s.timestamp == e.target.value); // <= safer matching
            setSelectedSession(selected);
        }}
        defaultValue=""
        >
        <option value="" disabled>Select a session</option>
        {sessions.map((session) => (
            <option key={session.id} value={session.timestamp}>
            {session.title || `Session ${session.timestamp}`} - {session.date}
            </option>
        ))}
        </select>

        {/* {console.log('Selected session:', selectedSession)} */}
        <br /><br />
        <button onClick={runGapAnalysis} disabled={!selectedSession}>
        Run Gap Analysis
        </button>

      </div>
    );
  }

  if (!gapData) return <div className="gap-analysis-empty">No data found.</div>;

  return (
    <div className="gap-analysis-report">
      <h2>Gap Analysis Report</h2>
      <pre>{JSON.stringify(gapData, null, 2)}</pre>
    </div>
  );
};

export default StudentGapAnalysisReport;
