import { useState } from "react";
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FcGoogle } from "react-icons/fc";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else alert("Check your email for a confirmation link!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e1e2f] to-[#43146F]">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <h2 className="text-3xl font-extrabold text-center text-lime-300 mb-2 drop-shadow">
          {isSignUp ? "Create Account" : "Sign In"}
        </h2>
        <p className="text-center text-white/80 mb-6">
          {isSignUp
            ? "Join CodeQuest and start your journey!"
            : "Welcome back to CodeQuest!"}
        </p>

        {error && (
          <div className="bg-red-500/80 text-white rounded p-2 mb-4 text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-2 rounded-lg shadow hover:bg-lime-200 transition mb-6"
        >
          <FcGoogle size={22} />
          <span>Sign in with Google</span>
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 h-px bg-white/30" />
          <span className="text-white/60 text-xs">or</span>
          <div className="flex-1 h-px bg-white/30" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="w-full p-2 rounded bg-[#2e2f40] text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-lime-300"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full p-2 rounded bg-[#2e2f40] text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-lime-300"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            className="w-full bg-lime-400 text-black font-bold py-2 rounded-lg hover:bg-lime-300 transition"
            type="submit"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-lime-300 hover:underline"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}