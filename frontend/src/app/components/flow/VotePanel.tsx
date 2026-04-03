"use client";
import { useEffect, useState } from "react";
import { X, BarChart2 } from "lucide-react";

const VOTES_KEY = "syncspace-diagram-votes";

type VoteType = "approve" | "review" | "reject";

interface FlowVote {
  userId: string;
  name: string;
  vote: VoteType;
}

const VOTE_CONFIG: Record<VoteType, { color: string; bg: string; icon: string; label: string }> = {
  approve: { color: "#22c55e", bg: "#166534", icon: "✓", label: "Approve" },
  review:  { color: "#f59e0b", bg: "#78350f", icon: "◑", label: "Needs Review" },
  reject:  { color: "#ef4444", bg: "#7f1d1d", icon: "✗", label: "Reject" },
};

const ALL_COLLABORATORS = [
  { userId: "collab-1", name: "John Berkley", color: "#3b82f6", isOnline: true },
  { userId: "collab-2", name: "Alice Smith",  color: "#22c55e", isOnline: true },
  { userId: "collab-3", name: "Bob Wilson",   color: "#a855f7", isOnline: false },
  { userId: "current-user", name: "You",      color: "#f97316", isOnline: true },
];

const SEED_VOTES: FlowVote[] = [
  { userId: "collab-1", name: "John Berkley", vote: "approve" },
  { userId: "collab-2", name: "Alice Smith",  vote: "review" },
];

function loadVotes(): FlowVote[] {
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return SEED_VOTES;
}

function saveVotes(votes: FlowVote[]) {
  try {
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
  } catch {}
}

interface VotePanelProps {
  onClose: () => void;
}

export function VotePanel({ onClose }: VotePanelProps) {
  const [votes, setVotes] = useState<FlowVote[]>([]);

  useEffect(() => {
    setVotes(loadVotes());
  }, []);

  const castVote = (type: VoteType) => {
    setVotes((prev) => {
      const existing = prev.findIndex((v) => v.userId === "current-user");
      let next: FlowVote[];
      if (existing >= 0) {
        if (prev[existing].vote === type) {
          // clicking own active vote removes it
          next = prev.filter((v) => v.userId !== "current-user");
        } else {
          next = prev.map((v) =>
            v.userId === "current-user" ? { ...v, vote: type } : v
          );
        }
      } else {
        next = [...prev, { userId: "current-user", name: "You", vote: type }];
      }
      saveVotes(next);
      return next;
    });
  };

  const myVote = votes.find((v) => v.userId === "current-user")?.vote ?? null;

  const counts: Record<VoteType, number> = { approve: 0, review: 0, reject: 0 };
  votes.forEach((v) => { counts[v.vote]++; });
  const total = votes.length;

  return (
    <div
      style={{
        width: 288,
        background: "#111827",
        border: "1px solid #374151",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        overflow: "hidden",
        fontFamily: "inherit",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px 10px",
          borderBottom: "1px solid #1f2937",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#f3f4f6", fontWeight: 600, fontSize: 13 }}>
          <BarChart2 size={15} color="#60a5fa" />
          Flow Vote
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 2 }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Cast vote */}
      <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid #1f2937" }}>
        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Cast your vote
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(["approve", "review", "reject"] as VoteType[]).map((type) => {
            const cfg = VOTE_CONFIG[type];
            const active = myVote === type;
            return (
              <button
                key={type}
                onClick={() => castVote(type)}
                style={{
                  flex: 1,
                  background: active ? cfg.bg : "#1f2937",
                  border: `1px solid ${active ? cfg.color : "#374151"}`,
                  borderRadius: 8,
                  padding: "6px 4px",
                  color: active ? cfg.color : "#9ca3af",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 14 }}>{cfg.icon}</span>
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid #1f2937" }}>
        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Results {total > 0 && <span style={{ color: "#6b7280" }}>({total} vote{total !== 1 ? "s" : ""})</span>}
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
          {(["approve", "review", "reject"] as VoteType[]).map((type) => {
            const cfg = VOTE_CONFIG[type];
            return (
              <div key={type} style={{ display: "flex", alignItems: "center", gap: 4, color: cfg.color, fontSize: 12, fontWeight: 600 }}>
                <span>{cfg.icon}</span>
                <span>{counts[type]}</span>
              </div>
            );
          })}
        </div>
        {/* Progress bars */}
        {(["approve", "review", "reject"] as VoteType[]).map((type) => {
          const cfg = VOTE_CONFIG[type];
          const pct = total > 0 ? Math.round((counts[type] / total) * 100) : 0;
          return (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <div style={{ width: 36, fontSize: 10, color: "#6b7280", textAlign: "right" }}>{pct}%</div>
              <div style={{ flex: 1, height: 4, background: "#1f2937", borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: cfg.color,
                    borderRadius: 4,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Who voted */}
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Who voted
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ALL_COLLABORATORS.map((collab) => {
            const userVote = votes.find((v) => v.userId === collab.userId);
            const vCfg = userVote ? VOTE_CONFIG[userVote.vote] : null;
            return (
              <div key={collab.userId} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: collab.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {collab.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: collab.isOnline ? "#22c55e" : "#4b5563",
                      border: "1.5px solid #111827",
                    }}
                  />
                </div>
                {/* Name */}
                <span style={{ flex: 1, fontSize: 12, color: "#d1d5db", fontWeight: collab.userId === "current-user" ? 600 : 400 }}>
                  {collab.name}
                </span>
                {/* Vote badge */}
                {vCfg ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      background: vCfg.bg,
                      border: `1px solid ${vCfg.color}`,
                      borderRadius: 8,
                      padding: "2px 7px",
                      fontSize: 10,
                      fontWeight: 600,
                      color: vCfg.color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>{vCfg.icon}</span>
                    <span>{vCfg.label}</span>
                  </div>
                ) : (
                  <span style={{ fontSize: 10, color: "#4b5563", fontStyle: "italic" }}>no vote</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
