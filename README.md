# Something Strange

A Rare Friends Vibeathon game built with **FriendSDK v0.1.2**.

Your selected Rare Friend walks an orbital outpost that is listening to the wrong frequency. Buy a tuning fork at the listening post, strike it at the answering dish, and keep whatever should not have answered.

**Builder:** Sharp ([@Sharpbigred](https://x.com/Sharpbigred))  
**Category:** Character Spotlight  
**SDK:** FriendSDK v0.1.2

## Play on your computer

You need **Node.js 22+**, Git, and a browser wallet on **Robinhood mainnet (chain 4663)** holding a hardwired Rare Friends Generations NFT (generation ≥ 1). Preview play is simulated: no RF spend and no transaction signature.

```sh
git clone https://github.com/spokesz/friendsdk.git
cd friendsdk
npm ci
npm run build

git clone https://github.com/stevereynolds2006-ship-it/something-strange.git /tmp/something-strange
mkdir -p games/something-strange
cp /tmp/something-strange/game/* games/something-strange/

npm run dev:game -- games/something-strange
```

Open the printed URL, usually `http://localhost:4173`. Connect the wallet, switch to Robinhood if asked, select your Friend, and enter the outpost.

### Play on your phone (same Wi-Fi)

On the computer running the game:

```sh
npm run dev:game -- games/something-strange --host 0.0.0.0 --port 4173
```

On your phone, open `http://YOUR_COMPUTER_LAN_IP:4173` in a browser that can connect a wallet. Allow port 4173 through the computer firewall if needed.

## How to play

1. Walk with **WASD / arrow keys**, or tap / click a destination.
2. At **Listening post**, press **E** or tap the prompt and buy one simulated tuning fork (1 RF).
3. Walk to **Strike a fork** at the dish and strike it.
4. Read the field note, keep the object, or redeem it from **Cabinet**.
5. **Notes** remembers this session only. Reloading resets simulated balances.
6. **Settings** has mute and reduced motion.

## Economy (all simulated)

| Answer | Chance | Redemption |
| --- | ---: | ---: |
| A door that opens onto itself | 30% | 0.25 RF |
| A second shadow | 25% | 0.40 RF |
| A clock that counts sideways | 18% | 0.75 RF |
| A room that remembers you | 12% | 1.00 RF |
| A Friend-shaped hole | 8% | 1.75 RF |
| Static that knows your name | 5% | 3.00 RF |
| The other Friend | 2% | 6.00 RF |

- Fork price: **1 RF**
- Expected reward: **0.84 RF** per fork
- One fork produces exactly one answer
- Each purchased or pending fork reserves **6 RF** (the maximum prize)
- Kept objects reserve their fixed RF value with no expiry
- Reloading starts a new preview session

The selected Friend is the player character, drawn with the SDK's canonical Generations artwork. Wallet connection, ownership checks and confirmations stay in the FriendSDK runtime.

## Checks

From a FriendSDK checkout after copying this game into `games/something-strange`:

```sh
npm run check:games
```

`games/something-strange` validates: expected reward `840000000000000000` base units; maximum prize `6000000000000000000` base units.

## Vibeathon

Do not submit until you are happy with the feel. When you are, ask to open a pull request against [rarefriends-vibeathon](https://github.com/spokesz/rarefriends-vibeathon) using this repository as the source.

Artwork and world presets follow FriendSDK [NOTICE.md](NOTICE.md).
