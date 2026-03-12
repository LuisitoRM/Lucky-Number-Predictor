import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import { existsSync } from "fs";
import router from "./routes";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(process.cwd(), "artifacts", "lottery-app", "dist", "public");
  if (existsSync(staticPath)) {
    app.use(express.static(staticPath));
    app.get("/*splat", (_req, res) => {
      res.sendFile(path.join(staticPath, "index.html"));
    });
  }
}

export default app;
