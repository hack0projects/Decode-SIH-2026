import React from "react";
import { X, Hand, Play, Pause, CheckCircle2 } from "lucide-react";

export default function ISLVideoPlayerModal({
  isOpen,
  onClose,
  conceptName,
  signDescription,
}) {
  const [mappingData, setMappingData] = React.useState(null);
  const [displayContent, setDisplayContent] = React.useState(null);
  const [letterIndex, setLetterIndex] = React.useState(0);
  // For multi-word video cycling
  const [videoClips, setVideoClips] = React.useState([]);
  const [clipIndex, setClipIndex] = React.useState(0);

  // Load the ISL mapping file once
  React.useEffect(() => {
    fetch("/isl/isl_mapping.json")
      .then((res) => res.json())
      .then((data) => setMappingData(data))
      .catch((err) => console.error("ISL mapping load failed:", err));
  }, []);

  // BUG FIX 1: Collect ALL matched word clips for the full concept phrase,
  // not just the first matched word. This means a concept like
  // "Loop Iteration" can show a clip for "loop" AND one for "iteration"
  // in sequence, giving a full concept explanation rather than one word.
  React.useEffect(() => {
    if (!mappingData || !conceptName || !isOpen) return;
    setLetterIndex(0);
    setClipIndex(0);

    const skipWords = [
      "a", "an", "the", "is", "in", "of", "and", "or", "for",
      "with", "to", "from", "at", "by", "on",
    ];
    const words = conceptName.toLowerCase().split(/\s+/);

    // Collect every word that has a known ISL video
    const matched = words
      .filter((w) => !skipWords.includes(w) && mappingData.known_words?.[w])
      .map((w) => ({ type: "video", path: `/isl/${mappingData.known_words[w]}`, word: w }));

    if (matched.length > 0) {
      // We have at least one video — store all clips and show the first
      setVideoClips(matched);
      setDisplayContent(matched[0]);
    } else {
      // No known video — fingerspell the most meaningful word
      const target = words.find((w) => !skipWords.includes(w)) || words[0];
      setVideoClips([]);
      setDisplayContent({ type: "fingerspell", word: target });
    }
  }, [mappingData, conceptName, isOpen]);

  // Animate through letters if fingerspelling
  React.useEffect(() => {
    if (displayContent?.type !== "fingerspell") return;
    const word = displayContent.word.toUpperCase();
    if (letterIndex >= word.length) return;
    const timer = setTimeout(() => setLetterIndex(letterIndex + 1), 500);
    return () => clearTimeout(timer);
  }, [displayContent, letterIndex]);

  // Advance to the next video clip in the sequence
  const handleNextClip = () => {
    const next = clipIndex + 1;
    if (next < videoClips.length) {
      setClipIndex(next);
      setDisplayContent(videoClips[next]);
    }
  };
  const handlePrevClip = () => {
    const prev = clipIndex - 1;
    if (prev >= 0) {
      setClipIndex(prev);
      setDisplayContent(videoClips[prev]);
    }
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
            <span>ISL Gesture Clip: {conceptName || "Programming Logic"}</span>
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
            height: "280px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
          }}
        >
          {!displayContent && (
            <div style={{ fontSize: "13px", opacity: 0.7 }}>
              Loading ISL content...
            </div>
          )}

          {displayContent?.type === "video" && (
            <video
              key={displayContent.path}
              src={displayContent.path}
              autoPlay
              loop
              muted
              style={{ maxHeight: "200px", borderRadius: "8px" }}
            />
          )}

          {displayContent?.type === "fingerspell" && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                justifyContent: "center",
                padding: "0 20px",
              }}
            >
              {displayContent.word
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

          {/* Multi-clip navigation — shown only when there are multiple matched words */}
          {videoClips.length > 1 && (
            <div style={{
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
              color: "#FFFFFF"
            }}>
              <button
                onClick={handlePrevClip}
                disabled={clipIndex === 0}
                style={{ color: clipIndex === 0 ? "#666" : "#FCD34D", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
              >◀</button>
              <span style={{ fontWeight: "700" }}>
                {videoClips[clipIndex]?.word?.toUpperCase()} ({clipIndex + 1}/{videoClips.length})
              </span>
              <button
                onClick={handleNextClip}
                disabled={clipIndex === videoClips.length - 1}
                style={{ color: clipIndex === videoClips.length - 1 ? "#666" : "#FCD34D", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
              >▶</button>
            </div>
          )}

          {/* BUG FIX 1: Subtitle now shows the full signDescription passed by the
              caller (the actual concept explanation) instead of a generic fallback. */}
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              left: "16px",
              right: "16px",
              backgroundColor: "rgba(0,0,0,0.8)",
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              fontSize: "12px",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <div style={{ color: "#FCD34D", fontWeight: "700", marginBottom: "4px" }}>
              {displayContent?.type === "video" ? `ISL: "${conceptName}"` : "Fingerspelling:"}
            </div>
            <div style={{ lineHeight: "1.4" }}>
              {signDescription
                ? signDescription
                : `Sign gesture for the concept "${conceptName}"`}
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
          Curated ISL gestures mapped for Class 8+ CS curriculum.
        </div>
      </div>
    </div>
  );
}
