# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IBANTools is a TypeScript library (zero runtime dependencies) for validation, creation, and extraction of IBAN, BBAN, and BIC/SWIFT numbers. The library is published as an ES module with full TypeScript support and is dual-licensed under MIT or MPL-2.0.

## Development Commands

```bash
# Build the library (required before publishing)
npm run build

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report (must maintain 100% coverage)
npm run coverage

# Lint code
npm run lint

# Generate API documentation
npm run docs

# Run full validation suite (tests + lint + docs)
npm run all
```

## Testing

- Test file: `test/ibantools.test.ts`
- **Coverage requirement: 100%** - All pull requests must maintain 100% test coverage
- Run `npm run coverage` to verify coverage before committing

## Code Architecture

### Single-file Library Structure

The entire library is contained in `src/index.ts` (~1,866 lines). This is intentional for simplicity and contains:

1. **Validation Functions**: `isValidIBAN()`, `isValidBBAN()`, `isValidBIC()`
2. **Detailed Validation**: `validateIBAN()`, `validateBIC()` - return error codes for debugging
3. **Creation**: `composeIBAN()` - generates valid IBANs from country code + BBAN
4. **Extraction**: `extractIBAN()`, `extractBIC()` - parse and extract components
5. **Formatting**: `electronicFormatIBAN()`, `friendlyFormatIBAN()`
6. **Utilities**: `isSEPACountry()`, `isQRIBAN()`, `getCountrySpecifications()`

### Country Specifications (`countrySpecs`)

The core of the library is the `countrySpecs` object which contains validation rules for every country (including non-IBAN countries with empty specs). Each spec includes:

- `chars`: IBAN length
- `bban_regexp`: Regex pattern for BBAN validation
- `bban_validation_func`: Optional function for advanced validation (e.g., checksum validation for NO, BE, ES, HR, CZ, SK, EE, FR, MC, HU, PL)
- `IBANRegistry`: Whether country is in official SWIFT IBAN Registry
- `SEPA`: Whether country participates in SEPA
- `bank_identifier`, `branch_indentifier`, `account_indentifier`: Position ranges for extracting components

### IBAN Validation Algorithm

IBAN validation uses MOD-97-10 checksum (ISO 7064):
1. Extract BBAN (characters after first 4)
2. Move country code to end, append "00"
3. Replace letters with numbers (A=10, B=11, etc.)
4. Calculate MOD 97 on the numeric string in chunks (handles >30 digit integers)
5. Compare `98 - remainder` with provided checksum

### Country-Specific BBAN Validation

Many countries have additional BBAN validation beyond regex matching:
- **Belgium (BE)**: MOD-97 check on account number
- **Norway (NO)**: MOD-11 weighted checksum (weights: 5,4,3,2,7,6,5,4,3,2)
- **Poland (PL)**: MOD-10 weighted checksum on bank code
- **Spain (ES)**: Dual MOD-11 checksums (bank+branch, then account)
- **Croatia (HR)**: Dual MOD-11/10 checksums
- **Czech (CZ) / Slovakia (SK)**: Dual MOD-11 checksums on prefix and suffix
- **Estonia (EE)**: MOD-10 weighted checksum
- **France (FR) / Monaco (MC)**: Letter-to-number conversion + MOD-97
- **Hungary (HU)**: MOD-10 weighted checksums (bank+branch, then account)
- **Portugal (PT), Slovenia (SI), Serbia (RS), Montenegro (ME), Bosnia (BA), North Macedonia (MK)**: MOD-97/10 on full BBAN

### Extensibility

External packages can add custom BBAN validation via `setCountryBBANValidation(countryCode, validationFunc)`. Example: [IBANTools-Germany](https://github.com/baumerdev/ibantools-germany) adds detailed German validation.

## IBAN Registry Updates

The `countrySpecs` are derived from the SWIFT IBAN Registry. To update when a new registry version is released:

1. Download TXT file from https://www.swift.com/swift-resource/11971/download
2. Save as `registry/iban-registry-vXXX.txt` (where XXX is version number)
3. Run `node registry/builder.mjs` to regenerate country specifications
4. The builder script parses the tab-separated TXT file and generates proper TypeScript code
5. **Important**: The generated output needs to be manually integrated into `src/index.ts` - the builder doesn't automatically update the source file
6. Run `npm test` to verify all tests pass with updated specifications
7. Update version number in `registry/README.md`

## Build Configuration

- **Build tool**: Vite with TypeScript
- **Output**: ES modules only (no CommonJS)
- **Features**:
  - `preserveModules: true` for tree-shaking support
  - Source maps enabled
  - TypeScript declarations generated via `vite-plugin-dts`
  - Rollup types bundled into single `.d.ts` file

## Node Version

Requires Node.js `^20.19.0 || >=22.12.0` (aligned with Vite 7 and Vitest 4 requirements).

Project includes `.node-version` and `.nvmrc` files set to Node 22 for consistency.

## Pull Request Guidelines

Before submitting PRs:

1. Run `npm run all` to ensure tests, linting, and docs generation pass
2. Verify 100% test coverage maintained (`npm run coverage`)
3. Do not include changes to `dist/` directory (generated during publish)
4. Update tests in `test/ibantools.test.ts` for any functionality changes

## Git Commit Guidelines

- **Keep commits concise** - Single line subject, no multi-paragraph explanations
- **Never add attribution footers** - Do NOT include "Generated with Claude Code", "Co-Authored-By: Claude", or similar attribution lines
- Follow standard commit message format: `<type>: <description>` (e.g., "fix: IBAN validation for QR-IBANs")

## Linting

Uses `oxlint` (Rust-based fast linter) with TypeScript awareness:
```bash
oxlint --type-aware src/ test/
```

No configuration file needed - sensible defaults are used.
