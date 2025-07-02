import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import { FaCrown, FaUserCircle } from "react-icons/fa";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);

      // Fetch all completed user_progress
      const { data: progress } = await supabase
        .from("user_progress")
        .select("user_id, score, completed")
        .eq("completed", true);

      // Fetch all profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url");

      // Aggregate points and solved count
      const userStats = {};
      progress.forEach((p) => {
        if (!userStats[p.user_id]) userStats[p.user_id] = { points: 0, solved: 0 };
        userStats[p.user_id].points += p.score;
        userStats[p.user_id].solved += 1;
      });

      // Merge with profiles
      const leaderboard = Object.entries(userStats)
        .map(([user_id, stats]) => {
          const profile = profiles.find((p) => p.id === user_id) || {};
          return {
            user_id,
            full_name: profile.full_name || "Anonymous",
            avatar_url: profile.avatar_url || "",
            points: stats.points,
            solved: stats.solved,
          };
        })
        .sort((a, b) => b.points - a.points);

      setUsers(leaderboard);
      setLoading(false);
    };

    fetchLeaderboard();

    // Optional: Poll every 10 seconds for live updates
   // const interval = setInterval(fetchLeaderboard, 10000);
    //return () => clearInterval(interval);
  }, []);

  const crownColors = ["text-yellow-400", "text-gray-400", "text-orange-500"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1e2f] to-[#43146F] text-white px-4 py-10">
      <button
  onClick={() => window.location.reload()}
  className="mb-4 px-4 py-2 bg-lime-400 text-black rounded hover:bg-lime-300"
>
  🔄 Refresh Leaderboard
</button>
      <h1 className="text-4xl font-bold mb-8 text-center">🏆 Leaderboard</h1>
      {loading ? (
        <p className="text-center text-gray-400">Loading leaderboard...</p>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-400">No users yet. Solve a problem to appear here!</p>
      ) : (
        <div className="max-w-5xl mx-auto">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <table className="w-full bg-[#2e2f40]">
              <thead>
                <tr className="bg-[#31255a] text-lime-300">
                  <th className="py-3 px-2 text-left">Rank</th>
                  <th className="py-3 px-2 text-left">User</th>
                  <th className="py-3 px-2 text-center">Points</th>
                  <th className="py-3 px-2 text-center">Solved</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr
                    key={u.user_id}
                    className={`border-b border-[#3a2e5a] ${idx < 3 ? "bg-[#23213a]/80" : ""}`}
                  >
                    <td className="py-3 px-2 font-bold text-center">
                      {idx < 3 ? (
                        <FaCrown className={`inline ${crownColors[idx]} mr-1`} />
                      ) : (
                        <span className="text-gray-400">{idx + 1}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 flex items-center gap-3">
                      {u.avatar_url ? (
                        <img
                          src={u.avatar_url}
                          alt="avatar"
                          className="w-8 h-8 rounded-full border-2 border-lime-400"
                        />
                      ) : (
                        <FaUserCircle className="w-8 h-8 text-gray-400" />
                      )}
                      <span>{u.full_name}</span>
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-lime-300">{u.points}</td>
                    <td className="py-3 px-2 text-center">{u.solved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}