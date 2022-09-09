import 'dotenv/config';
import axios from 'axios';
import { getRepository } from 'typeorm';

import { dbCreateConnection } from '../orm/dbCreateConnection';
import { Candle } from '../orm/entities/candles/Candle';
import { Price } from '../orm/entities/prices/Price';

// [ETH, BNB, Matic]
const IDS = [1027, 1839, 3890];

// Intervals in microseconds
enum eINTERVAL {
  '1h' = 60 * 60 * 1000_000,
  '4h' = 4 * 60 * 60 * 1000_000,
  '1d' = 24 * 60 * 60 * 1000_000,
  '1w' = 7 * 24 * 60 * 60 * 1000_000,
}

const INTERVALS = [eINTERVAL['1h'], eINTERVAL['4h'], eINTERVAL['1d'], eINTERVAL['1w']];

async function addPriceToCandle(record: Price, interval: eINTERVAL) {
  const candleTime = Math.floor(Number(record.time) / interval) * interval;

  const candle = await getRepository(Candle).findOne({
    where: { tokenName: record.tokenName, interval: interval, time: candleTime },
  });

  if (!candle) {
    const candle_ = {
      time: candleTime.toString(),
      tokenName: record.tokenName,
      firstSwapTime: record.time.toString(),
      lastSwapTime: record.time.toString(),
      interval: interval.toString(),
      open: record.price,
      close: record.price,
      high: record.price,
      low: record.price,
    };

    getRepository(Candle).save(candle_);
  } else {
    // Open
    if (Number(record.time) < Number(candle['firstSwapTime'])) {
      candle['open'] = record.price;
      candle['firstSwapTime'] = record.time.toString();
    }
    // Close
    if (Number(record.time) > Number(candle['lastSwapTime'])) {
      candle['close'] = record.price;
      candle['lastSwapTime'] = record.time.toString();
    }
    // High
    if (Number(record.price) > Number(candle['high'])) {
      candle['high'] = record.price;
    }
    // Low
    if (Number(record.price) < Number(candle['low'])) {
      candle['low'] = record.price;
    }

    getRepository(Candle).save(candle);
  }
}

(async () => {
  console.log('connecting db...');
  await dbCreateConnection();
  console.log('connected db');

  // fetch price
  const fetchPrice = async () => {
    try {
      const { data } = await axios.get(
        'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=1027,1839,3890',
        {
          headers: {
            'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
          },
        },
      );

      IDS.forEach((id) => {
        const record = new Price();
        record.price = data.data[id].quote.USD.price;
        record.tokenName = data.data[id].symbol;
        record.time = (Math.floor(new Date().valueOf() / 10_000) * 10_000).toString();
        console.log(record);
        getRepository(Price).save(record);

        INTERVALS.forEach((interval) => addPriceToCandle(record, interval));
      });
    } catch (e) {
      console.error(e);
    }

    setTimeout(fetchPrice, 10_000);
  };

  fetchPrice();
})();
