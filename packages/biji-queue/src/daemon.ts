import { spawn } from "child_process";
import * as fs from "fs";
import { logPath, pidPath } from "./paths.js";

export interface AliveInfo {
  alive: boolean;
  pid?: number;
}

export function isWorkerAlive(): AliveInfo {
  const pf = pidPath();
  if (!fs.existsSync(pf)) return { alive: false };
  const raw = fs.readFileSync(pf, "utf-8").trim();
  const pid = Number(raw);
  if (!pid) return { alive: false };
  try {
    process.kill(pid, 0);
    return { alive: true, pid };
  } catch {
    return { alive: false, pid };
  }
}

/** argv[1] inside a `bun build --compile` executable: /$bunfs/… (POSIX) or B:\~BUN\… (Windows). */
const BUN_EMBEDDED_SCRIPT = /^(\/\$bunfs\/|[A-Za-z]:[\\/]~BUN[\\/])/;

/**
 * How to re-invoke the running `biji` program with extra arguments. Under Node
 * that is `node [execArgv] <script> ...args`; in the compiled single-file
 * binary the executable itself is the program, so it's just `<exe> ...args`.
 */
export function selfCommand(args: string[]): { command: string; args: string[] } {
  const script = process.argv[1];
  if (!script || BUN_EMBEDDED_SCRIPT.test(script)) return { command: process.execPath, args };
  return { command: process.execPath, args: [...process.execArgv, script, ...args] };
}

/**
 * Ensure a background worker is running. If one isn't, spawn a detached
 * `biji queue worker --daemon` child and immediately unref so the parent can
 * exit.
 */
export function ensureDaemon(): { pid: number; started: boolean } {
  const cur = isWorkerAlive();
  if (cur.alive && cur.pid !== undefined) return { pid: cur.pid, started: false };

  const cmd = selfCommand(["queue", "worker", "--daemon"]);
  const out = fs.openSync(logPath(), "a");
  const err = fs.openSync(logPath(), "a");
  const child = spawn(cmd.command, cmd.args, {
    detached: true,
    stdio: ["ignore", out, err],
    env: process.env,
  });
  child.unref();
  if (child.pid === undefined) throw new Error("failed to spawn worker daemon");
  fs.writeFileSync(pidPath(), String(child.pid));
  return { pid: child.pid, started: true };
}

export function writePid(pid: number): void {
  fs.writeFileSync(pidPath(), String(pid));
}

export function clearPid(): void {
  try { fs.unlinkSync(pidPath()); } catch { /* ignore */ }
}

export function stopDaemon(): { stopped: boolean; pid?: number } {
  const cur = isWorkerAlive();
  if (!cur.alive || cur.pid === undefined) {
    clearPid();
    return { stopped: false };
  }
  process.kill(cur.pid, "SIGTERM");
  return { stopped: true, pid: cur.pid };
}
