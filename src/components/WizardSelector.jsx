// WizardSelector.jsx — Progressive Disclosure Wizard
// Drop-in replacement for the static form in StudentDash.jsx
// NO backend API changes. All same endpoints, same payloads.
import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faCheck,
  faRocket,
  faArrowLeft,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const STEPS = ["Class", "Subject", "Chapters", "Question Type"];

// subject-type helpers (same logic as existing StudentDash)
const isJEEMainsAdv = (n = "") => {
  const s = n.toLowerCase();
  return s.includes("mathematics_mains") || s.includes("mathematics_advanced");
};
const isScience = (n = "") => n.toLowerCase().includes("science");

const SCIENCE_TYPES = [
  {
    id: "1",
    value: "activity_based_questions",
    label: "Activity Based",
    icon: "🧪",
  },
  { id: "2", value: "conceptual_questions", label: "Conceptual", icon: "💡" },
  {
    id: "3",
    value: "diagram_based_questions",
    label: "Diagram Based",
    icon: "🖼️",
  },
  { id: "4", value: "fill_in_the_blanks", label: "Fill in Blanks", icon: "✏️" },
  { id: "5", value: "matching_questions", label: "Matching", icon: "🔗" },
  { id: "6", value: "t_f_questions", label: "True / False", icon: "✅" },
];
const JEE_MAINS_TYPES = [
  { id: "1", value: "mcq", label: "MCQ", icon: "🎯" },
  { id: "2", value: "nvtq", label: "Numerical (NVTQ)", icon: "🔢" },
  { id: "3", value: "theorem", label: "Theorem Based", icon: "📐" },
];
const BOARD_TYPES = [
  { value: "solved", label: "Solved Examples", icon: "📖" },
  { value: "external", label: "Book Exercises", icon: "📝" },
  { value: "worksheets", label: "Worksheets", icon: "📋" },
];

export default function WizardSelector({
  username = "",
  isDarkMode = false,
  isJeeMode = false,
  onReadyToSubmit, // (requestData, meta) => void
}) {
  const dark = isDarkMode;

  const [step, setStep] = useState(0);
  const [donePills, setDonePills] = useState([]);
  const [anim, setAnim] = useState(false);

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [qtOpts, setQtOpts] = useState([]);

  const [selClass, setSelClass] = useState(null);
  const [selSub, setSelSub] = useState(null);
  const [selChaps, setSelChaps] = useState([]);
  const [selQType, setSelQType] = useState(null);
  const [selLevel, setSelLevel] = useState(null);
  const [selWS, setSelWS] = useState(null);

  const [subTopics, setSubTopics] = useState([]);
  const [worksheets, setWorksheets] = useState([]);

  const [loadSub, setLoadSub] = useState(false);
  const [loadCh, setLoadCh] = useState(false);
  const [loadQT, setLoadQT] = useState(false);

  const goto = (n) => {
    setAnim(true);
    setStep(n);
    setTimeout(() => setAnim(false), 350);
  };
  const markDone = (n) => setDonePills((p) => (p.includes(n) ? p : [...p, n]));

  const extractClass = (u = "") => {
    const f2 = u.substring(0, 2);
    if (!isNaN(f2) && f2 !== "") return f2;
    const f1 = u.charAt(0);
    if (!isNaN(f1) && f1 !== "") return f1;
    return "";
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/classes/");
        let data = res.data.data || [];
        if (isJeeMode)
          data = data.filter(
            (c) => c.class_name.includes("11") || c.class_name.includes("12"),
          );
        setClasses(data);
        const def = extractClass(username);
        if (def) {
          const m = data.find(
            (c) => c.class_name.includes(def) || c.class_code === def,
          );
          if (m) pickClass(m, data);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [username, isJeeMode]); // eslint-disable-line

  const resetBelow = (fromStep) => {
    if (fromStep <= 1) {
      setSelSub(null);
      setSubjects([]);
    }
    if (fromStep <= 2) {
      setSelChaps([]);
      setChapters([]);
      setQtOpts([]);
    }
    if (fromStep <= 3) {
      setSelQType(null);
      setSelLevel(null);
      setSelWS(null);
      setSubTopics([]);
      setWorksheets([]);
    }
    setDonePills((p) => p.filter((d) => d < fromStep));
  };

  const pickClass = async (cls) => {
    setSelClass(cls);
    resetBelow(1);
    setLoadSub(true);
    try {
      const res = await axiosInstance.post("/subjects/", {
        class_id: cls.class_code,
      });
      let data = res.data.data || [];
      const isFound = ["8", "9", "10"].some((n) =>
        cls.class_code.toString().includes(n),
      );
      if (isJeeMode) {
        data = data.filter((s) => {
          const n = s.subject_name.toLowerCase();
          return (
            n.includes("jee") ||
            n.includes("mathematics_mains") ||
            n.includes("mathematics_advanced") ||
            n.includes("physics_mains") ||
            n.includes("chemistry_mains")
          );
        });
      } else {
        data = data.filter((s) => {
          const n = s.subject_name.toLowerCase();
          if (
            isFound &&
            (n.includes("jee_foundation") || n.includes("jee foundation"))
          )
            return true;
          return !(
            n.includes("jee") ||
            n.includes("mathematics_mains") ||
            n.includes("mathematics_advanced") ||
            n.includes("physics_mains") ||
            n.includes("chemistry_mains")
          );
        });
      }
      setSubjects(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadSub(false);
    }
    markDone(0);
    goto(1);
  };

  const pickSubject = async (sub) => {
    setSelSub(sub);
    resetBelow(2);
    setLoadCh(true);
    try {
      const res = await axiosInstance.post("/chapters/", {
        subject_id: sub.subject_code,
        class_id: selClass.class_code,
      });
      setChapters(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadCh(false);
    }
    markDone(1);
    goto(2);
  };

  const toggleChap = (ch) => {
    setSelChaps((p) => {
      const ex = p.find((c) => c.topic_code === ch.topic_code);
      return ex ? p.filter((c) => c.topic_code !== ch.topic_code) : [...p, ch];
    });
    setSelQType(null);
    setSelLevel(null);
    setSelWS(null);
  };

  const confirmChapters = async () => {
    if (!selChaps.length) return;
    const sn = selSub?.subject_name || "";
    setLoadQT(true);
    try {
      if (isJEEMainsAdv(sn)) {
        const res = await axiosInstance.post("/question-images-paginator/", {
          classid: selClass.class_code,
          subjectid: selSub.subject_code,
          topicid: selChaps.map((c) => c.topic_code),
          external: true,
        });
        const subs = res.data.subtopics || [];
        setQtOpts(JEE_MAINS_TYPES.filter((t) => subs.includes(t.id)));
      } else if (isScience(sn)) {
        const res = await axiosInstance.post("/question-images-paginator/", {
          classid: selClass.class_code,
          subjectid: selSub.subject_code,
          topicid: selChaps.map((c) => c.topic_code),
          external: true,
        });
        const subs = res.data.subtopics || [];
        setQtOpts(
          subs.length
            ? SCIENCE_TYPES.filter((t) => subs.includes(t.id))
            : SCIENCE_TYPES,
        );
      } else {
        setQtOpts(BOARD_TYPES);
      }
    } catch (e) {
      console.error(e);
      setQtOpts(BOARD_TYPES);
    } finally {
      setLoadQT(false);
    }
    markDone(2);
    goto(3);
  };

  const pickQType = async (opt) => {
    setSelQType(opt);
    setSelLevel(null);
    setSelWS(null);
    setSubTopics([]);
    setWorksheets([]);
    if (
      opt.value === "external" &&
      !isJEEMainsAdv(selSub?.subject_name || "")
    ) {
      try {
        const res = await axiosInstance.post("/question-images-paginator/", {
          classid: selClass.class_code,
          subjectid: selSub.subject_code,
          topicid: selChaps[0].topic_code,
          external: true,
        });
        setSubTopics(res.data.subtopics || []);
      } catch (e) {
        setSubTopics([]);
      }
    }
    if (opt.value === "worksheets") {
      try {
        const res = await axiosInstance.post("/question-images-paginator/", {
          classid: selClass.class_code,
          subjectid: selSub.subject_code,
          topicid: selChaps[0].topic_code,
          worksheets: true,
        });
        setWorksheets(res.data.worksheets || []);
      } catch (e) {
        setWorksheets([]);
      }
    }
  };

  const isReady = () => {
    if (!selClass || !selSub || !selChaps.length || !selQType) return false;
    if (selQType.value === "external" && subTopics.length > 0 && !selLevel)
      return false;
    if (selQType.value === "worksheets" && worksheets.length > 0 && !selWS)
      return false;
    return true;
  };

  const handleBegin = () => {
    if (!isReady()) return;
    const sn = selSub?.subject_name || "";
    const req = {
      classid: Number(selClass.class_code),
      subjectid: Number(selSub.subject_code),
      topicid: selChaps.map((c) => c.topic_code),
    };
    const SCI_IDS = {
      activity_based_questions: "1",
      conceptual_questions: "2",
      diagram_based_questions: "3",
      fill_in_the_blanks: "4",
      matching_questions: "5",
      t_f_questions: "6",
    };
    if (isScience(sn)) {
      req.subtopic = SCI_IDS[selQType.value];
    } else if (isJEEMainsAdv(sn)) {
      req.subtopic = { mcq: "1", nvtq: "2", theorem: "3" }[selQType.value];
    } else {
      req.solved = selQType.value === "solved";
      req.exercise = selQType.value === "exercise";
      req.subtopic = selQType.value === "external" ? selLevel : null;
      req.worksheet_name = selQType.value === "worksheets" ? selWS : null;
    }
    onReadyToSubmit?.(req, {
      selClass,
      selSub,
      selChaps,
      selQType,
      selLevel,
      selWS,
    });
  };

  const goBack = (toStep) => {
    resetBelow(toStep + 1);
    goto(toStep);
  };

  // STYLES
  const accent = dark ? "#a78bfa" : "#667eea";
  const accentBg = dark ? "rgba(124,58,237,0.18)" : "rgba(102,126,234,0.1)";
  const panelBg = dark ? "rgba(15,23,42,0.9)" : "#ffffff";
  const bdr = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const textPri = dark ? "#f1f5f9" : "#0f172a";
  const textMut = dark ? "#64748b" : "#94a3b8";
  const ok = dark ? "#60d394" : "#16a34a";
  const okBg = dark ? "rgba(96,211,148,0.1)" : "rgba(22,163,74,0.08)";

  const S = {
    stepper: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      marginBottom: "22px",
      flexWrap: "wrap",
    },
    pill: (active, done) => ({
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "5px 13px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "700",
      cursor: done ? "pointer" : "default",
      transition: "all .25s",
      background: done
        ? okBg
        : active
          ? accentBg
          : dark
            ? "rgba(255,255,255,0.04)"
            : "#f1f5f9",
      color: done ? ok : active ? accent : textMut,
      border: done
        ? `1px solid ${ok}44`
        : active
          ? `1px solid ${accent}55`
          : "1px solid transparent",
    }),
    sep: { color: textMut, fontSize: "10px" },
    card: {
      borderRadius: "18px",
      padding: "28px 24px",
      background: panelBg,
      border: `1px solid ${bdr}`,
      boxShadow: dark
        ? "0 8px 40px rgba(0,0,0,.5)"
        : "0 4px 28px rgba(0,0,0,.07)",
      animation: anim ? "wfade .35s ease" : "none",
    },
    stepMeta: {
      fontSize: "11px",
      fontWeight: "700",
      letterSpacing: ".1em",
      textTransform: "uppercase",
      color: accent,
      marginBottom: "6px",
    },
    stepTitle: {
      fontSize: "21px",
      fontWeight: "800",
      color: textPri,
      margin: "0 0 20px",
    },
    summary: {
      display: "flex",
      flexWrap: "wrap",
      gap: "6px",
      marginBottom: "16px",
    },
    summaryTag: {
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "3px 10px",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "600",
      background: okBg,
      color: ok,
      border: `1px solid ${ok}33`,
      cursor: "pointer",
    },
    chips: { display: "flex", flexWrap: "wrap", gap: "10px" },
    chip: (sel) => ({
      padding: "10px 20px",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: sel ? "700" : "500",
      cursor: "pointer",
      userSelect: "none",
      transition: "all .2s",
      background: sel ? accentBg : dark ? "rgba(255,255,255,0.04)" : "#f8fafc",
      color: sel ? accent : dark ? "#cbd5e1" : "#475569",
      border: sel ? `2px solid ${accent}` : `2px solid ${bdr}`,
      transform: sel ? "scale(1.03)" : "scale(1)",
    }),
    chGrid: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      maxHeight: "270px",
      overflowY: "auto",
    },
    chChip: (sel) => ({
      padding: "8px 14px",
      borderRadius: "10px",
      fontSize: "13px",
      fontWeight: sel ? "600" : "400",
      cursor: "pointer",
      userSelect: "none",
      transition: "all .18s",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      background: sel ? accentBg : dark ? "rgba(255,255,255,0.03)" : "#f8fafc",
      color: sel ? accent : dark ? "#94a3b8" : "#64748b",
      border: sel ? `2px solid ${accent}` : `1px solid ${bdr}`,
    }),
    qtGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))",
      gap: "12px",
    },
    qtCard: (sel) => ({
      padding: "18px 14px",
      borderRadius: "14px",
      textAlign: "center",
      cursor: "pointer",
      transition: "all .2s",
      background: sel ? accentBg : dark ? "rgba(255,255,255,0.03)" : "#fafafa",
      border: sel ? `2px solid ${accent}` : `1px solid ${bdr}`,
      transform: sel ? "scale(1.03)" : "scale(1)",
      boxShadow: sel ? `0 0 0 1px ${accent}44` : "none",
    }),
    qtIcon: { fontSize: "26px", marginBottom: "8px" },
    qtLabel: (sel) => ({
      fontSize: "13px",
      fontWeight: sel ? "700" : "500",
      color: sel ? accent : textMut,
      lineHeight: "1.3",
    }),
    row: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: "20px",
      gap: "10px",
      flexWrap: "wrap",
    },
    backBtn: {
      background: "transparent",
      border: `1px solid ${bdr}`,
      borderRadius: "10px",
      padding: "9px 18px",
      fontSize: "13px",
      color: textMut,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      transition: "all .2s",
    },
    nextBtn: (en) => ({
      background: en
        ? `linear-gradient(135deg,${dark ? "#7c3aed" : "#667eea"},${dark ? "#6366f1" : "#764ba2"})`
        : dark
          ? "rgba(255,255,255,0.06)"
          : "#e2e8f0",
      border: "none",
      borderRadius: "12px",
      padding: "11px 26px",
      fontSize: "14px",
      fontWeight: "700",
      color: en ? "#fff" : textMut,
      cursor: en ? "pointer" : "not-allowed",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all .25s",
      boxShadow: en ? "0 4px 16px rgba(102,126,234,.3)" : "none",
    }),
    beginBtn: (en) => ({
      width: "100%",
      padding: "16px",
      borderRadius: "14px",
      border: "none",
      background: en
        ? `linear-gradient(135deg,${dark ? "#7c3aed" : "#667eea"},${dark ? "#6366f1" : "#764ba2"})`
        : dark
          ? "rgba(255,255,255,0.06)"
          : "#e2e8f0",
      color: en ? "#fff" : textMut,
      fontWeight: "700",
      fontSize: "16px",
      cursor: en ? "pointer" : "not-allowed",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      transition: "all .25s",
      marginTop: "18px",
      boxShadow: en ? "0 8px 24px rgba(102,126,234,.35)" : "none",
    }),
    subLabel: {
      fontSize: "12px",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: ".08em",
      color: textMut,
      margin: "16px 0 8px",
    },
    loading: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "16px 0",
      color: textMut,
      fontSize: "14px",
    },
  };

  const Spin = ({ label }) => (
    <div style={S.loading}>
      <FontAwesomeIcon icon={faSpinner} spin />
      {label}
    </div>
  );

  const Summary = () => {
    const tags = [];
    if (selClass && step > 0) tags.push({ t: selClass.class_name, s: 0 });
    if (selSub && step > 1) tags.push({ t: selSub.subject_name, s: 1 });
    if (selChaps.length && step > 2)
      tags.push({
        t: `${selChaps.length} chapter${selChaps.length > 1 ? "s" : ""}`,
        s: 2,
      });
    if (!tags.length) return null;
    return (
      <div style={S.summary}>
        {tags.map((tag) => (
          <span
            key={tag.t}
            style={S.summaryTag}
            onClick={() => goBack(tag.s)}
            title="Click to change"
          >
            <FontAwesomeIcon icon={faCheck} style={{ fontSize: "9px" }} />
            {tag.t}
          </span>
        ))}
      </div>
    );
  };

  const Stepper = () => (
    <div style={S.stepper}>
      {STEPS.map((label, i) => {
        const isDone = donePills.includes(i);
        const isAct = step === i;
        return (
          <React.Fragment key={label}>
            <span
              style={S.pill(isAct, isDone)}
              onClick={() => isDone && goBack(i)}
            >
              {isDone && (
                <FontAwesomeIcon icon={faCheck} style={{ fontSize: "10px" }} />
              )}
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <FontAwesomeIcon icon={faChevronRight} style={S.sep} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <>
      <style>{`@keyframes wfade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ width: "100%" }}>
        <Stepper />
        <div style={S.card}>
          {/* STEP 0 — CLASS */}
          {step === 0 && (
            <>
              <p style={S.stepMeta}>Step 1 of 4</p>
              <h2 style={S.stepTitle}>Choose your class</h2>
              {!classes.length ? (
                <Spin label="Loading classes…" />
              ) : (
                <div style={S.chips}>
                  {classes.map((cls) => (
                    <span
                      key={cls.class_code}
                      style={S.chip(selClass?.class_code === cls.class_code)}
                      onClick={() => pickClass(cls)}
                    >
                      Class {cls.class_name}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {/* STEP 1 — SUBJECT */}
          {step === 1 && (
            <>
              <Summary />
              <p style={S.stepMeta}>Step 2 of 4</p>
              <h2 style={S.stepTitle}>Choose a subject</h2>
              {loadSub ? (
                <Spin label="Loading subjects…" />
              ) : (
                <div style={S.chips}>
                  {subjects.map((sub) => (
                    <span
                      key={sub.subject_code}
                      style={S.chip(selSub?.subject_code === sub.subject_code)}
                      onClick={() => pickSubject(sub)}
                    >
                      {sub.subject_name}
                    </span>
                  ))}
                </div>
              )}
              <div style={S.row}>
                <button style={S.backBtn} onClick={() => goBack(0)}>
                  <FontAwesomeIcon icon={faArrowLeft} /> Back
                </button>
              </div>
            </>
          )}

          {/* STEP 2 — CHAPTERS */}
          {step === 2 && (
            <>
              <Summary />
              <p style={S.stepMeta}>Step 3 of 4</p>
              <h2 style={S.stepTitle}>Select chapters</h2>
              {loadCh ? (
                <Spin label="Loading chapters…" />
              ) : (
                <div style={S.chGrid}>
                  {chapters.map((ch) => {
                    const sel = selChaps.some(
                      (c) => c.topic_code === ch.topic_code,
                    );
                    return (
                      <span
                        key={ch.topic_code}
                        style={S.chChip(sel)}
                        onClick={() => toggleChap(ch)}
                      >
                        {sel && (
                          <FontAwesomeIcon
                            icon={faCheck}
                            style={{ fontSize: "10px" }}
                          />
                        )}
                        {ch.name}
                      </span>
                    );
                  })}
                </div>
              )}
              <div style={S.row}>
                <button style={S.backBtn} onClick={() => goBack(1)}>
                  <FontAwesomeIcon icon={faArrowLeft} /> Back
                </button>
                {loadQT ? (
                  <Spin label="Preparing…" />
                ) : (
                  <button
                    style={S.nextBtn(selChaps.length > 0)}
                    disabled={!selChaps.length}
                    onClick={confirmChapters}
                  >
                    Continue ({selChaps.length} selected){" "}
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                )}
              </div>
            </>
          )}

          {/* STEP 3 — QUESTION TYPE */}
          {step === 3 && (
            <>
              <Summary />
              <p style={S.stepMeta}>Step 4 of 4</p>
              <h2 style={S.stepTitle}>Question type</h2>
              {!qtOpts.length ? (
                <Spin label="Loading options…" />
              ) : (
                <div style={S.qtGrid}>
                  {qtOpts.map((opt) => {
                    const sel = selQType?.value === opt.value;
                    return (
                      <div
                        key={opt.value}
                        style={S.qtCard(sel)}
                        onClick={() => pickQType(opt)}
                      >
                        <div style={S.qtIcon}>{opt.icon}</div>
                        <div style={S.qtLabel(sel)}>{opt.label}</div>
                        {sel && (
                          <FontAwesomeIcon
                            icon={faCheck}
                            style={{
                              marginTop: "6px",
                              color: accent,
                              fontSize: "12px",
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {selQType?.value === "external" && subTopics.length > 0 && (
                <>
                  <p style={S.subLabel}>Select Exercise Set</p>
                  <div style={S.chips}>
                    {subTopics.map((st, i) => (
                      <span
                        key={st}
                        style={S.chip(selLevel === st)}
                        onClick={() => setSelLevel(st)}
                      >
                        Exercise {i + 1}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {selQType?.value === "worksheets" && worksheets.length > 0 && (
                <>
                  <p style={S.subLabel}>Select Worksheet</p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {worksheets.map((ws) => (
                      <span
                        key={ws.id || ws.worksheet_name}
                        style={S.chip(selWS === ws.worksheet_name)}
                        onClick={() => setSelWS(ws.worksheet_name)}
                      >
                        {ws.worksheet_name}
                      </span>
                    ))}
                  </div>
                </>
              )}

              <div style={S.row}>
                <button style={S.backBtn} onClick={() => goBack(2)}>
                  <FontAwesomeIcon icon={faArrowLeft} /> Back
                </button>
              </div>

              <button
                style={S.beginBtn(isReady())}
                disabled={!isReady()}
                onClick={handleBegin}
              >
                <FontAwesomeIcon icon={faRocket} /> Let's Begin
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
