import { Command } from "commander";
import * as fs from "fs";
import { createMarkdownNote } from "@gitnapp/biji-client";
import { readStdin, openEditor } from "../io.js";

export function registerWriteCommand(program: Command): void {
  program
    .command("write [content]")
    .description("Create a note. Source priority: arg > -f file > stdin > $EDITOR")
    .option("-f, --file <path>", "read content from a file")
    .option("-t, --title <title>", "note title (optional)")
    .option("--topic <topic_id>", "create note inside a topic")
    .option("--json", "output raw API response")
    .action(async (content: string | undefined, opts: { file?: string; title?: string; topic?: string; json?: boolean }) => {
      let body = content;
      if (!body && opts.file) body = fs.readFileSync(opts.file, "utf-8");
      if (!body) {
        const piped = await readStdin();
        if (piped.trim()) body = piped;
      }
      if (!body) body = openEditor("# \n\n");
      if (!body || !body.trim()) {
        console.error("No content provided.");
        process.exit(1);
      }
      const res = await createMarkdownNote({ content: body, title: opts.title, topic_id: opts.topic, tags: [] });
      if (opts.json) {
        console.log(JSON.stringify(res, null, 2));
        return;
      }
      const cRaw = res?.c as Record<string, unknown> | undefined;
      const note = ((cRaw?.data as Record<string, unknown> | undefined) ?? cRaw) as
        | { note_id?: string; prime_id?: string; title?: string }
        | undefined;
      if (!note?.note_id) {
        console.error("Create may have failed:", JSON.stringify(res).slice(0, 300));
        process.exit(1);
      }
      console.log(`Note created.`);
      console.log(`  id:    ${note.note_id}`);
      console.log(`  prime: ${note.prime_id ?? "—"}`);
      console.log(`  title: ${note.title || "(untitled)"}`);
    });
}
