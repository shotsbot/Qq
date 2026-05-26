import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SANDBOX_ROOT = path.resolve("./sandbox_vps");
const GIT_META_FILE = path.join(SANDBOX_ROOT, ".git_simulation.json");

interface GitMeta {
  initialized: boolean;
  activeBranch: string;
  branches: string[];
  commits: {
    hash: string;
    message: string;
    author: string;
    date: string;
  }[];
  remotes: { name: string; url: string }[];
}

function getGitMeta(): GitMeta {
  if (!fs.existsSync(SANDBOX_ROOT)) {
    fs.mkdirSync(SANDBOX_ROOT, { recursive: true });
  }

  if (fs.existsSync(GIT_META_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(GIT_META_FILE, "utf-8"));
    } catch {
      // Re-create default
    }
  }

  const defaultMeta: GitMeta = {
    initialized: true,
    activeBranch: "main",
    branches: ["main", "dev-riset", "fix/nginx-routing"],
    remotes: [
      { name: "origin", url: "https://github.com/riset-id/ubuntu-vps-web-control.git" }
    ],
    commits: [
      {
        hash: "e9f029a1d",
        message: "feat: optimalisasi nginx routing & UFW autoflow",
        author: "RiSET Admin",
        date: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
      },
      {
        hash: "7fa120c91",
        message: "fix: ssl letsencrypt auto auto-renewal script",
        author: "DevOps Engineer",
        date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
      },
      {
        hash: "1bc78d3ef",
        message: "initial: setup repository",
        author: "RiSET Admin",
        date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
      }
    ]
  };

  fs.writeFileSync(GIT_META_FILE, JSON.stringify(defaultMeta, null, 2), "utf-8");
  return defaultMeta;
}

export async function GET() {
  try {
    const gitMeta = getGitMeta();
    return NextResponse.json({ success: true, ...gitMeta });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action, message, branch, remoteName, remoteUrl } = await req.json();
    const gitMeta = getGitMeta();

    if (action === "init") {
      gitMeta.initialized = true;
      fs.writeFileSync(GIT_META_FILE, JSON.stringify(gitMeta, null, 2), "utf-8");
      return NextResponse.json({ success: true, message: "Repositori git diinisialisasi secara lokal." });
    }

    if (action === "commit") {
      if (!message) {
        return NextResponse.json({ success: false, error: "Pesan komit tidak boleh kosong!" }, { status: 400 });
      }

      const newCommit = {
        hash: Math.random().toString(16).substring(4, 13),
        message,
        author: "RiSET Admin <admin@riset-ops.com>",
        date: new Date().toISOString()
      };

      gitMeta.commits.unshift(newCommit);
      fs.writeFileSync(GIT_META_FILE, JSON.stringify(gitMeta, null, 2), "utf-8");
      return NextResponse.json({ success: true, message: "Perubahan berhasil dikomit.", commit: newCommit });
    }

    if (action === "createBranch") {
      if (!branch) {
        return NextResponse.json({ success: false, error: "Nama cabang diperlukan" }, { status: 400 });
      }

      if (gitMeta.branches.includes(branch)) {
        return NextResponse.json({ success: false, error: "Cabang sudah ada!" }, { status: 400 });
      }

      gitMeta.branches.push(branch);
      gitMeta.activeBranch = branch;
      fs.writeFileSync(GIT_META_FILE, JSON.stringify(gitMeta, null, 2), "utf-8");
      return NextResponse.json({ success: true, message: `Cabang '${branch}' berhasil dibuat dan checkout.` });
    }

    if (action === "checkout") {
      if (!gitMeta.branches.includes(branch)) {
        return NextResponse.json({ success: false, error: "Cabang tidak ditemukan" }, { status: 404 });
      }

      gitMeta.activeBranch = branch;
      fs.writeFileSync(GIT_META_FILE, JSON.stringify(gitMeta, null, 2), "utf-8");
      return NextResponse.json({ success: true, message: `Beralih ke cabang '${branch}'.` });
    }

    if (action === "addRemote") {
      gitMeta.remotes.push({ name: remoteName || "origin", url: remoteUrl });
      fs.writeFileSync(GIT_META_FILE, JSON.stringify(gitMeta, null, 2), "utf-8");
      return NextResponse.json({ success: true, message: "Remote URL berhasil ditambahkan." });
    }

    if (action === "push") {
      return NextResponse.json({
        success: true,
        message: "Pushing commits to remote origin... Semuanya up-to-date di cloud deployment GitHub."
      });
    }

    return NextResponse.json({ success: false, error: "Tindakan Git tidak valid" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
