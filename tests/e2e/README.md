# E2E Smoke Tests

## Local run

1. Install deps and browser:

```bash
npm install
npx playwright install chromium
```

2. Set env vars:

```bash
E2E_USER_EMAIL=...
E2E_USER_PASSWORD=...
E2E_VERIFIER_EMAIL=... # optional, defaults to E2E_USER_EMAIL
E2E_API_URL=...        # optional, defaults to NEXT_PUBLIC_API_URL
```

3. Run:

```bash
npm run test:e2e
```

## Notes

- The critical flow test is skipped when `E2E_USER_EMAIL` or `E2E_USER_PASSWORD` is missing.
- The suite always keeps a basic landing-page smoke test active.
