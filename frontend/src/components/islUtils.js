// islUtils.js
//
// PURPOSE
// -------
// isl_mapping.json only has ENGLISH keys (known_words / fingerspelling_only).
// But the AI Mentor chat can reply in Hindi, Tamil, Telugu, etc. If we try
// to match ISL signs against the *translated* text, almost nothing matches.
//
// So instead: every reply keeps its ENGLISH base text (`englishText`)
// alongside the translated text shown in chat. The ISL component always
// builds its sign sequence from that English text — regardless of which
// language the student picked in the UI. That English text is normalized
// into a common set of "slugs" (e.g. "adding"/"added"/"adds" -> "add")
// so different surface forms of the same concept all map to one video.
//
// This file is the single place that does that normalization, so both
// AIMentorPage (choosing what to send) and ISLVideoPlayerModal (choosing
// what to render) stay in sync.

// Words that never carry ISL-worthy meaning on their own.
const SKIP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "in",
  "of",
  "and",
  "or",
  "for",
  "with",
  "to",
  "from",
  "at",
  "by",
  "on",
  "it",
  "this",
  "that",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "as",
  "if",
  "then",
  "you",
  "your",
  "i",
  "we",
  "my",
  "me",
  "so",
  "but",
  "not",
  "do",
  "does",
  "did",
  "can",
  "will",
  "would",
  "should",
  "have",
  "has",
  "had",
  "there",
  "here",
  "when",
  "how",
  "what",
  "why",
  "which",
  "like",
  "a",
  "an",
  "these",
  "those",
  "than",
  "into",
  "about",
]);

// Multi-word phrases must resolve BEFORE single-word matching, otherwise
// "and operator" would try (and fail) to match "and" + "operator" as two
// separate words instead of the one "and_operator" clip.
const PHRASE_ALIASES = [
  { phrase: "and operator", slug: "and_operator" },
  { phrase: "logical and", slug: "and_operator" },
  { phrase: "not operator", slug: "not_operator" },
  { phrase: "logical not", slug: "not_operator" },
];

// Surface-form / synonym -> canonical known_words key. This is the
// "unified key" layer: plurals, verb tenses, and near-synonyms all
// collapse to the one slug that isl_mapping.json actually has a clip for.
const WORD_ALIASES = {
  errors: "mistake",
  error: "mistake",
  bug: "debug",
  bugs: "debug",
  fixing: "debug",
  fix: "debug",
  fixed: "debug",
  adds: "add",
  added: "add",
  adding: "addition",
  subtracts: "subtract",
  subtracted: "subtract",
  subtracting: "subtraction",
  multiplies: "multiply",
  multiplied: "multiply",
  multiplying: "multiplication",
  divides: "divide",
  divided: "divide",
  dividing: "division",
  functions: "function",
  methods: "method",
  parameters: "parameter",
  arguments: "argument",
  integers: "integer",
  booleans: "boolean",
  questions: "question",
  answers: "answer",
  results: "result",
  returns: "return",
  returning: "return",
  prints: "print",
  printing: "print",
  printed: "print",
  learning: "learn",
  learned: "learn",
  studying: "study",
  studied: "study",
  practicing: "practice",
  practiced: "practice",
  understanding: "understand",
  understood: "understand",
  understands: "understand",
  computers: "computer",
  networks: "network",
  websites: "website",
  images: "image",
  cells: "cell",
  options: "option",
  executes: "execute",
  executing: "execute",
  executed: "execute",
  correcting: "correct",
  corrected: "correct",
  wrongly: "wrong",
  incorrect: "wrong",
  restarting: "restart",
  restarted: "restart",
  edits: "edit",
  editing: "edit",
  edited: "edit",
  opens: "open",
  opening: "open",
  opened: "open",
  clears: "clear",
  clearing: "clear",
  cleared: "clear",
  selects: "select",
  selecting: "select",
  selected: "select",
  chooses: "choose",
  choosing: "choose",
  chose: "choose",
  chosen: "choose",
  draws: "draw",
  drawing: "draw",
  drew: "draw",
  drawn: "draw",
  includes: "include",
  including: "include",
  included: "include",
  tries: "try",
  trying: "try",
  tried: "try",
  turns: "turn",
  turning: "turn",
  turned: "turn",
  loses: "lose",
  losing: "lose",
  lost: "lose",
  helps: "help",
  helping: "help",
  helped: "help",
};

const stripPunct = (w) => w.replace(/[.,!?"'()[\]{}:;]/g, "");

/** Any raw English word -> canonical slug (or null if empty/skip word). */
export function toSlug(rawWord) {
  const w = stripPunct(String(rawWord).toLowerCase());
  if (!w) return null;
  return WORD_ALIASES[w] || w;
}

/**
 * Build an ordered ISL sequence (mix of matched video clips + fingerspelled
 * words) for a FULL English sentence, in reading order. This is what lets
 * the modal "read" an entire statement instead of a 2-3 word concept label.
 */
export function buildIslSequence(text, mappingData) {
  if (!text || !mappingData) return [];

  const lower = text.toLowerCase();
  const consumed = new Array(lower.length).fill(false);

  const phraseMatches = [];
  for (const { phrase, slug } of PHRASE_ALIASES) {
    let idx = lower.indexOf(phrase);
    while (idx !== -1) {
      phraseMatches.push({
        start: idx,
        end: idx + phrase.length,
        slug,
        original: text.slice(idx, idx + phrase.length),
      });
      for (let i = idx; i < idx + phrase.length; i++) consumed[i] = true;
      idx = lower.indexOf(phrase, idx + phrase.length);
    }
  }
  phraseMatches.sort((a, b) => a.start - b.start);

  const tokens = [];
  const tokenRegex = /[A-Za-z]+/g;
  let m;
  while ((m = tokenRegex.exec(text)) !== null) {
    tokens.push({ word: m[0], start: m.index, end: m.index + m[0].length });
  }

  const sequence = [];
  let phrasePtr = 0;

  const pushSlug = (slug, original) => {
    if (mappingData.known_words?.[slug]) {
      sequence.push({
        type: "video",
        word: slug,
        original: original || slug,
        path: `/isl/${mappingData.known_words[slug]}`,
      });
      return true;
    }
    return false;
  };

  // Every token becomes a sign — matched video clip if one exists,
  // otherwise fingerspelled fallback. Nothing is skipped anymore,
  // not even short filler words like "a" / "is" / "the".
  for (const tok of tokens) {
    while (
      phrasePtr < phraseMatches.length &&
      phraseMatches[phrasePtr].start <= tok.start
    ) {
      const pm = phraseMatches[phrasePtr];
      if (!pushSlug(pm.slug, pm.original)) {
        sequence.push({
          type: "fingerspell",
          word: pm.slug,
          original: pm.original,
        });
      }
      phrasePtr++;
    }
    if (consumed[tok.start]) continue;

    const slug = toSlug(tok.word);
    if (!slug) continue; // only truly empty tokens (stripped punctuation) are dropped

    if (!pushSlug(slug, tok.word)) {
      sequence.push({ type: "fingerspell", word: slug, original: tok.word });
    }
  }
  while (phrasePtr < phraseMatches.length) {
    const pm = phraseMatches[phrasePtr];
    if (!pushSlug(pm.slug, pm.original)) {
      sequence.push({
        type: "fingerspell",
        word: pm.slug,
        original: pm.original,
      });
    }
    phrasePtr++;
  }

  return sequence;
}

/**
 * Decide which text ISL matching should run against: always prefer the
 * English base text (englishText), regardless of the language currently
 * shown in chat. Falls back to the displayed text only if no English
 * base was captured (shouldn't normally happen once callers are fixed).
 */
export function resolveIslSourceText(englishText, displayedText) {
  return (englishText && englishText.trim()) || displayedText || "";
}
