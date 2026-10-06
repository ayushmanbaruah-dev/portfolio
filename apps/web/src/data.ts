export const EMAIL = "aayushmanbaruah@aol.com";
export const LINKS = {
  github: "https://github.com/ayushmanbaruah-dev",
  linkedin: "https://www.linkedin.com/in/aayushmaanbaruah/",
};
export const API = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:8787";

export type Project = {
  id: string; name: string; tagline: string; stack: string[]; summary: string; specs: string[]; repo: string;
};
export const PROJECTS: Project[] = [
  {
    id: "ransomwarewatch", name: "RansomwareWatch", tagline: "AI-powered ransomware detection",
    stack: ["PyTorch", "WCGAN-GP", "XGBoost", "Streamlit", "SHAP", "Docker"],
    summary: "An end-to-end machine learning pipeline that detects ransomware traffic using the CICIDS 2017 dataset.",
    specs: [
      "WCGAN-GP module in PyTorch generates synthetic data",
      "XGBoost classifier trained on the dataset",
      "Evaluation artifacts: confusion matrices, ROC curves, PDF reports",
      "Streamlit app for training and SHAP-based explanations",
      "Containerized with Docker",
    ],
    repo: "https://github.com/ayushmanbaruah-dev/ransomwarewatch",
  },
  {
    id: "thedu", name: "Thedu", tagline: "Relevance-first local search engine",
    stack: ["BM25", "Inverted index", "SQLite", "FastAPI", "Docker", "CI/CD"],
    summary: "A lightweight local search engine prototype that ranks documents by relevance.",
    specs: [
      "Deterministic tokenization and an inverted index",
      "BM25 ranking over SQLite document storage",
      "REST API and CLI interfaces",
      "Automated tests and CI workflows",
      "Docker-based execution and documentation",
    ],
    repo: "https://github.com/ayushmanbaruah-dev/THEDU",
  },
];

// Self-assessed levels (0-100). Adjust these so they stay honest.
export const SKILLS: { group: string; items: [string, number][] }[] = [
  { group: "Languages", items: [["Python", 90], ["SQL", 75]] },
  { group: "ML and data", items: [["scikit-learn", 85], ["TensorFlow / Keras", 80], ["PyTorch", 75], ["XGBoost", 80], ["OpenCV", 70], ["Pandas / NumPy", 90]] },
  { group: "Backend and tools", items: [["FastAPI", 75], ["Docker", 70], ["Git / CI/CD", 75], ["Streamlit", 85], ["MERN", 65]] },
];

export const QUICK_QUESTIONS = ["What projects has he built?", "What are his skills?", "Where did he study?"];
