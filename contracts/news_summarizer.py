# { "Depends": "py-genlayer:test" }
from genlayer import *
import json
from dataclasses import dataclass
from datetime import datetime


@allow_storage
@dataclass
class Summary:
    url: str
    summary: str
    created_at: str


class NewsSummarizer(gl.Contract):
    summaries: TreeMap[str, Summary]

    def __init__(self):
        pass

    @gl.public.write
    def summarize(self, url: str) -> None:
        if url in self.summaries:
            raise Exception("URL already summarized")

        def fetch_and_summarize() -> str:
            web_data = gl.nondet.web.render(url, mode="text")

            task = f"""Analyze the following web content and create a concise summary in 1-2 sentences.

Web content:
{web_data}

Respond in JSON:
{{
  "summary": "string — concise 1-2 sentence summary"
}}

It is mandatory that you respond only using the JSON format above,
nothing else. Don't include any other words or characters,
your output must be only JSON without any formatting prefix or suffix.
This result should be perfectly parsable by a JSON parser without errors.
"""
            result = gl.nondet.exec_prompt(task, response_format="json")
            return json.dumps(result, sort_keys=True)

        result_json = json.loads(gl.eq_principle.strict_eq(fetch_and_summarize))

        self.summaries[url] = Summary(
            url=url,
            summary=result_json["summary"],
            created_at=datetime.now().isoformat(),
        )

    @gl.public.view
    def get_summary(self, url: str) -> dict:
        if url not in self.summaries:
            return {"error": "Summary not found"}
        s = self.summaries[url]
        return {
            "url": s.url,
            "summary": s.summary,
            "created_at": s.created_at,
        }

    @gl.public.view
    def get_all_summaries(self) -> dict:
        return {
            url: {
                "url": s.url,
                "summary": s.summary,
                "created_at": s.created_at,
            }
            for url, s in self.summaries.items()
        }
