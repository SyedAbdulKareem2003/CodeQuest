# CodeQuest - A Full-Stack Competitive Programming Platform

<p align="center">
  ![Image](https://github.com/user-attachments/assets/75a4452e-3c0f-4d22-b927-86a8f68aa1d8)
</p>

<p align="center">
  A feature-rich platform built with React, Supabase, and the Judge0 API to help developers practice coding problems, test their knowledge with MCQs, and compete on a global leaderboard.
</p>

<p align="center">
  <a href="https://codequest-gules.vercel.app/"><strong>View Live Demo »</strong></a>
</p>
<br>

## About The Project

CodeQuest is a comprehensive web application designed to be a one-stop-shop for aspiring and established developers to sharpen their problem-solving skills. It goes beyond a simple LeetCode clone by integrating a full suite of features including coding challenges, multiple-choice questions, community discussions, and gamified elements like achievements and a live leaderboard. The entire application is built on a modern tech stack and is designed to be scalable and user-friendly.

---

## Tech Stack

This project was built using the following technologies:

*   **Frontend:**
    *   ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
    *   ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
    *   **CodeMirror:** For the interactive, IDE-like code editor.
    *   **React Router:** For client-side routing and navigation.

*   **Backend & Database:**
    *   ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
    *   **PostgreSQL:** The underlying database managed by Supabase.
    *   **Google OAuth:** For secure and seamless user authentication.

*   **APIs & Deployment:**
    *   **Judge0 API:** For real-time, multi-language code compilation and execution.
    *   ![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

---

## Features

✅ **Secure User Authentication:** Seamless and secure login using Google OAuth, with all critical routes protected to ensure a personalized user experience.

✅ **Interactive Coding Problems:** Solve challenges in a real-time **CodeMirror** editor that supports multiple languages, provides starter templates, and allows users to save their progress.

✅ **Real-Time Code Evaluation:** Instant feedback on code submissions powered by the **Judge0 API**. Users see detailed results, including success on test cases or specific error messages. Solved problems are automatically marked as complete.

✅ **Knowledge-Building MCQs:** Test conceptual understanding with multiple-choice questions that provide immediate correct/incorrect feedback and detailed explanations to aid learning.

✅ **Community Discussion Boards:** A threaded comment and reply system for each problem, allowing users to ask questions, share different approaches, and learn from the community.

✅ **Dynamic User Profiles:** Personalized dashboards tracking solved problems (both code & MCQ), total points scored, and an editable username.

✅ **Gamified Achievements:** An achievement system that unlocks badges for milestones (e.g., "First Code Submitted," "Problem Solver"), motivating users to stay engaged.

✅ **Competitive Leaderboard:** A global ranking system based on total points scored. It features a refresh button to fetch the latest rankings and foster a healthy, competitive environment.

---

## Challenges & Learnings

One of the main challenges was managing the free-tier rate limits of the Judge0 API from RapidAPI. To prevent users from spamming the API and to optimize the limited monthly requests, I implemented client-side state management to disable the submit button during an active submission. This, combined with clear loading indicators, provides a smooth user experience while ensuring the application stays within its operational limits. This taught me the importance of planning for real-world constraints when integrating third-party services.

---

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You will need `npm` or `yarn` installed on your machine.

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/SyedAbdulKareem2003/CodeQuest.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Create a `.env.local` file in the root directory and add your environment variables (Supabase URL, Anon Key, Judge0 API Key).
    ```
    REACT_APP_SUPABASE_URL='YOUR_SUPABASE_URL'
    REACT_APP_SUPABASE_ANON_KEY='YOUR_SUPABASE_ANON_KEY'
    REACT_APP_RAPIDAPI_KEY='YOUR_RAPIDAPI_KEY'
    ```
4.  Run the application
    ```sh
    npm start
    ```
