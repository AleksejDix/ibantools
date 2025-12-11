/*!
 * @license
 * Copyright Saša Jovanić
 * Licensed under the Mozilla Public License, Version 2.0 or the MIT license,
 * at your option. This file may not be copied, modified, or distributed
 * except according to those terms.
 * SPDX-FileCopyrightText: Saša Jovanić
 * SPDX-License-Identifier: MIT or MPL/2.0
 */

/**
 * Validation, extraction and creation of IBAN, BBAN, BIC/SWIFT numbers plus some other helpful stuff
 * @package Documentation
 * @author Saša Jovanić
 * @module ibantools
 * @version 4.5.1
 * @license MIT or MPL-2.0
 * @preferred
 */
'use strict';

// Re-export all public types
export { ValidationErrorsBIC, ValidationErrorsIBAN } from './core/types';
export type { ComposeIBANParams, CountryMap, CountrySpec, ExtractBICResult, ExtractIBANResult, ValidateBICResult, ValidateIBANOptions, ValidateIBANResult } from './core/types';

// Re-export utility functions
export { electronicFormatIBAN, friendlyFormatIBAN } from './utils';

// Re-export IBAN functions
export { composeIBAN, extractIBAN, isQRIBAN, isValidIBAN, validateIBAN } from './iban';

// Re-export BIC functions
export { extractBIC, isValidBIC, validateBIC } from './bic';

// Re-export BBAN functions
export { isValidBBAN } from './bban';

// Re-export country utilities and specs
export { getCountrySpecifications, isSEPACountry, setCountryBBANValidation } from './countries/utils';
export { countrySpecs } from './countries/specs-all';
