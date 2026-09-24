import { mod9710, stripSpacesAndPeriods, weightedSum } from './core/checksum';
import { MOD_97 } from './core/constants';

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

const NORWAY_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2] as const;

export const checkNorwayBBAN = (bban: string): boolean => {
  const stripped = stripSpacesAndPeriods(bban);
  const controlDigit = parseInt(stripped.charAt(10), 10);
  const remainder = weightedSum(stripped.substring(0, 10), NORWAY_WEIGHTS) % 11;
  return controlDigit === (remainder === 0 ? 0 : 11 - remainder);
};

export const checkBelgianBBAN = (bban: string): boolean => {
  const stripped = stripSpacesAndPeriods(bban);
  const checkingPart = parseInt(stripped.substring(0, stripped.length - 2), 10);
  const checksum = parseInt(stripped.substring(stripped.length - 2, stripped.length), 10);
  const remainder = checkingPart % MOD_97 === 0 ? MOD_97 : checkingPart % MOD_97;
  return remainder === checksum;
};

export const checkMod9710BBAN = (bban: string): boolean => {
  const stripped = stripSpacesAndPeriods(bban);
  const reminder = mod9710(stripped);
  return reminder === 1;
};

const POLAND_WEIGHTS = [3, 9, 7, 1, 3, 9, 7] as const;

export const checkPolandBBAN = (bban: string): boolean => {
  const controlDigit = parseInt(bban.charAt(7), 10);
  const remainder = weightedSum(bban.substring(0, 7), POLAND_WEIGHTS) % 10;
  return controlDigit === (remainder === 0 ? 0 : 10 - remainder);
};

const SPAIN_BANK_BRANCH_WEIGHTS = [4, 8, 5, 10, 9, 7, 3, 6] as const;
const SPAIN_ACCOUNT_WEIGHTS = [1, 2, 4, 8, 5, 10, 9, 7, 3, 6] as const;

export const checkSpainBBAN = (bban: string): boolean => {
  const controlBankBranch = parseInt(bban.charAt(8), 10);
  const controlAccount = parseInt(bban.charAt(9), 10);
  const bankBranchRemainder = weightedSum(bban.substring(0, 8), SPAIN_BANK_BRANCH_WEIGHTS) % 11;
  if (controlBankBranch !== mod11CheckDigit(bankBranchRemainder)) {
    return false;
  }
  const accountRemainder = weightedSum(bban.substring(10, 20), SPAIN_ACCOUNT_WEIGHTS) % 11;
  return controlAccount === mod11CheckDigit(accountRemainder);
};

export const checkCroatianBBAN = (bban: string): boolean => {
  const controlBankBranch = parseInt(bban.charAt(6), 10);
  const controlAccount = parseInt(bban.charAt(16), 10);
  const bankBranch = bban.substring(0, 6);
  const account = bban.substring(7, 16);
  return checkMod1110(bankBranch, controlBankBranch) && checkMod1110(account, controlAccount);
};

const CZECH_PREFIX_WEIGHTS = [10, 5, 8, 4, 2, 1] as const;
const CZECH_SUFFIX_WEIGHTS = [6, 3, 7, 9, 10, 5, 8, 4, 2, 1] as const;

export const checkCzechAndSlovakBBAN = (bban: string): boolean =>
  weightedSum(bban.substring(4, 10), CZECH_PREFIX_WEIGHTS) % 11 === 0 &&
  weightedSum(bban.substring(10, 20), CZECH_SUFFIX_WEIGHTS) % 11 === 0;

const ESTONIA_WEIGHTS = [7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7] as const;

export const checkEstonianBBAN = (bban: string): boolean => {
  const controlDigit = parseInt(bban.charAt(15), 10);
  const remainder = weightedSum(bban.substring(2, 15), ESTONIA_WEIGHTS) % 10;
  return controlDigit === (remainder === 0 ? 0 : 10 - remainder);
};

export const checkFrenchBBAN = (bban: string): boolean => {
  const stripped = stripSpacesAndPeriods(bban);
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

const HUNGARY_WEIGHTS = [9, 7, 3, 1, 9, 7, 3, 1, 9, 7, 3, 1, 9, 7, 3] as const;

export const checkHungarianBBAN = (bban: string): boolean => {
  const controlDigitBankBranch = parseInt(bban.charAt(7), 10);
  const bankBranchRemainder = weightedSum(bban.substring(0, 7), HUNGARY_WEIGHTS) % 10;
  if (controlDigitBankBranch !== (bankBranchRemainder === 0 ? 0 : 10 - bankBranchRemainder)) {
    return false;
  }
  if (bban.endsWith('00000000')) {
    const controlDigitAccount = parseInt(bban.charAt(15), 10);
    const accountRemainder = weightedSum(bban.substring(8, 15), HUNGARY_WEIGHTS) % 10;
    return controlDigitAccount === (accountRemainder === 0 ? 0 : 10 - accountRemainder);
  }
  const controlDigitAccount = parseInt(bban.charAt(23), 10);
  const accountRemainder = weightedSum(bban.substring(8, 23), HUNGARY_WEIGHTS) % 10;
  return controlDigitAccount === (accountRemainder === 0 ? 0 : 10 - accountRemainder);
};
