import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import supabase from "../supabaseClient";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { checkAndUnlockAchievements } from "../utils/achievementUtils";

export default function CodingSolve() {
  const { id } = useParams();
  const { user } = useAuth();

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [testResults, setTestResults] = useState([]);
  const [runStatus, setRunStatus] = useState("");
  const [userProgressId, setUserProgressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const getStarterTemplate = (lang) => {
    switch (lang) {
      case "python":
        return "def solution(input):\n    # Your code here\n    pass";
      case "java":
        return "public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}";
      default:
        return "function solution(input) {\n  // Your code here\n}";
    }
  };

  // Fetch problem + user progress
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return;

      try {
        const { data: codingProblem } = await supabase
          .from("coding_problems")
          .select("*")
          .eq("id", id)
          .single();

        if (!codingProblem) return;

        setProblem(codingProblem);

        // Load user progress
        const { data: progress, error: progressError } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("question_id", Number(id))
          .eq("question_type", "coding")
          .single();

        if (!progress || progressError) {
          // New record
          const { data: newProgress } = await supabase
            .from("user_progress")
            .insert([
              {
                user_id: user.id,
                question_id: Number(id),
                question_type: "coding",
                completed: false,
                score: 0,
                attempts: 0,
                language: "javascript",
                solution:
                  typeof codingProblem.starter_code === "string"
                    ? codingProblem.starter_code
                    : getStarterTemplate("javascript"),
                last_attempted_at: new Date().toISOString(),
              },
            ])
            .select();

          if (newProgress && newProgress.length > 0) {
            setUserProgressId(newProgress[0].id);
            setLanguage("javascript");
            setCode(
              typeof codingProblem.starter_code === "string"
                ? codingProblem.starter_code
                : getStarterTemplate("javascript")
            );
          }
        } else {
          setUserProgressId(progress.id);
          setLanguage(progress.language || "javascript");
          setCode(
            typeof progress.solution === "string"
              ? progress.solution
              : getStarterTemplate(progress.language || "javascript")
          );
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchData();
  }, [id, user]);

  // beforeunload warning (refresh / close tab)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // visibilitychange ('switch tab')
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && hasUnsavedChanges) {
        console.log("⚠️ You have unsaved code!");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [hasUnsavedChanges]);

  const getLanguageId = (lang) => {
    switch (lang) {
      case "python":
        return 71;
      case "java":
        return 62;
      case "javascript":
      default:
        return 93;
    }
  };

  const handleLanguageChange = (newLang) => {
    const template = getStarterTemplate(newLang);

    if (!code || code === getStarterTemplate(language)) {
      setLanguage(newLang);
      setCode(template);
    } else {
      const confirmSwitch = window.confirm("Switching language will replace your current code. Continue?");
      if (confirmSwitch) {
        setLanguage(newLang);
        setCode(template);
      }
    }
  };

 const wrapCodeWithRuntime = (code, language) => {
  if (language === "python") {
    return `
${code}

import sys, json
input_data = json.loads(sys.stdin.read())
print(solution(input_data))
`;
  }

  if (language === "javascript") {
    return `
${code}

const fs = require('fs');
const input = JSON.parse(fs.readFileSync(0, 'utf-8'));
console.log(solution(input));
`;
  }

  return code; // fallback for other languages
};



const handleRun = async () => {
  if (
    !problem ||
    typeof problem !== "object" ||
    !problem.id ||
    !Array.isArray(problem.test_cases) ||
    !Array.isArray(problem.expected_outputs) ||
    !user ||
    !userProgressId
  ) {
    alert("⏳ Please wait while everything loads.");
    return;
  }

  setRunStatus("Running test cases...");
  const languageId = getLanguageId(language);
  const results = [];

  for (let i = 0; i < problem.test_cases.length; i++) {
    const input = JSON.stringify(problem.test_cases[i]);
    const wrappedCode = wrapCodeWithRuntime(code, language);

    try {
      const tokenRes = await fetch("https://judge0-ce.p.rapidapi.com/submissions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Key": process.env.REACT_APP_JUDGE0_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        body: JSON.stringify({
          source_code: wrappedCode,
          language_id: languageId,
          stdin: input,
        }),
      });

      if (!tokenRes.ok) {
        const errBody = await tokenRes.text();
        console.error("❌ Judge0 submission error:", errBody);
        alert("Code submission failed. Try again.");
        return;
      }

      const tokenData = await tokenRes.json();
      const resultUrl = `https://judge0-ce.p.rapidapi.com/submissions/${tokenData.token}?base64_encoded=false`;

      let complete = false;
      let output = "";
      let error = "";

      while (!complete) {
        const subRes = await fetch(resultUrl, {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": process.env.REACT_APP_JUDGE0_KEY,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
        });

        const subData = await subRes.json();
        console.log("🔁 Judge0 result:", subData);

        if (subData.status.id <= 2) {
          await new Promise((res) => setTimeout(res, 1200));
        } else {
          output = (subData.stdout || "").trim().replace(/\r?\n/g, "");
          error = (subData.stderr || subData.compile_output || "").trim();

          complete = true;

          results.push({
            input: problem.test_cases[i],
            expected: problem.expected_outputs[i],
            actual: output,
            passed: output === problem.expected_outputs[i],
            error: error || null,
          });
        }
      }
    } catch (err) {
      console.error("❌ Fatal error contacting Judge0:", err);
      alert("Network error or daily limit reached. Try later.");
      return;
    }
  }

  // Final result display
  setTestResults(results);
  const allPassed = results.every((r) => r.passed);
  setRunStatus(allPassed ? "✅ All tests passed!" : "❌ Some tests failed.");

  // Save progress to Supabase
  await supabase
    .from("user_progress")
    .update({
      completed: allPassed,
      score: allPassed ? problem.points : 0,
      attempts: results.length,
      solution: code,
      language,
      last_attempted_at: new Date().toISOString(),
    })
    .eq("id", userProgressId);

  // ✅ Unlock any achievements dynamically
  if (allPassed) {
    await checkAndUnlockAchievements(user.id);
  }
};
  const handleSave = async () => {
    await supabase
      .from("user_progress")
      .update({
        solution: code,
        language,
        last_attempted_at: new Date().toISOString(),
      })
      .eq("id", userProgressId);

    alert("💾 Code saved!");
    setHasUnsavedChanges(false);
  };

  const getLanguageExtension = () => {
    switch (language) {
      case "python":
        return python();
      case "java":
        return java();
      case "javascript":
      default:
        return javascript();
    }
  };

  if (loading || !user || !problem || !userProgressId) {
    return (
      <div className="text-white flex justify-center items-center h-screen text-xl font-semibold">
        ⏳ Loading problem and editor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1e2f] text-white p-6">
      <h1 className="text-3xl font-bold mb-3">{problem.title}</h1>
      <p className="mb-6 text-white/70">{problem.description}</p>

      {/* Language Selector */}
      <div className="mb-4 flex items-center gap-4">
        <label htmlFor="lang" className="text-lg font-semibold">
          Language:
        </label>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="bg-[#2c2f41] border border-white/20 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-300"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
      </div>

      {/* Examples Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-lime-300">📘 Examples</h3>
        {problem.test_cases.slice(0, 3).map((test, i) => (
          <div
            key={i}
            className="bg-[#2e2f40] p-3 rounded mb-3 text-sm font-mono tracking-wide"
          >
            <p>
              <span className="text-blue-400">Input:</span> {JSON.stringify(test)}
            </p>
            <p>
              <span className="text-pink-400">Expected Output:</span>{" "}
              {problem.expected_outputs[i]}
            </p>
          </div>
        ))}
      </div>

      {/* Code Editor */}
      <CodeMirror
        value={typeof code === "string" ? code : ""}
        height="300px"
        extensions={[getLanguageExtension()]}
        theme="dark"
        onChange={(value) => {
          setCode(value);
          setHasUnsavedChanges(true);
        }}
      />

      {/* Buttons */}
      <div className="flex justify-between mt-6 gap-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
        >
          💾 Save Code
        </button>
        <button
          onClick={handleRun}
          disabled={loading || !problem || !userProgressId}
          className={`px-6 py-2 rounded font-semibold transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 text-black hover:bg-green-400"
          }`}
        >
          ▶️ Run Code
        </button>
      </div>

      {/* Unsaved Visual Warning */}
      {hasUnsavedChanges && (
        <div className="mt-5 p-3 bg-yellow-600 text-white rounded text-center text-sm">
          ⚠️ You have unsaved code! Please save before switching tabs or navigating.
        </div>
      )}

      {/* Run Results */}
      {runStatus && (
        <div className="mt-8 text-lg font-bold text-lime-400">{runStatus}</div>
      )}

      {testResults.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-3">Test Results:</h3>
          {testResults.map((res, idx) => (
            <div
              key={idx}
              className={`mb-4 p-4 rounded border ${
                res.passed
                  ? "bg-green-900 border-green-500"
                  : "bg-red-900 border-red-500"
              }`}
            >
              <p>
                <strong>Input:</strong> {JSON.stringify(res.input)}
              </p>
              <p>
                <strong>Expected:</strong> {res.expected}
              </p>
              <p>
                <strong>Actual:</strong> {res.actual}
              </p>
              {res.error && (
                <p className="mt-2 text-sm text-yellow-300">
                    <strong>Error:</strong> {res.error}
                </p>
                )}
              <p>
                <strong>Status:</strong>{" "}
                {res.passed ? "✅ Passed" : "❌ Failed"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}