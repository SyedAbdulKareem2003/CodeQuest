import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";


export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "MCQ Problems", path: "/mcq" },
    { name: "Coding Problems", path: "/coding" },
    { name: "Profile", path: "/profile" },
    { name: "Leaderboard", path: "/leaderboard" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    setMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-[#1e1e2f] via-[#2c1e52] to-[#43146F] shadow-md sticky top-0 z-50 dark:from-[#f3f4f6] dark:to-[#c7d2fe]">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center py-4">
        {/* Logo */}
        <Link
          to="/"
          className="text-3xl font-extrabold text-lime-400 tracking-wide hover:scale-105 transition-all"
        >
          Code<span className="text-white dark:text-[#1e1e2f]">Quest</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-white dark:text-[#1e1e2f] text-md font-medium hover:text-lime-300 transition ${
                location.pathname === link.path
                  ? "text-lime-300 underline underline-offset-4"
                  : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        
          {user && (
            <button
              onClick={handleLogout}
              className="text-sm bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1.5 rounded transition"
            >
              Log Out
            </button>
          )}
        </div>

        {/* Hamburger Icon */}
        <button
          className="md:hidden text-white text-2xl focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#2c1e52] dark:bg-lime-200 px-4 pb-4">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`text-white dark:text-[#1e1e2f] text-lg font-medium py-2 rounded hover:bg-lime-400/20 transition ${
                  location.pathname === link.path
                    ? "text-lime-300 underline underline-offset-4"
                    : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          
            {user && (
              <button
                onClick={handleLogout}
                className="w-full text-left text-md bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-2 rounded transition mt-2"
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}