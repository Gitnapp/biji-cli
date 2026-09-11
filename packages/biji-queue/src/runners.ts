import { analyzeLink, resolveKbTopic, uploadLocalMedia } from "@biji/client";
import type { JobResult, LinkPayload, UploadPayload } from "./types.js";

/**
 * Resolve a KB topic alias (or numeric id-as-string) to the ids needed by the
 * note-creation endpoints. Cached for the lifetime of the worker process to
 * avoid hitting the topic-list endpoint on every job.
 */
const kbTopicCache = new Map<string, { topic_id: string; topic_directory_id: string }>();

async function cachedKbTopic(alias?: string): Promise<{ topic_id?: string; topic_directory_id?: string }> {
  if (!alias) return {};
  const hit = kbTopicCache.get(alias);
  if (hit) return hit;
  const meta = await resolveKbTopic(alias);
  const resolved = { topic_id: meta.topic_id, topic_directory_id: meta.topic_directory_id };
  kbTopicCache.set(alias, resolved);
  return resolved;
}

export async function runLinkJob(payload: LinkPayload): Promise<JobResult> {
  const meta = await cachedKbTopic(payload.topic_alias);
  const result = await analyzeLink(payload.url, {
    prompt: payload.prompt,
    topic_id: meta.topic_id,
    topic_directory_id: meta.topic_directory_id,
  });
  return {
    note_id: result.note_id,
    title: result.title,
    link_title: result.link_title,
    content_length: result.content.length,
  };
}

export async function runUploadJob(payload: UploadPayload): Promise<JobResult> {
  const meta = await cachedKbTopic(payload.topic_alias);
  const result = await uploadLocalMedia(payload.file, {
    kind: payload.kind,
    duration_ms: payload.duration_ms,
    prompt: payload.prompt,
    topic_id: meta.topic_id,
    topic_directory_id: meta.topic_directory_id,
  });
  return {
    note_id: result.note_id,
    title: result.title,
    content_length: result.content.length,
    oss_url: result.oss_url,
    file_id: result.file_id,
  };
}
