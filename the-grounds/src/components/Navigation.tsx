import { Home, FolderOpen, User, Settings } from "lucide-react";
import { Button } from "./ui/button";
import theGroundsLogo from "../the_grounds_logo.png";

type Page =
  | "home"
  | "test"
  | "practice"
  | "play"
  | "projects"
  | "profile"
  | "settings";

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Navigation({
  currentPage,
  onNavigate,
}: NavigationProps) {
  return (
    <nav className="bg-white dark:bg-card border-b-4 border-[#86b19c] dark:border-primary px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Logo */}
      <button
        onClick={() => onNavigate("home")}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <img
          src={theGroundsLogo}
          alt="The Grounds"
          className="h-12 object-contain"
        />
      </button>

      {/* Navigation Links */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onNavigate("home")}
          variant={currentPage === "home" ? "default" : "ghost"}
          className={`gap-2 ${
            currentPage === "home"
              ? "bg-[#86b19c] hover:bg-[#6d9a84] text-white dark:bg-primary dark:hover:bg-primary/90"
              : "hover:bg-[#86b19c]/10 dark:text-foreground"
          }`}
          style={{ fontFamily: "Lexend, sans-serif" }}
        >
          <Home className="w-4 h-4" />
          Home
        </Button>

        <Button
          onClick={() => onNavigate("projects")}
          variant={
            currentPage === "projects" ? "default" : "ghost"
          }
          className={`gap-2 ${
            currentPage === "projects"
              ? "bg-[#86b19c] hover:bg-[#6d9a84] text-white dark:bg-primary dark:hover:bg-primary/90"
              : "hover:bg-[#86b19c]/10 dark:text-foreground"
          }`}
          style={{ fontFamily: "Lexend, sans-serif" }}
        >
          <FolderOpen className="w-4 h-4" />
          Projects
        </Button>

        <Button
          onClick={() => onNavigate("profile")}
          variant={
            currentPage === "profile" ? "default" : "ghost"
          }
          className={`gap-2 ${
            currentPage === "profile"
              ? "bg-[#86b19c] hover:bg-[#6d9a84] text-white dark:bg-primary dark:hover:bg-primary/90"
              : "hover:bg-[#86b19c]/10 dark:text-foreground"
          }`}
          style={{ fontFamily: "Lexend, sans-serif" }}
        >
          <User className="w-4 h-4" />
          Profile
        </Button>

        <Button
          onClick={() => onNavigate("settings")}
          variant={
            currentPage === "settings" ? "default" : "ghost"
          }
          className={`gap-2 ${
            currentPage === "settings"
              ? "bg-[#86b19c] hover:bg-[#6d9a84] text-white dark:bg-primary dark:hover:bg-primary/90"
              : "hover:bg-[#86b19c]/10 dark:text-foreground"
          }`}
          style={{ fontFamily: "Lexend, sans-serif" }}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>
    </nav>
  );
}