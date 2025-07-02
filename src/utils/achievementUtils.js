import supabase from "../supabaseClient";

export const achievementRules = [
  {
    key: "first_solve",
    condition: (progress) => progress.solved >= 1,
  },
  {
    key: "ten_mcq",
    condition: (progress) => progress.mcqSolved >= 10,
  },
  {
    key: "ten_coding",
    condition: (progress) => progress.codingSolved >= 10,
  },
  {
    key: "point_collector",
    condition: (progress) => progress.totalPoints >= 1000,
  },
  {
    key: "persistent",
    condition: (progress) => progress.manyAttempts >= 3,
  },
];

export const checkAndUnlockAchievements = async (userId) => {
  try {
    // 1. Load user progress
    const { data: progressList, error: progressError } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId);

    if (progressError) {
      console.error("❌ Failed to load user_progress!", progressError.message);
      return;
    }

    // 2. Calculate stats
    const totalSolved = progressList.filter((p) => p.completed).length;
    const mcqSolved = progressList.filter((p) => p.completed && p.question_type === "mcq").length;
    const codingSolved = progressList.filter((p) => p.completed && p.question_type === "coding").length;
    const totalPoints = progressList.reduce((sum, p) => sum + p.score, 0);
    const manyAttempts = progressList.filter((p) => p.attempts >= 3).length;

    const progress = {
      solved: totalSolved,
      mcqSolved,
      codingSolved,
      totalPoints,
      manyAttempts,
    };

    // Debug log
    console.log("Progress for achievements:", progress);

    // 3. Fetch existing achievements
    const { data: existing } = await supabase
      .from("achievements")
      .select("type")
      .eq("user_id", userId);

    const unlockedTypes = existing.map((ach) => ach.type);

    // 4. Check and collect new achievements to unlock
    const newAchievements = [];
    achievementRules.forEach((rule) => {
      if (rule.condition(progress) && !unlockedTypes.includes(rule.key)) {
        newAchievements.push({
          user_id: userId,
          type: rule.key,
          achieved_on: new Date(),
        });
        console.log(`🏅 Ready to unlock: ${rule.key}`);
      }
    });

    // 5. Insert new achievements
    if (newAchievements.length > 0) {
      const { error: insertError } = await supabase
        .from("achievements")
        .insert(newAchievements);

      if (insertError) {
        console.error("❌ Achievement insert failed:", insertError.message);
      } else {
        console.log("🏆 New achievements inserted:", newAchievements.map((a) => a.type));
      }
    } else {
      console.log("🛑 No new achievements to unlock.");
    }
  } catch (err) {
    console.error("🚨 Unexpected error in checkAndUnlockAchievements:", err);
  }
};