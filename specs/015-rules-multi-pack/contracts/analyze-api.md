# Contract: Analyze API

## Command

`analyze_write_group`

### Input

```text
{
  text: string,
  rulePack?: string | null,    // pack id; omit/null → auto-hint
  sourceHint?: string | null   // e.g. "ns/deployment"
}
```

### Output

```text
{
  findings: AnalysisFinding[],
  packId: string,
  packDisplayName: string
}
```

(Breaking vs today returning bare array — update TS `analyzeWriteGroup` accordingly.)

## Behavior

1. Empty/whitespace `text` → `{ findings: [], packId: default or requested, packDisplayName }`.
2. If `rulePack` set and known → use it.
3. If `rulePack` set and unknown → fall back to default `springboot` (no crash).
4. If unset → auto-hint (see [auto-hint.md](./auto-hint.md)).
5. Truncate `text` to 64 KiB before match.
6. Sort findings by severity critical → warn → info.
7. Never call network/LLM; never echo secrets into findings.

## Errors

Rare IPC failures only; matching failures return empty findings, not hard errors.
