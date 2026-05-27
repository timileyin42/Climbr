import io
import json
import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)


def _extract_pdf_text(data: bytes) -> str:
    from pypdf import PdfReader
    reader = PdfReader(io.BytesIO(data))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def _extract_docx_text(data: bytes) -> str:
    from docx import Document
    doc = Document(io.BytesIO(data))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


_PROMPT_TEMPLATE = """Extract information from this CV/resume and return ONLY a valid JSON object — no markdown, no explanation.

JSON shape:
{{
  "bio": "professional summary (2-3 sentences max, first person)",
  "education": [
    {{
      "institution": "school name",
      "degree": "degree type e.g. B.Sc, HND",
      "field_of_study": "subject/course",
      "start_year": 2015,
      "end_year": 2019
    }}
  ],
  "work_experience": [
    {{
      "company": "company name",
      "position": "job title",
      "description": "one-line role description",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM",
      "is_current": false,
      "location": "city, country"
    }}
  ],
  "skills": ["skill1", "skill2"],
  "languages": [
    {{"name": "English", "proficiency": "Native"}}
  ],
  "certificates": [
    {{
      "name": "certificate name",
      "issuing_organization": "issuer name",
      "issue_date": "YYYY-MM-DD"
    }}
  ],
  "hobbies": ["hobby1"]
}}

Rules:
- Return ONLY the JSON object, nothing else
- Use null for unknown dates, not empty strings
- language proficiency must be one of: Beginner, Intermediate, Fluent, Native
- If no data for a section, use []
- start_date / end_date for work experience must be "YYYY-MM" format or null
- Keep bio concise and professional

CV:
{text}"""


async def parse_cv(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    from app.config import settings

    if not settings.GOOGLE_AI_API_KEY:
        return {}

    fname = filename.lower()
    if fname.endswith(".pdf"):
        text = _extract_pdf_text(file_bytes)
    elif fname.endswith((".docx", ".doc")):
        text = _extract_docx_text(file_bytes)
    else:
        text = file_bytes.decode("utf-8", errors="ignore")

    if not text.strip():
        return {}

    import google.generativeai as genai

    genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = _PROMPT_TEMPLATE.format(text=text[:8000])
    response = model.generate_content(prompt)

    raw = response.text.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
        raw = raw.rsplit("```", 1)[0]

    return json.loads(raw)
