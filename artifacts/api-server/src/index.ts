import app from "./app";
import { seedJackpots } from "./lib/seed.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

seedJackpots()
  .catch((err) => console.error("[seed] error:", err))
  .finally(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  });
