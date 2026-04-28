export interface Contest {
  id: number;
  name: string;
  description: string;
  fee: string;
  rounds: number;
  format: string;
  prizes: string[];
  path?: string;
}

export const contests: Contest[] = [
  {
    id: 1,
    name: 'Daily Knockout Tournament',
    description: 'Compete in our daily tournament and win prizes.',
    fee: '₹20',
    rounds: 7,
    format: '1 vs 1 Knockout',
    prizes: ['Winner takes all'],
    path: '/daily-knockout-tournament'
  },
  {
    id: 2,
    name: 'Weekly Showdown',
    description: 'The ultimate weekly challenge for serious players.',
    fee: '500 Coins',
    rounds: 7,
    format: 'Arena',
    prizes: ['1st: 2000 Coins', '2nd: 1000 Coins', '3rd: 500 Coins'],
  },
  {
    id: 3,
    name: 'Weekend Blitz',
    description: 'Fast-paced action in our weekend blitz tournament.',
    fee: '50 Coins',
    rounds: 10,
    format: 'Blitz',
    prizes: ['1st: 300 Coins', '2nd: 150 Coins', '3rd: 50 Coins'],
  },
  {
    id: 4,
    name: 'Monthly Marathon',
    description: 'A month-long tournament with a huge prize pool.',
    fee: '1000 Coins',
    rounds: 20,
    format: 'Round Robin',
    prizes: ['1st: 10000 Coins', '2nd: 5000 Coins', '3rd: 2500 Coins'],
  },
  {
    id: 5,
    name: 'Rookie Rumble',
    description: 'A friendly tournament for newcomers to the game.',
    fee: 'Free',
    rounds: 3,
    format: 'Swiss',
    prizes: ['1st: 100 Coins & Bragging Rights'],
  },
  {
    id: 6,
    name: 'Grandmaster Clash',
    description: 'An exclusive, high-stakes tournament for top players.',
    fee: 'By Invitation',
    rounds: 9,
    format: 'Knockout',
    prizes: ['Winner takes all: 50000 Coins'],
  },
];
