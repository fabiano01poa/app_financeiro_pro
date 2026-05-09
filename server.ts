import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const SPREADSHEET_ID = process.env.VITE_SPREADSHEET_ID;

app.use(express.json());

// Google Sheets Auth
function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let key = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !key) {
    return null;
  }

  // Sanitize the key: handle literal \n, quotes, and missing headers
  try {
    // 1. Remove wrapping quotes if present
    key = key.trim();
    if (key.startsWith('"') && key.endsWith('"')) {
      key = key.slice(1, -1);
    }
    if (key.startsWith("'") && key.endsWith("'")) {
      key = key.slice(1, -1);
    }

    // 2. Replace escaped newlines with actual newlines
    // We handle both \n and \\n just in case
    key = key.replace(/\\n/g, '\n');

    // 3. If it doesn't look like a PEM yet, try to reconstruct it
    if (!key.includes("-----BEGIN PRIVATE KEY-----")) {
      // Sometimes the key is just the base64 part
      key = `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`;
    }

    // 4. Final check for internal spaces that should maybe be newlines (common pasting error)
    // But be careful not to break valid base64
    // Usually, PEM keys have newlines every 64 chars, but Node's crypto is okay with one long line
    // as long as the headers are there.

    const auth = new JWT({
      email,
      key: key.trim(),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    return google.sheets({ version: "v4", auth });
  } catch (error) {
    console.error("Error creating Google Sheets client:", error);
    return null;
  }
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/data", async (req, res) => {
  try {
    const sheets = getSheetsClient();
    if (!sheets) {
      return res.status(401).json({ 
        error: "CREDENTIALS_MISSING",
        message: "Configuração do Google Sheets pendente nas configurações do projeto." 
      });
    }
    
    // Fetch multiple ranges at once: Transactions, FixedAccounts, Categories
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: ["Transactions!A:Z", "FixedAccounts!A:Z", "Categories!A:Z"],
    }).catch(err => {
      // Re-throw with a more descriptive message if it's a 400 error (likely range not found)
      if (err.code === 400) {
        throw new Error(`Intervalo ou Aba não encontrada. Certifique-se de que sua planilha tem as abas: 'Transactions', 'FixedAccounts' e 'Categories'.`);
      }
      throw err;
    });

    const valueRanges = response.data.valueRanges || [];
    
    const transactions = valueRanges[0]?.values || [];
    const fixedAccounts = valueRanges[1]?.values || [];
    const categories = valueRanges[2]?.values || [];

    // Map helpers to avoid crashes on empty rows
    const safeParseFloat = (val: any) => isNaN(parseFloat(val)) ? 0 : parseFloat(val);
    const safeParseInt = (val: any, def: number) => isNaN(parseInt(val)) ? def : parseInt(val);

    res.json({
      transactions: transactions.length > 1 ? transactions.slice(1).map(row => ({
        id: row[0] || Math.random().toString(36).substr(2, 9),
        description: row[1] || "",
        amount: safeParseFloat(row[2]),
        type: row[3] || "expense",
        category: row[4] || "Outros",
        date: row[5] || new Date().toISOString(),
        dueDate: safeParseInt(row[6], 1),
        installments: row[7] ? safeParseInt(row[7], 1) : undefined,
        currentInstallment: row[8] ? safeParseInt(row[8], 1) : undefined
      })) : [],
      fixedAccounts: fixedAccounts.length > 1 ? fixedAccounts.slice(1).map(row => ({
        id: row[0] || Math.random().toString(36).substr(2, 9),
        description: row[1] || "",
        expectedAmount: safeParseFloat(row[2]),
        dueDate: safeParseInt(row[3], 1),
        status: row[4] || "pending",
        category: row[5] || "Outros"
      })) : [],
      categories: categories.length > 1 ? categories.slice(1).map(row => row[0]).filter(Boolean) : ['Alimentação', 'Transporte', 'Lazer', 'Moradia', 'Saúde', 'Outros']
    });
  } catch (error: any) {
    console.error("Detailed error fetching data:", error);
    res.status(500).json({ 
      error: "SHEETS_ERROR", 
      message: error.message || "Erro desconhecido ao acessar a planilha." 
    });
  }
});

app.post("/api/save", async (req, res) => {
  try {
    const { transactions, fixedAccounts, categories } = req.body;
    const sheets = getSheetsClient();
    if (!sheets) throw new Error("Credentials missing during save.");

    const data = [
      {
        range: "Transactions!A2:Z",
        values: (transactions || []).map((t: any) => [
          t.id, t.description, t.amount, t.type, t.category, t.date, t.dueDate || "", t.installments || "", t.currentInstallment || ""
        ])
      },
      {
        range: "FixedAccounts!A2:Z",
        values: (fixedAccounts || []).map((a: any) => [
          a.id, a.description, a.expectedAmount, a.dueDate, a.status, a.category
        ])
      },
      {
        range: "Categories!A2:Z",
        values: (categories || []).map((c: string) => [c])
      }
    ];

    // Clear existing data first (except headers)
    const rangesToClear = ["Transactions!A2:Z", "FixedAccounts!A2:Z", "Categories!A2:Z"];
    
    await sheets.spreadsheets.values.batchClear({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { ranges: rangesToClear }
    }).catch(err => {
       if (err.code === 400) {
        throw new Error(`Erro ao limpar dados. Verifique se as abas 'Transactions', 'FixedAccounts' e 'Categories' existem.`);
      }
      throw err;
    });

    // Update with new data
    if (data.some(d => d.values.length > 0)) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          data: data.filter(d => d.values.length > 0),
          valueInputOption: "RAW"
        }
      });
    }

    res.json({ status: "success" });
  } catch (error: any) {
    console.error("Error saving data to Sheets:", error);
    res.status(500).json({ 
      error: "SAVE_ERROR",
      message: error.message || "Erro ao salvar na planilha." 
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
