# Credit Card Fraud Detection System 🛡️

This project is an end-to-end, industry-grade Machine Learning system designed to detect fraudulent credit card transactions in real-time. This project acts as a complete portfolio piece for Data Science, ML Engineering, and Banking Analytics roles.

## 📊 Project Overview
In the banking sector, identifying fraudulent transactions is like finding a needle in a haystack. With millions of legitimate transactions occurring daily, a fraud rate of <1% creates a massive **Class Imbalance** problem. This system solves this using advanced scoring heuristics and AI-powered forensic reasoning.

### The Problem
- **Financial Loss:** Missed fraud results in direct capital loss.
- **Customer Friction:** False positives (blocking good customers) damage brand loyalty.
- **Latency:** Decisions must happen in under 200ms.

### The Solution
The system utilizes a multi-layered defense:
1. **Heuristic Scoring:** Real-time evaluation of 50+ features.
2. **Dynamic Thresholding:** Analyst-controlled risk sensitivity.
3. **GenAI Forensics:** Contextual explanation of "Black Box" decisions using Gemini 1.5 Flash.

---

## 🏗️ Solution Architecture
```text
[Transaction Stream] -> [Preprocessing & Scaling] -> [Scoring Engine (XGBoost Sim)]
                                                            |
                                                            v
[GenAI Analytics] <--- [Alert Threshold Logic] <--- [Score Output]
        |                                                   |
        v                                                   v
[Human Review Queue] <---------------------------- [Automated Decision]
```

---

## 📁 Project Structure
The repository is organized following industry-standard Data Science project layouts:

```text
Credit-Card-Fraud-Detection/
├── data/              # Raw and processed transaction datasets (CSVs/Parquet)
├── notebooks/         # Jupyter Notebooks for EDA and Model Prototyping
├── models/            # Serialized model weights (Joblib/Pickle) and metadata
├── src/               # Production source code (React Dashboard + Express Server)
├── outputs/           # Performance metrics, confusion matrices, and ROC curves
├── images/            # Visualizations, dashboard screenshots, and flowcharts
├── README.md          # Project documentation (You are here)
├── requirements.txt   # Python environment dependencies
├── main.py            # CLI entry point for local ML simulation
├── server.ts          # Real-time Fraud Engine & Production API
└── package.json       # Node.js dependencies
```

---

## 🛠️ Implementation Phases

### Phase 1: Data Strategy
- **Synthetic Simulation:** Since real banking data is PII-protected, we simulate transaction behavior using `server.ts`.
- **Handling Imbalance:** We target a 5% fraud rate to demonstrate high-sensitivity detection.

### Phase 2: Feature Engineering
Our model considers:
- **Velocity:** Transaction frequency in the last 1h/24h.
- **Geospatial Risk:** Transactions originating from "Unknown" or "High-Risk" regions.
- **Temporal Patterns:** "Night Owl" transactions (2 AM - 5 AM) receive higher threat weights.
- **Entity Analytics:** Merchant categorization (Luxury vs. Essential).

### Phase 3: Real-Time Scoring
The backend acts as the "Inference Engine," calculating a `score (0-1)` for every inbound transaction. Decisions are made using the **Decision Threshold** set by the operator.

### Phase 4: AI Forensic Analysis
When a transaction is flagged, we invoke the **Decision AI Engine (Gemini)** to provide a human-readable justification. This bridges the gap between raw probability and operational insight.

---

## 🚦 Getting Started

### 1. Requirements
- Node.js 18+
- Python 3.9+ (For secondary ML scripts)
- [Gemini API Key](https://aistudio.google.com/app/apikey)

### 2. Installation
```bash
npm install
pip install -r requirements.txt
```

### 3. Running the Dashboard
```bash
npm run dev
```

---

## 📊 Evaluation Metrics
- **PR-AUC:** Primary metric due to class imbalance.
- **Recall:** Priority to catch all fraud.
- **Precision:** Monitored to prevent customer friction.
- **Latency:** Optimized for <100ms API response.

---
**Prepared for Careers in Fintech & Data Science**  
*Showcasing: Full-stack ML, GenAI Integration, and Domain Expertise in Banking Analytics.*
