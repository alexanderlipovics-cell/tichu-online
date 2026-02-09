# 🃏 Tichu Online – Projekt Plan

## Vision
**Besser als BoardGameArena.** Schneller, schöner, mobil-first, mit Voice Chat und smarter UX.

### BGA Schwächen die wir fixen:
- ❌ Karten unten, Aktionen oben → nerviges hin-und-her scrollen
- ❌ Tichu-Call Anzeige verwirrend (grünes T in der Mitte)
- ❌ Gegenuhrzeigersinn als Default (falsch!)
- ❌ Auto-Pass wenn wenig Karten = nervig
- ❌ Bomb-Timing unklar
- ❌ Layout nicht responsive, kein Mobile-Support
- ❌ Keine Freundesliste / kein Voice Chat
- ❌ Hässliches generisches Board-Game UI

### Unsere Vorteile:
- ✅ Alles in einer Zone – Karten + Aktionen zusammen
- ✅ Mobile-first mit Touch/Swipe-Gesten
- ✅ Echtzeit Voice Chat (optional)
- ✅ Bomb-Button immer sichtbar mit Timer-Fenster (3 Sek nach Trick-Ende)
- ✅ Smooth Animationen (Karten fliegen, Tricks sammeln)
- ✅ Private Räume für Freunde + Public Matchmaking
- ✅ ELO-Rating System
- ✅ Modernes, geiles Design

---

## Tech Stack

```
Frontend:     React + Vite + TailwindCSS
Echtzeit:     Socket.IO (WebSockets)
Backend:      Node.js + Express + Socket.IO Server
Datenbank:    Supabase (Auth + Postgres)
Hosting:      Vercel (Frontend) + Render (Backend)
Voice Chat:   WebRTC (peer-to-peer)
```

---

## Ordnerstruktur

```
tichu-online/
├── client/                          # React Frontend
│   ├── public/
│   │   ├── cards/                   # Kartenbilder (SVG)
│   │   │   ├── jade-2.svg ... jade-A.svg
│   │   │   ├── sword-2.svg ... sword-A.svg
│   │   │   ├── pagoda-2.svg ... pagoda-A.svg
│   │   │   ├── star-2.svg ... star-A.svg
│   │   │   ├── dragon.svg
│   │   │   ├── phoenix.svg
│   │   │   ├── dog.svg
│   │   │   ├── mahjong.svg
│   │   │   └── card-back.svg
│   │   ├── sounds/                  # Sound Effects
│   │   │   ├── card-play.mp3
│   │   │   ├── bomb.mp3
│   │   │   ├── tichu-call.mp3
│   │   │   ├── trick-win.mp3
│   │   │   └── round-end.mp3
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── game/
│   │   │   │   ├── GameBoard.jsx        # Hauptspielfeld
│   │   │   │   ├── PlayerHand.jsx       # Eigene Karten (unten)
│   │   │   │   ├── CardComponent.jsx    # Einzelne Karte
│   │   │   │   ├── PlayArea.jsx         # Mitte – gespielte Karten
│   │   │   │   ├── OpponentHand.jsx     # Gegner-Karten (verdeckt)
│   │   │   │   ├── PartnerHand.jsx      # Partner-Karten (verdeckt, oben)
│   │   │   │   ├── TrickPile.jsx        # Gewonnene Stiche
│   │   │   │   ├── ScoreBoard.jsx       # Punktestand
│   │   │   │   ├── ActionBar.jsx        # Play/Pass/Bomb Buttons
│   │   │   │   ├── TichuCallButton.jsx  # Tichu/Grand Tichu Button
│   │   │   │   ├── CardExchange.jsx     # Kartentausch-Phase
│   │   │   │   ├── WishSelector.jsx     # Mah Jong Wunsch
│   │   │   │   ├── DragonGiveaway.jsx   # Drache verschenken
│   │   │   │   ├── BombOverlay.jsx      # Bomb-Intervention (3 Sek Timer)
│   │   │   │   ├── GameLog.jsx          # Spielverlauf-Log
│   │   │   │   └── RoundSummary.jsx     # Rundenende-Übersicht
│   │   │   ├── lobby/
│   │   │   │   ├── LobbyPage.jsx        # Hauptlobby
│   │   │   │   ├── RoomList.jsx         # Verfügbare Räume
│   │   │   │   ├── CreateRoom.jsx       # Raum erstellen
│   │   │   │   ├── RoomWaiting.jsx      # Warteraum (4 Spieler)
│   │   │   │   └── QuickMatch.jsx       # Schnelles Matchmaking
│   │   │   ├── social/
│   │   │   │   ├── FriendsList.jsx      # Freundesliste
│   │   │   │   ├── PlayerProfile.jsx    # Profil + Stats
│   │   │   │   ├── Leaderboard.jsx      # ELO Rangliste
│   │   │   │   └── ChatPanel.jsx        # Text Chat im Spiel
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── RegisterPage.jsx
│   │   │   │   └── AuthGuard.jsx
│   │   │   └── ui/
│   │   │       ├── Header.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── Toast.jsx
│   │   │       ├── Loading.jsx
│   │   │       └── AnimatedCard.jsx
│   │   ├── hooks/
│   │   │   ├── useSocket.js             # Socket.IO Connection
│   │   │   ├── useGame.js               # Game State Management
│   │   │   ├── useCards.js              # Karten-Selektion & Sortierung
│   │   │   ├── useSound.js             # Sound Effects
│   │   │   └── useVoiceChat.js          # WebRTC Voice
│   │   ├── contexts/
│   │   │   ├── GameContext.jsx          # Spiel-State
│   │   │   ├── SocketContext.jsx        # Socket Connection
│   │   │   └── AuthContext.jsx          # User Auth
│   │   ├── utils/
│   │   │   ├── cardUtils.js             # Karten-Hilfsfunktionen
│   │   │   ├── combinationDetector.js   # Erkennt spielbare Kombis
│   │   │   └── soundManager.js
│   │   ├── styles/
│   │   │   ├── game.css                 # Spiel-spezifische Styles
│   │   │   ├── cards.css                # Karten-Animationen
│   │   │   └── lobby.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── router.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                          # Node.js Backend
│   ├── src/
│   │   ├── game/
│   │   │   ├── GameEngine.js            # ⭐ KERNSTÜCK – Spiellogik
│   │   │   ├── Deck.js                  # Kartendeck (56 Karten)
│   │   │   ├── Card.js                  # Karten-Klasse
│   │   │   ├── Player.js                # Spieler-Klasse
│   │   │   ├── Team.js                  # Team-Klasse
│   │   │   ├── Round.js                 # Runden-Logik
│   │   │   ├── Trick.js                 # Stich-Logik
│   │   │   ├── CombinationValidator.js  # ⭐ Kombinations-Validierung
│   │   │   ├── BombHandler.js           # Bomben-Logik (Timing!)
│   │   │   ├── SpecialCards.js          # Dragon/Phoenix/Dog/MahJong
│   │   │   ├── ScoreCalculator.js       # Punkte-Berechnung
│   │   │   └── WishSystem.js            # Mah Jong Wunsch-System
│   │   ├── socket/
│   │   │   ├── socketHandler.js         # Socket.IO Event Handler
│   │   │   ├── gameEvents.js            # Spiel-Events
│   │   │   ├── lobbyEvents.js           # Lobby-Events
│   │   │   └── chatEvents.js            # Chat-Events
│   │   ├── rooms/
│   │   │   ├── RoomManager.js           # Raum-Verwaltung
│   │   │   ├── MatchMaker.js            # Auto-Matchmaking
│   │   │   └── Room.js                  # Raum-Klasse
│   │   ├── db/
│   │   │   ├── supabase.js              # Supabase Client
│   │   │   ├── userQueries.js           # User DB Queries
│   │   │   └── statsQueries.js          # Statistik Queries
│   │   ├── middleware/
│   │   │   └── auth.js                  # JWT Auth Middleware
│   │   └── server.js                    # Express + Socket.IO Setup
│   ├── tests/
│   │   ├── gameEngine.test.js
│   │   ├── combinations.test.js
│   │   ├── scoring.test.js
│   │   ├── specialCards.test.js
│   │   └── bombTiming.test.js
│   ├── package.json
│   └── .env.example
│
├── shared/                          # Geteilte Typen/Konstanten
│   ├── constants.js                 # Karten-Werte, Farben, etc.
│   ├── gameStates.js                # State Machine States
│   └── events.js                    # Socket Event Names
│
├── database/
│   └── schema.sql                   # Supabase Schema
│
├── .gitignore
├── README.md
└── PROJECT_PLAN.md                  # Diese Datei
```

---

## Datenbank Schema (Supabase)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  elo_rating INTEGER DEFAULT 1000,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  tichu_calls_made INTEGER DEFAULT 0,
  tichu_calls_won INTEGER DEFAULT 0,
  grand_tichu_calls_made INTEGER DEFAULT 0,
  grand_tichu_calls_won INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Friends
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  friend_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending', -- pending, accepted
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game History
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team1_player1 UUID REFERENCES users(id),
  team1_player2 UUID REFERENCES users(id),
  team2_player1 UUID REFERENCES users(id),
  team2_player2 UUID REFERENCES users(id),
  team1_score INTEGER,
  team2_score INTEGER,
  rounds_played INTEGER,
  winner_team INTEGER, -- 1 or 2
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Round Details
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id),
  round_number INTEGER,
  team1_round_score INTEGER,
  team2_round_score INTEGER,
  tichu_caller UUID REFERENCES users(id),
  tichu_success BOOLEAN,
  grand_tichu_caller UUID REFERENCES users(id),
  grand_tichu_success BOOLEAN,
  first_out UUID REFERENCES users(id),
  double_win BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Game State Machine

```
WAITING_FOR_PLAYERS
    ↓ (4 Spieler da)
DEALING_FIRST_8
    ↓ (Grand Tichu Entscheidung)
DEALING_REMAINING_6
    ↓ (Tichu Call möglich)
CARD_EXCHANGE
    ↓ (alle 3 Karten getauscht)
PLAYING
    ├── PLAYER_TURN (Karten spielen oder passen)
    ├── BOMB_WINDOW (3 Sek nach Trick-Ende)
    ├── WISH_ACTIVE (Mah Jong Wunsch läuft)
    └── DRAGON_GIVE (Drache verschenken)
    ↓ (3 Spieler raus)
ROUND_END
    ↓ (Punkte < 1000)
DEALING_FIRST_8 (nächste Runde)
    ↓ (Punkte >= 1000)
GAME_OVER
```

---

## Gültige Kartenkombinationen

```
1. SINGLE         → Eine Karte (2-A, Phoenix, Dragon)
2. PAIR           → Zwei gleiche (z.B. 7♠ 7♦)
3. TRIPLE         → Drei gleiche
4. FULL_HOUSE     → Triple + Pair (z.B. QQQ-88)
5. STRAIGHT       → Min. 5 aufeinanderfolgend (z.B. 3-4-5-6-7)
6. PAIR_SEQUENCE  → Min. 2 aufeinanderfolgende Paare (z.B. 33-44-55)
7. BOMB_4         → Vier gleiche → schlägt ALLES außer höhere Bombe
8. BOMB_STRAIGHT  → Straight Flush (min 5) → schlägt 4er Bombe

Phoenix: Joker in Kombis, als Single = 0.5 über letzter Karte
Dragon: Höchste Single, nur durch Bombe schlagbar
Dog:    Gibt Lead an Partner, nur als Lead spielbar
MahJong: Wert 1, kann Wunsch aussprechen
```

---

## Socket Events

```javascript
// Client → Server
'join-room'          // Raum beitreten
'leave-room'         // Raum verlassen
'call-grand-tichu'   // Grand Tichu ansagen
'call-tichu'         // Tichu ansagen
'exchange-cards'     // 3 Karten tauschen
'play-cards'         // Karten ausspielen
'pass'               // Passen
'play-bomb'          // Bombe spielen (jederzeit!)
'make-wish'          // Mah Jong Wunsch
'give-dragon-trick'  // Drachen-Stich verschenken
'chat-message'       // Chat Nachricht

// Server → Client
'game-state'         // Kompletter Game State
'cards-dealt'        // Karten ausgeteilt
'player-played'      // Spieler hat gespielt
'player-passed'      // Spieler hat gepasst
'trick-won'          // Stich gewonnen
'bomb-played'        // Bombe gespielt!
'bomb-window-open'   // 3 Sek Bomb-Fenster
'tichu-called'       // Tichu angesagt
'round-end'          // Runde vorbei + Punkte
'game-over'          // Spiel vorbei
'wish-made'          // Wunsch ausgesprochen
'wish-fulfilled'     // Wunsch erfüllt
'error'              // Fehler
```

---

## Cursor Prompt Reihenfolge

### Phase 1: Fundament (Tag 1-2)
1. Projekt Setup (Vite + Express + Socket.IO)
2. Shared Constants & Types
3. Card & Deck Klassen
4. Supabase Schema + Auth

### Phase 2: Game Engine (Tag 3-5)
5. CombinationValidator (härtester Teil!)
6. GameEngine + Round + Trick
7. SpecialCards (Dragon, Phoenix, Dog, MahJong)
8. BombHandler mit Timer
9. ScoreCalculator
10. WishSystem

### Phase 3: Multiplayer (Tag 6-7)
11. Socket.IO Setup + Room Management
12. Game Events (play, pass, bomb)
13. Matchmaking

### Phase 4: Frontend (Tag 8-12)
14. GameBoard Layout
15. PlayerHand + Card Selection
16. PlayArea + Animationen
17. ActionBar + TichuCall
18. CardExchange Phase
19. BombOverlay
20. DragonGiveaway + WishSelector
21. ScoreBoard + RoundSummary

### Phase 5: Lobby & Social (Tag 13-14)
22. Lobby + Room List
23. Friends + Chat
24. Leaderboard + Stats

### Phase 6: Polish (Tag 15-17)
25. Sound Effects
26. Card Animations (smooth!)
27. Mobile Responsive
28. Voice Chat (WebRTC)

### Phase 7: Testing & Deploy (Tag 18-20)
29. Game Engine Tests
30. Integration Tests
31. Deploy Vercel + Render

---

## Besser als BGA – UX Details

### Karten-Selektion
- Tap/Click zum selektieren (Karte hebt sich)
- Auto-Detect welche Kombination ausgewählt ist
- Grayed-out Karten die nicht spielbar sind
- Drag zum Sortieren der Hand

### Bomb-System
- Bomb-Button IMMER sichtbar wenn Bombe auf Hand
- Nach Trick-Ende: 3 Sekunden "Bomb Window"
- Pulsierender roter Button + Countdown
- Sound Effect bei Bombe 💥

### Tichu Call
- Dezenter Button am Rand (nicht störend)
- Bei Call: Elegante Animation + Sound
- Anzeige WER gecalled hat = immer sichtbar neben Spielername

### Mobile UX
- Swipe up zum Karten spielen
- Long press für Kartendetails
- Landscape-optimiert für Spielfeld

---

**Geschätzte Gesamtzeilen: ~18.000-22.000**
**Geschätzte Bauzeit mit Cursor: 3-4 Wochen (Teilzeit nach AlSales Launch)**

