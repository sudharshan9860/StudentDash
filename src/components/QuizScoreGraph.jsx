import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBolt, faTrophy, faBullseye, faChartBar,
} from '@fortawesome/free-solid-svg-icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceArea, ReferenceLine,
} from 'recharts';
import axiosInstance from '../api/axiosInstance';
import mascotGif from '../assets/newbot.gif';
import './QuizScoreGraph.css';

/* ── constants ── */
const TARGET_ZONE_MIN = 75;
const DANGER_ZONE_MAX = 35;
const DEFAULT_SUBJECT = 'Mathematics';

const QUIZ_COLORS = [
  '#fb923c', '#60a5fa', '#4ade80', '#f472b6', '#38bdf8',
  '#fbbf24', '#a78bfa', '#34d399', '#f87171', '#67e8f9',
];

const getQuizColor = (idx) => QUIZ_COLORS[idx % QUIZ_COLORS.length];

/* ── truncate long chapter names for X-axis ── */
const TruncatedTick = ({ x, y, payload }) => {
  const isDark = document.body.classList.contains('dark-mode');
  const maxLen = 14;
  const text = payload.value.length > maxLen
    ? payload.value.slice(0, maxLen) + '...'
    : payload.value;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0} y={0} dy={8}
        textAnchor="end"
        transform="rotate(-35)"
        fill={isDark ? 'rgba(148,163,184,0.7)' : 'rgba(100,116,139,0.8)'}
        fontSize={10}
        fontWeight={600}
        fontFamily="Inter, system-ui, sans-serif"
      >
        {text}
      </text>
    </g>
  );
};

/* ── overlapping nested bars ── */
const OverlappingBars = (props) => {
  const { x, y, width, height, payload } = props;
  if (!height || height <= 0 || !payload) return null;

  const sorted = payload._sortedAttempts || [];
  const maxScore = payload._maxScore || 1;
  const baseline = y + height;

  return (
    <g>
      {sorted.map((att, i) => {
        const barH = (att.score_pct / maxScore) * height;
        if (barH <= 0) return null;
        const barY = baseline - barH;
        const shrink = i * 5;
        const barW = Math.max(width - shrink, 10);
        const barX = x + (width - barW) / 2;
        const r = Math.min(barW / 3, 6);
        const gradId = `obg-${att.colorHex}-${i}`;

        return (
          <g key={i}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={att.color} stopOpacity={1} />
                <stop offset="100%" stopColor={att.color} stopOpacity={0.72} />
              </linearGradient>
            </defs>
            <path
              d={`
                M${barX},${baseline}
                L${barX},${barY + r}
                Q${barX},${barY} ${barX + r},${barY}
                L${barX + barW - r},${barY}
                Q${barX + barW},${barY} ${barX + barW},${barY + r}
                L${barX + barW},${baseline}
                Z
              `}
              fill={`url(#${gradId})`}
            />
            <rect
              x={barX + 1} y={barY + r}
              width={Math.max(barW * 0.1, 2)}
              height={Math.max(barH - r, 0)}
              fill="rgba(255,255,255,0.15)"
              rx={1}
            />
          </g>
        );
      })}
    </g>
  );
};

/* ── custom tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const isDark = document.body.classList.contains('dark-mode');
  const entry = payload[0]?.payload;
  const attempts = entry?._attempts || [];
  const latestScore = attempts.length > 0 ? attempts[attempts.length - 1].score_pct : 0;

  return (
    <div className="qsg-tooltip" data-dark={isDark}>
      <div className="qsg-tooltip-header">
        <span className="qsg-tooltip-title">{label}</span>
        <span className="qsg-tooltip-score">{latestScore}%</span>
      </div>

      <div className="qsg-tooltip-attempts-label">
        {attempts.length} attempt{attempts.length !== 1 ? 's' : ''}
      </div>

      <div className="qsg-tooltip-divider" />

      {attempts.map((att, i) => {
        const isLatest = i === attempts.length - 1;
        const improvement = i > 0 ? att.score_pct - attempts[i - 1].score_pct : null;
        return (
          <div key={i} className={`qsg-tooltip-row ${isLatest && attempts.length > 1 ? 'qsg-tooltip-row-latest' : ''}`}>
            <span className="qsg-tooltip-dot" style={{ background: att.color }} />
            <span className="qsg-tooltip-ch">
              {att.quizLabel}{isLatest && attempts.length > 1 ? ' (Latest)' : ''}
            </span>
            <span className="qsg-tooltip-val">
              {att.correct}/{att.total}{' '}
              <strong>{att.score_pct}%</strong>
              {improvement !== null && improvement !== 0 && (
                <span className={`qsg-tooltip-delta ${improvement > 0 ? 'qsg-delta-up' : 'qsg-delta-down'}`}>
                  {improvement > 0 ? '\u2191' : '\u2193'}{Math.abs(improvement)}%
                </span>
              )}
            </span>
          </div>
        );
      })}

      <div className="qsg-tooltip-divider" />
      <div className="qsg-tooltip-footer">
        <span className={`qsg-tz-badge ${latestScore >= TARGET_ZONE_MIN ? 'qsg-tz-target' : latestScore <= DANGER_ZONE_MAX ? 'qsg-tz-danger' : 'qsg-tz-mid'}`}>
          {latestScore >= TARGET_ZONE_MIN ? 'On Target' : latestScore <= DANGER_ZONE_MAX ? 'Needs Work' : 'Improving'}
        </span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════ */
const QuizScoreGraph = () => {
  const [rawQuizzes, setRawQuizzes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null); // null = auto-select first

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await axiosInstance.fetchQuizzes();
        const quizzes = Array.isArray(data) ? data : (data.quizzes || []);
        setRawQuizzes(quizzes.length > 0 ? quizzes : null);
      } catch (e) {
        console.error('Quiz score fetch error:', e);
        setError('Failed to load score data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Extract unique subjects from all quizzes ── */
  const subjects = useMemo(() => {
    if (!rawQuizzes) return [];
    const subjectSet = new Set();
    rawQuizzes.forEach((quiz) => {
      const subject = quiz.graph_data?.subject || DEFAULT_SUBJECT;
      subjectSet.add(subject);
    });
    return [...subjectSet].sort();
  }, [rawQuizzes]);

  // Auto-select first subject when data loads
  useEffect(() => {
    if (subjects.length > 0 && selectedSubject === null) {
      setSelectedSubject(subjects[0]);
    }
  }, [subjects, selectedSubject]);

  /* ── Filter quizzes by selected subject, then build chart ── */
  const { chartData, quizLabels, quizColorMap, stats } = useMemo(() => {
    if (!rawQuizzes || !selectedSubject) return { chartData: [], quizLabels: [], quizColorMap: {}, stats: null };

    // Filter quizzes that belong to the selected subject
    const filtered = rawQuizzes.filter((quiz) => {
      const subject = quiz.graph_data?.subject || DEFAULT_SUBJECT;
      return subject === selectedSubject;
    });

    if (filtered.length === 0) return { chartData: [], quizLabels: [], quizColorMap: {}, stats: null };

    const labels = filtered.map((_, i) => `Test ${i + 1}`);
    const colorMap = {};
    labels.forEach((q, i) => { colorMap[q] = getQuizColor(i); });

    const chapterMap = {};
    filtered.forEach((quiz, qIdx) => {
      const breakdown = quiz.graph_data?.chapter_breakdown || [];
      const quizLabel = labels[qIdx];
      breakdown.forEach((ch) => {
        if (!chapterMap[ch.chapter]) chapterMap[ch.chapter] = [];
        chapterMap[ch.chapter].push({
          quizLabel,
          correct: ch.correct,
          total: ch.total,
          score_pct: ch.score_pct,
          color: colorMap[quizLabel],
          colorHex: colorMap[quizLabel].replace('#', ''),
        });
      });
    });

    const data = Object.entries(chapterMap).map(([chapter, attempts]) => {
      const maxScore = Math.max(...attempts.map((a) => a.score_pct));
      const sortedAttempts = [...attempts].sort((a, b) => b.score_pct - a.score_pct);
      return {
        chapter,
        _maxScore: maxScore,
        _attempts: attempts,
        _sortedAttempts: sortedAttempts,
      };
    });

    const activeLabels = labels.filter((q) =>
      data.some((entry) => entry._attempts.some((a) => a.quizLabel === q))
    );

    const allScores = data.flatMap((d) => d._attempts.map((a) => a.score_pct));
    const bestScore = allScores.length > 0 ? Math.max(...allScores) : 0;

    return {
      chartData: data,
      quizLabels: activeLabels,
      quizColorMap: colorMap,
      stats: { totalQuizzes: filtered.length, chapters: data.length, bestScore },
    };
  }, [rawQuizzes, selectedSubject]);

  const statCards = stats ? [
    { label: 'Tests', value: stats.totalQuizzes, icon: faChartBar, color: '#6366f1' },
    { label: 'Chapters', value: stats.chapters, icon: faBullseye, color: '#f97316' },
    { label: 'Best Score', value: `${stats.bestScore.toFixed(1)}%`, icon: faTrophy, color: '#22c55e' },
  ] : [];

  if (loading) {
    return (
      <div className={`qsg-root ${mounted ? 'qsg-mounted' : ''}`}>
        <div className="qsg-loading"><div className="qsg-loading-ring" /><p>Loading your progress...</p></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className={`qsg-root ${mounted ? 'qsg-mounted' : ''}`}>
        <div className="qsg-error"><p>{error}</p></div>
      </div>
    );
  }
  if (!rawQuizzes) {
    return (
      <div className={`qsg-empty-wrap ${mounted ? 'qsg-mounted' : ''}`}>
        <img src={mascotGif} alt="Study Buddy" className="qsg-empty-mascot" />
        <div className="qsg-empty-content">
          <p className="qsg-empty-text">Take a Test to unlock your subject-wise score chart!</p>
          <Link to="/quiz-mode" className="qsg-empty-cta"><FontAwesomeIcon icon={faBolt} /> Start First Quiz</Link>
        </div>
      </div>
    );
  }

  const isDark = document.body.classList.contains('dark-mode');

  return (
    <div className={`qsg-root ${mounted ? 'qsg-mounted' : ''}`}>
      <div className="qsg-blob qsg-blob-1" />
      <div className="qsg-blob qsg-blob-2" />

      <div className="qsg-header">
        <div className="qsg-title-row">
          <h3 className="qsg-title">Subject-wise Score Breakdown</h3>
          {subjects.length > 1 && (
            <select
              className="qsg-subject-select"
              value={selectedSubject || ''}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="qsg-stats">
        {statCards.map((s, i) => (
          <div key={s.label} className="qsg-stat-card" style={{ '--delay': `${i * 80}ms`, '--accent': s.color }}>
            <div className="qsg-stat-icon-wrap" style={{ background: `${s.color}15`, color: s.color }}>
              <FontAwesomeIcon icon={s.icon} />
            </div>
            <span className="qsg-stat-val">{s.value}</span>
            <span className="qsg-stat-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="qsg-graph-card">
        <div className="qsg-canvas-wrap">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                barCategoryGap="20%"
              >
                <defs>
                  <linearGradient id="targetZoneGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.04} />
                  </linearGradient>
                  <linearGradient id="dangerZoneGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.04} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.12} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 5"
                  vertical={false}
                  stroke={isDark ? 'rgba(148,163,184,0.08)' : 'rgba(148,163,184,0.18)'}
                />

                <ReferenceArea y1={0} y2={DANGER_ZONE_MAX} fill="url(#dangerZoneGrad)" fillOpacity={1} ifOverflow="extendDomain" />
                <ReferenceArea y1={TARGET_ZONE_MIN} y2={100} fill="url(#targetZoneGrad)" fillOpacity={1} ifOverflow="extendDomain" />

                <ReferenceLine
                  y={DANGER_ZONE_MAX} stroke="#ef4444" strokeDasharray="6 4" strokeWidth={1.5} strokeOpacity={0.6}
                  label={{ value: `${DANGER_ZONE_MAX}%`, position: 'right', fill: '#ef4444', fontSize: 10, fontWeight: 700 }}
                />
                <ReferenceLine
                  y={TARGET_ZONE_MIN} stroke="#22c55e" strokeDasharray="6 4" strokeWidth={1.5} strokeOpacity={0.6}
                  label={{ value: `${TARGET_ZONE_MIN}%`, position: 'right', fill: '#22c55e', fontSize: 10, fontWeight: 700 }}
                />

                <XAxis
                  dataKey="chapter"
                  tick={<TruncatedTick />}
                  axisLine={{ stroke: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.25)' }}
                  tickLine={false}
                  interval={0}
                />

                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11, fontWeight: 600, fill: isDark ? 'rgba(148,163,184,0.6)' : 'rgba(100,116,139,0.7)' }}
                  axisLine={{ stroke: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.25)' }}
                  tickLine={false}
                  label={{
                    value: 'Score (%)', angle: -90, position: 'insideLeft', offset: 10,
                    style: { fontSize: 11, fontWeight: 600, textAnchor: 'middle', fill: isDark ? 'rgba(148,163,184,0.5)' : 'rgba(100,116,139,0.6)' },
                  }}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', radius: 4 }}
                />

                <Bar
                  dataKey="_maxScore"
                  shape={<OverlappingBars />}
                  maxBarSize={64}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="qsg-no-data">No test data for {selectedSubject}</div>
          )}
        </div>

        <div className="qsg-legend">
          {/* {quizLabels.map((q) => (
            <div key={q} className="qsg-legend-item">
              <span className="qsg-leg-bar" style={{ background: quizColorMap[q] }} />
              <span>{q}</span>
            </div>
          ))} */}
          <div className="qsg-legend-item">
            <span className="qsg-leg-zone qsg-leg-target" />
            <span>Target Zone</span>
          </div>
          <div className="qsg-legend-item">
            <span className="qsg-leg-zone qsg-leg-danger" />
            <span>Danger Zone</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizScoreGraph;
