import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as api from "@biji/client";
import { json } from "../respond.js";

export function register(server: McpServer): void {
  // ──────────────────── Notes Tools ────────────────────

  server.tool(
    "list_notes",
    "List notes with pagination",
    {
      page: z.number().optional().default(1).describe("Page number"),
      page_size: z.number().optional().default(20).describe("Items per page"),
    },
    async ({ page, page_size }) => {
      const res = await api.listNotes(page, page_size);
      return json(res);
    }
  );

  server.tool(
    "get_note",
    "Get a specific note by its ID",
    { note_id: z.string().describe("Note ID") },
    async ({ note_id }) => {
      const res = await api.getNote(note_id);
      return json(res);
    }
  );

  server.tool(
    "search_notes",
    "Search notes by keyword",
    {
      query: z.string().describe("Search keyword"),
      page: z.number().optional().default(1),
      page_size: z.number().optional().default(20),
    },
    async ({ query, page, page_size }) => {
      const res = await api.searchNotes(query, page, page_size);
      return json(res);
    }
  );

  server.tool(
    "search_knowledge_notes",
    "Search notes in knowledge base",
    {
      query: z.string().describe("Search keyword"),
      page: z.number().optional().default(1),
      page_size: z.number().optional().default(20),
    },
    async ({ query, page, page_size }) => {
      const res = await api.searchKnowledgeNotes(query, page, page_size);
      return json(res);
    }
  );

  server.tool("get_notes_count", "Get total notes count", {}, async () => {
    const res = await api.getNotesCount();
    return json(res);
  });

  server.tool("get_prompt_templates", "Get available AI prompt templates for notes", {}, async () => {
    const res = await api.getPromptTemplates();
    return json(res);
  });

  // ──────────────────── Recycle Bin Tools ────────────────────

  server.tool(
    "list_recycled_notes",
    "List notes in the recycle bin",
    { query: z.string().optional().describe("Search in recycle bin") },
    async ({ query }) => {
      const res = await api.searchRecycledNotes(query);
      return json(res);
    }
  );

  server.tool(
    "restore_recycled_notes",
    "Restore notes from recycle bin",
    { note_ids: z.array(z.string()).describe("Note prime_ids to restore") },
    async ({ note_ids }) => {
      const res = await api.recycleOpBatch(note_ids, "resume");
      return json(res);
    }
  );

  server.tool(
    "delete_recycled_notes",
    "Permanently delete notes from recycle bin",
    { note_ids: z.array(z.string()).describe("Note prime_ids to permanently delete") },
    async ({ note_ids }) => {
      const res = await api.recycleOpBatch(note_ids, "del");
      return json(res);
    }
  );

  server.tool("clear_recycle_bin", "Clear all notes in recycle bin", {}, async () => {
    const res = await api.recycleClear();
    return json(res);
  });

  // ──────────────────── Tags Tools ────────────────────

  server.tool(
    "list_tags",
    "List all tags",
    {
      page: z.number().optional().default(1),
      page_size: z.number().optional().default(100),
    },
    async ({ page, page_size }) => {
      const res = await api.listTags(page, page_size);
      return json(res);
    }
  );

  server.tool(
    "search_tags",
    "Search tags by keyword",
    { query: z.string().describe("Search keyword") },
    async ({ query }) => {
      const res = await api.searchTags(query);
      return json(res);
    }
  );

  server.tool(
    "get_tag_notes",
    "Get notes under a specific tag",
    {
      tag_id: z.string().describe("Tag ID"),
      page: z.number().optional().default(1),
      page_size: z.number().optional().default(20),
    },
    async ({ tag_id, page, page_size }) => {
      const res = await api.getTagNotes(tag_id, page, page_size);
      return json(res);
    }
  );

  server.tool(
    "create_tag",
    "Create a new tag",
    {
      name: z.string().describe("Tag name"),
      note_ids: z.array(z.string()).optional().describe("Note IDs to add to the tag"),
    },
    async ({ name, note_ids }) => {
      const res = await api.createTag(name, note_ids);
      return json(res);
    }
  );

  server.tool(
    "delete_tag",
    "Delete a tag",
    { tag_id: z.string().describe("Tag ID") },
    async ({ tag_id }) => {
      const res = await api.deleteTag(tag_id);
      return json(res);
    }
  );

  // ──────────────────── AI: Note Analysis ────────────────────

  server.tool(
    "get_note_link_details",
    "Get link details extracted from a note (AI-analyzed links within the note content)",
    { note_id: z.string().describe("Note ID") },
    async ({ note_id }) => {
      const res = await api.getNoteLinkDetails(note_id);
      return json(res);
    }
  );

  server.tool(
    "ai_generate_tags",
    "AI auto-generate tags for a note based on its content",
    {
      note_id: z.string().describe("Note ID"),
      content: z.string().optional().describe("Note content (optional, fetched from note if omitted)"),
      title: z.string().optional().describe("Note title (optional)"),
    },
    async ({ note_id, content, title }) => {
      const res = await api.generateNoteTags(note_id, content, title);
      return json(res);
    }
  );

  server.tool(
    "add_note_tags",
    "Add tags to a note",
    {
      note_id: z.string().describe("Note ID"),
      tags: z.array(z.string()).describe("Tag names to add"),
    },
    async ({ note_id, tags }) => {
      const res = await api.addNoteTags(note_id, tags);
      return json(res);
    }
  );

  server.tool(
    "remove_note_tag",
    "Remove a tag from a note",
    {
      note_id: z.string().describe("Note ID"),
      tag_id: z.string().describe("Tag ID to remove"),
    },
    async ({ note_id, tag_id }) => {
      const res = await api.removeNoteTag(note_id, tag_id);
      return json(res);
    }
  );

  server.tool(
    "get_related_notes",
    "Get AI-recommended related notes for a specific note",
    { note_id: z.string().describe("Note ID") },
    async ({ note_id }) => {
      const res = await api.getRelatedNotes(note_id);
      return json(res);
    }
  );

  server.tool(
    "get_note_original",
    "Get the original content of a note (before AI processing)",
    { note_id: z.string().describe("Note ID") },
    async ({ note_id }) => {
      const res = await api.getNoteOriginal(note_id);
      return json(res);
    }
  );

  server.tool(
    "create_note",
    "Create a new note",
    { params: z.record(z.string(), z.unknown()).describe("Note creation params (e.g. content, title, topic_id)") },
    async ({ params }) => {
      const res = await api.createNote(params);
      return json(res);
    }
  );

  server.tool(
    "create_note_in_topic",
    "Create a new note inside a specific topic",
    { params: z.record(z.string(), z.unknown()).describe("Note creation params including topic_id") },
    async ({ params }) => {
      const res = await api.createNoteInTopic(params);
      return json(res);
    }
  );

  server.tool(
    "create_note_stream",
    "Create a note with AI streaming (generates AI-enhanced note content)",
    { params: z.record(z.string(), z.unknown()).describe("Streaming note params (e.g. content, prompt_template_id)") },
    async ({ params }) => {
      const res = await api.createNoteStream(params);
      return json({ note_id: res.noteInfo?.note_id, title: res.noteInfo?.title || res.noteInfo?.noteData?.title, tags: res.noteInfo?.tags, ai_content: res.content, event_count: res.events.length });
    }
  );

  server.tool(
    "create_topic_note_stream",
    "Create a topic note with AI streaming",
    { params: z.record(z.string(), z.unknown()).describe("Streaming note params including topic_id") },
    async ({ params }) => {
      const res = await api.createTopicNoteStream(params);
      return json({ note_id: res.noteInfo?.note_id, title: res.noteInfo?.title || res.noteInfo?.noteData?.title, tags: res.noteInfo?.tags, ai_content: res.content, event_count: res.events.length });
    }
  );

  server.tool(
    "ai_analyze_link",
    "AI smart analysis of a URL — creates a note by analyzing the linked content (web article, social media post, etc.). Uses biji.com's AI to extract and summarize the content. To save into a KB topic instead of the default 'all notes' bucket, pass topic_id (and optionally topic_directory_id).",
    {
      url: z.string().describe("URL to analyze (e.g. article link, Xiaohongshu post, WeChat article)"),
      prompt: z.string().optional().describe("Custom AI instruction; sent as the `content` field"),
      topic_id: z.string().optional().describe("Numeric topic id (string form) to drop the note into"),
      topic_directory_id: z.string().optional().describe("Directory id under the topic; defaults to topic root if omitted"),
    },
    async ({ url, prompt, topic_id, topic_directory_id }) => {
      const res = await api.aiAnalyzeLink(url, { prompt, topic_id, topic_directory_id });
      return json({
        note_id: res.noteInfo?.note_id,
        link_title: res.noteInfo?.link_title,
        title: res.noteInfo?.title || res.noteInfo?.noteData?.title,
        tags: res.noteInfo?.tags,
        ai_content: res.content,
        event_count: res.events.length,
      });
    }
  );
}
