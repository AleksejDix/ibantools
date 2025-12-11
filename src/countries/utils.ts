/*!
 * @license
 * Licensed under the Mozilla Public License, Version 2.0 or the MIT license,
 * at your option.
 * SPDX-License-Identifier: MIT or MPL/2.0
 */

import { type CountryMap } from '../core/types';
import { countrySpecs } from './specs-all';

/**
 * Validate if country code is from a SEPA country
 * ```
 * // returns true
 * ibantools.isSEPACountry("NL");
 * ```
 * ```
 * // returns false
 * ibantools.isSEPACountry("PK");
 * ```
 */
export function isSEPACountry(countryCode: string): boolean {
  if (countryCode !== undefined && countryCode !== null) {
    const spec = countrySpecs[countryCode];
    if (spec !== undefined) {
      return spec.SEPA ? spec.SEPA : false;
    }
  }
  return false;
}

/**
 * Returns specifications for all countries, even those who are not
 * members of IBAN registry. `IBANRegistry` field indicates if country
 * is member of not.
 *
 * ```
 * // Get country specifications
 * const specs = ibantools.getCountrySpecifications();
 * const nlSpec = specs['NL'];
 * console.log(nlSpec.chars); // 18
 * console.log(nlSpec.bban_regexp); // '^[A-Z]{4}[0-9]{10}$'
 * console.log(nlSpec.SEPA); // true
 * ```
 */
export function getCountrySpecifications(): CountryMap {
  const countyMap: CountryMap = {};
  for (const [countyCode, county] of Object.entries(countrySpecs)) {
    countyMap[countyCode] = {
      chars: county.chars || null,
      bban_regexp: county.bban_regexp || null,
      IBANRegistry: county.IBANRegistry || false,
      SEPA: county.SEPA || false,
    };
  }

  return countyMap;
}

/**
 * Set custom BBAN validation function for country.
 *
 * If `bban_validation_func` already exists for the corresponding country,
 * it will be overwritten.
 */
export const setCountryBBANValidation = (country: string, func: (bban: string) => boolean): boolean => {
  if (typeof countrySpecs[country] === 'undefined') {
    return false;
  }

  countrySpecs[country].bban_validation_func = func;
  return true;
};
