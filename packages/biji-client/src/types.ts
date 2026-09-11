export interface BijiResp<T = unknown> {
  h?: { c?: number; e?: string; s?: number; t?: number; apm?: string };
  c?: T;
  msg?: string;
  status_code?: number;
}

export interface NoteSummary {
  note_id: string;
  prime_id: string;
  title: string;
  content?: string;
  tags?: Array<{ id: string; name: string; type?: string }>;
  attachments?: unknown[];
  json_content?: string;
  note_type?: string;
  entry_type?: string;
  source?: string;
  version?: number;
  create_time?: number;
  update_time?: number;
  [k: string]: unknown;
}

export interface KbTopic {
  id: number;
  id_alias: string;
  name: string;
  description: string;
  scope: string;
  root_dir?: { id: number; name: string };
  last_update_time_desc?: string;
  extend_data?: { resource_count?: number; stats_info?: string };
}
