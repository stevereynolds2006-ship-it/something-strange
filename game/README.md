# Something Strange

SDK version **v0.1.2**. Walk your Rare Friend across an orbital outpost that is receiving the wrong signal. Buy a tuning fork at the listening post, strike it at the answering dish, and keep whatever should not have answered.

The SDK runtime supplies wallet connection, owned Friend selection, inventory, confirmations and the sandboxed 960 × 640 container. This component does not add another identity flow.

## Play

From the FriendSDK root, with Node.js 22+:

```sh
npm ci
npm run build
npm run dev:game -- games/something-strange
```

Open the printed URL (normally `http://localhost:4173`). Connect a browser wallet on Robinhood mainnet (chain 4663) that holds a hardwired Rare Friends Generations NFT, generation 1 or higher. Select that Friend and enter the outpost.

Move with WASD, arrow keys, or a tap/click destination. Walk to **Listening post**, press E or tap the prompt, and buy a simulated tuning fork. Walk to **Strike a fork** at the dish to receive an answer. Keep the object or redeem it from **Cabinet**. **Notes** stores session handwriting only. Settings include mute and reduced motion.

For LAN / phone testing on the same network:

```sh
npm run dev:game -- games/something-strange --host 0.0.0.0 --port 4173
```

## Rules

| Rule | Exact value |
| --- | --- |
| Tuning fork price | 1 RF (`1000000000000000000` base units) |
| A door that opens onto itself | 30% / 3,000 bps; 0.25 RF |
| A second shadow | 25% / 2,500 bps; 0.40 RF |
| A clock that counts sideways | 18% / 1,800 bps; 0.75 RF |
| A room that remembers you | 12% / 1,200 bps; 1.00 RF |
| A Friend-shaped hole | 8% / 800 bps; 1.75 RF |
| Static that knows your name | 5% / 500 bps; 3.00 RF |
| The other Friend | 2% / 200 bps; 6.00 RF |
| Expected reward | 0.84 RF per fork |
| Consumable | One fork produces exactly one answer |
| Backing | Each purchased or pending fork reserves 6 RF; kept rewards reserve their fixed RF value |
| Redemption | Fixed value, no expiry; paid to the selected Friend's canonical wallet in a future approved real integration |

All balances, purchases, answers, collectibles and redemptions are simulated. An owned hardwired Generations NFT is still required. The component only calls the SDK's fixed preview client. Reloading resets preview state. No trading, creator fees or wearable NFTs are implemented.

The selected Friend is drawn with the SDK's canonical sprites. The world is the bundled Orbital Array preset with the existing dishes, terminals and crates.
