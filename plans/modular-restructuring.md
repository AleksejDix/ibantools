# IBANTools Modular Restructuring Plan

## 📊 Quick Progress Overview

| Step | Task | Status | Files |
|------|------|--------|-------|
| 1 | Extract Core Foundation | ✅ Complete | `core/constants.ts`, `core/types.ts`, `core/helpers.ts` |
| 2 | Extract BBAN Validators | ✅ Complete | `bban-validators.ts` |
| 3 | Extract Function Groups | ✅ Complete | `utils.ts` ✅, `iban.ts` ✅, `bic.ts` ✅, `bban.ts` ✅ |
| 4 | Split Country Specs | ⏳ Not Started | `countries/specs-*.ts`, `countries/utils.ts` |
| 5 | Update Main Index | ⏳ Not Started | Finalize `index.ts` re-exports |
| 6 | Update Build Config | ⏳ Not Started | `vite.config.ts`, `package.json` exports |
| 7 | Documentation | ⏳ Not Started | `README.md`, `CLAUDE.md` |
| 8 | Final Validation | ⏳ Not Started | Tests, lint, coverage, tree-shaking verification |

**Overall Progress: ~37% Complete (3 / 8 steps)**

---

## 🎯 Next Steps (Immediate Actions)

**Current Status:** Step 3 is complete! All function groups have been extracted and tests pass.

**What to do next:**

1. **Create `src/countries/specs-all.ts`** - Move entire countrySpecs object from index.ts
2. **Create `src/countries/specs-sepa.ts`** - Extract 37 SEPA countries
3. **Create `src/countries/specs-iban-registry.ts`** - Extract 107 IBAN Registry countries
4. **Create `src/countries/specs-common.ts`** - Extract top 20 most used countries
5. **Create `src/countries/utils.ts`** - Move getCountrySpecifications(), isSEPACountry(), setCountryBBANValidation()

**See "Progress Status" section below for detailed completion status.**

---

## Goal
Restructure IBANTools library to enable tree-shaking, reducing bundle size by 70-98% for minimal use cases while maintaining 100% backward compatibility.

## Problem
Current: Single 1,866 line file. Users importing format utilities get entire library (~28KB including all 249 country specs).

## Solution: Balanced Modular Architecture (Approach 2)

### Benefits
- **98% reduction** for format utilities only (0.5KB vs 28KB)
- **57% reduction** for IBAN+BIC validation (12KB vs 28KB)
- **Zero breaking changes** - existing code works unchanged
- **15-20 source files** - maintainable structure
- **No circular dependencies** - clean architecture

### New Directory Structure

```
src/
├── index.ts                          # Main export (backward compatible - only barrel for compat)
├── core/
│   ├── constants.ts                  # MOD_97, MOD_97_REMAINDER
│   ├── types.ts                      # All interfaces/types
│   └── helpers.ts                    # Internal utilities
├── iban.ts                           # All IBAN functions (~250 lines)
├── bic.ts                            # All BIC functions (~120 lines)
├── bban-validators.ts                # 14 country validators (~280 lines) - pure functions
├── bban.ts                           # isValidBBAN (~30 lines) - imports validators & specs
├── countries/
│   ├── specs-all.ts                  # All 249 countries (~940 lines)
│   ├── specs-sepa.ts                 # 37 SEPA countries
│   ├── specs-iban-registry.ts        # 107 IBAN Registry countries
│   ├── specs-common.ts               # Top 20 most used countries
│   └── utils.ts                      # getCountrySpecifications, isSEPACountry
└── utils.ts                          # electronicFormatIBAN, friendlyFormatIBAN
```

**No barrel exports except main index.ts** - All package.json exports point directly to specific modules.

### Dependency Graph (No Cycles)

```
bban-validators.ts ← specs-all.ts ← bban.ts
                 ↑
      helpers.ts ← iban.ts
                 ↑
                 bic.ts
```

### Import Patterns

**Backward Compatible (unchanged):**
```typescript
import * as iban from 'ibantools';
iban.isValidIBAN('NL91ABNA0417164300'); // Still works!
```

**Tree-Shakable (new):**
```typescript
// Format utilities only (0.5KB)
import { electronicFormatIBAN } from 'ibantools/utils';

// IBAN validation (10KB)
import { isValidIBAN } from 'ibantools/iban';

// BIC validation (2KB)
import { isValidBIC } from 'ibantools/bic';

// Country metadata (11KB)
import { isSEPACountry } from 'ibantools/countries';
```

## Implementation Steps

### Step 1: Extract Core Foundation
1. Create `src/core/constants.ts` - Extract MOD_97, MOD_97_REMAINDER
2. Create `src/core/types.ts` - Extract all interfaces, types, enums
3. Create `src/core/helpers.ts` - Extract internal utilities:
   - `mod9710()`, `mod9710Iban()`, `replaceCharaterWithCode()`
   - `isValidIBANChecksum()`, `checkFormatBBAN()`

**Test:** Run `npm test` to ensure extraction doesn't break anything

### Step 2: Extract BBAN Validators (Break Circular Deps)
1. Create `src/bban-validators.ts` - Extract 14 country validators:
   - `checkNorwayBBAN`, `checkBelgianBBAN`, `checkPolandBBAN`
   - `checkSpainBBAN`, `checkCroatianBBAN`, `checkCzechAndSlovakBBAN`
   - `checkEstonianBBAN`, `checkFrenchBBAN`, `checkHungarianBBAN`
   - `checkMod9710BBAN`, `mod11CheckDigit`, `checkMod1110`
   - All helpers: `mod9710`, `addIbanChecksum`
2. Keep as pure functions - import only from `core/helpers`

**Why:** Prevents circular dependency when country specs reference validators

**Test:** Verify validators work independently

### Step 3: Extract Function Groups
1. Create `src/utils.ts` - Pure utilities (zero dependencies):
   - `electronicFormatIBAN()`
   - `friendlyFormatIBAN()`

2. Create `src/iban.ts` - All IBAN operations:
   - `isValidIBAN()`, `validateIBAN()`, `composeIBAN()`
   - `extractIBAN()`, `isQRIBAN()`
   - Import from `core/helpers` and temporarily from old `countrySpecs`

3. Create `src/bic.ts` - All BIC operations:
   - `isValidBIC()`, `validateBIC()`, `extractBIC()`

4. Create `src/bban.ts` - BBAN operations:
   - `isValidBBAN()`
   - Import validators from `bban-validators.ts`

**Test:** Run full test suite

### Step 4: Split Country Specs
1. Create `src/countries/specs-all.ts`:
   - Move entire `countrySpecs` object (all 249 countries)
   - Import validators from `../bban-validators`

2. Create `src/countries/specs-sepa.ts`:
   - 37 SEPA countries: AT, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GI, GR, HR, HU, IE, IS, IT, LI, LT, LU, LV, MC, MT, NL, NO, PL, PT, RO, SE, SI, SK, SM, VA

3. Create `src/countries/specs-iban-registry.ts`:
   - 107 countries with `IBANRegistry: true`

4. Create `src/countries/specs-common.ts`:
   - Top 20: NL, DE, FR, ES, IT, GB, BE, AT, CH, NO, SE, DK, FI, PL, IE, PT, CZ, GR, LU, HR

5. Create `src/countries/utils.ts`:
   - `getCountrySpecifications()`, `setCountryBBANValidation()`, `isSEPACountry()`

**Test:** Verify all country groupings

### Step 5: Update Main Index
Update `src/index.ts` to re-export everything:
```typescript
export * from './iban';
export * from './bic';
export * from './bban';
export * from './countries/utils';
export * from './utils';
export * from './core/types';
export { countrySpecs } from './countries/specs-all';
```

**Test:** Ensure `import * as iban from 'ibantools'` works exactly as before

### Step 6: Update Build Config
1. Update `vite.config.ts` with multiple entry points:
   - index, iban, bic, bban, bban-validators, utils
   - countries-utils, countries-specs-all, countries-specs-sepa, countries-specs-iban-registry, countries-specs-common

2. Update `package.json` exports map with direct module references (no barrels):
   - `"."` → `./dist/index.js` - Main export (backward compatible)
   - `"./iban"` → `./dist/iban.js` - IBAN functions
   - `"./bic"` → `./dist/bic.js` - BIC functions
   - `"./bban"` → `./dist/bban.js` - BBAN functions
   - `"./utils"` → `./dist/utils.js` - Format utilities
   - `"./countries"` → `./dist/countries/utils.js` - Country utilities
   - `"./countries/all"` → `./dist/countries/specs-all.js` - All country specs
   - `"./countries/sepa"` → `./dist/countries/specs-sepa.js` - SEPA countries
   - `"./countries/iban-registry"` → `./dist/countries/specs-iban-registry.js` - IBAN Registry
   - `"./countries/common"` → `./dist/countries/specs-common.js` - Common countries

**Test:** Build and verify output structure

### Step 7: Documentation
1. Update README.md:
   - Add "Tree-Shaking Support" section
   - Document import patterns with examples
   - Show bundle size comparisons (before/after)

2. Update CLAUDE.md:
   - Document new architecture
   - Explain module boundaries
   - Update development guidelines

### Step 8: Final Validation
1. Run `npm test` - All tests pass
2. Run `npm run coverage` - Maintain 100% coverage
3. Run `npm run all` - Tests + lint + docs
4. Test tree-shaking with sample project
5. Measure actual bundle sizes

## Critical Files

### Must Modify
- `/Users/aleksej/Projects/ibantools/src/index.ts` - Update to re-export from new modules
- `/Users/aleksej/Projects/ibantools/vite.config.ts` - Add multiple entry points
- `/Users/aleksej/Projects/ibantools/package.json` - Add exports map
- `/Users/aleksej/Projects/ibantools/README.md` - Document new import patterns
- `/Users/aleksej/Projects/ibantools/CLAUDE.md` - Update architecture docs

### Must Create (New Files)
- `/Users/aleksej/Projects/ibantools/src/core/constants.ts`
- `/Users/aleksej/Projects/ibantools/src/core/types.ts`
- `/Users/aleksej/Projects/ibantools/src/core/helpers.ts`
- `/Users/aleksej/Projects/ibantools/src/iban.ts`
- `/Users/aleksej/Projects/ibantools/src/bic.ts`
- `/Users/aleksej/Projects/ibantools/src/bban-validators.ts`
- `/Users/aleksej/Projects/ibantools/src/bban.ts`
- `/Users/aleksej/Projects/ibantools/src/countries/specs-all.ts`
- `/Users/aleksej/Projects/ibantools/src/countries/specs-sepa.ts`
- `/Users/aleksej/Projects/ibantools/src/countries/specs-iban-registry.ts`
- `/Users/aleksej/Projects/ibantools/src/countries/specs-common.ts`
- `/Users/aleksej/Projects/ibantools/src/countries/utils.ts`
- `/Users/aleksej/Projects/ibantools/src/utils.ts`

## Bundle Size Impact

| Use Case | Current | New | Reduction |
|----------|---------|-----|-----------|
| Full import | 28KB | 28KB | 0% (unchanged) |
| Format utilities only | 28KB | 0.5KB | **98%** |
| IBAN validation | 28KB | 10KB | 64% |
| IBAN + BIC | 28KB | 12KB | 57% |
| Country metadata | 28KB | 11KB | 61% |

## Risk Mitigation

1. **Circular Dependencies:** Validators extracted separately, imported by country specs (one direction only)
2. **Breaking Changes:** Main export unchanged, all public functions re-exported
3. **Test Coverage:** Must maintain 100% coverage throughout
4. **Type Safety:** All modules properly typed with TypeScript
5. **Build Complexity:** Vite natively handles multiple entries with `preserveModules: true`

## Success Criteria

✅ All existing tests pass
✅ 100% test coverage maintained
✅ `import * as iban from 'ibantools'` works unchanged
✅ Format utilities bundle to <1KB
✅ No circular dependencies
✅ Build succeeds with no errors
✅ Lint passes (`npm run lint`)
✅ Documentation complete

## Progress Status

### ✅ Completed Steps

#### Step 1: Extract Core Foundation ✅
- `src/core/constants.ts` - Contains MOD_97, MOD_97_REMAINDER
- `src/core/types.ts` - All interfaces, types, enums (ValidationErrorsIBAN, ValidationErrorsBIC, etc.)
- `src/core/helpers.ts` - Internal utilities (mod9710, mod9710Iban, checkFormatBBAN, isValidIBANChecksum, etc.)
- `src/index.ts` updated to import from core modules
- Tests passing ✓

#### Step 2: Extract BBAN Validators ✅
- `src/bban-validators.ts` created with all 14 country validators
- Includes helper functions: mod11CheckDigit, checkMod1110
- All validator functions: checkNorwayBBAN, checkBelgianBBAN, checkPolandBBAN, checkSpainBBAN, checkCroatianBBAN, checkCzechAndSlovakBBAN, checkEstonianBBAN, checkFrenchBBAN, checkHungarianBBAN, checkMod9710BBAN
- Imports from core/constants and core/helpers
- `src/index.ts` updated to import validators
- Tests passing ✓

#### Step 3: Extract Function Groups ✅
- ✅ `src/utils.ts` created with format utilities (electronicFormatIBAN, friendlyFormatIBAN)
- ✅ `src/iban.ts` created with IBAN functions (isValidIBAN, validateIBAN, composeIBAN, extractIBAN, isQRIBAN)
- ✅ `src/bic.ts` created with BIC functions (isValidBIC, validateBIC, extractBIC)
- ✅ `src/bban.ts` created with BBAN functions (isValidBBAN)
- ✅ `src/index.ts` updated to re-export from new modules
- ✅ All 258 tests passing

### 🔄 Current Task: Start Step 4 - Split Country Specs

Need to create country specification modules and move from index.ts

### 📋 Remaining Steps

#### Step 4: Split Country Specs (Not Started)
Create country specification modules and move from index.ts

#### Step 5: Update Main Index (Not Started)
Finalize re-exports and remove old code

#### Step 6: Update Build Config (Not Started)
Configure Vite and package.json exports

#### Step 7: Documentation (Not Started)
Update README and CLAUDE.md

#### Step 8: Final Validation (Not Started)
Run full test suite and validate tree-shaking

## Actionable Tasks (each yields a working library)

- ✅ **DONE**: Extract core foundations: create `src/core/{constants,types,helpers}.ts`, move MOD97/constants/types/helpers; keep existing API intact; run `npm test`.
- ✅ **DONE**: Isolate BBAN validators: create `src/bban-validators.ts` with all country validators/helpers; wire old references to it; run `npm test`.
- ✅ **DONE**: Split function groups: create `src/utils.ts`, `src/iban.ts`, `src/bic.ts`, `src/bban.ts`; rewire imports to core + validators; ensure `src/index.ts` still re-exports legacy surface; run full test suite. All 258 tests pass!
- 🔄 **IN PROGRESS**: Partition country specs: add `src/countries/specs-{all,sepa,iban-registry,common}.ts` and `src/countries/utils.ts`; update consumers to new paths; tests stay green.
- ⏳ **TODO**: Update main barrel: adjust `src/index.ts` to re-export new modules and `countrySpecs`; verify `import * as iban from 'ibantools'` still works via tests/smoke.
- ⏳ **TODO**: Build system updates: expand Vite entry points and `package.json` exports to new modules; build succeeds; spot-check generated dist layout.
- ⏳ **TODO**: Documentation pass: update README/CLAUDE with new import patterns, tree-shaking guidance, bundle size notes.
- ⏳ **TODO**: Final validation: run lint/test/coverage/build; optional bundle-size check with sample tree-shake build.
