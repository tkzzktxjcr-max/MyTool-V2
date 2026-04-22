import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { Client, Account, Databases } from "appwrite";

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || "");

// Store for later use
export { client, Account, Databases };

createRoot(document.getElementById("root")!).render(<App />);