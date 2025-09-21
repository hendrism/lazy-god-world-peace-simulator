# Documentation

This folder provides JSON Schemas that mirror the simplified data models used by the prototype. They are intended for validation of save files, API responses, and long term contract tests.

Schemas included:
- nation_schema.json
- assistant_schema.json
- event_schema.json
- gamestate_schema.json

Validation tips:
- Install the project requirements (`pip install -r backend/requirements.txt`) and run the automated contract tests with `pytest`.
- Use `jsonschema` (already bundled in the requirements) to validate payloads captured from the CLI or API against these definitions.
