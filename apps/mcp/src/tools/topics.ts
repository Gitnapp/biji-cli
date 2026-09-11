import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as api from "@biji/client";
import { json } from "../respond.js";

export function register(server: McpServer): void {
  // ──────────────────── Topics (Notebooks) Tools ────────────────────

  server.tool("list_topics", "List all topics/notebooks", {}, async () => {
    const res = await api.listTopics();
    return json(res);
  });

  server.tool(
    "list_my_topics",
    "List my topics/notebooks with pagination",
    {
      page: z.number().optional().default(1),
      page_size: z.number().optional().default(20),
    },
    async ({ page, page_size }) => {
      const res = await api.listMyTopics(page, page_size);
      return json(res);
    }
  );

  server.tool(
    "get_topic_detail",
    "Get topic/notebook detail by alias ID",
    { id_alias: z.string().describe("Topic alias ID") },
    async ({ id_alias }) => {
      const res = await api.getTopicDetail(id_alias);
      return json(res);
    }
  );

  server.tool(
    "create_topic",
    "Create a new topic/notebook",
    {
      name: z.string().describe("Topic name"),
      description: z.string().optional().describe("Topic description"),
    },
    async ({ name, description }) => {
      const res = await api.createTopic(name, description);
      return json(res);
    }
  );

  server.tool(
    "edit_topic",
    "Edit an existing topic/notebook",
    {
      id: z.string().describe("Topic ID"),
      name: z.string().describe("New topic name"),
      description: z.string().optional().describe("New description"),
    },
    async ({ id, name, description }) => {
      const res = await api.editTopic(id, name, description);
      return json(res);
    }
  );

  server.tool(
    "delete_topic",
    "Delete a topic/notebook",
    { id: z.string().describe("Topic ID") },
    async ({ id }) => {
      const res = await api.deleteTopic(id);
      return json(res);
    }
  );

  server.tool(
    "search_my_topics",
    "Search my topics by keyword",
    {
      query: z.string().describe("Search keyword"),
      page: z.number().optional().default(1),
      page_size: z.number().optional().default(20),
    },
    async ({ query, page, page_size }) => {
      const res = await api.searchMyTopics(query, page, page_size);
      return json(res);
    }
  );

  server.tool(
    "list_topic_resources",
    "List notes/resources in a topic",
    {
      topic_id_alias: z.string().describe("Topic alias ID"),
      page: z.number().optional().default(1),
      page_size: z.number().optional().default(20),
    },
    async ({ topic_id_alias, page, page_size }) => {
      const res = await api.listTopicResources(topic_id_alias, page, page_size);
      return json(res);
    }
  );

  server.tool(
    "get_topics_by_note",
    "Get which topics contain a specific note",
    { note_id: z.string().describe("Note ID") },
    async ({ note_id }) => {
      const res = await api.getTopicsByNote(note_id);
      return json(res);
    }
  );

  // ──────────────────── Topic Directories ────────────────────

  server.tool(
    "create_topic_directory",
    "Create a directory/folder inside a topic",
    {
      topic_id: z.string().describe("Topic ID"),
      name: z.string().describe("Directory name"),
      parent_id: z.string().optional().describe("Parent directory ID"),
    },
    async ({ topic_id, name, parent_id }) => {
      const res = await api.createTopicDirectory(topic_id, name, parent_id);
      return json(res);
    }
  );

  server.tool(
    "edit_topic_directory",
    "Rename a directory in a topic",
    {
      directory_id: z.string().describe("Directory ID"),
      name: z.string().describe("New directory name"),
    },
    async ({ directory_id, name }) => {
      const res = await api.editTopicDirectory(directory_id, name);
      return json(res);
    }
  );

  server.tool(
    "delete_topic_directory",
    "Delete a directory from a topic",
    { directory_id: z.string().describe("Directory ID") },
    async ({ directory_id }) => {
      const res = await api.deleteTopicDirectory(directory_id);
      return json(res);
    }
  );

  // ──────────────────── AI: Knowledge Base ────────────────────

  server.tool(
    "list_knowledge_books",
    "List books in the knowledge base",
    {
      page: z.number().optional().default(1),
      page_size: z.number().optional().default(20),
    },
    async ({ page, page_size }) => {
      const res = await api.listKnowledgeBooks(page, page_size);
      return json(res);
    }
  );

  server.tool(
    "search_knowledge_books",
    "Search books in the knowledge base",
    {
      query: z.string().describe("Search keyword"),
      page: z.number().optional().default(1),
      page_size: z.number().optional().default(20),
    },
    async ({ query, page, page_size }) => {
      const res = await api.searchKnowledgeBooks(query, page, page_size);
      return json(res);
    }
  );

  server.tool(
    "list_kb_managed_topics",
    "List the user-managed topics shown in the biji.com 知识库 sidebar. Each entry includes id_alias (used as topicIdAlias in other tools), root_dir.id (used as topic_directory_id), and stats.",
    {
      page: z.number().optional().default(1),
      size: z.number().optional().default(50),
    },
    async ({ page, size }) => {
      const res = await api.listKbManagedTopics(page, size);
      return json(res);
    }
  );

  server.tool(
    "list_kb_topic_resources",
    "List resources (notes/files) inside a KB topic directory. Pass the topic's root_dir.id from list_kb_managed_topics as directory_id for the root level.",
    {
      topic_id_alias: z.string().describe("Topic id_alias (e.g. 'pYLReLmJ') from list_kb_managed_topics"),
      directory_id: z.union([z.number(), z.string()]).describe("Directory id; use topic.root_dir.id for the root"),
      page: z.number().optional().default(1),
      sort: z.string().optional(),
      resource_type: z.number().optional(),
    },
    async ({ topic_id_alias, directory_id, page, sort, resource_type }) => {
      const res = await api.listKbTopicResources(topic_id_alias, directory_id, { page, sort, resourceType: resource_type });
      return json(res);
    }
  );

  server.tool(
    "add_note_to_kb",
    "Create a plain-text note inside a KB topic directory. Pass the topic's numeric id (not id_alias) and the directory id.",
    {
      topic_id: z.string().describe("Numeric topic id in string form (e.g. '3623874'); see list_kb_managed_topics → list[].id"),
      topic_directory_id: z.string().describe("Directory id under the topic; use topic.root_dir.id for the root"),
      content: z.string().describe("Note body. Markdown is converted to TipTap JSON on the server."),
      title: z.string().optional().describe("Note title; defaults to empty"),
      json_content: z.string().optional().describe("Pre-built TipTap JSON string; overrides default conversion if provided"),
    },
    async ({ topic_id, topic_directory_id, content, title, json_content }) => {
      const body: Record<string, unknown> = {
        title: title ?? "",
        content,
        json_content: json_content ?? api.markdownToTipTap(content),
        entry_type: "manual",
        note_type: "plain_text",
        source: "web",
        topic_id,
        topic_directory_id,
      };
      const res = await api.createNoteInTopic(body);
      return json(res);
    }
  );

  server.tool(
    "remove_resource_from_kb",
    "Remove (detach) a resource from a KB topic. The underlying note stays in 'all notes'. NOTE: use resource_id (numeric, from list_kb_topic_resources → resources[].id), NOT note_id.",
    {
      resource_id: z.union([z.string(), z.number()]).describe("Numeric resource_id from list_kb_topic_resources"),
      topic_id: z.union([z.string(), z.number()]).describe("Numeric topic id"),
    },
    async ({ resource_id, topic_id }) => {
      const res = await api.removeResourceFromTopic(resource_id, topic_id);
      return json(res);
    }
  );

  server.tool(
    "move_resource_between_kb_topics",
    "Move a resource from one KB topic to another. Pass resource_id (not note_id) from the source topic.",
    {
      resource_id: z.union([z.string(), z.number()]).describe("Numeric resource_id in the source topic"),
      from_topic_id: z.union([z.string(), z.number()]).describe("Source topic numeric id"),
      target_topic_id: z.union([z.string(), z.number()]).describe("Target topic numeric id"),
      target_topic_dir_id: z.union([z.string(), z.number()]).describe("Target directory id (use target topic's root_dir.id for root)"),
    },
    async ({ resource_id, from_topic_id, target_topic_id, target_topic_dir_id }) => {
      const res = await api.moveResourceToTopic(resource_id, from_topic_id, target_topic_id, target_topic_dir_id);
      return json(res);
    }
  );

  server.tool(
    "attach_notes_to_kb",
    "Attach one or more EXISTING notes to a KB topic directory. The notes stay in their original location and become a resource inside the topic.",
    {
      note_ids: z.array(z.string()).min(1).describe("Array of note_id values (from note.note_id, NOT prime_id)"),
      topic_id: z.string().describe("Numeric topic id in string form"),
      topic_directory_id: z.string().describe("Directory id under the topic; use topic.root_dir.id for the root"),
    },
    async ({ note_ids, topic_id, topic_directory_id }) => {
      const res = await api.importNotesToTopic(note_ids, topic_id, topic_directory_id);
      return json(res);
    }
  );

  server.tool(
    "analyze_link_to_kb",
    "AI-parse a URL into a structured note inside a KB topic (streams server-side, returns aggregated content).",
    {
      url: z.string().describe("URL to analyze"),
      topic_id: z.string().describe("Numeric topic id in string form"),
      topic_directory_id: z.string().describe("Directory id under the topic"),
      prompt: z.string().optional().describe("Custom AI instruction; sent as `content` field"),
    },
    async ({ url, topic_id, topic_directory_id, prompt }) => {
      const sse = await api.aiAnalyzeLink(url, { topic_id, topic_directory_id, prompt });
      return json({
        note_id: sse.noteInfo?.note_id,
        link_title: sse.noteInfo?.link_title,
        title: sse.noteInfo?.title,
        tags: sse.noteInfo?.tags,
        content: sse.content,
      });
    }
  );

  server.tool(
    "upload_local_media",
    "Upload a local audio or video file to biji, optionally into a KB topic. Runs the full 3-step flow (token → OSS PUT → AI SSE stream).",
    {
      file_path: z.string().describe("Absolute path to a local audio or video file"),
      kind: z.enum(["audio", "video"]).optional().describe("Force media kind; auto-detected from file extension otherwise"),
      duration_ms: z.number().optional().describe("Duration in milliseconds; biji probes server-side if 0"),
      topic_id: z.string().optional().describe("Numeric topic id; omit for non-KB upload"),
      topic_directory_id: z.string().optional().describe("Directory id under the topic"),
      prompt: z.string().optional().describe("Custom AI instruction"),
      prompt_template_id: z.string().optional().describe("Named prompt template (defaults to 'custom')"),
    },
    async ({ file_path, kind, duration_ms, topic_id, topic_directory_id, prompt, prompt_template_id }) => {
      const result = await api.uploadLocalMedia(file_path, {
        kind,
        duration_ms,
        topic_id,
        topic_directory_id,
        prompt,
        prompt_template_id,
      });
      return json({
        file_id: result.file_id,
        note_id: result.note_id,
        title: result.title,
        kind: result.kind,
        oss_url: result.oss_url,
        content: result.content,
      });
    }
  );
}
