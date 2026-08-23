import React from "react";
import { X, Hand, Play, Pause, CheckCircle2 } from "lucide-react";
import { buildIslSequence, resolveIslSourceText } from "../components/islUtils";

/**
 * Props:
 * - isOpen, onClose
 * - conceptName: short label shown in the header (e.g. "Loop Iteration")
 * - fullText: the ENGLISH base reply (englishText) — the whole statement
 *   to be read out in ISL. Always English, no matter what language is
 *   currently selected in chat, because isl_mapping.json is English-only.
 * - displayText: (optional) fallback if fullText/englishText wasn't captured.
 */
export default function ISLVideoPlayerModal({
  isOpen,
  onClose,
  conceptName,
  fullText,
  displayText,
}) {
  const [mappingData, setMappingData] = React.useState(null);
  const [sequence, setSequence] = React.useState([]);
  const [index, setIndex] = React.useState(0);
  const [letterIndex, setLetterIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [speed, setSpeed] = React.useState(1); // 0.5x - 2x playback speed
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    fetch("/isl/isl_mapping.json")
      .then((res) => res.json())
      .then((data) => setMappingData(data))
      .catch((err) => console.error("ISL mapping load failed:", err));
  }, []);

  React.useEffect(() => {
    if (!mappingData || !isOpen) return;
    const sourceText = resolveIslSourceText(
      fullText,
      displayText || conceptName,
    );
    const seq = buildIslSequence(sourceText, mappingData);

    if (seq.length === 0 && conceptName) {
      const fallbackWord = conceptName.split(/\s+/)[0]?.toLowerCase();
      if (fallbackWord)
        seq.push({
          type: "fingerspell",
          word: fallbackWord,
          original: fallbackWord,
        });
    }

    setSequence(seq);
    setIndex(0);
    setLetterIndex(0);
    setIsPlaying(true);
  }, [mappingData, fullText, displayText, conceptName, isOpen]);

  const current = sequence[index] || null;

  // Fingerspelling: animate through letters (speed-adjusted), then auto-advance.
  React.useEffect(() => {
    if (!isOpen || current?.type !== "fingerspell") return;
    const word = current.word.toUpperCase();
    if (letterIndex >= word.length) {
      if (isPlaying) {
        const t = setTimeout(() => goNext(), 500 / speed);
        return () => clearTimeout(t);
      }
      return;
    }
    const timer = setTimeout(() => setLetterIndex((i) => i + 1), 450 / speed);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, letterIndex, isPlaying, isOpen, speed]);

  // Keep video playback rate in sync with the chosen speed.
  React.useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed, current]);

  const goNext = () => {
    setIndex((i) => {
      const next = i + 1;
      if (next >= sequence.length) {
        setIsPlaying(false);
        return i;
      }
      setLetterIndex(0);
      return next;
    });
  };
  const goPrev = () => {
    setIndex((i) => {
      const prev = i - 1;
      if (prev < 0) return i;
      setLetterIndex(0);
      return prev;
    });
  };

  const handleVideoEnded = () => {
    if (isPlaying) goNext();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(28, 25, 23, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: "560px",
          border: "1px solid var(--border-medium)",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "16px 20px",
            backgroundColor: "#FEF3C7",
            borderBottom: "1px solid #FCD34D",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#92400E",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "700",
              fontSize: "15px",
            }}
          >
            <Hand size={20} color="#D97706" />
            <span>ISL: {conceptName || "Programming Logic"}</span>
          </div>
          <button
            onClick={onClose}
            style={{ color: "#92400E", padding: "4px", borderRadius: "4px" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Box */}
        <div
          style={{
            backgroundColor: "#000000",
            display: "flex",
            flexDirection: "column",
            color: "#FFFFFF",
          }}
        >
          {/* Sign display area */}
          <div
            style={{
              height: "220px",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!current && (
              <div style={{ fontSize: "13px", opacity: 0.7 }}>
                Loading ISL content...
              </div>
            )}

            {current?.type === "video" && (
              <video
                key={current.path}
                ref={videoRef}
                src={current.path}
                autoPlay
                muted
                onEnded={handleVideoEnded}
                onLoadedMetadata={(e) => {
                  e.currentTarget.playbackRate = speed;
                }}
                style={{ maxHeight: "180px", borderRadius: "8px" }}
              />
            )}

            {current?.type === "fingerspell" && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  padding: "0 20px",
                }}
              >
                {current.word
                  .toUpperCase()
                  .split("")
                  .map((ch, i) => (
                    <img
                      key={i}
                      src={`/isl/ISL_Letters/${ch}.jpg`}
                      alt={ch}
                      style={{
                        width: "48px",
                        height: "48px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        border:
                          i === letterIndex
                            ? "3px solid #FCD34D"
                            : "2px solid rgba(255,255,255,0.3)",
                        opacity: i <= letterIndex ? 1 : 0.4,
                        transition: "all 0.2s ease",
                      }}
                    />
                  ))}
              </div>
            )}

            {sequence.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "rgba(0,0,0,0.7)",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  color: "#FFFFFF",
                }}
              >
                <button
                  onClick={goPrev}
                  disabled={index === 0}
                  style={{
                    color: index === 0 ? "#666" : "#FCD34D",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  ◀
                </button>
                <button
                  onClick={() => setIsPlaying((p) => !p)}
                  style={{
                    color: "#FCD34D",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                </button>
                <span style={{ fontWeight: "700" }}>
                  {index + 1}/{sequence.length}
                </span>
                <button
                  onClick={goNext}
                  disabled={index === sequence.length - 1}
                  style={{
                    color: index === sequence.length - 1 ? "#666" : "#FCD34D",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  ▶
                </button>
                {/* Speed controller */}
                <select
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  style={{
                    marginLeft: "4px",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#FCD34D",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(252,211,77,0.4)",
                    borderRadius: "10px",
                    padding: "2px 4px",
                    cursor: "pointer",
                  }}
                  title="Playback speed"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>
            )}
          </div>

          {/* Subtitle strip — ONLY the current word, label reflects the
              actual type of THIS sign (video = SIGNING, fingerspelled = FINGERSPELLING) */}
          <div
            style={{
              padding: "12px 14px",
              borderTop: "1px solid rgba(255,255,255,0.15)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#FCD34D",
                fontWeight: "700",
                marginBottom: "4px",
                letterSpacing: "0.5px",
              }}
            >
              {current?.type === "video" ? "SIGNING" : "FINGERSPELLING"}
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: "800",
                letterSpacing: "1px",
              }}
            >
              {(current?.original || current?.word || "").toUpperCase()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 20px",
            fontSize: "12px",
            color: "var(--text-muted)",
            lineHeight: "1.5",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: "600",
              color: "var(--accent)",
              marginBottom: "4px",
            }}
          >
            <CheckCircle2 size={14} />
            <span>Grounded in NCERT Computer Science Vocabulary</span>
          </div>
          Curated ISL gestures mapped for Class 8+ CS curriculum. Signs are
          always matched from the English base answer, so this works the same
          way no matter which language is selected in chat.
        </div>
      </div>
    </div>
  );
}
