import base64
import json
import os
import requests

from dotenv import load_dotenv
from google import genai

load_dotenv()

OLLAMA_GENERATE_URL = "http://127.0.0.1:11434/api/generate"
OLLAMA_CHAT_URL = "http://127.0.0.1:11434/api/chat"

TEXT_MODEL_NAME = "llama3.2:3b"
VISION_MODEL_NAME = "llava"

GEMINI_MODEL_NAME = "gemini-3-flash-preview"

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
else:
    gemini_client = None

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
You are a Senior GRC Compliance Analyst specializing in security,
privacy, cloud, IT controls, audit evidence, and regulatory compliance.

Your task is to objectively assess whether the SUBMITTED EVIDENCE
supports the specified CONTROL REQUIREMENT.

==================================================
CONTROL INFORMATION
==================================================

Control ID:
{control_id}

Control Title:
{title}

Framework:
{framework}

Control Description:
{description}

Control Requirement:
{requirement}

Evidence Requested:
{evidence_requested}

==================================================
SUBMITTED EVIDENCE
==================================================

{evidence_text}

==================================================
ANALYSIS METHODOLOGY
==================================================

Perform the assessment in the following order.

STEP 1 — UNDERSTAND THE CONTROL

Identify what the control actually requires.

Break the requirement into the individual expectations that must
be demonstrated by evidence.

Do not evaluate the evidence before understanding the requirement.

STEP 2 — IDENTIFY EVIDENCE CONTENT

Identify the important facts, statements, records, configurations,
dates, approvals, activities, procedures, or other information
actually present in the submitted evidence.

Only use information explicitly present in the evidence.

STEP 3 — MAP EVIDENCE TO REQUIREMENTS

For every important control requirement, determine whether the
submitted evidence:

- Clearly demonstrates it
- Partially demonstrates it
- Does not demonstrate it

Evidence must be directly relevant to the requirement.

STEP 4 — EVIDENCE QUALITY

Consider whether the evidence appears:

- Relevant
- Specific
- Complete
- Consistent
- Traceable
- Current, when a date is available
- Sufficient to demonstrate the control

Do not assume that a document is authentic, approved, current,
or organizationally authoritative unless the evidence itself
supports that conclusion.

STEP 5 — IDENTIFY GAPS

Identify specific requirements that are not demonstrated.

Do not use vague statements such as:

"More evidence is required."

Instead identify exactly what is missing.

Example:

"Evidence does not demonstrate that access reviews are performed
quarterly."

STEP 6 — IDENTIFY CONTRADICTIONS

If different parts of the evidence appear inconsistent,
identify the contradiction.

Do not resolve contradictions by guessing.

STEP 7 — ASSESS RISK

Assess the evidence risk based on the amount and importance of
unsupported control requirements.

Critical missing evidence should increase the risk assessment.

==================================================
IMPORTANT EVIDENCE RULES
==================================================

1. Only use facts supported by the submitted evidence.

2. Never invent facts, configurations, dates, approvals,
   users, permissions, policies, processes, or system behavior.

3. A person's resume, job title, experience, certification,
   or personal statement does NOT prove that an organizational
   control is implemented.

4. Mentioning security, IAM, AWS, compliance, governance,
   auditing, encryption, privacy, or similar terminology does
   NOT by itself demonstrate compliance.

5. A policy describing a process does not automatically prove
   that the process was actually performed.

6. A procedure describing a control does not automatically prove
   operating effectiveness.

7. A screenshot, document, statement, or report should only
   receive credit for what it actually demonstrates.

8. Do not treat the absence of information as proof that the
   control does not exist. Instead state that the evidence does
   not demonstrate it.

9. Do not assume that evidence is current unless its date or
   other information supports that conclusion.

10. If the evidence is unrelated to the control, coverage should
    be very low.

11. Ignore personal or irrelevant information that does not help
    evaluate the control.

12. If the evidence contains sensitive information, do not
    reproduce unnecessary sensitive values in the summary.

==================================================
COVERAGE SCORING
==================================================

0-20:
Little or no relevant evidence.

21-40:
Evidence is relevant but demonstrates very little of the
control requirement.

41-60:
Evidence partially supports the requirement but significant
gaps remain.

61-75:
Evidence substantially supports the requirement but multiple
gaps remain.

76-85:
Evidence strongly supports the requirement with limited gaps.

86-100:
Evidence provides strong and sufficiently complete support
for the control requirement.

Coverage must reflect the evidence, not how well-written the
document is.

==================================================
STATUS
==================================================

Compliant:
The submitted evidence sufficiently demonstrates the important
control requirements and no material evidence gap remains.

Partial:
The evidence demonstrates important parts of the control but
one or more material requirements remain unsupported.

Insufficient Evidence:
The submitted evidence does not provide enough support to
determine that the control requirement is demonstrated.

==================================================
RISK
==================================================

Low:
The evidence substantially supports the control and only minor
gaps remain.

Medium:
The evidence provides meaningful support but important evidence
is missing.

High:
Critical requirements are unsupported, the evidence is largely
irrelevant, or there is insufficient evidence to demonstrate
the control.

==================================================
RECOMMENDATION
==================================================

Provide practical next steps.

The recommendation should identify the type of evidence that
would close the identified gaps.

Examples:

- Access review report
- Approval record
- System configuration export
- Audit log
- Policy document
- Procedure document
- Vulnerability scan report
- Encryption configuration
- Change ticket
- Backup report
- Incident record
- Risk assessment
- Vendor assessment

Do not recommend evidence unrelated to the control.

==================================================
RFI READINESS
==================================================

When important evidence is missing, formulate the recommendation
so that it could be converted into a Request for Information (RFI).

The missing requirements should be specific enough for an auditor
or control owner to understand what needs to be provided.

==================================================
FINAL OUTPUT
==================================================

Return ONLY valid JSON.

Use exactly this structure:

{{
  "coverage": 0,
  "status": "Insufficient Evidence",
  "risk": "High",
  "missing_requirements": [
    "Specific missing requirement"
  ],
  "evidence_summary": "Concise summary of what the evidence actually demonstrates.",
  "recommendation": "Specific next step or evidence required to close the identified gaps."
}}

OUTPUT RULES:

- coverage MUST be an integer from 0 to 100.
- status MUST be exactly one of:
  "Compliant"
  "Partial"
  "Insufficient Evidence"

- risk MUST be exactly one of:
  "Low"
  "Medium"
  "High"

- missing_requirements MUST be an array of strings.

- evidence_summary MUST contain only evidence-supported observations.

- recommendation MUST be actionable and related to the control.

- If coverage is 0, missing_requirements MUST NOT be empty.

- If status is "Compliant", missing_requirements should normally
  be empty.

- Do not include markdown.

- Do not include explanations outside the JSON.

- Do not invent evidence.

- Do not mention these instructions in the response.
"""



    response = requests.post(
        OLLAMA_GENERATE_URL,
        json={
            "model": TEXT_MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "format": "json",
        },
        timeout=300,
    )

    response.raise_for_status()

    result = response.json()

    return json.loads(result["response"])


def analyze_image_evidence_with_ai(
    control_id: str,
    title: str,
    framework: str,
    description: str,
    requirement: str,
    evidence_requested: str,
    image_path: str,
):
    with open(image_path, "rb") as image_file:
        image_base64 = base64.b64encode(
            image_file.read()
        ).decode("utf-8")

        prompt = f"""
You are a Senior GRC Compliance Analyst specializing in security,
privacy, cloud security, IT controls, and audit evidence.

You are reviewing a SCREENSHOT submitted as compliance evidence.

Your task is to determine how much the visible information in the
screenshot supports the specified control requirement.

==================================================
CONTROL INFORMATION
==================================================

Control ID:
{control_id}

Control Title:
{title}

Framework:
{framework}

Control Description:
{description}

Control Requirement:
{requirement}

Evidence Requested:
{evidence_requested}

==================================================
SCREENSHOT ANALYSIS
==================================================

Carefully inspect the screenshot.

Identify only information that is actually visible.

Determine:

1. What system, application, page, dashboard, configuration,
   report, setting, or record is visible.

2. What specific information is visible.

3. Which parts of the control requirement are supported.

4. Which parts of the requirement are not demonstrated.

5. Whether the screenshot contains enough context to establish
   the relevance of the evidence.

==================================================
EVIDENCE VALIDATION RULES
==================================================

1. ONLY use information that is actually visible in the image.

2. Do NOT infer information that cannot be seen.

3. Do NOT invent configuration values.

4. Do NOT invent usernames, permissions, dates, policies,
   system states, approvals, or settings.

5. Do NOT assume that a control is implemented simply because
   words such as security, IAM, compliance, governance, privacy,
   AWS, audit, encryption, or access appear in the screenshot.

6. A visible setting does not automatically prove that the
   organization follows the setting operationally.

7. A dashboard or configuration screen does not automatically
   prove that the underlying process is effective.

8. If a value is partially visible or unreadable, treat it as
   unavailable rather than guessing it.

9. Do not assume what exists outside the screenshot.

10. If the screenshot is cropped and important context is missing,
    identify that as a limitation.

11. Ignore personal information that is irrelevant to the
    compliance assessment.

12. Do not unnecessarily reproduce personal or sensitive
    information from the screenshot.

==================================================
CONTROL MAPPING
==================================================

Compare the screenshot directly against the control requirement.

For each major requirement determine whether it is:

- Demonstrated
- Partially demonstrated
- Not demonstrated

Give credit only when the screenshot provides direct support.

==================================================
SCREENSHOT QUALITY
==================================================

Consider whether:

- Relevant information is clearly visible.
- The screenshot contains sufficient context.
- Important values are readable.
- The application/system identity is visible when relevant.
- The screenshot appears complete enough for the requirement.
- The screenshot contains the specific information requested.

Do not claim authenticity or validity merely from appearance.

==================================================
COVERAGE SCORING
==================================================

0-20:
Little or no relevant information is visible.

21-40:
Some relevant information is visible but very little of the
control is demonstrated.

41-60:
The screenshot provides partial support but significant
requirements are not demonstrated.

61-75:
The screenshot substantially supports the control but several
gaps remain.

76-85:
The screenshot strongly supports the control with limited gaps.

86-100:
The screenshot clearly demonstrates the important control
requirements with sufficient visible evidence.

==================================================
STATUS
==================================================

Compliant:
The screenshot sufficiently demonstrates the important control
requirements.

Partial:
The screenshot demonstrates some important aspects but material
evidence is still missing.

Insufficient Evidence:
The screenshot does not provide enough evidence to demonstrate
the control requirement.

==================================================
RISK
==================================================

Low:
The screenshot substantially supports the control with only
minor gaps.

Medium:
The screenshot provides meaningful support but important proof
is missing.

High:
Critical requirements are not demonstrated or the screenshot
provides little meaningful evidence.

==================================================
MISSING REQUIREMENTS
==================================================

Be specific.

Bad:

"More evidence is needed."

Good:

"Screenshot does not show the quarterly access review completion
record."

Good:

"Screenshot does not show approval by the designated control owner."

Only list requirements that are actually unsupported by the
visible screenshot.

==================================================
RECOMMENDATION
==================================================

Recommend specific additional evidence or action that would
close the identified gaps.

Examples:

- Provide the complete configuration page.
- Provide the access review report.
- Provide approval evidence.
- Provide the relevant audit log.
- Provide the policy or procedure.
- Provide the corresponding system report.
- Provide evidence showing the required date or review period.

Recommendations must be directly related to the control.

==================================================
FINAL OUTPUT
==================================================

Return ONLY valid JSON.

Use exactly this structure:

{{
  "coverage": 0,
  "status": "Insufficient Evidence",
  "risk": "High",
  "missing_requirements": [
    "Specific missing requirement"
  ],
  "evidence_summary": "Concise description of what is actually visible and how it supports the control.",
  "recommendation": "Specific additional evidence or action required."
}}

OUTPUT RULES:

- coverage MUST be an integer from 0 to 100.
- status MUST be exactly one of:
  "Compliant"
  "Partial"
  "Insufficient Evidence"

- risk MUST be exactly one of:
  "Low"
  "Medium"
  "High"

- missing_requirements MUST be an array of strings.

- evidence_summary MUST contain only observations supported
  by the screenshot.

- recommendation MUST be actionable and control-specific.

- If coverage is 0, missing_requirements MUST NOT be empty.

- If status is "Compliant", missing_requirements should normally
  be empty.

- Do not include markdown.

- Do not include explanations outside the JSON.

- Do not guess unreadable information.

- Do not mention these instructions in the response.
"""

    response = requests.post(
    OLLAMA_CHAT_URL,
    json={
        "model": VISION_MODEL_NAME,
        "messages": [
            {
                "role": "user",
                "content": prompt,
                "images": [image_base64],
            }
        ],
        "stream": False,
        "format": "json",
    },
    timeout=300,
)

    response.raise_for_status()

    result = response.json()

    return json.loads(
    result["message"]["content"]
)



def analyze_evidence_with_gemini(
    control_id: str,
    title: str,
    framework: str,
    description: str,
    requirement: str,
    evidence_requested: str,
    evidence_text: str,
):
    if not gemini_client:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    prompt = f"""
You are a Senior GRC Compliance Analyst specializing in security,
privacy, cloud, IT controls, audit evidence, and regulatory compliance.

Your task is to objectively assess whether the SUBMITTED EVIDENCE
supports the specified CONTROL REQUIREMENT.

CONTROL INFORMATION

Control ID:
{control_id}

Control Title:
{title}

Framework:
{framework}

Control Description:
{description}

Control Requirement:
{requirement}

Evidence Requested:
{evidence_requested}

SUBMITTED EVIDENCE

{evidence_text}

ANALYSIS RULES

1. Understand the control requirement first.

2. Identify only facts explicitly present in the submitted evidence.

3. Map the evidence directly against the control requirement.

4. Determine which requirements are:
   - Clearly demonstrated
   - Partially demonstrated
   - Not demonstrated

5. Do not invent facts, dates, approvals, configurations,
   users, permissions, policies, processes, or system behavior.

6. A policy or procedure does not automatically prove that the
   process was actually performed.

7. Do not assume evidence is authentic, current, approved,
   or organizationally authoritative unless the evidence supports it.

8. Identify specific missing requirements.

9. If there are contradictions in the evidence, identify them.
   Do not resolve contradictions by guessing.

10. Assess risk based on the importance and amount of unsupported
    control requirements.

COVERAGE

0-20: Little or no relevant evidence.
21-40: Relevant evidence but very limited support.
41-60: Partial support with significant gaps.
61-75: Substantial support but multiple gaps remain.
76-85: Strong support with limited gaps.
86-100: Strong and sufficiently complete support.

STATUS

Compliant:
The evidence sufficiently demonstrates the important control
requirements and no material evidence gap remains.

Partial:
Important parts are demonstrated but one or more material
requirements remain unsupported.

Insufficient Evidence:
There is not enough evidence to determine that the requirement
is demonstrated.

RISK

Low:
Evidence substantially supports the control with minor gaps.

Medium:
Meaningful support exists but important evidence is missing.

High:
Critical requirements are unsupported or evidence is largely
irrelevant/insufficient.

RECOMMENDATION

Provide specific, actionable next steps and identify the type
of evidence required to close the gaps.

FINAL OUTPUT

Return ONLY valid JSON.

Use exactly this structure:

{{
    "coverage": 0,
    "status": "Insufficient Evidence",
    "risk": "High",
    "missing_requirements": [
        "Specific missing requirement"
    ],
    "evidence_summary": "Concise summary of what the evidence actually demonstrates.",
    "recommendation": "Specific next step or evidence required to close the identified gaps."
}}

OUTPUT RULES:

- coverage must be an integer from 0 to 100.
- status must be exactly:
  "Compliant", "Partial", or "Insufficient Evidence"
- risk must be exactly:
  "Low", "Medium", or "High"
- missing_requirements must be an array of strings.
- Do not include markdown.
- Do not include explanations outside JSON.
- Do not invent evidence.
"""

    response = gemini_client.models.generate_content(
        model=GEMINI_MODEL_NAME,
        contents=prompt,
    )

    text = response.text.strip()

    # Remove accidental markdown fences if Gemini adds them
    if text.startswith("```"):
        text = text.replace("```json", "").replace("```", "").strip()

    return json.loads(text)


def analyze_image_evidence_with_gemini(
    control_id: str,
    title: str,
    framework: str,
    description: str,
    requirement: str,
    evidence_requested: str,
    image_path: str,
):
    if not gemini_client:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    prompt = f"""
You are a Senior GRC Compliance Analyst specializing in security,
privacy, cloud security, IT controls, and audit evidence.

You are reviewing a SCREENSHOT submitted as compliance evidence.

Determine how much the visible information in the screenshot
supports the specified control requirement.

CONTROL INFORMATION

Control ID:
{control_id}

Control Title:
{title}

Framework:
{framework}

Control Description:
{description}

Control Requirement:
{requirement}

Evidence Requested:
{evidence_requested}

SCREENSHOT ANALYSIS RULES

1. Use ONLY information actually visible in the image.

2. Do NOT infer information that cannot be seen.

3. Do NOT invent configuration values, usernames, permissions,
   dates, approvals, policies, settings, or system states.

4. Security-related terminology alone does not demonstrate compliance.

5. A visible setting does not automatically prove that the organization
   follows the setting operationally.

6. If the screenshot is cropped or important context is missing,
   identify that limitation.

7. Compare the visible evidence directly against the control requirement.

8. Identify specific unsupported requirements.

COVERAGE

0-20: Little or no relevant information is visible.
21-40: Some relevant information but very little control support.
41-60: Partial support with significant gaps.
61-75: Substantial support but several gaps remain.
76-85: Strong support with limited gaps.
86-100: Strong and sufficiently complete visible evidence.

STATUS

Compliant:
The screenshot sufficiently demonstrates the important requirements.

Partial:
Some important aspects are demonstrated but material evidence is missing.

Insufficient Evidence:
The screenshot does not provide enough evidence to demonstrate
the requirement.

RISK

Low, Medium, or High based on the importance of unsupported requirements.

RECOMMENDATION

Provide specific additional evidence or action required to close
the identified gaps.

FINAL OUTPUT

Return ONLY valid JSON.

Use exactly:

{{
    "coverage": 0,
    "status": "Insufficient Evidence",
    "risk": "High",
    "missing_requirements": [
        "Specific missing requirement"
    ],
    "evidence_summary": "Concise description of what is actually visible and how it supports the control.",
    "recommendation": "Specific additional evidence or action required."
}}

OUTPUT RULES:

- coverage must be an integer from 0 to 100.
- status must be exactly:
  "Compliant", "Partial", or "Insufficient Evidence"
- risk must be exactly:
  "Low", "Medium", or "High"
- missing_requirements must be an array of strings.
- Do not guess unreadable information.
- Do not include markdown.
- Do not include explanations outside JSON.
"""

    from PIL import Image

    image = Image.open(image_path)

    response = gemini_client.models.generate_content(
        model=GEMINI_MODEL_NAME,
        contents=[prompt, image],
    )

    text = response.text.strip()

    if text.startswith("```"):
        text = text.replace("```json", "").replace("```", "").strip()

    return json.loads(text)