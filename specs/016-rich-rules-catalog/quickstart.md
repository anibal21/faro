# Quickstart: 016-rich-rules-catalog

## Prerequisites

- Faro build with this feature; demo env available.
- Contracts: [analyze-result.md](./contracts/analyze-result.md), [packs-catalog.md](./contracts/packs-catalog.md), [signal-snippet.md](./contracts/signal-snippet.md), [auto-hint.md](./contracts/auto-hint.md).

## Validation

### 1. Rich UI + signal (SC-001, SC-005)

1. Connect demo → Structured logs → click NPE / ERROR write-group.  
2. **Expect**: title, summary, why, whatToLookFor, recommendation steps; **Señal en el log** with exception line + frame(s); pack label Spring Boot / JVM.

### 2. Liquibase (SC-002)

1. Analyze fixture with changelog lock / migration failed (override pack Liquibase if needed).  
2. **Expect**: ≥1 descriptive Liquibase finding.

### 3. Node / React / Python (SC-002, SC-004)

1. Analyze each technology fixture without forcing pack (or force then clear).  
2. **Expect**: correct pack via hint + ≥1 useful finding each.

### 4. Benign INFO (SC-003)

1. Analyze `INFO Application started successfully`.  
2. **Expect**: no critical findings.

### 5. Override (US4)

1. Change pack in panel → re-analyze.  
2. **Expect**: pack label + findings follow selection; empty state names the pack.

## Automated

```powershell
npm test
cargo test --manifest-path src-tauri/Cargo.toml
```

## Pass

SC-001…SC-007 from [spec.md](./spec.md).
