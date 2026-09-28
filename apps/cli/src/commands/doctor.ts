import { Command } from "commander";
import * as fs from "fs";
import { authStatus, FileAuthStorage, getUserInfo } from "@gitnapp/biji-client";
import { counts, isWorkerAlive, dbPath, logPath } from "@gitnapp/biji-queue";
import { formatAuthStatus } from "./auth.js";
import { allStatuses, resolveServerSpec } from "../mcp-targets.js";

type Level = "ok" | "warn" | "fail";

interface Check {
  name: string;
  level: Level;
  detail: string;
}

const ICON: Record<Level, string> = { ok: "✓", warn: "⚠", fail: "✗" };

async function runChecks(opts: { offline?: boolean }): Promise<Check[]> {
  const checks: Check[] = [];

  // 1. Runtime (node:sqlite, used by the queue, needs Node >=22.13)
  if (process.versions.bun) {
    checks.push({ name: "Runtime", level: "ok", detail: `standalone binary (${process.execPath})` });
  } else {
    const [major, minor] = process.versions.node.split(".").map(Number);
    const okVer = major > 22 || (major === 22 && minor >= 13);
    checks.push({
      name: "Node.js",
      level: okVer ? "ok" : "warn",
      detail: `v${process.versions.node}${okVer ? "" : " (queue needs >=22.13)"}`,
    });
  }

  // 2. MCP server command
  const spec = resolveServerSpec();
  checks.push({ name: "MCP server", level: "ok", detail: [spec.command, ...spec.args].join(" ") });

  // 3. Auth credentials
  const s = formatAuthStatus();
  const status = authStatus();
  const authed = status.authenticated;
  if (!authed) {
    checks.push({ name: "Auth", level: "fail", detail: "not authenticated — run `biji auth login`" });
  } else {
    const refreshExpired = status.has_refresh_token && (status.refresh_expire_in_seconds ?? 0) < 0;
    const jwtExpired = (status.jwt_expire_in_seconds ?? 0) < 0;
    const first = s.split("\n").slice(1).join(" · ").replace(/\s+/g, " ");
    checks.push({
      name: "Auth",
      level: refreshExpired ? "fail" : jwtExpired ? "warn" : "ok",
      detail: refreshExpired ? `refresh token expired — re-login. (${first})` : first,
    });
  }

  // 4. Auth file permissions
  const authFile = new FileAuthStorage().file;
  if (fs.existsSync(authFile)) {
    const mode = fs.statSync(authFile).mode & 0o777;
    const secure = mode === 0o600;
    checks.push({
      name: "Auth file",
      level: secure ? "ok" : "warn",
      detail: `${authFile} (mode ${mode.toString(8).padStart(3, "0")}${secure ? "" : " — expected 600"})`,
    });
  } else {
    checks.push({ name: "Auth file", level: authed ? "warn" : "warn", detail: `${authFile} not found (using env vars?)` });
  }

  // 5. Live API check (skippable)
  if (!opts.offline && authed) {
    try {
      const info = await getUserInfo();
      const uid = info?.c?.data?.uid;
      checks.push({ name: "API reach", level: "ok", detail: uid ? `ok (uid=${uid})` : "ok" });
    } catch (err) {
      checks.push({ name: "API reach", level: "fail", detail: `request failed: ${(err as Error).message}` });
    }
  } else if (opts.offline) {
    checks.push({ name: "API reach", level: "warn", detail: "skipped (--offline)" });
  }

  // 6. Queue
  try {
    const alive = isWorkerAlive();
    const c = counts();
    const failedNote = c.failed > 0 ? ` — ${c.failed} failed (\`biji queue list --status failed\`)` : "";
    checks.push({
      name: "Queue",
      level: c.failed > 0 ? "warn" : "ok",
      detail: `worker ${alive.alive ? `running (pid=${alive.pid})` : "idle"}; pending=${c.pending} running=${c.running} done=${c.done} failed=${c.failed}${failedNote}`,
    });
    checks.push({ name: "Queue db", level: "ok", detail: `${dbPath()} · log ${logPath()}` });
  } catch (err) {
    checks.push({ name: "Queue", level: "warn", detail: `unavailable: ${(err as Error).message}` });
  }

  // 7. MCP integrations
  const statuses = allStatuses();
  const configured = statuses.filter((r) => r.configured).map((r) => r.target.id);
  checks.push({
    name: "MCP clients",
    level: configured.length ? "ok" : "warn",
    detail: configured.length
      ? `configured in: ${configured.join(", ")}`
      : "none configured — run `biji setup add <tool>`",
  });

  return checks;
}

export function registerDoctorCommand(program: Command): void {
  program
    .command("doctor")
    .description("Diagnose install, auth, queue, and MCP-client configuration")
    .option("--offline", "skip the live API reachability check")
    .option("--json", "JSON output (exit 1 if any check fails)")
    .action(async (opts: { offline?: boolean; json?: boolean }) => {
      const checks = await runChecks(opts);
      const failed = checks.filter((c) => c.level === "fail").length;
      const warned = checks.filter((c) => c.level === "warn").length;

      if (opts.json) {
        console.log(JSON.stringify({ ok: failed === 0, failed, warned, checks }, null, 2));
        process.exit(failed === 0 ? 0 : 1);
      }

      console.log("biji doctor\n");
      for (const c of checks) {
        console.log(`  ${ICON[c.level]} ${c.name.padEnd(12)} ${c.detail}`);
      }
      const summary = failed
        ? `\n${failed} failed, ${warned} warning(s). Fix the ✗ items above.`
        : warned
          ? `\nAll critical checks passed (${warned} warning(s)).`
          : "\nAll checks passed. 🎉";
      console.log(summary);
      process.exit(failed === 0 ? 0 : 1);
    });
}
