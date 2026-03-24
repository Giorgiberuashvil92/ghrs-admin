/**
 * USD (EN ფასი) → RUB / GEL — RUB კურსი `app/utils/currency.ts`-თან ემთხვევა.
 * 1 USD = 80.51 RUB. ₾ ითვლება იმავე RUB→GEL კოეფიციენტით რაც მთავარ საიტზეა.
 */
const USD_TO_RUB = 80.51; // 1 United States Dollar = 80.51 Russian Ruble
const RUB_TO_GEL = 0.029; // 1 RUB ≈ GEL (app/utils/currency.ts EXCHANGE_RATES)

export function convertUsdToRuKa(usd: number): { ru: number; ka: number } {
  if (usd == null || !Number.isFinite(usd) || usd <= 0) {
    return { ru: 0, ka: 0 };
  }
  const rub = Math.round(usd * USD_TO_RUB);
  const gel = Math.round(rub * RUB_TO_GEL * 100) / 100;
  return { ru: rub, ka: gel };
}
