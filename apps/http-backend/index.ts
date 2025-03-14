import express from "express";
import { client } from "db";
import cors from "cors";

const app = express();
const PORT = 8080;

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(express.json());

app.get("/loadRandomGame", async (req, res) => {
  const gamme = await client.pastPlayedGame.findFirst({
    where: {
      id: Math.floor(Math.random() * 10),
    },
  });
  res.json(gamme);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
