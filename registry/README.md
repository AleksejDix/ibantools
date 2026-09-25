# SWIFT IBAN Registry

This folder holds the SWIFT IBAN Registry and the builder that turns it into `src/countries/registry.ts`.

## Source

- **URL:** https://www.swift.com/swift-resource/11971/download
- **Current version:** v103 (September 2026)
- **Countries:** 89

## How the country data is built

- `src/countries/registry.ts` is **generated** from the newest `iban-registry-vXXX.txt` in this folder. It holds what the registry defines: IBAN length, BBAN pattern, SEPA and registry flags, and bank and branch positions. Never edit it by hand.
- `src/countries/specs.ts` merges hand-maintained **overrides** over it: national checksum validators, account positions, countries and territories outside the registry, and deliberate deviations (FR branch, SI bank and branch).
- CI regenerates `registry.ts` and fails if it differs from the committed file.
- `test/registry.test.ts` checks every country against the newest registry file.

## Updating to a new registry release

1. Download the TXT file from https://www.swift.com/swift-resource/11971/download.
2. Save it as `registry/iban-registry-vXXX.txt`, with the release number.
3. Run `npm run registry` to regenerate `src/countries/registry.ts`. The builder picks the newest file.
4. Run `npm test`. If an override in `specs.ts` conflicts with the new release, the registry test reports it.
5. Update the version above.

## TXT file format

The SWIFT TXT file is tab-separated, with one row per data field and one column per country. The builder reads:

- `IBAN prefix country code (ISO 3166)`
- `SEPA country`
- `IBAN length`
- `BBAN structure`, converted to a pattern with adjacent fields of the same type merged
- `Bank identifier position within the BBAN` and `Branch identifier position within the BBAN`, converted to 0-based positions

Some rows contain quoted values that span several lines. The builder joins continuation lines that start with `"\t`.
