import json
import requests


OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL_NAME = "llama3.2:3b"


def analyze_evidence_with_ai(
    control_id: str,
    title: str,
    framework: str,
    description: str,
    requirement: str,
    evidence_requested: str,
    evidence_text: str,
):
    prompt = f"""
You are an experienced GRC compliance analyst.

Your task is to evaluate submitted evidence against a compliance control.

CONTROL
Control ID: {control_id}
Title: {title}
Framework: {framework}

CONTROL DESCRIPTION
{description}

CONTROL REQUIREMENT
{requirement}

EVIDENCE REQUESTED
{evidence_requested}

SUBMITTED EVIDENCE
{evidence_text}

IMPORTANT ANALYSIS RULES:

1. Only use facts that are actually supported by the submitted evidence.

2. Do NOT assume that a person's job experience, resume,
   certification, or statement proves that an organizational
   control is implemented.

3. Distinguish between:
   - Relevant information
   - Actual evidence demonstrating the control

4. If the requested evidence is missing, clearly identify it.

5. A document should NOT be considered compliant merely because
   it mentions security, IAM, AWS, compliance, governance,
   auditing, or similar terminology.

6. Compare the submitted evidence directly against the
   CONTROL REQUIREMENT.

COVERAGE RULES:

- 0-20: Evidence provides little or no support.
- 21-60: Evidence provides partial support but significant
        requirements are missing.
- 61-85: Evidence substantially supports the requirement but
        some gaps remain.
- 86-100: Evidence strongly demonstrates the requirement.

STATUS RULES:

- Compliant:
  Evidence sufficiently demonstrates the control requirement.

- Partial:
  Evidence supports some aspects of the requirement but
  important evidence is missing.

- Insufficient Evidence:
  Evidence does not adequately demonstrate the requirement.

RISK RULES:

- High:
  Evidence provides no meaningful support for the requirement
  or critical evidence is completely missing.

- Medium:
  Evidence provides partial support but important proof is missing.

- Low:
  Evidence substantially supports the requirement with only
  minor gaps.

Return ONLY valid JSON.

The JSON MUST follow this exact structure:

{{
  "coverage": 0,
  "status": "Insufficient Evidence",
  "risk": "High",
  "missing_requirements": [
    "Example missing requirement"
  ],
  "evidence_summary": "Explain what the submitted evidence actually demonstrates.",
  "recommendation": "Explain what evidence or action should be provided next."
}}

OUTPUT RULES:

- coverage MUST be an integer between 0 and 100.
- status MUST be exactly one of:
  "Compliant"
  "Partial"
  "Insufficient Evidence"

- risk MUST be exactly one of:
  "Low"
  "Medium"
  "High"

- missing_requirements MUST be a JSON array of strings.

- evidence_summary MUST NOT be empty.

- recommendation MUST NOT be empty.

- If coverage is 0, missing_requirements MUST NOT be empty.

- Do not include markdown.
- Do not include explanations outside the JSON.
"""

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "format": "json",
        },
        timeout=300,
    )

    response.raise_for_status()

    result = response.json()

    return json.loads(result["response"])