# SurgeryReady Agent Data — Shared Knowledge Store

This directory contains the shared data files that all SurgeryReady agents read from and write to (via the Orchestrator).

## Files

### evidence-index.json
Structured log of all reviewed publications with GRADE-level assessments.

**Schema:**
```json
{
  "version": "1.0.0",
  "entries": [
    {
      "id": "ev-YYYY-NNNN",
      "track": "patient | provider",
      "source_agent": "P-01 | PR-01",
      "date_reviewed": "YYYY-MM-DD",
      "citation": "Author et al., Journal, Year",
      "guideline_id": "e.g. asra-anticoag-2024",
      "summary": "Plain-text summary of the finding",
      "recommendation": "integrate | monitor | reject",
      "confidence": "high | medium | low",
      "status": "proposed | accepted | rejected | superseded",
      "reviewed_by_pl01": false,
      "pl01_review_id": null
    }
  ]
}
```

### audit-log.jsonl
Append-only log of all agent actions. One JSON object per line.

**Schema:**
```json
{"timestamp": "ISO-8601", "agent": "agent-id", "action": "route | evidence_review | content_update | legal_review | qa_test | ...", "target": "target agent or file", "task": "description", "status": "initiated | completed | failed", "output": "reference to output if any"}
```

### legal-review-log.jsonl
Append-only log of PL-01 Legal and Compliance Agent sign-offs. One JSON object per line.

**Schema:**
```json
{"timestamp": "ISO-8601", "agent": "PL-01", "review_type": "content_change | guideline_update | feature_review", "target_file": "path to file reviewed", "evidence_id": "ev-YYYY-NNNN or null", "decision": "approved | rejected | conditionally_approved", "conditions": "string or null", "rationale": "explanation"}
```

## Rules
- Only the Orchestrator (Agent 0) coordinates writes across agents
- Evidence index is written by P-01 and PR-01, read by all
- Audit log is appended to by all agents
- Legal review log is written exclusively by PL-01
- No agent modifies another agent's primary output file without going through the Orchestrator
