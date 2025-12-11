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
 * BBAN validation functions
 * @module bban
 */
'use strict';

import { checkFormatBBAN } from './core/helpers';
import { countrySpecs } from './index';

/**
 * Validate BBAN
 *
 * ```
 * // returns true
 * ibantools.isValidBBAN("ABNA0417164300", "NL");
 * ```
 * ```
 * // returns false
 * ibantools.isValidBBAN("A7NA0517164300", "NL");
 * ```
 */
export function isValidBBAN(bban: string | null | undefined, countryCode: string | null | undefined): boolean {
  if (bban === undefined || bban === null || countryCode === undefined || countryCode === null) {
    return false;
  }

  const spec = countrySpecs[countryCode];

  if (
    spec === undefined ||
    spec === null ||
    spec.bban_regexp === undefined ||
    spec.bban_regexp === null ||
    spec.chars === undefined ||
    spec.chars === null
  ) {
    return false;
  }

  if (spec.chars - 4 === bban.length && checkFormatBBAN(bban, spec.bban_regexp)) {
    if (spec.bban_validation_func) {
      return spec.bban_validation_func(bban.replace(/[\s.]+/g, ''));
    }
    return true;
  }
  return false;
}
