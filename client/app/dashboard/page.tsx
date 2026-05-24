"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";

type Document = {
  _id: string;
  docId: string;
  title: string;
  content: string;
  userId: string;
};

const NAV_ITEMS = [
  { label: "Dashboard", active: true },
  { label: "My Documents", active: false },
  { label: "Shared with me", active: false },
];

export default function Dashboard() {
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token!);

  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/sign-in");
    else setChecking(false);
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    async function getData() {
      const res = await fetch("http://localhost:5000/api/documents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      console.log(data);

      setDocuments(data?.documents ?? []);
    }
    getData();
  }, []);

  if (checking) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/sign-in");
  };

  const handleNewDocument = () => {
    router.push(`/editor/${uuidv4()}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleDelete = async (docId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/documents/${docId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setDocuments(documents.filter((doc) => doc.docId !== docId));
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (docId: string, currentTitle: string) => {
    setEditingId(docId);
    setEditingTitle(currentTitle);
  };

  const handleEditModal = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/documents/update/${editingId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
          body: JSON.stringify({ title: editingTitle }),
        },
      );

      let updateDoc = documents.map((doc) =>
        editingId === doc.docId ? { ...doc, title: editingTitle } : doc,
      );
      setDocuments(updateDoc);
      setEditingId(null);
    } catch {
      console.log("Not updated title");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950">
      {/* ── Sidebar ── */}
      <aside className="w-[220px] flex-shrink-0 flex flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
              D
            </div>
            <span className="text-sm font-semibold text-white">CollabDocs</span>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 py-3">
          <p className="px-4 py-2 text-[10px] text-white/30 uppercase tracking-widest">
            Workspace
          </p>

          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className={`mx-2 px-3 py-2 rounded-lg text-[13px] cursor-pointer transition ${
                item.active
                  ? "bg-purple-500/15 text-purple-300"
                  : "text-white/40 hover:bg-white/5 hover:text-white/80"
              }`}>
              {item.label}
            </div>
          ))}

          <p className="px-4 py-2 mt-3 text-[10px] text-white/30 uppercase tracking-widest">
            Account
          </p>

          <div className="mx-2 px-3 py-2 rounded-lg text-[13px] text-white/40 hover:bg-white/5 hover:text-white/80 cursor-pointer">
            Profile
          </div>

          <div
            onClick={handleLogout}
            className="mx-2 px-3 py-2 rounded-lg text-[13px] text-white/40 hover:bg-red-500/10 hover:text-red-400 cursor-pointer">
            Logout
          </div>
        </div>

        {/* User */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2 p-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-semibold text-white">
              {decoded.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-white/80">{decoded.name}</p>
              <p className="text-[10px] text-white/40">{decoded.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/30 backdrop-blur-xl">
          <input
            placeholder="Search documents..."
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none w-64"
          />

          <button
            onClick={handleNewDocument}
            className="px-4 py-2 text-sm text-white rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 transition shadow-lg shadow-purple-600/20">
            + New Document
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Greeting */}
          <h2 className="text-lg font-semibold text-white">
            {getGreeting()}, {decoded.name}
          </h2>
          <p className="text-sm text-white/40 mb-6">
            Manage your documents and collaborate in real-time
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xl text-white font-semibold">
                {documents.length}
              </p>
              <p className="text-xs text-white/40">Total documents</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xl text-white font-semibold">
                {documents.filter((doc) => doc.content.length > 0).length}
              </p>
              <p className="text-xs text-white/40">Documents with content</p>
            </div>
          </div>

          {/* Documents Header */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs text-white/40 uppercase">Recent Documents</p>
          </div>

          {/* Empty State */}
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/30">
              <p>No documents yet</p>
              <button
                onClick={handleNewDocument}
                className="mt-4 px-4 py-2 rounded-lg text-sm text-white bg-gradient-to-r from-purple-600 to-pink-500">
                Create Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => router.push(`/editor/${doc.docId}`)}
                  className="group relative bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition">
                  <p className="text-sm text-white font-medium truncate">
                    {doc.title}
                  </p>

                  <p className="text-xs text-white/40 mt-1 truncate">
                    {doc.content}
                  </p>

                  {/* Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(doc.docId, doc.title);
                      }}>
                      ✏️
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc.docId);
                      }}>
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {editingId && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60"
          onClick={() => setEditingId(null)}>
          <div
            className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white mb-4 text-sm">Rename Document</h3>

            <input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingId(null)}
                className="text-white/40">
                Cancel
              </button>

              <button
                onClick={handleEditModal}
                className="px-3 py-1 rounded-lg bg-purple-600 text-white">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
