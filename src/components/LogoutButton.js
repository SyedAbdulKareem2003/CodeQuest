// src/components/LogoutButton.js
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
   // inside return (LogoutButton.js)
<button
  onClick={handleLogout}
  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm lg:text-base transition"
>
  Log Out
</button>
  );
}