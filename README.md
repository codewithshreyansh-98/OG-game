# OGRun — The Great Indian Run 🇮🇳

An original, humorous, vibrant, and cinematic 3D endless runner game built with **Three.js**, **JavaScript (ES Modules)**, **HTML5**, and **Vite**.

Inspired by casual arcade endless runners like *Subway Surfers* and *Temple Run*, **OGRun** transports players into iconic Indian locations, rich cultural aesthetics, satirical humor, and high-energy gameplay.

---

## 🎮 Gameplay Features

- **Three Running Lanes**: Smooth lane changing with physical banking tilt and spring damping.
- **Dynamic Acrobatics**:
  - High Jump over hurdles, potholes, and scurrying obstacles.
  - Slide under festive hanging torans, decorative banners, and high obstacles.
- **Stylized 3D Caricature Player ("Namaste Runner")**:
  - Caricature character inspired by Narendra Modi, featuring groomed silver hair, white beard, signature round spectacles, and traditional Indian attire.
  - Articulated procedural rig with running, jumping, sliding, stumble/crash, and polite Namaste idle animations.
  - **4 Signature Outfits / Wardrobe**:
    1. *Vikas Saffron*: Vibrant saffron kurta with ceremonial ivory jacket.
    2. *Royal Diplomat*: Midnight navy Modi jacket paired with crisp white silk.
    3. *Tiranga Pride*: Khadi white kurta draped with a saffron and emerald green stole.
    4. *Varanasi Silk*: Golden ochre silk kurta adorned with a deep maroon brocade vest.

---

## 🏛️ Iconic Indian Environments

Players seamlessly journey through 4 Indian monuments and cities as their run distance progresses:

1. **Taj Mahal (Agra)**: Makrana white marble pathways, turquoise reflecting pools, Cypress trees, carved minarets, and warm golden sunrise lighting.
2. **Red Fort / Lal Qila (Delhi)**: Massive red sandstone ramparts, Mughal crenellations, octagonal Chhatris (domed pavilions), and warm torchlight.
3. **India Gate (Kartavya Path, New Delhi)**: Paved capital boulevard, heritage Delhi cast-iron streetlamps, sandstone bollards, lush lawns, and the monumental 42m stone arch silhouette.
4. **Varanasi Ghats (Ganga River)**: Ancient stone ghat staircases descending to the holy Ganga, floating flower diyas with flickering candles, terracotta temple Shikharas, and spiritual twilight glow.

---

## 🦹 Comedic Obstacles

- **Giant Cartoon Cockroach**: Huge comical beetle with wiggling antennae, bulging eyes, and 6 animated scurrying legs (jump over or dodge).
- **Cartoon Political Caricature ("Pappu Runner")**: Comical caricature in white kurta with rolled-up sleeves, humorous puzzled expression, waving a golden microphone (must change lane).
- **Delhi Police Road Barricade**: Iconic yellow and black striped roadblock with hazard markings and warning blinkers (jump over or dodge).
- **Auto-Rickshaw (Tuk-Tuk)**: Classic Indian green-and-yellow three-wheeler with roof rack and headlights (must change lane).
- **Hanging Marigold Toran / Banners**: Overhead garland ropes strung with marigolds and mango leaves (must slide under).

---

## ⚡ Collectibles & Power-Ups

- 🪙 **Gold Rupee Coins**: Shimmering 3D gold coins with embossed chakra symbols scattered in lanes, arcs, and guiding curves.
- ☕ **Kadak Chai Rush**: Indian cutting chai glass conferring temporary invincibility, supersonic speed rush, and 2x coin multiplier!
- 🧲 **Chumbak (Coin Magnet)**: Magnetic field that pulls all golden rupee coins from all 3 lanes directly to the player.
- 🛡️ **Surakshak Shield**: Sacred golden chakra energy sphere that absorbs 1 collision hit safely.
- 🚀 **Turbo Boost**: Sprint sneaker with saffron flame exhaust and double score acceleration.

---

## 🎵 Dynamic Audio Engine

Built using the **Web Audio API** with procedural sound synthesis (100% self-contained, zero external asset 404s or broken links):
- Authentic Indian festive rhythm with Dhol, Tabla, and melodic Raag Bhupali drone notes.
- Dynamic tempo that accelerates with player speed.
- Pentatonic coin collection chimes, airy jump whooshes, slide swooshes, impact crunches, and power-up fanfare.
- Persistent mute and volume controls stored in LocalStorage.

---

## 🕹️ Controls

### Desktop Keyboard
| Action | Key(s) |
|---|---|
| **Move Left** | `A` or `Left Arrow` |
| **Move Right** | `D` or `Right Arrow` |
| **Jump** | `W`, `Up Arrow`, or `Spacebar` |
| **Slide** | `S` or `Down Arrow` |
| **Pause / Resume** | `Escape` or `P` |

### Mobile Touch
- **Swipe Left / Right**: Switch lanes
- **Swipe Up**: Jump
- **Swipe Down**: Slide
- **On-Screen Touch Buttons**: Optional virtual D-pad and action buttons toggleable in Settings.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+) and npm installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Vite Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 📁 Project Architecture

```
OGRun/
  ├── index.html                 # Main HTML5 entry point & UI screens
  ├── package.json               # Dependencies (Three.js, Vite)
  ├── vite.config.js             # Dev server & build configuration
  ├── src/
  │   ├── main.js                # Application bootstrapper
  │   ├── game/
  │   │   ├── Game.js            # Three.js engine, camera, lighting, RAF loop
  │   │   ├── GameState.js       # Run metrics, state machine, LocalStorage
  │   │   ├── Player.js          # 3D procedural cartoon rig & animations
  │   │   ├── Controls.js        # Keyboard, swipe gestures & touch controls
  │   │   ├── ObstacleManager.js # Cockroaches, Caricatures, Barricades, Tuk-Tuks
  │   │   ├── CoinManager.js     # Rupee coins, magnet pull & sparkle FX
  │   │   ├── PowerUpManager.js  # Chai rush, Magnet, Shield, Turbo
  │   │   ├── CollisionSystem.js # 3D collision detection & clearance tests
  │   │   └── AudioManager.js    # Web Audio API procedural sound engine
  │   ├── environments/
  │   │   ├── EnvironmentManager.js # Segment recycling & zone progression
  │   │   ├── TajMahal.js        # Makrana marble & reflecting pools
  │   │   ├── RedFort.js         # Red sandstone & Mughal battlements
  │   │   ├── IndiaGate.js       # Rajpath boulevard & cast-iron streetlamps
  │   │   └── Varanasi.js        # Sacred stone ghats, temple spires & diyas
  │   ├── ui/
  │   │   ├── MainMenu.js        # Title screen, settings & modal controls
  │   │   ├── HUD.js             # Real-time score, coin counter & speedometer
  │   │   ├── PauseMenu.js       # Frosted glass pause dialog
  │   │   ├── GameOver.js        # End-of-run stats & high score badge
  │   │   └── CharacterSelection.js # Wardrobe outfit selector
  │   └── styles/
  │       └── main.css           # Modern arcade Indian theme styling
```

