import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.route.js"
import indexRoutes from "./routes/index.js"

const app = express();


app.set("trust proxy", true);
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Monta Auth.js en /auth/*
app.use(indexRoutes);

app.use("/auth", authRouter)




app.get("/", (_req, res) => res.send("API funcionando"));


const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));