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
 * BIC/SWIFT validation and extraction functions
 * @module bic
 */
'use strict';

import { type ExtractBICResult, type ValidateBICResult, ValidationErrorsBIC } from './core/types';
import { countrySpecs } from './countries/specs-all';

/**
 * Validate BIC/SWIFT
 *
 * ```
 * // returns true
 * ibantools.isValidBIC("ABNANL2A");
 *
 * // returns true
 * ibantools.isValidBIC("NEDSZAJJXXX");
 *
 * // returns false
 * ibantools.isValidBIC("ABN4NL2A");
 *
 * // returns false
 * ibantools.isValidBIC("ABNA NL 2A");
 * ```
 */
export function isValidBIC(bic: string | null | undefined): boolean {
  if (!bic) {
    return false;
  }
  const reg = new RegExp('^[a-zA-Z]{6}[a-zA-Z0-9]{2}([a-zA-Z0-9]{3})?$', '');
  const spec = countrySpecs[bic.toUpperCase().slice(4, 6)];
  return reg.test(bic) && spec !== undefined;
}

/**
 * BIC validation errors
 */
/**
 * validateBIC
 * ```
 * // returns {errorCodes: [], valid: true}
 * ibantools.validateBIC("NEDSZAJJXXX");
 * ```
 */
export function validateBIC(bic?: string | null): ValidateBICResult {
  const result = { errorCodes: [], valid: true } as ValidateBICResult;
  if (bic !== undefined && bic !== null && bic !== '') {
    const spec = countrySpecs[bic.toUpperCase().slice(4, 6)];
    if (spec === undefined) {
      result.valid = false;
      result.errorCodes.push(ValidationErrorsBIC.NoBICCountry);
    } else {
      const reg = new RegExp('^[a-zA-Z]{6}[a-zA-Z0-9]{2}([a-zA-Z0-9]{3})?$', '');
      if (!reg.test(bic)) {
        result.valid = false;
        result.errorCodes.push(ValidationErrorsBIC.WrongBICFormat);
      }
    }
  } else {
    result.valid = false;
    result.errorCodes.push(ValidationErrorsBIC.NoBICProvided);
  }
  return result;
}

/**
 * extractBIC
 * ```
 * // returns {bankCode: "ABNA", countryCode: "NL", locationCode: "2A", branchCode: null, testBIC: false, valid: true}
 * ibantools.extractBIC("ABNANL2A");
 * ```
 */
export function extractBIC(inputBic: string): ExtractBICResult {
  const result = {} as ExtractBICResult;
  const bic = inputBic.toUpperCase();
  if (isValidBIC(bic)) {
    result.bankCode = bic.slice(0, 4);
    result.countryCode = bic.slice(4, 6);
    result.locationCode = bic.slice(6, 8);
    result.testBIC = result.locationCode[1] === '0';
    result.branchCode = bic.length > 8 ? bic.slice(8) : null;
    result.valid = true;
  } else {
    result.valid = false;
  }
  return result;
}
