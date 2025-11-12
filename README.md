# Political/Economical RPG

A text-based political and economical role-playing game built in C++ with a web-based UI alternative.

## Project Structure

```
rpg/
├── src/                    # C++ source code
│   └── main.cpp           # Main game logic and PoliticalRPG class implementation
├── CMakeLists.txt         # CMake build configuration
├── web/                    # Web-based UI files
│   ├── index.html         # Main HTML interface for web version
│   ├── script.js          # JavaScript game logic for web version
│   └── styles.css         # CSS styling for web interface
├── docs/                   # Documentation
│   ├── README.md          # Main game documentation and build instructions
│   ├── README_UI.md       # Web UI documentation and features
│   └── EVENT_SYSTEM_DEMO.md # Event system architecture documentation
├── tests/                  # Test files and examples
│   ├── test_*.txt         # Text-based test scenarios for various game features
│   └── test_*.html        # HTML test pages for web UI components
├── build/                  # Build output directory (generated, not in git)
├── .gitignore             # Git ignore rules for build artifacts
└── rpg.code-workspace     # VS Code workspace configuration
```

## File Descriptions

### Source Code (`src/`)

- **`main.cpp`**: Main C++ implementation containing the `PoliticalRPG` class with all game logic including:
  - Party management and coalition formation
  - Budget allocation system
  - Political compass visualization
  - Tax rate calculations
  - Day progression system
  - Government overview displays

- **`CMakeLists.txt`**: CMake build configuration file that:
  - Sets C++17 standard
  - Configures executable output
  - Handles Windows-specific settings

### Web Interface (`web/`)

- **`index.html`**: Main HTML file for the web-based version of the game with:
  - Party setup interface
  - Game state management UI
  - Event system interface
  - Voting and decision-making screens

- **`script.js`**: JavaScript implementation of the game logic including:
  - PoliticalRPG class for web version
  - Coalition formation algorithms
  - Event system handling
  - UI state management

- **`styles.css`**: CSS styling for the web interface with:
  - Responsive design
  - Political theme colors
  - Component styling

### Documentation (`docs/`)

- **`README.md`**: Main game documentation covering:
  - Features overview
  - Build and installation instructions
  - Game description
  - Known issues
  - Future development plans

- **`README_UI.md`**: Web UI documentation explaining:
  - UI features and components
  - How to use the web interface
  - Differences from C++ version

- **`EVENT_SYSTEM_DEMO.md`**: Technical documentation for the event system:
  - Event definitions structure
  - Dynamic option generation
  - Event effects and mechanics

### Test Files (`tests/`)

- **`test_*.txt`**: Text-based test scenarios for:
  - Budget allocation (`test_budget.txt`, `test_budget_once.txt`, `test_left_budget.txt`)
  - Coalition formation (`test_coalition_*.txt`, `test_improved_coalition.txt`)
  - Political compass (`test_compass.txt`, `test_big_compass.txt`, `test_spectrum.txt`)
  - Day system (`test_day_*.txt`)
  - Tax calculations (`test_tax_rate.txt`)
  - Government overview (`test_government.txt`)
  - Input handling (`test_input.txt`)
  - Logic testing (`test_new_logic.txt`)

- **`test_*.html`**: HTML test pages for:
  - Event system (`test_events.html`)
  - Voting mechanics (`test_voting.html`, `test_user_voting.html`)

### Configuration Files

- **`.gitignore`**: Excludes build artifacts, IDE files, and OS-specific files from version control

- **`rpg.code-workspace`**: VS Code workspace settings for the project

## Quick Start

### C++ Version

See [docs/README.md](docs/README.md) for detailed build instructions.

### Web Version

Simply open `web/index.html` in a web browser.

## Features

- Choose from four different starting political positions
- Budget allocation system with coalition-based constraints
- Political compass visualization
- Coalition security analysis
- Day-based progression system
- Event system with dynamic political decisions

## Known Issues

- Starting as a coalition or opposition party doesn't actually affect gameplay mechanics yet. The choice is recorded but doesn't change game behavior.

## License

[Add your license here]

