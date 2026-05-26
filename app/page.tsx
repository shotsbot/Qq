"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudLightning,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  Sun,
  Moon,
  Key,
  Lock,
  RefreshCw,
  AlertTriangle,
  LayoutDashboard,
  FolderOpen,
  Terminal as TerminalIcon,
  GitBranch,
  Database,
  BrainCircuit,
  Settings,
  LogOut,
  HardDrive,
  Cpu,
  Layers,
  Search,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Clock,
  ArrowUpRight,
  ChevronLeft,
  Download,
  CheckCircle,
  HelpCircle,
  File,
  X,
  Play,
  Menu
} from "lucide-react";

// Types definition
interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  updatedAt: string;
}

interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

interface BackupItem {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  status: "success" | "failed";
  scheduleType: "manual" | "scheduled";
}

export default function page() {
  // Appearance & State
  const [darkMode, setDarkMode] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string; label: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchPanelExpanded, setIsSearchPanelExpanded] = useState(false);

  // Authentication Fields
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Navigation Panel Tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "filesystem" | "terminal" | "git" | "backups" | "ai">("dashboard");

  // System Live Metrics Simulation (updates every 2 seconds)
  const [cpuStats, setCpuStats] = useState<number[]>(Array(10).fill(12));
  const [ramUsed, setRamUsed] = useState(42.5); // %
  const [diskUsed, setDiskUsed] = useState(28.4); // %
  const [networkIn, setNetworkIn] = useState(1.4); // MB/s
  const [networkOut, setNetworkOut] = useState(0.8); // MB/s
  const [uptime, setUptime] = useState("5 jam, 32 menit");

  // File Manager State
  const [currentPath, setCurrentPath] = useState("");
  const [filesList, setFilesList] = useState<FileItem[]>([]);
  const [isFilesLoading, setIsFilesLoading] = useState(false);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [isEditorSaving, setIsEditorSaving] = useState(false);
  const [fileError, setFileError] = useState("");
  const [fileSuccess, setFileSuccess] = useState("");

  // Create file/folder dialog state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<"file" | "folder">("file");
  const [newObjectName, setNewObjectName] = useState("");

  // Search Engine Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExt, setSearchExt] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // SSH Terminal State
  const [terminalHistory, setTerminalHistory] = useState<Array<{ command: string; output: string; timestamp: string }>>([
    {
      command: "neofetch",
      output: `Welcome to Termux SSH Control Center!
======================================
OS: Ubuntu Center v24.04 LTS (Emulated)
Kernel: 6.1.12-riset-vps-arm64
Uptime: 5 jam, 32 menit
Shell: bash (Termux style touch engine)
Terminal: xterm-256color emu
CPU: ARMv8 Cortex-A72 (64-bit)
RAM: 2.45 GB / 8.00 GB (30%)
Disk: 28.4% Terpakai dari 40 GB

* Ketik 'help' untuk panduan perintah vps terintegrasi.
* Gunakan Touch Bar pintasan (ESC, TAB, CTRL, ALT, ▲, ▼) di bawah ini.`,
      timestamp: "17:44:00"
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [isTerminalExecuting, setIsTerminalExecuting] = useState(false);
  const [terminalWorkingDir, setTerminalWorkingDir] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>(["systemctl status nginx"]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Git State
  const [gitInitialized, setGitInitialized] = useState(true);
  const [gitBranch, setGitBranch] = useState("main");
  const [gitBranches, setGitBranches] = useState<string[]>(["main", "dev-riset"]);
  const [gitCommits, setGitCommits] = useState<GitCommit[]>([]);
  const [gitCommitMsg, setGitCommitMsg] = useState("");
  const [gitStatusMsg, setGitStatusMsg] = useState("Your branch is up to date with 'origin/main'.");
  const [isGitActionLoading, setIsGitActionLoading] = useState(false);

  // Backup state
  const [backupScheduleEnabled, setBackupScheduleEnabled] = useState(true);
  const [scheduleInterval, setScheduleInterval] = useState("Daily (02:00)");
  const [backupRecords, setBackupRecords] = useState<BackupItem[]>([]);
  const [isBackupActionLoading, setIsBackupActionLoading] = useState(false);

  // AI Copilot state
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Halo Admin! Saya adalah RiSET AI Copilot. Tanyakan apa saja seputar optimasi Ubuntu, penulisan shell script, konfigurasi Nginx, atau setup container PM2." }
  ]);
  const [aiInputMessage, setAiInputMessage] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Trigger metrics loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuStats((prev) => {
        const next = [...prev.slice(1)];
        const rnd = Math.floor(Math.random() * 25) + 5; // CPU fluctuation 5-30%
        next.push(rnd);
        return next;
      });

      setRamUsed((prev) => {
        const delta = (Math.random() - 0.5) * 1.5;
        const next = Math.min(100, Math.max(10, prev + delta));
        return parseFloat(next.toFixed(1));
      });

      setNetworkIn((prev) => {
        const next = Math.random() * 4 + 0.5;
        return parseFloat(next.toFixed(1));
      });

      setNetworkOut((prev) => {
        const next = Math.random() * 2 + 0.2;
        return parseFloat(next.toFixed(1));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Sync token session checking on mount
  useEffect(() => {
    const localToken = localStorage.getItem("vps_token");
    const localUser = localStorage.getItem("vps_user");
    if (localToken && localUser) {
      setAuthToken(localToken);
      setCurrentUser(JSON.parse(localUser));
    }
  }, []);

  // Fetch directory files from API when tab changes or path changes
  useEffect(() => {
    if (authToken && activeTab === "filesystem") {
      fetchFiles(currentPath);
    }
  }, [authToken, activeTab, currentPath]);

  // Fetch Backups
  useEffect(() => {
    if (authToken && activeTab === "backups") {
      fetchBackups();
    }
  }, [authToken, activeTab]);

  // Fetch Git metadata
  useEffect(() => {
    if (authToken && activeTab === "git") {
      fetchGitMeta();
    }
  }, [authToken, activeTab]);

  // Scroll terminal to base automatically
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalHistory]);

  // Network Fetch API Helpers
  const fetchFiles = async (targetPath: string) => {
    setIsFilesLoading(true);
    setFileError("");
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(targetPath)}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setFilesList(data.files || []);
        setCurrentPath(data.currentPath || "");
      } else {
        setFileError(data.error || "Gagal memuat sistem berkas");
      }
    } catch {
      setFileError("Gagal terkoneksi ke backend file explorer");
    } finally {
      setIsFilesLoading(false);
    }
  };

  const fetchBackups = async () => {
    try {
      const res = await fetch("/api/backup", { headers: { Authorization: `Bearer ${authToken}` } });
      const data = await res.json();
      if (data.success) {
        setBackupRecords(data.backups || []);
        setBackupScheduleEnabled(data.backupEnabled);
        setScheduleInterval(data.scheduleInterval);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGitMeta = async () => {
    try {
      const res = await fetch("/api/git", { headers: { Authorization: `Bearer ${authToken}` } });
      const data = await res.json();
      if (data.success) {
        setGitInitialized(data.initialized);
        setGitBranch(data.activeBranch);
        setGitBranches(data.branches);
        setGitCommits(data.commits);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Authenticate Admin Form handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });

      const data = await res.json();
      if (data.success) {
        setAuthToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem("vps_token", data.token);
        localStorage.setItem("vps_user", JSON.stringify(data.user));
      } else {
        setLoginError(data.error || "Periksa kembali identitas admin.");
      }
    } catch {
      setLoginError("Koneksi gagal ke server autentikasi!");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Sign out user
  const handleSignOut = () => {
    localStorage.removeItem("vps_token");
    localStorage.removeItem("vps_user");
    setAuthToken(null);
    setCurrentUser(null);
  };

  // Autofill helpers
  const applyAutofillRiset = () => {
    setLoginUsername("RiSET");
    setLoginPassword("Asdwe1234");
  };

  const applyAutofillAdmin = () => {
    setLoginUsername("admin");
    setLoginPassword("adminvpspassword123");
  };

  const applyAutofillOperator = () => {
    setLoginUsername("operator");
    setLoginPassword("operatorpassword456");
  };

  // Read File Content
  const handleReadFile = async (itemPath: string, itemName: string) => {
    setIsFilesLoading(true);
    setFileError("");
    setFileSuccess("");
    try {
      const res = await fetch(`/api/files?op=read&path=${encodeURIComponent(itemPath)}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedFileContent(data.content);
        setEditedContent(data.content);
        setSelectedFileName(itemName);
        setSelectedFilePath(itemPath);
      } else {
        setFileError(data.error || "Gagal membaca berkas.");
      }
    } catch {
      setFileError("Terjadi error saat terhubung ke filesystem");
    } finally {
      setIsFilesLoading(false);
    }
  };

  // Save File Content Edits
  const handleSaveFileContent = async () => {
    if (!selectedFilePath) return;
    setIsEditorSaving(true);
    setFileError("");
    setFileSuccess("");
    try {
      const res = await fetch("/api/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          op: "update",
          path: selectedFilePath,
          content: editedContent
        })
      });
      const data = await res.json();
      if (data.success) {
        setFileSuccess(`Berkas ${selectedFileName} berhasil disimpan!`);
        setSelectedFileContent(editedContent);
      } else {
        setFileError(data.error || "Gagal menyimpan berkas.");
      }
    } catch {
      setFileError("Error koneksi filesystem saver.");
    } finally {
      setIsEditorSaving(false);
    }
  };

  // Create Virtual File / Folder
  const handleCreateObject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjectName.trim()) return;

    setFileError("");
    setFileSuccess("");
    try {
      const res = await fetch("/api/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          op: "create",
          path: currentPath,
          name: newObjectName,
          isFolder: createType === "folder",
          content: createType === "file" ? `// Berkas Baru: ${newObjectName}\n\n` : ""
        })
      });
      const data = await res.json();
      if (data.success) {
        setFileSuccess(`${createType === "file" ? "Berkas" : "Folder"} '${newObjectName}' berhasil dibuat.`);
        setNewObjectName("");
        setIsCreateModalOpen(false);
        fetchFiles(currentPath);
      } else {
        setFileError(data.error || "Gagal membuat objek");
      }
    } catch {
      setFileError("Error saat menghubungi filesystem writer.");
    }
  };

  // Delete File/Folder
  const handleDeleteObject = async (itemPath: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus objek ini?")) return;
    setFileError("");
    setFileSuccess("");
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(itemPath)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setFileSuccess("Objek berhasil dihapus.");
        fetchFiles(currentPath);
      } else {
        setFileError(data.error || "Gagal menghapus objek.");
      }
    } catch {
      setFileError("Koneksi gagal saat menghapus.");
    }
  };

  // Search Files via API
  const handleSearchTrigger = async () => {
    if (!searchQuery && !searchExt && !searchText) {
      alert("Masukkan minimal satu filter pencarian!");
      return;
    }
    setIsSearching(true);
    try {
      const queryStr = `q=${encodeURIComponent(searchQuery)}&ext=${encodeURIComponent(searchExt)}&text=${encodeURIComponent(searchText)}`;
      const res = await fetch(`/api/search?${queryStr}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results || []);
      }
    } catch {
      alert("Sensor pencarian gagal.");
    } finally {
      setIsSearching(false);
    }
  };

  // Send Terminal Shell Command
  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCommand.trim()) return;

    const cmd = currentCommand;
    setCurrentCommand("");
    setCommandHistory((prev) => {
      const filtered = prev.filter((c) => c !== cmd);
      return [...filtered, cmd];
    });
    setHistoryPointer(-1);
    isTerminalExecuting && true;

    // Append user input
    const time = new Date().toLocaleTimeString();
    setTerminalHistory((prev) => [...prev, { command: cmd, output: "Menjalankan perintah di CPU...", timestamp: time }]);

    try {
      const res = await fetch("/api/terminal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ command: cmd, currentDir: terminalWorkingDir })
      });
      const data = await res.json();
      if (data.success) {
        if (data.output === "CLEAR") {
          setTerminalHistory([]);
        } else {
          setTerminalHistory((prev) => {
            const copy = [...prev];
            copy[copy.length - 1].output = data.output;
            return copy;
          });
          if (data.currentDir !== undefined) {
            setTerminalWorkingDir(data.currentDir);
          }
        }
      } else {
        setTerminalHistory((prev) => {
          const copy = [...prev];
          copy[copy.length - 1].output = data.error || "Gagal mengeksekusi shell.";
          return copy;
        });
      }
    } catch {
      setTerminalHistory((prev) => {
        const copy = [...prev];
        copy[copy.length - 1].output = "bash: Host unreachable or internal server disconnect.";
        return copy;
      });
    } finally {
      setIsTerminalExecuting(false);
    }
  };

  // Termux Special Keys Logic
  const handleTabComplete = () => {
    const defaultList = [
      "systemctl", "neofetch", "ls -la", "ps aux", "git status", "git log", "git branch",
      "help", "clear", "pwd", "whoami", "uname -a", "cat nginx.conf", "mkdir", "rm -rf", "touch"
    ];
    const trimCmd = currentCommand.trim();
    if (!trimCmd) {
      setCurrentCommand("ls ");
      return;
    }
    const match = defaultList.find((c) => c.startsWith(trimCmd));
    if (match) {
      setCurrentCommand(match + " ");
    } else {
      const words = currentCommand.split(" ");
      const lastWord = words[words.length - 1];
      if (lastWord) {
        const matchWord = defaultList.find((c) => c.startsWith(lastWord));
        if (matchWord) {
          words[words.length - 1] = matchWord;
          setCurrentCommand(words.join(" ") + " ");
        }
      }
    }
  };

  const handleTerminalHistoryUp = () => {
    if (commandHistory.length === 0) return;
    const nextPointer = historyPointer + 1;
    if (nextPointer < commandHistory.length) {
      setHistoryPointer(nextPointer);
      const cmd = commandHistory[commandHistory.length - 1 - nextPointer];
      setCurrentCommand(cmd);
    }
  };

  const handleTerminalHistoryDown = () => {
    const nextPointer = historyPointer - 1;
    if (nextPointer >= 0) {
      setHistoryPointer(nextPointer);
      const cmd = commandHistory[commandHistory.length - 1 - nextPointer];
      setCurrentCommand(cmd);
    } else {
      setHistoryPointer(-1);
      setCurrentCommand("");
    }
  };

  const handleCtrlAction = (action: string) => {
    const time = new Date().toLocaleTimeString();
    if (action === "C") {
      const canceledCmd = currentCommand;
      setCurrentCommand("");
      setTerminalHistory((prev) => [
        ...prev,
        { command: canceledCmd + " ^C", output: "Command canceled.", timestamp: time }
      ]);
      setHistoryPointer(-1);
    } else if (action === "L") {
      setTerminalHistory([]);
      setCurrentCommand("");
      setHistoryPointer(-1);
    } else if (action === "D") {
      setTerminalHistory((prev) => [
        ...prev,
        { command: "^D (logout)", output: "session closed. Connection to vps-riset-id closed.", timestamp: time }
      ]);
      setCurrentCommand("");
      setHistoryPointer(-1);
    } else if (action === "Z") {
      const suspendedCmd = currentCommand;
      setCurrentCommand("");
      setTerminalHistory((prev) => [
        ...prev,
        { command: suspendedCmd + " ^Z", output: "[1]+ Stopped " + suspendedCmd, timestamp: time }
      ]);
      setHistoryPointer(-1);
    }
  };

  // Git Actions Trigger
  const runGitAction = async (action: string, extraData?: any) => {
    setIsGitActionLoading(true);
    try {
      const res = await fetch("/api/git", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ action, ...extraData })
      });
      const data = await res.json();
      if (data.success) {
        setGitStatusMsg(data.message || "Git action selesai.");
        fetchGitMeta();
      } else {
        setGitStatusMsg(`Gagal: ${data.error}`);
      }
    } catch {
      setGitStatusMsg("Gagal menghubungi repositori local.");
    } finally {
      setIsGitActionLoading(false);
    }
  };

  // Manual Backups trigger
  const runBackupAction = async (action: string, payload?: any) => {
    setIsBackupActionLoading(true);
    try {
      const res = await fetch("/api/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ action, ...payload })
      });
      const data = await res.json();
      if (data.success) {
        fetchBackups();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBackupActionLoading(false);
    }
  };

  const deleteBackupRecord = async (id: string) => {
    if (!confirm("Hapus file zip cadangan dari VPS storage?")) return;
    setIsBackupActionLoading(true);
    try {
      const res = await fetch(`/api/backup?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchBackups();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBackupActionLoading(false);
    }
  };

  // AI DevOps Assistant Chat
  const handleAiMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInputMessage.trim()) return;

    const userMsg = aiInputMessage;
    setAiInputMessage("");
    setAiChatHistory((prev) => [...prev, { sender: "user", text: userMsg }]);
    setIsAiLoading(true);

    try {
      const res = await fetch("/api/gemini/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          message: userMsg,
          terminalContext: {
            dir: terminalWorkingDir,
            history: terminalHistory.slice(-3).map((h) => h.command)
          },
          systemHealth: {
            cpuLoad: cpuStats[cpuStats.length - 1],
            ramUsedPercent: ramUsed,
            diskUsedPercent: diskUsed
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setAiChatHistory((prev) => [...prev, { sender: "ai", text: data.text }]);
      } else {
        setAiChatHistory((prev) => [...prev, { sender: "ai", text: `Error: ${data.error || "Gagal mendapatkan saran AI."}` }]);
      }
    } catch {
      setAiChatHistory((prev) => [...prev, { sender: "ai", text: "Koneksi asisten AI terputus. Mohon pastikan model terpasang." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Safe login view shield if unauthenticated
  if (!authToken) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 transition-all duration-500 relative overflow-hidden"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 120%, rgba(99, 102, 241, 0.15), transparent), radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.04), transparent)"
        }}
      >
        {/* Glowing grid behind authentication sheet */}
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

        <div className="absolute top-6 right-6">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-xl border transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer ${darkMode ? "bg-slate-900/80 border-slate-800 text-amber-400" : "bg-white border-slate-200 text-slate-600"}`}
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className={`w-full max-w-xl rounded-3xl border p-8 md:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative z-10 ${darkMode ? "glass-panel bg-slate-950/60 border-slate-800/80" : "bg-white border-slate-200"}`}
        >
          {/* Accent blurs */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center mb-8 text-center relative">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl border ${darkMode ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border-indigo-100"}`}>
              <CloudLightning size={32} className="animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest font-mono mb-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Proteksi Jaringan VPS RiSET Aktif</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-200 via-indigo-200 to-indigo-500 bg-clip-text text-transparent">
              Ubuntu VPS Control
            </h1>
            <p className={`text-xs mt-2 max-w-sm leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Sistem manajemen file, terminal SSH interaktif, sinkronisasi repositori Git, dan asisten DevOps cerdas
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className={`block text-[10px] font-extrabold uppercase tracking-widest ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                ID Akseptor (Username)
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="cth: RiSET"
                  className={`w-full pl-4 pr-10 py-3.5 rounded-xl border text-sm outline-none transition-all font-mono ${darkMode ? "bg-slate-950/80 border-slate-800 text-indigo-100 placeholder-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600"}`}
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-550 font-mono">@</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`block text-[10px] font-extrabold uppercase tracking-widest ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                Kata Sandi Kriptografi (Password)
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  className={`w-full pl-4 pr-10 py-3.5 rounded-xl border text-sm outline-none transition-all font-mono ${darkMode ? "bg-slate-950/80 border-slate-800 text-indigo-100 placeholder-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600"}`}
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-550">
                  <Key size={14} />
                </span>
              </div>
            </div>

            {loginError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs leading-relaxed flex items-center gap-3"
              >
                <AlertTriangle size={16} className="shrink-0 text-rose-400 animate-bounce" />
                <span>{loginError}</span>
              </motion.div>
            )}

            <button
              id="login-btn"
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wider text-xs uppercase cursor-pointer transition-all hover:-translate-y-0.5 shadow-[0_5px_15px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Sedang Mengautentikasi...</span>
                </>
              ) : (
                <>
                  <Lock size={13} />
                  <span>Autentikasi Sesi (JWT Sign)</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Selections with premium design */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <span className={`block text-[11px] font-extrabold uppercase tracking-widest mb-4 text-center ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              ⚡ Kredensial Akses Cepat VPS
            </span>

            <div className="space-y-2.5">
              {/* RECOMMENDED - RiSET Account */}
              <button
                type="button"
                onClick={applyAutofillRiset}
                className={`w-full p-4 rounded-xl border text-left flex items-start justify-between transition-all hover:scale-[1.015] active:scale-[0.985] cursor-pointer relative overflow-hidden group ${darkMode ? "bg-slate-950/60 border-indigo-500/40 hover:border-indigo-400 text-slate-200" : "bg-indigo-50/40 border-indigo-200 hover:border-indigo-500 text-slate-800"}`}
              >
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg shrink-0 ${darkMode ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-100 text-indigo-700"}`}>
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-xs flex items-center gap-1.5 text-indigo-400">
                      <span>Admin RiSET (Khusus Penguji)</span>
                      <span className="text-[8px] bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-300 font-mono font-bold tracking-widest">UTAMA</span>
                    </div>
                    <div className={`mt-1 font-mono text-[11px] leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                      User: <span className="text-white font-bold">RiSET</span> | Pass: <span className="text-white font-bold">Asdwe1234</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-indigo-400/50 self-center group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Legacy Admin */}
                <button
                  type="button"
                  onClick={applyAutofillAdmin}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all hover:scale-102 cursor-pointer ${darkMode ? "bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"}`}
                >
                  <span className="font-bold text-xs text-slate-400 flex items-center gap-1">
                    <UserCheck size={12} /> Admin Server
                  </span>
                  <span className="mt-1 font-mono text-[10px] text-slate-500">
                    usr: admin | p: adminvps...
                  </span>
                </button>

                {/* Operator */}
                <button
                  type="button"
                  onClick={applyAutofillOperator}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all hover:scale-102 cursor-pointer ${darkMode ? "bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"}`}
                >
                  <span className="font-bold text-xs text-slate-400 flex items-center gap-1">
                    <UserCheck size={12} /> DevOps Eng.
                  </span>
                  <span className="mt-1 font-mono text-[10px] text-slate-500">
                    usr: operator | p: operator...
                  </span>
                </button>
              </div>
            </div>

            <div className="text-[10px] text-center text-slate-500 mt-5 leading-relaxed font-mono">
              Keamanan Terenkripsi • Ubuntu VPS Sandbox Env
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // CORE VPS PORTAL DASHBOARD VIEW
  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-all duration-300 ${darkMode ? "bg-[#030611] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Mobile Navigation Header */}
      <header className={`md:hidden flex h-16 px-4 items-center justify-between sticky top-0 z-30 border-b backdrop-blur-md transition-colors duration-300 ${darkMode ? "bg-[#030611]/90 border-slate-900/80 text-white" : "bg-white/90 border-slate-200 text-slate-900"}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center shadow-md">
            <CloudLightning size={16} className="text-white animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-xs tracking-wide">RiSET VPS</span>
            <span className="text-[8px] text-indigo-400 block font-mono font-bold uppercase tracking-widest leading-none">UBUNTU CENTER</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg border transition-all ${darkMode ? "bg-slate-900/80 border-slate-800 text-amber-400" : "bg-white border-slate-200 text-slate-600"}`}
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 rounded-lg border transition-all ${darkMode ? "bg-slate-900/80 border-slate-800 text-slate-300" : "bg-white border-slate-250 text-slate-700"}`}
          >
            {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* Mobile Sliding Drawer Panel Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed inset-y-0 left-0 w-[280px] z-40 p-5 flex flex-col justify-between border-r shadow-2xl backdrop-blur-3xl md:hidden ${
              darkMode ? "bg-slate-950/95 border-slate-900 text-slate-200" : "bg-white border-slate-200 text-slate-850"
            }`}
          >
            <div className="space-y-6">
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center">
                    <CloudLightning size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs">RiSET VPS</div>
                    <div className="text-[8px] text-indigo-400 block font-mono font-bold tracking-widest">ACTIVE PORTAL</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-1.5 rounded-lg border ${darkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"}`}
                >
                  <X size={14} />
                </button>
              </div>

              {/* User Status Badge */}
              <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${darkMode ? "bg-slate-900 border-slate-850 shadow-inner" : "bg-slate-50 border-slate-200"}`}>
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <UserCheck size={14} className="text-indigo-400" />
                </div>
                <div className="overflow-hidden">
                  <div className={`text-xs font-bold truncate ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                    {currentUser?.label || "Admin Panel"}
                  </div>
                  <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                    <span>{currentUser?.role || "Admin"}</span>
                  </div>
                </div>
              </div>

              {/* Menu items inside mobile drawer */}
              <nav className="space-y-1">
                {[
                  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-indigo-400 bg-indigo-500/5 border-indigo-500/10" },
                  { id: "filesystem", label: "Sistem Berkas", icon: FolderOpen, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" },
                  { id: "terminal", label: "Terminal SSH", icon: TerminalIcon, color: "text-amber-400 bg-amber-500/5 border-amber-500/10" },
                  { id: "git", label: "Git Repository", icon: GitBranch, color: "text-sky-400 bg-sky-500/5 border-sky-500/10" },
                  { id: "backups", label: "Snapshots & Backup", icon: Database, color: "text-violet-400 bg-violet-500/5 border-violet-500/10" },
                  { id: "ai", label: "DevOps AI Advisor", icon: BrainCircuit, color: "text-rose-400 bg-rose-500/5 border-rose-500/20" },
                ].map((menu) => {
                  const IconComp = menu.icon;
                  const isActive = activeTab === menu.id;
                  return (
                    <button
                      id={`mobile-tab-${menu.id}`}
                      key={menu.id}
                      onClick={() => {
                        setActiveTab(menu.id as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-bold cursor-pointer transition-all border ${
                        isActive
                          ? `${menu.color} text-indigo-400 font-extrabold translate-x-1 shadow-sm`
                          : `bg-transparent border-transparent ${darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"}`
                      }`}
                    >
                      <IconComp size={15} />
                      <span>{menu.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Drawer footer actions */}
            <div className="space-y-3 pt-4 border-t border-slate-800/40">
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-rose-500/20 cursor-pointer"
              >
                <LogOut size={12} />
                <span>Keluar Sesi</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop behind navigation drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* 1. LEFT SIDE NAVIGATION RAIL (Desktop) */}
      <aside className={`hidden md:flex w-64 shrink-0 p-5 flex-col justify-between border-r border-slate-800/80 backdrop-blur-3xl relative z-20 ${darkMode ? "bg-slate-950/90" : "bg-white border-slate-200"}`}>
        <div className="space-y-8">
          {/* Brand Logo and label */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <CloudLightning size={22} className="text-white animate-pulse" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-slate-200 to-white bg-clip-text text-transparent">
                RiSET VPS
              </div>
              <div className="text-[9px] text-indigo-400 font-extrabold tracking-widest font-mono uppercase">
                ubuntu center
              </div>
            </div>
          </div>

          {/* Connected User Badge */}
          <div className={`p-3 rounded-xl border flex items-center gap-3 ${darkMode ? "bg-slate-900/60 border-slate-800/80" : "bg-slate-100 border-slate-200"}`}>
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <UserCheck size={15} className="text-indigo-400" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-200 truncate">{currentUser?.label || "Administrator"}</div>
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                <span>{currentUser?.role || "Admin"} Sesi</span>
              </div>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav className="space-y-1.5">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-indigo-400 bg-indigo-500/5 border-indigo-500/20" },
              { id: "filesystem", label: "Sistem Berkas", icon: FolderOpen, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20" },
              { id: "terminal", label: "Terminal SSH", icon: TerminalIcon, color: "text-amber-400 bg-amber-500/5 border-amber-500/20" },
              { id: "git", label: "Git Repository", icon: GitBranch, color: "text-sky-400 bg-sky-500/5 border-sky-500/20" },
              { id: "backups", label: "Snapshots & Backup", icon: Database, color: "text-violet-400 bg-violet-500/5 border-violet-500/20" },
              { id: "ai", label: "DevOps AI Advisor", icon: BrainCircuit, color: "text-rose-400 bg-rose-500/5 border-rose-500/20" },
            ].map((menu) => {
              const IconComp = menu.icon;
              const isActive = activeTab === menu.id;
              return (
                <button
                  id={`tab-${menu.id}`}
                  key={menu.id}
                  onClick={() => setActiveTab(menu.id as any)}
                  className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-bold cursor-pointer transition-all border ${
                    isActive
                      ? `${menu.color} text-white shadow-sm font-extrabold translate-x-1`
                      : `bg-transparent border-transparent ${darkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60" : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"}`
                  }`}
                >
                  <IconComp size={16} className={isActive ? "" : "opacity-60"} />
                  <span>{menu.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Aside bottom parameters and logout */}
        <div className="space-y-4 pt-5 mt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
              Akses Online
            </span>
            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
              AKTIF
            </div>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full py-2 px-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${darkMode ? "bg-slate-900/40 border-slate-800 hover:bg-slate-850/60 text-amber-400" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"}`}
          >
            <span className="text-slate-400">Mode Tema</span>
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <button
            id="logout-btn"
            onClick={handleSignOut}
            className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-rose-500/25 cursor-pointer"
          >
            <LogOut size={13} />
            <span>Keluar Sesi (Sign Out)</span>
          </button>
        </div>
      </aside>

      {/* 2. CHIEF CONTENT VIEW SCREEN */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full relative z-10 overflow-y-auto max-h-screen">
        <AnimatePresence mode="wait">
          {/* --- MODULE 1: DASHBOARD SERVER STATS --- */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Stats header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-150 to-indigo-200 bg-clip-text text-transparent">
                    Ringkasan Dashboard Server
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Metrik performa kernel mesin Ubuntu Linux, status alokasi disk, dan beban sistem saat ini
                  </p>
                </div>
                {/* Visual server banner */}
                <div className="flex items-center gap-4 bg-slate-900/40 border border-slate-800/80 px-4 py-2.5 rounded-xl text-xs font-mono">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500">WAKTU AKTIF (UPTIME)</span>
                    <span className="text-slate-200 font-bold">{uptime}</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping self-center" />
                </div>
              </div>

              {/* THREE CORE METRICS CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Metric 1: CPU load */}
                <div className={`p-6 rounded-2xl border ${darkMode ? "glass-panel glow-indigo" : "bg-white border-slate-200"} relative overflow-hidden group`}>
                  <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${darkMode ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
                        <Cpu size={20} className="animate-spin" style={{ animationDuration: "12s" }} />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest font-mono">beban core cpu</div>
                        <div className="text-2xl font-extrabold text-white mt-1 font-mono">
                          {cpuStats[cpuStats.length - 1]}%
                        </div>
                      </div>
                    </div>

                    {/* Miniature live sparkline SVG chart */}
                    <div className="w-32 h-20 pt-4 self-end">
                      <svg viewBox="0 0 100 30" className="w-full h-full">
                        <defs>
                          <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d={`M ${cpuStats.map((val, idx) => `${idx * 10}, ${30 - val}`).join(" L ")}`}
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                        <path
                          d={`M 0,30 L ${cpuStats.map((val, idx) => `${idx * 10}, ${30 - val}`).join(" L ")} L 90,30 Z`}
                          fill="url(#cpuGrad)"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Metric 2: RAM usage */}
                <div className={`p-6 rounded-2xl border ${darkMode ? "glass-panel glow-emerald" : "bg-white border-slate-200"} relative overflow-hidden group`}>
                  <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                        <Layers size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest font-mono">beban memory ram</div>
                        <div className="text-2xl font-extrabold text-white mt-1 font-mono">
                          {ramUsed}%
                        </div>
                      </div>
                    </div>
                    {/* Radial progress meter */}
                    <div className="relative w-16 h-16 self-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-800"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-emerald-400"
                          strokeDasharray={`${ramUsed}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-slate-250">
                        {Math.floor(ramUsed)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metric 3: Disk / Storage */}
                <div className={`p-6 rounded-2xl border ${darkMode ? "glass-panel" : "bg-white border-slate-200"} relative overflow-hidden group`}>
                  <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
                  <div className="flex items-start justify-between">
                    <div className="space-y-4 w-full">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${darkMode ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
                        <HardDrive size={20} />
                      </div>
                      <div className="w-full">
                        <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest font-mono">kapasitas penyimpanan</div>
                        <div className="text-2xl font-extrabold text-white mt-1 font-mono">
                          {diskUsed}%
                        </div>
                        {/* Dynamic status slider bar */}
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                          <div className="bg-gradient-to-r from-indigo-500 to-indigo-300 h-full rounded-full" style={{ width: `${diskUsed}%` }} />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-mono">
                          <span>Terisi: {Math.floor(diskUsed * 2.5)}GB</span>
                          <span>Kapasitas: 250 GB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TWO COLUMN SUBSECTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Network Activity Monitor */}
                <div className={`lg:col-span-2 p-6 rounded-2xl border ${darkMode ? "glass-panel" : "bg-white border-slate-200"}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-200">Aktivitas Lalulintas Jaringan</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Monitoring throughput bandwidth masuk dan keluar VPS</p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-indigo-400">IN: {networkIn} MB/s</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-emerald-400">OUT: {networkOut} MB/s</span>
                      </div>
                    </div>
                  </div>

                  {/* Decorative network grid visualization */}
                  <div className="h-48 flex items-end justify-between border-b border-l border-slate-800/80 p-3 pt-6 relative">
                    <div className="absolute inset-0 grid-bg opacity-10" />
                    {/* Simulation columns bar */}
                    {Array.from({ length: 15 }).map((_, i) => {
                      const h1 = Math.floor(Math.sin((i + Date.now()/10000)) * 25) + 35;
                      const h2 = Math.floor(Math.cos((i * 1.5 + Date.now()/12000)) * 15) + 20;
                      return (
                        <div key={i} className="flex flex-col items-center gap-1 w-full max-w-[20px] h-full justify-end">
                          <div className="w-1.5 bg-emerald-400/20 rounded-full h-full relative overflow-hidden flex items-end">
                            <motion.div animate={{ height: `${h2}%` }} className="bg-emerald-400 w-full rounded-full shadow-[0_0_8px_#34d399]" />
                          </div>
                          <div className="w-1.5 bg-indigo-500/20 rounded-full h-full relative overflow-hidden flex items-end">
                            <motion.div animate={{ height: `${h1}%` }} className="bg-indigo-500 w-full rounded-full shadow-[0_0_8px_#6366f1]" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Services Daemon Status Panel */}
                <div className={`p-6 rounded-2xl border ${darkMode ? "glass-panel" : "bg-white border-slate-200"}`}>
                  <h3 className="font-extrabold text-sm text-slate-200 mb-4">Status Layanan Inti</h3>
                  <div className="space-y-3">
                    {[
                      { name: "Nginx Engine Proxy", port: "Port 80/443", status: "Running", color: "text-emerald-400 bg-emerald-500/10" },
                      { name: "PM2 Process Controller", port: "Node App App.js", status: "Running", color: "text-emerald-400 bg-emerald-500/10" },
                      { name: "SSH Shield Auth", port: "Port 22 (SSH)", status: "Running", color: "text-emerald-400 bg-emerald-500/10" },
                      { name: "Fail2Ban Protection", port: "Intrusion Shield", status: "Running", color: "text-emerald-400 bg-emerald-500/10" },
                      { name: "Cron Task Backup", port: "Scheduled snap", status: "Idle", color: "text-slate-400 bg-slate-500/10" },
                    ].map((srv, i) => (
                      <div key={i} className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-slate-200">{srv.name}</div>
                          <div className="text-[9px] text-slate-450 font-mono mt-0.5">{srv.port}</div>
                        </div>
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${srv.color}`}>
                          {srv.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- MODULE 2: SYSTEM FILESYSTEM & SEARCH EXPLORER --- */}
          {activeTab === "filesystem" && (
            <motion.div
              key="filesystem"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Module Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-150 to-indigo-200 bg-clip-text text-transparent">
                    Sistem Berkas Ubuntu VPS
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Administrasi file interaktif terlokalisasi di sandbox server. Anda bisa membuat, membaca, menulis, dan memodifikasi file.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Plus size={14} /> Akuisisi File/Folder Baru
                  </button>
                </div>
              </div>

              {/* Warnings and success alerts */}
              {fileError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}
              {fileSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle size={15} className="shrink-0" />
                  <span>{fileSuccess}</span>
                </div>
              )}

              {/* DOUBLE PANELS: ADVANCED FILE SEARCH ENGINE & PATH NAVIGATION */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Panel 1: Filter Engine Search (Left Columns 1) */}
                <div className={`lg:col-span-1 p-5 rounded-2xl border flex flex-col gap-4 ${darkMode ? "glass-panel" : "bg-white border-slate-200"}`}>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/85">
                    <h3 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
                      <Search size={15} className="text-indigo-400" /> Filter Pencarian
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsSearchPanelExpanded(!isSearchPanelExpanded)}
                      className="lg:hidden flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg border border-slate-800 bg-slate-950 text-slate-300 cursor-pointer"
                    >
                      {isSearchPanelExpanded ? "Sembunyikan" : "Tampilkan"}
                    </button>
                  </div>

                  <div className={`${isSearchPanelExpanded ? "block" : "hidden lg:block"} space-y-3.5`}>
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Nama Berkas (Wildcard)</label>
                        <input
                          id="search-name"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="cth: nginx"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-250 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Ekstensi Berkas (.ext)</label>
                        <input
                          id="search-ext"
                          type="text"
                          value={searchExt}
                          onChange={(e) => setSearchExt(e.target.value)}
                          placeholder="cth: conf, sh"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-250 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Cari Kata di Dalam File (Grep)</label>
                        <input
                          id="search-text"
                          type="text"
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          placeholder="cth: proxy_pass"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-250 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                        />
                      </div>

                      <button
                        id="search-btn"
                        onClick={handleSearchTrigger}
                        disabled={isSearching}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-inner"
                      >
                        {isSearching ? <RefreshCw size={13} className="animate-spin" /> : <Search size={13} />}
                        <span>Temukan Hasil Konten</span>
                      </button>
                    </div>

                    {/* Search Results Display Area */}
                    {searchResults.length > 0 && (
                      <div className="mt-2 space-y-2 max-h-56 overflow-y-auto">
                        <span className="text-[10px] font-bold text-slate-400">Hasil Temuan ({searchResults.length}):</span>
                        {searchResults.map((resItem, x) => (
                          <div
                            key={x}
                            onClick={() => {
                              if (!resItem.isDirectory) {
                                handleReadFile(resItem.path, resItem.name);
                              }
                            }}
                            className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl text-[11px] cursor-pointer hover:bg-slate-900 overflow-hidden leading-relaxed"
                          >
                            <div className="flex items-center gap-1.5 font-bold text-indigo-400 truncate">
                              <FileText size={12} className="shrink-0" />
                              <span>{resItem.name}</span>
                            </div>
                            <div className="text-[9px] text-slate-500 mt-0.5 truncate">{resItem.path}</div>
                            {resItem.matchedContentLine && (
                              <div className="text-[9px] text-[#34d399] font-mono mt-1 bg-slate-900 border border-emerald-900/10 p-1.5 rounded-lg whitespace-pre-wrap truncate">
                                {resItem.matchedContentLine}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Panel 2: Filesystem Navigation Grid explorer (Right Column 3) */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                  {/* Active working directory path breadcrumbs */}
                  <div className={`p-4 rounded-xl border flex flex-wrap items-center gap-2 overflow-x-auto ${darkMode ? "bg-slate-950/70 border-slate-850" : "bg-white border-slate-150"}`}>
                    <button
                      onClick={() => {
                        if (currentPath) {
                          const parent = currentPath.split("/").slice(0, -1).join("/");
                          setCurrentPath(parent);
                        }
                      }}
                      disabled={!currentPath}
                      className="px-2 py-1 bg-slate-900/80 border border-slate-880 text-slate-400 disabled:opacity-40 rounded-lg hover:text-white transition-all text-xs flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <ChevronLeft size={14} /> Kembali
                    </button>
                    <div className="text-xs font-mono font-bold tracking-wide truncate max-w-full">
                      <span className="text-slate-500">./sandbox_vps/</span>
                      <span className="text-indigo-400">{currentPath || "/"}</span>
                    </div>
                  </div>

                  {/* File Lists / Folder Cards view */}
                  <div className={`border p-5 rounded-2xl flex-1 min-h-[300px] ${darkMode ? "bg-slate-950/40 border-slate-900" : "bg-white border-slate-200"}`}>
                    {isFilesLoading ? (
                      <div className="h-44 flex flex-col items-center justify-center gap-3">
                        <RefreshCw className="animate-spin text-indigo-500" size={24} />
                        <span className="text-xs text-slate-400 font-mono">Sinkronisasi sistem berkas VPS kualifikasi...</span>
                      </div>
                    ) : filesList.length === 0 ? (
                      <div className="h-44 flex flex-col items-center justify-center gap-2 text-center">
                        <HelpCircle size={28} className="text-slate-650" />
                        <span className="text-xs text-slate-400">Direktori kosong atau tidak bisa dimuat. Buat objek baru untuk memulai!</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {filesList.map((file, j) => (
                          <div
                            key={j}
                            className={`p-4 rounded-xl border flex items-start justify-between cursor-pointer group transition-all hover:scale-[1.015] active:scale-[0.985] ${
                              file.isDirectory
                                ? darkMode
                                  ? "bg-slate-950/60 border-slate-850 hover:border-emerald-500/40"
                                  : "bg-teal-50/10 border-slate-200 hover:bg-teal-50"
                                : darkMode
                                  ? "bg-slate-950/40 border-slate-900 hover:border-indigo-500/40"
                                  : "bg-slate-50/30 border-slate-200 hover:bg-slate-50"
                            }`}
                            onClick={() => {
                              if (file.isDirectory) {
                                setCurrentPath(file.path);
                              } else {
                                handleReadFile(file.path, file.name);
                              }
                            }}
                          >
                            <div className="flex items-start gap-3 truncate flex-1">
                              <div className={`p-2 rounded-xl shrink-0 ${file.isDirectory ? "text-emerald-400 bg-emerald-500/5 border border-emerald-500/10" : "text-indigo-400 bg-indigo-500/5 border border-indigo-500/10"}`}>
                                {file.isDirectory ? <FolderOpen size={16} /> : <FileText size={16} />}
                              </div>
                              <div className="truncate py-0.5">
                                <div className="font-bold text-xs text-slate-200 truncate group-hover:text-white">{file.name}</div>
                                <div className="text-[9px] text-slate-550 font-mono mt-0.5 font-bold">
                                  {file.isDirectory ? "Direktori" : `${(file.size / 1024).toFixed(1)} KB`}
                                </div>
                              </div>
                            </div>

                            <button
                              id={`del-${file.name}`}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteObject(file.path);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-500/10 rounded-lg text-rose-400 transition-all cursor-pointer"
                            >
                              <Trash2 id={`del-icon-${file.name}`} size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* EDITOR MODAL COMPONENT (Only opens if a file has been read and selected) */}
              {selectedFileContent !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-6 rounded-3xl border mt-4 ${darkMode ? "glass-panel bg-slate-950/80 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-indigo-400" />
                      <span className="font-extrabold text-sm text-slate-200">{selectedFileName}</span>
                      <span className="text-[10px] font-mono font-semibold text-slate-450">({selectedFilePath})</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedFileContent(null);
                        setSelectedFileName(null);
                        setSelectedFilePath(null);
                      }}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <textarea
                    id="file-editor"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={12}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-indigo-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 resize-y"
                  />

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => {
                        setSelectedFileContent(null);
                        setSelectedFileName(null);
                        setSelectedFilePath(null);
                      }}
                      className="px-4 py-2 hover:bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Tutup Editor
                    </button>
                    <button
                      id="save-edit-btn"
                      onClick={handleSaveFileContent}
                      disabled={isEditorSaving}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-inner cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      {isEditorSaving ? <RefreshCw size={13} className="animate-spin" /> : <Edit2 size={13} />}
                      <span>Simpan Perubahan</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* --- MODULE 3: SSH WEB SHELL CONTAINER --- */}
          {activeTab === "terminal" && (
            <motion.div
              key="terminal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Module header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-150 to-emerald-300 bg-clip-text text-transparent">
                    Terminal SSH Web (Termux Engine)
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Simulator SSH Ubuntu berkinerja tinggi yang disesuaikan untuk kenyamanan keyboard seluler (Termux Style).
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                  <span className="font-mono text-[10px] font-bold bg-[#10b981]/10 text-emerald-400 px-2 py-0.5 border border-[#10b981]/25 rounded-md uppercase tracking-wide">
                    TTY Session: Active
                  </span>
                </div>
              </div>

              {/* Advanced Interactive Terminal Sheet (Termux Pure Black aesthetic) */}
              <div className="rounded-3xl border border-slate-900 bg-black shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden relative">
                
                {/* Termux Terminal Titlebar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-900 text-xs font-mono select-none">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-slate-400 ml-2 text-[11px] font-bold">~ Termux [Session #1]</span>
                  </div>
                  <span className="text-emerald-500 font-bold uppercase tracking-widest text-[9px] bg-emerald-500/15 border border-emerald-500/25 px-1.5 py-0.5 rounded animate-pulse">
                    PORT: 22
                  </span>
                </div>

                {/* Shell Output history buffer */}
                <div className="p-4 sm:p-5 space-y-4 max-h-[440px] overflow-y-auto mb-1 font-mono text-[12px] sm:text-[13px] pr-2 leading-relaxed text-[#ececec]">
                  {terminalHistory.map((line, key) => (
                    <div key={key} className="space-y-1">
                      {/* CMD Prompt line */}
                      <div className="flex flex-wrap items-center gap-1.5 text-indigo-400 font-bold select-text">
                        <span className="text-emerald-400 font-bold">p4ch4r4t4r123@riset-vps:~/sandbox_vps{terminalWorkingDir ? `/${terminalWorkingDir}` : ""}$</span>
                        <span className="text-slate-100 font-bold break-all">{line.command}</span>
                        <span className="text-slate-600 text-[9px] font-mono ml-auto font-normal shrink-0">{line.timestamp}</span>
                      </div>
                      {/* Outputs line */}
                      <pre className="text-slate-300 pl-3.5 py-2.5 whitespace-pre-wrap select-text leading-relaxed font-mono bg-slate-950/90 border-l-2 border-slate-800 rounded-md">
                        {line.output}
                      </pre>
                    </div>
                  ))}
                  <div ref={terminalBottomRef} />
                </div>

                {/* Tactile Extra Keys Toolbar (Termux Touch Board!) */}
                <div className="px-3 py-2 bg-slate-950 border-t border-slate-900 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[10px] font-mono select-none px-1 text-slate-500">
                    <span className="uppercase font-bold tracking-wider text-[9px]">Termux Touch Bar Assistant:</span>
                    <span className="text-indigo-400/80">Kunci pintasan cepat untuk keyboard seluler</span>
                  </div>
                  
                  {/* Shortcut Keys Row */}
                  <div className="flex flex-wrap items-center gap-1.5 pb-1 select-none overflow-x-auto no-scrollbar">
                    {/* ESC Key (clears form input) */}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentCommand("");
                        setHistoryPointer(-1);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 active:bg-slate-800 transition-all font-mono text-[10.5px] cursor-pointer"
                    >
                      ESC
                    </button>

                    {/* TAB Key (performs autocomplete helper) */}
                    <button
                      type="button"
                      onClick={handleTabComplete}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-bold active:bg-slate-800 transition-all font-mono text-[10.5px] cursor-pointer"
                    >
                      TAB ⇥
                    </button>

                    {/* CTRL-C Key (simulates interrupt) */}
                    <button
                      type="button"
                      onClick={() => handleCtrlAction("C")}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 active:bg-slate-800 transition-all font-mono text-[10.5px] cursor-pointer"
                    >
                      CTRL-C
                    </button>

                    {/* CTRL-L Key (Clears buffer history) */}
                    <button
                      type="button"
                      onClick={() => handleCtrlAction("L")}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 active:bg-slate-800 transition-all font-mono text-[10.5px] cursor-pointer"
                    >
                      CTRL-L
                    </button>

                    {/* CTRL-Z Key (simulates stop) */}
                    <button
                      type="button"
                      onClick={() => handleCtrlAction("Z")}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-500 active:bg-slate-800 transition-all font-mono text-[10.5px] cursor-pointer"
                    >
                      CTRL-Z
                    </button>

                    {/* ALT Symbol Modifier */}
                    <button
                      type="button"
                      onClick={() => setCurrentCommand((prev) => prev + "/")}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[#00e5ff] active:bg-slate-800 transition-all font-mono text-[10.5px] cursor-pointer"
                    >
                      ALT (/)
                    </button>

                    {/* Parent Dir modifier */}
                    <button
                      type="button"
                      onClick={() => setCurrentCommand((prev) => prev + "../")}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 active:bg-slate-800 transition-all font-mono text-[10.5px] cursor-pointer"
                    >
                      ../
                    </button>

                    {/* Current Dir modifier */}
                    <button
                      type="button"
                      onClick={() => setCurrentCommand((prev) => prev + "./")}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-[#10b981]/15 text-slate-300 active:bg-slate-800 transition-all font-mono text-[10.5px] cursor-pointer"
                    >
                      ./
                    </button>

                    {/* History Recall Up Arrow */}
                    <button
                      type="button"
                      onClick={handleTerminalHistoryUp}
                      className="px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-900/35 text-indigo-400 font-extrabold active:bg-indigo-900/30 transition-all font-mono text-[10.5px] cursor-pointer leading-none"
                    >
                      ▲ (UP)
                    </button>

                    {/* History Recall Down Arrow */}
                    <button
                      type="button"
                      onClick={handleTerminalHistoryDown}
                      className="px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-900/35 text-indigo-400 font-extrabold active:bg-indigo-900/30 transition-all font-mono text-[10.5px] cursor-pointer leading-none"
                    >
                      ▼ (DOWN)
                    </button>
                  </div>
                </div>

                {/* Prompt Line Inputs form */}
                <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 bg-black border-t border-slate-900 p-3">
                  <span className="hidden sm:inline text-emerald-400 font-mono font-bold text-xs select-none shrink-0">
                    p4ch4r4t4r123@riset-vps:~$
                  </span>
                  <span className="inline sm:hidden text-emerald-400 font-mono font-bold text-xs select-none shrink-0">
                    $
                  </span>
                  <div className="flex-1 flex items-center relative gap-0.5">
                    <input
                      id="terminal-input"
                      type="text"
                      value={currentCommand}
                      onChange={(e) => {
                        setCurrentCommand(e.target.value);
                        setHistoryPointer(-1);
                      }}
                      placeholder="Ketik perintah di sini (cth: neofetch, systemctl, help)..."
                      className="w-full bg-transparent border-none outline-none font-mono text-slate-100 text-xs p-1"
                      disabled={isTerminalExecuting}
                      autoComplete="off"
                      autoFocus
                    />
                    {/* Custom simulated blinking caret when interactive */}
                    {!currentCommand && (
                      <span className="w-2 h-4 bg-emerald-500 absolute left-2 top-[3px] animate-pulse pointer-events-none opacity-80" />
                    )}
                  </div>
                  <button
                    id="run-cmd-btn"
                    type="submit"
                    className="p-1 px-3.5 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold font-mono text-[11px] uppercase shadow-md cursor-pointer transition-all shrink-0 flex items-center justify-center gap-1"
                  >
                    <span>KIRIM</span>
                    <Play size={10} className="fill-current text-white" />
                  </button>
                </form>
              </div>

              {/* Terminal tip helpful hints bar */}
              <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl flex items-center gap-3.5 text-xs text-slate-400 leading-relaxed font-sans">
                <HelpCircle size={22} className="text-emerald-400 shrink-0" />
                <p>
                  <strong className="text-slate-200">Panduan Asisten Seluler:</strong> Sentuh <code className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400">TAB</code> untuk melengkapi perintah otomatis, atau <code className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400">▲</code> dan <code className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400">▼</code> untuk memanggil kembali riwayat perintah yang pernah Anda jalankan!
                </p>
              </div>
            </motion.div>
          )}

          {/* --- MODULE 4: GIT REPOSITORY CONTROLLER --- */}
          {activeTab === "git" && (
            <motion.div
              key="git"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Module header */}
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-150 to-indigo-200 bg-clip-text text-transparent">
                  Pusat Repositori Git VPS
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Sinkronisasikan modifikasi sandbox kernel terpusat ke cloud provider Git Hub secara aman.
                </p>
              </div>

              {/* Warnings and messages */}
              {gitStatusMsg && (
                <div className="p-4 bg-slate-950/80 border border-indigo-900/30 text-indigo-300 text-xs font-mono rounded-2xl leading-relaxed flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    <span>{gitStatusMsg}</span>
                  </div>
                  <button
                    onClick={() => runGitAction("push")}
                    disabled={isGitActionLoading}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-sans font-bold text-white transition-all cursor-pointer flex items-center gap-1 shadow-md hover:-translate-y-0.5"
                  >
                    <ArrowUpRight size={12} /> Push Commits
                  </button>
                </div>
              )}

              {/* THREE COLUMN SUB PANEL DETAILS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column left 1: Git tools control */}
                <div className={`p-5 rounded-3xl border flex flex-col justify-between ${darkMode ? "glass-panel" : "bg-white border-slate-200"}`}>
                  <div className="space-y-5">
                    <h3 className="font-extrabold text-sm text-slate-200 pb-2 border-b border-slate-800/80">Kontrol Komit & Cabang</h3>

                    <div className="p-3 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-400 uppercase tracking-widest text-[9px] font-mono">cabang aktif</span>
                      <span className="text-sky-400 font-extrabold font-mono flex items-center gap-1.5">
                        <GitBranch size={13} /> {gitBranch}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Pesan Komit Baru (Commit Msg)</label>
                      <input
                        id="git-commit-msg"
                        type="text"
                        value={gitCommitMsg}
                        onChange={(e) => setGitCommitMsg(e.target.value)}
                        placeholder="feat: rute serverless backup scheduler baru"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-250 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <button
                      id="commit-btn"
                      onClick={() => {
                        if (!gitCommitMsg.trim()) {
                          alert("Pesan komit kosong!");
                          return;
                        }
                        runGitAction("commit", { message: gitCommitMsg });
                        setGitCommitMsg("");
                      }}
                      disabled={isGitActionLoading}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase cursor-pointer rounded-xl transition-all shadow-md active:translate-y-0 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={14} /> Commit Snapshot Sandbox
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-800/60 mt-4 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Remote: origin</span>
                    <span>Github Web Proxy Cert</span>
                  </div>
                </div>

                {/* Column right 2: Commits History timeline list */}
                <div className={`lg:col-span-2 p-5 rounded-3xl border ${darkMode ? "glass-panel" : "bg-white border-slate-200"}`}>
                  <h3 className="font-extrabold text-sm text-slate-200 mb-4 flex items-center gap-2 pb-2 border-b border-slate-800/80">
                    <Clock size={16} className="text-indigo-400 animate-spin" style={{ animationDuration: "15s" }} /> Linimasa Komit
                  </h3>

                  <div className="space-y-3.5 max-h-72 overflow-y-auto pr-2">
                    {gitCommits.map((cm, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-900/40 border border-slate-850 rounded-2xl flex items-start justify-between gap-4">
                        <div className="space-y-1 max-w-[80%]">
                          <div className="font-bold text-xs text-slate-200 whitespace-pre-wrap">{cm.message}</div>
                          <div className="text-[10px] text-slate-500 font-semibold font-mono flex items-center gap-1.5">
                            <span>Author: {cm.author}</span>
                            <span className="opacity-40">|</span>
                            <span>{new Date(cm.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                          {cm.hash}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- MODULE 5: SCHEDULE BACKUPS SNAPSHOT MANAGER --- */}
          {activeTab === "backups" && (
            <motion.div
              key="backups"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Module header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-150 to-indigo-200 bg-clip-text text-transparent">
                    Scheduled Backup & Snapshot Controller
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Kelola backup manual atau otomatis untuk sistem sandboxed server. Setiap file snapshot disimpan aman dalam ekstensi zip/tar.gz.
                  </p>
                </div>

                <button
                  id="backup-btn"
                  onClick={() => runBackupAction("createBackup")}
                  disabled={isBackupActionLoading}
                  className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase rounded-xl transition-all shadow-md active:translate-y-0 hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                >
                  {isBackupActionLoading ? <RefreshCw className="animate-spin" size={13} /> : <Database size={13} />}
                  <span>Jalankan Snapshot Manual</span>
                </button>
              </div>

              {/* Backup controller options layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel 1: Automator Schedule Controller */}
                <div className={`p-5 rounded-3xl border space-y-5 ${darkMode ? "glass-panel" : "bg-white border-slate-200"}`}>
                  <h3 className="font-extrabold text-sm text-slate-200 border-b border-slate-800 pb-2">Otomatisasi Cron Task</h3>

                  {/* Toggle Active status */}
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-200">Enabler Snap Cron</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Siklus backup otomatis berjalan</div>
                    </div>
                    <button
                      onClick={() => runBackupAction("toggleSchedule")}
                      className={`px-3 py-1.5 rounded-xl font-bold uppercase font-mono text-[10px] cursor-pointer transition-all ${
                        backupScheduleEnabled
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {backupScheduleEnabled ? "AKTIF" : "NONAKTIF"}
                    </button>
                  </div>

                  {/* Schedule Interval Selection dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest">Siklus Penjadwalan</label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {["Hourly", "Daily (02:00)", "Weekly"].map((intvl) => (
                        <button
                          key={intvl}
                          onClick={() => runBackupAction("updateInterval", { interval: intvl })}
                          className={`p-2.5 rounded-xl border font-bold text-[10px] cursor-pointer transition-all ${
                            scheduleInterval === intvl
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-400"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {intvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 border border-indigo-900/10 rounded-2xl text-[10px] text-slate-400 leading-relaxed font-sans flex items-start gap-2.5">
                    <ShieldCheck size={18} className="text-indigo-400 shrink-0" />
                    <p>Penyimpanan otomatis akan diarsipkan ke path lokal <code className="text-indigo-300 font-mono font-bold">./sandbox_vps/backups/</code> pada setiap siklus {scheduleInterval} secara asinkron tanpa membebani thread utama server.</p>
                  </div>
                </div>

                {/* Panel 2: Backup Snapshot Gzip history files table */}
                <div className={`lg:col-span-2 p-5 rounded-3xl border ${darkMode ? "glass-panel" : "bg-white border-slate-200"}`}>
                  <h3 className="font-extrabold text-sm text-slate-200 mb-4 pb-2 border-b border-slate-800">Arsip Snapshot Cadangan ({backupRecords.length})</h3>

                  <div className="space-y-3.5 max-h-72 overflow-y-auto pr-2">
                    {backupRecords.length === 0 ? (
                      <div className="h-44 flex flex-col items-center justify-center gap-2">
                        <Database className="text-slate-700" size={32} />
                        <span className="text-xs text-slate-400 text-center uppercase font-mono">Belum ada snapshot cadangan. Klik tombol pemicu utama di kanan atas.</span>
                      </div>
                    ) : (
                      backupRecords.map((item, key) => (
                        <div key={key} className="p-3 bg-slate-900/30 border border-slate-900 rounded-2xl flex items-center justify-between gap-4">
                          <div className="space-y-1 max-w-[70%]">
                            <div className="font-bold text-xs text-indigo-300 truncate font-mono">{item.filename}</div>
                            <div className="text-[10px] text-slate-500 font-semibold font-mono flex items-center gap-2">
                              <span>Ukuran: {(item.size / 1024).toFixed(1)} KB</span>
                              <span className="opacity-40">|</span>
                              <span>Dibuat: {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}</span>
                              <span className="opacity-40">|</span>
                              <span className="text-emerald-400 font-bold uppercase">{item.scheduleType}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => deleteBackupRecord(item.id)}
                              className="p-2 hover:bg-rose-500/10 rounded-xl text-rose-450 transition-all cursor-pointer border border-transparent hover:border-rose-500/20"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- MODULE 6: DEVOPS AI COPILOT ADVISOR --- */}
          {activeTab === "ai" && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Module Header */}
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-150 to-indigo-200 bg-clip-text text-transparent">
                  Asisten DevOps AI Copilot
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Kecerdasan buatan serverless ditenagai model Gemini untuk optimasi Ubuntu, review file konfigurasi, penulisan bash shell scripts, dan clusterisasi PM2.
                </p>
              </div>

              {/* Double grid setup for AI: Advisor chat sheet & quick suggestion blocks */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left 3 columns: Chat conversation */}
                <div className={`lg:col-span-3 p-4 md:p-6 rounded-3xl border flex flex-col justify-between min-h-[380px] md:min-h-[460px] relative ${darkMode ? "glass-panel" : "bg-white border-slate-200"}`}>
                  <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

                  {/* Top bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4 z-10">
                    <div className="flex items-center gap-2">
                      <BrainCircuit size={17} className="text-rose-400 animate-pulse" />
                      <div>
                        <span className="font-extrabold text-xs text-slate-200">RiSET AI Copilot Engine</span>
                        <span className="text-[9px] text-emerald-400 ml-2 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">ONLINE</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">Google Gemini-3.5-Flash</span>
                  </div>

                  {/* Message Histories */}
                  <div className="space-y-4 flex-1 overflow-y-auto max-h-[340px] pr-2 z-10 align-bottom leading-relaxed mb-4">
                    {aiChatHistory.map((chat, idx) => {
                      const isAi = chat.sender === "ai";
                      return (
                        <div key={idx} className={`flex ${isAi ? "justify-start" : "justify-end"}`}>
                          <div
                            className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed whitespace-pre-wrap select-text ${
                              isAi
                                ? darkMode
                                  ? "bg-slate-900/60 border border-slate-850 text-slate-200"
                                  : "bg-slate-100 border border-slate-150 text-slate-900"
                                : "bg-indigo-600 border border-indigo-500 text-white shadow-md shadow-indigo-500/10"
                            }`}
                          >
                            <span className="block font-bold text-[10px] uppercase font-mono mb-1 text-indigo-400/80">
                              {isAi ? "🤖 RiSET AI Companion" : "👤 Admin Operator"}
                            </span>
                            <span className="font-mono">{chat.text}</span>
                          </div>
                        </div>
                      );
                    })}
                    {isAiLoading && (
                      <div className="flex justify-start">
                        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-850 text-xs text-slate-400 font-mono animate-pulse flex items-center gap-2">
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Menganalisis sistem dan memproses query DevOps Anda...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input form panel */}
                  <form onSubmit={handleAiMessageSubmit} className="flex gap-2.5 pt-3 border-t border-slate-800/80 z-10 shrink-0">
                    <input
                      id="ai-message-input"
                      type="text"
                      value={aiInputMessage}
                      onChange={(e) => setAiInputMessage(e.target.value)}
                      placeholder="Masukkan pertanyaan DevOps (cth: Bagaimana caraku menambahkan SSL LetsEncrypt Nginx?)..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/20 font-mono"
                    />
                    <button
                      id="submit-ai-btn"
                      type="submit"
                      disabled={isAiLoading || !aiInputMessage.trim()}
                      className="px-5 py-3.5 bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-inner cursor-pointer transition-all flex items-center justify-center"
                    >
                      Kirim
                    </button>
                  </form>
                </div>

                {/* Right col 1: quick templates suggestions */}
                <div className="lg:col-span-1 flex flex-col gap-3.5 font-sans">
                  <h3 className="font-extrabold text-[10px] text-slate-450 uppercase tracking-widest leading-none mb-1">
                    ⚡ Shortcut DevOps Unggulan
                  </h3>

                  {[
                    { title: "Pasang SSL Let's Encrypt", prompt: "Beritahu saya kode shell setup Python Certbot di Ubuntu VPS agar ssl domain tersertifikasi otomatis" },
                    { title: "Optimasi PM2 Engine", prompt: "Berikan saya panduan lengkap PM2 clusterizer untuk menjalankan file app.js vps pada port 3000 secara background" },
                    { title: "Tingkatkan Proteksi Firewall IP", prompt: "Bagaimana cara menyalakan program UFW firewall dan fail2ban di Ubuntu untuk memblokir brute force login pada port 22?" },
                    { title: "Bongkar Log Error Nginx", prompt: "Nginx web controller saya mengembalikan 502 Bad Gateway. Langkah detail apa saja yang harus saya kerjakan di sisi server?" },
                  ].map((tpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAiInputMessage(tpl.prompt)}
                      className={`p-3 rounded-2xl border text-left transition-all hover:scale-[1.02] cursor-pointer hover:border-slate-700 ${
                        darkMode ? "bg-slate-950/60 border-slate-850 hover:bg-slate-900" : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="font-bold text-xs text-indigo-400 truncate mb-1">
                        {tpl.title}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate leading-relaxed">
                        Prompt: {tpl.prompt}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 3. OBJECT CREATION MODAL ENCLOSURE (FILE MANAGER POPUP) */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-4">
                <h3 className="font-extrabold text-sm text-slate-200">Tambahkan Objek Sistem Sandbox</h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 hover:bg-slate-900 text-slate-500 hover:text-white rounded-lg cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateObject} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest">Kategori Objek</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCreateType("file")}
                      className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        createType === "file"
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-400"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      Dokumen / Berkas Teks
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreateType("folder")}
                      className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        createType === "folder"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-400"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      Folder Baru
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest">Nama Berkas / Folder</label>
                  <input
                    id="new-object-name"
                    type="text"
                    value={newObjectName}
                    onChange={(e) => setNewObjectName(e.target.value)}
                    placeholder={createType === "file" ? "contoh: index.html" : "contoh: assets"}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-indigo-500 font-mono"
                    required
                    autoFocus
                  />
                </div>

                <button
                  id="confirm-create-btn"
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase cursor-pointer rounded-xl transition-all shadow-md active:translate-y-0 hover:-translate-y-0.5"
                >
                  Buat Objek
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
