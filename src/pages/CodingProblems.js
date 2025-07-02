import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaCheckCircle } from "react-icons/fa";

export default function CodingProblems() {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const { data: coding } = await supabase.from("coding_problems").select("*");
      setProblems(coding || []);

      if (user) {
        const { data: prog } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("question_type", "coding");
        setProgress(prog || []);
      }
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  // Helper: is this problem solved?
  const isSolved = (qid) =>
    progress.some((p) => p.question_id === qid && p.completed);

  // Unique categories and difficulties for filters
  const categories = ["All", ...Array.from(new Set(problems.map((p) => p.category)))];
  const difficulties = ["All", ...Array.from(new Set(problems.map((p) => p.difficulty)))];

  // Filtered problems
  const filteredProblems = problems.filter((problem) => {
    return (
      (categoryFilter === "All" || problem.category === categoryFilter) &&
      (difficultyFilter === "All" || problem.difficulty === difficultyFilter) &&
      problem.title.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1e2f] to-[#43146F] text-white px-6 py-10">
      <h1 className="text-4xl font-bold mb-8 text-center">Coding Challenges</h1>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-4 mb-10">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded bg-[#2f2f46] border border-white/10 text-white"
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3 py-2 rounded bg-[#2f2f46] border border-white/10 text-white"
        >
          {difficulties.map((diff) => (
            <option key={diff}>{diff}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search by title..."
          className="px-4 py-2 rounded bg-[#2f2f46] border border-white/10 text-white w-64"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-center mt-10 text-gray-300">Loading coding problems...</p>
      ) : filteredProblems.length === 0 ? (
        <p className="text-center text-gray-400">No coding problems found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProblems.map((problem) => {
            const solved = isSolved(problem.id);
            return (
              <Link
                to={`/coding/${problem.id}`}
                key={problem.id}
                className={`relative bg-[#2f2f46] border border-white/10 hover:scale-[1.02] transition p-5 rounded-lg shadow-md cursor-pointer ${
                  solved ? "border-lime-400" : ""
                }`}
              >
                <h2 className="text-xl font-bold text-lime-300 flex items-center gap-2">
                  {problem.title}
                  {solved && (
                    <FaCheckCircle className="text-lime-400 ml-2" title="Solved" />
                  )}
                </h2>
                <p className="text-white/80 mb-3 text-sm line-clamp-2">{problem.description}</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="bg-indigo-600 px-2 py-1 rounded">{problem.category}</span>
                  <span className={
                    problem.difficulty === "Easy"
                      ? "bg-green-500 px-2 py-1 rounded"
                      : problem.difficulty === "Medium"
                      ? "bg-yellow-500 px-2 py-1 rounded"
                      : "bg-red-500 px-2 py-1 rounded"
                  }>
                    {problem.difficulty}
                  </span>
                  <span className="bg-purple-700 px-2 py-1 rounded">{problem.points} points</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}