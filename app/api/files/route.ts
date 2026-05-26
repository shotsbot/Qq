import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Define the root sandbox folder
const SANDBOX_ROOT = path.resolve("./sandbox_vps");

// Helper to initialize standard sandboxed VPS files
function ensureSandboxInitialized() {
  if (!fs.existsSync(SANDBOX_ROOT)) {
    fs.mkdirSync(SANDBOX_ROOT, { recursive: true });
    
    // Seed default files for user to explore
    fs.writeFileSync(
      path.join(SANDBOX_ROOT, "nginx.conf"),
      `server {
    listen 80;
    server_name riset-devops.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    error_log /var/log/nginx/vps_error.log warn;
    access_log /var/log/nginx/vps_access.log main;
}`
    );

    fs.writeFileSync(
      path.join(SANDBOX_ROOT, "setup.sh"),
      `#!/bin/bash
echo "[INIT] Memulai instalasi lingkungan Ubuntu VPS..."
sudo apt update && sudo apt upgrade -y
sudo apt install nginx nodejs npm git -y

echo "[INIT] Mengonfigurasi firewall UFW..."
sudo ufw allow 'Nginx Full'
sudo ufw enable --force

echo "[INIT] Pemasangan selesai! Domain: riset-devops.com aktif."`
    );

    fs.writeFileSync(
      path.join(SANDBOX_ROOT, "app.js"),
      `const http = require('http');
const PORT = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: "ONLINE",
    message: "Aplikasi Node.js di VPS berjalan lancar!",
    systemTime: new Date().toISOString(),
    owner: "RiSET"
  }));
});

server.listen(PORT, () => {
  console.log(\`Server berjalan di http://localhost:\${PORT}\`);
});`
    );

    fs.mkdirSync(path.join(SANDBOX_ROOT, "backups"), { recursive: true });
    fs.mkdirSync(path.join(SANDBOX_ROOT, "logs"), { recursive: true });

    fs.writeFileSync(
      path.join(SANDBOX_ROOT, "logs", "syslog.log"),
      `2026-05-26 10:00:21 vps-kernel: Booting system from disk sda1...
2026-05-26 10:00:23 systemd[1]: Started LSB: Daemon for Nginx server.
2026-05-26 10:01:05 ughd[102]: Connected to serverless database provider.
2026-05-26 10:15:00 cron[824]: (root) CMD (tar -czf /backups/snap.tar.gz /sandbox_vps)
2026-05-26 12:44:11 sshd[1902]: Accepted publickey for RiSET from 192.168.1.107`
    );

    fs.writeFileSync(
      path.join(SANDBOX_ROOT, "ecosystem.config.js"),
      `module.exports = {
  apps: [{
    name: "vps-web-app",
    script: "./app.js",
    instances: "max",
    env: {
      NODE_ENV: "production",
    }
  }]
}`
    );
  }
}

// Safely solve directory traversal attacks
function getSafePath(relativePath: string): string {
  const resolved = path.join(SANDBOX_ROOT, relativePath || "");
  if (!resolved.startsWith(SANDBOX_ROOT)) {
    throw new Error("Akses dilarang: Direktori di luar sandbox.");
  }
  return resolved;
}

export async function GET(req: Request) {
  try {
    ensureSandboxInitialized();
    const url = new URL(req.url);
    const operation = url.searchParams.get("op") || "list"; // list, read
    const target = url.searchParams.get("path") || "";

    const safePath = getSafePath(target);

    // Read single file contents
    if (operation === "read") {
      if (!fs.existsSync(safePath)) {
        return NextResponse.json({ success: false, error: "File tidak ditemukan" }, { status: 404 });
      }
      const stat = fs.statSync(safePath);
      if (stat.isDirectory()) {
        return NextResponse.json({ success: false, error: "Path adalah sebuah direktori" }, { status: 400 });
      }
      const content = fs.readFileSync(safePath, "utf-8");
      return NextResponse.json({ success: true, content, size: stat.size, name: path.basename(safePath) });
    }

    // Default: List directories and files
    if (!fs.existsSync(safePath)) {
      return NextResponse.json({ success: false, error: "Direktori tidak ditemukan" }, { status: 404 });
    }

    const stat = fs.statSync(safePath);
    if (!stat.isDirectory()) {
      return NextResponse.json({ success: false, error: "Path adalah file, bukan direktori" }, { status: 400 });
    }

    const files = fs.readdirSync(safePath);
    const result = files.map((file) => {
      const fPath = path.join(safePath, file);
      const fStat = fs.statSync(fPath);
      return {
        name: file,
        path: path.relative(SANDBOX_ROOT, fPath),
        isDirectory: fStat.isDirectory(),
        size: fStat.size,
        updatedAt: fStat.mtime.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      currentPath: path.relative(SANDBOX_ROOT, safePath),
      files: result,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    ensureSandboxInitialized();
    const { op, path: targetPath, content, name, isFolder } = await req.json();

    // Check operators
    const safePath = getSafePath(targetPath);

    if (op === "create") {
      const newPath = path.join(safePath, name);
      const secureNewPath = getSafePath(path.relative(SANDBOX_ROOT, newPath));

      if (fs.existsSync(secureNewPath)) {
        return NextResponse.json({ success: false, error: "File/folder sudah ada!" }, { status: 400 });
      }

      if (isFolder) {
        fs.mkdirSync(secureNewPath, { recursive: true });
        return NextResponse.json({ success: true, message: "Folder berhasil dibuat." });
      } else {
        fs.writeFileSync(secureNewPath, content || "", "utf-8");
        return NextResponse.json({ success: true, message: "File berhasil dibuat." });
      }
    }

    if (op === "update") {
      if (!fs.existsSync(safePath)) {
        return NextResponse.json({ success: false, error: "File tidak ditemukan" }, { status: 404 });
      }
      fs.writeFileSync(safePath, content || "", "utf-8");
      return NextResponse.json({ success: true, message: "Konten file berhasil diperbarui." });
    }

    return NextResponse.json({ success: false, error: "Operasi tidak didefinisikan" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    ensureSandboxInitialized();
    const url = new URL(req.url);
    const target = url.searchParams.get("path") || "";
    
    if (!target) {
      return NextResponse.json({ success: false, error: "Path diperlukan" }, { status: 400 });
    }

    const safePath = getSafePath(target);

    if (!fs.existsSync(safePath)) {
      return NextResponse.json({ success: false, error: "File atau folder tidak ditemukan" }, { status: 404 });
    }

    const stat = fs.statSync(safePath);
    if (stat.isDirectory()) {
      fs.rmSync(safePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(safePath);
    }

    return NextResponse.json({ success: true, message: "File/folder berhasil dihapus." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
