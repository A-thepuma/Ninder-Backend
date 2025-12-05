"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const prismaClient_1 = require("./prismaClient");
const node_1 = require("better-auth/node"); // 👈 important
const auth_1 = require("./auth");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const allowedOrigins = ["http://localhost:4200"];
// CORS 
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
// Better auth
app.all("/api/auth/*splat", (0, node_1.toNodeHandler)(auth_1.auth));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Tester la session
app.get("/api/me", async (req, res) => {
    try {
        const session = await auth_1.auth.api.getSession({
            headers: (0, node_1.fromNodeHeaders)(req.headers),
        });
        if (!session) {
            return res.status(401).json({ error: "Unauthenticated" });
        }
        res.json({ user: session.user });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// Health
app.get("/api/health", async (_req, res) => {
    const now = await prismaClient_1.prisma.$queryRaw `SELECT NOW()`;
    res.json({ status: "ok", now });
});
app.listen(PORT, () => {
    console.log(`API Ninder running on http://localhost:${PORT}`);
});
