export interface Prize {
  rank: string;
  prize: string;
  value?: string;
}

export interface Tournament {
  id: number;
  name: string;
  category: 'Weekly' | 'Monthly' | 'Special';
  date: string;
  time: string;
  entryFee: number;
  type: 'Blitz' | 'Rapid' | 'Classic';
  rules: {
    timeLimit: string;
    rounds: number;
    rating?: string;
  };
  prizes: Prize[];
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Announced';
  participants: number;
  maxParticipants: number;
  registrationCloses: string; // ISO date string for countdown
}

export interface PastWinner {
  tournamentName: string;
  date: string;
  winners: {
    rank: string;
    name: string;
    photo?: string;
  }[];
}


export const allTournaments: Tournament[] = [
  // --- Upcoming Tournaments ---
  {
    id: 1,
    name: 'August Weekly Blitz',
    category: 'Weekly',
    date: 'Every Sunday',
    time: '7:00 PM IST',
    entryFee: 50,
    type: 'Blitz',
    rules: {
      timeLimit: '3+2',
      rounds: 7,
      rating: 'Open for all',
    },
    prizes: [
      { rank: '🥇 1st', prize: 'Premium Chess T-shirt + Mug', value: '₹800' },
      { rank: '🥈 2nd', prize: 'Printed Mug + Keychain', value: '₹500' },
      { rank: '🥉 3rd', prize: 'Discount Coupon', value: '₹100' },
    ],
    status: 'Upcoming',
    participants: 12,
    maxParticipants: 64,
    registrationCloses: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: 'September Monthly Rapid',
    category: 'Monthly',
    date: 'September 28-29, 2024',
    time: '10:00 AM IST onwards',
    entryFee: 150,
    type: 'Rapid',
    rules: {
      timeLimit: '15+10',
      rounds: 9,
      rating: 'Below 2000',
    },
    prizes: [
      { rank: '🥇 1st', prize: 'Premium Chess Board + Bag', value: '₹1500' },
      { rank: '🥈 2nd', prize: 'Chess T-shirt + Mug', value: '₹800' },
      { rank: '🥉 3rd', prize: 'Printed Mug + Keychain', value: '₹500' },
      { rank: '🏅 4th-10th', prize: 'Discount Coupons', value: '₹100 each' },
    ],
    status: 'Upcoming',
    participants: 45,
    maxParticipants: 128,
    registrationCloses: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
    // --- Ongoing Tournaments ---
  {
    id: 3,
    name: 'Independence Day Special',
    category: 'Special',
    date: 'August 15, 2024',
    time: '11:00 AM IST',
    entryFee: 100,
    type: 'Classic',
    rules: {
      timeLimit: '30+15',
      rounds: 5,
      rating: 'Open for all',
    },
    prizes: [
        { rank: '🥇 1st', prize: 'Special Edition Chess Set', value: '₹2000' },
        { rank: '🥈 2nd', prize: 'National Flag Themed Chess Clock', value: '₹1200' },
        { rank: '🥉 3rd', prize: 'Book on Indian Chess Masters', value: '₹700' },
    ],
    status: 'Ongoing',
    participants: 88,
    maxParticipants: 100,
    registrationCloses: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
    // --- Completed Tournaments ---
  {
    id: 4,
    name: 'July Monthly Classic',
    category: 'Monthly',
    date: 'July 27-28, 2024',
    time: '10:00 AM IST',
    entryFee: 150,
    type: 'Classic',
    rules: { timeLimit: '45+30', rounds: 7 },
    prizes: [],
    status: 'Completed',
    participants: 110,
    maxParticipants: 128,
    registrationCloses: '',
  },
];

export const pastWinnersData: PastWinner[] = [
    {
        tournamentName: 'July Monthly Classic',
        date: 'July 2024',
        winners: [
            { rank: '🥇 1st', name: 'Aarav Sharma', photo: 'https://i.pravatar.cc/150?img=1' },
            { rank: '🥈 2nd', name: 'Priya Patel', photo: 'https://i.pravatar.cc/150?img=2' },
            { rank: '🥉 3rd', name: 'Rohan Verma', photo: 'https://i.pravatar.cc/150?img=3' },
        ]
    },
    {
        tournamentName: 'June Weekly Blitz',
        date: 'June 2024',
        winners: [
            { rank: '🥇 1st', name: 'Sameer Khan', photo: 'https://i.pravatar.cc/150?img=4' },
            { rank: '🥈 2nd', name: 'Anika Reddy', photo: 'https://i.pravatar.cc/150?img=5' },
            { rank: '🥉 3rd', name: 'Vikram Singh', photo: 'https://i.pravatar.cc/150?img=6' },
        ]
    }
];

export const prizeImages = [
    {
        label: 'Premium Chess Board',
        imgPath: 'https://images.unsplash.com/photo-1580541832626-2a7135349c90?q=80&w=2070&auto=format&fit=crop',
    },
    {
        label: 'Chess T-Shirt',
        imgPath: 'https://images.unsplash.com/photo-1617196034796-7d7f7a8c1b52?q=80&w=1932&auto=format&fit=crop',
    },
    {
        label: 'Custom Chess Mug',
        imgPath: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?q=80&w=2070&auto=format&fit=crop',
    },
     {
        label: 'Elegant Chess Clock',
        imgPath: 'https://images.unsplash.com/photo-1629904339348-7a548d115b80?q=80&w=2070&auto=format&fit=crop',
    },
];