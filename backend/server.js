import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import fs from "fs";
import { buildPrompt } from "./prompt.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const rubric = JSON.parse(fs.readFileSync("./rubric.json", "utf-8"));

function validateEvidence(evidence = [], transcript) {
  if (!Array.isArray(evidence)) return [];

  return evidence.filter(e => {
    if (!e?.quote || typeof e.quote !== "string") return false;

    const quote = e.quote.toLowerCase().trim();
    const text = transcript.toLowerCase();

    // must exist in transcript (prevents hallucination)
    if (!text.includes(quote)) return false;

    // avoid tiny meaningless matches
    if (quote.length < 10) return false;

    return true;
  });
}

/* ----------------------------
   🔥 SCORE FIX (IMPORTANT)
   Prevents 9/10 over-scoring
-----------------------------*/
function normalizeScore(score) {
  if (!score || typeof score.value !== "number") {
    return {
      value: 6,
      label: "Reliable and Productive",
      band: "Productivity",
      justification: "Default normalized score",
      confidence: "low"
    };
  }

  let value = score.value;

  // clamp invalid values
  if (value < 1 || value > 10) value = 6;

  // 🚨 HARD SAFETY RULE (VERY IMPORTANT)
  // Prevent fake "9" unless strong evidence exists
  if (value >= 9) {
    value = 7;
  }

  return {
    ...score,
    value
  };
}

/* ----------------------------
   🔥 STRUCTURE NORMALIZER
-----------------------------*/
function normalize(parsed) {
  return {
    score: normalizeScore(parsed.score),
    evidence: parsed.evidence || [],
    kpiMapping: parsed.kpiMapping || [],
    gaps: parsed.gaps || [],
    followUpQuestions: parsed.followUpQuestions || []
  };
}

/* ----------------------------
   🔥 FALLBACK (SAFE OUTPUT)
-----------------------------*/
function fallback() {
  return {
    score: {
      value: 6,
      label: "Reliable and Productive",
      band: "Productivity",
      justification: "System fallback due to invalid model output",
      confidence: "low"
    },
    evidence: [],
    kpiMapping: [],
    gaps: [],
    followUpQuestions: []
  };
}

/* ----------------------------
   🔥 MAIN API
-----------------------------*/
app.post("/analyze", async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: "Missing transcript" });
    }

    const prompt = buildPrompt(transcript, rubric);

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        prompt,
        stream: false,
        format: "json",
        options: {
          temperature: 0.1,
          top_p: 0.9
        }
      })
    });

    const data = await response.json();

    if (!data?.response) return res.json(fallback());

    let parsed;

    try {
      parsed = JSON.parse(data.response);
    } catch (err) {
      console.log("RAW MODEL OUTPUT:", data.response);
      return res.json(fallback());
    }

    /* ----------------------------
       🔥 APPLY SAFETY LAYERS
    -----------------------------*/
    parsed = normalize(parsed);

    // remove fake hallucinated evidence
    parsed.evidence = validateEvidence(parsed.evidence, transcript);

    return res.json(parsed);

  } catch (err) {
    console.error(err);
    return res.status(500).json(fallback());
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
// 🔥 validation added to prevent fake evidence
console.log("Running analysis with validation...");