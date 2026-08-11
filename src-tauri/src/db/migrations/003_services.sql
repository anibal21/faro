-- 011: cached Services for catalog navigation (session-tier)

CREATE TABLE IF NOT EXISTS cached_service (
  id TEXT PRIMARY KEY,
  connection_instance_id TEXT NOT NULL,
  catalog_epoch TEXT NOT NULL,
  namespace TEXT NOT NULL,
  name TEXT NOT NULL,
  service_type TEXT,
  cluster_ip TEXT,
  ports_json TEXT,
  selector_json TEXT,
  fetched_at TEXT NOT NULL,
  FOREIGN KEY (connection_instance_id) REFERENCES connection_instance(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cached_service_instance
  ON cached_service(connection_instance_id);
