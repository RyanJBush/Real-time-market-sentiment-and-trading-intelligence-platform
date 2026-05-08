# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| latest (`main`) | ✅ |

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Instead, report them via email to **ryanjbush@gmail.com** with the subject line `[SECURITY] Market Sentiment Platform — <brief description>`.

Include:
- A description of the vulnerability and its potential impact
- Steps to reproduce
- Any suggested remediation if known

You can expect an acknowledgement within **48 hours** and a resolution timeline within **7 days** for critical issues.

## API Key Safety

This project uses financial data API keys and LLM credentials. **Never commit API keys to this repository.** Use `.env` files excluded via `.gitignore`. If a key has been accidentally committed, rotate it immediately.

## Scope

This project is a portfolio/demonstration platform. It does not execute real trades or connect to live brokerage accounts.
