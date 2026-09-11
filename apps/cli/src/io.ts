import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { spawnSync } from "child_process";

export async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return "";
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf-8");
}

export function openEditor(initial: string, suffix = ".md"): string {
  const editor = process.env.EDITOR || process.env.VISUAL || "vi";
  const tmp = path.join(os.tmpdir(), `biji-${Date.now()}${suffix}`);
  fs.writeFileSync(tmp, initial);
  try {
    const r = spawnSync(editor, [tmp], { stdio: "inherit" });
    if (r.status !== 0) throw new Error(`editor exited with status ${r.status}`);
    return fs.readFileSync(tmp, "utf-8");
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }
}
