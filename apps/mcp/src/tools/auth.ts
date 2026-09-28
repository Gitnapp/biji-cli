import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as api from "@gitnapp/biji-client";
import { json } from "../respond.js";

export function register(server: McpServer): void {
  // ──────────────────── Auth Tools ────────────────────

  server.tool(
    "set_token",
    "Set the Bearer token for API authentication (no auto-refresh). For long sessions, use set_auth instead.",
    { token: z.string().describe("Bearer token from biji.com") },
    async ({ token }) => {
      api.setToken(token);
      try {
        const info = await api.getUserInfo();
        return json(info);
      } catch {
        return { content: [{ type: "text", text: "Token set. Could not verify — please check if valid." }] };
      }
    }
  );

  server.tool(
    "set_auth",
    "Set full authentication with auto-refresh support. Provide all 4 values from browser localStorage (token, token_expire_at, refresh_token, refresh_token_expire_at). The refresh_token lasts ~90 days and the JWT will auto-refresh before each API call.",
    {
      token: z.string().describe("JWT from localStorage.getItem('token')"),
      token_expire_at: z.number().describe("Token expiry timestamp from localStorage.getItem('token_expire_at')"),
      refresh_token: z.string().describe("Refresh token from localStorage.getItem('refresh_token')"),
      refresh_token_expire_at: z.number().describe("Refresh token expiry from localStorage.getItem('refresh_token_expire_at')"),
    },
    async ({ token, token_expire_at, refresh_token, refresh_token_expire_at }) => {
      api.setAuth({ token, token_expire_at, refresh_token, refresh_token_expire_at });
      const now = Math.floor(Date.now() / 1000);
      const jwtRemain = token_expire_at - now;
      const refreshRemain = refresh_token_expire_at - now;
      try {
        const info = await api.getUserInfo();
        const uid = (info as Record<string, unknown>)?.c
          ? ((info as Record<string, Record<string, Record<string, unknown>>>).c.data.uid)
          : "unknown";
        return {
          content: [{
            type: "text",
            text: `Auth set for uid ${uid}.\nJWT expires in ${Math.floor(jwtRemain / 60)} min (auto-refresh enabled).\nRefresh token expires in ${Math.floor(refreshRemain / 86400)} days.`,
          }],
        };
      } catch {
        return {
          content: [{
            type: "text",
            text: `Auth set. JWT expires in ${Math.floor(jwtRemain / 60)} min, refresh token in ${Math.floor(refreshRemain / 86400)} days. Could not verify — check values.`,
          }],
        };
      }
    }
  );

  server.tool(
    "get_auth_status",
    "Check current authentication status (token expiry, refresh token expiry)",
    {},
    async () => {
      const auth = api.getAuth();
      const now = Math.floor(Date.now() / 1000);
      if (!auth.token) {
        return { content: [{ type: "text", text: "Not authenticated. Use set_token or set_auth." }] };
      }
      const jwtRemain = auth.token_expire_at ? auth.token_expire_at - now : -1;
      const refreshRemain = auth.refresh_token_expire_at ? auth.refresh_token_expire_at - now : -1;
      const lines = [
        `Token: ${auth.token.slice(0, 20)}...`,
        auth.token_expire_at ? `JWT expires in: ${Math.floor(jwtRemain / 60)} min${jwtRemain < 0 ? " (EXPIRED)" : ""}` : "JWT expiry: unknown (no auto-refresh)",
        auth.refresh_token ? `Refresh token: set (expires in ${Math.floor(refreshRemain / 86400)} days)` : "Refresh token: not set (no auto-refresh)",
        auth.refresh_token ? "Auto-refresh: enabled" : "Auto-refresh: disabled",
      ];
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  server.tool(
    "send_sms_code",
    "Send SMS verification code to phone number for login",
    {
      phone: z.string().describe("Phone number (e.g. 13800138000)"),
      captcha_token: z.string().optional().describe("Captcha token if required"),
    },
    async ({ phone, captcha_token }) => {
      const res = await api.sendSmsCode(phone, captcha_token);
      return json(res);
    }
  );

  server.tool(
    "login_with_sms",
    "Login with phone number and SMS verification code",
    {
      phone: z.string().describe("Phone number"),
      smscode: z.string().describe("SMS verification code"),
    },
    async ({ phone, smscode }) => {
      const res = await api.loginWithSms(phone, smscode);
      return json(res);
    }
  );

  // ──────────────────── User Tools ────────────────────

  server.tool("get_user_info", "Get current logged-in user information", {}, async () => {
    const res = await api.getUserInfo();
    return json(res);
  });
}
