# Political/Economical RPG

A text-based political and economical role-playing game built in C++.

## Features

- Choose from four different starting political positions:
  - Small opposition party
  - Big opposition party  
  - Small coalition party
  - Big coalition party

## Building and Running

### Prerequisites
- C++ compiler with C++17 support (GCC, Clang, or MSVC)
- CMake 3.10 or higher

### Build Instructions

1. Create a build directory:
```bash
mkdir build
cd build
```

2. Generate build files:
```bash
cmake ..
```

3. Build the project:
```bash
cmake --build .
```

4. Run the game:
```bash
./bin/PoliticalRPG
```

On Windows:
```cmd
bin\PoliticalRPG.exe
```

### Alternative: Direct Compilation

If you don't want to use CMake, you can compile directly:

```bash
g++ -std=c++17 -o PoliticalRPG main.cpp
./PoliticalRPG
```

## Game Description

This is a text-based RPG where you take on the role of a political party leader. Your starting choice affects your resources, influence, and available strategies. The game is designed to simulate political and economic decision-making in a democratic system.

## Known Issues

- Starting as a coalition or opposition party doesn't actually affect gameplay mechanics yet. The choice is recorded but doesn't change game behavior.

## Future Development

The current version provides the basic framework and starting menu. Future versions will include:
- Economic policy decisions
- Political negotiations
- Public opinion management
- Election campaigns
- Coalition building mechanics
