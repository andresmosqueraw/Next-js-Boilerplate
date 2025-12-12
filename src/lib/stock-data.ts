import type { Stock } from './stock-types';

const DEFAULT_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'JPM', name: 'JPMorgan Chase' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'PG', name: 'Procter & Gamble' },
  { symbol: 'MA', name: 'Mastercard Inc.' },
  { symbol: 'UNH', name: 'UnitedHealth' },
  { symbol: 'HD', name: 'Home Depot' },
];

export function generateInitialStocks(): Stock[] {
  return DEFAULT_STOCKS.map((stock) => {
    const basePrice = Math.random() * 400 + 50;
    const change = (Math.random() - 0.5) * 20;
    const prevClose = basePrice - change;
    const changePercent = (change / prevClose) * 100;
    const direction: 'up' | 'down' | 'flat' = change > 0.01 ? 'up' : change < -0.01 ? 'down' : 'flat';

    return {
      id: crypto.randomUUID(),
      symbol: stock.symbol,
      name: stock.name,
      price: basePrice,
      prevClose,
      change,
      changePercent,
      direction,
    };
  });
}

export function simulateStockUpdate(stock: Stock): Stock {
  const volatility = 0.02;
  const changeAmount = stock.price * volatility * (Math.random() - 0.5);
  const newPrice = Math.max(0.01, stock.price + changeAmount);
  const newChange = newPrice - stock.prevClose;
  const newChangePercent = (newChange / stock.prevClose) * 100;
  const newDirection: 'up' | 'down' | 'flat' = newChange > 0.01 ? 'up' : newChange < -0.01 ? 'down' : 'flat';

  return {
    ...stock,
    price: newPrice,
    change: newChange,
    changePercent: newChangePercent,
    direction: newDirection,
  };
}
