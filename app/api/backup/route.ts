import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SANDBOX_ROOT = path.resolve("./sandbox_vps");
const BACKUP_DIR = path.join(SANDBOX_ROOT, "backups");
const BACKUP_LOGS_FILE = path.join(SANDBOX_ROOT, "backups", "backup_history.json");

interface BackupRecord {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  status: "success" | "failed";
  scheduleType: "manual" | "scheduled";
}

// Memory database fallback for active state schedule
let isBackupScheduleEnabled = true;
let currentScheduleInterval = "Daily (02:00)";

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function getBackupRecords(): BackupRecord[] {
  ensureBackupDir();
  if (fs.existsSync(BACKUP_LOGS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(BACKUP_LOGS_FILE, "utf-8"));
    } catch {
      return [];
    }
  }

  // Pre-seed mock values
  const defaultRecords: BackupRecord[] = [
    {
      id: "snap-98a21",
      filename: "backup_default_nginx_conf_2026-05-25.zip",
      size: 15420,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: "success",
      scheduleType: "scheduled"
    },
    {
      id: "snap-12bc4",
      filename: "backup_vps_database_production_2026-05-24.zip",
      size: 472910,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "success",
      scheduleType: "scheduled"
    }
  ];
  fs.writeFileSync(BACKUP_LOGS_FILE, JSON.stringify(defaultRecords, null, 2), "utf-8");
  return defaultRecords;
}

export async function GET() {
  try {
    const records = getBackupRecords();
    return NextResponse.json({
      success: true,
      backupEnabled: isBackupScheduleEnabled,
      scheduleInterval: currentScheduleInterval,
      backups: records
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    ensureBackupDir();
    const { action, interval } = await req.json();

    if (action === "toggleSchedule") {
      isBackupScheduleEnabled = !isBackupScheduleEnabled;
      return NextResponse.json({ success: true, enabled: isBackupScheduleEnabled });
    }

    if (action === "updateInterval") {
      currentScheduleInterval = interval || "Daily (02:00)";
      return NextResponse.json({ success: true, interval: currentScheduleInterval });
    }

    if (action === "createBackup") {
      const records = getBackupRecords();
      const dateStr = new Date().toISOString().split("T")[0];
      const stamp = Math.floor(Math.random() * 10000);
      const filename = `backup_vps_snapshot_${dateStr}_${stamp}.zip`;
      
      // Simulate gzip size
      const randomSize = Math.floor(Math.random() * 2000000) + 100000;

      const newRecord: BackupRecord = {
        id: `snap-${Math.random().toString(36).substring(4, 9)}`,
        filename,
        size: randomSize,
        createdAt: new Date().toISOString(),
        status: "success",
        scheduleType: "manual"
      };

      records.unshift(newRecord);
      fs.writeFileSync(BACKUP_LOGS_FILE, JSON.stringify(records, null, 2), "utf-8");

      // Also physically create a mock blank file under backups representing this
      fs.writeFileSync(path.join(BACKUP_DIR, filename), "MOCK_VPS_GZIP_CONTENT_STREAM");

      return NextResponse.json({
        success: true,
        message: "Backup Snapshot VPS berhasil dibuat dan diarsipkan secara lokal.",
        newBackup: newRecord
      });
    }

    return NextResponse.json({ success: false, error: "Tindakan tidak valid" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    ensureBackupDir();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID Backup diperlukan" }, { status: 400 });
    }

    let records = getBackupRecords();
    const recordToDelete = records.find((r) => r.id === id);

    if (!recordToDelete) {
      return NextResponse.json({ success: false, error: "Backup tidak ditemukan" }, { status: 404 });
    }

    // Delete physically if matches
    const physicalPath = path.join(BACKUP_DIR, recordToDelete.filename);
    if (fs.existsSync(physicalPath)) {
      fs.unlinkSync(physicalPath);
    }

    records = records.filter((r) => r.id !== id);
    fs.writeFileSync(BACKUP_LOGS_FILE, JSON.stringify(records, null, 2), "utf-8");

    return NextResponse.json({ success: true, message: "Aktivitas cadangan dihilangkan dan dihapus fisik." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
