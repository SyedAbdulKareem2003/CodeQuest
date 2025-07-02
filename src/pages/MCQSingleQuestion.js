import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { checkAndUnlockAchievements } from "../utils/achievementUtils";

export default function MCQSingleQuestion() {
  const { id } = useParams();
  const { user } = useAuth();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    const fetchQuestion = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("mcq_questions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("MCQ fetch error:", error.message);
        setQuestion(null);
      } else {
        setQuestion(data);
      }
      setLoading(false);
    };

    fetchQuestion();
  }, [id]);

  const handleSubmit = async () => {
  if (!selected) return;
  const correct = selected === question.correct_answer;
  setIsCorrect(correct);
  setSubmitted(true);

  if (user) {
    const { data: existing } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("question_type", "mcq")
      .eq("question_id", +id);

    if (existing?.length > 0) {
      await supabase.from("user_progress").update({
        completed: correct, // Only mark as completed if correct
        solution: selected,
        score: correct ? question.points : 0,
        attempts: (existing[0].attempts || 0) + 1,
        last_attempted_at: new Date().toISOString()
      }).eq("id", existing[0].id);
    } else {
      await supabase.from("user_progress").insert({
        user_id: user.id,
        question_type: "mcq",
        question_id: +id,
        completed: correct,
        solution: selected,
        score: correct ? question.points : 0,
        attempts: 1,
        last_attempted_at: new Date().toISOString()
      });
    }

    // ✅ Paste this right here, after progress update:
    if (correct) {
      await checkAndUnlockAchievements(user.id);
    }
  }
};

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;
  if (!question) return <div className="text-white text-center mt-10">Question not found.</div>;

  // Ensure options is an array
  let options = question.options;
  if (typeof options === "string") {
    try {
      options = JSON.parse(options);
    } catch {
      options = [];
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1e2f] to-[#43146F] text-white px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{question.title}</h1>
      <p className="mb-6 text-white/80">{question.description}</p>

      {Array.isArray(options) && options.length > 0 ? (
        <div className="flex flex-col gap-4 mb-8">
          {options.map((opt, i) => (
            <label
              key={i}
              className={`p-4 rounded-lg border transition cursor-pointer flex items-center gap-2
                ${submitted && opt === question.correct_answer ? "bg-green-600 border-green-300" : ""}
                ${submitted && selected === opt && opt !== question.correct_answer ? "bg-red-600 border-red-400" : ""}
                ${!submitted && selected === opt ? "bg-blue-500/50 border-blue-300" : "bg-[#2e2f40] border-white/10"}`}
            >
              <input
                type="radio"
                value={opt}
                name="answer"
                className="form-radio mr-3"
                onChange={() => setSelected(opt)}
                checked={selected === opt}
                disabled={submitted}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="text-red-400">No options found for this question.</div>
      )}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="bg-lime-400 text-black font-bold py-2 px-6 rounded hover:bg-lime-300 transition"
        >
          Submit Answer
        </button>
      ) : (
        <div className="mt-6">
          <p className={`text-xl font-bold ${isCorrect ? "text-green-400" : "text-red-400"}`}>
            {isCorrect ? "🎉 Correct!" : "❌ Incorrect."}
          </p>
          {question.explanation && (
            <p className="mt-2 text-white/80">
              💡 <strong>Explanation:</strong> {question.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}