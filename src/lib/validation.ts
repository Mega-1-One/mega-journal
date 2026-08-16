import { z } from 'zod';

export const tradeSchema = z
  .object({
    account: z.string().min(1, 'Trading account is required'),
    symbol: z
      .string()
      .min(1, 'Symbol is required')
      .transform((val: string) => val.toUpperCase().trim()),
    assetClass: z.enum(['FOREX', 'FUTURES', 'STOCKS', 'CRYPTO', 'INDICES', 'COMMODITIES']),
    direction: z.enum(['LONG', 'SHORT']),
    entryPrice: z.number().gt(0, 'Entry price must be greater than 0'),
    exitPrice: z.number().gt(0, 'Exit price must be greater than 0'),
    quantity: z.number().gt(0, 'Quantity must be greater than 0'),
    stopLoss: z.number().optional(),
    takeProfit: z.number().optional(),
    commission: z.number().min(0, 'Commission cannot be negative').optional(),
    fees: z.number().min(0, 'Fees cannot be negative').optional(),
    entryTime: z.string().min(1, 'Entry time is required'),
    exitTime: z.string().min(1, 'Exit time is required'),
    strategyId: z.string().optional(),
    setup: z.string().optional(),
    session: z.enum(['ASIA', 'LONDON', 'NEW_YORK', 'OVERLAP']).optional(),
    emotion: z.string().optional(),
    confidence: z.number().min(1).max(10).optional(),
    mistake: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
  .refine(
    (data: any) => {
      if (data.entryTime && data.exitTime) {
        const start = new Date(data.entryTime).getTime();
        const end = new Date(data.exitTime).getTime();
        return end >= start;
      }
      return true;
    },
    {
      message: 'Exit time cannot be earlier than entry time',
      path: ['exitTime'],
    }
  );

export type TradeSchemaType = z.infer<typeof tradeSchema>;
