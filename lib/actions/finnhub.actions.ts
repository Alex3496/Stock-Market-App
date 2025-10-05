/**
 * @fileoverview Acciones del servidor para obtener noticias del mercado usando Finnhub API
 * @description
 * Este módulo maneja:
 * - Obtención de noticias específicas por símbolos de acciones
 * - Noticias generales del mercado cuando no hay símbolos
 * - Cacheo inteligente para optimizar llamadas a la API
 * - Validación y formateo de artículos de noticias
 */
'use server';

import {
	getDateRange,
	validateArticle,
	formatArticle,
	calculateNewsDistribution,
} from '@/lib/utils';

import { cache } from 'react';
import { POPULAR_STOCK_SYMBOLS, CRYPTO_SYMBOLS_FINNHUB } from '@/lib/constants';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

if (!FINNHUB_API_KEY) {
	throw new Error(
		'FINNHUB_API_KEY is not defined in environment variables'
	);
}

/**
 * Realiza una petición HTTP y devuelve los datos en formato JSON
 * @param url - URL a la que hacer la petición
 * @param revalidateSeconds - Tiempo en segundos para cachear la respuesta (opcional)
 * @returns Promise con los datos JSON de la respuesta
 * @throws Error si la respuesta no es exitosa (status != 200)
 */
export const fetchJSON = async (
	url: string,
	revalidateSeconds?: number
): Promise<any> => {
	const fetchOptions: RequestInit = revalidateSeconds
		? {
				cache: 'force-cache',
				next: { revalidate: revalidateSeconds },
		  }
		: { cache: 'no-store' };

	const response = await fetch(url, fetchOptions);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
};

/**
 * Obtiene noticias del mercado de valores desde Finnhub API
 * @param symbols - Array de símbolos de acciones (opcional). Si no se proporciona, obtiene noticias generales
 * @returns Promise con array de artículos de noticias (máximo 6)
 * @description
 * - Si se proporcionan símbolos: obtiene noticias específicas de cada empresa usando round-robin
 * - Si no hay símbolos: obtiene noticias generales del mercado
 * - Siempre filtra y valida artículos antes de devolverlos
 */
export const getNews = async (
	symbols?: string[]
): Promise<MarketNewsArticle[]> => {
	try {
		const { from, to } = getDateRange(5); // Last 5 days

		if (symbols && symbols.length > 0) {
			// Clean and uppercase symbols
			const cleanSymbols = symbols
				.map((symbol) => symbol.trim().toUpperCase())
				.filter((symbol) => symbol.length > 0);

			if (cleanSymbols.length === 0) {
				return getGeneralMarketNews(from, to);
			}

			const { itemsPerSymbol, targetNewsCount } =
				calculateNewsDistribution(cleanSymbols.length);
			const collectedArticles: MarketNewsArticle[] = [];
			let roundCount = 0;
			const maxRounds = 6;

			// Round-robin through symbols, max 6 rounds
			while (
				collectedArticles.length < targetNewsCount &&
				roundCount < maxRounds
			) {
				for (
					let i = 0;
					i < cleanSymbols.length &&
					collectedArticles.length < targetNewsCount;
					i++
				) {
					const symbol = cleanSymbols[i];

					try {
						const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
						const rawArticles: RawNewsArticle[] = await fetchJSON(
							url,
							300
						); // Cache for 5 minutes

						// Take one valid article per round
						const validArticles = rawArticles
							.filter(validateArticle)
							.slice(0, 1); // Take only one article per symbol per round

						for (const article of validArticles) {
							if (collectedArticles.length < targetNewsCount) {
								collectedArticles.push(
									formatArticle(
										article,
										true,
										symbol,
										collectedArticles.length
									)
								);
							}
						}
					} catch (error) {
						console.error(
							`Error fetching news for symbol ${symbol}:`,
							error
						);
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

/**
 * Obtiene noticias generales del mercado desde Finnhub API
 * @param from - Fecha de inicio en formato YYYY-MM-DD
 * @param to - Fecha de fin en formato YYYY-MM-DD
 * @returns Promise con array de artículos de noticias generales (máximo 6)
 * @description
 * - Obtiene noticias de la categoría "general"
 * - Deduplica artículos por ID, URL o titular
 * - Valida que cada artículo tenga los campos requeridos
 */
const getGeneralMarketNews = async (
	from: string,
	to: string
): Promise<MarketNewsArticle[]> => {
	try {
		const url = `${FINNHUB_BASE_URL}/news?category=general&token=${FINNHUB_API_KEY}`;
		const rawArticles: RawNewsArticle[] = await fetchJSON(url, 300); // Cache for 5 minutes

		// Deduplicate by id, url, or headline
		const seenIds = new Set<string>();
		const uniqueArticles: RawNewsArticle[] = [];

		for (const article of rawArticles) {
			if (!validateArticle(article)) continue;

			const uniqueKey =
				article.id?.toString() || article.url || article.headline;
			if (uniqueKey && !seenIds.has(uniqueKey)) {
				seenIds.add(uniqueKey);
				uniqueArticles.push(article);
			}
		}

		// Take top 6 and format them
		return uniqueArticles
			.slice(0, 6)
			.map((article, index) =>
				formatArticle(article, false, undefined, index)
			);
	} catch (error) {
		console.error('Error fetching general market news:', error);
		throw new Error('Failed to fetch general market news');
	}
};


/**
 * Busca criptomonedas usando símbolos populares predefinidos
 * @param query - Término de búsqueda opcional
 * @returns Promise con array de criptomonedas con estado de watchlist
 */
export const searchCrypto = cache(async (query?: string): Promise<CryptoWithWatchlistStatus[]> => {
  try {
    const token = FINNHUB_API_KEY;
    if (!token) {
      console.error('Error in crypto search:', new Error('FINNHUB API key is not configured'));
      return [];
    }

    const trimmed = typeof query === 'string' ? query.trim().toLowerCase() : '';

    // Mapeo de nombres de criptomonedas comunes
    const cryptoNames: { [key: string]: string } = {
      'BTCUSD': 'Bitcoin',
      'ETHUSD': 'Ethereum',
      'BNBUSD': 'Binance Coin',
      'XRPUSD': 'Ripple',
      'ADAUSD': 'Cardano',
      'SOLUSD': 'Solana',
      'DOTUSD': 'Polkadot',
      'DOGEUSD': 'Dogecoin',
      'AVAXUSD': 'Avalanche',
      'SHIBUSD': 'Shiba Inu',
      'MATICUSD': 'Polygon',
      'LINKUSD': 'Chainlink',
      'LTCUSD': 'Litecoin',
      'UNIUSD': 'Uniswap',
      'ATOMUSD': 'Cosmos',
    };

    let filteredCryptos = CRYPTO_SYMBOLS_FINNHUB;

    // Si hay una consulta, filtrar por símbolos o nombres que coincidan
    if (trimmed) {
      filteredCryptos = CRYPTO_SYMBOLS_FINNHUB.filter(symbol => {
        const name = cryptoNames[symbol]?.toLowerCase() || '';
        return symbol.toLowerCase().includes(trimmed) ||
               name.includes(trimmed) ||
               symbol.replace('USD', '').toLowerCase().includes(trimmed);
      });
    }

    // Tomar solo los primeros 10 para no sobrecargar
    const topCryptos = filteredCryptos.slice(0, 10);

    const results: CryptoWithWatchlistStatus[] = topCryptos.map(symbol => ({
      symbol: symbol,
      name: cryptoNames[symbol] || symbol.replace('USD', ''),
      exchange: 'Crypto',
      type: 'crypto' as const,
      isInWatchlist: false,
    }));

    return results;
  } catch (err) {
    console.error('Error in crypto search:', err);
    return [];
  }
});


/**
 * Busca acciones (stocks) usando la API de Finnhub.
 *
 * - Si no se proporciona un query, retorna los perfiles de las 10 acciones más populares.
 * - Si se proporciona un query, busca acciones que coincidan con el texto.
 * - Siempre retorna un arreglo de acciones con información básica y si están en la watchlist.
 * - Si falta la API key o ocurre un error, retorna un arreglo vacío y muestra el error en consola.
 *
 * @param query Texto opcional para buscar acciones (por símbolo o nombre).
 * @returns Promesa que resuelve a un arreglo de acciones con su estado en la watchlist.
 */
export const searchStocks = cache(
	async (query?: string): Promise<StockWithWatchlistStatus[]> => {
		try {
			const token = FINNHUB_API_KEY;
			if (!token) {
				// If no token, log and return empty to avoid throwing per requirements
				console.error(
					'Error in stock search:',
					new Error('FINNHUB API key is not configured')
				);
				return [];
			}

			const trimmed = typeof query === 'string' ? query.trim() : '';

			let results: FinnhubSearchResult[] = [];

			if (!trimmed) {
				// Fetch top 10 popular symbols' profiles
				const top = POPULAR_STOCK_SYMBOLS.slice(0, 10);
				const profiles = await Promise.all(
					top.map(async (sym) => {
						try {
							const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${token}`;
							// Revalidate every hour
							const profile = await fetchJSON(url, 3600);
							return { sym, profile } as {
								sym: string;
								profile: any;
							};
						} catch (e) {
							console.error(
								'Error fetching profile2 for',
								sym,
								e
							);
							return { sym, profile: null } as {
								sym: string;
								profile: any;
							};
						}
					})
				);

				results = profiles
					.map(({ sym, profile }) => {
						const symbol = sym.toUpperCase();
						const name: string | undefined = profile?.name || profile?.ticker || undefined;
						const exchange: string | undefined = profile?.exchange || undefined;
						if (!name) return undefined;
						const r: FinnhubSearchResult = {
							symbol,
							description: name,
							displaySymbol: symbol,
							type: 'Common Stock',
						};
						// We don't include exchange in FinnhubSearchResult type, so carry via mapping later using profile
						// To keep pipeline simple, attach exchange via closure map stage
						// We'll reconstruct exchange when mapping to final type
						(r as any).__exchange = exchange; // internal only
						return r;
					})
					.filter((x): x is FinnhubSearchResult => Boolean(x));
			} else {
				const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(
					trimmed
				)}&token=${token}`;
				// Sin cache para búsquedas específicas ya que son únicas
				const data = await fetchJSON(url);
				results = Array.isArray(data?.result) ? data.result : [];
			}

			const mapped: StockWithWatchlistStatus[] = results
				.map((r) => {
					const upper = (r.symbol || '').toUpperCase();
					const name = r.description || upper;
					const exchangeFromDisplay =
						(r.displaySymbol as string | undefined) || undefined;
					const exchangeFromProfile = (r as any).__exchange as
						| string
						| undefined;
					const exchange =
						exchangeFromDisplay || exchangeFromProfile || 'US';
					const type = r.type || 'Stock';
					const item: StockWithWatchlistStatus = {
						symbol: upper,
						name,
						exchange,
						type,
						isInWatchlist: false,
					};
					return item;
				})
				.slice(0, 15);

			return mapped;
		} catch (err) {
			console.error('Error in stock search:', err);
			return [];
		}
	}
);

/**
 * Busca tanto acciones como criptomonedas combinando ambos resultados
 * @param query - Término de búsqueda opcional
 * @returns Promise con array combinado de activos con estado de watchlist
 */
export const searchAssets = cache(async (query?: string): Promise<AssetWithWatchlistStatus[]> => {
  try {
    // Ejecutar búsquedas en paralelo
    const [stocks, cryptos] = await Promise.all([
      searchStocks(query),
      searchCrypto(query)
    ]);

    // Combinar resultados, priorizando acciones si no hay query específica
    const combined: AssetWithWatchlistStatus[] = [...stocks, ...cryptos];

    // Limitar a 20 resultados totales
    return combined.slice(0, 20);
  } catch (err) {
    console.error('Error in asset search:', err);
    return [];
  }
});

/**
 * Obtiene el precio actual de una criptomoneda desde Finnhub API
 * @param symbol - Símbolo de la criptomoneda (ej: BTCUSD)
 * @returns Promise con información del precio
 */
export const getCryptoPrice = cache(async (symbol: string): Promise<any> => {
  try {
    const token = FINNHUB_API_KEY;
    if (!token) {
      console.error('Error in crypto price fetch:', new Error('FINNHUB API key is not configured'));
      return null;
    }

    const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
    const data = await fetchJSON(url, 60); // Cache for 1 minute

    return data;
  } catch (err) {
    console.error('Error fetching crypto price:', err);
    return null;
  }
});

/**
 * Obtiene noticias relacionadas con criptomonedas usando términos de búsqueda específicos
 * @param cryptoSymbol - Símbolo de la criptomoneda (opcional)
 * @returns Promise con array de artículos de noticias crypto
 */
export const getCryptoNews = async (cryptoSymbol?: string): Promise<MarketNewsArticle[]> => {
  try {
    const { from, to } = getDateRange(7); // Last 7 days for crypto news

    // Términos de búsqueda para noticias de crypto
    const cryptoTerms = cryptoSymbol
      ? [cryptoSymbol.replace('USD', '').toLowerCase()]
      : ['bitcoin', 'ethereum', 'crypto', 'cryptocurrency', 'blockchain'];

    const url = `${FINNHUB_BASE_URL}/news?category=crypto&token=${FINNHUB_API_KEY}`;
    const rawArticles: RawNewsArticle[] = await fetchJSON(url, 300); // Cache for 5 minutes

    // Filtrar artículos que contengan términos relacionados con crypto
    const filteredArticles = rawArticles.filter(article => {
      if (!validateArticle(article)) return false;

      const searchText = (article.headline + ' ' + (article.summary || '')).toLowerCase();
      return cryptoTerms.some(term => searchText.includes(term));
    });

    // Deduplicate by id, url, or headline
    const seenIds = new Set<string>();
    const uniqueArticles: RawNewsArticle[] = [];

    for (const article of filteredArticles) {
      const uniqueKey = article.id?.toString() || article.url || article.headline;
      if (uniqueKey && !seenIds.has(uniqueKey)) {
        seenIds.add(uniqueKey);
        uniqueArticles.push(article);
      }
    }

    // Take top 6 and format them
    return uniqueArticles
      .slice(0, 6)
      .map((article, index) =>
        formatArticle(article, false, cryptoSymbol, index)
      );
  } catch (error) {
    console.error('Error fetching crypto news:', error);
    throw new Error('Failed to fetch crypto news');
  }
};
