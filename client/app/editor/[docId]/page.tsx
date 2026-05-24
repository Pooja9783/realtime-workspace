"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  userId: string;
  name: string;
  email: string;
};

export default function EditorPage() {
  const { docId } = useParams();

  // ✅ decode safely (NO state, NO useEffect)
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const decoded: JwtPayload | null = useMemo(() => {
    if (!token) return null;
    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }, [token]);

  // ✅ single socket instance
  const socket = useMemo(() => {
    if (typeof window === "undefined") return null;

    return io("https://realtime-workspace-1.onrender.com", {
      auth: { token },
    });
  }, [token]);

  const [content, setContent] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // ✅ SOCKET SETUP (ONLY ONCE)
  useEffect(() => {
    if (!socket || !decoded || !docId) return;

    socket.emit("join_document", {
      docId,
      userId: decoded.userId,
    });

    const handleLoad = (doc: string) => {
      setContent(doc || "");
      setIsLoaded(true);
    };

    const handleChanges = (newContent: string) => {
      setContent(newContent || "");
    };

    socket.on("load_document", handleLoad);
    socket.on("receive_changes", handleChanges);

    return () => {
      socket.off("load_document", handleLoad);
      socket.off("receive_changes", handleChanges);
    };
  }, [socket, decoded, docId]);

  // ✅ AUTOSAVE (stable + debounced)
  useEffect(() => {
    if (!socket || !decoded || !docId || !isLoaded) return;

    const timeout = setTimeout(() => {
      socket.emit("save_document", {
        docId,
        userId: decoded.userId,
        content,
      });
    }, 800);

    return () => clearTimeout(timeout);
  }, [content, isLoaded, socket, decoded, docId]);

  // ✅ typing handler
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    setContent(value);

    socket?.emit("send_changes", {
      docId,
      content: value,
    });
  };

  if (!decoded) {
    return (
      <div className="text-white flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Top bar */}
      <div className="px-6 py-3 border-b border-white/10">
        Real-time Editor
      </div>

      {/* Editor */}
      <div className="flex-1 p-6">
        <textarea
          value={content}
          onChange={handleChange}
          placeholder="Start writing..."
          className="w-full h-[80vh] bg-white/5 p-4 rounded-lg outline-none"
        />
      </div>
    </div>
  );
}