# Documentation

This folder provides JSON Schemas that mirror the simplified data models used by the prototype. They are intended for validation of save files, API responses, and long term contract tests.

Schemas included:
- nation_schema.json
- assistant_schema.json
- event_schema.json
- gamestate_schema.json

Validation tip:
- Use ajv or python-jsonschema to validate example payloads from the running API.
