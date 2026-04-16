.PHONY: install dev test test-cov lint format clean

install:
	pip install -r requirements.txt

dev:
	uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

test:
	pytest backend/tests/ -v

test-cov:
	pytest backend/tests/ -v --cov=backend --cov-report=html

lint:
	ruff check backend/

format:
	ruff format backend/

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null; true
	find . -name "*.pyc" -delete 2>/dev/null; true
	rm -rf .coverage htmlcov/ .pytest_cache/
