"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    if (storedToken) {
      router.replace("/chessboard");
    } else {
      router.replace("/signup");
    }
  }, [router]);

  return <div>Loading...</div>;
}
