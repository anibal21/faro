//! Literal signal snippet extraction from log text (no LLM).

const MAX_SNIPPET_CHARS: usize = 2048;

fn is_primary_line(line: &str) -> bool {
    let lower = line.to_lowercase();
    if lower.contains("caused by:") {
        return true;
    }
    if lower.contains("traceback (most recent call last)") {
        return true;
    }
    if lower.contains("minified react error") {
        return true;
    }
    if lower.contains("unhandledpromiserejection") || lower.contains("unhandled rejection") {
        return true;
    }
    if line.contains("TypeError:") || line.contains("ReferenceError:") {
        return true;
    }
    if line.contains("NullPointerException")
        || line.contains("OutOfMemoryError")
        || line.contains("Exception:")
        || line.contains("Error:")
    {
        return true;
    }
    // Python-style: ModuleNotFoundError: ...
    if line.contains("Error:") && (lower.contains("error:") || line.contains("Exception")) {
        return true;
    }
    false
}

fn is_stack_frame(line: &str) -> bool {
    let t = line.trim_start();
    if t.starts_with("at ") || t.starts_with("\tat ") || line.contains("\tat ") {
        return true;
    }
    if t.starts_with("at Object.") || t.contains(" at Object.") {
        return true;
    }
    // "    at foo" JS
    if t.starts_with("at ") {
        return true;
    }
    // Python: File "app.py", line 42
    if t.starts_with("File \"") && t.contains(", line ") {
        return true;
    }
    false
}

/// Extract primary error line + up to 2 stack frames. Returns None if nothing found.
pub fn extract_signal_snippet(text: &str) -> Option<String> {
    if text.trim().is_empty() {
        return None;
    }
    let lines: Vec<&str> = text.lines().collect();
    let mut primary_idx: Option<usize> = None;
    for (i, line) in lines.iter().enumerate() {
        if is_primary_line(line) {
            primary_idx = Some(i);
            break;
        }
    }
    let idx = primary_idx?;
    let mut out: Vec<String> = vec![lines[idx].to_string()];
    let mut frames = 0usize;
    for line in lines.iter().skip(idx + 1) {
        if frames >= 2 {
            break;
        }
        if is_stack_frame(line) {
            out.push((*line).to_string());
            frames += 1;
        }
    }
    let mut joined = out.join("\n");
    if joined.len() > MAX_SNIPPET_CHARS {
        let mut end = MAX_SNIPPET_CHARS;
        while end > 0 && !joined.is_char_boundary(end) {
            end -= 1;
        }
        joined.truncate(end);
    }
    Some(joined)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extracts_java_npe_with_frames() {
        let text = "INFO start\njava.lang.NullPointerException: Cannot invoke\n\tat com.example.PaymentService.charge(PaymentService.java:42)\n\tat com.example.Api.handle(Api.java:10)\nINFO done";
        let snip = extract_signal_snippet(text).expect("snippet");
        assert!(snip.contains("NullPointerException"));
        assert!(snip.contains("PaymentService"));
        assert!(snip.lines().count() <= 3);
    }

    #[test]
    fn extracts_python_traceback() {
        let text = "Traceback (most recent call last):\n  File \"app.py\", line 10, in <module>\n  File \"db.py\", line 5, in connect\nModuleNotFoundError: No module named 'psycopg2'";
        let snip = extract_signal_snippet(text).expect("snippet");
        assert!(snip.contains("Traceback"));
        assert!(snip.contains("File \"app.py\""));
    }

    #[test]
    fn none_for_benign_info() {
        assert!(extract_signal_snippet("INFO Application started successfully").is_none());
    }
}
