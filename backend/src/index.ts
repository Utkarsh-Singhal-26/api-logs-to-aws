import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.post("/api/traffic/:customerId/:dataSourceId", (req, res) => {
  console.log("Request body:", req.body);
  console.log("Request params:", req.params);
  res.status(200).json({ message: "Success" });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
