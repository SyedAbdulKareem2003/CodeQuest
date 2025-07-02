import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import supabase from "../supabaseClient";
import { FaEdit } from "react-icons/fa";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [progressStats, setProgressStats] = useState({
    total: 0,
    solved: 0,
    score: 0,
    mcqSolved: 0,
    codingSolved: 0
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      // Load achievements
      const { data: ach } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", user.id);
      setAchievements(ach || []);

      // Load progress
      const { data: progress } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id);

      const solved = progress.filter(p => p.completed).length;
      const mcqSolved = progress.filter(p => p.completed && p.question_type === "mcq").length;
      const codingSolved = progress.filter(p => p.completed && p.question_type === "coding").length;
      const totalScore = progress.reduce((sum, p) => sum + p.score, 0);

      setProgressStats({
        total: progress.length,
        solved,
        score: totalScore,
        mcqSolved,
        codingSolved
      });

      // Optional: load profile (if you store full name, avatar, etc.)
      const { data: profileInfo } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileInfo || {});
    };

    loadProfile();
  }, [user]);

  const allAchievements = [
    { key: "first_solve", label: "First Solve", description: "Solve your first problem!", emoji: "🥇" },
    { key: "ten_mcq", label: "MCQ Master", description: "Solve 10 MCQs", emoji: "🧠" },
    { key: "ten_coding", label: "Code Warrior", description: "Solve 10 coding problems", emoji: "💻" },
    { key: "perfect", label: "Perfect Score", description: "Get 100% on a hard problem", emoji: "🏆" },
    { key: "persistent", label: "Persistent", description: "Solve after 3+ attempts", emoji: "🔥" },
    { key: "point_collector", label: "Point Collector", description: "Earn 1000+ points", emoji: "💰" }
  ];

  const hasAchieved = (key) =>
    achievements.find((a) => a.type === key);

  return (
  <div className="min-h-screen bg-gradient-to-br from-[#1e1e2f] to-[#43146F] text-white p-6">
      <h1 className="text-3xl font-bold mb-4">👤 Profile</h1>

      {/* User Info */}
      <div className="bg-[#2e2f40] p-5 rounded-lg shadow-md mb-8">
        <p><strong>Email:</strong> {user?.email}</p>
        <div className="flex items-center gap-3">

      <div className="flex items-center gap-2">
  <p><strong>Full Name:</strong> {profile?.full_name || "Not set"}</p>
  <button
    title="Edit Name"
    className="p-1 rounded-full bg-lime-400 hover:bg-lime-500 transition text-black flex items-center"
    onClick={async () => {
      const newName = prompt("Enter your full name:");
      if (newName && newName.length >= 2) {
        await supabase.from("profiles").upsert({
          id: user.id,
          full_name: newName,
        });
        setProfile({ ...profile, full_name: newName });
      }
    }}
  >
    <FaEdit size={18} />
  </button>
</div>
</div>
        <p><strong>Total Points:</strong> {progressStats.score}</p>
        <p><strong>Problems Solved:</strong> {progressStats.solved}/{progressStats.total}</p>
        <p><strong>MCQs:</strong> {progressStats.mcqSolved} | <strong>Coding:</strong> {progressStats.codingSolved}</p>
      </div>

      {/* Achievements */}
      <h2 className="text-2xl font-semibold mb-4">🏅 Achievements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allAchievements.map((ach) => (
          <div
            key={ach.key}
            className={`rounded p-4 border shadow-md transition ${
              hasAchieved(ach.key)
                ? "border-lime-300 bg-green-900/40 text-white"
                : "border-gray-600 bg-gray-700 text-gray-300"
            }`}
          >
            <h3 className="text-xl font-bold mb-2">
              {ach.emoji} {ach.label}
            </h3>
            <p>{ach.description}</p>
            {!hasAchieved(ach.key) && (
              <p className="text-sm mt-2 text-yellow-300">Locked 🔒</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}