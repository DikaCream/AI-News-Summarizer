# { "Depends": "py-genlayer:test" }
import genlayer as gl
import json
from dataclasses import dataclass


@gl.allow_storage
@dataclass
class Summary:
    url: str
    summary: str
    created_at: str
    submitter: str
    category: str
    sentiment: str
    word_count: int
    language: str
    key_points: str


class NewsSummarizer(gl.contract.Contract):
    summaries: gl.TreeMap[str, Summary]
    submitter_index: gl.TreeMap[str, gl.DynArray[str]]
    total_summaries: int
    urls_by_domain: gl.TreeMap[str, int]
    categories_count: gl.TreeMap[str, int]
    sentiment_count: gl.TreeMap[str, int]

    def __init__(self):
        self.total_summaries = 0

    def _extract_domain(self, url: str) -> str:
        try:
            return url.split("//")[-1].split("/")[0]
        except Exception:
            return "unknown"

    @gl.public.write
    def summarize(self, url: str) -> None:
        if url in self.summaries:
            raise Exception("URL already summarized")

        if not url.startswith(("http://", "https://")):
            raise Exception("Invalid URL format")

        def fetch_and_analyze() -> str:
            try:
                web_data = gl.nondet.web.render(url, mode="text")
            except Exception:
                raise gl.vm.UserError(f"Failed to fetch URL: {url}")

            task = f"""Analyze the following web content and provide a comprehensive analysis.

Web content:
{web_data}

Respond in JSON:
{{
  "summary": "string — concise 1-2 sentence summary",
  "category": "string — one of: Technology, Business, Science, Health, Sports, Entertainment, Politics, Other",
  "sentiment": "string — one of: Positive, Negative, Neutral, Mixed",
  "word_count": "integer — approximate word count of the original content",
  "language": "string — detected language (e.g., English, Spanish, Indonesian)",
  "key_points": "string — 3-4 bullet points of the main takeaways"
}}

It is mandatory that you respond only using the JSON format above,
nothing else. Don't include any other words or characters,
your output must be only JSON without any formatting prefix or suffix.
This result should be perfectly parsable by a JSON parser without errors."""

            result = gl.nondet.exec_prompt(task, response_format="json")
            return json.dumps(result, sort_keys=True)

        result_json = json.loads(gl.eq_principle.strict_eq(fetch_and_analyze))

        submitter = str(gl.message.sender_address)

        self.summaries[url] = Summary(
            url=url,
            summary=result_json["summary"],
            created_at="",
            submitter=submitter,
            category=result_json.get("category", "Other"),
            sentiment=result_json.get("sentiment", "Neutral"),
            word_count=int(result_json.get("word_count", 0)),
            language=result_json.get("language", "Unknown"),
            key_points=result_json.get("key_points", ""),
        )

        domain = self._extract_domain(url)
        self.total_summaries = self.total_summaries + 1
        self.urls_by_domain[domain] = self.urls_by_domain.get(domain, 0) + 1
        self.categories_count[result_json.get("category", "Other")] = (
            self.categories_count.get(result_json.get("category", "Other"), 0) + 1
        )
        self.sentiment_count[result_json.get("sentiment", "Neutral")] = (
            self.sentiment_count.get(result_json.get("sentiment", "Neutral"), 0) + 1
        )

        if submitter not in self.submitter_index:
            self.submitter_index[submitter] = []
        self.submitter_index[submitter].append(url)

    @gl.public.view
    def get_summary(self, url: str) -> dict:
        if url not in self.summaries:
            return {"error": "Summary not found"}
        s = self.summaries[url]
        return {
            "url": s.url,
            "summary": s.summary,
            "created_at": s.created_at,
            "submitter": s.submitter,
            "category": s.category,
            "sentiment": s.sentiment,
            "word_count": s.word_count,
            "language": s.language,
            "key_points": s.key_points,
        }

    @gl.public.view
    def get_all_summaries(self) -> dict:
        return {
            url: {
                "url": s.url,
                "summary": s.summary,
                "created_at": s.created_at,
                "submitter": s.submitter,
                "category": s.category,
                "sentiment": s.sentiment,
                "word_count": s.word_count,
                "language": s.language,
                "key_points": s.key_points,
            }
            for url, s in self.summaries.items()
        }

    @gl.public.view
    def get_stats(self) -> dict:
        return {
            "total_summaries": self.total_summaries,
            "urls_by_domain": {k: v for k, v in self.urls_by_domain.items()},
            "categories_count": {k: v for k, v in self.categories_count.items()},
            "sentiment_count": {k: v for k, v in self.sentiment_count.items()},
        }

    @gl.public.view
    def get_submitter_summaries(self, submitter: str) -> list:
        urls = self.submitter_index.get(submitter, [])
        results = []
        for url in urls:
            s = self.summaries.get(url)
            if s is not None:
                results.append({
                    "url": s.url,
                    "summary": s.summary,
                    "created_at": s.created_at,
                    "category": s.category,
                    "sentiment": s.sentiment,
                })
        return results

    @gl.public.view
    def get_summaries_by_category(self, category: str) -> list:
        results = []
        for s in self.summaries.values():
            if s.category == category:
                results.append({
                    "url": s.url,
                    "summary": s.summary,
                    "created_at": s.created_at,
                    "sentiment": s.sentiment,
                })
        return results

    @gl.public.view
    def get_summaries_by_sentiment(self, sentiment: str) -> list:
        results = []
        for s in self.summaries.values():
            if s.sentiment == sentiment:
                results.append({
                    "url": s.url,
                    "summary": s.summary,
                    "created_at": s.created_at,
                    "category": s.category,
                })
        return results
