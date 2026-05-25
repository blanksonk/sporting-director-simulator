import { SPONSOR_BONUS } from './budgets.js';

const S = SPONSOR_BONUS;

// Per-club sponsor shortlists. Fallback applies to any unrecognised club.
export const CLUB_SPONSORS = {
  'Arsenal': [
    { name: 'Emirates',    tagline: 'Fly Better',                     bonus: S.large  },
    { name: 'Adidas',      tagline: 'Impossible is Nothing',          bonus: S.medium },
    { name: 'Visit Rwanda', tagline: 'Come Visit Us',                 bonus: S.small  },
    { name: 'Lavazza',     tagline: 'The Art of Espresso',            bonus: S.medium },
  ],
  'Chelsea': [
    { name: 'Infinite Athlete', tagline: 'Unlock Human Potential',   bonus: S.large  },
    { name: 'Nike',          tagline: 'Just Do It',                   bonus: S.medium },
    { name: 'Trivago',       tagline: 'Hotel? Trivago.',              bonus: S.small  },
    { name: 'WhaleFin',      tagline: 'The Future of Finance',        bonus: S.medium },
  ],
  'Liverpool': [
    { name: 'Standard Chartered', tagline: 'Here for Good',          bonus: S.large  },
    { name: 'Nike',            tagline: 'Just Do It',                 bonus: S.medium },
    { name: 'Expedia',         tagline: 'One Key, All Rewards',       bonus: S.medium },
    { name: 'Peloton',         tagline: 'Together We Go Far',         bonus: S.small  },
  ],
  'Manchester City': [
    { name: 'Etihad Airways',  tagline: 'Choose Well',                bonus: S.large  },
    { name: 'Puma',            tagline: 'Forever Faster',             bonus: S.medium },
    { name: 'OKX',             tagline: 'Trade Crypto Anywhere',      bonus: S.medium },
    { name: 'Nissan',          tagline: 'Innovation That Excites',    bonus: S.small  },
  ],
  'Manchester United': [
    { name: 'Snapdragon',    tagline: 'Power the Dream',              bonus: S.large  },
    { name: 'TeamViewer',    tagline: 'Remote. Together.',            bonus: S.medium },
    { name: 'INEOS',         tagline: 'Tackling Industry\'s Toughest Challenges', bonus: S.medium },
    { name: 'Adidas',        tagline: 'Impossible is Nothing',        bonus: S.large  },
  ],
  'Tottenham Hotspur': [
    { name: 'AIA',           tagline: 'Real Life, Real You',          bonus: S.large  },
    { name: 'Nike',          tagline: 'Just Do It',                   bonus: S.medium },
    { name: 'Cinch',         tagline: 'The Better Way to Buy a Car',  bonus: S.small  },
    { name: 'Qualcomm',      tagline: 'Inventing the Future',         bonus: S.medium },
  ],
  'Newcastle United': [
    { name: 'Sela',          tagline: 'Creating Extraordinary Moments', bonus: S.large },
    { name: 'Fun88',         tagline: 'Fun Never Stops',              bonus: S.medium },
    { name: 'Adidas',        tagline: 'Impossible is Nothing',        bonus: S.medium },
    { name: 'Sage',          tagline: 'How the World Works',          bonus: S.small  },
  ],
  'Aston Villa': [
    { name: 'Unai',          tagline: 'Leading the Game',             bonus: S.medium },
    { name: 'Cazoo',         tagline: 'Buy a Car the Right Way',      bonus: S.small  },
    { name: 'Betway',        tagline: 'Bet with Purpose',             bonus: S.medium },
    { name: 'FxPro',         tagline: 'Smart Trading Tools',          bonus: S.large  },
  ],
  'West Ham United': [
    { name: 'Betway',        tagline: 'Bet with Purpose',             bonus: S.medium },
    { name: 'Umbro',         tagline: 'Football. Always.',            bonus: S.small  },
    { name: 'Visit Thailand', tagline: 'Amazing Thailand',            bonus: S.medium },
    { name: 'Cazoo',         tagline: 'Buy a Car the Right Way',      bonus: S.large  },
  ],
  'Brighton': [
    { name: 'American Express', tagline: 'Don\'t Live Life Without It', bonus: S.large },
    { name: 'Nike',           tagline: 'Just Do It',                  bonus: S.medium },
    { name: 'Paddy Power',    tagline: 'Relentlessly Honest',         bonus: S.small  },
    { name: 'eToro',          tagline: 'Smart Investing',             bonus: S.medium },
  ],
  'Fulham': [
    { name: 'W88',           tagline: 'Champions of Betting',         bonus: S.medium },
    { name: 'Adidas',        tagline: 'Impossible is Nothing',        bonus: S.small  },
    { name: 'Dafabet',       tagline: 'Your Betting Partner',         bonus: S.medium },
    { name: 'Hisense',       tagline: 'Closer to Perfection',         bonus: S.large  },
  ],
  'Wolves': [
    { name: 'AstroPay',      tagline: 'One Touch, All in',            bonus: S.medium },
    { name: 'Castore',       tagline: 'Engineered for Sport',         bonus: S.small  },
    { name: 'Betano',        tagline: 'Feel the Game',                bonus: S.medium },
    { name: 'ManBetX',       tagline: 'Bet Smarter',                  bonus: S.large  },
  ],
  'Everton': [
    { name: 'Stake.com',     tagline: 'Be a Player',                  bonus: S.medium },
    { name: 'Hummel',        tagline: 'The Original',                 bonus: S.small  },
    { name: 'Cazoo',         tagline: 'Buy a Car the Right Way',      bonus: S.medium },
    { name: 'Angry Birds',   tagline: 'Slingshot Your Way to Fun',    bonus: S.large  },
  ],
  'Crystal Palace': [
    { name: 'Cinch',         tagline: 'The Better Way to Buy a Car',  bonus: S.medium },
    { name: 'Macron',        tagline: 'Kit for Champions',            bonus: S.small  },
    { name: 'W88',           tagline: 'Champions of Betting',         bonus: S.medium },
    { name: 'Visit Malta',   tagline: 'Feel the Warmth',              bonus: S.large  },
  ],
  'Brentford': [
    { name: 'Hollywoodbets', tagline: 'Bet Smart, Win Big',           bonus: S.medium },
    { name: 'Umbro',         tagline: 'Football. Always.',            bonus: S.small  },
    { name: 'Mauá Bank',     tagline: 'Banking for the Bold',         bonus: S.medium },
    { name: 'DraftKings',    tagline: 'If You Know Sports, You Know', bonus: S.large  },
  ],
  'Nottingham Forest': [
    { name: 'SBOTOP',        tagline: 'Home of Winning',              bonus: S.medium },
    { name: 'Adidas',        tagline: 'Impossible is Nothing',        bonus: S.small  },
    { name: 'Euro 88',       tagline: 'Experience Excellence',        bonus: S.medium },
    { name: 'Remark',        tagline: 'Data with Purpose',            bonus: S.large  },
  ],
  'Bournemouth': [
    { name: 'Dafabet',       tagline: 'Your Betting Partner',         bonus: S.medium },
    { name: 'Umbro',         tagline: 'Football. Always.',            bonus: S.small  },
    { name: 'easyJet',       tagline: 'Making Travel Easy',           bonus: S.medium },
    { name: 'Coral',         tagline: 'It Matters More Here',         bonus: S.large  },
  ],
  'Leicester City': [
    { name: 'FxPro',         tagline: 'Smart Trading Tools',          bonus: S.large  },
    { name: 'Adidas',        tagline: 'Impossible is Nothing',        bonus: S.medium },
    { name: 'King Power',    tagline: 'Power to Travel',              bonus: S.medium },
    { name: 'bet365',        tagline: 'Live. In-Play. Sports Betting', bonus: S.small },
  ],
  'Ipswich Town': [
    { name: 'Kramp',         tagline: 'Parts That Make the Difference', bonus: S.medium },
    { name: 'Adidas',        tagline: 'Impossible is Nothing',         bonus: S.small  },
    { name: 'KPN',           tagline: 'Connected for Life',             bonus: S.medium },
    { name: 'Visit Ipswich', tagline: 'Discover Suffolk',              bonus: S.large  },
  ],
  'Southampton': [
    { name: 'LD Sports',     tagline: 'Powered by Passion',           bonus: S.medium },
    { name: 'Hummel',        tagline: 'The Original',                 bonus: S.small  },
    { name: 'Sportsbet',     tagline: 'It\'s What We Do',             bonus: S.medium },
    { name: 'Visit Southampton', tagline: 'City by the Sea',          bonus: S.large  },
  ],
};

// Generic fallback for any club not listed
export const DEFAULT_SPONSORS = [
  { name: 'BetMGM',    tagline: 'It\'s On',                          bonus: SPONSOR_BONUS.medium },
  { name: 'Nike',      tagline: 'Just Do It',                         bonus: SPONSOR_BONUS.small  },
  { name: 'Mastercard', tagline: 'Priceless',                         bonus: SPONSOR_BONUS.large  },
  { name: 'Heineken',  tagline: 'Open Your World',                    bonus: SPONSOR_BONUS.medium },
];

export function getSponsors(clubName) {
  return CLUB_SPONSORS[clubName] || DEFAULT_SPONSORS;
}
