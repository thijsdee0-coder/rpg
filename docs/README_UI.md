# Political RPG - Web UI Version

Een moderne web interface voor de Political RPG game.

## 🎮 Game Features

### Party Setup
- **4 Startopties**: Small/Big Opposition Party of Small/Big Coalition Party
- **Ideologie Selectie**: Kies tussen Conservative/Progressive (sociaal) en Left/Right (economisch)
- **Party Naming**: Geef je partij een unieke naam
- **Realistische Percentage Generatie**: Gebaseerd op normale distributie

### Political System
- **Dynamische Coalitie Vorming**: AI vormt realistische coalities gebaseerd op ideologische overeenkomsten
- **Political Compass**: Visuele weergave van alle partijen op een 21x21 grid
- **Coalitie Veiligheid Analyse**: Berekent stabiliteit gebaseerd op ideologische verschillen

### Budget Management
- **Interactieve Budget Allocatie**: Pas uitgaven aan per onderwerp (±5%)
- **Ideologie-specifieke Regels**: 
  - Links: Deficit spending toegestaan
  - Rechts: Gebalanceerd budget vereist
- **10 Budget Onderwerpen**: Healthcare, Education, Defense, Infrastructure, etc.

### Game Progression
- **Dag Systeem**: Vordert door dagen met verschillende events
- **Automatische Budget Allocatie**: Voor oppositie partijen
- **Coalitie Veiligheid Rapport**: Na budget meetings

## 🚀 Hoe te Spelen

1. **Start het spel** door op "Start New Game" te klikken
2. **Kies je startpositie** (Small/Big Opposition/Coalition Party)
3. **Selecteer je ideologie** (Social + Economic)
4. **Geef je partij een naam**
5. **Verken de interface**:
   - Bekijk Government Overview voor alle partijen
   - Bekijk Political Compass voor visuele weergave
   - Advance Day om verder te gaan
6. **Budget Meeting** (Dag 2):
   - Als coalition party: Stel budget handmatig in
   - Als opposition party: Automatische allocatie
7. **Coalitie Veiligheid** wordt getoond na budget allocatie

## 🎨 UI Features

### Modern Design
- **Gradient Backgrounds**: Mooie kleurverlopen
- **Glassmorphism**: Transparante elementen met blur effecten
- **Smooth Animations**: Hover effecten en transitions
- **Responsive Design**: Werkt op desktop, tablet en mobiel

### Interactive Elements
- **Hover Effects**: Cards liften en krijgen schaduwen
- **Button Animations**: Buttons bewegen bij hover
- **Loading States**: Shimmer effecten tijdens loading
- **Visual Feedback**: Borders veranderen bij selectie

### Data Visualization
- **Political Compass**: ASCII-art style grid met partij posities
- **Spectrum Bars**: Visuele weergave van ideologie posities
- **Progress Indicators**: Budget percentages en coalitie controle
- **Color Coding**: Groen voor coalition, rood voor opposition

## 🛠️ Technische Details

### Frontend Stack
- **HTML5**: Semantische markup
- **CSS3**: Modern styling met flexbox/grid
- **Vanilla JavaScript**: Geen frameworks, pure JS
- **Font Awesome**: Icons
- **Google Fonts**: Inter font family

### Game Logic
- **Object-Oriented**: Class-based JavaScript
- **State Management**: Centrale game state
- **Event Handling**: DOM event listeners
- **Data Structures**: Arrays en objects voor game data

### Responsive Breakpoints
- **Desktop**: > 768px (full layout)
- **Tablet**: 768px (adjusted grid)
- **Mobile**: < 480px (single column)

## 📁 Bestandsstructuur

```
rpg/
├── index.html          # Hoofd HTML bestand
├── styles.css          # Alle CSS styling
├── script.js           # Game logic en interactie
├── main.cpp            # Originele C++ code (behouden)
└── README_UI.md        # Deze documentatie
```

## 🎯 Verbeteringen t.o.v. Console Versie

1. **Visuele Interface**: Geen console commands meer
2. **Real-time Updates**: Directe feedback bij acties
3. **Better UX**: Intuïtieve buttons en forms
4. **Visual Data**: Political compass en spectrum bars
5. **Responsive**: Werkt op alle apparaten
6. **Modern Design**: Professionele uitstraling

## 🔧 Browser Compatibiliteit

- **Chrome**: 90+ ✅
- **Firefox**: 88+ ✅
- **Safari**: 14+ ✅
- **Edge**: 90+ ✅

## 🚀 Quick Start

1. Open `index.html` in je browser
2. Klik "Start New Game"
3. Volg de setup wizard
4. Geniet van het spel!

---

**Originele C++ code behouden** voor referentie en verdere ontwikkeling.
