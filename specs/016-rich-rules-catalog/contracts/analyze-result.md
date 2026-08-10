# Contract: Analyze result (016)

## Command

`analyze_write_group` (unchanged name)

### Input

```text
{
  text: string,
  rulePack?: string | null,
  sourceHint?: string | null
}
```

### Output

```text
{
  findings: AnalysisFinding[],
  packId: string,
  packDisplayName: string,
  signalSnippet: string | null
}
```

### AnalysisFinding (wire, camelCase)

```text
{
  severity: string,
  ruleId: string,
  title: string,
  summary: string,
  why: string,
  whatToLookFor: string[],
  recommendation: string[],
  tags?: string[]
}
```

## Behavior

1. Empty/whitespace `text` → empty findings; `signalSnippet` null; pack still resolved.
2. Known `rulePack` → that pack; unknown → `springboot`; unset → auto-hint (five packs).
3. Truncate text to 64 KiB before match + snippet extract.
4. Sort findings critical → warn → info.
5. No network / LLM; never echo secrets into findings beyond what already appears in user log text (snippet is subset of input).

## Errors

Matching failures → empty findings, not hard errors.
