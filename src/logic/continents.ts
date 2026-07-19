// ISO-3166-1 alpha-2 -> 大洲。国家字段「接近」判定用。

export type Continent =
  | '亚洲'
  | '欧洲'
  | '北美'
  | '南美'
  | '非洲'
  | '大洋洲'
  | '其他';

const MAP: Record<string, Continent> = {
  // 亚洲
  CN: '亚洲', HK: '亚洲', TW: '亚洲', MO: '亚洲', JP: '亚洲', KR: '亚洲',
  IN: '亚洲', TH: '亚洲', VN: '亚洲', ID: '亚洲', MY: '亚洲', SG: '亚洲',
  PH: '亚洲', IR: '亚洲', IQ: '亚洲', IL: '亚洲', PS: '亚洲', JO: '亚洲',
  SA: '亚洲', AE: '亚洲', QA: '亚洲', KW: '亚洲', BH: '亚洲', OM: '亚洲',
  TR: '亚洲', KZ: '亚洲', PK: '亚洲', BD: '亚洲', KH: '亚洲', MN: '亚洲',
  LA: '亚洲', MM: '亚洲', NP: '亚洲', LK: '亚洲', AF: '亚洲', YE: '亚洲',
  LB: '亚洲', SY: '亚洲', KG: '亚洲', TJ: '亚洲', UZ: '亚洲', TM: '亚洲',
  AZ: '亚洲', GE: '亚洲',
  // 欧洲
  GB: '欧洲', FR: '欧洲', DE: '欧洲', IT: '欧洲', ES: '欧洲', PT: '欧洲',
  NL: '欧洲', BE: '欧洲', CH: '欧洲', AT: '欧洲', SE: '欧洲', NO: '欧洲',
  DK: '欧洲', FI: '欧洲', IE: '欧洲', PL: '欧洲', CZ: '欧洲', HU: '欧洲',
  GR: '欧洲', RU: '欧洲', UA: '欧洲', RO: '欧洲', IS: '欧洲', LU: '欧洲',
  BG: '欧洲', HR: '欧洲', RS: '欧洲', SK: '欧洲', SI: '欧洲', EE: '欧洲',
  LV: '欧洲', LT: '欧洲', MT: '欧洲', CY: '欧洲', BY: '欧洲', MD: '欧洲',
  AL: '欧洲', BA: '欧洲', MK: '欧洲', ME: '欧洲', SM: '欧洲', VA: '欧洲',
  MC: '欧洲', AD: '欧洲', LI: '欧洲',
  // 北美
  US: '北美', CA: '北美', MX: '北美', CU: '北美', JM: '北美', BS: '北美',
  DO: '北美', HT: '北美', GT: '北美', PA: '北美', CR: '北美', SV: '北美',
  HN: '北美', NI: '北美', BZ: '北美', PR: '北美', TT: '北美', BB: '北美',
  // 南美
  BR: '南美', AR: '南美', CL: '南美', CO: '南美', PE: '南美', VE: '南美',
  UY: '南美', BO: '南美', EC: '南美', PY: '南美', GY: '南美', SR: '南美',
  // 非洲
  ZA: '非洲', NG: '非洲', EG: '非洲', KE: '非洲', MA: '非洲', DZ: '非洲',
  TN: '非洲', GH: '非洲', ET: '非洲', SN: '非洲', CM: '非洲', CI: '非洲',
  TZ: '非洲', UG: '非洲', SD: '非洲', ZW: '非洲', AO: '非洲', MZ: '非洲',
  NA: '非洲', BF: '非洲', ML: '非洲', NE: '非洲', BJ: '非洲', CG: '非洲',
  CD: '非洲', MG: '非洲', RW: '非洲', BI: '非洲', SO: '非洲', LR: '非洲',
  SL: '非洲', TG: '非洲', MU: '非洲', RE: '非洲',
  // 大洋洲
  AU: '大洋洲', NZ: '大洋洲', FJ: '大洋洲', PG: '大洋洲', WS: '大洋洲',
  TO: '大洋洲', SB: '大洋洲', VU: '大洋洲', KI: '大洋洲', TV: '大洋洲',
};

export function continentOf(iso2: string): Continent {
  return MAP[iso2.toUpperCase()] ?? '其他';
}

// 任一对 (guess, answer) 同大洲 -> true
export function anySameContinent(
  guessCountries: string[],
  answerCountries: string[]
): boolean {
  for (const g of guessCountries) {
    const gc = continentOf(g);
    for (const a of answerCountries) {
      if (gc === continentOf(a)) return true;
    }
  }
  return false;
}
