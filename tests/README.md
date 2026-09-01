# AI News Summarizer - Tests

## Overview

This directory contains tests for the AI News Summarizer GenLayer Intelligent Contract.

## Test Structure

```
tests/
├── direct/                    # Fast in-memory tests (no Studio required)
│   ├── __init__.py
│   ├── conftest.py           # Shared helpers
│   └── test_news_summarizer.py  # Contract tests
└── README.md                 # This file
```

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Ensure GenLayer CLI is installed:
   ```bash
   npm install -g genlayer
   ```

### Direct Mode Tests

Direct mode tests run contracts in-memory without needing GenLayer Studio. They use mocks for web requests and LLM calls, giving fast feedback (~milliseconds per test).

```bash
# Run all direct tests
pytest tests/direct/ -v

# Run specific test file
pytest tests/direct/test_news_summarizer.py -v

# Run specific test
pytest tests/direct/test_news_summarizer.py::test_summarize_basic -v
```

### Integration Tests

Integration tests deploy the contract to GenLayer Studio and test with real consensus. These require GenLayer Studio running (local or hosted).

```bash
# Run integration tests
gltest tests/integration/ -v -s
```

## Test Coverage

### Contract Features Tested

1. **Basic Summarization**
   - Summarize a URL with AI analysis
   - Store summary with metadata (category, sentiment, word count, language, key points)

2. **Validation**
   - Duplicate URL rejection
   - Invalid URL format rejection

3. **Statistics**
   - Total summaries counter
   - URLs by domain tracking
   - Categories count tracking
   - Sentiment count tracking

4. **Query Methods**
   - Get summary by URL
   - Get all summaries
   - Get submitter summaries
   - Get summaries by category
   - Get summaries by sentiment

5. **Submitter Tracking**
   - Track who submitted each URL
   - Filter summaries by submitter

## Mocking Strategy

### Web Mocks

```python
direct_vm.mock_web(
    r".*example\.com.*",  # URL pattern (regex)
    {"status": 200, "body": "Page content here"}  # Response
)
```

### LLM Mocks

```python
direct_vm.mock_llm(
    r".*Analyze the following.*",  # Prompt pattern (regex)
    json.dumps({"summary": "...", "category": "..."})  # Response
)
```

## Writing New Tests

### Test Structure

```python
def test_feature_name(direct_vm, direct_deploy, direct_alice):
    # 1. Deploy contract
    contract = direct_deploy("contracts/news_summarizer.py")
    
    # 2. Set sender
    direct_vm.sender = direct_alice
    
    # 3. Setup mocks (if needed)
    direct_vm.mock_web(...)
    direct_vm.mock_llm(...)
    
    # 4. Call contract method
    contract.method_name(args)
    
    # 5. Assert results
    assert contract.get_view() == expected_value
```

### Available Fixtures

- `direct_vm` - Virtual machine for setting sender and mocks
- `direct_deploy` - Function to deploy contracts in-memory
- `direct_alice` - Test account address (Alice)
- `direct_bob` - Test account address (Bob)

### Helper Functions

- `to_hex(addr_bytes)` - Convert address bytes to checksummed hex

## Best Practices

1. **Keep tests fast** - Use direct mode for unit tests
2. **Mock external calls** - Always mock web and LLM calls
3. **Test edge cases** - Include error scenarios
4. **Use descriptive names** - Test names should describe what they test
5. **Isolate tests** - Each test should be independent

## Troubleshooting

### Common Issues

1. **Import errors** - Ensure GenLayer is installed: `pip install genlayer-test`
2. **Mock not matching** - Check regex patterns match your prompts/URLs
3. **Contract not found** - Verify contract path is correct: `contracts/news_summarizer.py`

### Debug Mode

Run tests with verbose output:

```bash
pytest tests/direct/ -v -s
```

### Clear Mocks

Reset mocks between tests:

```python
direct_vm.clear_mocks()
```
