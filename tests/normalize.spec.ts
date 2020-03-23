import fs from 'fs';
import each from 'jest-each';
import { normalizePair } from '../src/index';

const SUPPORTED_EXCHANGES = [
  'Binance',
  'Bitfinex',
  'Bitstamp',
  'Coinbase',
  'Huobi',
  'Kraken',
  'MXC',
  'Newdex',
  'OKEx_Spot',
  'WhaleEx',
];

const pairsMapping = JSON.parse(fs.readFileSync('./tests/data/pairs_mapping.json', 'utf8')) as {
  [key: string]: { [key: string]: string };
};

each(SUPPORTED_EXCHANGES).test('normalize() should return the same result', (exchange: string) => {
  const mapping = pairsMapping[exchange];

  Object.keys(mapping).forEach((pair) => {
    const rawPair = mapping[pair];
    expect(normalizePair(rawPair, exchange)).toBe(pair); // eslint-disable-line jest/no-standalone-expect
  });
});
