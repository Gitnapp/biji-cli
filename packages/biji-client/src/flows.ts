import { createHash } from "crypto";
import * as fs from "fs";
import * as path from "path";
import {
  aiAnalyzeLink,
  getLocalAudioUploadToken,
  getLocalVideoUploadToken,
  listKbManagedTopics,
  listKbTopicResources,
  uploadMediaToOss,
  aiAnalyzeLocalAudio,
  aiAnalyzeLocalVideo,
  type AiAnalyzeLinkOptions,
  type LocalMediaKind,
  type LocalMediaTokenResponse,
} from "./api.js";
import { LEGACY_API, request, type SseOptions } from "./client.js";
import { markdownToTipTap } from "./markdown.js";
import type { BijiResp, NoteSummary } from "./types.js";

// ──────────────────── Knowledge Base ────────────────────

export async function resolveKbTopic(
  aliasOrId: string,
): Promise<{ topic_id: string; topic_directory_id: string; name: string }> {
  const res = await listKbManagedTopics(1, 50);
  const list = res?.c?.list;
  const t = list?.find((x) => x.id_alias === aliasOrId || String(x.id) === aliasOrId);
  if (!t) {
    const known = list?.map((x) => `${x.id_alias} (${x.name})`).join(", ") ?? "(none)";
    throw new Error(`KB topic not found: ${aliasOrId}\nAvailable: ${known}`);
  }
  return {
    topic_id: String(t.id),
    topic_directory_id: String(t.root_dir?.id ?? ""),
    name: t.name,
  };
}

/**
 * Map note_ids → resource_ids inside a topic. Resource IDs are the per-topic
 * binding ids that removeResourceFromTopic/moveResourceToTopic require;
 * users normally only know note_ids.
 */
export async function resolveNoteIdsToResourceIds(
  topicIdAlias: string,
  directoryId: number | string,
  noteIds: string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const want = new Set(noteIds);
  let page = 1;
  while (want.size > 0) {
    const res = await listKbTopicResources(topicIdAlias, directoryId, { page });
    const data = (res as { c?: { resources?: Array<{ id: number; resource_note_meta_data?: { id?: string } }>; has_next?: number } }).c;
    const items = data?.resources ?? [];
    for (const r of items) {
      const nid = r.resource_note_meta_data?.id;
      if (nid && want.has(nid)) {
        map.set(nid, r.id);
        want.delete(nid);
      }
    }
    if (!data?.has_next || items.length === 0) break;
    page += 1;
  }
  return map;
}

// ──────────────────── Notes ────────────────────

export interface CreateMarkdownNoteInput {
  content: string;
  title?: string;
  topic_id?: string;
  topic_directory_id?: string;
  /** Sent as-is when provided; omitted from the body otherwise. */
  tags?: string[];
}

export async function createMarkdownNote(input: CreateMarkdownNoteInput): Promise<BijiResp<NoteSummary>> {
  const body: Record<string, unknown> = {
    title: input.title ?? "",
    content: input.content,
    json_content: markdownToTipTap(input.content),
    entry_type: "manual",
    note_type: "plain_text",
    source: "web",
  };
  if (input.tags !== undefined) body.tags = input.tags;
  if (input.topic_id) body.topic_id = input.topic_id;
  if (input.topic_directory_id) body.topic_directory_id = input.topic_directory_id;
  const apiPath = input.topic_id ? "/voicenotes/web/topics/notes" : "/voicenotes/web/notes";
  return request<BijiResp<NoteSummary>>(LEGACY_API, apiPath, { method: "POST", body });
}

// ──────────────────── AI: Link Analysis ────────────────────

export interface AnalyzeLinkResult {
  note_id?: string;
  link_title?: string;
  title?: string;
  content: string;
  tags: string[];
  note_data?: Record<string, unknown>;
}

export interface AnalyzeLinkOptions extends SseOptions {
  /** Custom instruction passed through as the `content` field. */
  prompt?: string;
  /** Drop into a KB topic — numeric id in string form. */
  topic_id?: string;
  /** Directory id under the topic; pass the topic's `root_dir.id` for the root level. */
  topic_directory_id?: string;
}

export async function analyzeLink(url: string, options: AnalyzeLinkOptions = {}): Promise<AnalyzeLinkResult> {
  const sdkOptions: AiAnalyzeLinkOptions = {
    prompt: options.prompt,
    topic_id: options.topic_id,
    topic_directory_id: options.topic_directory_id,
    onChunk: options.onChunk,
  };
  const sse = await aiAnalyzeLink(url, sdkOptions);
  return {
    note_id: sse.noteInfo?.note_id,
    link_title: sse.noteInfo?.link_title,
    title: sse.noteInfo?.title,
    content: sse.content,
    tags: sse.noteInfo?.tags ?? [],
    note_data: sse.noteInfo?.noteData,
  };
}

// ──────────────────── Local Media Upload ────────────────────

const AUDIO_EXT = new Set([".mp3", ".m4a", ".aac", ".wav", ".ogg", ".flac", ".opus", ".webm"]);
const VIDEO_EXT = new Set([".mp4", ".mov", ".m4v", ".webm", ".mkv", ".avi"]);

export interface UploadLocalMediaOptions {
  /** Force the media kind. Auto-detected from file extension otherwise. */
  kind?: LocalMediaKind;
  /** Override duration in milliseconds. If omitted, defaults to 0 and biji will probe it server-side. */
  duration_ms?: number;
  prompt?: string;
  topic_id?: string;
  topic_directory_id?: string;
  /** "custom" (default) lets biji infer; some flows use named template ids. */
  prompt_template_id?: string;
  onChunk?: (text: string) => void;
}

export interface UploadLocalMediaResult {
  file_id: string;
  note_id?: string;
  title?: string;
  content: string;
  oss_url: string;
  kind: LocalMediaKind;
}

export async function uploadLocalMedia(
  filePath: string,
  opts: UploadLocalMediaOptions = {},
): Promise<UploadLocalMediaResult> {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) throw new Error(`file not found: ${abs}`);
  const buf = fs.readFileSync(abs);
  const ext = path.extname(abs).toLowerCase();
  const baseName = path.basename(abs);
  const kind: LocalMediaKind =
    opts.kind ?? (VIDEO_EXT.has(ext) ? "video" : AUDIO_EXT.has(ext) ? "audio" : "audio");
  const md5 = createHash("md5").update(buf).digest("base64");
  const type = ext.startsWith(".") ? ext.slice(1) : ext || (kind === "video" ? "mp4" : "mp3");

  const tokenReq = {
    duration_ms: opts.duration_ms ?? 0,
    local_name: baseName,
    md5,
    size_byte: buf.byteLength,
    type,
  };

  const tokenResp =
    kind === "video" ? await getLocalVideoUploadToken(tokenReq) : await getLocalAudioUploadToken(tokenReq);
  const token: LocalMediaTokenResponse | undefined = tokenResp.c;
  if (!token?.token_info) {
    throw new Error(`failed to obtain upload token: ${JSON.stringify(tokenResp).slice(0, 300)}`);
  }

  if (!token.is_uploaded) {
    await uploadMediaToOss(token.token_info, buf);
  }

  const sseOpts = {
    prompt: opts.prompt,
    topic_id: opts.topic_id,
    topic_directory_id: opts.topic_directory_id,
    prompt_template_id: opts.prompt_template_id,
    onChunk: opts.onChunk,
  };

  const sse =
    kind === "video"
      ? await aiAnalyzeLocalVideo(token, opts.duration_ms ?? 0, sseOpts)
      : await aiAnalyzeLocalAudio(token, opts.duration_ms ?? 0, sseOpts);

  return {
    file_id: token.file_id,
    note_id: sse.noteInfo?.note_id,
    title: sse.noteInfo?.title || sse.noteInfo?.link_title,
    content: sse.content,
    oss_url: token.token_info.get_url,
    kind,
  };
}
