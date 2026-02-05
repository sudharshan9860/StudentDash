import React, { useState, useEffect, useMemo } from 'react';
import MarkdownWithMath from './MarkdownWithMath';
import './QuestionPaperGenerator.css';

// Configuration
const API_BASE_URL = 'https://qgen.smartlearners.ai/api';

// Math Text Renderer
const MathText = React.memo(({ text }) => {
  if (!text) return null;
  return <span className="math-text-content"><MarkdownWithMath content={text} /></span>;
});
MathText.displayName = 'MathText';

// Format question text with line breaks for paper preview
const formatQuestionText = (text) => {
  if (!text) return text;
  let formatted = text;

  // Replace literal \n with newline
  formatted = formatted.replace(/\\n/g, '\n');

  // Step 1: Mark combined patterns to keep them together on same line
  // Handle (i)(a), (i) (a), (ii)(b), (ii) (b), etc. - mark the alpha part
  formatted = formatted.replace(/\((viii|vii|vi|iv|iii|ii|ix|v|i|x)\)\s*\(([a-z])\)/gi, '($1){{ALPHA:$2}}');

  // Handle i.(a), i. (a), ii.(b), ii. (b), etc. - mark the alpha part
  formatted = formatted.replace(/(\s|^)(viii|vii|vi|iv|iii|ii|ix|v|i|x)\.\s*\(([a-z])\)/gi, '$1$2.{{ALPHA:$3}}');

  // Step 2: Add newlines before Roman numerals with parentheses
  formatted = formatted.replace(/(\s|^)\((viii|vii|vi|iv|iii|ii|ix|v|i|x)\)/gi, '$1\n($2)');

  // Add newlines before Roman numerals with dot
  formatted = formatted.replace(/(\s|^)(viii|vii|vi|iv|iii|ii|ix|v|i|x)\./gi, '$1\n$2.');

  // Step 3: Add newlines before standalone alphabetic options (unmarked ones only)
  formatted = formatted.replace(/(\s|^)\(([a-z])\)/gi, '$1\n($2)');

  // Step 4: Restore marked alpha patterns with space
  formatted = formatted.replace(/\{\{ALPHA:([a-z])\}\}/gi, ' ($1)');

  // Clean up multiple newlines
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  // Remove leading newline
  formatted = formatted.replace(/^\n+/, '');

  return formatted.trim();
};

// Paper Question Text Renderer with formatting
const PaperQuestionText = React.memo(({ text }) => {
  if (!text) return null;
  const formattedText = formatQuestionText(text);
  return <span className="math-text-content"><MarkdownWithMath content={formattedText} /></span>;
});
PaperQuestionText.displayName = 'PaperQuestionText';

// Custom Hooks
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (e) { console.error(e); }
  };
  return [storedValue, setValue];
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// API Service
const api = {
  async getClasses() { return (await fetch(`${API_BASE_URL}/classes/`)).json(); },
  async getClassDetails(id) { return (await fetch(`${API_BASE_URL}/classes/${id}/`)).json(); },
  async getClassWeightage(id) { return (await fetch(`${API_BASE_URL}/classes/${id}/weightage/`)).json(); },
  async getChapters(classId) { return (await fetch(`${API_BASE_URL}/chapters/?class_id=${classId}`)).json(); },
  async getChapterQuestions(chapterId) { return (await fetch(`${API_BASE_URL}/chapters/${chapterId}/`)).json(); },
  async getDashboardStats() { return (await fetch(`${API_BASE_URL}/dashboard/`)).json(); },
};

// Icons Component
const Icon = ({ name, size = 20, className = '' }) => {
  const paths = {
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
    layers: <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
    fileText: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
    target: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    checkCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    chevronDown: <polyline points="6 9 12 15 18 9"/>,
    chevronRight: <polyline points="9 18 15 12 9 6"/>,
    arrowLeft: <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
    printer: <><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    info: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    alertCircle: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
};

// Section colors matching teacher dashboard theme
const getSectionStyle = (section) => ({
  A: { bg: '#f0f9ff', text: '#0369a1', border: '#0ea5e9' },
  B: { bg: '#f0fdf4', text: '#15803d', border: '#22c55e' },
  C: { bg: '#fffbeb', text: '#b45309', border: '#f59e0b' },
  D: { bg: '#fdf2f8', text: '#be185d', border: '#ec4899' },
  E: { bg: '#f5f3ff', text: '#7c3aed', border: '#8b5cf6' },
}[section] || { bg: '#f8fafc', text: '#475569', border: '#94a3b8' });

// Main Component
export default function QuestionPaperGenerator() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [chapterQuestions, setChapterQuestions] = useState({});
  const [selectedQuestions, setSelectedQuestions] = useLocalStorage('qpg-selected', {});
  const [weightageData, setWeightageData] = useState([]);
  const [view, setView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [examDuration, setExamDuration] = useState('3 Hours');
  const [expandedSections, setExpandedSections] = useState({ A: true, B: true, C: true, D: true, E: true });

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    Promise.all([
      api.getClasses().then(d => setClasses(d.results || d)),
      api.getDashboardStats().then(setDashboardStats)
    ]).catch(() => showNotification('Failed to load data', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedClass) {
      api.getChapters(selectedClass.id).then(d => setChapters(d.results || d)).catch(() => showNotification('Failed to load chapters', 'error'));
      api.getClassWeightage(selectedClass.id).then(setWeightageData).catch(console.error);
    }
  }, [selectedClass]);

  const loadChapterQuestions = async (chapterId) => {
    if (chapterQuestions[chapterId]) return;
    try {
      const data = await api.getChapterQuestions(chapterId);
      setChapterQuestions(prev => ({ ...prev, [chapterId]: data.questions || [] }));
    } catch { showNotification('Failed to load questions', 'error'); }
  };

  const handleClassSelect = (cls) => { setSelectedClass(cls); setExpandedChapters({}); setView('questions'); };
  const handleChapterToggle = (chapter) => {
    const isExpanded = expandedChapters[chapter.id];
    setExpandedChapters(prev => ({ ...prev, [chapter.id]: !isExpanded }));
    if (!isExpanded) loadChapterQuestions(chapter.id);
  };
  const handleQuestionToggle = (question, chapter) => {
    const key = `${chapter.id}_${question.id}`;
    setSelectedQuestions(prev => prev[key]
      ? (({ [key]: _, ...rest }) => rest)(prev)
      : { ...prev, [key]: { ...question, chapter: chapter.name, chapterId: chapter.id } }
    );
  };
  const handleClearSelection = () => { setSelectedQuestions({}); showNotification('Selection cleared', 'info'); };
  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  const handleGeneratePaper = () => {
    if (!Object.keys(selectedQuestions).length) return showNotification('Please select at least one question', 'warning');
    setView('paper');
  };
  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  // Computed Values
  const totalSelectedQuestions = Object.keys(selectedQuestions).length;
  const totalSelectedMarks = Object.values(selectedQuestions).reduce((sum, q) => sum + (q.marks || 0), 0);
  const sectionCounts = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    Object.values(selectedQuestions).forEach(q => { if (counts[q.section] !== undefined) counts[q.section]++; });
    return counts;
  }, [selectedQuestions]);
  const selectedMarksPerChapter = useMemo(() => {
    const marks = {};
    Object.values(selectedQuestions).forEach(q => { if (q.chapterId) marks[q.chapterId] = (marks[q.chapterId] || 0) + (q.marks || 0); });
    return marks;
  }, [selectedQuestions]);
  const selectedMarksPerUnit = useMemo(() => {
    const marks = {};
    weightageData.forEach(unit => {
      marks[unit.id] = (unit.chapters || []).reduce((sum, ch) => sum + (selectedMarksPerChapter[ch.id] || 0), 0);
    });
    return marks;
  }, [weightageData, selectedMarksPerChapter]);
  const filteredChapters = useMemo(() => {
    if (!debouncedSearch) return chapters;
    const q = debouncedSearch.toLowerCase();
    return chapters.filter(ch => ch.name.toLowerCase().includes(q) || ch.unit_name?.toLowerCase().includes(q));
  }, [chapters, debouncedSearch]);

  // Notifications Component
  const Notifications = () => (
    <div className="qpg-toast-container">
      {notifications.map(n => (
        <div key={n.id} className={`qpg-toast qpg-toast-${n.type}`}>
          <Icon name={n.type === 'error' ? 'alertCircle' : n.type === 'warning' ? 'alertCircle' : n.type === 'success' ? 'checkCircle' : 'info'} size={18} />
          <span>{n.message}</span>
          <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))}><Icon name="x" size={16} /></button>
        </div>
      ))}
    </div>
  );

  // Dashboard View
  const DashboardView = () => (
    <div className="qpg-dashboard fade-in">
      {/* Stats Cards */}
      {dashboardStats && (
        <div className="qpg-stats-row">
          <div className="qpg-stat-card metric-card-blue">
            <div className="qpg-stat-icon"><Icon name="book" size={24} /></div>
            <div className="qpg-stat-info">
              <span className="qpg-stat-value">{dashboardStats.total_classes || 0}</span>
              <span className="qpg-stat-label">Total Classes</span>
            </div>
          </div>
          <div className="qpg-stat-card metric-card-green">
            <div className="qpg-stat-icon"><Icon name="layers" size={24} /></div>
            <div className="qpg-stat-info">
              <span className="qpg-stat-value">{dashboardStats.total_units || 0}</span>
              <span className="qpg-stat-label">Total Units</span>
            </div>
          </div>
          <div className="qpg-stat-card metric-card-yellow">
            <div className="qpg-stat-icon"><Icon name="fileText" size={24} /></div>
            <div className="qpg-stat-info">
              <span className="qpg-stat-value">{dashboardStats.total_chapters || 0}</span>
              <span className="qpg-stat-label">Total Chapters</span>
            </div>
          </div>
          <div className="qpg-stat-card metric-card-pink">
            <div className="qpg-stat-icon"><Icon name="target" size={24} /></div>
            <div className="qpg-stat-info">
              <span className="qpg-stat-value">{dashboardStats.total_questions || 0}</span>
              <span className="qpg-stat-label">Total Questions</span>
            </div>
          </div>
        </div>
      )}

      {/* Class Selection */}
      <div className="qpg-section-card">
        <div className="qpg-section-header">
          <h2>Select a Class</h2>
          <p>Choose a class to start building your question paper</p>
        </div>
        <div className="qpg-class-grid">
          {classes.map((cls) => (
            <div key={cls.id} className="qpg-class-item" onClick={() => handleClassSelect(cls)}>
              <div className="qpg-class-icon">{cls.icon || '📚'}</div>
              <div className="qpg-class-details">
                <h3>{cls.display_name}</h3>
                <div className="qpg-class-meta">
                  <span><Icon name="layers" size={14} /> {cls.total_units || '—'} Units</span>
                  <span><Icon name="fileText" size={14} /> {cls.total_chapters || '—'} Chapters</span>
                </div>
              </div>
              <div className="qpg-class-arrow"><Icon name="chevronRight" size={20} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Question Selection View
  const QuestionSelectionView = () => (
    <div className="qpg-question-view fade-in">
      <div className="qpg-layout">
        {/* Main Content */}
        <div className="qpg-main-content">
          {/* Class Header */}
          <div className="qpg-class-banner">
            <button className="qpg-back-btn" onClick={() => { setSelectedClass(null); setView('dashboard'); }}>
              <Icon name="arrowLeft" size={20} /> Back
            </button>
            <div className="qpg-class-title">
              <span className="qpg-class-emoji">{selectedClass?.icon || '📚'}</span>
              <div>
                <h1>{selectedClass?.display_name}</h1>
                <p>{chapters.length} Chapters • {selectedClass?.total_marks || 80} Marks</p>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="qpg-toolbar">
            <div className="qpg-search-box">
              <Icon name="search" size={18} />
              <input type="text" placeholder="Search chapters..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              {searchQuery && <button onClick={() => setSearchQuery('')}><Icon name="x" size={16} /></button>}
            </div>
            <div className="qpg-filter-group">
              <span className="qpg-filter-label"><Icon name="filter" size={16} /> Section:</span>
              {['all', 'A', 'B', 'C', 'D', 'E'].map(s => (
                <button key={s} className={`qpg-filter-btn ${sectionFilter === s ? 'active' : ''}`} onClick={() => setSectionFilter(s)}>
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>

          {/* Chapters List */}
          <div className="qpg-chapters-list">
            {filteredChapters.length === 0 ? (
              <div className="qpg-empty-state">
                <Icon name="search" size={48} />
                <h3>No chapters found</h3>
                <p>Try adjusting your search query</p>
              </div>
            ) : filteredChapters.map(chapter => {
              const isExpanded = expandedChapters[chapter.id];
              const questions = chapterQuestions[chapter.id] || [];
              const selectedCount = Object.keys(selectedQuestions).filter(k => k.startsWith(`${chapter.id}_`)).length;
              const chapterMarks = selectedMarksPerChapter[chapter.id] || 0;
              let chapterTarget = 0;
              weightageData.forEach(u => { const ch = u.chapters?.find(c => c.id === chapter.id); if (ch) chapterTarget = ch.calculated_weightage || 0; });
              const filteredQs = sectionFilter === 'all' ? questions : questions.filter(q => q.section === sectionFilter);
              const grouped = {};
              filteredQs.forEach(q => { grouped[q.section] = grouped[q.section] || []; grouped[q.section].push(q); });

              return (
                <div key={chapter.id} className={`qpg-chapter-card ${isExpanded ? 'expanded' : ''}`}>
                  <div className="qpg-chapter-header" onClick={() => handleChapterToggle(chapter)}>
                    <div className="qpg-chapter-expand">
                      <Icon name={isExpanded ? 'chevronDown' : 'chevronRight'} size={20} />
                    </div>
                    <div className="qpg-chapter-info">
                      <h3>{chapter.name}</h3>
                      <span>{chapter.total_questions || questions.length} questions</span>
                    </div>
                    <div className="qpg-chapter-status">
                      {chapterTarget > 0 && (
                        <span className={`qpg-status-badge ${chapterMarks > chapterTarget ? 'exceeded' : chapterMarks >= chapterTarget * 0.8 ? 'warning' : chapterMarks > 0 ? 'ok' : ''}`}>
                          {chapterMarks}/{chapterTarget} marks
                        </span>
                      )}
                      {selectedCount > 0 && (
                        <span className="qpg-selected-badge">{selectedCount} selected</span>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="qpg-questions-container">
                      {!Object.keys(grouped).length ? (
                        <div className="qpg-loading-questions">
                          {questions.length === 0 ? 'Loading questions...' : 'No questions match the filter'}
                        </div>
                      ) : ['A', 'B', 'C', 'D', 'E'].map(section => {
                        const sectionQs = grouped[section];
                        if (!sectionQs?.length) return null;
                        const style = getSectionStyle(section);
                        const isSectionExpanded = expandedSections[section];
                        return (
                          <div key={section} className={`qpg-section-block ${isSectionExpanded ? 'expanded' : 'collapsed'}`}>
                            <div
                              className="qpg-section-title"
                              style={{ background: style.bg, color: style.text, borderLeft: `4px solid ${style.border}`, cursor: 'pointer' }}
                              onClick={() => handleSectionToggle(section)}
                            >
                              <div className="qpg-section-title-left">
                                <Icon name={isSectionExpanded ? 'chevronDown' : 'chevronRight'} size={18} />
                                <span>Section {section}</span>
                              </div>
                              <span>{sectionQs.length} Qs • {sectionQs.reduce((s, q) => s + (q.marks || 0), 0)} Marks</span>
                            </div>
                            {isSectionExpanded && sectionQs.map(q => {
                              const key = `${chapter.id}_${q.id}`;
                              const isSelected = !!selectedQuestions[key];
                              return (
                                <div key={q.id} className={`qpg-question-item ${isSelected ? 'selected' : ''}`} onClick={() => handleQuestionToggle(q, chapter)}>
                                  <div className={`qpg-checkbox ${isSelected ? 'checked' : ''}`}>
                                    {isSelected && <Icon name="check" size={14} />}
                                  </div>
                                  <div className="qpg-question-body">
                                    <div className="qpg-question-text"><MathText text={q.question_text} /></div>
                                    {q.figure && (
                                      <div className="qpg-question-figure">
                                        <img src={q.figure.startsWith('data:') ? q.figure : q.figure.startsWith('/9j/') || q.figure.startsWith('9j/') ? `data:image/jpeg;base64,${q.figure.startsWith('/') ? q.figure : '/' + q.figure}` : `data:image/png;base64,${q.figure}`} alt="Question figure" />
                                      </div>
                                    )}
                                    <div className="qpg-question-meta">
                                      <span className="qpg-q-type" style={{ background: style.bg, color: style.text }}>{q.question_subtype || q.question_type || `Section ${section}`}</span>
                                      <span className="qpg-q-marks">{q.marks} Mark{q.marks !== 1 ? 's' : ''}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="qpg-sidebar">
          {/* Selection Summary */}
          <div className="qpg-sidebar-card qpg-summary">
            <h3><Icon name="checkCircle" size={18} /> Selection Summary</h3>
            <div className="qpg-summary-stats">
              <div className="qpg-summary-stat">
                <span className="qpg-summary-value">{totalSelectedQuestions}</span>
                <span className="qpg-summary-label">Questions</span>
              </div>
              <div className="qpg-summary-stat">
                <span className="qpg-summary-value">{totalSelectedMarks}</span>
                <span className="qpg-summary-label">Total Marks</span>
              </div>
            </div>
            {totalSelectedQuestions > 0 && (
              <div className="qpg-section-breakdown">
                {Object.entries(sectionCounts).map(([s, c]) => c > 0 && (
                  <span key={s} className="qpg-section-tag" style={{ background: getSectionStyle(s).bg, color: getSectionStyle(s).text }}>
                    Sec {s}: {c}
                  </span>
                ))}
              </div>
            )}
            <div className="qpg-sidebar-actions">
              <button className="qpg-btn qpg-btn-primary" onClick={handleGeneratePaper} disabled={!totalSelectedQuestions}>
                <Icon name="fileText" size={18} /> Generate Paper
              </button>
              <button className="qpg-btn qpg-btn-outline-danger" onClick={handleClearSelection} disabled={!totalSelectedQuestions}>
                <Icon name="trash" size={18} /> Clear All
              </button>
            </div>
          </div>

          {/* Weightage Progress */}
          {weightageData.length > 0 && (
            <div className="qpg-sidebar-card">
              <h3>Weightage Progress</h3>
              {(() => {
                const totalTarget = weightageData.reduce((sum, u) => sum + (u.weightage || 0), 0);
                const totalSelected = Object.values(selectedMarksPerUnit).reduce((sum, m) => sum + m, 0);
                const pct = totalTarget > 0 ? Math.min((totalSelected / totalTarget) * 100, 100) : 0;
                return (
                  <div className="qpg-progress-overview">
                    <div className="qpg-progress-header">
                      <span>Overall</span>
                      <span className={totalSelected > totalTarget ? 'exceeded' : ''}>{totalSelected} / {totalTarget}</span>
                    </div>
                    <div className="qpg-progress-track">
                      <div className={`qpg-progress-bar ${totalSelected > totalTarget ? 'exceeded' : pct >= 80 ? 'warning' : ''}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })()}
              <div className="qpg-unit-list">
                {weightageData.map(unit => {
                  const unitSelected = selectedMarksPerUnit[unit.id] || 0;
                  const unitTarget = unit.weightage || 0;
                  const pct = unitTarget > 0 ? Math.min((unitSelected / unitTarget) * 100, 100) : 0;
                  return (
                    <div key={unit.id} className="qpg-unit-row">
                      <div className="qpg-unit-info">
                        <span className="qpg-unit-name">{unit.short_name || unit.name?.split(': ')[1] || unit.name}</span>
                        <span className={`qpg-unit-progress-text ${unitSelected > unitTarget ? 'exceeded' : ''}`}>{unitSelected}/{unitTarget}</span>
                      </div>
                      <div className="qpg-unit-track">
                        <div className={`qpg-unit-bar ${unitSelected > unitTarget ? 'exceeded' : unitSelected >= unitTarget * 0.8 ? 'warning' : ''}`} style={{ width: `${pct}%` }} />
                      </div>
                      {unit.chapters?.length > 0 && (
                        <div className="qpg-chapter-list">
                          {unit.chapters.map(ch => {
                            const chMarks = selectedMarksPerChapter[ch.id] || 0;
                            const chTarget = ch.calculated_weightage || 0;
                            return (
                              <div key={ch.id} className="qpg-chapter-row">
                                <span className="qpg-chapter-name">{ch.short_name || ch.name}</span>
                                <span className={`qpg-chapter-progress ${chMarks > chTarget ? 'exceeded' : ''}`}>{chMarks}/{chTarget}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );

  // Paper Preview View
  const PaperPreviewView = () => {
    const questionsList = Object.values(selectedQuestions);
    const grouped = {};
    questionsList.forEach(q => { grouped[q.section] = grouped[q.section] || []; grouped[q.section].push(q); });
    let qNum = 1;

    return (
      <div className="qpg-paper-view fade-in">
        <div className="qpg-paper-toolbar">
          <button className="qpg-btn qpg-btn-secondary" onClick={() => setView('questions')}>
            <Icon name="arrowLeft" size={18} /> Back to Selection
          </button>
          <div className="qpg-time-selector">
            <label>Duration:</label>
            <select value={examDuration} onChange={(e) => setExamDuration(e.target.value)}>
              <option value="30 Minutes">30 Minutes</option>
              <option value="45 Minutes">45 Minutes</option>
              <option value="1 Hour">1 Hour</option>
              <option value="1.5 Hours">1.5 Hours</option>
              <option value="2 Hours">2 Hours</option>
              <option value="2.5 Hours">2.5 Hours</option>
              <option value="3 Hours">3 Hours</option>
              <option value="3.5 Hours">3.5 Hours</option>
              <option value="4 Hours">4 Hours</option>
            </select>
          </div>
          <div className="qpg-paper-actions">
            <button className="qpg-btn qpg-btn-secondary" onClick={() => { navigator.clipboard.writeText(document.getElementById('paper-content')?.innerText || ''); showNotification('Copied to clipboard!', 'success'); }}>
              <Icon name="copy" size={18} /> Copy
            </button>
            <button className="qpg-btn qpg-btn-primary" onClick={() => window.print()}>
              <Icon name="printer" size={18} /> Print
            </button>
          </div>
        </div>

        <div id="paper-content" className="qpg-paper-document">
          <header className="qpg-paper-header">
            <h1>{selectedClass?.display_name}</h1>
            <h2>Question Paper</h2>
            <div className="qpg-paper-meta">
              <span>Total Questions: {questionsList.length}</span>
              <span>Total Marks: {totalSelectedMarks}</span>
              <span>Duration: {examDuration}</span>
            </div>
          </header>

          <hr className="qpg-paper-divider" />

          {['A', 'B', 'C', 'D', 'E'].map(section => {
            const sectionQs = grouped[section];
            if (!sectionQs?.length) return null;
            const style = getSectionStyle(section);
            const sectionMarks = sectionQs.reduce((s, q) => s + (q.marks || 0), 0);
            return (
              <section key={section} className="qpg-paper-section">
                <div className="qpg-paper-section-header" style={{ borderLeftColor: style.border }}>
                  <span>Section {section}</span>
                  <span>{sectionQs.length} Questions • {sectionMarks} Marks</span>
                </div>
                <div className="qpg-paper-questions">
                  {sectionQs.map((q, i) => {
                    const num = qNum++;
                    return (
                      <div key={i} className="qpg-paper-q">
                        <span className="qpg-paper-q-num">{num}.</span>
                        <div className="qpg-paper-q-content">
                          <PaperQuestionText text={q.question_text} />
                          {q.figure && (
                          <div className="qpg-paper-q-figure">
                            <img src={q.figure.startsWith('data:') ? q.figure : q.figure.startsWith('/9j/') || q.figure.startsWith('9j/') ? `data:image/jpeg;base64,${q.figure.startsWith('/') ? q.figure : '/' + q.figure}` : `data:image/png;base64,${q.figure}`} alt="Figure" />
                          </div>
                        )}
                        </div>
                        <span className="qpg-paper-q-marks" style={{ background: style.bg, color: style.text }}>[{q.marks}M]</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          <footer className="qpg-paper-footer">
            <p>--- End of Question Paper ---</p>
          </footer>
        </div>
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="qpg-container">
        <div className="qpg-loading">
          <div className="qpg-spinner" />
          <p>Loading Question Paper Generator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="qpg-container">
      <Notifications />
      {view === 'dashboard' && <DashboardView />}
      {view === 'questions' && <QuestionSelectionView />}
      {view === 'paper' && <PaperPreviewView />}
    </div>
  );
}
