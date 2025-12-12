export type Stock = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  prevClose: number;
  change: number;
  changePercent: number;
  direction: 'up' | 'down' | 'flat';
};
