"""Tests for the NewsSummarizer contract — requires web + LLM mocks."""
import json
from tests.direct.conftest import to_hex


def _setup_summary_mocks(vm, summary, category, sentiment, word_count, language, key_points):
    """Register web and LLM mocks for summarization."""
    vm.mock_web(
        r".*",
        {"status": 200, "body": "Sample article content for testing."},
    )
    vm.mock_llm(
        r".*Analyze the following web content.*",
        json.dumps({
            "summary": summary,
            "category": category,
            "sentiment": sentiment,
            "word_count": word_count,
            "language": language,
            "key_points": key_points,
        }),
    )


def test_summarize_basic(direct_vm, direct_deploy, direct_alice):
    """Test basic summarization of a URL."""
    contract = direct_deploy("contracts/news_summarizer.py")
    direct_vm.sender = direct_alice

    _setup_summary_mocks(
        direct_vm,
        summary="This is a test summary.",
        category="Technology",
        sentiment="Positive",
        word_count=500,
        language="English",
        key_points="• Point 1\n• Point 2",
    )

    contract.summarize("https://example.com/article")
    result = contract.get_summary("https://example.com/article")

    assert result["url"] == "https://example.com/article"
    assert result["summary"] == "This is a test summary."
    assert result["category"] == "Technology"
    assert result["sentiment"] == "Positive"
    assert result["word_count"] == 500
    assert result["language"] == "English"
    assert "Point 1" in result["key_points"]
    assert "Point 2" in result["key_points"]


def test_summarize_duplicate_url_fails(direct_vm, direct_deploy, direct_alice):
    """Test that duplicate URLs are rejected."""
    contract = direct_deploy("contracts/news_summarizer.py")
    direct_vm.sender = direct_alice

    _setup_summary_mocks(
        direct_vm,
        summary="Summary",
        category="Technology",
        sentiment="Positive",
        word_count=100,
        language="English",
        key_points="• Point 1",
    )

    contract.summarize("https://example.com/article")

    with direct_vm.expect_revert("URL already summarized"):
        contract.summarize("https://example.com/article")


def test_summarize_invalid_url_fails(direct_vm, direct_deploy, direct_alice):
    """Test that invalid URLs are rejected."""
    contract = direct_deploy("contracts/news_summarizer.py")
    direct_vm.sender = direct_alice

    with direct_vm.expect_revert("Invalid URL format"):
        contract.summarize("not-a-valid-url")


def test_summarize_updates_stats(direct_vm, direct_deploy, direct_alice):
    """Test that summarizing updates statistics correctly."""
    contract = direct_deploy("contracts/news_summarizer.py")
    direct_vm.sender = direct_alice

    _setup_summary_mocks(
        direct_vm,
        summary="Summary 1",
        category="Technology",
        sentiment="Positive",
        word_count=100,
        language="English",
        key_points="• Point 1",
    )

    contract.summarize("https://example.com/article1")

    stats = contract.get_stats()
    assert stats["total_summaries"] == 1
    assert "example.com" in stats["urls_by_domain"]
    assert stats["urls_by_domain"]["example.com"] == 1
    assert "Technology" in stats["categories_count"]
    assert stats["categories_count"]["Technology"] == 1
    assert "Positive" in stats["sentiment_count"]
    assert stats["sentiment_count"]["Positive"] == 1


def test_summarize_multiple_updates_stats(direct_vm, direct_deploy, direct_alice):
    """Test that multiple summaries update statistics correctly."""
    contract = direct_deploy("contracts/news_summarizer.py")
    direct_vm.sender = direct_alice

    # First summary
    _setup_summary_mocks(
        direct_vm,
        summary="Summary 1",
        category="Technology",
        sentiment="Positive",
        word_count=100,
        language="English",
        key_points="• Point 1",
    )
    contract.summarize("https://example.com/article1")

    # Second summary with different category
    _setup_summary_mocks(
        direct_vm,
        summary="Summary 2",
        category="Business",
        sentiment="Neutral",
        word_count=200,
        language="English",
        key_points="• Point 2",
    )
    contract.summarize("https://news.site.com/article2")

    stats = contract.get_stats()
    assert stats["total_summaries"] == 2
    assert stats["urls_by_domain"]["example.com"] == 1
    assert stats["urls_by_domain"]["news.site.com"] == 1
    assert stats["categories_count"]["Technology"] == 1
    assert stats["categories_count"]["Business"] == 1
    assert stats["sentiment_count"]["Positive"] == 1
    assert stats["sentiment_count"]["Neutral"] == 1


def test_get_summary_not_found(direct_vm, direct_deploy):
    """Test get_summary for non-existent URL."""
    contract = direct_deploy("contracts/news_summarizer.py")

    result = contract.get_summary("https://nonexistent.com/article")
    assert "error" in result
    assert result["error"] == "Summary not found"


def test_get_all_summaries(direct_vm, direct_deploy, direct_alice):
    """Test get_all_summaries returns all entries."""
    contract = direct_deploy("contracts/news_summarizer.py")
    direct_vm.sender = direct_alice

    _setup_summary_mocks(
        direct_vm,
        summary="Summary 1",
        category="Technology",
        sentiment="Positive",
        word_count=100,
        language="English",
        key_points="• Point 1",
    )
    contract.summarize("https://example.com/article1")

    _setup_summary_mocks(
        direct_vm,
        summary="Summary 2",
        category="Business",
        sentiment="Negative",
        word_count=200,
        language="Spanish",
        key_points="• Point 2",
    )
    contract.summarize("https://news.site.com/article2")

    all_summaries = contract.get_all_summaries()
    assert len(all_summaries) == 2
    assert "https://example.com/article1" in all_summaries
    assert "https://news.site.com/article2" in all_summaries


def test_get_submitter_summaries(direct_vm, direct_deploy, direct_alice, direct_bob):
    """Test get_submitter_summaries filters by submitter."""
    contract = direct_deploy("contracts/news_summarizer.py")

    alice = to_hex(direct_alice)
    bob = to_hex(direct_bob)

    # Alice submits a summary
    direct_vm.sender = direct_alice
    _setup_summary_mocks(
        direct_vm,
        summary="Alice's summary",
        category="Technology",
        sentiment="Positive",
        word_count=100,
        language="English",
        key_points="• Point 1",
    )
    contract.summarize("https://example.com/alice-article")

    # Bob submits a summary
    direct_vm.sender = direct_bob
    _setup_summary_mocks(
        direct_vm,
        summary="Bob's summary",
        category="Business",
        sentiment="Negative",
        word_count=200,
        language="English",
        key_points="• Point 2",
    )
    contract.summarize("https://news.site.com/bob-article")

    # Get Alice's summaries
    alice_summaries = contract.get_submitter_summaries(alice)
    assert len(alice_summaries) == 1
    assert alice_summaries[0]["url"] == "https://example.com/alice-article"

    # Get Bob's summaries
    bob_summaries = contract.get_submitter_summaries(bob)
    assert len(bob_summaries) == 1
    assert bob_summaries[0]["url"] == "https://news.site.com/bob-article"


def test_get_summaries_by_category(direct_vm, direct_deploy, direct_alice):
    """Test get_summaries_by_category filters correctly."""
    contract = direct_deploy("contracts/news_summarizer.py")
    direct_vm.sender = direct_alice

    # Technology article
    _setup_summary_mocks(
        direct_vm,
        summary="Tech summary",
        category="Technology",
        sentiment="Positive",
        word_count=100,
        language="English",
        key_points="• Tech point",
    )
    contract.summarize("https://example.com/tech-article")

    # Business article
    _setup_summary_mocks(
        direct_vm,
        summary="Business summary",
        category="Business",
        sentiment="Neutral",
        word_count=200,
        language="English",
        key_points="• Business point",
    )
    contract.summarize("https://news.site.com/business-article")

    # Filter by Technology
    tech_summaries = contract.get_summaries_by_category("Technology")
    assert len(tech_summaries) == 1
    assert tech_summaries[0]["url"] == "https://example.com/tech-article"

    # Filter by Business
    business_summaries = contract.get_summaries_by_category("Business")
    assert len(business_summaries) == 1
    assert business_summaries[0]["url"] == "https://news.site.com/business-article"

    # Filter by non-existent category
    health_summaries = contract.get_summaries_by_category("Health")
    assert len(health_summaries) == 0


def test_get_summaries_by_sentiment(direct_vm, direct_deploy, direct_alice):
    """Test get_summaries_by_sentiment filters correctly."""
    contract = direct_deploy("contracts/news_summarizer.py")
    direct_vm.sender = direct_alice

    # Positive article
    _setup_summary_mocks(
        direct_vm,
        summary="Positive summary",
        category="Technology",
        sentiment="Positive",
        word_count=100,
        language="English",
        key_points="• Positive point",
    )
    contract.summarize("https://example.com/positive-article")

    # Negative article
    _setup_summary_mocks(
        direct_vm,
        summary="Negative summary",
        category="Business",
        sentiment="Negative",
        word_count=200,
        language="English",
        key_points="• Negative point",
    )
    contract.summarize("https://news.site.com/negative-article")

    # Filter by Positive
    positive_summaries = contract.get_summaries_by_sentiment("Positive")
    assert len(positive_summaries) == 1
    assert positive_summaries[0]["url"] == "https://example.com/positive-article"

    # Filter by Negative
    negative_summaries = contract.get_summaries_by_sentiment("Negative")
    assert len(negative_summaries) == 1
    assert negative_summaries[0]["url"] == "https://news.site.com/negative-article"

    # Filter by non-existent sentiment
    mixed_summaries = contract.get_summaries_by_sentiment("Mixed")
    assert len(mixed_summaries) == 0


def test_submitter_index_updated(direct_vm, direct_deploy, direct_alice):
    """Test that submitter index is updated correctly."""
    contract = direct_deploy("contracts/news_summarizer.py")
    direct_vm.sender = direct_alice

    alice = to_hex(direct_alice)

    _setup_summary_mocks(
        direct_vm,
        summary="Summary 1",
        category="Technology",
        sentiment="Positive",
        word_count=100,
        language="English",
        key_points="• Point 1",
    )
    contract.summarize("https://example.com/article1")

    _setup_summary_mocks(
        direct_vm,
        summary="Summary 2",
        category="Business",
        sentiment="Neutral",
        word_count=200,
        language="English",
        key_points="• Point 2",
    )
    contract.summarize("https://news.site.com/article2")

    submitter_summaries = contract.get_submitter_summaries(alice)
    assert len(submitter_summaries) == 2
    urls = [s["url"] for s in submitter_summaries]
    assert "https://example.com/article1" in urls
    assert "https://news.site.com/article2" in urls
