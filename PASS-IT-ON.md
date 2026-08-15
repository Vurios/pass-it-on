# PASS IT ON
### Full project specification and agent build prompts

A living room party game about what your family shares, and what they pass on. One shared screen hosts, everyone joins from their own phone with a four letter code, and in about twelve minutes a household learns to recognise how information gets manipulated.

Save this file at the root of your repository as `PASS-IT-ON.md`. Your coding agent reads it for context, and Part 3 contains the prompts you paste one at a time. Nothing else is required.

---

# PART 1: THE PRODUCT

## 1.1 What it is

Asymmetric multiplayer browser game. One host screen (television, laptop or projector) plus three to eight player phones. No installation, no accounts, no sign in, no data stored. A session runs three rounds and finishes on a shareable card that lists everything the household learned.

The game teaches technique recognition, never verdicts. It does not tell anyone which outlet to trust or which claim is politically correct. It trains structural signals: whether a claim is attributed, whether language is doing persuasive work that facts are not, whether an image carries the markers of synthesis.

## 1.2 Session flow

Landing screen offers three doors: host a game, join a game, or play on one screen only.

A host game runs: lobby, round one, round two, round three, scoreboard, recap card, then either play again or end. Each round has a question phase and a reveal phase. The host screen is the authority and drives every transition.

Target session length is twelve minutes. Nothing in the design may require a facilitator, a tutorial, or an explanation from the person who set it up.

## 1.3 Round one: Odd Source Out

The host screen shows one news event, then four cards labelled A, B, C and D in blue, coral, lime and yellow. Each card carries a headline and a source name reporting the same event four different ways:

- a cautious academic write up, hedged and dry
- an all capitals unattributed blog post that runs on emotion
- a neutral report attributed to a named outlet with a date
- a plausible satirical piece that is quietly absurd

The question is which source is least credible for verifying this event. Players see four large coloured buttons on their phone with no headline text, so the room has to read the shared screen together. Ten second timer.

On reveal the correct card gains a gold outline and scales up, the other three fade back, and an explanation banner slides up naming exactly why. Confetti fires only if at least one player was right.

Teaches: evaluating sources and the institutions behind them, and reading attribution, authorship and dating as credibility signals.

## 1.4 Round two: Spin Doctor

The host screen shows one real style headline broken into visible phrases. The same phrases appear on each phone as tappable chips. Players flag up to three phrases they believe are manipulative and lock in within fifteen seconds.

On reveal, correctly flagged phrases highlight in coral with a technique label underneath: loaded language, missing attribution, cherry picked statistic, missing context, false balance. Wrongly flagged phrases get a small ink cross. Over-flagging loses points, which teaches that scepticism is not the same as cynicism.

This is the round that transfers. It is the only one where the player has to name what is happening rather than pick a winner.

Teaches: critical analysis of how a message is constructed.

## 1.5 Round three: Real or Rendered

Five short items appear one at a time for five seconds each. Two giant buttons on every phone read REAL and RENDERED. Some items are authentic, some are AI generated.

Reveal is instant and one line, naming the specific tell: hands, garbled text inside the image, over-smooth skin, repeating background detail, prose that is fluent but contains no verifiable specifics. Then it advances automatically. A small flame appears beside a player's name on the host screen after three correct in a row, as flavour only with no score effect.

Teaches: recognising synthetic media and applying scepticism to images, not only to text.

## 1.6 Scoring

| Round | Scoring |
|---|---|
| Odd Source Out | 100 base, plus a speed bonus tapering linearly from 50 at zero seconds to zero at ten seconds |
| Spin Doctor | 25 per correctly flagged phrase, minus 10 per wrongly flagged phrase, floor at zero |
| Real or Rendered | 40 per correct call, no speed bonus |

At the end each player receives one playful title computed from their actual answers, never hardcoded:

| Title | Condition |
|---|---|
| The Skeptical Fox | Highest Spin Doctor accuracy |
| The Speedy Cheetah | Fastest average answer time |
| The Careful Panda | Slowest average answer time while still mostly correct |
| The Steady Turtle | Most consistent score across rounds |
| The Fact Lion | Overall winner |

The Careful Panda exists on purpose. The slowest, most deliberate player in the room, often the oldest, must leave feeling rewarded rather than embarrassed.

## 1.7 The recap card

After the scoreboard the game renders a shareable image listing every manipulation technique the household actually encountered, with its plain language explanation, assembled only from the content that was genuinely played. Downloadable as a PNG.

No new text is ever generated for this card. It reuses the stored technique and explanation strings only. This is the artefact that outlives the evening and it is the strongest evidence that the game taught something.

## 1.8 One screen mode

A complete session playable on the shared screen alone, with the room answering out loud and one person tapping. No phones, no room code, no network connection required at all.

This is not a lesser fallback. It is the mode a teacher with one projector and no student devices will use, and it must be built first because it forces every round interface to exist before any networking does.

## 1.9 Rules the build must respect

- Three to eight players. Two breaks the social dynamic the format depends on.
- Player names pass an English profanity blocklist before joining, structured so a locale can extend it.
- A phone that drops connection can rejoin and resume without the host restarting anything.
- Wrong answers get a soft sound and an explanation, never a buzzer. A grandparent who answers wrongly in front of grandchildren must stay in the game.
- Fabricated example headlines are marked as fabricated in the content and carry a visible stamp on the reveal screen and the recap card. A game about misinformation must not produce screenshots that circulate as real headlines.
- No personal data is collected and nothing is retained after the room closes.

---

# PART 2: HOW IT IS BUILT

## 2.1 Stack

React with Vite and Tailwind, built as a static site and deployed to Vercel. Multiplayer uses Supabase Realtime broadcast channels as a message relay only. Content ships inside the bundle as static files.

There is no backend server, no database, no table, no schema, no authentication and no persistent storage of any kind. This is deliberate. It removes every component that could fail during a live demonstration, it makes the privacy claim structural rather than a promise, and it means the marginal cost of a session is zero.

## 2.2 State model

The host browser holds the authoritative game state in memory and broadcasts a full state snapshot to every connected phone on each change. Phones are rendering surfaces: they display the last snapshot they received and send back single intents. A phone never reads game content directly and never receives an answer key before the reveal.

The room code is the channel name. When the host closes the tab, the room ceases to exist.

Trade-off to state plainly: with no server validation, a technically sophisticated player could tamper with their own client. For a family party game that is acceptable, in the same way a board game does not prevent cheating. Do not build anti-cheat.

## 2.3 Messages

Six message types, and no others:

| Message | Direction | Carries |
|---|---|---|
| probe | new host to the channel | Nothing. Checks whether this room code is already in use. |
| occupied | existing host to the channel | Nothing. Reply to a probe. |
| hello | player to host | Player id, chosen name, chosen avatar |
| state | host to everyone | The full snapshot below |
| answer | player to host | Player id, the round it answers, and the intent |
| react | player to everyone | Player id and one of four emoji |

The state snapshot carries: current phase, current round identifier, the timestamp the timer ends at, the host's own current time at the moment of sending, the player list with scores, the public part of the current question, and the reveal block when a reveal phase is active.

## 2.4 Timing without a server

Every snapshot includes the host's clock reading at send time. Each phone computes its offset from that and renders the remaining time against the host's clock rather than its own. Timers must never be a plain local countdown, because two screens drifting apart is the most visible possible bug and it will happen on camera.

Answer speed for the score bonus is measured by the host, from when it broadcast the question to when the answer arrived. Never trust a timestamp sent by a phone.

## 2.5 Room codes and reconnection

Four letters, excluding I, L, O and the digit zero to avoid misreading across a room. Before claiming a code the host probes the channel and regenerates if an existing host replies.

Each phone stores its own player id locally. If it receives no snapshot for a few seconds it re-sends hello, and the host replies with a fresh snapshot. That single mechanism covers a phone that locked, a browser that was backgrounded, and a WiFi drop, without any reconnection logic in the database sense.

## 2.6 Content model

Content lives in one file per language inside the source tree. English first. Any further language is the same file translated, which means adding a language is an editing task and not a software project. Nothing is fetched at runtime.

Each round type stores a set of items. Every item carries an identifier, a difficulty tag, the material the round needs, the correct answer, the technique name, a plain language explanation shown at the reveal, and a flag marking whether the example was fabricated by the team for teaching purposes.

Authoring rules for whoever writes the content:
- examples must be decodable by a reviewer in any country, so avoid anything needing local knowledge
- fabricated outlets get obviously fictional names
- explanations are one or two sentences, written to be read aloud in a living room
- no real named individual is accused of anything

## 2.7 Screens to build

Host side: landing, lobby, round one, round two, round three, scoreboard, recap card, plus a small control bar with pause, skip round and end early that only ever appears on the host screen.

Player side: join, waiting, answer surfaces for each of the three rounds, and a per round result view.

Shared: one screen mode, which runs the entire game locally with the round interfaces reused.

---

# PART 3: DESIGN SYSTEM

Follow this exactly. The intent is a warm carnival game show, not a dashboard and not a generic educational app.

## 3.1 Colour

Cream `#FFF8ED` backgrounds, never pure white and never a dark gradient. Coral `#FF5A5F`, sunshine yellow `#FFC53D`, ocean blue `#2E86AB`, lime `#8BC34A`, and ink `#1A1A1A` for every outline and all body text.

No indigo to purple gradient anywhere in this project. It is the single most recognisable generated-interface signature and it undercuts an otherwise strong pitch.

## 3.2 Type

Display face Fredoka or Baloo 2 from Google Fonts, chunky and rounded, used for headings, room codes, answers and scores. Body face Space Grotesk or Work Sans. Do not use Inter or Poppins as the whole system.

## 3.3 Shape and depth

Thick three pixel ink outlines on every card and button. Hard offset shadows, flat, four to six pixels, no blur ever. Cards canted one to three degrees off grid here and there rather than a perfectly aligned lattice. Subtle dot grid or paper texture on host backgrounds rather than a flat fill or floating blurred shapes.

Buttons compress on press: the element translates into its shadow and the shadow disappears, so a tap feels physical.

## 3.4 Motion

Snappy spring transitions, 150 to 250 milliseconds. Confetti only at reveal moments, never ambient. Screen to screen transitions use a quick horizontal wipe like a curtain pull, not a fade.

Banned because they read as templated: staggered fade-up-on-scroll lists, glassmorphism, blurred drop shadows, skeleton shimmer loaders, and default browser spinners.

## 3.5 Sound

Warm acoustic tones, marimba and wood block in character, never synthetic notification beeps.

| Moment | Sound |
|---|---|
| Answer locked | Soft click |
| Final three seconds of a countdown only | Gentle tick |
| Correct | Short bright ascending chime |
| Incorrect | Soft low thud, never a buzzer |
| Reveal | Drumroll |
| Scoreboard | Short fanfare |
| Room created, player joined | Friendly single blip |

Mute toggle on both the host and player screens, remembered for the session.

## 3.6 Screen states

Onboarding: the join screen opens with a small illustrated carnival tent flap above the form, so the first thing anyone sees sets a tone rather than looking like a sign up page.

Loading: a bouncing avatar or a spinning ticket. Never a spinner, never a shimmer placeholder.

Empty: the lobby with no players yet shows the room code very large with a friendly line underneath, not a blank list.

Error: room not found, room full, connection lost. Each is a full screen card with a relevant icon, one sentence, and exactly one action button. Never a browser alert.

## 3.7 Responsive

Host screen is designed for a 1920 by 1080 television or projector seen from across a room: minimum 48 pixel body text, 96 pixels and up for headlines and answers, generous spacing.

Player screen is mobile first, single column, minimum 64 pixel tap targets, safe area padding for notched phones.

---

# PART 4: BUILD PROMPTS

Paste these into your coding agent one at a time, in order, from the repository root with this file present. They work in Claude Code, Codex, Cursor or any agent that can read the working directory and write files.

Do not run two prompts at once. Finish and test each before moving on.

### Prompt 0: foundation

```
Read PASS-IT-ON.md in this directory in full before writing anything.

Scaffold a Vite + React + Tailwind project in this directory. Add the dependencies you will
need across the whole build: the Supabase JS client, a QR code component, a confetti library,
a DOM to image exporter, and an audio library. Choose current stable versions yourself.

Build the design system described in Part 3 as real, reusable code:
- a single module exporting the palette, the two font families, and the shadow and border tokens
- both fonts loaded from Google Fonts
- Tailwind theme extended so the palette and fonts are available as utility classes
- a Card primitive: cream or white fill, thick ink border, hard offset shadow with zero blur,
  and an optional tilt prop
- a BigButton primitive: chunky, ink bordered, offset shadow that compresses into the element
  on press, display font, minimum 64 pixel touch height, colour variants for the four round colours
- a LoadingState primitive: a bouncing avatar or spinning ticket, never a spinner or shimmer
- an ErrorState primitive: full screen card, icon, one sentence, one action button
- a CountdownBar primitive that accepts an end timestamp and a clock offset rather than a
  duration, and drains smoothly against that

Set up routing with four routes: a landing screen, a host route, a player route, and a one
screen route. The landing screen shows a small illustrated carnival tent flap SVG above three
BigButtons: host a game, join a game, play on one screen.

Create the content file for English described in Part 2.6, with three placeholder items per
round type so the app runs before real content is written. Design the field names yourself and
document the shape in a short comment at the top of the file.

Hard constraints for this entire project, which apply to every prompt after this one:
no gradient backgrounds, no purple or indigo or violet, no glassmorphism, no blurred shadows,
no skeleton shimmer, no default spinners, no browser alert(), no database, no SQL, no Supabase
tables, no authentication.

Confirm these constraints back to me and list the files you created before I continue.
```

### Prompt 1: the whole game, on one screen

```
Build one screen mode: a complete playable session on a single device with no network at all.
This is route /solo. It must work with WiFi disabled.

Implement the game state machine as a pure reducer in its own module, with no network calls
inside it, so it can later be driven by either local input or incoming messages. Phases are
lobby, then a question and a reveal phase for each of the three rounds, then scoreboard.

Build all three rounds exactly as specified in Part 1 of PASS-IT-ON.md, sections 1.3, 1.4
and 1.5, reading items from the English content file:

Round one, Odd Source Out: event title, four coloured cards with headline and source name in a
two by two grid, ten second countdown, reveal with gold outline on the correct card, the others
faded, an explanation banner sliding up, confetti when someone was right.

Round two, Spin Doctor: one headline broken into tappable phrase chips, up to three selections,
fifteen second countdown, reveal that labels correctly flagged phrases with their technique and
marks wrong flags.

Round three, Real or Rendered: five items at five seconds each, two giant buttons, instant one
line reveal naming the tell, automatic advance.

Implement scoring exactly per Part 1.6, and the title system computed from the recorded answers
rather than hardcoded.

Build the scoreboard and the recap card per Part 1.7. The recap card lists every technique
encountered this session using only stored technique and explanation strings, and exports as a
PNG. Items flagged as fabricated show a visible stamp both on their reveal and on the card.

Apply the design system throughout. Every countdown must use the CountdownBar primitive.

When done, tell me how to run it and what to click to see all three rounds.
```

### Prompt 2: multiplayer transport

```
Add the realtime layer described in Part 2 of PASS-IT-ON.md. No database, no tables, broadcast
channels only.

Create one module that owns all networking and exposes a small interface to the rest of the app:
one function to create and host a room, one to join a room as a player, each returning a way to
send messages, subscribe to messages, and leave. Nothing outside this module may touch the
Supabase client.

Implement exactly the six message types in the table in Part 2.3 and no others. Implement the
clock synchronisation described in Part 2.4: every state snapshot carries the host's own clock
reading, each phone derives an offset, and all countdowns render against the host's clock. Do
not use a local countdown anywhere.

Implement the room code rules and the reconnection behaviour in Part 2.5, including the probe
before claiming a code, and the phone re-announcing itself if it receives no snapshot for a few
seconds.

Read the Supabase URL and anon key from environment variables. Explain in your reply exactly
what I need to put in .env.local and what I must not commit.

Do not touch any game logic in this prompt. The reducer from Prompt 1 stays untouched. Write a
tiny throwaway test page that lets me open two browser windows and confirm messages flow both
ways, then tell me how to run it.
```

### Prompt 3: lobby, join, and round one live

```
Build the lobby and join flow, then wire round one to real phones.

Host lobby: generate a room code following the rules, probe before claiming it, show the code in
very large display type, show a QR code encoding a join URL with the code already filled in, and
show a live list of joined players with their avatars. Start button disabled below three players
and above eight. The empty state shows the giant code with a friendly line beneath it, per Part
3.6.

Player join: opens with the same carnival tent flap illustration as the landing screen, then a
name field, a code field that auto uppercases and is prefilled from the URL when arriving by QR,
and an avatar picker of four animals. Run the name through an English profanity blocklist,
structured so another language can be added later, and show a friendly inline error if it fails.
On submit, join the channel and announce. If no snapshot arrives within a few seconds, show the
room not found error state. Store the player id locally so a refresh does not lose the seat.

Then drive round one over the network. The host runs the same reducer from Prompt 1 and
broadcasts a snapshot on every change. Phones render only from the last snapshot they received.
The player answer screen shows four large coloured buttons with no headline text; the headline
stays on the host screen so the room reads it together. Tapping locks the answer, plays the click
sound, and shows a check. After the reveal each phone shows whether it was right plus the
explanation.

Critical: a phone must never receive the correct answer before the reveal phase. Send only the
public part of the question in the snapshot.

Tell me how to test this with a laptop and a real phone.
```

### Prompt 4: rounds two and three live, scoreboard, recap

```
Wire the remaining rounds and the end of the session over the network, reusing the interfaces
already built in Prompt 1 rather than writing new ones.

Round two on the phone: the headline phrases as tappable chips, up to three selections, tapped
chips fill coral, submit by button or automatically at three selections.

Round three on the phone: two giant buttons reading REAL and RENDERED filling the screen.

Host scoreboard: a podium for the top three, confetti, the full list below, and one computed
title per player. Then the recap card, generated as in Prompt 1 but from the answers of everyone
in the room, exportable as a PNG.

Add the host control bar described in Part 2.7, visible only on host screens: pause freezes the
current timer and shows all phones a paused overlay, skip round jumps to that round's reveal with
no answers counted, end early jumps straight to the scoreboard with current scores.

Add play again: reset to the lobby with scores cleared and every player still connected, so
nobody has to rejoin or rescan.

Handle a player leaving mid game gracefully: their card greys out, the round does not stall
waiting for them, and scoring ignores them.
```

### Prompt 5: sound, polish, and the state audit

```
Implement the full sound table in Part 3.5 with a mute toggle on both host and player screens,
remembered for the session. Sound must never block or delay a phase transition.

Audit every screen in the project against Part 3 and fix anything that does not match:
- every loading state uses the LoadingState primitive, no spinners, no shimmer
- every error path uses the ErrorState primitive with one clear action, no browser alerts
- room not found, room full, and connection lost all have real designed screens
- no gradients, no purple, no blurred shadows, no glassmorphism anywhere
- host text is legible from across a room at the minimum sizes in Part 3.7
- player tap targets are at least 64 pixels and respect notch safe areas

Then test the whole thing yourself for these specific failures and fix what you find:
- the countdown finishing at different moments on two screens
- a phone that locks and wakes mid round losing its seat
- a player joining while a round is already running
- the final round ending with nobody having answered
- text overflowing a card at the longest content in the content file

Report what you found and what you changed.
```

### Prompt 6: only if there is time left

```
Add a second language: duplicate the English content file, translate it, and add a language
toggle in the host lobby that selects which file the session reads from. No other change should
be needed, and if it is, tell me because that means the content is not properly separated.

Add the reaction layer: during reveal phases only, four emoji buttons appear on each phone. A tap
broadcasts an ephemeral message that is never stored, rate limited to one per player every two
seconds, and the host screen floats a small emoji bubble upward for about two seconds.

Add a read aloud toggle on the host screen using the browser speech synthesis API, which reads
the current headline, claim or explanation aloud.
```

---

# PART 5: TESTING AND DEPLOYMENT

## 5.1 Checkpoints

Stop and verify at each of these. Do not carry a broken checkpoint forward.

**After Prompt 0.** The landing screen renders on a cream background with chunky outlined buttons and the correct fonts. Nothing else needs to work.

**After Prompt 1.** A complete game plays end to end on one machine with WiFi turned off, all three rounds, scoreboard, and a recap card PNG that downloads. This alone is a demonstrable product.

**After Prompt 2.** Two browser windows exchange messages both ways.

**After Prompt 3.** A laptop hosts and a real phone joins and plays round one. Put the phone on mobile data rather than the same WiFi, because same network testing hides real problems. Watch both countdowns finish at the same instant.

**After Prompt 4.** Full session, three to five devices, through to the recap card, then play again without anyone rejoining.

**After Prompt 5.** Deliberately break things: turn off the phone's data mid round, lock the screen, join late, refresh the host.

## 5.2 Deployment

1. Create a Supabase project and copy the project URL and the anon public key. Create no tables. Leave realtime authorization off so public channels work with the anon key.
2. Put both values in a local environment file, and add the same two variables to the Vercel project for all environments.
3. Push to GitHub, import into Vercel, deploy. It is a static build, so there is nothing else to configure.
4. Test the production URL with one device on WiFi and one on mobile data.

Never put the service role key in this project. Only the anon key, which is designed to be public.

## 5.3 If time runs short

Cut in this order: Prompt 6 entirely, then round three, then the multiplayer path.

One screen mode plus two rounds plus the recap card is a complete, honest, demonstrable product. A finished small thing beats an unfinished large one, and it is the only version you can film with confidence.
