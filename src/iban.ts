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
 * IBAN validation, extraction, and creation functions
 * @module iban
 */
'use strict';

import { checkFormatBBAN, isValidIBANChecksum, mod9710Iban } from './core/helpers';
import { type ComposeIBANParams, type ExtractIBANResult, type ValidateIBANOptions, type ValidateIBANResult, ValidationErrorsIBAN } from './core/types';
import { countrySpecs } from './countries/specs-all';
import { electronicFormatIBAN } from './utils';
import { isValidBBAN } from './bban';
import { MOD_97_REMAINDER } from './core/constants';

/**
 * Validate IBAN
 * ```
 * // returns true
 * ibantools.isValidIBAN("NL91ABNA0417164300");
 * ```
 * ```
 * // returns false
 * ibantools.isValidIBAN("NL92ABNA0517164300");
 * ```
 * ```
 * // returns true
 * ibantools.isValidIBAN('CH4431999123000889012');
 * ```
 * ```
 * // returns false
 * ibantools.isValidIBAN('CH4431999123000889012', { allowQRIBAN: false });
 * ```
 */
export function isValidIBAN(iban: string | null | undefined, validationOptions: ValidateIBANOptions = { allowQRIBAN: true }): boolean {
  if (iban === undefined || iban === null) {
    return false;
  }

  const reg = new RegExp('^[0-9]{2}$', '');
  const countryCode = iban.slice(0, 2);
  const spec = countrySpecs[countryCode];

  if (spec === undefined || spec.bban_regexp === undefined || spec.bban_regexp === null || spec.chars === undefined) {
    return false;
  }

  return (
    spec.chars === iban.length &&
    reg.test(iban.slice(2, 4)) &&
    isValidBBAN(iban.slice(4), countryCode) &&
    isValidIBANChecksum(iban) &&
    (validationOptions.allowQRIBAN || !isQRIBAN(iban))
  );
}

/**
 * validateIBAN
 * ```
 * // returns {errorCodes: [], valid: true}
 * ibantools.validateIBAN("NL91ABNA0417164300");
 * ```
 * ```
 * ```
 * // returns {errorCodes: [], valid: true}
 * ibantools.validateIBAN('CH4431999123000889012');
 * ```
 * ```
 * // returns {errorCodes: [7], valid: false}
 * ibantools.validateIBAN('CH4431999123000889012', { allowQRIBAN: false });
 * ```
 */
export function validateIBAN(
  iban?: string | null,
  validationOptions: ValidateIBANOptions = { allowQRIBAN: true },
): ValidateIBANResult {
  const result = { errorCodes: [], valid: true } as ValidateIBANResult;
  if (iban !== undefined && iban !== null && iban !== '') {
    const spec = countrySpecs[iban.slice(0, 2)];
    if (!spec || !(spec.bban_regexp || spec.chars)) {
      result.valid = false;
      result.errorCodes.push(ValidationErrorsIBAN.NoIBANCountry);
      return result;
    }
    if (spec && spec.chars && spec.chars !== iban.length) {
      result.valid = false;
      result.errorCodes.push(ValidationErrorsIBAN.WrongBBANLength);
    }
    if (spec && spec.bban_regexp && !checkFormatBBAN(iban.slice(4), spec.bban_regexp)) {
      result.valid = false;
      result.errorCodes.push(ValidationErrorsIBAN.WrongBBANFormat);
    }
    if (spec && spec.bban_validation_func && !spec.bban_validation_func(iban.slice(4))) {
      result.valid = false;
      result.errorCodes.push(ValidationErrorsIBAN.WrongAccountBankBranchChecksum);
    }
    const reg = new RegExp('^[0-9]{2}$', '');
    if (!reg.test(iban.slice(2, 4))) {
      result.valid = false;
      result.errorCodes.push(ValidationErrorsIBAN.ChecksumNotNumber);
    }
    if (result.errorCodes.includes(ValidationErrorsIBAN.WrongBBANFormat) || !isValidIBANChecksum(iban)) {
      result.valid = false;
      result.errorCodes.push(ValidationErrorsIBAN.WrongIBANChecksum);
    }
    if (!validationOptions.allowQRIBAN && isQRIBAN(iban)) {
      result.valid = false;
      result.errorCodes.push(ValidationErrorsIBAN.QRIBANNotAllowed);
    }
  } else {
    result.valid = false;
    result.errorCodes.push(ValidationErrorsIBAN.NoIBANProvided);
  }
  return result;
}

/**
 * Check if IBAN is QR-IBAN
 * ```
 * // returns true
 * ibantools.isQRIBAN("CH4431999123000889012");
 * ```
 * ```
 * // returns false
 * ibantools.isQRIBAN("NL92ABNA0517164300");
 * ```
 */
export function isQRIBAN(iban: string): boolean {
  if (iban === undefined || iban === null) {
    return false;
  }
  const countryCode = iban.slice(0, 2);
  const QRIBANCountries: string[] = ['LI', 'CH'];
  if (!QRIBANCountries.includes(countryCode)) {
    return false;
  }
  const reg = new RegExp('^3[0-1]{1}[0-9]{3}$', '');
  return reg.test(iban.slice(4, 9));
}

/**
 * composeIBAN
 *
 * ```
 * // returns NL91ABNA0417164300
 * ibantools.composeIBAN({ countryCode: "NL", bban: "ABNA0417164300" });
 * ```
 */
export function composeIBAN(params: ComposeIBANParams): string | null {
  const formated_bban: string = electronicFormatIBAN(params.bban ?? undefined) || '';
  if (params.countryCode === null || params.countryCode === undefined) {
    return null;
  }
  const spec = countrySpecs[params.countryCode];
  if (
    formated_bban !== '' &&
    spec !== undefined &&
    spec.chars &&
    spec.chars !== null &&
    spec.chars === formated_bban.length + 4 &&
    spec.bban_regexp &&
    spec.bban_regexp !== null &&
    checkFormatBBAN(formated_bban, spec.bban_regexp)
  ) {
    const checksom = mod9710Iban(`${params.countryCode}00${formated_bban}`);
    return `${params.countryCode}${`0${MOD_97_REMAINDER - checksom}`.slice(-2)}${formated_bban}`;
  }
  return null;
}

/**
 * extractIBAN
 * ```
 * // returns {iban: "NL91ABNA0417164300", bban: "ABNA0417164300", countryCode: "NL", valid: true, accountNumber: '0417164300', bankIdentifier: 'ABNA'}
 * ibantools.extractIBAN("NL91 ABNA 0417 1643 00");
 * ```
 */
export function extractIBAN(iban: string): ExtractIBANResult {
  const eFormatIBAN: string | null = electronicFormatIBAN(iban);
  const result: ExtractIBANResult = {
    iban: eFormatIBAN || iban,
    valid: false,
  };
  if (!!eFormatIBAN && isValidIBAN(eFormatIBAN)) {
    result.bban = eFormatIBAN.slice(4);
    result.countryCode = eFormatIBAN.slice(0, 2);
    result.valid = true;
    const spec = countrySpecs[result.countryCode];
    if (spec?.account_indentifier) {
      const [start, end] = spec.account_indentifier.split('-');
      if (start && end) {
        result.accountNumber = result.iban.slice(parseInt(start, 10), parseInt(end, 10) + 1);
      }
    }
    if (spec?.bank_identifier) {
      const [start, end] = spec.bank_identifier.split('-');
      if (start && end) {
        result.bankIdentifier = result.bban.slice(parseInt(start, 10), parseInt(end, 10) + 1);
      }
    }
    if (spec?.branch_indentifier) {
      const [start, end] = spec.branch_indentifier.split('-');
      if (start && end) {
        result.branchIdentifier = result.bban.slice(parseInt(start, 10), parseInt(end, 10) + 1);
      }
    }
  }
  return result;
}
