import YahooFinance from "yahoo-finance2"; // FIX: Pakai 'Y' besar

// Tambahin settingan suppressNotices biar dia diem selamanya 🤫
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export async function getStockPrice(emitenCode: string): Promise<number | null> {
  try {
    const symbol = `${emitenCode}.JK`; // IDX suffix
    console.log(`📊 Fetching price for ${symbol}...`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (await yahooFinance.quote(symbol)) as any;

    if (result?.regularMarketPrice) {
      return result.regularMarketPrice;
    }

    return null;
  } catch (error) {
    console.error(`❌ Error fetching ${emitenCode}:`, error);
    return null;
  }
}