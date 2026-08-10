mod commands;
mod db;
mod error;
mod k8s;
mod keepalive;
mod rules;
mod runtime;
mod ssh;

pub use error::{FaroError, FaroResult};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db = db::open_default().expect("failed to open Faro SQLite database");
    let runtime = runtime::RuntimeState::new();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(db)
        .manage(runtime)
        .invoke_handler(tauri::generate_handler![
            commands::session_purge_ephemeral,
            commands::prefs_get,
            commands::prefs_set,
            commands::env_list,
            commands::env_restore_demo,
            commands::env_upsert,
            commands::env_delete,
            commands::env_load,
            commands::env_set_active,
            commands::env_workspace_get,
            commands::env_connect,
            commands::env_disconnect,
            commands::env_focus,
            commands::env_connection_states,
            commands::env_set_keep_alive,
            commands::demo_fixture_paths,
            commands::k8s_list_deployments,
            commands::k8s_list_configmaps,
            commands::k8s_get_configmap,
            commands::k8s_get_deployment_yaml,
            commands::catalog_refresh,
            commands::logs_open,
            commands::logs_close,
            commands::logs_set_view,
            commands::logs_load_older,
            commands::analyze_write_group,
            commands::workload_summary,
            commands::export_write_text,
            commands::k8s_list_pods,
            commands::k8s_list_services,
            commands::k8s_get_service,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Faro");
}
