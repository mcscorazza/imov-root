import express from "express";
import type { Application } from "express";
import tripRoutes from "./routes/tripRoutes.js";

const app: Application = express();

app.use(express.static("public"));
app.use(express.json());

app.use("/api", tripRoutes);

export default app;
