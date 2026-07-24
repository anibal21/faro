//! Catalog hydrate helpers (demo seed when live kube is unavailable).

use crate::db::session_cache;
use crate::error::FaroResult;
use rusqlite::Connection;
use uuid::Uuid;

/// Seed a realistic demo catalog into session tables for offline MVP demos.
pub fn hydrate_demo_catalog(
    conn: &Connection,
    instance_id: &str,
    catalog_epoch: &str,
) -> FaroResult<()> {
    session_cache::purge_for_instance(conn, instance_id)?;
    let ns_id = Uuid::new_v4().to_string();
    session_cache::insert_namespace(conn, &ns_id, instance_id, catalog_epoch, "default")?;

    let dep_api = Uuid::new_v4().to_string();
    session_cache::insert_deployment(
        conn,
        &dep_api,
        instance_id,
        catalog_epoch,
        "default",
        "payments-api",
        3,
        3,
        true,
    )?;
    session_cache::insert_pod(
        conn,
        &Uuid::new_v4().to_string(),
        &dep_api,
        "payments-api-7d9f8b-aaa",
        "Running",
        r#"["app"]"#,
    )?;
    session_cache::insert_pod(
        conn,
        &Uuid::new_v4().to_string(),
        &dep_api,
        "payments-api-7d9f8b-bbb",
        "Running",
        r#"["app"]"#,
    )?;

    let dep_worker = Uuid::new_v4().to_string();
    session_cache::insert_deployment(
        conn,
        &dep_worker,
        instance_id,
        catalog_epoch,
        "default",
        "payments-worker",
        1,
        1,
        true,
    )?;
    session_cache::insert_pod(
        conn,
        &Uuid::new_v4().to_string(),
        &dep_worker,
        "payments-worker-0",
        "Running",
        r#"["worker"]"#,
    )?;

    let cm_id = Uuid::new_v4().to_string();
    session_cache::insert_configmap(
        conn,
        &cm_id,
        instance_id,
        catalog_epoch,
        "default",
        "payments-config",
        2,
        true,
    )?;
    session_cache::insert_configmap_entry(
        conn,
        &Uuid::new_v4().to_string(),
        &cm_id,
        "application.yml",
        "server:\n  port: 8080\nspring:\n  profiles: active: prod\n",
        false,
        false,
        64,
    )?;
    session_cache::insert_configmap_entry(
        conn,
        &Uuid::new_v4().to_string(),
        &cm_id,
        "feature.flags",
        "payments.v2=true",
        false,
        false,
        16,
    )?;
    Ok(())
}

/// Prefer live kube later; for now always demo-hydrate after successful path validation.
pub fn hydrate_catalog(
    conn: &Connection,
    instance_id: &str,
    catalog_epoch: &str,
) -> FaroResult<()> {
    hydrate_demo_catalog(conn, instance_id, catalog_epoch)
}
