import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaCheckCircle } from "react-icons/fa";

export default function MCQProblems() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const { data: mcqs } = await supabase.from("mcq_questions").select("*");
      setQuestions(mcqs || []);

      if (user) {
        const { data: prog } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("question_type", "mcq");
        setProgress(prog || []);
      }
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  // Helper: is this question solved?
  const isSolved = (qid) =>
    progress.some((p) => p.question_id === qid && p.completed);

  // Unique categories and difficulties for filters
  const categories = ["All", ...Array.from(new Set(questions.map((q) => q.category)))];
  const difficulties = ["All", ...Array.from(new Set(questions.map((q) => q.difficulty)))];

  // Filtered questions
  const filteredQuestions = questions.filter((q) => {
    return (
      (categoryFilter === "All" || q.category === categoryFilter) &&
      (difficultyFilter === "All" || q.difficulty === difficultyFilter) &&
      q.title.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1e2f] to-[#43146F] text-white px-6 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">MCQ Problems</h1>

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
        <p className="text-center text-gray-400">Loading questions...</p>
      ) : filteredQuestions.length === 0 ? (
        <p className="text-center text-gray-400">No MCQ questions found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestions.map((q) => {
            const solved = isSolved(q.id);
            return (
              <Link
                to={`/mcq/${q.id}`}
                key={q.id}
                className={`relative bg-[#2e2e42] p-5 rounded-xl transition-all duration-300 shadow-lg border border-white/5 hover:scale-[1.02] ${
                  solved ? "border-lime-400" : ""
                }`}
              >
                <h2 className="text-lg font-bold text-lime-300 flex items-center gap-2">
                  {q.title}
                  {solved && (
                    <FaCheckCircle className="text-lime-400 ml-2" title="Solved" />
                  )}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2 text-sm font-medium">
                  <span className="bg-purple-600 px-2 py-1 rounded">{q.category}</span>
                  <span
                    className={`${
                      q.difficulty === "Easy"
                        ? "bg-green-500"
                        : q.difficulty === "Medium"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    } px-2 py-1 rounded`}
                  >
                    {q.difficulty}
                  </span>
                  <span className="bg-indigo-600 px-2 py-1 rounded">{q.points} points</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}