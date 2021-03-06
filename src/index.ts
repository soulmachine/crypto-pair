import { strict as assert } from 'assert';

const ALL_QUOTE_SYMBOLS = new Set([
  'BNB',
  'BTC',
  'BKRW',
  'BUSD',
  'CAD',
  'CHF',
  'CNHT',
  'CUSD',
  'DAI',
  'EOS',
  'EOSDT',
  'ETH',
  'EUR',
  'EUSD',
  'GBP',
  'HT',
  'HUSD',
  'IDRT',
  'JPY',
  'MX',
  'NGN',
  'ODIN',
  'OKB',
  'PAX',
  'PAXE',
  'RUB',
  'TRX',
  'TRY',
  'TUSD',
  'UAH',
  'USD',
  'USDC',
  'USDE',
  'USDK',
  'USDL',
  'USDS',
  'USDT',
  'USN',
  'XCHF',
  'XLM',
  'XRP',
  'ZAR',
  'ZIG',
]);

const EXCHANGE_QUOTE_MAP = {
  Binance: new Set([
    'AUD',
    'BIDR',
    'BKRW',
    'BNB',
    'BRL',
    'BTC',
    'BUSD',
    'BVND',
    'DAI',
    'ETH',
    'EUR',
    'GBP',
    'IDRT',
    'NGN',
    'PAX',
    'RUB',
    'TRX',
    'TRY',
    'TUSD',
    'UAH',
    'USD',
    'USDC',
    'USDT',
    'XRP',
    'ZAR',
  ]),
  Kraken: new Set([
    'AUD',
    'BTC',
    'ETH',
    'EUR',
    'USD',
    'CAD',
    'CHF',
    'DAI',
    'GBP',
    'JPY',
    'USDC',
    'USDT',
  ]),
};

const ALL_LENGTHS = [5, 4, 3, 2];

/**
 * Normalize a symbol.
 *
 * @param symbol The original symbol from an exchange
 * @param exchange The normalized symbol
 */
export function normalizeSymbol(symbol: string, exchange: string): string {
  assert.ok(exchange, 'The exchange name must NOT be empty');
  symbol = symbol.toUpperCase();

  switch (exchange) {
    case 'Bitfinex': {
      // see https://api-pub.bitfinex.com/v2/conf/pub:map:currency:sym
      const mapping: { [key: string]: string } = {
        AAA: 'TESTAAA',
        ABS: 'ABYSS',
        AIO: 'AION',
        ALG: 'ALGO',
        AMP: 'AMPL',
        AMPF0: 'AMPLF0',
        ATO: 'ATOM',
        B21X: 'B21',
        BAB: 'BCH',
        BBB: 'TESTBBB',
        BTCF0: 'BTC',
        CNHT: 'CNHT',
        CSX: 'CS',
        CTX: 'CTXC',
        DAD: 'EDGE',
        DAT: 'DATA',
        DOG: 'MDOGE',
        DRN: 'DRGN',
        DSH: 'DASH',
        DTX: 'DT',
        EDO: 'PNT',
        ETH2P: 'ETH2PENDING',
        EUS: 'EURS',
        EUT: 'EURT',
        // GNT: 'GLM',
        GSD: 'GUSD',
        IOS: 'IOST',
        IOT: 'IOTA',
        LBT: 'LBTC',
        LES: 'LEO-EOS',
        LET: 'LEO-ERC20',
        MIT: 'MITH',
        MNA: 'MANA',
        NCA: 'NCASH',
        OMN: 'OMNI',
        PAS: 'PASS',
        PBTCEOS: 'PBTC-EOS',
        PBTCETH: 'PBTC-ETH',
        PETHEOS: 'PETH-EOS',
        PLTCEOS: 'PLTC-EOS',
        PLTCETH: 'PLTC-ETH',
        POY: 'POLY',
        QSH: 'QASH',
        QTM: 'QTUM',
        RBT: 'RBTC',
        REP: 'REP2',
        SCR: 'XD',
        SNG: 'SNGLS',
        SPK: 'SPANK',
        STJ: 'STORJ',
        TSD: 'TUSD',
        UDC: 'USDC',
        USK: 'USDK',
        UST: 'USDT',
        USTF0: 'USDT',
        UTN: 'UTNP',
        VSY: 'VSYS',
        WBT: 'WBTC',
        XAUT: 'XAUT',
        XCH: 'XCHF',
        YGG: 'YEED',
        YYW: 'YOYOW',
      };

      if (symbol.endsWith('F0')) symbol = symbol.substring(0, symbol.length - 2); // Futures only

      if (symbol in mapping) symbol = mapping[symbol];

      if (symbol === 'HOT') symbol = 'HYDRO';
      if (symbol === 'ORS') symbol = 'ORSGROUP';
      break;
    }
    case 'BitMEX': {
      if (symbol === 'XBT') symbol = 'BTC';
      break;
    }
    case 'Huobi': {
      if (symbol === 'HOT') symbol = 'HYDRO';
      break;
    }
    case 'Kraken': {
      // https://support.kraken.com/hc/en-us/articles/360001185506-How-to-interpret-asset-codes
      if (symbol.length > 3 && (symbol.indexOf('X') === 0 || symbol.indexOf('Z') === 0)) {
        symbol = symbol.slice(1);
      }
      if (symbol === 'XBT') symbol = 'BTC';
      if (symbol === 'XDG') symbol = 'DOGE';

      break;
    }
    case 'Newdex':
    case 'WhaleEx': {
      if (symbol === 'KEY') symbol = 'MYKEY';
      break;
    }
    default:
    // do nothing, no change to baseSymbol or quoteSymbol
  }

  return symbol;
}

// undefined means parse failure
function defaultNormalizePair(rawPair: string, quotes = ALL_QUOTE_SYMBOLS): string | undefined {
  rawPair = rawPair.toUpperCase();

  if (rawPair.includes('_')) {
    if (rawPair.split('_').length !== 2) return undefined;
    return rawPair;
  }
  if (rawPair.includes('-')) {
    if (rawPair.split('-').length !== 2) return undefined;
    return rawPair.replace(/-/g, '_');
  }
  if (rawPair.includes(':')) {
    if (rawPair.split(':').length !== 2) return undefined;
    return rawPair.replace(/:/g, '_');
  }
  if (rawPair.includes('/')) {
    if (rawPair.split('/').length !== 2) return undefined;
    return rawPair.replace(/\//g, '_');
  }

  let quoteSymbol: string | undefined;

  for (let i = 0; i < ALL_LENGTHS.length; i += 1) {
    const length = ALL_LENGTHS[i];
    if (length < rawPair.length) {
      const symbol = rawPair.slice(rawPair.length - length);
      if (quotes.has(symbol)) {
        quoteSymbol = symbol;
        break;
      }
    }
  }
  if (!quoteSymbol) return undefined;

  const baseSymbol = rawPair.slice(0, rawPair.length - quoteSymbol.length);

  return `${baseSymbol}_${quoteSymbol}`;
}

/**
 * Normalize a cryptocurrency trade pair.
 *
 * @param rawPair The original pair of an exchange
 * @param exchange The exchange name
 */
export function normalizePair(rawPair: string, exchange: string): string | undefined {
  assert.ok(exchange, 'The exchange name must NOT be empty');
  rawPair = rawPair.toUpperCase();

  let baseSymbol = '';
  let quoteSymbol = '';

  switch (exchange) {
    case 'Binance': {
      if (rawPair.includes('_')) {
        const [rawPair_, date] = rawPair.split('_');
        if (!Number.isNaN(date)) {
          rawPair = rawPair_; // delivery
        }
      }
      switch (rawPair) {
        case 'BNBUSD':
          return 'BNB_USD';
        case 'DOTUSD':
          return 'DOT_USD';
        default:
        // do nothing
      }
      return defaultNormalizePair(rawPair, EXCHANGE_QUOTE_MAP.Binance);
    }
    case 'Bitfinex': {
      if (rawPair.includes(':')) {
        [baseSymbol, quoteSymbol] = rawPair.split(':');
      } else {
        baseSymbol = rawPair.slice(0, rawPair.length - 3);
        quoteSymbol = rawPair.slice(rawPair.length - 3);
      }

      break;
    }
    case 'BitMEX': {
      // eslint-disable-next-line no-restricted-globals
      if (!isNaN(Number(rawPair.slice(-2)))) {
        rawPair = rawPair.slice(0, -3);
      }

      if (rawPair.endsWith('USD')) {
        baseSymbol = rawPair.slice(0, -3);
        quoteSymbol = 'USD';
      } else if (rawPair.endsWith('USDT')) {
        baseSymbol = rawPair.slice(0, -4);
        quoteSymbol = 'USDT';
      } else {
        baseSymbol = rawPair;
        quoteSymbol = baseSymbol === 'XBT' ? 'USD' : 'XBT';
      }
      break;
    }
    case 'Bitstamp': {
      if (
        rawPair.endsWith('EUR') ||
        rawPair.endsWith('BTC') ||
        rawPair.endsWith('GBP') ||
        rawPair.endsWith('USD')
      ) {
        baseSymbol = rawPair.substring(0, rawPair.length - 3);
        quoteSymbol = rawPair.substring(rawPair.length - 3);
      } else if (rawPair.endsWith('USDC')) {
        baseSymbol = rawPair.substring(0, rawPair.length - 4);
        quoteSymbol = rawPair.substring(rawPair.length - 4);
      }

      break;
    }
    case 'Kraken': {
      const quoteSymbols = EXCHANGE_QUOTE_MAP.Kraken;

      // https://github.com/ccxt/ccxt/blob/master/js/kraken.js#L322
      const safeCurrencyCode = (currencyId: string): string => {
        let result = currencyId;
        if (currencyId.length > 3) {
          if (currencyId.indexOf('X') === 0 || currencyId.indexOf('Z') === 0) {
            result = currencyId.slice(1);
          }
        }

        if (result === 'XBT') result = 'BTC';
        if (result === 'XDG') result = 'DOGE';

        return result;
      };

      // eslint-disable-next-line no-shadow
      baseSymbol = safeCurrencyCode(rawPair.slice(0, rawPair.length - 4));
      quoteSymbol = safeCurrencyCode(rawPair.slice(rawPair.length - 4));
      // handle ICXETH
      if (!quoteSymbols.has(quoteSymbol) || (baseSymbol.length === 2 && baseSymbol !== 'SC')) {
        baseSymbol = safeCurrencyCode(rawPair.slice(0, rawPair.length - 3));
        quoteSymbol = safeCurrencyCode(rawPair.slice(rawPair.length - 3));
      }
      if (!quoteSymbols.has(quoteSymbol)) {
        return undefined;
        // throw new Error(`Failed to parse Kraken raw pair ${rawPair}`);
      }

      break;
    }
    case 'Newdex': {
      if (rawPair.split('-').length === 3) {
        [, baseSymbol, quoteSymbol] = rawPair.toUpperCase().split('-');
      } else if (rawPair.split('_').length === 2) {
        [baseSymbol, quoteSymbol] = rawPair.toUpperCase().split('_');
      } else {
        return undefined;
        // throw new Error(`Failed to parse ${rawPair} for Newdex`);
      }

      break;
    }
    case 'OKEx': {
      [baseSymbol, quoteSymbol] = rawPair.split('-');
      break;
    }
    case 'Poloniex': {
      [quoteSymbol, baseSymbol] = rawPair.split('_');
      break;
    }
    case 'Upbit': {
      [quoteSymbol, baseSymbol] = rawPair.split('-');
      break;
    }
    default: {
      // see next line
    }
  }

  // default
  if (!baseSymbol || !quoteSymbol) {
    const normalizedPair = defaultNormalizePair(rawPair);
    if (normalizedPair === undefined) {
      return undefined;
      // throw new Error(`Failed to parse ${rawPair} of exchange ${exchange}`);
    }
    [baseSymbol, quoteSymbol] = normalizedPair.split('_');
  }

  assert.ok(baseSymbol);
  assert.ok(quoteSymbol);

  baseSymbol = normalizeSymbol(baseSymbol, exchange);
  quoteSymbol = normalizeSymbol(quoteSymbol, exchange);

  return `${baseSymbol}_${quoteSymbol}`;
}
