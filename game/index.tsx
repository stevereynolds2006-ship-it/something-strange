"use client";

import { useEffect, useRef, useState } from "react";
import type { GameComponentProps } from "@rarefriends/friendsdk/runtime";
import { GameWorld, type GameWorldInteraction } from "@rarefriends/friendsdk/world-view";
import { getWorldPreset, validateWorld } from "@rarefriends/friendsdk/world";
import { GameMenu } from "@rarefriends/friendsdk/frame";
import { formatGameAmount } from "@rarefriends/friendsdk/ui";
import { maximumPrize, type GameSnapshot, type GamePlay } from "@rarefriends/friendsdk/game";
import { createFriendSoundKit, type FriendSoundKit, type FriendSoundCue } from "@rarefriends/friendsdk/sounds";
import "@rarefriends/friendsdk/frame.css";
import "@rarefriends/friendsdk/world-view.css";
import "./style.css";

const outpost = getWorldPreset("06-orbital-hex-complete");
const world = validateWorld({
  ...outpost,
  actors: [],
});
const spawn = [288, 210] as const;
const interactions: readonly GameWorldInteraction[] = [
  { id: "buy", label: "Listening post", position: [203, 120], reach: 92, labelOffset: -170 },
  { id: "tune", label: "Strike a fork", position: [234, 247], reach: 92, labelOffset: -150 },
];
type Menu = "buy" | "tune" | "inventory" | "settings" | "reward" | "fieldnotes" | null;
const rf = (value: bigint) => `${formatGameAmount(value, 18)} RF`;

const NOTES: Record<string, string> = {
  "A door that opens onto itself": "You turn the handle. The room you just left is waiting on the other side, already looking at you.",
  "A second shadow": "It stands a half-step behind your Friend. It does not copy the walk. It copies the pause.",
  "A clock that counts sideways": "The hands agree on a time that is not a time. Nearby dishes click once, then forget.",
  "A room that remembers you": "The walls keep a version of your Friend from before you arrived. It is almost polite.",
  "A Friend-shaped hole": "The air has a missing silhouette. When your Friend stands in it, the fit is too exact.",
  "Static that knows your name": "White noise says the token number like a nickname. Then it waits to be answered.",
  "The other Friend": "Same face. Wrong generation of the moment. It smiles with the delay of a recording.",
};

const GLYPHS = ["⌬", "⌖", "◌", "▣", "◎", "◍", "◉"];

/** Walk your owned Rare Friend through an outpost that should not be answering. */
export default function SomethingStrange({ friendId, client, paused }: GameComponentProps) {
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [menu, setMenu] = useState<Menu>(null);
  const [result, setResult] = useState<GamePlay | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [muted, setMuted] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  const sound = useRef<FriendSoundKit | null>(null);
  const locked = useRef(false);
  const epoch = useRef(0);
  const definition = client.definition;

  useEffect(() => {
    const version = ++epoch.current;
    sound.current = createFriendSoundKit({ muted: true });
    setSnapshot(null); setMenu(null); setResult(null); setError(""); setMessage("");
    setBusy(false); setMuted(true); setNotes([]); locked.current = false;
    void client.read().then(value => { if (version === epoch.current) setSnapshot(value); }).catch(cause => {
      if (version === epoch.current) setError(cause instanceof Error ? cause.message : "Could not load the preview.");
    });
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => {
      epoch.current++;
      sound.current?.dispose();
      sound.current = null;
      preference.removeEventListener("change", update);
    };
  }, [client, friendId]);

  async function act(work: () => Promise<void>, cue?: FriendSoundCue, after?: () => void) {
    if (locked.current || paused) return;
    const version = epoch.current;
    locked.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    void sound.current?.unlock();
    try {
      await work();
      const value = await client.read();
      if (version === epoch.current) {
        setSnapshot(value);
        if (cue) sound.current?.play(cue);
        after?.();
      }
    } catch (cause) {
      if (version === epoch.current) setError(cause instanceof Error ? cause.message : "The preview action failed.");
    } finally {
      if (version === epoch.current) {
        locked.current = false;
        setBusy(false);
      }
    }
  }

  const navigate = (next: Menu) => {
    if (!busy && !paused) {
      setMenu(next);
      setError("");
      setMessage("");
    }
  };

  const feedback = (
    <p role={error ? "alert" : "status"}>
      {error || message || (busy ? "Waiting for preview confirmation…" : "Simulated RF. The signal is not.")}
    </p>
  );

  if (!snapshot) {
    return (
      <div className="strange-loading" role={error ? "alert" : "status"}>
        {error || "The outpost is aligning to your Friend…"}
        {error && <button type="button" disabled={busy || paused} onClick={() => void act(async () => {})}>Retry</button>}
      </div>
    );
  }
  if (snapshot.friendId !== friendId) {
    return <p role="alert">This game session does not match the selected Friend.</p>;
  }

  const maxPrize = maximumPrize(definition);
  const canBuy = snapshot.rfBalance >= definition.price && snapshot.freeStake >= maxPrize && snapshot.freeStake + definition.price >= maxPrize;
  const pending = snapshot.plays.find(play => play.outcomeId === null);
  const outcome = result?.outcomeId ? definition.outcomes[result.outcomeId - 1] : null;
  const count = snapshot.inventory.reduce((total, amount) => total + amount, 0n);

  const strikeFork = () => act(async () => {
    const version = epoch.current;
    const play = pending ?? (await client.play(1n))[0];
    const settled = await client.settle(play.id);
    if (version === epoch.current) {
      setResult(settled);
      const found = settled.outcomeId ? definition.outcomes[settled.outcomeId - 1] : null;
      if (found) setNotes(current => [`${found.name} — Friend #${friendId.toString()}`, ...current].slice(0, 8));
      setMenu("reward");
    }
  }, "reveal-common");

  return (
    <section className="strange-game" aria-label={definition.name} aria-busy={busy}>
      <div className="strange-world" inert={Boolean(menu) || paused || undefined}>
        <GameWorld
          world={world}
          spawn={spawn}
          interactions={interactions}
          friendId={friendId}
          paused={Boolean(menu) || paused}
          reducedMotion={reducedMotion}
          onInteract={id => navigate(id === "buy" ? "buy" : "tune")}
        />
        <div className="strange-hud">
          <span>Preview · {rf(snapshot.rfBalance)} · {snapshot.consumables.toString()} forks</span>
          <button type="button" onClick={() => navigate("inventory")}>Cabinet · {count.toString()}</button>
          <button type="button" onClick={() => navigate("fieldnotes")}>Notes</button>
          <button type="button" onClick={() => navigate("settings")}>Settings</button>
        </div>
        <p className="strange-hint">
          <span className="strange-desktop-hint">WASD / arrows to walk · Tap a destination · E near a station</span>
          <span className="strange-mobile-hint">Tap to walk · E / tap near a station</span>
        </p>
      </div>
      {menu && (
        <GameMenu
          title={
            menu === "buy" ? "Listening post"
              : menu === "tune" ? "The answering dish"
                : menu === "reward" ? "Something answers"
                  : menu === "inventory" ? "Strange cabinet"
                    : menu === "fieldnotes" ? "Field notes"
                      : "Settings"
          }
          onClose={busy ? undefined : () => navigate(null)}
        >
          {menu === "buy" ? <>
            <p>The dishes are already listening. A tuning fork costs {rf(definition.price)} and produces exactly one answer.</p>
            <table>
              <thead><tr><th>What answers</th><th>Chance</th><th>Value</th></tr></thead>
              <tbody>
                {definition.outcomes.map(item => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.chanceBps / 100}%</td>
                    <td>{rf(item.reward)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              className="rf-frame-primary"
              disabled={!canBuy || busy || paused}
              onClick={() => void act(() => client.buy(1n), "purchase", () => setMessage("A simulated fork is now in your Friend's hand."))}
            >
              Buy one fork · {rf(definition.price)}
            </button>
            {!canBuy && <p>{snapshot.rfBalance < definition.price ? "Not enough simulated RF." : "New forks wait until there is enough free backing for the rarest answer."}</p>}
            <p>Every fork reserves {rf(maxPrize)}. Purchased forks remain usable after reload of this session only.</p>
          </> : menu === "tune" ? <>
            <p>{snapshot.consumables.toString()} forks ready. Strike one at the dish. The outpost will answer with something that should not exist.</p>
            <button
              type="button"
              className="rf-frame-primary"
              disabled={busy || paused || !pending && snapshot.consumables === 0n}
              onClick={() => void strikeFork()}
            >
              {pending ? "Finish the pending answer" : "Strike one fork"}
            </button>
          </> : menu === "reward" && outcome ? (
            <div className="strange-reward">
              <span aria-hidden="true">{GLYPHS[(result?.outcomeId ?? 1) - 1] ?? "◉"}</span>
              <h3>{outcome.name}</h3>
              <p>{rf(outcome.reward)} · {outcome.chanceBps / 100}% chance</p>
              <p className="strange-note">{NOTES[outcome.name] ?? "The outpost files it without comment."}</p>
              <p>This simulated object is already in your Friend's cabinet.</p>
              <button type="button" disabled={busy || paused} onClick={() => navigate(null)}>Keep it</button>
              {outcome.reward > 0n && (
                <button
                  type="button"
                  disabled={busy || paused}
                  onClick={() => void act(() => client.redeem(result!.outcomeId!, 1n), "reward", () => setMenu("inventory"))}
                >
                  Redeem · {rf(outcome.reward)}
                </button>
              )}
            </div>
          ) : menu === "inventory" ? <>
            <p>Kept answers keep a fixed RF value with no expiry. They belong to Friend #{friendId.toString()}.</p>
            {definition.outcomes.map((item, index) => (
              <div className="strange-item" key={item.name}>
                <span>
                  <strong>{item.name}</strong>
                  <small>{snapshot.inventory[index].toString()} owned · {rf(item.reward)}</small>
                </span>
                <button
                  type="button"
                  disabled={busy || paused || snapshot.inventory[index] === 0n || item.reward === 0n}
                  onClick={() => void act(() => client.redeem(index + 1, 1n), "reward")}
                >
                  Redeem one
                </button>
              </div>
            ))}
          </> : menu === "fieldnotes" ? <>
            <p>Session notes only. Reloading the preview forgets the outpost's handwriting.</p>
            {notes.length === 0 ? <p>Nothing has answered yet.</p> : (
              <ul className="strange-log">
                {notes.map((note, index) => <li key={`${note}-${index}`}>{note}</li>)}
              </ul>
            )}
          </> : menu === "settings" ? <>
            <button
              type="button"
              aria-pressed={!muted}
              onClick={() => {
                const next = !muted;
                setMuted(next);
                sound.current?.setMuted(next);
                if (!next) void sound.current?.unlock();
              }}
            >
              {muted ? "Sound off" : "Sound on"}
            </button>
            <label>
              <input type="checkbox" checked={reducedMotion} onChange={event => setReducedMotion(event.target.checked)} />
              Reduce motion
            </label>
            <p>All economy actions are simulated. Reloading resets this preview. Wallet connection and ownership verification are provided by the SDK.</p>
          </> : null}
          {feedback}
        </GameMenu>
      )}
    </section>
  );
}
