import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SANDBOX_ROOT = path.resolve("./sandbox_vps");

interface FileSearchResult {
  name: string;
  path: string;
  size: number;
  updatedAt: string;
  matchedContentLine?: string;
  isDirectory: boolean;
}

// Recursive directory walker
function walkDirectory(dir: string, results: FileSearchResult[]) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const fPath = path.join(dir, file);
    try {
      const stat = fs.statSync(fPath);
      const isDirectory = stat.isDirectory();
      
      results.push({
        name: file,
        path: path.relative(SANDBOX_ROOT, fPath),
        size: stat.size,
        updatedAt: stat.mtime.toISOString(),
        isDirectory,
      });

      if (isDirectory) {
        walkDirectory(fPath, results);
      }
    } catch {
      // Ignore reading errors for locked files
    }
  });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q") || ""; // Name matches
    const textQuery = url.searchParams.get("text") || ""; // Content matches
    const minSize = parseInt(url.searchParams.get("minSize") || "0", 10);
    const ext = url.searchParams.get("ext") || ""; // Extension lock

    const allFiles: FileSearchResult[] = [];
    walkDirectory(SANDBOX_ROOT, allFiles);

    // Apply multiple criteria filters!
    let filtered = allFiles;

    // Filter directory matches, we mostly want files for search queries
    if (ext || textQuery) {
      filtered = filtered.filter((f) => !f.isDirectory);
    }

    if (query) {
      const qLower = query.toLowerCase();
      filtered = filtered.filter((f) => f.name.toLowerCase().includes(qLower));
    }

    if (ext) {
      const dotExt = ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
      filtered = filtered.filter((f) => f.name.toLowerCase().endsWith(dotExt));
    }

    if (minSize > 0) {
      filtered = filtered.filter((f) => f.size >= minSize);
    }

    if (textQuery) {
      const term = textQuery.toLowerCase();
      filtered = filtered.filter((f) => {
        try {
          const absPath = path.join(SANDBOX_ROOT, f.path);
          const stat = fs.statSync(absPath);
          if (stat.isDirectory() || stat.size > 100000) return false; // Skip too large files or dirs

          const content = fs.readFileSync(absPath, "utf-8");
          const lines = content.split("\n");
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().includes(term)) {
              f.matchedContentLine = `Line ${i + 1}: ...${lines[i].trim().substring(0, 80)}...`;
              return true;
            }
          }
        } catch {
          // Unreadable file
        }
        return false;
      });
    }

    return NextResponse.json({
      success: true,
      results: filtered.slice(0, 50), // Cap at 50 results
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
