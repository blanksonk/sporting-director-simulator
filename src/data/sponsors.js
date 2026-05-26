// 8 sponsor options per club — ordered cheapest → biggest
// chance: % likelihood they accept your pitch (shown to user)
// type: deal category shown on card

export const CLUB_SPONSORS = {

  'Arsenal': [
    { name: 'Macron',             type: 'Training Kit',   bonus:   7_000_000, chance: 88 },
    { name: 'Admiral',            type: 'Sleeve Partner', bonus:  14_000_000, chance: 76 },
    { name: 'Adidas',             type: 'Kit Supplier',   bonus:  26_000_000, chance: 58 },
    { name: 'Booking.com',        type: 'Shirt Sponsor',  bonus:  40_000_000, chance: 44 },
    { name: 'Emirates',           type: 'Shirt Renewal',  bonus:  55_000_000, chance: 32 },
    { name: 'Nike',               type: 'Kit Switch',     bonus:  70_000_000, chance: 20 },
    { name: 'Amazon',             type: 'Global Partner', bonus:  95_000_000, chance: 11 },
    { name: 'Apple',              type: 'Mega Deal',      bonus: 135_000_000, chance:  5 },
  ],

  'Chelsea': [
    { name: 'Kappa',              type: 'Training Kit',   bonus:   7_000_000, chance: 88 },
    { name: 'Betway',             type: 'Sleeve Partner', bonus:  13_000_000, chance: 76 },
    { name: 'Adidas',             type: 'Kit Renewal',    bonus:  28_000_000, chance: 55 },
    { name: 'Three',              type: 'Shirt Sponsor',  bonus:  38_000_000, chance: 42 },
    { name: 'Crypto.com',         type: 'Shirt Sponsor',  bonus:  54_000_000, chance: 30 },
    { name: 'Nike',               type: 'Kit Switch',     bonus:  68_000_000, chance: 20 },
    { name: 'Microsoft',          type: 'Global Partner', bonus:  92_000_000, chance: 12 },
    { name: 'Amazon',             type: 'Mega Deal',      bonus: 128_000_000, chance:  5 },
  ],

  'Liverpool': [
    { name: 'New Balance',        type: 'Training Kit',   bonus:   8_000_000, chance: 86 },
    { name: 'Carlsberg',          type: 'Sleeve Partner', bonus:  15_000_000, chance: 74 },
    { name: 'Nike',               type: 'Kit Renewal',    bonus:  30_000_000, chance: 56 },
    { name: 'Expedia',            type: 'Shirt Sponsor',  bonus:  42_000_000, chance: 42 },
    { name: 'Standard Chartered', type: 'Shirt Renewal',  bonus:  56_000_000, chance: 30 },
    { name: 'Adidas',             type: 'Kit Switch',     bonus:  72_000_000, chance: 19 },
    { name: 'Google',             type: 'Global Partner', bonus:  96_000_000, chance: 11 },
    { name: 'Apple',              type: 'Mega Deal',      bonus: 140_000_000, chance:  5 },
  ],

  'Manchester City': [
    { name: 'Castore',            type: 'Training Kit',   bonus:   9_000_000, chance: 87 },
    { name: 'Hays Travel',        type: 'Sleeve Partner', bonus:  16_000_000, chance: 75 },
    { name: 'Puma',               type: 'Kit Renewal',    bonus:  32_000_000, chance: 55 },
    { name: 'Hublot',             type: 'Official Watch', bonus:  46_000_000, chance: 40 },
    { name: 'Etihad',             type: 'Shirt Renewal',  bonus:  60_000_000, chance: 28 },
    { name: 'Nike',               type: 'Kit Switch',     bonus:  78_000_000, chance: 18 },
    { name: 'Saudi Aramco',       type: 'Global Partner', bonus: 105_000_000, chance: 12 },
    { name: 'Apple',              type: 'Mega Deal',      bonus: 150_000_000, chance:  5 },
  ],

  'Manchester United': [
    { name: 'Umbro',              type: 'Training Kit',   bonus:   8_000_000, chance: 87 },
    { name: 'DHL',                type: 'Sleeve Partner', bonus:  16_000_000, chance: 74 },
    { name: 'Adidas',             type: 'Kit Renewal',    bonus:  34_000_000, chance: 54 },
    { name: 'Qualcomm',           type: 'Shirt Sponsor',  bonus:  48_000_000, chance: 38 },
    { name: 'Snapdragon',         type: 'Shirt Renewal',  bonus:  62_000_000, chance: 28 },
    { name: 'Nike',               type: 'Kit Switch',     bonus:  80_000_000, chance: 17 },
    { name: 'Amazon',             type: 'Global Partner', bonus: 108_000_000, chance: 10 },
    { name: 'Coca-Cola',          type: 'Mega Deal',      bonus: 148_000_000, chance:  5 },
  ],

  'Tottenham Hotspur': [
    { name: 'Hummel',             type: 'Training Kit',   bonus:   7_000_000, chance: 87 },
    { name: 'Sky Bet',            type: 'Sleeve Partner', bonus:  13_000_000, chance: 75 },
    { name: 'Nike',               type: 'Kit Renewal',    bonus:  27_000_000, chance: 56 },
    { name: 'Booking.com',        type: 'Shirt Sponsor',  bonus:  38_000_000, chance: 42 },
    { name: 'AIA',                type: 'Shirt Renewal',  bonus:  52_000_000, chance: 30 },
    { name: 'Adidas',             type: 'Kit Switch',     bonus:  66_000_000, chance: 20 },
    { name: 'Google',             type: 'Global Partner', bonus:  88_000_000, chance: 12 },
    { name: 'Microsoft',          type: 'Mega Deal',      bonus: 125_000_000, chance:  5 },
  ],

  'Newcastle United': [
    { name: 'Castore',            type: 'Training Kit',   bonus:   5_000_000, chance: 87 },
    { name: 'Betdaq',             type: 'Sleeve Partner', bonus:  10_000_000, chance: 75 },
    { name: 'Puma',               type: 'Kit Supplier',   bonus:  18_000_000, chance: 56 },
    { name: 'Noon.com',           type: 'Shirt Sponsor',  bonus:  26_000_000, chance: 42 },
    { name: 'Saudi Tourism',      type: 'Global Partner', bonus:  38_000_000, chance: 30 },
    { name: 'Adidas',             type: 'Kit Switch',     bonus:  48_000_000, chance: 20 },
    { name: 'Saudi Aramco',       type: 'Mega Sponsor',   bonus:  65_000_000, chance: 12 },
    { name: 'Nike',               type: 'Mega Kit Deal',  bonus:  85_000_000, chance:  6 },
  ],

  'Aston Villa': [
    { name: 'Macron',             type: 'Training Kit',   bonus:   4_500_000, chance: 87 },
    { name: 'Paddy Power',        type: 'Sleeve Partner', bonus:   9_000_000, chance: 75 },
    { name: 'Castore',            type: 'Kit Supplier',   bonus:  16_000_000, chance: 56 },
    { name: 'Betway',             type: 'Shirt Sponsor',  bonus:  22_000_000, chance: 42 },
    { name: 'Cazoo',              type: 'Shirt Sponsor',  bonus:  30_000_000, chance: 32 },
    { name: 'Puma',               type: 'Kit Switch',     bonus:  40_000_000, chance: 22 },
    { name: 'Adidas',             type: 'Kit Switch',     bonus:  54_000_000, chance: 14 },
    { name: 'Amazon',             type: 'Mega Deal',      bonus:  72_000_000, chance:  6 },
  ],

  'Brighton': [
    { name: 'Kappa',              type: 'Training Kit',   bonus:   4_000_000, chance: 86 },
    { name: 'Betway',             type: 'Sleeve Partner', bonus:   8_000_000, chance: 74 },
    { name: 'Nike',               type: 'Kit Renewal',    bonus:  15_000_000, chance: 56 },
    { name: 'American Express',   type: 'Shirt Renewal',  bonus:  22_000_000, chance: 42 },
    { name: 'Revolut',            type: 'Shirt Sponsor',  bonus:  30_000_000, chance: 30 },
    { name: 'Adidas',             type: 'Kit Switch',     bonus:  40_000_000, chance: 20 },
    { name: 'Google',             type: 'Tech Partner',   bonus:  54_000_000, chance: 12 },
    { name: 'Amazon',             type: 'Mega Deal',      bonus:  70_000_000, chance:  5 },
  ],

  'Fulham': [
    { name: 'Macron',             type: 'Training Kit',   bonus:   3_000_000, chance: 86 },
    { name: 'Betway',             type: 'Sleeve Partner', bonus:   6_000_000, chance: 74 },
    { name: 'Adidas',             type: 'Kit Supplier',   bonus:  12_000_000, chance: 55 },
    { name: 'FxPro',              type: 'Shirt Sponsor',  bonus:  18_000_000, chance: 42 },
    { name: 'Dafabet',            type: 'Shirt Sponsor',  bonus:  24_000_000, chance: 32 },
    { name: 'New Balance',        type: 'Kit Switch',     bonus:  32_000_000, chance: 20 },
    { name: 'Revolut',            type: 'Fintech Deal',   bonus:  44_000_000, chance: 12 },
    { name: 'Nike',               type: 'Mega Kit Deal',  bonus:  58_000_000, chance:  5 },
  ],

  'Nottingham Forest': [
    { name: 'Macron',             type: 'Training Kit',   bonus:   3_000_000, chance: 86 },
    { name: 'Paddy Power',        type: 'Sleeve Partner', bonus:   6_500_000, chance: 74 },
    { name: 'Castore',            type: 'Kit Supplier',   bonus:  12_000_000, chance: 55 },
    { name: 'Kaiyun Sports',      type: 'Shirt Sponsor',  bonus:  18_000_000, chance: 42 },
    { name: 'Nutmeg',             type: 'Fintech Deal',   bonus:  24_000_000, chance: 30 },
    { name: 'Adidas',             type: 'Kit Switch',     bonus:  33_000_000, chance: 20 },
    { name: 'Amazon',             type: 'Streaming Deal', bonus:  44_000_000, chance: 12 },
    { name: 'Nike',               type: 'Mega Kit Deal',  bonus:  58_000_000, chance:  5 },
  ],

  'Everton': [
    { name: 'Hummel',             type: 'Training Kit',   bonus:   3_000_000, chance: 86 },
    { name: 'Paddy Power',        type: 'Sleeve Partner', bonus:   6_000_000, chance: 74 },
    { name: 'Umbro',              type: 'Kit Supplier',   bonus:  11_000_000, chance: 56 },
    { name: 'Stake.com',          type: 'Shirt Sponsor',  bonus:  16_000_000, chance: 42 },
    { name: 'Cazoo',              type: 'Shirt Sponsor',  bonus:  22_000_000, chance: 30 },
    { name: 'New Balance',        type: 'Kit Switch',     bonus:  30_000_000, chance: 20 },
    { name: 'Adidas',             type: 'Kit Switch',     bonus:  40_000_000, chance: 13 },
    { name: 'Nike',               type: 'Mega Kit Deal',  bonus:  55_000_000, chance:  5 },
  ],

  'Brentford': [
    { name: 'Umbro',              type: 'Training Kit',   bonus:   2_500_000, chance: 86 },
    { name: 'Hollywoodbets',      type: 'Sleeve Partner', bonus:   5_000_000, chance: 74 },
    { name: 'Castore',            type: 'Kit Supplier',   bonus:  10_000_000, chance: 56 },
    { name: 'Bet365',             type: 'Shirt Sponsor',  bonus:  15_000_000, chance: 42 },
    { name: 'Monzo',              type: 'Fintech Deal',   bonus:  20_000_000, chance: 30 },
    { name: 'Puma',               type: 'Kit Switch',     bonus:  28_000_000, chance: 20 },
    { name: 'Adidas',             type: 'Kit Switch',     bonus:  38_000_000, chance: 13 },
    { name: 'Nike',               type: 'Mega Kit Deal',  bonus:  50_000_000, chance:  5 },
  ],

  'Crystal Palace': [
    { name: 'Macron',             type: 'Training Kit',   bonus:   2_500_000, chance: 86 },
    { name: 'Betway',             type: 'Sleeve Partner', bonus:   5_000_000, chance: 74 },
    { name: 'Umbro',              type: 'Kit Supplier',   bonus:  10_000_000, chance: 56 },
    { name: 'W88',                type: 'Shirt Sponsor',  bonus:  14_000_000, chance: 42 },
    { name: 'Cazoo',              type: 'Shirt Sponsor',  bonus:  20_000_000, chance: 30 },
    { name: 'New Balance',        type: 'Kit Switch',     bonus:  27_000_000, chance: 20 },
    { name: 'Puma',               type: 'Kit Switch',     bonus:  36_000_000, chance: 13 },
    { name: 'Adidas',             type: 'Mega Kit Deal',  bonus:  48_000_000, chance:  5 },
  ],

  'Bournemouth': [
    { name: 'Macron',             type: 'Training Kit',   bonus:   2_000_000, chance: 87 },
    { name: 'Paddy Power',        type: 'Sleeve Partner', bonus:   4_500_000, chance: 74 },
    { name: 'Hummel',             type: 'Kit Supplier',   bonus:   9_000_000, chance: 56 },
    { name: 'Dafabet',            type: 'Shirt Sponsor',  bonus:  13_000_000, chance: 42 },
    { name: 'Stake.com',          type: 'Shirt Sponsor',  bonus:  18_000_000, chance: 30 },
    { name: 'Castore',            type: 'Kit Switch',     bonus:  25_000_000, chance: 20 },
    { name: 'New Balance',        type: 'Kit Switch',     bonus:  33_000_000, chance: 13 },
    { name: 'Puma',               type: 'Mega Kit Deal',  bonus:  44_000_000, chance:  5 },
  ],

  'Leeds United': [
    { name: 'Kappa',              type: 'Training Kit',   bonus:   2_500_000, chance: 87 },
    { name: 'Sky Bet',            type: 'Sleeve Partner', bonus:   5_000_000, chance: 74 },
    { name: 'Adidas',             type: 'Kit Renewal',    bonus:  10_000_000, chance: 57 },
    { name: 'SBOTOP',             type: 'Shirt Sponsor',  bonus:  15_000_000, chance: 42 },
    { name: 'Bet365',             type: 'Shirt Sponsor',  bonus:  21_000_000, chance: 30 },
    { name: 'New Balance',        type: 'Kit Switch',     bonus:  28_000_000, chance: 20 },
    { name: 'Puma',               type: 'Kit Switch',     bonus:  38_000_000, chance: 13 },
    { name: 'Nike',               type: 'Mega Kit Deal',  bonus:  52_000_000, chance:  5 },
  ],

  'Sunderland': [
    { name: 'Macron',             type: 'Training Kit',   bonus:   1_500_000, chance: 87 },
    { name: 'Hollywoodbets',      type: 'Sleeve Partner', bonus:   3_500_000, chance: 74 },
    { name: 'Hummel',             type: 'Kit Supplier',   bonus:   7_000_000, chance: 56 },
    { name: 'Bet365',             type: 'Shirt Sponsor',  bonus:  11_000_000, chance: 42 },
    { name: 'Paddy Power',        type: 'Shirt Sponsor',  bonus:  15_000_000, chance: 30 },
    { name: 'Castore',            type: 'Kit Switch',     bonus:  21_000_000, chance: 20 },
    { name: 'Umbro',              type: 'Kit Switch',     bonus:  29_000_000, chance: 13 },
    { name: 'Adidas',             type: 'Mega Kit Deal',  bonus:  40_000_000, chance:  5 },
  ],

  'Coventry City': [
    { name: 'Errea',              type: 'Training Kit',   bonus:   1_200_000, chance: 88 },
    { name: 'Paddy Power',        type: 'Sleeve Partner', bonus:   3_000_000, chance: 75 },
    { name: 'Hummel',             type: 'Kit Supplier',   bonus:   6_000_000, chance: 57 },
    { name: 'Bet365',             type: 'Shirt Sponsor',  bonus:   9_500_000, chance: 42 },
    { name: 'Cazoo',              type: 'Shirt Sponsor',  bonus:  13_000_000, chance: 30 },
    { name: 'Castore',            type: 'Kit Switch',     bonus:  18_000_000, chance: 20 },
    { name: 'Umbro',              type: 'Kit Switch',     bonus:  25_000_000, chance: 13 },
    { name: 'Adidas',             type: 'Mega Kit Deal',  bonus:  35_000_000, chance:  5 },
  ],

  'Hull City': [
    { name: 'Errea',              type: 'Training Kit',   bonus:   1_000_000, chance: 88 },
    { name: 'Sky Bet',            type: 'Sleeve Partner', bonus:   2_500_000, chance: 75 },
    { name: 'Macron',             type: 'Kit Supplier',   bonus:   5_000_000, chance: 57 },
    { name: 'Hollywoodbets',      type: 'Shirt Sponsor',  bonus:   8_000_000, chance: 42 },
    { name: 'Bet365',             type: 'Shirt Sponsor',  bonus:  11_000_000, chance: 30 },
    { name: 'Hummel',             type: 'Kit Switch',     bonus:  15_000_000, chance: 20 },
    { name: 'Castore',            type: 'Kit Switch',     bonus:  21_000_000, chance: 13 },
    { name: 'Puma',               type: 'Mega Kit Deal',  bonus:  30_000_000, chance:  5 },
  ],

  'Ipswich Town': [
    { name: 'Errea',              type: 'Training Kit',   bonus:   1_200_000, chance: 88 },
    { name: 'Paddy Power',        type: 'Sleeve Partner', bonus:   3_000_000, chance: 75 },
    { name: 'Macron',             type: 'Kit Supplier',   bonus:   6_000_000, chance: 57 },
    { name: 'Bet365',             type: 'Shirt Sponsor',  bonus:   9_500_000, chance: 42 },
    { name: 'Dafabet',            type: 'Shirt Sponsor',  bonus:  13_000_000, chance: 30 },
    { name: 'Castore',            type: 'Kit Switch',     bonus:  18_000_000, chance: 20 },
    { name: 'Hummel',             type: 'Kit Switch',     bonus:  25_000_000, chance: 13 },
    { name: 'Adidas',             type: 'Mega Kit Deal',  bonus:  35_000_000, chance:  5 },
  ],
};

export function getSponsors(club) {
  return CLUB_SPONSORS[club] ?? [
    { name: 'Errea',    type: 'Training Kit',   bonus:  2_000_000, chance: 88 },
    { name: 'Sky Bet',  type: 'Sleeve Partner', bonus:  4_000_000, chance: 75 },
    { name: 'Macron',   type: 'Kit Supplier',   bonus:  8_000_000, chance: 57 },
    { name: 'Bet365',   type: 'Shirt Sponsor',  bonus: 12_000_000, chance: 42 },
    { name: 'Betway',   type: 'Shirt Sponsor',  bonus: 17_000_000, chance: 30 },
    { name: 'Castore',  type: 'Kit Switch',     bonus: 23_000_000, chance: 20 },
    { name: 'Puma',     type: 'Kit Switch',     bonus: 31_000_000, chance: 13 },
    { name: 'Adidas',   type: 'Mega Kit Deal',  bonus: 42_000_000, chance:  5 },
  ];
}
