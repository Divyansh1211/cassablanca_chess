import express from "express";
import { client } from "db";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware";
import crypto from "crypto";

const app = express();
const PORT = 8080;

export const JwtSecret = process.env.JWT_SECRET;

app.use(
  cors({
    origin: ["http://localhost:3000", "http://chess.divyansh.lol"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.get("/loadRandomGame", authMiddleware, async (req, res) => {
  const game = await client.pastPlayedGame.findFirst({
    where: {
      id: Math.floor(Math.random() * 10),
    },
  });
  const currGame = await client.chessGame.create({
    include: {
      // players: {
      //   include: {
      //     user: true,
      //   },
      // },
      user: true,
    },
    data: {
      lobbyId: crypto.randomBytes(16).toString("hex"),
      color: "WHITE",
      userId: req.user.id,
      gameStatus: "IN_PROGRESS",
      fen: game?.fen ?? "",
      pgn: game?.pgn ?? "",
      result: "IN_PROGRESS",
      // players: {
      //   create: {
      //     userId: req.user.id,
      //     color: "WHITE",
      //   },
      // },
      isJoinable: true,
    },
  });
  res.json(currGame);
});

app.get("/active", authMiddleware, async (req, res) => {
  const user = req.user.id;
  try {
    const active = await client.chessGame.findFirst({
      include: {
        // players: {
        //   include: {
        //     user: true,
        //   },
        // },
        user: true,
      },
      where: {
        AND: [{ userId: user }, { gameStatus: "IN_PROGRESS" }],
      },
    });
    res.status(200).json(active);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/checkExisting", authMiddleware, async (req, res) => {
  try {
    const active = await client.chessGame.findFirst({
      include: {
        // players: {
        //   include: {
        //     user: true,
        //   },
        // },
        user: true,
      },
      where: {
        isJoinable: true,
      },
    });
    if (active && active?.userId !== req.user.id) {
      const existingGame = await client.chessGame.create({
        include: {
          // players: {
          //   include: {
          //     user: true,
          //   },
          // },
          user: true,
        },
        data: {
          lobbyId: active.lobbyId,
          color: "BLACK",
          userId: req.user.id,
          gameStatus: "IN_PROGRESS",
          fen: active.fen,
          pgn: active.pgn,
          result: "IN_PROGRESS",
          // players: {
          //   create: [
          //     {
          //       userId: active.userId,
          //       color: "WHITE",
          //     },
          //     {
          //       userId: req.user.id,
          //       color: "BLACK",
          //     },
          //   ],
          // },
          isJoinable: false,
        },
      });
      await client.chessGame.update({
        where: {
          id: active.id,
        },
        data: {
          // players: {
          //   create: {
          //     userId: req.user.id,
          //     color: "BLACK",
          //   },
          // },
          isJoinable: false,
        },
      });

      res.status(200).json(existingGame);
    }
    res.status(404).json({ message: "No existing game found" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/signup", async (req, res) => {
  const { email, username, password } = req.body;
  const passwordHash = bcrypt.hashSync(password, 10);
  const user = await client.user.findFirst({
    where: {
      email,
    },
  });
  if (user) {
    res.json({ error: "User already exists" });
    return;
  }
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
      res.json({ error: "User not found" });
      return;
    }
    if (!bcrypt.compareSync(password, user.password)) {
      res.json({ error: "Invalid password" });
      return;
    }
    const token = jwt.sign(
      {
        id: user.id,
      },
      JwtSecret!
    );
    res.json({ token });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port : ${PORT}`);
});
