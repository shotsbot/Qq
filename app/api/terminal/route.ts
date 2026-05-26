import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

const SANDBOX_ROOT = path.resolve("./sandbox_vps");

function ensureSandboxExists() {
  if (!fs.existsSync(SANDBOX_ROOT)) {
    fs.mkdirSync(SANDBOX_ROOT, { recursive: true });
  }
}

export async function POST(req: Request) {
  try {
    ensureSandboxExists();
    const { command, currentDir = "" } = await req.json();

    if (!command) {
      return NextResponse.json({ success: false, error: "Command was empty" }, { status: 400 });
    }

    const trimmedCommand = command.trim();

    // Block highly dangerous or interactive blocking commands
    const blockList = ["rm -rf /", "nano ", "vim ", "vi ", "ssh ", "top", "htop", "wget ", "curl ", "ping "];
    const isBlocked = blockList.some((flag) => trimmedCommand.includes(flag));

    if (isBlocked) {
      return NextResponse.json({
        success: true,
        output: `bash: ${trimmedCommand}: Perintah diblokir demi keamanan Sandbox. Perintah interaktif (seperti nano, top, ping) atau destruktif global dinonaktifkan.`
      });
    }

    // Special terminal emulation cases
    if (trimmedCommand === "clear") {
      return NextResponse.json({ success: true, output: "CLEAR" });
    }

    if (trimmedCommand === "help") {
      return NextResponse.json({
        success: true,
        output: `Panduan Pintasan Terminal Ubuntu Control Panel RiSET VPS:
- ls            : Menampilkan file di direktori kerja
- pwd           : Menampilkan path direktori saat ini
- cat <file>    : Membaca isi file teks
- echo "teks"   : Menampilkan cetak teks atau menulis ke file (> file)
- mkdir <nama>  : Membuat folder baru
- touch <file>  : Membuat berkas teks kosong baru
- rm <berkas>   : Menghapus file
- git status    : Memeriksa repositori Git sandbox
- systemctl     : Menampilkan status virtual daemon (Emulasi)`
      });
    }

    // Custom emulated systemctl outputs
    if (trimmedCommand.startsWith("systemctl")) {
      return NextResponse.json({
        success: true,
        output: `● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since Tue 2026-05-26 10:00:23 UTC; 5h ago
   Main PID: 804 (nginx)
      Tasks: 4 (limit: 4915)
     Memory: 24.2M
        CPU: 124ms
     CGroup: /system.slice/nginx.service
             ├─804 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
             └─805 nginx: worker process

● uwsgi-vps.service - WSGI Daemon for Portal Backend Controller
     Loaded: loaded (/lib/systemd/system/uwsgi-vps.service; enabled)
     Active: active (running) since Tue 2026-05-26 10:00:25 UTC; 5h ago
   Main PID: 812 (node)
     Memory: 112.5M
   
SYSTEM STATUS: Semuanya berjalan optimal (Nginx, PM2, Node JS).`
      });
    }

    // Determine working path correctly under sandbox
    let executionPath = SANDBOX_ROOT;
    if (currentDir) {
      const resolved = path.resolve(SANDBOX_ROOT, currentDir);
      if (resolved.startsWith(SANDBOX_ROOT) && fs.existsSync(resolved)) {
        executionPath = resolved;
      }
    }

    // Run safe client commands internally
    return new Promise((resolve) => {
      // Execute command inside the sandbox directory
      exec(trimmedCommand, { cwd: executionPath }, (error, stdout, stderr) => {
        const output = stdout + stderr;
        
        let customOutput = output;
        if (error) {
          customOutput = output || `bash: error running command: ${error.message}`;
        }

        // Return path metadata to help frontend track working directory
        resolve(NextResponse.json({
          success: true,
          output: customOutput || `bash: ${trimmedCommand}: Perintah berhasil dieksekusi tanpa keluaran.`,
          currentDir: path.relative(SANDBOX_ROOT, executionPath)
        }));
      });
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
