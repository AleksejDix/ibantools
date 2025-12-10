# IBAN Registry Parser

Parses SWIFT IBAN Registry TXT file to generate `script/iban_spec.js`.

## Source

SWIFT provides the IBAN Registry in TXT format:
- **URL:** https://www.swift.com/swift-resource/11971/download
- **Current version:** v101 (December 2025)
- **Countries:** 89

## Usage

```bash
# Generate iban_spec.js from TXT source
node registry/builder.mjs

# Custom output path
node registry/builder.mjs --output /path/to/output.js
```

## Files

```
registry/
├── iban-registry-v101.txt  # SWIFT TXT source (89 countries)
├── builder.mjs             # Parser script
└── README.md               # This file

script/
└── iban_spec.js            # Generated output
```

## Updating

When SWIFT releases a new registry version:

1. Download TXT from https://www.swift.com/swift-resource/11971/download
2. Save as `registry/iban-registry-vXXX.txt` (e.g., `iban-registry-v102.txt`)
3. Run `node registry/builder.mjs` (auto-detects latest version)
4. Verify output with `npm test`

## Generated Output

The parser generates `script/iban_spec.js` with:

| Field | Description |
|-------|-------------|
| `chars` | IBAN length |
| `bban_regexp` | Regex derived from BBAN structure |
| `IBANRegistry` | Always `true` |
| `SEPA` | SEPA membership status |
| `bank_identifier` | Bank ID position (0-based) |
| `branch_indentifier` | Branch ID position (0-based, if applicable) |
| `account_indentifier` | Account position (derived from domestic example) |

## TXT File Format

The SWIFT TXT file is tab-separated with rows for each data field and columns for each country. Key rows parsed:

- `Name of country`
- `IBAN prefix country code (ISO 3166)`
- `SEPA country`
- `IBAN length`
- `BBAN structure`
- `Bank identifier position within the BBAN`
- `Branch identifier position within the BBAN`
- `IBAN electronic format example`
- `Domestic account number example`

### Multi-line Handling

Some rows contain quoted values that span multiple lines. The parser handles this by joining continuation lines that start with `"\t`.
