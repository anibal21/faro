-- Session tier (purged on splash / disconnect / exit)
CREATE TABLE IF NOT EXISTS connection_session (
  id TEXT PRIMARY KEY NOT NULL,
  connection_instance_id TEXT NOT NULL,
  status TEXT NOT NULL,
  connected_at TEXT,
  last_catalog_refresh_at TEXT,
  last_error_code TEXT,
  last_error_message TEXT,
  catalog_epoch TEXT NOT NULL,
  FOREIGN KEY (connection_instance_id) REFERENCES connection_instance(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cached_namespace (
  id TEXT PRIMARY KEY NOT NULL,
  connection_instance_id TEXT NOT NULL,
  catalog_epoch TEXT NOT NULL,
  name TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  UNIQUE (connection_instance_id, catalog_epoch, name),
  FOREIGN KEY (connection_instance_id) REFERENCES connection_instance(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cached_deployment (
  id TEXT PRIMARY KEY NOT NULL,
  connection_instance_id TEXT NOT NULL,
  catalog_epoch TEXT NOT NULL,
  namespace TEXT NOT NULL,
  name TEXT NOT NULL,
  replica_count INTEGER NOT NULL DEFAULT 0,
  ready_replicas INTEGER NOT NULL DEFAULT 0,
  available INTEGER NOT NULL DEFAULT 0,
  labels_json TEXT,
  fetched_at TEXT NOT NULL,
  UNIQUE (connection_instance_id, catalog_epoch, namespace, name),
  FOREIGN KEY (connection_instance_id) REFERENCES connection_instance(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cached_pod_replica (
  id TEXT PRIMARY KEY NOT NULL,
  cached_deployment_id TEXT NOT NULL,
  pod_name TEXT NOT NULL,
  phase TEXT,
  node_name TEXT,
  container_names_json TEXT,
  fetched_at TEXT NOT NULL,
  FOREIGN KEY (cached_deployment_id) REFERENCES cached_deployment(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cached_configmap (
  id TEXT PRIMARY KEY NOT NULL,
  connection_instance_id TEXT NOT NULL,
  catalog_epoch TEXT NOT NULL,
  namespace TEXT NOT NULL,
  name TEXT NOT NULL,
  key_count INTEGER NOT NULL DEFAULT 0,
  data_loaded INTEGER NOT NULL DEFAULT 0,
  fetched_at TEXT NOT NULL,
  UNIQUE (connection_instance_id, catalog_epoch, namespace, name),
  FOREIGN KEY (connection_instance_id) REFERENCES connection_instance(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cached_configmap_entry (
  id TEXT PRIMARY KEY NOT NULL,
  cached_configmap_id TEXT NOT NULL,
  key_name TEXT NOT NULL,
  value_text TEXT,
  is_truncated INTEGER NOT NULL DEFAULT 0,
  is_binary INTEGER NOT NULL DEFAULT 0,
  byte_length INTEGER,
  FOREIGN KEY (cached_configmap_id) REFERENCES cached_configmap(id) ON DELETE CASCADE
);
