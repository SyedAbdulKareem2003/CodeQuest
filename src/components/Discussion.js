import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function Discussion({ problemId, problemType }) {
  const { user } = useAuth();
  const [discussionId, setDiscussionId] = useState(null);
  const [comments, setComments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [showReplies, setShowReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Ensure a discussion exists for this problem
  useEffect(() => {
  const fetchOrCreateDiscussion = async () => {
    setLoading(true);
    setErrorMsg("");
    if (!problemId || !problemType) {
      setErrorMsg("No problem selected.");
      setLoading(false);
      return;
    }
    try {
      // 1. Try to fetch existing discussion
      const { data: existing, error: fetchError } = await supabase
        .from("discussions")
        .select("*")
        .eq("problem_id", problemId)
        .eq("problem_type", problemType)
        .maybeSingle();

      if (fetchError) {
        setErrorMsg("Error fetching discussion: " + fetchError.message);
        setLoading(false);
        return;
      }

      if (existing && existing.id) {
        setDiscussionId(existing.id);
        setLoading(false);
        return;
      }

      // 2. Try to create discussion if not found
      if (user) {
        const { data: created, error: createError } = await supabase
          .from("discussions")
          .insert([
            {
              problem_id: problemId,
              problem_type: problemType,
              title: "Discussion",
              created_by: user.id,
            },
          ])
          .select();

        if (createError) {
          // If duplicate error, fetch again (someone else just created it)
          if (
            createError.message &&
            createError.message.includes("duplicate key value violates unique constraint")
          ) {
            const { data: existingAfter, error: fetchAgainError } = await supabase
              .from("discussions")
              .select("*")
              .eq("problem_id", problemId)
              .eq("problem_type", problemType)
              .maybeSingle();
            if (existingAfter && existingAfter.id) {
              setDiscussionId(existingAfter.id);
              setLoading(false);
              return;
            }
            setErrorMsg("Error: Could not fetch or create discussion after duplicate.");
            setLoading(false);
            return;
          }
          setErrorMsg("Error creating discussion: " + createError.message);
          setLoading(false);
          return;
        }
        setDiscussionId(created[0].id);
      }
      setLoading(false);
    } catch (err) {
      setErrorMsg("Unexpected error: " + err.message);
      setLoading(false);
    }
  };
  fetchOrCreateDiscussion();
}, [problemId, problemType, user]);

  // 2. Fetch all comments and profiles for this discussion
  useEffect(() => {
    const fetchCommentsAndProfiles = async () => {
      if (!discussionId) return;
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("discussion_id", discussionId)
        .order("created_at", { ascending: true });

      if (commentsError) {
        setErrorMsg("Error fetching comments: " + commentsError.message);
        setComments([]);
      } else {
        setComments(commentsData || []);
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url");
      if (profilesError) {
        setErrorMsg("Error fetching profiles: " + profilesError.message);
        setProfiles([]);
      } else {
        setProfiles(profilesData || []);
      }
    };
    fetchCommentsAndProfiles();
    const interval = setInterval(fetchCommentsAndProfiles, 10000);
    return () => clearInterval(interval);
  }, [discussionId]);

  // 3. Post a new comment or reply
  const handlePost = async () => {
    if (!newComment.trim() || !user || !discussionId) return;
    const { error } = await supabase.from("comments").insert([
      {
        discussion_id: discussionId,
        content: newComment,
        created_by: user.id,
        created_at: new Date().toISOString(),
        parent_comment_id: replyTo || null,
      },
    ]);
    if (error) {
      setErrorMsg("Failed to post comment: " + error.message);
      return;
    }
    setNewComment("");
    setReplyTo(null);
    const { data: commentsData } = await supabase
      .from("comments")
      .select("*")
      .eq("discussion_id", discussionId)
      .order("created_at", { ascending: true });
    setComments(commentsData || []);
  };

  // Helper to get user name from profiles
  const getUserName = (uid) => {
    if (!uid) return "User";
    if (profiles.length === 0) return "User";
    const profile = profiles.find((p) => p.id === uid);
    if (!profile) return "User";
    return profile.full_name || "User";
  };

  // Render comments with replies (threaded)
  const renderComments = (parentId = null, level = 0) =>
    comments
      .filter((c) => c.parent_comment_id === parentId)
      .map((c) => (
        <div key={c.id} className={`mb-3 ml-${level * 6} w-full`}>
          <div className="bg-[#23213a] rounded-xl p-4 flex flex-col shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lime-300">{getUserName(c.created_by)}</span>
              <span className="text-xs text-gray-400 ml-2">{new Date(c.created_at).toLocaleString()}</span>
            </div>
            <span className="mb-2">{c.content}</span>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setShowReplies((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                className="text-xs text-lime-400 hover:underline"
              >
                {showReplies[c.id] ? "Hide Replies" : "View Replies"}
              </button>
              {user && (
                <button
                  onClick={() => setReplyTo(c.id)}
                  className="text-xs text-lime-400 hover:underline"
                >
                  Reply
                </button>
              )}
            </div>
            {replyTo === c.id && (
              <div className="mt-2 w-full">
                <textarea
                  className="w-full p-2 rounded bg-[#2e2f40] text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-lime-300"
                  rows={2}
                  placeholder="Write a reply..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handlePost}
                    className="bg-lime-400 text-black font-bold py-1 px-4 rounded hover:bg-lime-300 transition"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => { setReplyTo(null); setNewComment(""); }}
                    className="bg-gray-400 text-black font-bold py-1 px-4 rounded hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {showReplies[c.id] && (
              <div className="mt-2 pl-4 border-l-2 border-lime-400">
                {renderComments(c.id, level + 1)}
              </div>
            )}
          </div>
        </div>
      ));

  if (loading) return <div className="text-white text-center mt-10">Loading discussion...</div>;
  if (errorMsg) return <div className="text-red-400 text-center mt-10">{errorMsg}</div>;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-lime-300">Discussion</h2>
      {/* New top-level comment form */}
      <div className="mb-4">
        <textarea
          className="w-full p-2 rounded bg-[#2e2f40] text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-lime-300"
          rows={3}
          placeholder="Start a discussion or ask a question..."
          value={replyTo ? "" : newComment}
          onChange={e => { if (!replyTo) setNewComment(e.target.value); }}
          disabled={!!replyTo}
        />
        {!replyTo && (
          <button
            onClick={handlePost}
            className="mt-2 bg-lime-400 text-black font-bold py-2 px-6 rounded hover:bg-lime-300 transition"
          >
            Post
          </button>
        )}
      </div>
      <div className="space-y-3">{renderComments()}</div>
    </div>
  );
}