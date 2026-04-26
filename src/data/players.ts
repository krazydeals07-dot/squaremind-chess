
export interface Player {
    rank: number;
    name: string;
    avatar: string;
    rating: number; // Added rating
}

// Add some dummy data for global players with ratings
export const globalPlayers: Player[] = [
    { rank: 1, name: 'Magnus Carlsen', avatar: 'https://images.chesscomfiles.com/uploads/v1/master_player/30c99264-3243-11e8-9421-af517c2ebfed.1e700388.250x250o.f2bdead631e2.jpg', rating: 2830 },
    { rank: 2, name: 'Fabiano Caruana', avatar: 'https://images.chesscomfiles.com/uploads/v1/master_player/1b6dce68-201d-11e9-94e3-a56917c5b1d9.353e1a80.250x250o.f8c27f7a77b7.jpg', rating: 2805 },
    { rank: 3, name: 'Hikaru Nakamura', avatar: 'https://images.chesscomfiles.com/uploads/v1/master_player/7d0d62a4-23ce-11e8-9419-735749365518.57143e12.250x250o.933b4971c26c.jpg', rating: 2797 },
    { rank: 4, name: 'Ding Liren', avatar: 'https://images.chesscomfiles.com/uploads/v1/master_player/9950e828-23d2-11e8-941a-0155b172a123.6338c234.250x250o.1802b1f1f9a7.jpg', rating: 2775 },
    { rank: 5, name: 'Ian Nepomniachtchi', avatar: 'https://images.chesscomfiles.com/uploads/v1/master_player/11f481a4-23d1-11e8-941a-0155b172a123.e521d28a.250x250o.d55f5f1268c7.jpg', rating: 2771 },
    { rank: 6, name: 'Alireza Firouzja', avatar: 'https://images.chesscomfiles.com/uploads/v1/master_player/8d370e84-b0a3-11e9-9b16-e52f0857d4a6.68a6236b.250x250o.ba28c3104675.jpg', rating: 2765 },
    { rank: 7, name: 'Wesley So', avatar: 'https://images.chesscomfiles.com/uploads/v1/master_player/0879663c-23d3-11e8-941a-0155b172a123.e7f8a736.250x250o.983c513295c2.jpg', rating: 2755 },
    { rank: 8, name: 'Levon Aronian', avatar: 'https://images.chesscomfiles.com/uploads/v1/master_player/31a72304-23d1-11e8-941a-0155b172a123.6c598063.250x250o.b55948a80408.jpg', rating: 2742 },
    { rank: 9, name: 'Anish Giri', avatar: 'https://images.chesscomfiles.com/uploads/v1/master_player/43b879a8-23d1-11e8-941a-0155b172a123.d8329434.250x250o.a2b001153703.jpg', rating: 2734 },
    { rank: 10, name: 'Maxime Vachier-Lagrave', avatar: 'https://images.chesscomfiles.com/uploads/v1/master_player/3196a6e8-23d3-11e8-941a-0155b172a123.4a3f4e12.250x250o.2a27a8cc5f10.jpg', rating: 2731 },
];

// Add some dummy data for India players with ratings
export const indiaPlayers: Player[] = [
    { rank: 1, name: 'Viswanathan Anand', avatar: 'https://images.chesscomfiles.com/uploads/v1/master_player/e6d7f768-23d3-11e8-941a-0155b172a123.73877cfc.250x250o.5290b2075f78.jpg', rating: 2751 },
    { rank: 2, name: 'Gukesh D', avatar: 'https://images.chesscomfiles.com/uploads/v1/master_player/e336b1de-2f56-11ed-94e4-a56917c5b1d9.a92e8609.250x250o.7313a36253e9.jpg', rating: 2743 },
    { rank: 3, name: 'Praggnanandhaa R', avatar: 'https://images.chesscomfiles.com/uploads/v1/master_player/5c8c5c64-e565-11e9-a864-a56917c5b1d9.444d5c80.250x250o.793754e60473.jpg', rating: 2738 },
    { rank: 4, name: 'Vidit Gujrathi', avatar: 'https://images.chesscomfiles.com/uploads/v1/master_player/0d364f78-23d4-11e8-941a-0155b172a123.b4d4c67c.250x250o.38c8c50c7075.jpg', rating: 2721 },
    { rank: 5, name: 'Arjun Erigaisi', avatar: 'https://images.chesscomfiles.com/uploads/v1/master_player/a5e09f66-23d2-11e8-941a-0155b172a123.0841a022.250x250o.b01149453a98.jpg', rating: 2713 },
    { rank: 6, name: 'Pentala Harikrishna', avatar: 'https://images.chesscomfiles.com/uploads/v1/master_player/642967e8-23d1-11e8-941a-0155b172a123.11c504ca.250x250o.89e8f668383f.jpg', rating: 2696 },
    { rank: 7, name: 'Nihal Sarin', avatar: 'https://images.chesscomfiles.com/uploads/v1/master_player/86241a8a-23d1-11e8-941a-0155b172a123.d781b4be.250x250o.180f63908f51.jpg', rating: 2688 },
    { rank: 8, name: 'S. L. Narayanan', avatar: 'https://images.chesscomfiles.com/uploads/v1/master_player/31b08404-23d3-11e8-941a-0155b172a123.4d3714b4.250x250o.b7593c68383a.jpg', rating: 2663 },
    { rank: 9, name: 'Aryan Chopra', avatar: 'https://images.chesscomfiles.com/uploads/v1/master_player/4190c74c-2041-11e9-ae1e-a56917c5b1d9.37877232.250x250o.36a3f2f81504.jpg', rating: 2636 },
    { rank: 10, name: 'Raunak Sadhwani', avatar: 'https://images.chesscomfiles.com/uploads/v1/master_player/89e173e2-23d2-11e8-941a-0155b172a123.a79a6132.250x250o.13320059e69c.jpg', rating: 2627 },
];
