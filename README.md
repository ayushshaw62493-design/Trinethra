# Trinethra – Supervisor Feedback Analyzer

An AI-powered tool that analyzes supervisor feedback transcripts and generates structured, evidence-backed performance insights.

---

## 🚀 Setup Instructions

### 1. Clone the repository

git clone https://github.com/ayushshaw62493-design/Trinethra.git
cd Trinethra

---

### 2. Install backend dependencies

cd backend
npm install

---

### 3. Start Ollama (LLM)

Make sure Ollama is installed.

Run the model:

ollama run llama3.2

---

### 4. Start backend server

node server.js

Server runs at:
http://localhost:5000

---

### 5. Run frontend

Open:

frontend/index.html

(or use Live Server in VS Code)

---

### 6. Use the app

* Paste a transcript
* Click **Run Analysis**
* View structured output

---

## 🧠 Model Used

**Model:** llama3.2 (via Ollama)

### Why this model?

* Runs locally (no API dependency)
* Fast enough for real-time interaction
* Good structured reasoning capability
* Works reliably with JSON prompting

---

## 🏗️ Architecture Overview

The system follows a simple client-server flow:

Frontend (HTML + JS) → Backend (Node.js) → LLM (Ollama)

* **Frontend:** Takes transcript input and displays output
* **Backend:** Builds prompt, calls LLM, validates response
* **LLM:** Generates structured evaluation

Flow:

User Input → Frontend → Backend → LLM → Backend (validation) → Frontend

---

## ⚔️ Design Challenges Tackled

### 1. Structured Output Reliability

LLMs often return invalid or inconsistent JSON.

**Approach:**

* Forced JSON-only output in prompt
* Added try-catch parsing
* Implemented fallback response
* Normalized structure
* Filtered invalid / hallucinated evidence

**Impact:**

Stable, predictable output even with small models.

---

### 2. Over-Scoring Due to Positive Tone

Supervisors often sound positive even for average performers.
Naive systems over-score (e.g., 8 instead of 6).

**Approach:**

* Explicit scoring rules in prompt:

  * Execution → ~6
  * Problem identification → ~7
  * Systems building → 8+
* Penalized lack of independent thinking
* Added validation to prevent inflated scores

**Impact:**

More accurate evaluation — avoids misleading high scores.

---

## 🔥 Key Insight

Tone ≠ Performance.

Example:

"Very sincere, always on the floor"
→ sounds strong but indicates execution only
→ Correct score ≈ 6 (not 8)

---

## 🛠️ Key Improvements

* Prevented hallucinated evidence using validation
* Enforced strict scoring discipline
* Improved prompt structure for consistency
* Normalized output for frontend display

---

## 📊 Expected Behavior

### Sample Input

Karthik at Veerabhadra Auto Components

He helps with production tracking...
He noticed rejection rate patterns...
He did cycle time study...

---

### Expected Output

* Score ≈ 6 (not inflated)
* Evidence mapped to transcript
* Clear gaps (systems building, change management)
* Follow-up questions for deeper evaluation

---

## 🔮 What I Would Improve With More Time

* Side-by-side UI (transcript + analysis view)
* Highlight evidence directly inside transcript
* Multi-step prompting for higher accuracy
* Better KPI mapping logic
* Confidence visualization (UI level)

---

## 🎯 Conclusion

This tool focuses on:

* Evidence over assumptions
* Accuracy over flattery
* Structured reasoning over raw text

It is designed to assist human judgment, not replace it.
