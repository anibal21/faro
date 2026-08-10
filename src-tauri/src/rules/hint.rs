//! Local stack auto-hint across five packs (no network / no LLM).

/// Returns `(pack_id, reason)`.
pub fn auto_hint(text: &str, source_hint: Option<&str>) -> (String, &'static str) {
    let mut hay = text.to_lowercase();
    if let Some(s) = source_hint {
        hay.push(' ');
        hay.push_str(&s.to_lowercase());
    }

    let springboot = score(
        &hay,
        &[
            "java.lang",
            "nullpointerexception",
            "\tat ",
            "org.springframework",
            "caused by:",
            "beancreationexception",
            "hikaridatapource",
        ],
    );
    let liquibase = score(
        &hay,
        &[
            "liquibase",
            "changelog lock",
            "waiting for changelog lock",
            "databasechangelog",
            "checksum validation",
            "validationfailedexception",
        ],
    );
    let nodejs = score(
        &hay,
        &[
            "unhandledpromiserejection",
            "node:internal",
            "at object.",
            "enoent",
            "econnrefused",
            "express",
            "nestjs",
        ],
    );
    let react = score(
        &hay,
        &[
            "minified react error",
            "chunkloaderror",
            "hydrat",
            "invalid hook call",
            "react-dom",
            "failed to fetch dynamically imported module",
        ],
    );
    let python = score(
        &hay,
        &[
            "traceback (most recent call last)",
            "modulenotfounderror",
            "django.",
            "fastapi",
            "uvicorn",
            "sqlalchemy",
            "psycopg",
            "flask.",
        ],
    );

    let scores = [
        ("liquibase", liquibase, "liquibase_markers"),
        ("react", react, "react_markers"),
        ("python", python, "python_markers"),
        ("nodejs", nodejs, "node_markers"),
        ("springboot", springboot, "jvm_markers"),
    ];

    let mut best_id = "springboot";
    let mut best_score = 0usize;
    let mut best_reason: &'static str = "default";
    for (id, sc, reason) in scores {
        if sc > best_score {
            best_score = sc;
            best_id = id;
            best_reason = reason;
        }
    }

    if best_score == 0 {
        ("springboot".into(), "default")
    } else {
        (best_id.into(), best_reason)
    }
}

fn score(hay: &str, markers: &[&str]) -> usize {
    markers.iter().filter(|m| hay.contains(*m)).count()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn jvm_text_hints_springboot() {
        let text = "java.lang.NullPointerException\n\tat com.example.Foo.bar";
        let (id, reason) = auto_hint(text, None);
        assert_eq!(id, "springboot");
        assert_eq!(reason, "jvm_markers");
    }

    #[test]
    fn liquibase_lock_hints_liquibase() {
        let text = "liquibase.exception.LockException: Waiting for changelog lock...";
        let (id, _) = auto_hint(text, None);
        assert_eq!(id, "liquibase");
    }

    #[test]
    fn node_text_hints_nodejs() {
        let text =
            "UnhandledPromiseRejectionWarning: TypeError: Cannot read\n    at Object.<anonymous>";
        let (id, _) = auto_hint(text, None);
        assert_eq!(id, "nodejs");
    }

    #[test]
    fn react_chunk_hints_react() {
        let text = "ChunkLoadError: Loading chunk 5 failed.\n(error: Failed to fetch)";
        let (id, _) = auto_hint(text, None);
        assert_eq!(id, "react");
    }

    #[test]
    fn python_traceback_hints_python() {
        let text = "Traceback (most recent call last):\n  File \"app.py\", line 1\nModuleNotFoundError: No module named 'x'";
        let (id, _) = auto_hint(text, None);
        assert_eq!(id, "python");
    }

    #[test]
    fn ambiguous_defaults_to_springboot() {
        let (id, reason) = auto_hint("INFO something fine", None);
        assert_eq!(id, "springboot");
        assert_eq!(reason, "default");
    }
}
