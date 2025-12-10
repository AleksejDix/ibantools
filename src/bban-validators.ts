import { MOD_97 } from './core/constants';
import { mod9710 } from './core/helpers';

const mod11CheckDigit = (remainder: number): number => {
  if (remainder === 0) {
    return 0;
  }
  if (remainder === 1) {
    return 1;
  }
  return 11 - remainder;
};

const checkMod1110 = (toCheck: string, control: number): boolean => {
  let nr = 10;
  for (let index = 0; index < toCheck.length; index++) {
    nr += parseInt(toCheck.charAt(index), 10);
    if (nr % 10 !== 0) {
      nr %= 10;
    }
    nr *= 2;
    nr %= 11;
  }
  return control === (11 - nr === 10 ? 0 : 11 - nr);
};

export const checkNorwayBBAN = (bban: string): boolean => {
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const bbanWithoutSpacesAndPeriods = bban.replace(/[\s.]+/g, '');
  const controlDigit = parseInt(bbanWithoutSpacesAndPeriods.charAt(10), 10);
  const bbanWithoutControlDigit = bbanWithoutSpacesAndPeriods.substring(0, 10);
  let sum = 0;
  for (let index = 0; index < 10; index++) {
    sum += parseInt(bbanWithoutControlDigit.charAt(index), 10) * weights[index]!;
  }
  const remainder = sum % 11;
  return controlDigit === (remainder === 0 ? 0 : 11 - remainder);
};

export const checkBelgianBBAN = (bban: string): boolean => {
  const stripped = bban.replace(/[\s.]+/g, '');
  const checkingPart = parseInt(stripped.substring(0, stripped.length - 2), 10);
  const checksum = parseInt(stripped.substring(stripped.length - 2, stripped.length), 10);
  const remainder = checkingPart % MOD_97 === 0 ? MOD_97 : checkingPart % MOD_97;
  return remainder === checksum;
};

export const checkMod9710BBAN = (bban: string): boolean => {
  const stripped = bban.replace(/[\s.]+/g, '');
  const reminder = mod9710(stripped);
  return reminder === 1;
};

export const checkPolandBBAN = (bban: string): boolean => {
  const weights = [3, 9, 7, 1, 3, 9, 7];
  const controlDigit = parseInt(bban.charAt(7), 10);
  const toCheck = bban.substring(0, 7);
  let sum = 0;
  for (let index = 0; index < 7; index++) {
    sum += parseInt(toCheck.charAt(index), 10) * weights[index]!;
  }
  const remainder = sum % 10;
  return controlDigit === (remainder === 0 ? 0 : 10 - remainder);
};

export const checkSpainBBAN = (bban: string): boolean => {
  const weightsBankBranch = [4, 8, 5, 10, 9, 7, 3, 6];
  const weightsAccount = [1, 2, 4, 8, 5, 10, 9, 7, 3, 6];
  const controlBankBranch = parseInt(bban.charAt(8), 10);
  const controlAccount = parseInt(bban.charAt(9), 10);
  const bankBranch = bban.substring(0, 8);
  const account = bban.substring(10, 20);
  let sum = 0;
  for (let index = 0; index < 8; index++) {
    sum += parseInt(bankBranch.charAt(index), 10) * weightsBankBranch[index]!;
  }
  let remainder = sum % 11;
  if (controlBankBranch !== mod11CheckDigit(remainder)) {
    return false;
  }
  sum = 0;
  for (let index = 0; index < 10; index++) {
    sum += parseInt(account.charAt(index), 10) * weightsAccount[index]!;
  }
  remainder = sum % 11;
  return controlAccount === mod11CheckDigit(remainder);
};

export const checkCroatianBBAN = (bban: string): boolean => {
  const controlBankBranch = parseInt(bban.charAt(6), 10);
  const controlAccount = parseInt(bban.charAt(16), 10);
  const bankBranch = bban.substring(0, 6);
  const account = bban.substring(7, 16);
  return checkMod1110(bankBranch, controlBankBranch) && checkMod1110(account, controlAccount);
};

export const checkCzechAndSlovakBBAN = (bban: string): boolean => {
  const weightsPrefix = [10, 5, 8, 4, 2, 1];
  const weightsSuffix = [6, 3, 7, 9, 10, 5, 8, 4, 2, 1];
  const controlPrefix = parseInt(bban.charAt(9), 10);
  const controlSuffix = parseInt(bban.charAt(19), 10);
  const prefix = bban.substring(4, 9);
  const suffix = bban.substring(10, 19);
  let sum = 0;
  for (let index = 0; index < prefix.length; index++) {
    sum += parseInt(prefix.charAt(index), 10) * weightsPrefix[index]!;
  }
  let remainder = sum % 11;
  if (controlPrefix !== mod11CheckDigit(remainder)) {
    return false;
  }
  sum = 0;
  for (let index = 0; index < suffix.length; index++) {
    sum += parseInt(suffix.charAt(index), 10) * weightsSuffix[index]!;
  }
  remainder = sum % 11;
  return controlSuffix === mod11CheckDigit(remainder);
};

export const checkEstonianBBAN = (bban: string): boolean => {
  const weights = [7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7];
  const controlDigit = parseInt(bban.charAt(15), 10);
  const toCheck = bban.substring(2, 15);
  let sum = 0;
  for (let index = 0; index < toCheck.length; index++) {
    sum += parseInt(toCheck.charAt(index), 10) * weights[index]!;
  }
  const remainder = sum % 10;
  return controlDigit === (remainder === 0 ? 0 : 10 - remainder);
};

export const checkFrenchBBAN = (bban: string): boolean => {
  const stripped = bban.replace(/[\s.]+/g, '');
  const normalized = Array.from(stripped);
  for (let index = 0; index < stripped.length; index++) {
    const charCode = normalized[index]!.charCodeAt(0);
    if (charCode >= 65) {
      switch (charCode) {
        case 65:
        case 74:
          normalized[index] = '1';
          break;
        case 66:
        case 75:
        case 83:
          normalized[index] = '2';
          break;
        case 67:
        case 76:
        case 84:
          normalized[index] = '3';
          break;
        case 68:
        case 77:
        case 85:
          normalized[index] = '4';
          break;
        case 69:
        case 78:
        case 86:
          normalized[index] = '5';
          break;
        case 70:
        case 79:
        case 87:
          normalized[index] = '6';
          break;
        case 71:
        case 80:
        case 88:
          normalized[index] = '7';
          break;
        case 72:
        case 81:
        case 89:
          normalized[index] = '8';
          break;
        case 73:
        case 82:
        case 90:
          normalized[index] = '9';
          break;
      }
    }
  }
  const remainder = mod9710(normalized.join(''));
  return remainder === 0;
};

export const checkHungarianBBAN = (bban: string): boolean => {
  const weights = [9, 7, 3, 1, 9, 7, 3, 1, 9, 7, 3, 1, 9, 7, 3];
  const controlDigitBankBranch = parseInt(bban.charAt(7), 10);
  const toCheckBankBranch = bban.substring(0, 7);
  let sum = 0;
  for (let index = 0; index < toCheckBankBranch.length; index++) {
    sum += parseInt(toCheckBankBranch.charAt(index), 10) * weights[index]!;
  }
  const remainder = sum % 10;
  if (controlDigitBankBranch !== (remainder === 0 ? 0 : 10 - remainder)) {
    return false;
  }
  sum = 0;
  if (bban.endsWith('00000000')) {
    const toCheckAccount = bban.substring(8, 15);
    const controlDigitAccount = parseInt(bban.charAt(15), 10);
    for (let index = 0; index < toCheckAccount.length; index++) {
      sum += parseInt(toCheckAccount.charAt(index), 10) * weights[index]!;
    }
    const accountRemainder = sum % 10;
    return controlDigitAccount === (accountRemainder === 0 ? 0 : 10 - accountRemainder);
  }
  const toCheckAccount = bban.substring(8, 23);
  const controlDigitAccount = parseInt(bban.charAt(23), 10);
  for (let index = 0; index < toCheckAccount.length; index++) {
    sum += parseInt(toCheckAccount.charAt(index), 10) * weights[index]!;
  }
  const accountRemainder = sum % 10;
  return controlDigitAccount === (accountRemainder === 0 ? 0 : 10 - accountRemainder);
};
