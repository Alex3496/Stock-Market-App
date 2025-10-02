'use server';

import { getDateRange, validateArticle, formatArticle, calculateNewsDistribution } from '@/lib/utils';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

if (!NEXT_PUBLIC_FINNHUB_API_KEY) {
  throw new Error('NEXT_PUBLIC_FINNHUB_API_KEY is not defined in environment variables');
}

export const fetchJSON = async (url: string, revalidateSeconds?: number): Promise<any> => {
  const fetchOptions: RequestInit = revalidateSeconds
    ? {
        cache: 'force-cache',
        next: { revalidate: revalidateSeconds }
      }
    : { cache: 'no-store' };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const getNews = async (symbols?: string[]): Promise<MarketNewsArticle[]> => {
  try {
    const { from, to } = getDateRange(5); // Last 5 days

    if (symbols && symbols.length > 0) {
      // Clean and uppercase symbols
      const cleanSymbols = symbols
        .map(symbol => symbol.trim().toUpperCase())
        .filter(symbol => symbol.length > 0);

      if (cleanSymbols.length === 0) {
        return getGeneralMarketNews(from, to);
      }

      const { itemsPerSymbol, targetNewsCount } = calculateNewsDistribution(cleanSymbols.length);
      const collectedArticles: MarketNewsArticle[] = [];
      let roundCount = 0;
      const maxRounds = 6;

      // Round-robin through symbols, max 6 rounds
      while (collectedArticles.length < targetNewsCount && roundCount < maxRounds) {
        for (let i = 0; i < cleanSymbols.length && collectedArticles.length < targetNewsCount; i++) {
          const symbol = cleanSymbols[i];

          try {
            const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
            const rawArticles: RawNewsArticle[] = await fetchJSON(url, 300); // Cache for 5 minutes

            // Take one valid article per round
            const validArticles = rawArticles
              .filter(validateArticle)
              .slice(0, 1); // Take only one article per symbol per round

            for (const article of validArticles) {
              if (collectedArticles.length < targetNewsCount) {
                collectedArticles.push(formatArticle(article, true, symbol, collectedArticles.length));
              }
            }
          } catch (error) {
            console.error(`Error fetching news for symbol ${symbol}:`, error);
            continue;
          }
        }
        roundCount++;
      }

      // Sort by datetime (newest first) and return
      return collectedArticles
        .sort((a, b) => b.datetime - a.datetime)
        .slice(0, targetNewsCount);

    } else {
      // No symbols provided, fetch general market news
      return getGeneralMarketNews(from, to);
    }

  } catch (error) {
    console.error('Error in getNews:', error);
    throw new Error('Failed to fetch news');
  }
};

const getGeneralMarketNews = async (from: string, to: string): Promise<MarketNewsArticle[]> => {
  try {
    const url = `${FINNHUB_BASE_URL}/news?category=general&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
    const rawArticles: RawNewsArticle[] = await fetchJSON(url, 300); // Cache for 5 minutes

    // Deduplicate by id, url, or headline
    const seenIds = new Set<string>();
    const uniqueArticles: RawNewsArticle[] = [];

    for (const article of rawArticles) {
      if (!validateArticle(article)) continue;

      const uniqueKey = article.id?.toString() || article.url || article.headline;
      if (uniqueKey && !seenIds.has(uniqueKey)) {
        seenIds.add(uniqueKey);
        uniqueArticles.push(article);
      }
    }

    // Take top 6 and format them
    return uniqueArticles
      .slice(0, 6)
      .map((article, index) => formatArticle(article, false, undefined, index));

  } catch (error) {
    console.error('Error fetching general market news:', error);
    throw new Error('Failed to fetch general market news');
  }
};
