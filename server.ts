import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

// types.ts
export interface Transaction {
  id: string;
  timestamp: string;
  amount: number;
  merchant: string;
  category: string;
  location: string;
  device: string;
  cardType: string;
  isFraud: boolean;
  score: number; // 0-1
  reason?: string;
}

const app = express();
app.use(express.json());

const PORT = 3000;

// Simulation State
let transactions: Transaction[] = [];

// Helper: Generate a transaction
const generateTx = (forceFraud = false): Transaction => {
  const isFraud = forceFraud || Math.random() < 0.05; // 5% base fraud rate for simulation visibility
  const amount = isFraud ? Math.floor(Math.random() * 5000) + 1000 : Math.floor(Math.random() * 500) + 10;
  
  // Logic Engine (Simulating a trained model)
  // High weight factors: High amount, unusual hours, high-risk categories
  const hour = new Date().getHours();
  const isNight = hour < 5 || hour > 23;
  let score = 0.1;
  
  if (amount > 1000) score += 0.3;
  if (isNight) score += 0.2;
  if (isFraud) score += 0.3; // Signal overlap
  score += Math.random() * 0.1; // Noise
  
  return {
    id: `tx_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    amount,
    merchant: ["Amazon", "Steam", "Luxury Jewelers", "Unknown Kiosk", "Local Cafe", "Apple Store"][Math.floor(Math.random() * 6)],
    category: ["Retail", "Entertainment", "Luxury", "Services", "Food", "Tech"][Math.floor(Math.random() * 6)],
    location: ["New York, NY", "London, UK", "Paris, FR", "Unknown", "Tokyo, JP"][Math.floor(Math.random() * 5)],
    device: ["iPhone 15", "MacBook Pro", "Android Emulator", "Unknown Device"][Math.floor(Math.random() * 4)],
    cardType: ["VISA Gold", "Mastercard Platinum", "AMEX"][Math.floor(Math.random() * 3)],
    isFraud,
    score: Math.min(score, 1.0)
  };
};

// Initial data
transactions = Array.from({ length: 50 }, () => generateTx());

// API Routes
app.get("/api/transactions", (req, res) => {
  res.json(transactions);
});

app.post("/api/simulate", (req, res) => {
  const newTx = generateTx(req.body.forceFraud);
  transactions = [newTx, ...transactions].slice(0, 100);
  res.json(newTx);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Credit Card Fraud Detection Engine online at http://localhost:${PORT}`);
  });
}

startServer();
