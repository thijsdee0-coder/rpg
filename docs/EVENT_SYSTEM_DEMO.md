# Generic Event System Demo

## Overview
The event system has been refactored to be completely generic and scalable. Instead of hardcoded housing crisis events, the system now supports multiple events with dynamic content generation.

## Key Features

### 1. Event Definitions
Events are now defined in a structured format with:
- **ID**: Unique identifier for the event
- **Title**: Display name for the event
- **Description**: Detailed description of the situation
- **Options**: Four political options (conservative-right, conservative-left, progressive-right, progressive-left)

### 2. Dynamic Option Generation
Each option includes:
- **Title**: Name of the policy approach
- **Description**: Detailed explanation of the approach
- **Icon**: FontAwesome icon class
- **Effects**: Statistical impact ranges (min/max values)
- **Messages**: User-friendly effect descriptions

### 3. Available Events
The system currently includes 4 different events:

1. **Housing Crisis** - Address housing shortages and homelessness
2. **Economic Recession** - Stimulate economic recovery
3. **Climate Crisis** - Address environmental challenges
4. **Immigration Crisis** - Develop immigration policy

### 4. Generic Effect System
Effects are applied dynamically based on the option's effect definitions:
- `gdpChange`: Impact on GDP (positive/negative percentage)
- `wealthInequalityChange`: Impact on wealth distribution
- `homelessnessChange`: Impact on homelessness rates
- `unemploymentChange`: Impact on unemployment rates

## How It Works

### Event Selection
```javascript
selectRandomEvent() {
    const eventIds = Object.keys(this.eventDefinitions);
    const randomIndex = Math.floor(Math.random() * eventIds.length);
    const selectedEventId = eventIds[randomIndex];
    this.currentEvent = this.eventDefinitions[selectedEventId];
}
```

### Dynamic Content Display
```javascript
displayCurrentEvent() {
    // Update title and description
    document.getElementById('eventTitle').textContent = this.currentEvent.title;
    document.getElementById('eventDescription').textContent = this.currentEvent.description;
    
    // Generate option cards dynamically
    Object.entries(this.currentEvent.options).forEach(([optionId, option]) => {
        // Create option card with dynamic content
    });
}
```

### Effect Application
```javascript
applyEventEffects(optionType) {
    const option = this.currentEvent.options[optionType];
    
    Object.entries(option.effects).forEach(([effectType, range]) => {
        const randomValue = range.min + (Math.random() * (range.max - range.min));
        // Apply effect to corresponding statistic
    });
}
```

## Adding New Events

To add a new event, simply add it to the `eventDefinitions` object:

```javascript
'new_event_id': {
    id: 'new_event_id',
    title: 'New Event Title',
    description: 'Event description...',
    options: {
        'conservative-right': {
            title: 'Option Title',
            description: 'Option description...',
            icon: 'fas fa-icon',
            effects: {
                gdpChange: { min: 0.05, max: 0.15 },
                // ... other effects
            },
            messages: ['Effect 1', 'Effect 2', 'Effect 3']
        },
        // ... other options
    }
}
```

## Benefits

1. **Scalability**: Easy to add new events without code changes
2. **Maintainability**: All event data is centralized and structured
3. **Consistency**: All events follow the same format and behavior
4. **Flexibility**: Effects can be easily adjusted by changing min/max values
5. **Reusability**: The system can handle any number of events

## Testing

The system has been tested with:
- Random event selection
- Dynamic content generation
- Effect application
- Multiple event types

All tests pass successfully, confirming the system is working as expected.
