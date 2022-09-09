import dayjs from 'dayjs';
import { ethers, utils } from 'ethers';
import { Request, Response, NextFunction } from 'express';
import { getRepository, MoreThan, In, Between } from 'typeorm';

import { Price } from 'orm/entities/prices/Price';
import { CustomError } from 'utils/response/custom-error/CustomError';

enum eDuration {
  'day' = 'day',
  'week' = 'week',
  'month' = 'month',
  'year' = 'year',
}

const DURATIONS = [eDuration.day, eDuration.week, eDuration.month, eDuration.year];

const TICKERS = ['ETH', 'MATIC', 'BNB'];

// v1/chart/tokenName=ETH
export const chart = async (req: Request, res: Response, next: NextFunction) => {
  const { tokenName } = req.query;

  // validate query params
  if (!(tokenName && typeof tokenName === 'string' && TICKERS.indexOf(tokenName) !== -1)) {
    const customError = new CustomError(422, 'Validation', 'Please use valid token name');
    return next(customError);
  }

  const priceRepo = getRepository(Price);

  // !todo - change the feature.
  try {
    const data = await Promise.all(
      DURATIONS.map((duration) => {
        // return priceRepo.query(
        //   `SELECT date_part('${duration}', to_timestamp(CAST(time as bigint)/1000)) AS ${duration}, AVG(CAST(price as float)) from prices WHERE token_name='${tokenName}' GROUP BY ${duration};`,
        // );

        return priceRepo.find({
          where: {
            tokenName: tokenName,
            time: MoreThan(dayjs().subtract(1, duration)),
          },
          order: {
            time: 'ASC',
          },
        });
      }),
    );
    console.log(data);

    // eslint-disable-next-line no-array-reduce/no-reduce
    const result = DURATIONS.reduce((t, duration, index) => {
      t[duration] = data[index];
      return t;
    }, {});

    return res.status(200).json(result);
  } catch (e) {
    const customError = new CustomError(500, e?.name, e?.message);
    return next(customError);
  }
};

const serverWallet = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY);

export const sign = async (req: Request, res: Response, next: NextFunction) => {
  const { list, date } = req.query;

  // validate query params
  let list_: string | string[] = [];
  // validate query params
  if (list && typeof list === 'string') {
    list_ = [list];
  } else if (list && Array.isArray(list)) {
    // !todo: validate if the list is string[]
    list_ = list as string[];
  } else {
    const customError = new CustomError(422, 'Validation', 'Please use valid token list');
    return next(customError);
  }

  let date_ = new Date().valueOf();
  if (date && typeof date === 'string' && parseInt(date)) {
    date_ = Math.floor(parseInt(date) / 10_000) * 10_000;
  }

  // fetch price by tokenName and date
  const priceRepo = getRepository(Price);

  try {
    const response = await Promise.all(
      list_.map((ticker) =>
        priceRepo.findOne({
          where: {
            tokenName: ticker,
            time: date_,
          },
        }),
      ),
    );

    const data = response
      .filter((item) => item)
      .map((item) => {
        return [item.tokenName, utils.parseEther(item.price).toString(), item.time];
      });

    // struct Price {
    //   symbol: string;
    //   quote: uint;
    //   time: uint;
    // }
    if (data.length > 0) {
      const abiCoder = new utils.AbiCoder();
      const serializedData = abiCoder.encode(['tuple(string, uint256, uint256)[]'], [data]);
      const signature = await serverWallet.signMessage(serializedData);
      res.locals.signature = signature;
      console.log(signature);
      next();
      // res.status(200).json(signature);
    } else {
      const customError = new CustomError(422, 'General', 'No data to sign');
      return next(customError);
    }
  } catch (e) {
    return next(e);
  }
};

// v1/sign?list=ETH,BNB&date=1662728378075
export const generateSignature = async (req: Request, res: Response, next: NextFunction) => {
  const sig = res.locals.signature;
  res.status(200).json(sig);
};

// v1/verify?list=ETH,BNB&date=1662728378075&signature=0x0d01fb003937d611087f4fbf6c6b00d5a6c4abcf237aacbf4f5c33ccbba5a79638533bfd8c28e356a76cc0a93c719df77fdc2fe44a271ccbadb85dd34e25d7b71c
export const verifySignature = async (req: Request, res: Response, next: NextFunction) => {
  const sig = res.locals.signature;
  const { signature } = req.query;
  if (sig === signature) res.status(200).json({ success: true });
  else res.status(200).json({ success: false });
};
