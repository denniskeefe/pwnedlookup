import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import breachesHandler from "./api/breaches.js";
import pastesHandler from "./api/pastes.js";
import passwordHandler from "./api/password.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3737;

app.use(express.json());
app.use(express.static(join(__dirname, "public")));

function wrap(handler) {
  return (req, res) => handler(req, res);
}

app.post("/api/breaches", wrap(breachesHandler));
app.post("/api/pastes", wrap(pastesHandler));
app.post("/api/password", wrap(passwordHandler));

app.listen(PORT, () => console.log(`HIBP app running at http://localhost:${PORT}`));
