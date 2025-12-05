// @ts-nocheck
import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { prisma } from "./prismaClient";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node"; 
import { auth } from "./auth";

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:4200",                 
  process.env.FRONTEND_URL || "",          
].filter(Boolean);

// CORS 
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Better auth

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use(cookieParser());

// Tester la session
app.get("/api/me", async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    res.json({ user: session.user });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Health
app.get("/api/health", async (_req: Request, res: Response) => {
  const now = await prisma.$queryRaw`SELECT NOW()`;
  res.json({ status: "ok", now });
});

app.listen(PORT, () => {
  console.log(`API Ninder running on http://localhost:${PORT}`);
});
