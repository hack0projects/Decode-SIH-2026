import React, { useState, useCallback } from "react";
import { Bot, Languages, Hand, Send, Volume2, Mic } from "lucide-react";
import ISLVideoPlayerModal from "../components/ISLVideoPlayerModal";
import { startListening, speakText, getLocaleCode } from "../components/speechUtils";
import { askTutor, translateText } from "../services/api";

export default function AIMentorPage({ currentLang }) {
  const [selectedLang, setSelectedLang] = useState(currentLang || "hi");
  const [inputQuery, setInputQuery] = useState("");

  const INITIAL_GREETINGS = {
    hi: "नमस्ते! मैं आपका CodeSeekho AI मेंटर हूँ। मैं कक्षा 8+ के छात्रों को क्षेत्रीय भाषाओं में प्रोग्रामिंग अवधारणाओं को समझने में मदद करता हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?",
    en: "Namaste! I am your CodeSeekho AI Mentor. I help Class 8+ students understand programming concepts in plain regional languages without spoiling answers with direct code dumps. How can I help you today?",
    ta: "வணக்கம்! நான் உங்கள் CodeSeekho AI வழிகாட்டி. வகுப்பு 8+ மாணவர்களுக்கு நிரலாக்கக் கருத்துக்களைப் புரிந்துகொள்ள உதவுகிறேன். இன்று உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    te: "నమస్తే! నేను మీ CodeSeekho AI మెంటార్‌ను. 8వ తరగతి + విద్యార్థులకు ప్రోగ్రామింగ్ కాన్సెప్ట్‌లను అర్థం చేసుకోవడానికి నేను సహాయం చేస్తాను. ఈరోజు నేను మీకు ఎలా సహాయపడగలను?",
    kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ CodeSeekho AI ಮೆಂಟರ್. 8 ನೇ ತರಗತಿ+ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪ್ರೋಗ್ರಾಮಿಂಗ್ ಪರಿಕಲ್ಪನೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    mr: "नमस्ते! मी तुमचा CodeSeekho AI मेंटॉर आहे. मी इयत्ता 8वी+ च्या विद्यार्थ्यांना प्रोग्रामिंग संकल्पना समजून घेण्यास मदत करतो. आज मी तुम्हाला कशी मदत करू शकतो?",
    bn: "নমস্কার! আমি আপনার CodeSeekho AI মেন্টর। আমি অষ্টম শ্রেণী+ এর ছাত্রদের প্রোগ্রামিং ধারণাগুলি বুঝতে সাহায্য করি। আজ কীভাবে সাহায্য করতে পারি?",
    gu: "નમસ્તે! હું તમારો CodeSeekho AI મેન્ટર છું. હું ધોરણ 8+ ના વિદ્યાર્થીઓને પ્રોગ્રામિંગ વિભાવનાઓ સમજવામાં મદદ કરું છું. આજે હું તમને કેવી રીતે મદદ કરી શકું?"
  };

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: INITIAL_GREETINGS[currentLang || "hi"] || INITIAL_GREETINGS.hi,
      englishText:
        "Namaste! I am your CodeSeekho AI Mentor. I help Class 8+ students understand programming concepts in plain regional languages without spoiling answers with direct code dumps. How can I help you today?",
      islAvailable: true,
      concept: "Introduction",
    },
  ]);

  // Sync initial message greeting whenever selectedLang or currentLang changes
  React.useEffect(() => {
    const lang = selectedLang || currentLang || "hi";
    const greetingText = INITIAL_GREETINGS[lang] || INITIAL_GREETINGS.en;
    setMessages((prev) => {
      if (!prev || prev.length === 0) return prev;
      const updated = [...prev];
      if (updated[0].role === "assistant" && updated[0].concept === "Introduction") {
        updated[0] = { ...updated[0], text: greetingText };
      }
      return updated;
    });
  }, [selectedLang, currentLang]);

  const [isIslModalOpen, setIsIslModalOpen] = useState(false);
  const [activeIslConcept, setActiveIslConcept] = useState("");
  const [activeIslText, setActiveIslText] = useState("");

  // Map short language codes to the full names the /translate backend expects.
  const LANG_FULL_NAMES = {
    hi: "Hindi",
    ta: "Tamil",
    te: "Telugu",
    kn: "Kannada",
    mr: "Marathi",
    bn: "Bengali",
    gu: "Gujarati",
  };

  const BASE_URL = "https://decode-sih-2026.onrender.com";

  // Translates English text to the selected regional language via backend API.
  // Returns translated text, or the original if translation fails.
  const translateReply = useCallback(
    async (englishText, langCode, studentName) => {
      const targetLanguage = LANG_FULL_NAMES[langCode];
      if (!targetLanguage) return englishText; // 'en' — no translation needed
      try {
        const res = await fetch(`${BASE_URL}/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: englishText,
            targetLanguage,
            studentName,
          }),
        });
        const data = await res.json();
        return data.translatedText || englishText;
      } catch {
        return englishText; // graceful fallback to English on network error
      }
    },
    [],
  );

  const sampleQuestions = [
    "What is the difference between a for loop and a while loop?",
    "Why do I get 'IndexError: list index out of range'?",
    "How does a variable store data in computer memory?",
    "Explain functions using a simple recipe analogy.",
  ];

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery;
    setInputQuery("");

    setMessages((prev) => [...prev, { role: "user", text: userText }]);

    const conceptLabel = userText.toLowerCase().includes("loop")
      ? "Loop Iteration"
      : userText.toLowerCase().includes("error")
        ? "Error Debugging"
        : "CS Concepts";

    // englishText is ALWAYS captured, regardless of which language ends
    // up on screen. The ISL modal reads from this — not from `displayText`
    // — so ISL sign matching works the same for every language.
    let englishText = "";
    let displayText = "";

    try {
      const res = await askTutor(userText, "Aarav");
      console.log("🔥 FRONTEND ASK-TUTOR RESPONSE:", res);

      const tutorReply = res?.answer || res?.reply || res?.response;

      if (tutorReply && tutorReply.trim()) {
        // ✅ Backend returned a valid answer — display it regardless of success flag
        englishText = res?.englishReply || tutorReply;

        if (selectedLang !== "en" && !res?.englishReply && !res?.isTranslated) {
          try {
            const trans = await translateReply(tutorReply, selectedLang, "Aarav");
            // Only use translated text if it's a non-empty string, else show English
            displayText = (trans && typeof trans === "string" && trans.trim()) ? trans : tutorReply;
          } catch {
            displayText = tutorReply;
          }
        } else {
          displayText = tutorReply;
        }

        // Final safety net: never render blank
        if (!displayText || !displayText.trim()) {
          displayText = tutorReply;
        }
      } else {
        // 🔁 Backend offline/erroring — use local Socratic fallback
        const lowerQ = userText.toLowerCase();
        if (lowerQ.includes("data structure") || lowerQ.includes("structure")) {
          englishText =
            "A Data Structure is a specialized way of organizing and storing data in a computer so that it can be accessed and modified efficiently. Think of it like a library bookshelf (Array) or a stack of plates (Stack) — each structure is designed for a specific purpose!";
        } else if (lowerQ.includes("loop") || lowerQ.includes("for") || lowerQ.includes("while")) {
          englishText =
            "A Loop repeats a block of code instructions until a specific condition turns false. Think of it like running laps around a track or a music player repeating your favorite playlist!";
        } else if (lowerQ.includes("variable") || lowerQ.includes("store")) {
          englishText =
            "A Variable is a named container in computer memory used to store data values like numbers, text, or true/false states. Think of it like a labeled box where you store items!";
        } else if (lowerQ.includes("function") || lowerQ.includes("method")) {
          englishText =
            "A Function is a reusable block of code designed to perform a single specific task. Think of it like a recipe in a cookbook or a single button on a remote control!";
        } else if (lowerQ.includes("error") || lowerQ.includes("bug") || lowerQ.includes("exception")) {
          englishText =
            "Syntax errors happen when instructions are incomplete or misformatted. Check for missing quotes, unmatched colons, or improper line indentation!";
        } else {
          englishText =
            `Great question about "${userText}"! In computer science, we break down complex problems into step-by-step algorithmic instructions. Try practicing with a small code snippet in the workspace!`;
        }

        if (selectedLang !== "en") {
          try {
            const trans = await translateText(englishText, selectedLang, "Aarav");
            displayText = (trans?.translatedText && trans.translatedText.trim()) ? trans.translatedText : englishText;
          } catch {
            displayText = englishText;
          }
        } else {
          displayText = englishText;
        }
      }
    } catch (err) {
      console.error("AI Mentor request failed:", err);
      englishText =
        "Something went wrong reaching the mentor. Please try asking again.";
      displayText = englishText;
    }

    // Absolute last-resort guard — never set an empty message bubble
    if (!displayText || !displayText.trim()) {
      displayText = englishText || "I'm processing your question. Please try again in a moment!";
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: displayText,
        islAvailable: true,
        concept: conceptLabel,
        // Store the English base so ISL sign matching always works,
        // no matter which language `text` above is displayed in.
        englishText,
      },
    ]);
  };

  const triggerIslModal = (concept, englishText) => {
    setActiveIslConcept(concept);
    setActiveIslText(englishText || "");
    setIsIslModalOpen(true);
  };

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "32px 24px 80px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px",
        }}
      >
        <div>
          <div className="pill-badge" style={{ marginBottom: "10px" }}>
            <Bot size={14} />
            <span>Socratic Learning Pipeline</span>
          </div>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "800",
              letterSpacing: "-0.5px",
            }}
          >
            AI Coding Mentor Lab
          </h1>
          <p style={{ fontSize: "15px", color: "var(--text-muted)" }}>
            Answers grounded in NCERT Computer Science curriculum without direct
            code dumps.
          </p>
        </div>

        {/* Regional Language Switcher */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "var(--bg-card)",
            padding: "8px 14px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-medium)",
          }}
        >
          <Languages size={18} color="var(--accent)" />
          <span style={{ fontSize: "13px", fontWeight: "600" }}>
            AI Language:
          </span>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            style={{
              fontSize: "13px",
              fontWeight: "700",
              border: "none",
              backgroundColor: "transparent",
              outline: "none",
              color: "var(--accent)",
              cursor: "pointer",
            }}
          >
            <option value="hi">हिंदी (Hindi)</option>
            <option value="en">English</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
            <option value="mr">मराठी (Marathi)</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="gu">ગુજરાતી (Gujarati)</option>
          </select>
        </div>
      </div>

      {/* Suggested Quick Questions Pills */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "var(--text-faint)",
            marginBottom: "10px",
          }}
        >
          Suggested Questions based on your recent NCERT lessons:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {sampleQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => setInputQuery(q)}
              style={{
                fontSize: "13px",
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                color: "var(--text-muted)",
                transition: "all 0.15s ease",
              }}
            >
              💡 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className="card"
        style={{
          minHeight: "440px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "0",
          overflow: "hidden",
        }}
      >
        {/* Messages List */}
        <div
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxHeight: "480px",
            overflowY: "auto",
          }}
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                backgroundColor:
                  m.role === "user" ? "var(--accent)" : "var(--bg-subtle)",
                color: m.role === "user" ? "#FFFFFF" : "var(--text-main)",
                padding: "16px 20px",
                borderRadius: "var(--radius-md)",
                fontSize: "14px",
                lineHeight: "1.6",
                border:
                  m.role === "user"
                    ? "1px solid var(--accent)"
                    : "1px solid var(--border-light)",
              }}
            >
              <div>{m.text}</div>

              {m.islAvailable && (
                <div
                  style={{
                    marginTop: "12px",
                    paddingTop: "10px",
                    borderTop: "1px solid var(--border-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "var(--text-muted)",
                    }}
                  >
                    Mapped NCERT Concept: <strong>{m.concept}</strong>
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() =>
                        speakText(m.text, getLocaleCode(selectedLang))
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "var(--accent)",
                        backgroundColor: "var(--bg-card)",
                        padding: "4px 10px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-medium)",
                      }}
                    >
                      <Volume2 size={14} />
                      <span>Listen</span>
                    </button>
                    <button
                      onClick={() => triggerIslModal(m.concept, m.englishText)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#D97706",
                        backgroundColor: "#FEF3C7",
                        padding: "4px 10px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid #FCD34D",
                      }}
                    >
                      <Hand size={14} />
                      <span>Watch ISL Sign Video</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: "16px 20px",
            backgroundColor: "var(--bg-subtle)",
            borderTop: "1px solid var(--border-light)",
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            className="form-input"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Type your question or paste code error here..."
            style={{ fontSize: "14px" }}
          />

          <button
            type="button"
            onClick={() => {
              startListening(getLocaleCode(selectedLang), (text) => {
                setInputQuery(text);
              });
            }}
            style={{
              padding: "10px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-medium)",
              cursor: "pointer",
            }}
          >
            <Mic size={16} color="var(--accent)" />
          </button>

          <button
            type="submit"
            className="btn-primary"
            style={{ padding: "10px 20px", whiteSpace: "nowrap" }}
          >
            <Send size={16} />
            <span>Ask Mentor</span>
          </button>
        </form>
      </div>

      {/* ISL Player Modal */}
      <ISLVideoPlayerModal
        isOpen={isIslModalOpen}
        onClose={() => setIsIslModalOpen(false)}
        conceptName={activeIslConcept}
        fullText={activeIslText}
      />
    </div>
  );
}
