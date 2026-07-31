# Quickstart: 015-rules-multi-pack

## Prerequisites

- Faro build with this feature; demo env available.
- Contracts: [analyze-api.md](./contracts/analyze-api.md), [rule-packs.md](./contracts/rule-packs.md), [auto-hint.md](./contracts/auto-hint.md).

## Validation

### 1. Spring / demo NPE (SC-001)

1. Connect demo → open combined logs → Structured.  
2. Wait for a marked ERROR / NPE group (or paste fixture).  
3. Click group → **Expect** ≥1 finding; pack shows Spring Boot / JVM.

### 2. Node pack (SC-002)

1. Analyze fixture text with Node markers (or select pack Node.js and use Node error sample).  
2. **Expect** ≥1 Node finding; Spring-only needles would miss it.

### 3. Auto-hint (SC-003)

1. Analyze JVM text with pack unset → packId `springboot`.  
2. Analyze Node text with pack unset → packId `nodejs`.

### 4. Benign INFO (SC-004)

1. Analyze `INFO something fine` → **Expect** 0 critical findings.

### 5. Override (US4)

1. Open findings → change pack → re-analyze → findings follow new pack.

## Automated

```powershell
npm test
cargo test --manifest-path src-tauri/Cargo.toml
```

## Pass

SC-001…SC-006 from [spec.md](./spec.md).
