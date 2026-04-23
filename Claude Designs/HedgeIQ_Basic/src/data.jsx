// Mock data — tickers, positions, accounts, news
const TICKERS = {
  NVDA: { name: "NVIDIA Corp", sector: "Tech", price: 892.40, chg: 14.22, chgPct: 1.62, mktCap: 2.2e12, pe: 68.4, vol: 41.2e6, div: 0.04, beta: 1.68, high52: 974.00, low52: 394.50, cat: "Stock" },
  AAPL: { name: "Apple Inc", sector: "Tech", price: 218.64, chg: -2.11, chgPct: -0.96, mktCap: 3.3e12, pe: 33.7, vol: 58.4e6, div: 0.96, beta: 1.28, high52: 237.49, low52: 164.08, cat: "Stock" },
  MSFT: { name: "Microsoft Corp", sector: "Tech", price: 438.72, chg: 3.44, chgPct: 0.79, mktCap: 3.2e12, pe: 35.1, vol: 18.9e6, div: 3.00, beta: 0.89, high52: 468.35, low52: 309.45, cat: "Stock" },
  TSLA: { name: "Tesla Inc", sector: "Auto", price: 179.83, chg: -8.41, chgPct: -4.47, mktCap: 570e9, pe: 51.2, vol: 102.4e6, div: 0, beta: 2.31, high52: 299.29, low52: 138.80, cat: "Stock" },
  AMZN: { name: "Amazon.com", sector: "Consumer", price: 191.24, chg: 2.15, chgPct: 1.13, mktCap: 2.0e12, pe: 49.8, vol: 44.3e6, div: 0, beta: 1.19, high52: 201.20, low52: 118.35, cat: "Stock" },
  GOOGL: { name: "Alphabet Inc A", sector: "Tech", price: 176.12, chg: 1.03, chgPct: 0.59, mktCap: 2.2e12, pe: 27.3, vol: 22.1e6, div: 0.80, beta: 1.03, high52: 191.75, low52: 115.35, cat: "Stock" },
  META: { name: "Meta Platforms", sector: "Tech", price: 514.20, chg: 8.87, chgPct: 1.75, mktCap: 1.3e12, pe: 27.9, vol: 14.2e6, div: 2.00, beta: 1.22, high52: 542.81, low52: 274.38, cat: "Stock" },
  JPM: { name: "JPMorgan Chase", sector: "Finance", price: 201.55, chg: 0.48, chgPct: 0.24, mktCap: 580e9, pe: 12.1, vol: 11.2e6, div: 4.60, beta: 1.09, high52: 207.30, low52: 135.19, cat: "Stock" },
  VOO:  { name: "Vanguard S&P 500 ETF", sector: "ETF", price: 513.87, chg: 2.11, chgPct: 0.41, mktCap: 1.3e12, pe: null, vol: 3.4e6, div: 6.42, beta: 1.00, high52: 526.44, low52: 400.28, cat: "ETF" },
  QQQ:  { name: "Invesco QQQ ETF", sector: "ETF", price: 478.31, chg: 1.88, chgPct: 0.40, mktCap: 290e9, pe: null, vol: 38.2e6, div: 2.60, beta: 1.17, high52: 503.52, low52: 345.11, cat: "ETF" },
  VTI:  { name: "Vanguard Total Market", sector: "ETF", price: 269.44, chg: 0.72, chgPct: 0.27, mktCap: 1.7e12, pe: null, vol: 2.9e6, div: 3.78, beta: 1.00, high52: 278.60, low52: 215.04, cat: "ETF" },
  PFE:  { name: "Pfizer Inc", sector: "Healthcare", price: 27.65, chg: -0.34, chgPct: -1.21, mktCap: 156e9, pe: 23.1, vol: 32.4e6, div: 1.68, beta: 0.63, high52: 31.54, low52: 25.20, cat: "Stock" },
  DOCU: { name: "DocuSign Inc", sector: "Tech", price: 45.74, chg: -0.32, chgPct: -0.69, mktCap: 9.3e9, pe: 15.1, vol: 2.5e6, div: 0, beta: 0.98, high52: 64.07, low52: 44.15, cat: "Stock" },
  SNOW: { name: "Snowflake Inc", sector: "Tech", price: 143.98, chg: 0.43, chgPct: 0.30, mktCap: 48.1e9, pe: null, vol: 4.3e6, div: 0, beta: 1.08, high52: 237.72, low52: 133.75, cat: "Stock" },
  NFLX: { name: "Netflix Inc", sector: "Media", price: 972.31, chg: 10.48, chgPct: 1.09, mktCap: 417e9, pe: 45.1, vol: 2.8e6, div: 0, beta: 1.35, high52: 989.00, low52: 545.50, cat: "Stock" },
};

const SYMBOLS = Object.keys(TICKERS);

const ACCOUNTS = [
  { id: "TOD", name: "Individual · TOD", num: "****3235", type: "Taxable", balance: 312969.10, dayChg: -1045.50, dayPct: -0.33, cat: "Investment" },
  { id: "IRA1", name: "Traditional IRA", num: "****4600", type: "Retirement", balance: 165154.77, dayChg: 259.65, dayPct: 0.16, cat: "Retirement" },
  { id: "IRA2", name: "Rollover IRA", num: "****7040", type: "Retirement", balance: 93735.13, dayChg: 527.96, dayPct: 0.57, cat: "Retirement" },
  { id: "ROTH", name: "Roth IRA", num: "****3778", type: "Retirement", balance: 34072.34, dayChg: 564.15, dayPct: 1.68, cat: "Retirement" },
  { id: "529A", name: "529 · Avaneesh", num: "****3927", type: "Education", balance: 12009.81, dayChg: 16.02, dayPct: 0.14, cat: "Education" },
  { id: "529H", name: "529 · Haresh", num: "****4062", type: "Education", balance: 8248.74, dayChg: -80.85, dayPct: -0.97, cat: "Education" },
  { id: "JNT",  name: "Joint WROS", num: "****8756", type: "Taxable", balance: 11.77, dayChg: 0, dayPct: 0, cat: "Education" },
  { id: "401K", name: "Cognizant 401(k)", num: "****", type: "Retirement (external)", balance: 213495.54, dayChg: 0, dayPct: 0, cat: "External" },
];

const POSITIONS = {
  TOD: [
    { sym: "NVDA", qty: 45, avgCost: 612.40, currentValue: 45 * 892.40, todayGainPct: 1.62, cb: 27558.00 },
    { sym: "AAPL", qty: 120, avgCost: 181.22, currentValue: 120 * 218.64, todayGainPct: -0.96, cb: 21746.40 },
    { sym: "MSFT", qty: 80, avgCost: 342.15, currentValue: 80 * 438.72, todayGainPct: 0.79, cb: 27372.00 },
    { sym: "VOO",  qty: 150, avgCost: 412.88, currentValue: 150 * 513.87, todayGainPct: 0.41, cb: 61932.00 },
    { sym: "QQQ",  qty: 60, avgCost: 388.40, currentValue: 60 * 478.31, todayGainPct: 0.40, cb: 23304.00 },
    { sym: "TSLA", qty: 100, avgCost: 238.12, currentValue: 100 * 179.83, todayGainPct: -4.47, cb: 23812.00 },
  ],
  IRA1: [
    { sym: "SNOW", qty: 25, avgCost: 120.61, currentValue: 25 * 143.98, todayGainPct: 0.30, cb: 3015.13 },
    { sym: "META", qty: 15, avgCost: 311.82, currentValue: 15 * 514.20, todayGainPct: 1.75, cb: 4677.30 },
    { sym: "AMZN", qty: 40, avgCost: 142.18, currentValue: 40 * 191.24, todayGainPct: 1.13, cb: 5687.20 },
    { sym: "NFLX", qty: 8, avgCost: 412.30, currentValue: 8 * 972.31, todayGainPct: 1.09, cb: 3298.40 },
    { sym: "DOCU", qty: 75, avgCost: 42.83, currentValue: 75 * 45.74, todayGainPct: -0.69, cb: 3212.25 },
    { sym: "JPM",  qty: 60, avgCost: 168.50, currentValue: 60 * 201.55, todayGainPct: 0.24, cb: 10110.00 },
    { sym: "GOOGL", qty: 35, avgCost: 138.90, currentValue: 35 * 176.12, todayGainPct: 0.59, cb: 4861.50 },
  ],
  IRA2: [
    { sym: "VTI",  qty: 220, avgCost: 215.40, currentValue: 220 * 269.44, todayGainPct: 0.27, cb: 47388.00 },
    { sym: "VOO",  qty: 80,  avgCost: 428.11, currentValue: 80 * 513.87, todayGainPct: 0.41, cb: 34248.80 },
    { sym: "PFE",  qty: 400, avgCost: 29.45,  currentValue: 400 * 27.65, todayGainPct: -1.21, cb: 11780.00 },
  ],
  ROTH: [
    { sym: "META", qty: 40, avgCost: 289.50, currentValue: 40 * 514.20, todayGainPct: 1.75, cb: 11580.00 },
    { sym: "NVDA", qty: 15, avgCost: 418.20, currentValue: 15 * 892.40, todayGainPct: 1.62, cb: 6273.00 },
  ],
};

const NEWS = [
  { t: "NVDA launches new Rubin AI platform; analysts upgrade to Buy", src: "Reuters", time: "12m", sym: "NVDA", imp: "high" },
  { t: "Fed minutes signal two rate cuts possible before year-end", src: "WSJ", time: "47m", sym: null, imp: "high" },
  { t: "Tesla Q1 deliveries miss estimates, stock drops 4%", src: "Bloomberg", time: "1h", sym: "TSLA", imp: "med" },
  { t: "DocuSign names new CFO amid restructuring push", src: "CNBC", time: "2h", sym: "DOCU", imp: "low" },
  { t: "Snowflake partners with OpenAI on enterprise offering", src: "TechCrunch", time: "3h", sym: "SNOW", imp: "med" },
  { t: "Meta reports strong Reality Labs growth in Q1 preview", src: "Bloomberg", time: "4h", sym: "META", imp: "med" },
  { t: "Apple Vision Pro 2 rumored for Q4 launch", src: "Bloomberg", time: "5h", sym: "AAPL", imp: "low" },
];

const ORDERS = [
  { status: "Pending", date: "Apr 17 2026", account: "Traditional IRA ****4600", desc: "Sell to Close · 3 NFLX Apr 17 '26 $95 Put", price: "Market (Day)", state: "Verified · Canceled", amt: "—" },
  { status: "Filled", date: "Apr 16 2026", account: "Individual · TOD", desc: "Bought 45 NVDA @ $878.22", price: "Limit", state: "Executed", amt: -39519.90 },
  { status: "Filled", date: "Apr 15 2026", account: "Rollover IRA ****7040", desc: "Sold 200 PFE @ $28.10", price: "Market", state: "Executed", amt: 5620.00 },
  { status: "Filled", date: "Apr 14 2026", account: "Roth IRA ****3778", desc: "Bought 10 META @ $508.80", price: "Limit", state: "Executed", amt: -5088.00 },
  { status: "Filled", date: "Apr 12 2026", account: "Individual · TOD", desc: "Sold to Open 5 AAPL May 16 '26 $220 Call", price: "Limit", state: "Executed", amt: 1140.00 },
  { status: "Filled", date: "Apr 10 2026", account: "Traditional IRA ****4600", desc: "Bought 40 AMZN @ $189.40", price: "Market", state: "Executed", amt: -7576.00 },
];

const EVENTS = [
  { type: "Earnings", sym: "NVDA", date: "May 22 2026", detail: "After close, consensus EPS $6.24" },
  { type: "Ex-dividend", sym: "AAPL", date: "May 10 2026", detail: "$0.24 / share" },
  { type: "Earnings", sym: "META", date: "Apr 30 2026", detail: "After close, consensus EPS $5.17" },
  { type: "Ex-dividend", sym: "JPM", date: "Apr 25 2026", detail: "$1.15 / share" },
];

Object.assign(window, { TICKERS, SYMBOLS, ACCOUNTS, POSITIONS, NEWS, ORDERS, EVENTS });
