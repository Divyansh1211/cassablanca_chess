"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  return token !== null
    ? window.location.replace("/chessboard")
    : window.location.replace("/signup");
}
