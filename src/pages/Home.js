// src/pages/Home.js
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1e2f] to-[#43146F] text-white flex flex-col items-center">
      {/* Hero Section */}
      <section className="mt-20 text-center px-4">
        <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-4 tracking-wide">
          Level Up with <span className="text-lime-300 drop-shadow">CodeQuest</span>
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto tracking-wide">
          Practice MCQs, crack coding problems, track your progress, earn achievements, and conquer the leaderboard.
        </p>
      </section>

      {/* Grid Features Section */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl gap-8 px-6 w-full">
        {/* CARD 1 */}
        <FeatureCard
          title="MCQ Practice"
          description="Boost your fundamentals with hand-picked multiple choice questions across categories like JavaScript, Python, and more."
          to="/mcq"
          gradient="from-indigo-500 to-purple-500"
        />
        {/* CARD 2 */}
        <FeatureCard
          title="Coding Challenges"
          description="Sharpen your algorithm and logic skills with real-world code problems. Get test cases, hints, and feedback."
          to="/coding"
          gradient="from-purple-600 to-pink-500"
        />
        {/* CARD 3 */}
        <FeatureCard
          title="Track Your Progress"
          description="Monitor your growth, track attempts, scores, and earn badges as you code your way to the top."
          to="/profile"
          gradient="from-green-500 to-lime-400"
        />
      </section>
    </div>
  );
}

// Reusable Card Component
function FeatureCard({ title, description, to, gradient }) {
  return (
    <Link
      to={to}
      className={`bg-gradient-to-br ${gradient} rounded-xl shadow-xl p-6 transform hover:scale-[1.03] hover:shadow-2xl transition-all duration-300`}
    >
      <h2 className="text-2xl font-bold mb-2 text-white">{title}</h2>
      <p className="text-md text-white/90">{description}</p>
    </Link>
  );
}