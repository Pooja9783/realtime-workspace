"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

export default function EditorPage() {
  const { docId } = useParams();
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token!);

  const [content, setContent] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [socket] = useState(() =>
    io("http://localhost:5000", {
      auth: { token: localStorage.getItem("token") },
    }),
  );

  useEffect(() => {
    socket.emit("join_document", { docId, userId: decoded.userId });

    socket.on("load_document", (doc) => {
      setContent(doc);
      setIsLoaded(true);
    });

    console.log(docId);

    socket.on("receive_changes", (newContent) => {
      setContent(newContent);
    });

    return () => {
      socket.off("load_document");
      socket.off("receive_change");
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const timeout = setTimeout(() => {
      socket.emit("save_document", {
        userId: decoded.userId,
        docId,
        content,
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    setContent(value);

    socket.emit("send_changes", {
      docId,
      content: value,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-gray-950 text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <h1 className="text-sm font-medium text-white/80">Real-time Editor</h1>

        <span className="text-xs text-white/40">Auto-saving...</span>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex justify-center px-4 py-6">
        <div className="w-full max-w-3xl">
          {/* Title */}
          <input
            placeholder="Untitled Document"
            className="w-full text-2xl font-semibold bg-transparent outline-none mb-4 placeholder:text-white/20"
          />

          {/* Textarea */}
          <textarea
            value={content}
            onChange={handleChange}
            placeholder="Start writing your thoughts..."
            className="w-full min-h-[400px] bg-transparent outline-none text-white/80 placeholder:text-white/20 resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
