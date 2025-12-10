import { MOD_97, MOD_97_REMAINDER } from './constants';

export function checkFormatBBAN(bban: string, bformat: string): boolean {
  const reg = new RegExp(bformat, '');
  return reg.test(bban);
}

export function replaceCharaterWithCode(str: string): string {
  return str
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      return code >= 65 ? (code - 55).toString() : char;
    })
    .join('');
}

export function mod9710(validationString: string): number {
  while (validationString.length > 2) {
    const part = validationString.slice(0, 6);
    const partInt = parseInt(part, 10);
    if (isNaN(partInt)) {
      return NaN;
    }
    validationString = (partInt % MOD_97) + validationString.slice(part.length);
  }
  return parseInt(validationString, 10) % MOD_97;
}

export function mod9710Iban(iban: string): number {
  return mod9710(replaceCharaterWithCode(iban.slice(4) + iban.slice(0, 4)));
}

export function isValidIBANChecksum(iban: string): boolean {
  const countryCode: string = iban.slice(0, 2);
  const providedChecksum: number = parseInt(iban.slice(2, 4), 10);
  const bban: string = iban.slice(4);
  const validationString = replaceCharaterWithCode(`${bban}${countryCode}00`);
  const rest = mod9710(validationString);
  return MOD_97_REMAINDER - rest === providedChecksum;
}
