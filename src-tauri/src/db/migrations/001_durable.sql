-- Durable tier (survives restart / splash purge)
CREATE TABLE IF NOT EXISTS schema_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS connection_instance (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  bastion_host TEXT NOT NULL,
  ssh_port INTEGER NOT NULL DEFAULT 22,
  ssh_user TEXT NOT NULL,
  pem_path TEXT NOT NULL,
  iam_credentials_path TEXT NOT NULL,
  region_name TEXT NOT NULL,
  cluster_name TEXT NOT NULL,
  namespace_default TEXT,
  sort_order INTEGER,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ui_preferences (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS analysis_finding_history (
  id TEXT PRIMARY KEY NOT NULL,
  connection_instance_id TEXT NOT NULL,
  namespace TEXT,
  artifact_name TEXT,
  artifact_kind TEXT,
  severity TEXT,
  rule_id TEXT,
  explanation_summary TEXT,
  recommendation_summary TEXT,
  created_at TEXT,
  FOREIGN KEY (connection_instance_id) REFERENCES connection_instance(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO schema_meta (key, value) VALUES ('schema_version', '1');
