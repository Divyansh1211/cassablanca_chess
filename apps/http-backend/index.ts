import express from "express";
import { client } from "db";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware";

const app = express();
const PORT = 8080;

export const JwtSecret = process.env.JWT_SECRET;

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(express.json());

app.get("/loadRandomGame", authMiddleware, async (req, res) => {
  const game = await client.pastPlayedGame.findFirst({
    where: {
      id: Math.floor(Math.random() * 10),
    },
  });
  const moves = await client.chessGame.findMany({
    where: {
      userId: req.user.id,
      fen: game?.fen,
      pgn: game?.pgn,
    },
  });
  res.json(game);
});

app.get("/active", authMiddleware, async (req, res) => {
  const user = req.user.id;
  try {
    const active = await client.activeGame.findMany({
      where: {
        players: {
          hasEvery: [user],
        },
      },
    });
    res.status(200).json(active);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/checkExisting", authMiddleware, async (req, res) => {
  const user = req.user.id;
  try {
    const active = await client.activeGame.findFirst({
      where: {
        players: {
          hasSome: [],
        },
      },
    });
    if (active && active.players.length == 1) {
      await client.activeGame.update({
        where: {
          id: active.id,
        },
        data: {
          players: {
            push: user,
          },
        },
      });
      res.status(200).json(active);
    }
    res.status(404).json({ error: "No active game found" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/signup", async (req, res) => {
  const { email, username, password } = req.body;
  const passwordHash = bcrypt.hashSync(password, 10);
  try {
    await client.user.create({
      data: {
        email,
        name: username,
        password: passwordHash,
      },
    });
    res.status(201).json({
      message: "User created successfully",
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await client.user.findFirst({
      where: {
        email,
      },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (!bcrypt.compareSync(password, user.password)) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }
    const token = jwt.sign(
      {
        id: user.id,
      },
      JwtSecret!
    );
    res.status(200).json({ token });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port : ${PORT}`);
});
