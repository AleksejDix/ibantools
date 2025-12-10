export const ValidationErrorsIBAN = {
  NoIBANProvided: 0,
  NoIBANCountry: 1,
  WrongBBANLength: 2,
  WrongBBANFormat: 3,
  ChecksumNotNumber: 4,
  WrongIBANChecksum: 5,
  WrongAccountBankBranchChecksum: 6,
  QRIBANNotAllowed: 7,
} as const;
export type ValidationErrorsIBAN = (typeof ValidationErrorsIBAN)[keyof typeof ValidationErrorsIBAN];

export interface ValidateIBANOptions {
  allowQRIBAN: boolean;
}

export interface ValidateIBANResult {
  errorCodes: ValidationErrorsIBAN[];
  valid: boolean;
}

export interface ComposeIBANParams {
  countryCode?: string | null;
  bban?: string | null;
}

export interface ExtractIBANResult {
  iban: string;
  bban?: string;
  countryCode?: string;
  accountNumber?: string;
  branchIdentifier?: string;
  bankIdentifier?: string;
  valid: boolean;
}

export const ValidationErrorsBIC = {
  NoBICProvided: 0,
  NoBICCountry: 1,
  WrongBICFormat: 2,
} as const;
export type ValidationErrorsBIC = (typeof ValidationErrorsBIC)[keyof typeof ValidationErrorsBIC];

export interface ValidateBICResult {
  errorCodes: ValidationErrorsBIC[];
  valid: boolean;
}

export interface ExtractBICResult {
  bankCode?: string;
  countryCode?: string;
  locationCode?: string;
  branchCode: string | null;
  testBIC: boolean;
  valid: boolean;
}

export interface CountrySpec {
  chars: number | null;
  bban_regexp: string | null;
  IBANRegistry: boolean;
  SEPA: boolean;
}

export type CountryMap = Record<string, CountrySpec>;

export interface CountrySpecInternal {
  chars?: number;
  bban_regexp?: string;
  bban_validation_func?: (bban: string) => boolean;
  IBANRegistry?: boolean;
  SEPA?: boolean;
  branch_indentifier?: string;
  bank_identifier?: string;
  account_indentifier?: string;
}

export type CountryMapInternal = Record<string, CountrySpecInternal>;
