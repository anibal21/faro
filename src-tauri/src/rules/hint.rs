//! Local stack auto-hint (no network / no LLM).

/// Returns `(pack_id, reason)` where reason is `jvm_markers` | `node_markers` | `default`.
pub fn auto_hint(text: &str, source_hint: Option<&str>) -> (String, &'static str) {
    let mut hay = text.to_lowercase();
    if let Some(s) = source_hint {
        hay.push(' ');
        hay.push_str(&s.to_lowercase());
    }

    let jvm_markers = [
        "java.lang",
        "nullpointerexception",
        "\tat ",
        "org.springframework",
        ".exception",
        "caused by:",
    ];
    let node_markers = [
        "unhandledpromiserejection",
        "node:internal",
        "at object.",
        "typeerror:",
        "enoent",
        "express",
    ];

    let jvm_score = jvm_markers
        .iter()
        .filter(|m| hay.contains(*m))
        .count();
    let node_score = node_markers
        .iter()
        .filter(|m| hay.contains(*m))
        .count();

    if jvm_score > node_score {
        ("springboot".into(), "jvm_markers")
    } else if node_score > jvm_score {
        ("nodejs".into(), "node_markers")
    } else {
        ("springboot".into(), "default")
    }
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
    fn node_text_hints_nodejs() {
        let text = "UnhandledPromiseRejectionWarning: TypeError: Cannot read\n    at Object.<anonymous>";
        let (id, reason) = auto_hint(text, None);
        assert_eq!(id, "nodejs");
        assert_eq!(reason, "node_markers");
    }

    #[test]
    fn ambiguous_defaults_to_springboot() {
        let (id, reason) = auto_hint("INFO something fine", None);
        assert_eq!(id, "springboot");
        assert_eq!(reason, "default");
    }
}
