"use client";

import { useState } from "react";

type CreatedGroup = {
  id: string;
  name: string;
  groupCode: string;
  members: { id: string; name: string }[];
};

export default function TripActionCard() {
  // UI State
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");

  // Create Trip State
  const [name, setName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [group, setGroup] = useState<CreatedGroup | null>(null);

  // Join Trip State
  const [groupCode, setGroupCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");

  async function joinGroup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setJoinLoading(true);
    setJoinError("");

    try {
      const response = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupCode,
          name: joinName,
          password: joinPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to join group.");
      }

      window.location.href = `/trip/${data.groupCode}`;
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setJoinLoading(false);
    }
  }

  async function createGroup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, creatorName, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create trip.");
      }

      setGroup(data.group);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full">
      {/* Decorative background glow behind the card */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-400 opacity-20 blur-2xl"></div>
      
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-200">
        {group ? (
          // Success State
          <div className="p-8 sm:p-10">
            <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-bold text-emerald-600">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Your trip is live!</h2>
            <p className="mt-2 text-slate-600">Share these details with your travel buddies.</p>

            <div className="mt-8 space-y-5 rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-100">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Trip Name</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{group.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Group ID</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-3xl font-black tracking-widest text-emerald-600">
                    {group.groupCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(group.groupCode)}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 active:scale-95"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-amber-50 p-4 text-sm font-medium text-amber-800 ring-1 ring-amber-200/50">
              Keep your password private. Anyone with the ID and password can join.
            </div>

            <button
              onClick={() => setGroup(null)}
              className="mt-8 w-full rounded-xl bg-slate-900 px-4 py-3.5 text-base font-semibold text-white shadow-md transition-colors hover:bg-slate-800"
            >
              Dashboard &rarr;
            </button>
          </div>
        ) : (
          // Create / Join Tabs
          <div className="p-2">
            {/* Tab Controls */}
            <div className="m-6 mb-2 flex rounded-2xl bg-slate-100 p-1.5">
              <button
                onClick={() => setActiveTab("create")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  activeTab === "create"
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Create a Trip
              </button>
              <button
                onClick={() => setActiveTab("join")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  activeTab === "join"
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Join a Trip
              </button>
            </div>

            <div className="p-6 sm:px-8 sm:pb-8">
              {activeTab === "create" ? (
                <form key="create-form" onSubmit={createGroup} className="animate-in fade-in slide-in-from-bottom-2 space-y-5 duration-300">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Trip Name</label>
                    <input
                      required
                      maxLength={80}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Goa Trip 2026"
                      className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Your Name</label>
                    <input
                      required
                      maxLength={50}
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      placeholder="What should we call you?"
                      className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Group Password</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm"
                    />
                  </div>

                  {error && <p className="text-sm font-medium text-red-500">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:opacity-70 disabled:hover:bg-emerald-600"
                  >
                    {loading ? "Creating..." : "Create Trip"}
                  </button>
                </form>
              ) : (
                <form key="join-form" onSubmit={joinGroup} className="animate-in fade-in slide-in-from-bottom-2 space-y-5 duration-300">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Group ID</label>
                    <input
                      required
                      maxLength={10}
                      value={groupCode}
                      onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                      placeholder="e.g. AB12CD34"
                      className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-slate-900 sm:text-sm uppercase"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Your Name</label>
                    <input
                      required
                      maxLength={50}
                      value={joinName}
                      onChange={(e) => setJoinName(e.target.value)}
                      placeholder="What should we call you?"
                      className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-slate-900 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Group Password</label>
                    <input
                      type="password"
                      required
                      value={joinPassword}
                      onChange={(e) => setJoinPassword(e.target.value)}
                      placeholder="Enter group password"
                      className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-slate-900 sm:text-sm"
                    />
                  </div>

                  {joinError && <p className="text-sm font-medium text-red-500">{joinError}</p>}

                  <button
                    type="submit"
                    disabled={joinLoading}
                    className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3.5 text-base font-semibold text-white shadow-md shadow-slate-900/20 transition-all hover:bg-slate-800 disabled:opacity-70 disabled:hover:bg-slate-900"
                  >
                    {joinLoading ? "Joining..." : "Join Trip"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}