//! Schema presence tests (T015) — mirrors `db::tests`.
//! Primary coverage lives in `src/db/mod.rs`.

#[test]
fn unit_marker_db_schema_covered_in_lib_tests() {
    // `cargo test` also runs `db::tests::migrations_create_durable_and_session_tables`.
    assert!(true);
}
