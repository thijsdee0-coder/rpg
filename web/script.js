/**
 * Political RPG Game Logic
 * 
 * Copyright (c) 2025 Political RPG
 * 
 * This source code is provided for educational and reference purposes.
 * Unauthorized copying, modification, or distribution is prohibited.
 * 
 * For licensing inquiries, please contact the repository owner.
 */
// Political RPG Game Logic
class PoliticalRPG {
    constructor() {
        this.gameState = {
            currentDay: 1,
            partyControlPercentage: 0,
            taxRate: 25.0,
            socialIdeology: '',
            economicIdeology: '',
            socialValue: 5,
            economicValue: 5,
            partyName: '',
            playerChoice: '',
            gameRunning: true,
            budgetAllocationDone: false,
            allParties: [],
            budgetSubjects: [],
            voterIssues: null,
            statistics: null,
            statisticsHistory: null
        };
        
        this.initializeBudgetSubjects();
        this.initializeEventListeners();
        this.initializeEventSystem();
        // Initialize news store
        this.gameState.news = [];
        
        // Initialize auto-save system
        this.autoSaveEnabled = true;
        this.lastSaveTime = null;
        this.saveKey = 'politicalRPG_save';
        this.currentSlot = null; // Track which slot is currently active
        
        // Don't auto-load on startup - let user choose when to load
    }
    
    initializeBudgetSubjects() {
        this.gameState.budgetSubjects = [
            { name: "Healthcare", description: "Public healthcare services and medical infrastructure", currentSpending: 25, baseSpending: 25 },
            { name: "Education", description: "Schools, universities, and educational programs", currentSpending: 20, baseSpending: 20 },
            { name: "Defense", description: "Military spending and national security", currentSpending: 15, baseSpending: 15 },
            { name: "Infrastructure", description: "Roads, bridges, public transportation", currentSpending: 12, baseSpending: 12 },
            { name: "Social Welfare", description: "Unemployment benefits, housing assistance", currentSpending: 10, baseSpending: 10 },
            { name: "Environment", description: "Environmental protection and climate initiatives", currentSpending: 8, baseSpending: 8 },
            { name: "Research & Development", description: "Scientific research and innovation funding", currentSpending: 5, baseSpending: 5 },
            { name: "Law Enforcement", description: "Police, courts, and justice system", currentSpending: 3, baseSpending: 3 },
            { name: "Foreign Aid", description: "International development and humanitarian aid", currentSpending: 1, baseSpending: 1 },
            { name: "Culture & Arts", description: "Museums, theaters, and cultural programs", currentSpending: 1, baseSpending: 1 }
        ];
    }
    
    // Save/Load System with Slots
    saveGame(slot = null) {
        try {
            const saveData = {
                gameState: this.gameState,
                timestamp: new Date().toISOString(),
                version: '1.0',
                slot: slot || this.currentSlot
            };
            
            const key = slot ? `${this.saveKey}_slot_${slot}` : this.saveKey;
            localStorage.setItem(key, JSON.stringify(saveData));
            this.lastSaveTime = new Date();
            this.currentSlot = slot;
            this.showSaveIndicator(`Game saved to slot ${slot || 'auto'}!`);
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            this.showSaveIndicator('Failed to save game!', 'error');
            return false;
        }
    }
    
    saveToSlot(slot) {
        if (slot < 1 || slot > 4) {
            this.showSaveIndicator('Invalid slot number!', 'error');
            return false;
        }
        return this.saveGame(slot);
    }
    
    loadGame() {
        this.showLoadMenu();
    }
    
    loadFromSlot(slot) {
        try {
            const key = `${this.saveKey}_slot_${slot}`;
            const savedData = localStorage.getItem(key);
            
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                const saveInfo = this.getSlotInfo(slot);
                
                const saveDate = new Date(saveInfo.timestamp).toLocaleString();
                const message = `Load from Slot ${slot}?\n\nParty: ${saveInfo.partyName}\nDay: ${saveInfo.day}\nSaved: ${saveDate}\n\nThis will overwrite current progress.`;
                
                if (confirm(message)) {
                    // Merge saved state with current state to preserve any new properties
                    this.gameState = { ...this.gameState, ...parsedData.gameState };
                    this.lastSaveTime = new Date(parsedData.timestamp);
                    this.currentSlot = slot;
                    
                    // Update the UI to reflect loaded state
                    this.updateGameStats();
                    this.updateUI();
                    
                    this.showSaveIndicator(`Game loaded from slot ${slot}!`);
                    this.showScreen('gameScreen');
                    return true;
                } else {
                    this.showSaveIndicator('Load cancelled');
                    return false;
                }
            } else {
                this.showSaveIndicator(`No save data found in slot ${slot}!`, 'error');
            }
        } catch (error) {
            console.error('Failed to load game:', error);
            this.showSaveIndicator('Failed to load game!', 'error');
        }
        return false;
    }
    
    // Update UI elements after loading
    updateUI() {
        // Update party name if it exists
        if (this.gameState.partyName) {
            const partyNameElement = document.getElementById('previewPartyName');
            if (partyNameElement) {
                partyNameElement.textContent = this.gameState.partyName;
            }
        }
        
        // Update party control percentage
        if (this.gameState.partyControlPercentage) {
            const partyControlElement = document.getElementById('partyControl');
            if (partyControlElement) {
                partyControlElement.textContent = this.gameState.partyControlPercentage + '%';
            }
        }
        
        // Update tax rate
        if (this.gameState.taxRate) {
            const taxRateElement = document.getElementById('taxRate');
            if (taxRateElement) {
                taxRateElement.textContent = this.gameState.taxRate.toFixed(1) + '%';
            }
        }
        
        // Update current day
        if (this.gameState.currentDay) {
            const currentDayElement = document.getElementById('currentDay');
            if (currentDayElement) {
                currentDayElement.textContent = this.gameState.currentDay;
            }
        }
        
        // If game is already started, show the main game screen
        if (this.gameState.partyName && this.gameState.playerChoice) {
            this.showScreen('gameScreen');
        }
    }
    
    // Auto-save functionality
    autoSave() {
        if (this.autoSaveEnabled) {
            this.saveGame();
        }
    }
    
    // Manual save - show save menu
    manualSave() {
        console.log('Manual save clicked');
        this.showSaveMenu();
    }
    
    // Test function to debug save/load
    testSaveLoad() {
        try {
            alert('Test functie gestart!');
            console.log('Testing save/load system...');
            console.log('Game state:', this.gameState);
            console.log('Save key:', this.saveKey);
            
            // Test slot info
            for (let i = 1; i <= 4; i++) {
                const info = this.getSlotInfo(i);
                console.log(`Slot ${i}:`, info);
            }
            
            // Test save menu
            console.log('Testing save menu...');
            this.showSaveMenu();
            
            // Test load menu
            console.log('Testing load menu...');
            setTimeout(() => {
                this.showLoadMenu();
            }, 2000);
        } catch (error) {
            alert('Error in test: ' + error.message);
            console.error('Test error:', error);
        }
    }
    
    // Show save status indicator
    showSaveIndicator(message, type = 'success') {
        // Create or update save indicator
        let indicator = document.getElementById('save-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'save-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 15px;
                border-radius: 5px;
                color: white;
                font-weight: bold;
                z-index: 10000;
                transition: opacity 0.3s ease;
                opacity: 0;
            `;
            document.body.appendChild(indicator);
        }
        
        // Set style based on type
        if (type === 'success') {
            indicator.style.backgroundColor = '#4CAF50';
        } else if (type === 'error') {
            indicator.style.backgroundColor = '#f44336';
        } else {
            indicator.style.backgroundColor = '#2196F3';
        }
        
        indicator.textContent = message;
        indicator.style.opacity = '1';
        
        // Hide after 3 seconds
        setTimeout(() => {
            if (indicator) {
                indicator.style.opacity = '0';
                setTimeout(() => {
                    if (indicator && indicator.parentNode) {
                        indicator.parentNode.removeChild(indicator);
                    }
                }, 300);
            }
        }, 3000);
    }
    
    // Method to trigger auto-save when game state changes
    updateGameState(updates) {
        Object.assign(this.gameState, updates);
        this.autoSave();
    }
    
    // Check if save data exists
    hasSaveData() {
        const savedData = localStorage.getItem(this.saveKey);
        return savedData !== null;
    }
    
    // Get save info for display
    getSaveInfo() {
        try {
            const savedData = localStorage.getItem(this.saveKey);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                return {
                    exists: true,
                    timestamp: parsedData.timestamp,
                    day: parsedData.gameState?.currentDay || 1,
                    partyName: parsedData.gameState?.partyName || 'Unknown'
                };
            }
        } catch (error) {
            console.error('Failed to get save info:', error);
        }
        return { exists: false };
    }
    
    // Get slot info for display
    getSlotInfo(slot) {
        try {
            const key = `${this.saveKey}_slot_${slot}`;
            const savedData = localStorage.getItem(key);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                return {
                    exists: true,
                    timestamp: parsedData.timestamp,
                    day: parsedData.gameState?.currentDay || 1,
                    partyName: parsedData.gameState?.partyName || 'Unknown',
                    slot: slot
                };
            }
        } catch (error) {
            console.error('Failed to get slot info:', error);
        }
        return { exists: false, slot: slot };
    }
    
    // Delete slot
    deleteSlot(slot) {
        try {
            const key = `${this.saveKey}_slot_${slot}`;
            localStorage.removeItem(key);
            this.showSaveIndicator(`Slot ${slot} deleted!`);
            this.showLoadMenu(); // Refresh the load menu
            return true;
        } catch (error) {
            console.error('Failed to delete slot:', error);
            this.showSaveIndicator('Failed to delete slot!', 'error');
            return false;
        }
    }
    
    // Show load menu with slots
    showLoadMenu() {
        this.showScreen('loadMenuScreen');
        // Use setTimeout to ensure the screen is visible before rendering
        setTimeout(() => {
            this.renderLoadSlots();
        }, 100);
    }
    
    initializeEventListeners() {
        // Party name input
        const partyNameInput = document.getElementById('partyNameInput');
        if (partyNameInput) {
            partyNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.setPartyName();
                }
            });
        }
    }
    
    initializeEventSystem() {
        // Define all available events with their options and effects
        this.eventDefinitions = {
            'housing_crisis': {
                id: 'housing_crisis',
                title: 'Housing Crisis',
                description: 'The country is facing a severe housing shortage. Young families cannot find affordable homes, and homelessness is on the rise. The coalition must decide how to address this crisis.',
                options: {
                    'conservative-right': {
                        title: 'Market Solutions',
                        description: 'Reduce regulations and let the free market solve the housing crisis through private development.',
                        icon: 'fas fa-home',
                        effects: {
                            gdpChange: { min: 0.02, max: 0.04 },
                            wealthInequalityChange: { min: 0.05, max: 0.08 }, // MORE inequality
                            homelessnessChange: { min: 0.03, max: 0.06 }, // MORE homelessness
                            unemploymentChange: { min: 0.01, max: 0.03 }, // INCREASE unemployment
                            happinessChange: { min: -0.03, max: -0.01 }, // LESS happiness (housing stress)
                            environmentalQualityChange: { min: -0.02, max: -0.01 }, // LESS environmental quality (rapid development)
                            availableJobsSectors: {
                                construction: { min: 0.10, max: 0.20 }, // More construction jobs
                                finance: { min: 0.05, max: 0.10 }, // More finance jobs
                                retail: { min: -0.05, max: -0.02 } // LESS retail jobs
                            },
                            unemploymentBreakdown: {
                                noAvailableJobs: { min: 0.05, max: 0.10 }, // MORE "no available jobs"
                                ageDiscrimination: { min: 0.03, max: 0.08 } // MORE age discrimination
                            }
                        },
                        messages: ['GDP increased significantly', 'Wealth inequality skyrocketed', 'Homelessness increased dramatically', 'Housing became unaffordable for most', 'Construction sector boomed while others suffered']
                    },
                    'conservative-left': {
                        title: 'Public Housing',
                        description: 'Invest heavily in government-built social housing to provide affordable homes for families.',
                        icon: 'fas fa-hammer',
                        effects: {
                            homelessnessChange: { min: -0.05, max: -0.02 }, // Less improvement
                            gdpChange: { min: -0.06, max: -0.04 }, // MORE GDP decrease
                            unemploymentChange: { min: 0.02, max: 0.04 }, // MORE unemployment
                            wealthInequalityChange: { min: 0.02, max: 0.05 }, // INCREASE inequality
                            happinessChange: { min: -0.02, max: 0.01 }, // Mixed happiness (some relief, some stress)
                            environmentalQualityChange: { min: -0.01, max: 0.00 }, // Slight environmental impact
                            availableJobsSectors: {
                                construction: { min: 0.15, max: 0.25 }, // More construction jobs
                                education: { min: 0.03, max: 0.08 }, // Some education jobs
                                finance: { min: -0.10, max: -0.05 }, // LESS finance jobs
                                technology: { min: -0.08, max: -0.03 } // LESS tech jobs
                            },
                            unemploymentBreakdown: {
                                noAvailableJobs: { min: -0.05, max: 0.02 }, // Mixed effect
                                lackOfSkills: { min: 0.08, max: 0.15 }, // MORE skill mismatch
                                mentalHealth: { min: 0.03, max: 0.08 } // MORE mental health issues
                            }
                        },
                        messages: ['Homelessness decreased moderately', 'GDP decreased substantially', 'Massive government debt incurred', 'Construction sector expanded', 'Other sectors severely underfunded']
                    },
                    'progressive-right': {
                        title: 'Innovation & Incentives',
                        description: 'Create tax incentives for sustainable housing development and modern construction methods.',
                        icon: 'fas fa-chart-line',
                        effects: {
                            unemploymentChange: { min: -0.04, max: -0.02 },
                            gdpChange: { min: -0.02, max: -0.01 },
                            homelessnessChange: { min: -0.03, max: -0.01 },
                            happinessChange: { min: 0.01, max: 0.03 }, // MORE happiness (sustainable solutions)
                            environmentalQualityChange: { min: 0.02, max: 0.04 } // MORE environmental quality (sustainable development)
                        },
                        messages: ['Unemployment decreased', 'GDP decreased slightly', 'Modern housing solutions implemented']
                    },
                    'progressive-left': {
                        title: 'Community Solutions',
                        description: 'Support cooperative housing and community land trusts to create affordable, community-owned homes.',
                        icon: 'fas fa-users',
                        effects: {
                            homelessnessChange: { min: -0.02, max: -0.01 },
                            unemploymentChange: { min: -0.01, max: -0.005 },
                            happinessChange: { min: 0.02, max: 0.04 }, // MORE happiness (community empowerment)
                            environmentalQualityChange: { min: 0.01, max: 0.02 } // MORE environmental quality (community stewardship)
                        },
                        messages: ['Minimal economic impact', 'Community empowerment increased', 'Grassroots solutions implemented']
                    }
                }
            },
            'economic_recession': {
                id: 'economic_recession',
                title: 'Economic Recession',
                description: 'The economy has entered a recession with rising unemployment and declining GDP. The government must take action to stimulate economic recovery.',
                options: {
                    'conservative-right': {
                        title: 'Tax Cuts & Deregulation',
                        description: 'Reduce taxes and regulations to encourage business investment and economic growth.',
                        icon: 'fas fa-chart-line',
                        effects: {
                            gdpChange: { min: 0.02, max: 0.04 },
                            unemploymentChange: { min: -0.02, max: -0.01 },
                            wealthInequalityChange: { min: 0.02, max: 0.04 },
                            happinessChange: { min: -0.01, max: 0.01 }, // Mixed happiness (economic growth vs inequality)
                            environmentalQualityChange: { min: -0.02, max: -0.01 } // LESS environmental quality (deregulation)
                        },
                        messages: ['Business investment increased', 'Tax revenue decreased', 'Economic growth stimulated']
                    },
                    'conservative-left': {
                        title: 'Infrastructure Investment',
                        description: 'Launch massive public works programs to create jobs and improve national infrastructure.',
                        icon: 'fas fa-road',
                        effects: {
                            unemploymentChange: { min: -0.04, max: -0.02 },
                            gdpChange: { min: 0.01, max: 0.02 },
                            homelessnessChange: { min: -0.01, max: 0.00 },
                            happinessChange: { min: 0.01, max: 0.03 }, // MORE happiness (job creation)
                            environmentalQualityChange: { min: -0.01, max: 0.00 } // Slight environmental impact (construction)
                        },
                        messages: ['Unemployment decreased significantly', 'Infrastructure improved', 'Public debt increased']
                    },
                    'progressive-right': {
                        title: 'Innovation Stimulus',
                        description: 'Invest in research and development, green technology, and digital infrastructure.',
                        icon: 'fas fa-lightbulb',
                        effects: {
                            gdpChange: { min: 0.01, max: 0.03 },
                            unemploymentChange: { min: -0.03, max: -0.02 },
                            wealthInequalityChange: { min: -0.01, max: 0.01 },
                            happinessChange: { min: 0.02, max: 0.04 }, // MORE happiness (innovation and green jobs)
                            environmentalQualityChange: { min: 0.03, max: 0.05 } // MORE environmental quality (green technology)
                        },
                        messages: ['Innovation sector grew', 'Green jobs created', 'Future competitiveness improved']
                    },
                    'progressive-left': {
                        title: 'Social Safety Net',
                        description: 'Expand unemployment benefits, healthcare access, and social programs to support affected citizens.',
                        icon: 'fas fa-heart',
                        effects: {
                            unemploymentChange: { min: -0.01, max: 0.00 },
                            homelessnessChange: { min: -0.02, max: -0.01 },
                            gdpChange: { min: -0.01, max: 0.01 },
                            happinessChange: { min: 0.03, max: 0.05 }, // MORE happiness (social support)
                            environmentalQualityChange: { min: 0.00, max: 0.01 } // Neutral environmental impact
                        },
                        messages: ['Social support strengthened', 'Poverty reduced', 'Government spending increased']
                    }
                }
            },
            'climate_crisis': {
                id: 'climate_crisis',
                title: 'Climate Crisis',
                description: 'Extreme weather events and environmental degradation threaten the nation. The government must decide how to address climate change and environmental protection.',
                options: {
                    'conservative-right': {
                        title: 'Market-Based Solutions',
                        description: 'Implement carbon trading and green technology incentives to let the market drive environmental solutions.',
                        icon: 'fas fa-leaf',
                        effects: {
                            gdpChange: { min: 0.01, max: 0.02 },
                            unemploymentChange: { min: -0.01, max: 0.00 },
                            wealthInequalityChange: { min: 0.01, max: 0.03 },
                            happinessChange: { min: 0.01, max: 0.02 }, // MORE happiness (green technology growth)
                            environmentalQualityChange: { min: 0.02, max: 0.03 } // MORE environmental quality (carbon reduction)
                        },
                        messages: ['Green technology sector grew', 'Carbon emissions reduced moderately', 'Business-friendly approach']
                    },
                    'conservative-left': {
                        title: 'Public Green Investment',
                        description: 'Launch government-led renewable energy and environmental protection programs.',
                        icon: 'fas fa-solar-panel',
                        effects: {
                            unemploymentChange: { min: -0.02, max: -0.01 },
                            gdpChange: { min: -0.01, max: 0.01 },
                            homelessnessChange: { min: -0.005, max: 0.00 },
                            happinessChange: { min: 0.02, max: 0.03 }, // MORE happiness (green jobs and clean energy)
                            environmentalQualityChange: { min: 0.03, max: 0.04 } // MORE environmental quality (renewable energy)
                        },
                        messages: ['Renewable energy expanded', 'Green jobs created', 'Public investment increased']
                    },
                    'progressive-right': {
                        title: 'Innovation & Technology',
                        description: 'Invest heavily in clean technology research and sustainable innovation.',
                        icon: 'fas fa-atom',
                        effects: {
                            gdpChange: { min: 0.02, max: 0.03 },
                            unemploymentChange: { min: -0.02, max: -0.01 },
                            wealthInequalityChange: { min: -0.005, max: 0.02 },
                            happinessChange: { min: 0.02, max: 0.04 }, // MORE happiness (innovation and clean tech)
                            environmentalQualityChange: { min: 0.04, max: 0.06 } // MORE environmental quality (clean technology)
                        },
                        messages: ['Clean technology advanced', 'Innovation leadership established', 'Future competitiveness secured']
                    },
                    'progressive-left': {
                        title: 'Green New Deal',
                        description: 'Comprehensive environmental and social program combining climate action with social justice.',
                        icon: 'fas fa-globe',
                        effects: {
                            unemploymentChange: { min: -0.03, max: -0.02 },
                            homelessnessChange: { min: -0.02, max: -0.01 },
                            gdpChange: { min: -0.01, max: 0.01 },
                            happinessChange: { min: 0.03, max: 0.05 }, // MORE happiness (social justice and environmental action)
                            environmentalQualityChange: { min: 0.05, max: 0.07 } // MORE environmental quality (comprehensive climate action)
                        },
                        messages: ['Environmental justice advanced', 'Social programs expanded', 'Comprehensive climate action']
                    }
                }
            },
            'immigration_crisis': {
                id: 'immigration_crisis',
                title: 'Immigration Crisis',
                description: 'A surge in immigration has created challenges for border security, social services, and national identity. The government must develop a comprehensive immigration policy.',
                options: {
                    'conservative-right': {
                        title: 'Border Security & Enforcement',
                        description: 'Strengthen border controls and enforce strict immigration laws to protect national security.',
                        icon: 'fas fa-shield-alt',
                        effects: {
                            unemploymentChange: { min: -0.005, max: 0.01 },
                            gdpChange: { min: -0.005, max: 0.005 },
                            wealthInequalityChange: { min: 0.00, max: 0.02 },
                            immigrationChange: { min: -0.15, max: -0.05 }, // DECREASE immigration
                            happinessChange: { min: -0.01, max: 0.02 }, // Mixed happiness (security vs diversity)
                            environmentalQualityChange: { min: 0.00, max: 0.01 } // Neutral environmental impact
                        },
                        messages: ['Border security strengthened', 'Immigration reduced', 'National security prioritized']
                    },
                    'conservative-left': {
                        title: 'Orderly Immigration',
                        description: 'Create structured immigration programs with proper documentation and integration support.',
                        icon: 'fas fa-passport',
                        effects: {
                            unemploymentChange: { min: -0.01, max: 0.00 },
                            gdpChange: { min: 0.005, max: 0.01 },
                            homelessnessChange: { min: -0.01, max: 0.00 },
                            immigrationChange: { min: -0.05, max: 0.05 }, // MIXED immigration effect
                            happinessChange: { min: 0.01, max: 0.03 }, // MORE happiness (orderly integration)
                            environmentalQualityChange: { min: 0.00, max: 0.01 } // Neutral environmental impact
                        },
                        messages: ['Immigration system reformed', 'Integration programs established', 'Orderly process implemented']
                    },
                    'progressive-right': {
                        title: 'Economic Immigration',
                        description: 'Focus on attracting skilled immigrants to boost economic growth and innovation.',
                        icon: 'fas fa-briefcase',
                        effects: {
                            gdpChange: { min: 0.02, max: 0.03 },
                            unemploymentChange: { min: -0.02, max: -0.01 },
                            wealthInequalityChange: { min: -0.01, max: 0.01 },
                            immigrationChange: { min: 0.05, max: 0.15 }, // INCREASE immigration
                            happinessChange: { min: 0.02, max: 0.04 }, // MORE happiness (economic growth and diversity)
                            environmentalQualityChange: { min: 0.00, max: 0.01 } // Neutral environmental impact
                        },
                        messages: ['Skilled immigration increased', 'Economic growth stimulated', 'Innovation capacity enhanced']
                    },
                    'progressive-left': {
                        title: 'Humanitarian Approach',
                        description: 'Provide comprehensive support for refugees and immigrants, focusing on human rights and integration.',
                        icon: 'fas fa-hands-helping',
                        effects: {
                            homelessnessChange: { min: -0.02, max: -0.01 },
                            unemploymentChange: { min: -0.01, max: 0.005 },
                            gdpChange: { min: -0.01, max: 0.01 },
                            immigrationChange: { min: 0.10, max: 0.20 }, // INCREASE immigration
                            happinessChange: { min: 0.03, max: 0.05 }, // MORE happiness (humanitarian values and diversity)
                            environmentalQualityChange: { min: 0.00, max: 0.01 } // Neutral environmental impact
                        },
                        messages: ['Humanitarian support expanded', 'Integration programs strengthened', 'Social cohesion improved']
                    }
                }
            },
            'healthcare_crisis': {
                id: 'healthcare_crisis',
                title: 'Healthcare Crisis',
                description: 'The healthcare system is overwhelmed with long waiting times, staff shortages, and rising costs. The government must decide how to reform the healthcare system.',
                options: {
                    'conservative-right': {
                        title: 'Private Healthcare Expansion',
                        description: 'Encourage private healthcare providers and insurance to reduce public system burden.',
                        icon: 'fas fa-user-md',
                        effects: {
                            gdpChange: { min: 0.01, max: 0.03 },
                            unemploymentChange: { min: 0.01, max: 0.03 }, // INCREASE unemployment
                            wealthInequalityChange: { min: 0.05, max: 0.08 }, // MORE inequality
                            homelessnessChange: { min: 0.02, max: 0.05 }, // MORE homelessness
                            accessToHealthcareChange: { min: -0.15, max: -0.05 }, // DECREASE access
                            healthcareIndexChange: { min: -0.10, max: -0.03 }, // DECREASE quality
                            happinessChange: { min: -0.05, max: -0.02 }, // LESS happiness (healthcare stress)
                            environmentalQualityChange: { min: 0.00, max: 0.01 }, // Neutral environmental impact
                            availableJobsSectors: {
                                healthcare: { min: -0.20, max: -0.10 }, // MORE job losses
                                finance: { min: 0.05, max: 0.10 } // Some finance jobs
                            },
                            unemploymentBreakdown: {
                                noAvailableJobs: { min: 0.10, max: 0.20 }, // MORE "no available jobs"
                                physicalHandicap: { min: 0.05, max: 0.10 } // MORE disabled unemployment
                            }
                        },
                        messages: ['Private sector expanded', 'Healthcare costs skyrocketed', 'Public healthcare jobs eliminated', 'Wealth inequality increased', 'Many lost access to healthcare']
                    },
                    'conservative-left': {
                        title: 'Public System Investment',
                        description: 'Massive investment in public healthcare infrastructure and staff recruitment.',
                        icon: 'fas fa-hospital',
                        effects: {
                            unemploymentChange: { min: -0.02, max: -0.01 }, // Slight improvement
                            gdpChange: { min: -0.05, max: -0.03 }, // MORE GDP decrease
                            wealthInequalityChange: { min: 0.02, max: 0.04 }, // INCREASE inequality
                            homelessnessChange: { min: 0.01, max: 0.03 }, // INCREASE homelessness
                            accessToHealthcareChange: { min: 0.05, max: 0.15 }, // INCREASE access
                            healthcareIndexChange: { min: 0.03, max: 0.08 }, // INCREASE quality
                            happinessChange: { min: 0.02, max: 0.04 }, // MORE happiness (better healthcare access)
                            environmentalQualityChange: { min: 0.00, max: 0.01 }, // Neutral environmental impact
                            availableJobsSectors: {
                                healthcare: { min: 0.15, max: 0.25 }, // More healthcare jobs
                                construction: { min: 0.05, max: 0.10 } // Some construction jobs
                            },
                            unemploymentBreakdown: {
                                noAvailableJobs: { min: -0.08, max: -0.03 }, // Decrease "no available jobs"
                                lackOfSkills: { min: 0.03, max: 0.08 } // INCREASE skill mismatch
                            }
                        },
                        messages: ['Public healthcare strengthened', 'Massive government debt incurred', 'Tax burden increased significantly', 'Healthcare sector expanded', 'Other sectors underfunded']
                    },
                    'progressive-right': {
                        title: 'Digital Health Innovation',
                        description: 'Invest in telemedicine, AI diagnostics, and digital health solutions.',
                        icon: 'fas fa-laptop-medical',
                        effects: {
                            gdpChange: { min: 0.01, max: 0.03 }, // Less GDP growth
                            unemploymentChange: { min: 0.01, max: 0.03 }, // INCREASE unemployment
                            wealthInequalityChange: { min: 0.03, max: 0.06 }, // INCREASE inequality
                            homelessnessChange: { min: 0.01, max: 0.02 }, // INCREASE homelessness
                            accessToHealthcareChange: { min: 0.02, max: 0.08 }, // SLIGHT INCREASE access
                            healthcareIndexChange: { min: 0.05, max: 0.12 }, // INCREASE quality
                            happinessChange: { min: 0.01, max: 0.03 }, // MORE happiness (better healthcare quality)
                            environmentalQualityChange: { min: 0.00, max: 0.01 }, // Neutral environmental impact
                            availableJobsSectors: {
                                healthcare: { min: -0.05, max: 0.05 }, // Mixed healthcare jobs
                                technology: { min: 0.15, max: 0.25 }, // More tech jobs
                                manufacturing: { min: -0.10, max: -0.05 } // LESS manufacturing jobs
                            },
                            unemploymentBreakdown: {
                                noAvailableJobs: { min: 0.05, max: 0.10 }, // INCREASE "no available jobs"
                                lackOfSkills: { min: 0.08, max: 0.15 }, // INCREASE skill mismatch
                                ageDiscrimination: { min: 0.03, max: 0.08 } // INCREASE age discrimination
                            }
                        },
                        messages: ['Healthcare technology advanced', 'Many traditional jobs automated', 'Digital divide widened', 'Older workers displaced', 'Tech sector boomed while others declined']
                    },
                    'progressive-left': {
                        title: 'Universal Healthcare Reform',
                        description: 'Comprehensive reform to ensure equal access to quality healthcare for all citizens.',
                        icon: 'fas fa-heart',
                        effects: {
                            homelessnessChange: { min: -0.01, max: 0.01 }, // Mixed effect
                            unemploymentChange: { min: 0.00, max: 0.02 }, // INCREASE unemployment
                            gdpChange: { min: -0.04, max: -0.02 }, // GDP decrease
                            wealthInequalityChange: { min: 0.01, max: 0.03 }, // INCREASE inequality
                            accessToHealthcareChange: { min: 0.08, max: 0.18 }, // INCREASE access
                            healthcareIndexChange: { min: 0.02, max: 0.06 }, // SLIGHT INCREASE quality
                            happinessChange: { min: 0.03, max: 0.05 }, // MORE happiness (universal healthcare access)
                            environmentalQualityChange: { min: 0.00, max: 0.01 }, // Neutral environmental impact
                            availableJobsSectors: {
                                healthcare: { min: 0.10, max: 0.20 }, // More healthcare jobs
                                education: { min: 0.05, max: 0.10 }, // More education jobs
                                finance: { min: -0.08, max: -0.03 }, // LESS finance jobs
                                retail: { min: -0.05, max: -0.02 } // LESS retail jobs
                            },
                            unemploymentBreakdown: {
                                noAvailableJobs: { min: -0.05, max: 0.02 }, // Mixed effect
                                lackOfSkills: { min: 0.05, max: 0.10 }, // INCREASE skill mismatch
                                mentalHealth: { min: 0.03, max: 0.08 } // INCREASE mental health issues
                            }
                        },
                        messages: ['Healthcare access equalized', 'Massive bureaucracy created', 'Tax burden increased', 'Healthcare and education jobs created', 'Other sectors suffered from funding cuts']
                    }
                }
            },
            'education_crisis': {
                id: 'education_crisis',
                title: 'Education Crisis',
                description: 'Schools are struggling with outdated curricula, teacher shortages, and declining student performance. The education system needs urgent reform.',
                options: {
                    'conservative-right': {
                        title: 'School Choice & Competition',
                        description: 'Introduce school vouchers and charter schools to create competition and improve quality.',
                        icon: 'fas fa-graduation-cap',
                        effects: {
                            gdpChange: { min: 0.01, max: 0.02 },
                            unemploymentChange: { min: -0.01, max: 0.00 },
                            wealthInequalityChange: { min: 0.01, max: 0.03 }
                        },
                        messages: ['School competition increased', 'Educational choice expanded', 'Quality improved for some students']
                    },
                    'conservative-left': {
                        title: 'Teacher Support & Infrastructure',
                        description: 'Invest heavily in teacher training, salaries, and school infrastructure improvements.',
                        icon: 'fas fa-chalkboard-teacher',
                        effects: {
                            unemploymentChange: { min: -0.02, max: -0.01 },
                            gdpChange: { min: -0.01, max: 0.00 },
                            homelessnessChange: { min: -0.01, max: 0.00 }
                        },
                        messages: ['Teacher conditions improved', 'School infrastructure modernized', 'Education quality enhanced']
                    },
                    'progressive-right': {
                        title: 'Technology Integration',
                        description: 'Modernize education with digital tools, coding programs, and STEM focus.',
                        icon: 'fas fa-laptop-code',
                        effects: {
                            gdpChange: { min: 0.02, max: 0.03 },
                            unemploymentChange: { min: -0.02, max: -0.01 },
                            wealthInequalityChange: { min: -0.01, max: 0.01 }
                        },
                        messages: ['Digital skills enhanced', 'STEM education expanded', 'Future workforce prepared']
                    },
                    'progressive-left': {
                        title: 'Equity & Inclusion Focus',
                        description: 'Address educational inequality and ensure all students have equal opportunities to succeed.',
                        icon: 'fas fa-users',
                        effects: {
                            homelessnessChange: { min: -0.02, max: -0.01 },
                            unemploymentChange: { min: -0.01, max: 0.00 },
                            gdpChange: { min: -0.01, max: 0.01 }
                        },
                        messages: ['Educational equity improved', 'Social mobility increased', 'Inclusive education strengthened']
                    }
                }
            },
            'security_threat': {
                id: 'security_threat',
                title: 'National Security Threat',
                description: 'Intelligence reports indicate increased cyber attacks and potential security threats. The government must strengthen national security measures.',
                options: {
                    'conservative-right': {
                        title: 'Military & Defense Expansion',
                        description: 'Increase military spending and strengthen traditional defense capabilities.',
                        icon: 'fas fa-shield-alt',
                        effects: {
                            gdpChange: { min: 0.01, max: 0.02 },
                            unemploymentChange: { min: -0.01, max: 0.00 },
                            wealthInequalityChange: { min: 0.00, max: 0.02 }
                        },
                        messages: ['Military capabilities strengthened', 'Defense industry expanded', 'National security prioritized']
                    },
                    'conservative-left': {
                        title: 'Intelligence & Surveillance',
                        description: 'Enhance intelligence gathering and surveillance capabilities to prevent threats.',
                        icon: 'fas fa-eye',
                        effects: {
                            unemploymentChange: { min: -0.01, max: 0.00 },
                            gdpChange: { min: -0.01, max: 0.01 },
                            homelessnessChange: { min: 0.00, max: 0.01 }
                        },
                        messages: ['Intelligence capabilities enhanced', 'Surveillance systems improved', 'Threat prevention strengthened']
                    },
                    'progressive-right': {
                        title: 'Cyber Security & Technology',
                        description: 'Invest in advanced cyber security and technological defense systems.',
                        icon: 'fas fa-lock',
                        effects: {
                            gdpChange: { min: 0.02, max: 0.03 },
                            unemploymentChange: { min: -0.02, max: -0.01 },
                            wealthInequalityChange: { min: -0.01, max: 0.01 }
                        },
                        messages: ['Cyber security enhanced', 'Technology sector grew', 'Digital defense strengthened']
                    },
                    'progressive-left': {
                        title: 'Diplomacy & Cooperation',
                        description: 'Focus on international cooperation and diplomatic solutions to security challenges.',
                        icon: 'fas fa-handshake',
                        effects: {
                            homelessnessChange: { min: -0.01, max: 0.00 },
                            unemploymentChange: { min: -0.01, max: 0.00 },
                            gdpChange: { min: -0.01, max: 0.01 }
                        },
                        messages: ['International cooperation strengthened', 'Diplomatic relations improved', 'Peaceful solutions prioritized']
                    }
                }
            }
        };
        
        // Initialize current event
        this.currentEvent = null;
    }
    
    // Screen Management
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }
    
    updateGameStats() {
        document.getElementById('currentDay').textContent = this.gameState.currentDay;
        document.getElementById('partyControl').textContent = this.gameState.partyControlPercentage + '%';
        document.getElementById('taxRate').textContent = this.gameState.taxRate.toFixed(1) + '%';
    }
    
    // Game Flow Functions
    startGame() {
        this.showScreen('partySetupScreen');
    }
    
    selectPartyType(partyType) {
        this.gameState.playerChoice = partyType;
        this.gameState.partyControlPercentage = this.generatePartyControlPercentage(partyType);
        this.autoSave(); // Auto-save when party type is selected
        
        // Show selection feedback
        document.querySelectorAll('.party-option').forEach(option => {
            option.style.borderColor = 'transparent';
        });
        event.currentTarget.style.borderColor = '#667eea';
        
        // Continue to ideology selection after a brief delay
        setTimeout(() => {
            this.showScreen('ideologyScreen');
        }, 500);
    }
    
    generatePartyControlPercentage(partyType) {
        if (partyType.includes('Small')) {
            // Small party: 1-10%, weighted towards 4-5%
            const mean = 4.5;
            const stdDev = 1.5;
            let percentage = Math.round(this.normalDistribution(mean, stdDev));
            return Math.max(1, Math.min(10, percentage));
        } else {
            // Big party: 10-75%, weighted towards 30-40%
            const mean = 35;
            const stdDev = 8;
            let percentage = Math.round(this.normalDistribution(mean, stdDev));
            return Math.max(10, Math.min(75, percentage));
        }
    }
    
    normalDistribution(mean, stdDev) {
        // Box-Muller transform for normal distribution
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return z0 * stdDev + mean;
    }
    
    generatePartyPercentage(socialValue, economicValue) {
        // Calculate distance from center (5, 5) - the closer to center, the larger the party
        const centerDistance = Math.sqrt(
            Math.pow(socialValue - 5, 2) + Math.pow(economicValue - 5, 2)
        );
        
        // Maximum distance from center is ~7.07 (corner to center)
        const maxDistance = Math.sqrt(50); // sqrt(5^2 + 5^2)
        const normalizedDistance = centerDistance / maxDistance; // 0 to 1
        
        // Base percentage: centrist parties get higher base percentages
        let basePercentage;
        if (normalizedDistance <= 0.2) {
            // Very centrist (within 20% of center)
            basePercentage = this.normalDistribution(25, 8); // Mean 25%, std 8%
        } else if (normalizedDistance <= 0.4) {
            // Moderately centrist (within 40% of center)
            basePercentage = this.normalDistribution(18, 7); // Mean 18%, std 7%
        } else if (normalizedDistance <= 0.6) {
            // Somewhat extreme (within 60% of center)
            basePercentage = this.normalDistribution(12, 6); // Mean 12%, std 6%
        } else if (normalizedDistance <= 0.8) {
            // Quite extreme (within 80% of center)
            basePercentage = this.normalDistribution(8, 4); // Mean 8%, std 4%
        } else {
            // Very extreme (beyond 80% from center)
            basePercentage = this.normalDistribution(5, 3); // Mean 5%, std 3%
        }
        
        // Add some randomness to prevent all centrist parties from being identical
        const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2 multiplier
        basePercentage *= randomFactor;
        
        // Ensure percentage is within reasonable bounds
        const finalPercentage = Math.max(1, Math.min(35, Math.round(basePercentage)));
        
        return finalPercentage;
    }
    
    selectSocialIdeology(ideology) {
        this.gameState.socialIdeology = ideology;
        
        if (ideology === 'Conservative') {
            this.gameState.socialValue = 7 + Math.floor(Math.random() * 4); // 7-10
        } else {
            this.gameState.socialValue = Math.floor(Math.random() * 4); // 0-3
        }
        
        this.autoSave(); // Auto-save when social ideology is selected
        
        // Show selection feedback
        document.querySelectorAll('.ideology-option').forEach(option => {
            option.style.borderColor = 'transparent';
        });
        event.currentTarget.style.borderColor = '#667eea';
        
        // Update preview
        this.updatePartyPreview();
        
        // Continue to economic ideology after a brief delay
        setTimeout(() => {
            // Scroll to economic section
            const economicSection = document.querySelector('.ideology-section:last-child');
            if (economicSection) {
                economicSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 500);
    }
    
    selectEconomicIdeology(ideology) {
        this.gameState.economicIdeology = ideology;
        
        if (ideology === 'Left') {
            this.gameState.economicValue = Math.floor(Math.random() * 4); // 0-3
        } else {
            this.gameState.economicValue = 7 + Math.floor(Math.random() * 4); // 7-10
        }
        
        this.autoSave(); // Auto-save when economic ideology is selected
        
        // Show selection feedback
        document.querySelectorAll('.ideology-option').forEach(option => {
            option.style.borderColor = 'transparent';
        });
        event.currentTarget.style.borderColor = '#667eea';
        
        // Update preview
        this.updatePartyPreview();
        
        // Continue to naming screen after a brief delay
        setTimeout(() => {
            this.showScreen('namingScreen');
        }, 500);
    }
    
    updatePartyPreview() {
        document.getElementById('previewSocial').textContent = `Social: ${this.gameState.socialIdeology}`;
        document.getElementById('previewEconomic').textContent = `Economic: ${this.gameState.economicIdeology}`;
        
        // Update spectrum markers
        const socialMarker = document.getElementById('socialMarker');
        const economicMarker = document.getElementById('economicMarker');
        
        if (socialMarker) {
            const socialPosition = (this.gameState.socialValue / 10) * 100;
            socialMarker.style.left = socialPosition + '%';
        }
        
        if (economicMarker) {
            const economicPosition = (this.gameState.economicValue / 10) * 100;
            economicMarker.style.left = economicPosition + '%';
        }
    }
    
    setPartyName() {
        const input = document.getElementById('partyNameInput');
        const name = input.value.trim();
        
        if (name.length < 2) {
            alert('Party name must be at least 2 characters long.');
            return;
        }
        
        if (name.length > 50) {
            alert('Party name is too long (maximum 50 characters).');
            return;
        }
        
        this.gameState.partyName = name;
        document.getElementById('previewPartyName').textContent = name;
        this.autoSave(); // Auto-save when party name is set
        
        // Continue to main game
        this.continueGame();
    }
    
    continueGame() {
        this.generateRandomParties();
        this.updateGameStats();
        this.showGameScreen();
    }
    
    generateRandomLeader() {
        const firstNames = [
            "Alexander", "Benjamin", "Charlotte", "David", "Emma", "Felix", "Grace", "Henry",
            "Isabella", "James", "Katherine", "Liam", "Maya", "Nathan", "Olivia", "Patrick",
            "Quinn", "Rachel", "Samuel", "Tessa", "Ulysses", "Victoria", "William", "Xavier",
            "Yara", "Zachary", "Amelia", "Benedict", "Cordelia", "Dominic", "Eleanor", "Frederick",
            "Genevieve", "Harrison", "Imogen", "Julian", "Katarina", "Leonardo", "Margot", "Nicholas",
            "Ophelia", "Percival", "Rosalind", "Sebastian", "Theodora", "Valentine", "Winifred", "Xander"
        ];
        
        const lastNames = [
            "Anderson", "Brown", "Clark", "Davis", "Evans", "Foster", "Garcia", "Harris",
            "Jackson", "Johnson", "King", "Lee", "Miller", "Nelson", "O'Connor", "Parker",
            "Quinn", "Roberts", "Smith", "Taylor", "Underwood", "Vargas", "Williams", "Young",
            "Adams", "Baker", "Campbell", "Carter", "Edwards", "Green", "Hall", "Jones",
            "Martin", "Murphy", "Reed", "Rivera", "Thompson", "White", "Wilson", "Wright",
            "Alexander", "Bennett", "Cooper", "Fisher", "Gray", "Hughes", "Jenkins", "Kelly"
        ];
        
        const titles = [
            "MP", "Minister", "Deputy Leader", "Shadow Minister", "Committee Chair", "Whip", "Speaker"
        ];
        
        return {
            firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
            lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
            title: titles[Math.floor(Math.random() * titles.length)],
            age: 35 + Math.floor(Math.random() * 30), // 35-64 years old
            experience: 5 + Math.floor(Math.random() * 20), // 5-24 years in politics
            charisma: Math.floor(Math.random() * 10) + 1, // 1-10
            intelligence: Math.floor(Math.random() * 10) + 1, // 1-10
            integrity: Math.floor(Math.random() * 10) + 1 // 1-10
        };
    }

    generateRandomParties() {
        const partyNames = [
            "National Unity Party", "Democratic Alliance", "Progressive Front", "Conservative Coalition",
            "Social Justice Party", "Free Market Party", "Green Future", "Traditional Values Party",
            "Workers' Union", "Liberty Party", "Reform Movement", "Stability Party",
            "Economic Growth Party", "Innovation Coalition", "People's Choice", "Equality Movement",
            "Future Forward", "Heritage Party", "New Vision Coalition", "Citizens' Alliance",
            "Progress Party", "Unity Movement", "Change Coalition", "Hope Party"
        ];
        
        const socialOptions = ["Progressive", "Conservative"];
        const economicOptions = ["Left", "Right"];
        
        // Generate 10-12 random parties
        const numParties = 10 + Math.floor(Math.random() * 3);
        this.gameState.allParties = [];
        
        // Generate random parties
        for (let i = 0; i < numParties; i++) {
            const party = {
                name: partyNames[Math.floor(Math.random() * partyNames.length)],
                socialIdeology: socialOptions[Math.floor(Math.random() * socialOptions.length)],
                economicIdeology: economicOptions[Math.floor(Math.random() * economicOptions.length)],
                percentage: 0,
                inCoalition: false,
                leader: this.generateRandomLeader()
            };
            
            // Assign numerical values based on ideology
            if (party.socialIdeology === "Progressive") {
                party.socialValue = Math.floor(Math.random() * 4); // 0-3
            } else {
                party.socialValue = 7 + Math.floor(Math.random() * 4); // 7-10
            }
            
            if (party.economicIdeology === "Left") {
                party.economicValue = Math.floor(Math.random() * 4); // 0-3
            } else {
                party.economicValue = 7 + Math.floor(Math.random() * 4); // 7-10
            }
            
            // Generate percentage based on ideological position (centrist parties tend to be larger)
            party.percentage = this.generatePartyPercentage(party.socialValue, party.economicValue);
            
            this.gameState.allParties.push(party);
        }
        
        // Add player's party
        const playerParty = {
            name: this.gameState.partyName,
            socialIdeology: this.gameState.socialIdeology,
            economicIdeology: this.gameState.economicIdeology,
            socialValue: this.gameState.socialValue,
            economicValue: this.gameState.economicValue,
            percentage: this.gameState.partyControlPercentage,
            inCoalition: this.gameState.playerChoice.includes('coalition'),
            leader: this.generateRandomLeader()
        };
        this.gameState.allParties.push(playerParty);
        
        // Sort parties by percentage (highest first)
        this.gameState.allParties.sort((a, b) => b.percentage - a.percentage);
        
        // Normalize percentages to sum to exactly 100%
        this.normalizePercentages();
        
        // Form coalition
        this.formCoalition();
        
        // Calculate initial tax rate
        this.calculateTaxRate();
    }
    
    normalizePercentages() {
        let totalPercentage = this.gameState.allParties.reduce((sum, party) => sum + party.percentage, 0);
        
        if (totalPercentage !== 100) {
            // Scale all percentages proportionally
            this.gameState.allParties.forEach(party => {
                party.percentage = Math.round((party.percentage * 100) / totalPercentage);
            });
            
            // Add any remaining percentage to the largest party
            totalPercentage = this.gameState.allParties.reduce((sum, party) => sum + party.percentage, 0);
            const remainder = 100 - totalPercentage;
            if (remainder > 0 && this.gameState.allParties.length > 0) {
                this.gameState.allParties[0].percentage += remainder;
            }
        }
    }
    
    formCoalition() {
        // Reset all parties to opposition
        this.gameState.allParties.forEach(party => {
            party.inCoalition = false;
        });
        
        // Function to calculate similarity between two parties
        const calculateSimilarity = (a, b) => {
            const socialDistance = Math.abs(a.socialValue - b.socialValue);
            const economicDistance = Math.abs(a.economicValue - b.economicValue);
            
            const socialSimilarity = Math.max(0, 4 - socialDistance);
            const economicSimilarity = Math.max(0, 4 - economicDistance);
            
            if (socialDistance > 6 && economicDistance > 6) {
                return 0; // Completely opposite ideologies
            }
            
            return socialSimilarity + economicSimilarity;
        };
        
        // Function to calculate coalition score (higher is better)
        const calculateCoalitionScore = (coalitionParties) => {
            let totalPercentage = 0;
            let totalSimilarity = 0;
            let similarityCount = 0;
            
            coalitionParties.forEach(party => {
                totalPercentage += party.percentage;
            });
            
            // Calculate average similarity within coalition
            for (let i = 0; i < coalitionParties.length; i++) {
                for (let j = i + 1; j < coalitionParties.length; j++) {
                    totalSimilarity += calculateSimilarity(coalitionParties[i], coalitionParties[j]);
                    similarityCount++;
                }
            }
            
            const averageSimilarity = similarityCount > 0 ? totalSimilarity / similarityCount : 0;
            
            // Score based on: percentage, similarity, and efficiency
            let score = 0;
            
            // Primary factor: percentage (must be above 50%)
            if (totalPercentage >= 50) {
                score += 100; // Base score for being above 50%
                
                // Efficiency bonus for being close to 50% (not too high)
                if (totalPercentage <= 60) {
                    score += 50; // Big bonus for efficiency
                } else if (totalPercentage <= 70) {
                    score += 25; // Medium bonus
                } else {
                    score -= (totalPercentage - 70) * 2; // Penalty for being too high
                }
            } else {
                // Penalty for being below 50%
                score -= (50 - totalPercentage) * 3;
            }
            
            // Secondary factor: ideological coherence
            score += averageSimilarity * 15;
            
            // Penalty for too many parties (complexity)
            if (coalitionParties.length > 3) {
                score -= (coalitionParties.length - 3) * 10;
            }
            
            return score;
        };
        
        // Try to form the best coalition
        let bestCoalitionScore = 0;
        let bestCoalition = [];
        
        // Try starting with each party as the base
        for (let startParty = 0; startParty < this.gameState.allParties.length; startParty++) {
            // Reset all parties to opposition
            this.gameState.allParties.forEach(party => {
                party.inCoalition = false;
            });
            
            // Start with the current party
            this.gameState.allParties[startParty].inCoalition = true;
            let currentTotal = this.gameState.allParties[startParty].percentage;
            
            // Keep adding parties until we have a good coalition
            const maxCoalitionParties = Math.floor((this.gameState.allParties.length + 1) / 2);
            let currentCoalitionParties = 1;
            
            while (currentTotal < 100 && currentCoalitionParties < maxCoalitionParties) {
                let bestScore = -1;
                let bestIndex = -1;
                
                // Find the opposition party that would give the best coalition score
                for (let i = 0; i < this.gameState.allParties.length; i++) {
                    if (!this.gameState.allParties[i].inCoalition) {
                        // Temporarily add this party to see the score
                        this.gameState.allParties[i].inCoalition = true;
                        
                        const coalitionParties = this.gameState.allParties.filter(p => p.inCoalition);
                        const score = calculateCoalitionScore(coalitionParties);
                        
                        // Remove it again
                        this.gameState.allParties[i].inCoalition = false;
                        
                        if (score > bestScore) {
                            bestScore = score;
                            bestIndex = i;
                        }
                    }
                }
                
                // Add the party that gives the best score
                if (bestIndex !== -1) {
                    this.gameState.allParties[bestIndex].inCoalition = true;
                    currentTotal += this.gameState.allParties[bestIndex].percentage;
                    currentCoalitionParties++;
                    
                    // If we're above 50% and have a good coalition, we can stop
                    if (currentTotal >= 50) {
                        const coalitionParties = this.gameState.allParties.filter(p => p.inCoalition);
                        const currentScore = calculateCoalitionScore(coalitionParties);
                        
                        // If this is a good coalition (above 50% with decent similarity), consider stopping
                        if (currentTotal >= 50) {
                            // Check if adding another party would significantly improve the score
                            let shouldContinue = false;
                            let bestImprovement = 0;
                            
                            for (let i = 0; i < this.gameState.allParties.length; i++) {
                                if (!this.gameState.allParties[i].inCoalition) {
                                    this.gameState.allParties[i].inCoalition = true;
                                    const testCoalition = this.gameState.allParties.filter(p => p.inCoalition);
                                    const testScore = calculateCoalitionScore(testCoalition);
                                    this.gameState.allParties[i].inCoalition = false;
                                    
                                    const improvement = testScore - currentScore;
                                    bestImprovement = Math.max(bestImprovement, improvement);
                                    
                                    // Only continue if adding this party would significantly improve the score
                                    // AND the coalition wouldn't become too large
                                    if (improvement > 20 && currentTotal + this.gameState.allParties[i].percentage <= 65) {
                                        shouldContinue = true;
                                    }
                                }
                            }
                            
                            // If we're already at 60% or above, be very strict about adding more
                            if (currentTotal >= 60 && bestImprovement < 30) {
                                shouldContinue = false;
                            }
                            
                            if (!shouldContinue) {
                                break;
                            }
                        }
                    }
                } else {
                    break;
                }
            }
            
            // Calculate final score for this coalition
            const coalitionParties = this.gameState.allParties.filter(p => p.inCoalition);
            const finalScore = calculateCoalitionScore(coalitionParties);
            
            // If this combination gives us a better result, save it
            if (finalScore > bestCoalitionScore) {
                bestCoalitionScore = finalScore;
                for (let i = 0; i < this.gameState.allParties.length; i++) {
                    bestCoalition[i] = this.gameState.allParties[i].inCoalition;
                }
            }
        }
        
        // Apply the best coalition we found
        for (let i = 0; i < this.gameState.allParties.length; i++) {
            this.gameState.allParties[i].inCoalition = bestCoalition[i];
        }
    }
    
    calculateTaxRate() {
        const totalBudget = this.getTotalBudget();
        
        // Base tax rate calculation
        let baseTaxRate = totalBudget * 0.25; // 25% tax rate per 100% budget
        
        // Coalition ideology modifier
        if (this.isCoalitionLeftWing()) {
            baseTaxRate *= 1.0; // No reduction
        } else {
            baseTaxRate *= 0.8; // 20% reduction
        }
        
        // Add some randomness (±5%)
        const randomFactor = 0.95 + (Math.random() * 0.1); // 0.95 to 1.05
        baseTaxRate *= randomFactor;
        
        // Clamp tax rate between 10% and 60%
        this.gameState.taxRate = Math.max(10.0, Math.min(60.0, baseTaxRate));
    }
    
    isCoalitionLeftWing() {
        if (this.gameState.allParties.length === 0) return false;
        
        let totalCoalitionEconomicValue = 0;
        let totalCoalitionPercentage = 0;
        
        this.gameState.allParties.forEach(party => {
            if (party.inCoalition) {
                totalCoalitionEconomicValue += party.economicValue * party.percentage;
                totalCoalitionPercentage += party.percentage;
            }
        });
        
        if (totalCoalitionPercentage === 0) return false;
        
        const averageEconomicValue = totalCoalitionEconomicValue / totalCoalitionPercentage;
        return averageEconomicValue <= 4.0;
    }
    
    getTotalBudget() {
        return this.gameState.budgetSubjects.reduce((total, subject) => total + subject.currentSpending, 0);
    }
    
    showGameScreen() {
        this.updateGameStats();
        
        // Update player party info
        document.getElementById('playerPartyName').textContent = this.gameState.partyName;
        document.getElementById('playerPartyType').textContent = this.gameState.playerChoice;
        document.getElementById('playerPartyControl').textContent = this.gameState.partyControlPercentage + '%';
        
        this.showScreen('gameScreen');
    }
    
    generateGovernmentLeadership() {
        // Only generate if not already exists
        if (!this.gameState.president) {
            this.generatePresident();
        }
        if (!this.gameState.ministers || this.gameState.ministers.length === 0) {
            this.generateMinisters();
        }
        
        // Always display current leadership
        this.displayPresident();
        this.displayMinisters();
    }

    resetGovernmentLeadership() {
        // Clear existing leadership to force regeneration
        this.gameState.president = null;
        this.gameState.ministers = [];
        console.log("Government leadership reset - will be regenerated next time");
    }

    generatePresident() {
        const coalitionParties = this.gameState.allParties.filter(party => party.inCoalition);
        let selectedParty;
        
        if (coalitionParties.length === 0) {
            // No coalition, use largest party
            selectedParty = this.gameState.allParties.reduce((prev, current) => 
                (prev.percentage > current.percentage) ? prev : current
            );
        } else {
            // 70% chance to use largest coalition party, 30% chance for other coalition party
            const largestCoalitionParty = coalitionParties.reduce((prev, current) => 
                (prev.percentage > current.percentage) ? prev : current
            );
            
            if (Math.random() < 0.7) {
                selectedParty = largestCoalitionParty;
            } else {
                // Random coalition party (excluding largest)
                const otherCoalitionParties = coalitionParties.filter(party => party !== largestCoalitionParty);
                if (otherCoalitionParties.length > 0) {
                    selectedParty = otherCoalitionParties[Math.floor(Math.random() * otherCoalitionParties.length)];
                } else {
                    selectedParty = largestCoalitionParty;
                }
            }
        }
        
        // Generate unique person for president (not the party leader)
        this.gameState.president = {
            ...this.generateRandomLeader(),
            party: selectedParty.name,
            title: "President"
        };
    }

    generateMinisters() {
        const departments = [
            "Health", "Education", "Defense", "Finance", "Infrastructure", 
            "Environment", "Justice", "Foreign Affairs", "Interior", "Economy"
        ];
        
        const coalitionParties = this.gameState.allParties.filter(party => party.inCoalition);
        this.gameState.ministers = [];
        
        // Calculate total coalition percentage
        const totalCoalitionPercentage = coalitionParties.reduce((sum, party) => sum + party.percentage, 0);
        
        // Calculate how many ministers each coalition party should get based on their percentage
        const partyMinisterCounts = {};
        coalitionParties.forEach(party => {
            const expectedMinisters = (party.percentage / totalCoalitionPercentage) * departments.length;
            partyMinisterCounts[party.name] = Math.floor(expectedMinisters);
        });
        
        // Distribute remaining ministers to largest parties
        const totalAssignedMinisters = Object.values(partyMinisterCounts).reduce((sum, count) => sum + count, 0);
        const remainingMinisters = departments.length - totalAssignedMinisters;
        
        if (remainingMinisters > 0) {
            // Sort parties by percentage and assign remaining ministers
            const sortedCoalitionParties = [...coalitionParties].sort((a, b) => b.percentage - a.percentage);
            for (let i = 0; i < remainingMinisters; i++) {
                const party = sortedCoalitionParties[i % sortedCoalitionParties.length];
                partyMinisterCounts[party.name]++;
            }
        }
        
        // Create minister assignments
        const ministerAssignments = [];
        Object.entries(partyMinisterCounts).forEach(([partyName, count]) => {
            for (let i = 0; i < count; i++) {
                ministerAssignments.push(partyName);
            }
        });
        
        // Shuffle assignments and assign to departments
        const shuffledAssignments = ministerAssignments.sort(() => Math.random() - 0.5);
        
        departments.forEach((department, index) => {
            let assignedParty;
            
            if (index < shuffledAssignments.length) {
                // Use pre-calculated assignment
                assignedParty = this.gameState.allParties.find(party => party.name === shuffledAssignments[index]);
            } else {
                // Fallback: random coalition party
                assignedParty = coalitionParties[Math.floor(Math.random() * coalitionParties.length)];
            }
            
            if (!assignedParty) {
                // Ultimate fallback: any party
                assignedParty = this.gameState.allParties[Math.floor(Math.random() * this.gameState.allParties.length)];
            }
            
            // Generate unique person for each minister
            const minister = {
                ...this.generateRandomLeader(),
                party: assignedParty.name,
                department: department,
                title: `Minister of ${department}`
            };
            
            this.gameState.ministers.push(minister);
        });
        
        this.logMinisterDistribution();
    }

    logMinisterDistribution() {
        console.log("=== Minister Distribution ===");
        const partyCounts = {};
        this.gameState.ministers.forEach(minister => {
            partyCounts[minister.party] = (partyCounts[minister.party] || 0) + 1;
        });
        
        Object.entries(partyCounts).forEach(([partyName, count]) => {
            const party = this.gameState.allParties.find(p => p.name === partyName);
            const percentage = party?.percentage || 0;
            const status = party?.inCoalition ? "Coalition" : "Opposition";
            console.log(`${partyName} (${percentage}% ${status}): ${count} ministers`);
        });
        console.log("=============================");
    }

    displayPresident() {
        const presidentCard = document.getElementById('presidentCard');
        if (presidentCard && this.gameState.president) {
            presidentCard.innerHTML = `
                <div class="president-photo">
                    <i class="fas fa-crown"></i>
                </div>
                <div class="president-name">${this.gameState.president.firstName} ${this.gameState.president.lastName}</div>
                <div class="president-title">${this.gameState.president.title}</div>
                <div class="president-party">${this.gameState.president.party}</div>
            `;
            
            // Remove existing event listeners and add new one
            presidentCard.replaceWith(presidentCard.cloneNode(true));
            const newPresidentCard = document.getElementById('presidentCard');
            
            // Add click event to show president details
            newPresidentCard.addEventListener('click', () => {
                const party = this.gameState.allParties.find(p => p.name === this.gameState.president.party);
                this.showPartyLeaderModal({
                    name: this.gameState.president.party,
                    leader: this.gameState.president,
                    inCoalition: party?.inCoalition || false,
                    percentage: party?.percentage || 0,
                    socialIdeology: party?.socialIdeology || "Unknown",
                    economicIdeology: party?.economicIdeology || "Unknown"
                });
            });
        }
    }

    displayMinisters() {
        const ministersGrid = document.getElementById('ministersGrid');
        if (ministersGrid && this.gameState.ministers) {
            ministersGrid.innerHTML = '';
            
            this.gameState.ministers.forEach(minister => {
                const ministerCard = document.createElement('div');
                ministerCard.className = 'minister-card';
                
                const party = this.gameState.allParties.find(p => p.name === minister.party);
                const partyClass = party?.inCoalition ? 'coalition' : 'opposition';
                
                // Calculate daily boost for this minister
                const dailyBoost = this.calculateMinisterDailyBoost(minister);
                const boostType = this.getBoostType(dailyBoost);
                
                ministerCard.innerHTML = `
                    <div class="minister-header">
                        <div class="minister-photo">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="minister-info">
                            <h5>${minister.firstName} ${minister.lastName}</h5>
                            <p>${minister.title}</p>
                        </div>
                    </div>
                    <div class="minister-details">
                        <div class="minister-department">${minister.department}</div>
                        <div class="minister-party ${partyClass}">${minister.party}</div>
                    </div>
                    ${dailyBoost ? `<div class="minister-boost ${boostType}">
                        <i class="fas fa-chart-line"></i> Daily Boost: ${dailyBoost}
                    </div>` : ''}
                `;
                
                // Add click event to show minister details
                ministerCard.addEventListener('click', () => {
                    const party = this.gameState.allParties.find(p => p.name === minister.party);
                    this.showPartyLeaderModal({
                        name: minister.party,
                        leader: minister,
                        inCoalition: party?.inCoalition || false,
                        percentage: party?.percentage || 0,
                        socialIdeology: party?.socialIdeology || "Unknown",
                        economicIdeology: party?.economicIdeology || "Unknown"
                    });
                });
                
                ministersGrid.appendChild(ministerCard);
            });
        }
    }

    showGovernmentOverview() {
        this.generateGovernmentLeadership();
        this.displayParties();
        this.updateCoalitionSummary();
        this.generatePoliticalCompass();
        this.generateAssemblyVisualization();
        this.showScreen('governmentScreen');
    }
    
    displayParties() {
        const partiesGrid = document.getElementById('partiesGrid');
        partiesGrid.innerHTML = '';
        
        this.gameState.allParties.forEach(party => {
            const partyCard = document.createElement('div');
            partyCard.className = `party-card ${party.inCoalition ? 'coalition' : 'opposition'}`;
            partyCard.style.cursor = 'pointer';
            
            partyCard.innerHTML = `
                <h4>${party.name}</h4>
                <div class="party-percentage">${party.percentage}%</div>
                <div class="party-ideology">
                    <span class="ideology-tag social">${party.socialIdeology}</span>
                    <span class="ideology-tag economic">${party.economicIdeology}</span>
                </div>
                <div class="party-status ${party.inCoalition ? 'coalition' : 'opposition'}">
                    ${party.inCoalition ? 'Coalition' : 'Opposition'}
                </div>
                <div class="party-leader-preview">
                    <i class="fas fa-user"></i> ${party.leader.firstName} ${party.leader.lastName}
                </div>
            `;
            
            // Add click event to show party leader details
            partyCard.addEventListener('click', () => {
                this.showPartyLeaderModal(party);
            });
            
            partiesGrid.appendChild(partyCard);
        });
    }
    
    showPartyLeaderModal(party) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('partyLeaderModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'partyLeaderModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="modalPartyName">Party Leader</h2>
                        <button class="modal-close" onclick="this.closest('.modal').style.display='none'">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="leader-info">
                            <div class="leader-photo">
                                <i class="fas fa-user-circle"></i>
                            </div>
                            <div class="leader-details">
                                <h3 id="modalLeaderName">Leader Name</h3>
                                <p id="modalLeaderTitle">Title</p>
                                <div class="leader-stats">
                                    <div class="stat-item">
                                        <span class="stat-label">Age:</span>
                                        <span class="stat-value" id="modalLeaderAge">-</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Experience:</span>
                                        <span class="stat-value" id="modalLeaderExperience">-</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Charisma:</span>
                                        <span class="stat-value" id="modalLeaderCharisma">-</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Intelligence:</span>
                                        <span class="stat-value" id="modalLeaderIntelligence">-</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Integrity:</span>
                                        <span class="stat-value" id="modalLeaderIntegrity">-</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="party-info">
                            <h4>Party Information</h4>
                            <div class="party-details">
                                <div class="detail-item">
                                    <span class="detail-label">Control:</span>
                                    <span class="detail-value" id="modalPartyControl">-</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Status:</span>
                                    <span class="detail-value" id="modalPartyStatus">-</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Social Ideology:</span>
                                    <span class="detail-value" id="modalPartySocial">-</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Economic Ideology:</span>
                                    <span class="detail-value" id="modalPartyEconomic">-</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // Populate modal with party and leader data
        document.getElementById('modalPartyName').textContent = party.name;
        document.getElementById('modalLeaderName').textContent = `${party.leader.firstName} ${party.leader.lastName}`;
        document.getElementById('modalLeaderTitle').textContent = party.leader.title;
        document.getElementById('modalLeaderAge').textContent = party.leader.age + ' years';
        document.getElementById('modalLeaderExperience').textContent = party.leader.experience + ' years';
        document.getElementById('modalLeaderCharisma').textContent = party.leader.charisma + '/10';
        document.getElementById('modalLeaderIntelligence').textContent = party.leader.intelligence + '/10';
        document.getElementById('modalLeaderIntegrity').textContent = party.leader.integrity + '/10';
        document.getElementById('modalPartyControl').textContent = party.percentage + '%';
        document.getElementById('modalPartyStatus').textContent = party.inCoalition ? 'Coalition' : 'Opposition';
        document.getElementById('modalPartySocial').textContent = party.socialIdeology;
        document.getElementById('modalPartyEconomic').textContent = party.economicIdeology;
        
        // Show modal
        modal.style.display = 'block';
    }

    updateCoalitionSummary() {
        let coalitionTotal = 0;
        let oppositionTotal = 0;
        
        this.gameState.allParties.forEach(party => {
            if (party.inCoalition) {
                coalitionTotal += party.percentage;
            } else {
                oppositionTotal += party.percentage;
            }
        });
        
        document.getElementById('coalitionTotal').textContent = coalitionTotal + '%';
        document.getElementById('oppositionTotal').textContent = oppositionTotal + '%';
    }
    
    showPoliticalCompass() {
        this.generatePoliticalCompass();
        this.showScreen('compassScreen');
    }
    
    generatePoliticalCompass() {
        const compassChart = document.getElementById('compassSVG');
        const compassLegend = document.getElementById('compassLegend');
        
        // Clear previous content
        if (compassChart) {
            // Clear existing party dots but keep grid lines and labels
            const existingDots = compassChart.querySelectorAll('.party-dot');
            existingDots.forEach(dot => dot.remove());
        }
        
        // Use existing SVG element
        const svg = compassChart;
        
        // Grid lines and quadrants are already in the HTML
        
        // Place parties on the compass
        const partyElements = [];
        this.gameState.allParties.forEach((party, index) => {
            // Convert 0-10 scale to 0-400 pixel scale (with 50px margin)
            const x = 50 + (party.economicValue / 10) * 400;
            const y = 50 + (party.socialValue / 10) * 400; // Progressive at top, Conservative at bottom
            
            // Calculate bubble size based on party percentage
            // Min size: 12px, Max size: 35px, scaled by percentage (1-75%)
            const minSize = 12;
            const maxSize = 35;
            const sizeRange = maxSize - minSize;
            const percentageRange = 75 - 1; // Assuming max party size is 75%
            const bubbleRadius = minSize + (party.percentage - 1) * (sizeRange / percentageRange);
            
            // Create party circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', bubbleRadius);
            circle.setAttribute('fill', party.inCoalition ? '#48bb78' : '#e53e3e');
            circle.setAttribute('stroke', 'white');
            circle.setAttribute('stroke-width', '3');
            circle.setAttribute('class', 'party-dot');
            circle.setAttribute('data-party-index', index);
            circle.setAttribute('data-party-percentage', party.percentage);
            
            // Add hover effect
            circle.addEventListener('mouseenter', () => this.highlightParty(index));
            circle.addEventListener('mouseleave', () => this.unhighlightParty());
            
            svg.appendChild(circle);
            
            // Add party initial with dynamic font size based on bubble size
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y + (bubbleRadius * 0.3)); // Position text relative to bubble size
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'white');
            text.setAttribute('font-size', Math.max(10, Math.min(16, bubbleRadius * 0.6))); // Dynamic font size
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('pointer-events', 'none');
            text.textContent = party.name[0].toUpperCase();
            svg.appendChild(text);
            
            partyElements.push({ party, element: circle, x, y, radius: bubbleRadius });
        });
        
        // SVG is already in the DOM
        
        // Generate legend
        this.generateCompassLegend();
    }
    
    generateAssemblyVisualization() {
        const assemblySVG = document.getElementById('assemblySVG');
        const assemblyCoalitionTotal = document.getElementById('assemblyCoalitionTotal');
        const assemblyOppositionTotal = document.getElementById('assemblyOppositionTotal');
        
        // Clear previous content
        if (assemblySVG) {
            assemblySVG.innerHTML = '';
        }
        
        // Calculate totals
        let coalitionTotal = 0;
        let oppositionTotal = 0;
        
        this.gameState.allParties.forEach(party => {
            if (party.inCoalition) {
                coalitionTotal += party.percentage;
            } else {
                oppositionTotal += party.percentage;
            }
        });
        
        // Update summary stats
        assemblyCoalitionTotal.textContent = coalitionTotal.toFixed(1) + '%';
        assemblyOppositionTotal.textContent = oppositionTotal.toFixed(1) + '%';
        
        // Sort parties by economic position (left to right)
        const sortedParties = [...this.gameState.allParties].sort((a, b) => a.economicValue - b.economicValue);
        
        // Assembly parameters - multiple rows like U.S. Senate
        const centerX = 300;
        const centerY = 200;
        const totalSeats = 100;
        const numRows = 3;
        
        // Calculate exact seat counts for each party (1 seat per percentage point)
        const partySeatCounts = sortedParties.map(party => {
            const seatCount = Math.round(party.percentage); // 1 seat per percentage point
            return { party, seatCount };
        });
        
        // Ensure we have exactly 100 seats by adjusting the largest party
        let totalCalculatedSeats = partySeatCounts.reduce((sum, { seatCount }) => sum + seatCount, 0);
        if (totalCalculatedSeats !== totalSeats) {
            const difference = totalSeats - totalCalculatedSeats;
            const largestPartyIndex = partySeatCounts.reduce((maxIndex, current, index) => 
                current.seatCount > partySeatCounts[maxIndex].seatCount ? index : maxIndex, 0);
            partySeatCounts[largestPartyIndex].seatCount += difference;
        }
        
        // Create vertical stacks for each party based on economic position
        const totalParties = sortedParties.length;
        const angleStep = Math.PI / (totalParties + 1);
        
        partySeatCounts.forEach(({ party, seatCount }, partyIndex) => {
            // Calculate the economic position angle for this party
            const partyAngle = Math.PI - (partyIndex + 1) * angleStep; // Reverse to fix mirroring
            
            // Create seats for this party, stacking vertically
            for (let seat = 0; seat < seatCount; seat++) {
                // Determine which row this seat belongs to (vertical stacking within party)
                const rowIndex = Math.floor((seat / seatCount) * numRows);
                const rowRadius = 80 + (rowIndex * 25); // Increasing radius for each row
                
                // Calculate position - same angle for all seats of this party
                const x = centerX + Math.cos(partyAngle) * rowRadius;
                const y = centerY - Math.sin(partyAngle) * rowRadius; // Negative because SVG Y increases downward
                
                // Create seat circle
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', x);
                circle.setAttribute('cy', y);
                circle.setAttribute('r', 4); // Slightly larger since we have fewer seats
                
                // Color based on coalition status and player party
                if (party.name === this.gameState.partyName) {
                    // Player's party - special color
                    circle.setAttribute('fill', '#667eea');
                    circle.setAttribute('stroke', '#ffffff');
                    circle.setAttribute('stroke-width', '2');
                } else if (party.inCoalition) {
                    // Coalition party - green tint
                    circle.setAttribute('fill', '#48bb78');
                    circle.setAttribute('stroke', '#ffffff');
                    circle.setAttribute('stroke-width', '1');
                } else {
                    // Opposition party - red tint
                    circle.setAttribute('fill', '#e53e3e');
                    circle.setAttribute('stroke', '#ffffff');
                    circle.setAttribute('stroke-width', '1');
                }
                
                circle.setAttribute('class', 'assembly-seat');
                circle.setAttribute('data-party', party.name);
                circle.setAttribute('data-coalition', party.inCoalition);
                
                // Add hover effect
                circle.addEventListener('mouseenter', (e) => {
                    this.showAssemblyTooltip(e, party);
                });
                circle.addEventListener('mouseleave', () => {
                    this.hideAssemblyTooltip();
                });
                
                assemblySVG.appendChild(circle);
            }
        });
        
        // Add axis labels
        this.addAssemblyAxisLabels(assemblySVG, centerX, centerY, 130); // Use max radius
    }
    
    addAssemblyAxisLabels(svg, centerX, centerY, radius) {
        // Left label
        const leftLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        leftLabel.setAttribute('x', centerX - radius - 20);
        leftLabel.setAttribute('y', centerY + 5);
        leftLabel.setAttribute('text-anchor', 'middle');
        leftLabel.setAttribute('fill', '#718096');
        leftLabel.setAttribute('font-size', '14');
        leftLabel.setAttribute('font-weight', '600');
        leftLabel.textContent = 'Economic Left';
        svg.appendChild(leftLabel);
        
        // Right label
        const rightLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        rightLabel.setAttribute('x', centerX + radius + 20);
        rightLabel.setAttribute('y', centerY + 5);
        rightLabel.setAttribute('text-anchor', 'middle');
        rightLabel.setAttribute('fill', '#718096');
        rightLabel.setAttribute('font-size', '14');
        rightLabel.setAttribute('font-weight', '600');
        rightLabel.textContent = 'Economic Right';
        svg.appendChild(rightLabel);
        
        // Center line
        const centerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        centerLine.setAttribute('x1', centerX - radius);
        centerLine.setAttribute('y1', centerY);
        centerLine.setAttribute('x2', centerX + radius);
        centerLine.setAttribute('y2', centerY);
        centerLine.setAttribute('stroke', '#e2e8f0');
        centerLine.setAttribute('stroke-width', '2');
        centerLine.setAttribute('stroke-dasharray', '5,5');
        svg.appendChild(centerLine);
    }
    
    showAssemblyTooltip(event, party) {
        // Remove existing tooltip
        this.hideAssemblyTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'assembly-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <strong>${party.name}</strong>
                <span class="tooltip-percentage">${party.percentage}%</span>
            </div>
            <div class="tooltip-details">
                <div class="tooltip-stat">
                    <span class="tooltip-label">Economic:</span>
                    <span class="tooltip-value">${party.economicValue.toFixed(1)}</span>
                </div>
                <div class="tooltip-stat">
                    <span class="tooltip-label">Social:</span>
                    <span class="tooltip-value">${party.socialValue.toFixed(1)}</span>
                </div>
                <div class="tooltip-status">
                    <span class="tooltip-coalition">${party.inCoalition ? 'Coalition' : 'Opposition'}</span>
                </div>
                ${party.name === this.gameState.partyName ? '<div class="tooltip-player">Your Party</div>' : ''}
            </div>
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip with better positioning
        const rect = event.target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Center horizontally and position above the circle
        let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        let top = rect.top - tooltipRect.height - 15;
        
        // Adjust if tooltip goes off screen
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top < 10) {
            top = rect.bottom + 15; // Show below if no space above
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        tooltip.style.display = 'block';
    }
    
    hideAssemblyTooltip() {
        const existingTooltip = document.querySelector('.assembly-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
    }
    
    generateCompassLegend() {
        const compassLegend = document.getElementById('compassLegend');
        
        let legendHTML = '<h3>Party Positions</h3>';
        
        // Sort parties by percentage (largest first) for better visual hierarchy
        const sortedParties = [...this.gameState.allParties].sort((a, b) => b.percentage - a.percentage);
        
        sortedParties.forEach((party, sortedIndex) => {
            const originalIndex = this.gameState.allParties.indexOf(party);
            const quadrant = this.getPartyQuadrant(party);
            
            // Calculate bubble size for legend
            const minSize = 12;
            const maxSize = 35;
            const sizeRange = maxSize - minSize;
            const percentageRange = 75 - 1;
            const bubbleRadius = minSize + (party.percentage - 1) * (sizeRange / percentageRange);
            
            legendHTML += `
                <div class="legend-item" data-party-index="${originalIndex}" onclick="game.selectPartyInCompass(${originalIndex})">
                    <div class="legend-symbol ${party.inCoalition ? 'coalition' : 'opposition'}" style="width: ${bubbleRadius * 2}px; height: ${bubbleRadius * 2}px; font-size: ${Math.max(10, Math.min(16, bubbleRadius * 0.6))}px;">
                        ${party.name[0].toUpperCase()}
                    </div>
                    <div class="legend-info">
                        <div class="legend-name">${party.name}</div>
                        <div class="legend-details">
                            ${party.inCoalition ? 'Coalition' : 'Opposition'} • ${quadrant} • ${party.percentage}%
                        </div>
                    </div>
                </div>
            `;
        });
        
        compassLegend.innerHTML = legendHTML;
    }
    
    generateCompassStats() {
        const compassStats = document.getElementById('compassStats');
        
        const coalitionParties = this.gameState.allParties.filter(p => p.inCoalition);
        const oppositionParties = this.gameState.allParties.filter(p => !p.inCoalition);
        
        // Calculate quadrant distribution
        const quadrants = {
            'Progressive Left': 0,
            'Progressive Right': 0,
            'Conservative Left': 0,
            'Conservative Right': 0
        };
        
        this.gameState.allParties.forEach(party => {
            const quadrant = this.getPartyQuadrant(party);
            quadrants[quadrant]++;
        });
        
        let statsHTML = '<h3>Compass Statistics</h3>';
        
        statsHTML += `
            <div class="stat-item">
                <span class="stat-label">Total Parties</span>
                <span class="stat-value">${this.gameState.allParties.length}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Coalition</span>
                <span class="stat-value">${coalitionParties.length}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Opposition</span>
                <span class="stat-value">${oppositionParties.length}</span>
            </div>
        `;
        
        // Add quadrant distribution
        Object.entries(quadrants).forEach(([quadrant, count]) => {
            if (count > 0) {
                statsHTML += `
                    <div class="stat-item">
                        <span class="stat-label">${quadrant}</span>
                        <span class="stat-value">${count}</span>
                    </div>
                `;
            }
        });
        
        compassStats.innerHTML = statsHTML;
    }
    
    getPartyQuadrant(party) {
        const isProgressive = party.socialValue <= 4;
        const isLeft = party.economicValue <= 4;
        
        if (isProgressive && isLeft) return 'Progressive Left';
        if (isProgressive && !isLeft) return 'Progressive Right';
        if (!isProgressive && isLeft) return 'Conservative Left';
        return 'Conservative Right';
    }
    
    selectPartyInCompass(index) {
        // Remove previous selection
        document.querySelectorAll('.legend-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Add selection to clicked item
        const selectedItem = document.querySelector(`[data-party-index="${index}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
        
        // Highlight party on compass
        this.highlightParty(index);
    }
    
    highlightParty(index) {
        const party = this.gameState.allParties[index];
        if (!party) return;
        
        // Remove any existing tooltip first
        this.unhighlightParty();
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'compass-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-header">${party.name}</div>
            <div class="tooltip-details">
                <div>Social: ${party.socialIdeology} (${party.socialValue}/10)</div>
                <div>Economic: ${party.economicIdeology} (${party.economicValue}/10)</div>
                <div>Control: ${party.percentage}%</div>
                <div>Status: ${party.inCoalition ? 'Coalition' : 'Opposition'}</div>
                <div>Quadrant: ${this.getPartyQuadrant(party)}</div>
            </div>
        `;
        
        // Position tooltip relative to the compass container, not the chart
        const compassContainer = document.querySelector('.compass-main');
        const chartElement = document.getElementById('compassChart');
        
        // Get the position of the party dot relative to the compass container
        const x = 50 + (party.economicValue / 10) * 400;
        const y = 50 + (party.socialValue / 10) * 400;
        
        // Calculate bubble radius for positioning
        const minSize = 12;
        const maxSize = 35;
        const sizeRange = maxSize - minSize;
        const percentageRange = 75 - 1;
        const bubbleRadius = minSize + (party.percentage - 1) * (sizeRange / percentageRange);
        
        // Position tooltip relative to compass container
        tooltip.style.position = 'absolute';
        tooltip.style.left = (x + bubbleRadius + 20) + 'px';
        tooltip.style.top = (y - 30) + 'px';
        tooltip.style.zIndex = '1000';
        tooltip.style.pointerEvents = 'none'; // Prevent tooltip from interfering with mouse events
        
        // Add tooltip to compass container instead of chart
        compassContainer.appendChild(tooltip);
        
        // Adjust position if tooltip would go off screen
        setTimeout(() => {
            const tooltipRect = tooltip.getBoundingClientRect();
            const containerRect = compassContainer.getBoundingClientRect();
            
            // Check if tooltip goes off the right edge
            if (tooltipRect.right > containerRect.right - 20) {
                tooltip.style.left = (x - bubbleRadius - 220) + 'px'; // Move to left side
            }
            
            // Check if tooltip goes off the bottom edge
            if (tooltipRect.bottom > containerRect.bottom - 20) {
                tooltip.style.top = (y - 120) + 'px'; // Move up
            }
            
            // Check if tooltip goes off the left edge
            if (tooltipRect.left < containerRect.left + 20) {
                tooltip.style.left = (x + bubbleRadius + 20) + 'px'; // Move back to right
            }
            
            // Check if tooltip goes off the top edge
            if (tooltipRect.top < containerRect.top + 20) {
                tooltip.style.top = (y + bubbleRadius + 20) + 'px'; // Move down
            }
        }, 0);
    }
    
    unhighlightParty() {
        const tooltip = document.querySelector('.compass-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
    
    advanceDay() {
        this.gameState.currentDay++;
        this.applyDailyBoosts();
        this.updateGameStats();
        this.autoSave(); // Auto-save when day advances
        
        // Check if player is in coalition for budget meeting on day 2
        if (this.gameState.currentDay === 2) {
            if (this.isPlayerInCoalition()) {
                this.showBudgetMeeting();
            } else {
                if (!this.gameState.budgetAllocationDone) {
                    this.automaticBudgetAllocation();
                } else {
                    this.showBudgetAlreadyAllocated();
                }
            }
        } else {
            // Show daily event
            this.showDailyEvent();
        }
    }
    
    applyDailyBoosts() {
        if (!this.gameState.ministers || this.gameState.ministers.length === 0) {
            return; // No ministers to apply boosts from
        }

        const boosts = this.calculateDailyBoosts();
        this.applyBoostsToStats(boosts);
        this.logDailyBoosts(boosts);
        
        // Store daily boosts for tracking
        this.gameState.lastDailyBoosts = boosts;
    }

    calculateDailyBoosts() {
        const boosts = {
            gdp: 0,
            unemployment: 0,
            inflation: 0,
            healthcare: 0,
            education: 0,
            environment: 0,
            crime: 0,
            happiness: 0
        };

        this.gameState.ministers.forEach(minister => {
            const department = minister.department.toLowerCase();
            const intelligence = minister.intelligence;
            const charisma = minister.charisma;
            const integrity = minister.integrity;

            // Economy Minister
            if (department === 'economy') {
                if (intelligence > 5) {
                    boosts.gdp += (intelligence - 5) * 0.01; // 0.01% per intelligence point above 5
                } else if (intelligence < 4) {
                    boosts.gdp -= (4 - intelligence) * 0.02; // Penalty for low intelligence
                }
                if (integrity < 3) {
                    boosts.gdp -= (3 - integrity) * 0.015; // Corruption hurts economy
                }
            }

            // Health Minister
            if (department === 'health') {
                if (intelligence > 5) {
                    boosts.healthcare += (intelligence - 5) * 0.02;
                } else if (intelligence < 4) {
                    boosts.healthcare -= (4 - intelligence) * 0.03; // Poor health management
                }
                if (charisma > 6) {
                    boosts.happiness += (charisma - 6) * 0.01;
                } else if (charisma < 3) {
                    boosts.happiness -= (3 - charisma) * 0.015; // Poor communication
                }
                if (integrity < 3) {
                    boosts.healthcare -= (3 - integrity) * 0.02; // Corruption in healthcare
                }
            }

            // Education Minister
            if (department === 'education') {
                if (intelligence > 5) {
                    boosts.education += (intelligence - 5) * 0.015;
                } else if (intelligence < 4) {
                    boosts.education -= (4 - intelligence) * 0.025; // Poor education policies
                }
                if (charisma > 6) {
                    boosts.happiness += (charisma - 6) * 0.008;
                } else if (charisma < 3) {
                    boosts.happiness -= (3 - charisma) * 0.012; // Poor teacher relations
                }
                if (integrity < 3) {
                    boosts.education -= (3 - integrity) * 0.02; // Corruption in education
                }
            }

            // Environment Minister
            if (department === 'environment') {
                if (integrity > 6) {
                    boosts.environment += (integrity - 6) * 0.02;
                } else if (integrity < 3) {
                    boosts.environment -= (3 - integrity) * 0.03; // Environmental corruption
                }
                if (intelligence > 5) {
                    boosts.environment += (intelligence - 5) * 0.01;
                } else if (intelligence < 4) {
                    boosts.environment -= (4 - intelligence) * 0.02; // Poor environmental policies
                }
            }

            // Justice Minister
            if (department === 'justice') {
                if (integrity > 6) {
                    boosts.crime -= (integrity - 6) * 0.015; // Negative = reduction in crime
                } else if (integrity < 3) {
                    boosts.crime += (3 - integrity) * 0.02; // Corruption increases crime
                }
                if (intelligence > 5) {
                    boosts.crime -= (intelligence - 5) * 0.01;
                } else if (intelligence < 4) {
                    boosts.crime += (4 - intelligence) * 0.015; // Poor justice system
                }
            }

            // Finance Minister
            if (department === 'finance') {
                if (intelligence > 6) {
                    boosts.inflation -= (intelligence - 6) * 0.01; // Better inflation control
                } else if (intelligence < 4) {
                    boosts.inflation += (4 - intelligence) * 0.015; // Poor financial management
                }
                if (integrity > 7) {
                    boosts.gdp += (integrity - 7) * 0.005; // Trust in economy
                } else if (integrity < 3) {
                    boosts.gdp -= (3 - integrity) * 0.02; // Financial corruption
                    boosts.inflation += (3 - integrity) * 0.01; // Economic instability
                }
            }

            // Defense Minister
            if (department === 'defense') {
                if (charisma > 6) {
                    boosts.happiness += (charisma - 6) * 0.005; // Security confidence
                } else if (charisma < 3) {
                    boosts.happiness -= (3 - charisma) * 0.008; // Poor security communication
                }
                if (intelligence < 4) {
                    boosts.happiness -= (4 - intelligence) * 0.005; // Poor defense planning
                }
            }

            // Infrastructure Minister
            if (department === 'infrastructure') {
                if (intelligence > 5) {
                    boosts.gdp += (intelligence - 5) * 0.008; // Better infrastructure = better economy
                } else if (intelligence < 4) {
                    boosts.gdp -= (4 - intelligence) * 0.012; // Poor infrastructure planning
                }
                if (integrity < 3) {
                    boosts.gdp -= (3 - integrity) * 0.01; // Infrastructure corruption
                }
            }

            // Interior Minister
            if (department === 'interior') {
                if (integrity > 6) {
                    boosts.crime -= (integrity - 6) * 0.01;
                } else if (integrity < 3) {
                    boosts.crime += (3 - integrity) * 0.015; // Interior corruption
                }
                if (charisma > 6) {
                    boosts.happiness += (charisma - 6) * 0.005;
                } else if (charisma < 3) {
                    boosts.happiness -= (3 - charisma) * 0.008; // Poor public relations
                }
            }

            // Foreign Affairs Minister
            if (department === 'foreign affairs') {
                if (charisma > 6) {
                    boosts.gdp += (charisma - 6) * 0.003; // Better international relations
                } else if (charisma < 3) {
                    boosts.gdp -= (3 - charisma) * 0.005; // Poor diplomatic relations
                }
                if (intelligence > 6) {
                    boosts.happiness += (intelligence - 6) * 0.005; // Diplomatic success
                } else if (intelligence < 4) {
                    boosts.happiness -= (4 - intelligence) * 0.008; // Diplomatic failures
                }
            }
        });

        return boosts;
    }

    applyBoostsToStats(boosts) {
        if (!this.gameState.statistics) return;

        // Apply GDP boost
        if (boosts.gdp !== 0) {
            this.gameState.statistics.gdp *= (1 + boosts.gdp / 100);
        }

        // Apply unemployment boost (negative = reduction)
        if (boosts.unemployment !== 0) {
            this.gameState.statistics.unemployment.rate = Math.max(0, 
                this.gameState.statistics.unemployment.rate + boosts.unemployment);
        }

        // Apply inflation boost (negative = reduction)
        if (boosts.inflation !== 0) {
            this.gameState.statistics.inflation = Math.max(0, 
                this.gameState.statistics.inflation + boosts.inflation);
        }

        // Apply healthcare boost
        if (boosts.healthcare !== 0) {
            this.gameState.statistics.accessToHealthcare = Math.min(100, 
                this.gameState.statistics.accessToHealthcare + boosts.healthcare);
            this.gameState.statistics.healthcareIndex = Math.min(1, 
                this.gameState.statistics.healthcareIndex + (boosts.healthcare / 100));
        }

        // Apply education boost
        if (boosts.education !== 0) {
            this.gameState.statistics.educationLevel = Math.min(100, 
                this.gameState.statistics.educationLevel + boosts.education);
        }

        // Apply environment boost
        if (boosts.environment !== 0) {
            this.gameState.statistics.environmentalQuality = Math.min(100, 
                this.gameState.statistics.environmentalQuality + boosts.environment);
            this.gameState.statistics.environmentIndex = Math.min(1, 
                this.gameState.statistics.environmentIndex + (boosts.environment / 100));
        }

        // Apply crime boost (negative = reduction)
        if (boosts.crime !== 0) {
            this.gameState.statistics.crimeRate = Math.max(0, 
                this.gameState.statistics.crimeRate + boosts.crime);
        }

        // Apply happiness boost
        if (boosts.happiness !== 0) {
            this.gameState.statistics.happiness = Math.min(100, 
                this.gameState.statistics.happiness + boosts.happiness);
            this.gameState.statistics.happinessIndex = Math.min(1, 
                this.gameState.statistics.happinessIndex + (boosts.happiness / 100));
        }
    }

    logDailyBoosts(boosts) {
        console.log("=== Daily Minister Boosts ===");
        Object.entries(boosts).forEach(([stat, boost]) => {
            if (boost !== 0) {
                const sign = boost > 0 ? "+" : "";
                console.log(`${stat}: ${sign}${boost.toFixed(3)}%`);
            }
        });
        console.log("=============================");
    }

    calculateMinisterDailyBoost(minister) {
        const department = minister.department.toLowerCase();
        const intelligence = minister.intelligence;
        const charisma = minister.charisma;
        const integrity = minister.integrity;
        const boosts = [];

        // Economy Minister
        if (department === 'economy') {
            if (intelligence > 5) {
                boosts.push(`GDP +${((intelligence - 5) * 0.01).toFixed(2)}%`);
            } else if (intelligence < 4) {
                boosts.push(`GDP -${((4 - intelligence) * 0.02).toFixed(2)}%`);
            }
            if (integrity < 3) {
                boosts.push(`GDP -${((3 - integrity) * 0.015).toFixed(2)}%`);
            }
        }

        // Health Minister
        if (department === 'health') {
            if (intelligence > 5) {
                boosts.push(`Health +${((intelligence - 5) * 0.02).toFixed(2)}%`);
            } else if (intelligence < 4) {
                boosts.push(`Health -${((4 - intelligence) * 0.03).toFixed(2)}%`);
            }
            if (charisma > 6) {
                boosts.push(`Happiness +${((charisma - 6) * 0.01).toFixed(2)}%`);
            } else if (charisma < 3) {
                boosts.push(`Happiness -${((3 - charisma) * 0.015).toFixed(2)}%`);
            }
            if (integrity < 3) {
                boosts.push(`Health -${((3 - integrity) * 0.02).toFixed(2)}%`);
            }
        }

        // Education Minister
        if (department === 'education') {
            if (intelligence > 5) {
                boosts.push(`Education +${((intelligence - 5) * 0.015).toFixed(2)}%`);
            } else if (intelligence < 4) {
                boosts.push(`Education -${((4 - intelligence) * 0.025).toFixed(2)}%`);
            }
            if (charisma > 6) {
                boosts.push(`Happiness +${((charisma - 6) * 0.008).toFixed(2)}%`);
            } else if (charisma < 3) {
                boosts.push(`Happiness -${((3 - charisma) * 0.012).toFixed(2)}%`);
            }
            if (integrity < 3) {
                boosts.push(`Education -${((3 - integrity) * 0.02).toFixed(2)}%`);
            }
        }

        // Environment Minister
        if (department === 'environment') {
            if (integrity > 6) {
                boosts.push(`Environment +${((integrity - 6) * 0.02).toFixed(2)}%`);
            } else if (integrity < 3) {
                boosts.push(`Environment -${((3 - integrity) * 0.03).toFixed(2)}%`);
            }
            if (intelligence > 5) {
                boosts.push(`Environment +${((intelligence - 5) * 0.01).toFixed(2)}%`);
            } else if (intelligence < 4) {
                boosts.push(`Environment -${((4 - intelligence) * 0.02).toFixed(2)}%`);
            }
        }

        // Justice Minister
        if (department === 'justice') {
            if (integrity > 6) {
                boosts.push(`Crime -${((integrity - 6) * 0.015).toFixed(2)}%`);
            } else if (integrity < 3) {
                boosts.push(`Crime +${((3 - integrity) * 0.02).toFixed(2)}%`);
            }
            if (intelligence > 5) {
                boosts.push(`Crime -${((intelligence - 5) * 0.01).toFixed(2)}%`);
            } else if (intelligence < 4) {
                boosts.push(`Crime +${((4 - intelligence) * 0.015).toFixed(2)}%`);
            }
        }

        // Finance Minister
        if (department === 'finance') {
            if (intelligence > 6) {
                boosts.push(`Inflation -${((intelligence - 6) * 0.01).toFixed(2)}%`);
            } else if (intelligence < 4) {
                boosts.push(`Inflation +${((4 - intelligence) * 0.015).toFixed(2)}%`);
            }
            if (integrity > 7) {
                boosts.push(`GDP +${((integrity - 7) * 0.005).toFixed(2)}%`);
            } else if (integrity < 3) {
                boosts.push(`GDP -${((3 - integrity) * 0.02).toFixed(2)}%`);
                boosts.push(`Inflation +${((3 - integrity) * 0.01).toFixed(2)}%`);
            }
        }

        // Defense Minister
        if (department === 'defense') {
            if (charisma > 6) {
                boosts.push(`Happiness +${((charisma - 6) * 0.005).toFixed(2)}%`);
            } else if (charisma < 3) {
                boosts.push(`Happiness -${((3 - charisma) * 0.008).toFixed(2)}%`);
            }
            if (intelligence < 4) {
                boosts.push(`Happiness -${((4 - intelligence) * 0.005).toFixed(2)}%`);
            }
        }

        // Infrastructure Minister
        if (department === 'infrastructure') {
            if (intelligence > 5) {
                boosts.push(`GDP +${((intelligence - 5) * 0.008).toFixed(2)}%`);
            } else if (intelligence < 4) {
                boosts.push(`GDP -${((4 - intelligence) * 0.012).toFixed(2)}%`);
            }
            if (integrity < 3) {
                boosts.push(`GDP -${((3 - integrity) * 0.01).toFixed(2)}%`);
            }
        }

        // Interior Minister
        if (department === 'interior') {
            if (integrity > 6) {
                boosts.push(`Crime -${((integrity - 6) * 0.01).toFixed(2)}%`);
            } else if (integrity < 3) {
                boosts.push(`Crime +${((3 - integrity) * 0.015).toFixed(2)}%`);
            }
            if (charisma > 6) {
                boosts.push(`Happiness +${((charisma - 6) * 0.005).toFixed(2)}%`);
            } else if (charisma < 3) {
                boosts.push(`Happiness -${((3 - charisma) * 0.008).toFixed(2)}%`);
            }
        }

        // Foreign Affairs Minister
        if (department === 'foreign affairs') {
            if (charisma > 6) {
                boosts.push(`GDP +${((charisma - 6) * 0.003).toFixed(2)}%`);
            } else if (charisma < 3) {
                boosts.push(`GDP -${((3 - charisma) * 0.005).toFixed(2)}%`);
            }
            if (intelligence > 6) {
                boosts.push(`Happiness +${((intelligence - 6) * 0.005).toFixed(2)}%`);
            } else if (intelligence < 4) {
                boosts.push(`Happiness -${((4 - intelligence) * 0.008).toFixed(2)}%`);
            }
        }

        return boosts.length > 0 ? boosts.join(', ') : null;
    }

    getBoostType(boostText) {
        if (!boostText) return '';
        
        const hasPositive = boostText.includes('+');
        const hasNegative = boostText.includes('-');
        
        if (hasPositive && hasNegative) {
            return 'mixed';
        } else if (hasNegative) {
            return 'negative';
        } else {
            return ''; // positive (default green)
        }
    }

    isPlayerInCoalition() {
        const playerParty = this.gameState.allParties.find(party => party.name === this.gameState.partyName);
        return playerParty ? playerParty.inCoalition : false;
    }
    
    showBudgetMeeting() {
        this.displayBudgetSubjects();
        this.updateBudgetRules();
        this.showScreen('budgetScreen');
    }
    
    displayBudgetSubjects() {
        const budgetSubjects = document.getElementById('budgetSubjects');
        budgetSubjects.innerHTML = '';
        
        // Icon mapping for each budget subject
        const iconMap = {
            'Healthcare': { icon: 'fas fa-heartbeat', class: 'healthcare' },
            'Education': { icon: 'fas fa-graduation-cap', class: 'education' },
            'Defense': { icon: 'fas fa-shield-alt', class: 'defense' },
            'Infrastructure': { icon: 'fas fa-road', class: 'infrastructure' },
            'Social Welfare': { icon: 'fas fa-hands-helping', class: 'social-welfare' },
            'Environment': { icon: 'fas fa-leaf', class: 'environment' },
            'Research & Development': { icon: 'fas fa-flask', class: 'research' },
            'Law Enforcement': { icon: 'fas fa-gavel', class: 'law-enforcement' },
            'Foreign Aid': { icon: 'fas fa-globe-americas', class: 'foreign-aid' },
            'Culture & Arts': { icon: 'fas fa-palette', class: 'culture' }
        };
        
        this.gameState.budgetSubjects.forEach((subject, index) => {
            const subjectCard = document.createElement('div');
            subjectCard.className = 'budget-subject';
            
            const iconInfo = iconMap[subject.name] || { icon: 'fas fa-circle', class: 'default' };
            
            subjectCard.innerHTML = `
                <div class="budget-subject-header">
                    <div class="budget-subject-icon ${iconInfo.class}">
                        <i class="${iconInfo.icon}"></i>
                    </div>
                    <div class="budget-subject-info">
                        <h4>${subject.name}</h4>
                        <p>${subject.description}</p>
                    </div>
                </div>
                <div class="budget-subject-controls">
                    <div class="budget-percentage-display">
                        <div class="budget-percentage">${subject.currentSpending}%</div>
                        <div class="budget-percentage-label">Allocation</div>
                    </div>
                    <div class="budget-controls">
                        <button class="budget-btn decrease" onclick="game.adjustBudget(${index}, -5)" 
                                ${subject.currentSpending <= 0 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <button class="budget-btn increase" onclick="game.adjustBudget(${index}, 5)" 
                                ${subject.currentSpending >= 100 ? 'disabled' : ''}>
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            `;
            
            budgetSubjects.appendChild(subjectCard);
        });
        
        this.updateBudgetTotal();
        this.updateBudgetSummary();
    }
    
    updateBudgetRules() {
        const budgetRules = document.getElementById('budgetRules');
        if (this.canExceedBudget()) {
            budgetRules.innerHTML = '<strong>Left-wing coalition:</strong> Allows deficit spending (budget can exceed 100%).';
        } else {
            budgetRules.innerHTML = '<strong>Right-wing coalition:</strong> Requires balanced budget (total must be 100%).';
        }
    }
    
    canExceedBudget() {
        return this.isCoalitionLeftWing();
    }
    
    adjustBudget(subjectIndex, amount) {
        const subject = this.gameState.budgetSubjects[subjectIndex];
        const newSpending = subject.currentSpending + amount;
        
        if (newSpending < 0 || newSpending > 100) {
            return;
        }
        
        if (this.canExceedBudget()) {
            // Left-wing coalition can adjust freely
            subject.currentSpending = newSpending;
        } else {
            // Right-wing coalition must balance budget
            if (amount > 0) {
                // Increase: decrease another subject
                if (this.decreaseOtherSubject(subjectIndex, amount)) {
                    subject.currentSpending = newSpending;
                } else {
                    return; // Can't balance
                }
            } else {
                // Decrease: increase another subject
                if (this.increaseOtherSubject(subjectIndex, -amount)) {
                    subject.currentSpending = newSpending;
                } else {
                    return; // Can't balance
                }
            }
        }
        
        this.calculateTaxRate();
        this.updateGameStats();
        this.displayBudgetSubjects();
        this.autoSave(); // Auto-save when budget is adjusted
    }
    
    decreaseOtherSubject(excludeIndex, amount) {
        for (let i = 0; i < this.gameState.budgetSubjects.length; i++) {
            if (i !== excludeIndex && this.gameState.budgetSubjects[i].currentSpending >= amount) {
                this.gameState.budgetSubjects[i].currentSpending -= amount;
                return true;
            }
        }
        return false;
    }
    
    increaseOtherSubject(excludeIndex, amount) {
        for (let i = 0; i < this.gameState.budgetSubjects.length; i++) {
            if (i !== excludeIndex && this.gameState.budgetSubjects[i].currentSpending < 100) {
                this.gameState.budgetSubjects[i].currentSpending += amount;
                return true;
            }
        }
        return false;
    }
    
    updateBudgetTotal() {
        const total = this.getTotalBudget();
        document.getElementById('totalBudget').textContent = total + '%';
        
        // Update budget status
        const statusElement = document.getElementById('budgetStatus');
        if (total === 100) {
            statusElement.textContent = 'Balanced';
            statusElement.style.color = '#48bb78';
        } else if (total > 100) {
            statusElement.textContent = 'Deficit';
            statusElement.style.color = '#e53e3e';
        } else {
            statusElement.textContent = 'Surplus';
            statusElement.style.color = '#38b2ac';
        }
    }
    
    updateBudgetSummary() {
        const subjectsCount = this.gameState.budgetSubjects.length;
        const averageSpending = Math.round(this.getTotalBudget() / subjectsCount);
        
        document.getElementById('subjectsCount').textContent = subjectsCount;
        document.getElementById('averageSpending').textContent = averageSpending;
        
        this.updateBudgetTips();
    }
    
    updateBudgetTips() {
        const tipsElement = document.getElementById('budgetTips');
        const tips = [];
        
        const total = this.getTotalBudget();
        const isLeftWing = this.canExceedBudget();
        
        if (isLeftWing) {
            tips.push('Left-wing coalitions can run budget deficits to fund social programs');
            tips.push('Consider increasing spending on healthcare, education, and social welfare');
        } else {
            tips.push('Right-wing coalitions must maintain a balanced budget (100%)');
            tips.push('Focus on efficiency and reducing unnecessary spending');
        }
        
        if (total > 100) {
            tips.push('Current budget exceeds 100% - this creates a deficit');
        } else if (total < 100) {
            tips.push('Current budget is below 100% - consider investing in key sectors');
        }
        
        // Add sector-specific tips
        const healthcare = this.gameState.budgetSubjects.find(s => s.name === 'Healthcare');
        const education = this.gameState.budgetSubjects.find(s => s.name === 'Education');
        const defense = this.gameState.budgetSubjects.find(s => s.name === 'Defense');
        
        if (healthcare && healthcare.currentSpending < 20) {
            tips.push('Healthcare spending is relatively low - consider increasing for better public health');
        }
        
        if (education && education.currentSpending < 15) {
            tips.push('Education investment is crucial for long-term economic growth');
        }
        
        if (defense && defense.currentSpending > 25) {
            tips.push('High defense spending may impact other important sectors');
        }
        
        tipsElement.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
    }
    
    finalizeBudget() {
        const total = this.getTotalBudget();
        
        if (this.canExceedBudget()) {
            // Left-wing coalition can have deficit spending
            if (total > 100) {
                alert(`Budget finalized with deficit spending! Total: ${total}%\nDeficit: ${total - 100}%`);
            } else {
                alert(`Budget finalized! Total: ${total}%`);
            }
        } else {
            // Right-wing coalition requires balanced budget
            if (total === 100) {
                alert(`Budget finalized! Total: ${total}%`);
            } else {
                alert(`Error: Right-wing coalition requires balanced budget (100%). Current total: ${total}%`);
                return;
            }
        }
        
        this.gameState.currentDay = 2;
        this.updateGameStats();
        this.autoSave(); // Auto-save when budget is finalized
        this.showCoalitionSecurity();
    }
    
    resetBudget() {
        this.gameState.budgetSubjects.forEach(subject => {
            subject.currentSpending = subject.baseSpending;
        });
        this.calculateTaxRate();
        this.updateGameStats();
        this.displayBudgetSubjects();
    }
    
    automaticBudgetAllocation() {
        // Store original budget for comparison
        const originalBudget = this.gameState.budgetSubjects.map(subject => subject.currentSpending);
        
        const isLeftWing = this.isCoalitionLeftWing();
        const isConservative = this.isCoalitionConservative();
        
        // Store changes for UI display
        this.budgetChanges = {
            economic: [],
            social: [],
            isLeftWing: isLeftWing,
            isConservative: isConservative
        };
        
        // Apply budget changes based on coalition type
        if (isLeftWing) {
            this.gameState.budgetSubjects.forEach(subject => {
                if (['Healthcare', 'Education', 'Social Welfare', 'Environment'].includes(subject.name)) {
                    const oldSpending = subject.currentSpending;
                    subject.currentSpending = Math.min(100, subject.currentSpending + 5);
                    this.budgetChanges.economic.push({
                        subject: subject.name,
                        change: 5,
                        oldValue: oldSpending,
                        newValue: subject.currentSpending,
                        type: 'increase'
                    });
                }
            });
        } else {
            this.gameState.budgetSubjects.forEach(subject => {
                if (['Social Welfare', 'Environment', 'Foreign Aid', 'Research & Development'].includes(subject.name)) {
                    const oldSpending = subject.currentSpending;
                    subject.currentSpending = Math.max(0, subject.currentSpending - 5);
                    this.budgetChanges.economic.push({
                        subject: subject.name,
                        change: -5,
                        oldValue: oldSpending,
                        newValue: subject.currentSpending,
                        type: 'decrease'
                    });
                }
            });
        }
        
        // Apply social ideology preferences
        if (isConservative) {
            this.gameState.budgetSubjects.forEach(subject => {
                if (subject.name === 'Defense') {
                    const oldSpending = subject.currentSpending;
                    subject.currentSpending = Math.min(100, subject.currentSpending + 3);
                    this.budgetChanges.social.push({
                        subject: subject.name,
                        change: 3,
                        oldValue: oldSpending,
                        newValue: subject.currentSpending,
                        type: 'increase'
                    });
                } else if (subject.name === 'Culture & Arts') {
                    const oldSpending = subject.currentSpending;
                    subject.currentSpending = Math.min(100, subject.currentSpending + 2);
                    this.budgetChanges.social.push({
                        subject: subject.name,
                        change: 2,
                        oldValue: oldSpending,
                        newValue: subject.currentSpending,
                        type: 'increase'
                    });
                }
            });
        } else {
            this.gameState.budgetSubjects.forEach(subject => {
                if (['Education', 'Healthcare'].includes(subject.name)) {
                    const oldSpending = subject.currentSpending;
                    subject.currentSpending = Math.min(100, subject.currentSpending + 3);
                    this.budgetChanges.social.push({
                        subject: subject.name,
                        change: 3,
                        oldValue: oldSpending,
                        newValue: subject.currentSpending,
                        type: 'increase'
                    });
                } else if (subject.name === 'Research & Development') {
                    const oldSpending = subject.currentSpending;
                    subject.currentSpending = Math.min(100, subject.currentSpending + 2);
                    this.budgetChanges.social.push({
                        subject: subject.name,
                        change: 2,
                        oldValue: oldSpending,
                        newValue: subject.currentSpending,
                        type: 'increase'
                    });
                }
            });
        }
        
        this.calculateTaxRate();
        this.updateGameStats();
        
        // Show the automatic budget UI
        this.showAutomaticBudgetUI();
    }
    
    showAutomaticBudgetUI() {
        // Update coalition analysis
        document.getElementById('economicPolicy').textContent = this.budgetChanges.isLeftWing ? 'Left-wing' : 'Right-wing';
        document.getElementById('socialPolicy').textContent = this.budgetChanges.isConservative ? 'Conservative' : 'Progressive';
        
        // Update economic changes
        const economicChanges = document.getElementById('economicChanges');
        economicChanges.innerHTML = '';
        
        if (this.budgetChanges.economic.length === 0) {
            economicChanges.innerHTML = '<div class="change-item neutral"><span class="change-subject">No economic changes</span></div>';
        } else {
            this.budgetChanges.economic.forEach(change => {
                const changeItem = document.createElement('div');
                changeItem.className = `change-item ${change.type}`;
                changeItem.innerHTML = `
                    <span class="change-subject">${change.subject}</span>
                    <div class="change-details">
                        <span class="change-amount ${change.change > 0 ? 'positive' : 'negative'}">${change.change > 0 ? '+' : ''}${change.change}%</span>
                        <span class="change-new">→ ${change.newValue}%</span>
                    </div>
                `;
                economicChanges.appendChild(changeItem);
            });
        }
        
        // Update social changes
        const socialChanges = document.getElementById('socialChanges');
        socialChanges.innerHTML = '';
        
        if (this.budgetChanges.social.length === 0) {
            socialChanges.innerHTML = '<div class="change-item neutral"><span class="change-subject">No social changes</span></div>';
        } else {
            this.budgetChanges.social.forEach(change => {
                const changeItem = document.createElement('div');
                changeItem.className = `change-item ${change.type}`;
                changeItem.innerHTML = `
                    <span class="change-subject">${change.subject}</span>
                    <div class="change-details">
                        <span class="change-amount ${change.change > 0 ? 'positive' : 'negative'}">${change.change > 0 ? '+' : ''}${change.change}%</span>
                        <span class="change-new">→ ${change.newValue}%</span>
                    </div>
                `;
                socialChanges.appendChild(changeItem);
            });
        }
        
        // Update budget summary
        document.getElementById('newTotalBudget').textContent = this.getTotalBudget() + '%';
        document.getElementById('newTaxRate').textContent = this.gameState.taxRate.toFixed(1) + '%';
        
        // Show the screen
        this.showScreen('automaticBudgetScreen');
    }
    
    proceedAfterAutomaticBudget() {
        this.gameState.budgetAllocationDone = true;
        this.gameState.currentDay = 2;
        this.updateGameStats();
        this.showCoalitionSecurity();
    }
    
    isCoalitionConservative() {
        if (this.gameState.allParties.length === 0) return false;
        
        let totalCoalitionSocialValue = 0;
        let totalCoalitionPercentage = 0;
        
        this.gameState.allParties.forEach(party => {
            if (party.inCoalition) {
                totalCoalitionSocialValue += party.socialValue * party.percentage;
                totalCoalitionPercentage += party.percentage;
            }
        });
        
        if (totalCoalitionPercentage === 0) return false;
        
        const averageSocialValue = totalCoalitionSocialValue / totalCoalitionPercentage;
        return averageSocialValue >= 6.0;
    }
    
    showBudgetAlreadyAllocated() {
        alert(`The budget has already been automatically allocated based on the current coalition's ideology.\n\nCurrent Total Budget: ${this.getTotalBudget()}%\nCurrent Tax Rate: ${this.gameState.taxRate.toFixed(1)}%`);
    }
    
    showDailyEvent() {
        // Select a random event
        this.selectRandomEvent();
        
        // Update event day
        document.getElementById('eventDay').textContent = this.gameState.currentDay;
        
        // Display the selected event
        this.displayCurrentEvent();
        
        // Show the event screen
        this.showScreen('eventScreen');
    }
    
    selectRandomEvent() {
        const eventIds = Object.keys(this.eventDefinitions);
        const randomIndex = Math.floor(Math.random() * eventIds.length);
        const selectedEventId = eventIds[randomIndex];
        this.currentEvent = this.eventDefinitions[selectedEventId];
    }
    
    displayCurrentEvent() {
        if (!this.currentEvent) return;
        
        // Update event title and description
        document.getElementById('eventTitle').textContent = this.currentEvent.title;
        document.getElementById('eventDescription').textContent = this.currentEvent.description;
        
        // Clear existing options
        const optionsGrid = document.querySelector('.options-grid');
        optionsGrid.innerHTML = '';
        
        // Generate option cards dynamically
        Object.entries(this.currentEvent.options).forEach(([optionId, option]) => {
            const optionCard = document.createElement('div');
            optionCard.className = 'option-card';
            optionCard.onclick = () => this.selectEventOption(optionId);
            
            optionCard.innerHTML = `
                <div class="option-icon ${optionId}">
                    <i class="${option.icon}"></i>
                </div>
                <div class="option-content">
                    <h5>${option.title}</h5>
                    <p>${option.description}</p>
                    <div class="option-effects">
                        ${option.messages.map(msg => `<span class="effect">${msg}</span>`).join('')}
                    </div>
                </div>
            `;
            
            optionsGrid.appendChild(optionCard);
        });
    }
    
    
    processEventChoice(optionType) {
        if (!this.currentEvent) return;
        
        // Apply statistical effects based on the chosen solution
        this.applyEventEffects(optionType);
        
        const selectedOption = this.currentEvent.options[optionType];
        const message = `${selectedOption.title} chosen`;
        const effects = selectedOption.messages;
        
        // Store the choice for potential future effects
        if (!this.gameState.eventChoices) {
            this.gameState.eventChoices = [];
        }
        this.gameState.eventChoices.push({
            day: this.gameState.currentDay,
            event: this.currentEvent.title,
            choice: optionType,
            message: message,
            effects: effects
        });
        
        // For now, just continue to voting results screen
        // Later: could show results screen with effects
    }
    
    applyEventEffects(optionType) {
        if (!this.currentEvent || !this.currentEvent.options[optionType]) return;
        // Apply effects to current statistics
        if (!this.gameState.statistics) {
            this.gameState.statistics = this.generateStatistics();
        }
        
        const stats = this.gameState.statistics;
        const population = stats.population;
        
        // Store original values for comparison
        const originalStats = {
            gdp: stats.gdp,
            gdpPerCapita: stats.gdpPerCapita,
            wealthInequality: stats.wealthInequality,
            homelessness: {
                rate: stats.homelessness.rate,
                count: stats.homelessness.count
            },
            unemployment: {
                rate: stats.unemployment.rate,
                count: stats.unemployment.count
            },
            immigration: {
                rate: stats.immigration.rate,
                count: stats.immigration.count
            },
            accessToHealthcare: stats.accessToHealthcare,
            healthcareIndex: stats.healthcareIndex,
            happiness: stats.happiness,
            happinessIndex: stats.happinessIndex,
            environmentalQuality: stats.environmentalQuality,
            environmentIndex: stats.environmentIndex
        };
        
        const option = this.currentEvent.options[optionType];
        
        // Apply effects based on the option's effect definitions
        const appliedEffects = {};
        
        Object.entries(option.effects).forEach(([effectType, range]) => {
            if (effectType === 'availableJobsSectors') {
                // Handle sector-specific effects
                Object.entries(range).forEach(([sector, sectorRange]) => {
                    const randomValue = sectorRange.min + (Math.random() * (sectorRange.max - sectorRange.min));
                    appliedEffects[`${effectType}_${sector}`] = randomValue;
                    
                    // Apply sector effect
                    if (stats.availableJobs.sectors[sector]) {
                        stats.availableJobs.sectors[sector] *= (1 + randomValue);
                    }
                });
            } else if (effectType === 'unemploymentBreakdown') {
                // Handle unemployment breakdown effects
                Object.entries(range).forEach(([breakdownType, breakdownRange]) => {
                    const randomValue = breakdownRange.min + (Math.random() * (breakdownRange.max - breakdownRange.min));
                    appliedEffects[`${effectType}_${breakdownType}`] = randomValue;
                    
                    // Apply breakdown effect
                    if (stats.unemployment.breakdown[breakdownType]) {
                        stats.unemployment.breakdown[breakdownType] *= (1 + randomValue);
                    }
                });
            } else {
                // Handle regular effects
                const randomValue = range.min + (Math.random() * (range.max - range.min));
                appliedEffects[effectType] = randomValue;
                
                // Apply the effect to the corresponding statistic
                switch(effectType) {
                    case 'gdpChange':
                        stats.gdp *= (1 + randomValue);
                        stats.gdpPerCapita = (stats.gdp * 1000000000) / population;
                        break;
                    case 'wealthInequalityChange':
                        stats.wealthInequality *= (1 + randomValue);
                        break;
                    case 'homelessnessChange':
                        stats.homelessness.rate *= (1 + randomValue);
                        stats.homelessness.count = Math.round((stats.homelessness.rate / 100) * population);
                        break;
                    case 'unemploymentChange':
                        stats.unemployment.rate *= (1 + randomValue);
                        stats.unemployment.count = Math.round((stats.unemployment.rate / 100) * population);
                        break;
                    case 'accessToHealthcareChange':
                        stats.accessToHealthcare *= (1 + randomValue);
                        break;
                    case 'healthcareIndexChange':
                        stats.healthcareIndex *= (1 + randomValue);
                        break;
                    case 'immigrationChange':
                        stats.immigration.rate *= (1 + randomValue);
                        stats.immigration.count = Math.round((stats.immigration.rate / 100) * population);
                        break;
                    case 'happinessChange':
                        stats.happiness *= (1 + randomValue);
                        stats.happinessIndex *= (1 + randomValue);
                        break;
                    case 'environmentalQualityChange':
                        stats.environmentalQuality *= (1 + randomValue);
                        stats.environmentIndex *= (1 + randomValue);
                        break;
                }
            }
        });
        
        // Normalize sector percentages to sum to 100%
        if (stats.availableJobs.sectors) {
            const totalSectors = Object.values(stats.availableJobs.sectors).reduce((sum, val) => sum + val, 0);
            Object.keys(stats.availableJobs.sectors).forEach(key => {
                stats.availableJobs.sectors[key] = (stats.availableJobs.sectors[key] / totalSectors) * 100;
            });
        }
        
        // Normalize unemployment breakdown percentages to sum to 100%
        if (stats.unemployment.breakdown) {
            const totalBreakdown = Object.values(stats.unemployment.breakdown).reduce((sum, val) => sum + val, 0);
            Object.keys(stats.unemployment.breakdown).forEach(key => {
                stats.unemployment.breakdown[key] = (stats.unemployment.breakdown[key] / totalBreakdown) * 100;
            });
        }
        
        // Store the effects for display
        this.gameState.lastEventEffects = {
            optionType: optionType,
            originalStats: originalStats,
            coalitionSupport: 0, // Will be set by displayVotingResults
            newStats: {
                gdp: stats.gdp,
                gdpPerCapita: stats.gdpPerCapita,
                wealthInequality: stats.wealthInequality,
                homelessness: {
                    rate: stats.homelessness.rate,
                    count: stats.homelessness.count
                },
                unemployment: {
                    rate: stats.unemployment.rate,
                    count: stats.unemployment.count
                },
                immigration: {
                    rate: stats.immigration.rate,
                    count: stats.immigration.count
                },
                accessToHealthcare: stats.accessToHealthcare,
                healthcareIndex: stats.healthcareIndex
            },
            effects: appliedEffects
        };
        
        // Update current year values in history
        this.updateCurrentYearInHistory();
        
        // Update the statistics display if we're currently viewing statistics
        if (document.getElementById('statisticsScreen').style.display !== 'none') {
            this.displayStatistics();
        }
    }
    
    generateVariableEffects(optionType) {
        // Generate variable effects within realistic ranges (much more subtle)
        switch(optionType) {
            case 'conservative-right': // Market Solutions
                return {
                    gdpChange: Math.random() * 0.03 + 0.02, // 2-5% increase
                    wealthInequalityChange: Math.random() * 0.04 + 0.03, // 3-7% increase
                    homelessnessChange: Math.random() * 0.02, // 0-2% increase
                    unemploymentChange: Math.random() * 0.01 - 0.005 // -0.5% to +0.5% (mostly stable)
                };
                
            case 'conservative-left': // Public Housing
                return {
                    gdpChange: -(Math.random() * 0.03 + 0.02), // 2-5% decrease
                    wealthInequalityChange: Math.random() * 0.01 - 0.005, // -0.5% to +0.5% (mostly stable)
                    homelessnessChange: -(Math.random() * 0.08 + 0.05), // 5-13% decrease
                    unemploymentChange: Math.random() * 0.02 + 0.01 // 1-3% increase
                };
                
            case 'progressive-right': // Innovation & Incentives
                return {
                    gdpChange: -(Math.random() * 0.02 + 0.01), // 1-3% decrease
                    wealthInequalityChange: Math.random() * 0.01 - 0.005, // -0.5% to +0.5% (mostly stable)
                    homelessnessChange: -(Math.random() * 0.04 + 0.02), // 2-6% decrease
                    unemploymentChange: -(Math.random() * 0.04 + 0.03) // 3-7% decrease
                };
                
            case 'progressive-left': // Community Solutions
                return {
                    gdpChange: Math.random() * 0.005 - 0.0025, // -0.25% to +0.25% (minimal)
                    wealthInequalityChange: Math.random() * 0.005 - 0.0025, // -0.25% to +0.25% (minimal)
                    homelessnessChange: -(Math.random() * 0.02 + 0.01), // 1-3% decrease
                    unemploymentChange: -(Math.random() * 0.01 + 0.005) // 0.5-1.5% decrease
                };
                
            default:
                return {
                    gdpChange: 0,
                    wealthInequalityChange: 0,
                    homelessnessChange: 0,
                    unemploymentChange: 0
                };
        }
    }
    
    updateCurrentYearInHistory() {
        if (!this.gameState.statisticsHistory || !this.gameState.lastEventEffects) {
            return;
        }
        
        const stats = this.gameState.statistics;
        const population = stats.population;
        
        // Check if Year 6 already exists
        const year6Index = this.gameState.statisticsHistory.findIndex(h => h.timePoint === 'Year 6');
        
        if (year6Index !== -1) {
            // Year 6 exists, update its values
            this.gameState.statisticsHistory[year6Index] = {
                timePoint: 'Year 6',
                population: population,
                homelessness: {
                    rate: stats.homelessness.rate,
                    count: stats.homelessness.count,
                    breakdown: stats.homelessness.breakdown
                },
                immigration: {
                    rate: stats.immigration.rate,
                    count: stats.immigration.count
                },
                wealthInequality: stats.wealthInequality,
                unemployment: {
                    rate: stats.unemployment.rate,
                    count: stats.unemployment.count
                },
                availableJobs: {
                    rate: stats.availableJobs.rate,
                    count: stats.availableJobs.count
                },
                gdp: stats.gdp,
                gdpPerCapita: stats.gdpPerCapita,
                education: stats.education,
                accessToHealthcare: stats.accessToHealthcare,
                healthcareIndex: stats.healthcareIndex,
                happiness: stats.happiness,
                happinessIndex: stats.happinessIndex,
                environmentalQuality: stats.environmentalQuality,
                environmentIndex: stats.environmentIndex
            };
        } else {
            // Year 6 doesn't exist, create it (first decision)
            const year6Data = {
                timePoint: 'Year 6',
                population: population,
                homelessness: {
                    rate: stats.homelessness.rate,
                    count: stats.homelessness.count,
                    breakdown: stats.homelessness.breakdown
                },
                immigration: {
                    rate: stats.immigration.rate,
                    count: stats.immigration.count
                },
                wealthInequality: stats.wealthInequality,
                unemployment: {
                    rate: stats.unemployment.rate,
                    count: stats.unemployment.count
                },
                availableJobs: {
                    rate: stats.availableJobs.rate,
                    count: stats.availableJobs.count
                },
                gdp: stats.gdp,
                gdpPerCapita: stats.gdpPerCapita,
                education: stats.education,
                accessToHealthcare: stats.accessToHealthcare,
                healthcareIndex: stats.healthcareIndex,
                happiness: stats.happiness,
                happinessIndex: stats.happinessIndex,
                environmentalQuality: stats.environmentalQuality,
                environmentIndex: stats.environmentIndex
            };
            
            // Add Year 6 to the history
            this.gameState.statisticsHistory.push(year6Data);
        }

        // Generate news for notable stat trends (>|= 5% YoY change)
        try {
            const year5 = this.gameState.statisticsHistory.find(h => h.timePoint === 'Year 5');
            const year6 = this.gameState.statisticsHistory.find(h => h.timePoint === 'Year 6');
            if (year5 && year6) {
                const entries = [
                    { key: 'gdp', label: 'GDP', formatter: v => `$${v.toFixed(0)}B` },
                    { key: 'gdpPerCapita', label: 'GDP per Capita', formatter: v => `$${Math.round(v).toLocaleString()}` },
                    { key: 'wealthInequality', label: 'Wealth Inequality', formatter: v => v.toFixed(1) + ':1' },
                    { key: 'accessToHealthcare', label: 'Access to Healthcare', formatter: v => v.toFixed(1) + '%' },
                    { key: 'healthcareIndex', label: 'Healthcare Index', formatter: v => v.toFixed(2) },
                    { key: 'happiness', label: 'Happiness', formatter: v => v.toFixed(1) + '%' },
                    { key: 'environmentalQuality', label: 'Environmental Quality', formatter: v => v.toFixed(1) + '%' },
                ];
                entries.forEach(e => {
                    const oldVal = year5[e.key];
                    const newVal = year6[e.key];
                    if (typeof oldVal === 'number' && typeof newVal === 'number' && oldVal !== 0) {
                        const delta = newVal - oldVal;
                        const pct = (delta / oldVal) * 100;
                        if (Math.abs(pct) >= 5) {
                            const up = pct > 0;
                            const sentiment = (e.key === 'wealthInequality') ? (up ? 'negative' : 'positive') : (up ? 'positive' : 'negative');
                            const title = `${e.label} ${up ? 'rises' : 'falls'} by ${Math.abs(pct).toFixed(1)}%`;
                            const meta = `Year 5: ${e.formatter(oldVal)} • Year 6: ${e.formatter(newVal)}`;
                            const content = `${e.label} changed by ${e.formatter(Math.abs(delta))} (${pct.toFixed(1)}%).`;
                            this.addNewsItem({ type: 'trend', title, content, meta, sentiment });
                        }
                    }
                });
            }
        } catch (e) {}
    }
    
    showVotingResults(userChoice = null) {
        // Calculate how each party would vote based on their ideology
        const partyVotes = this.calculatePartyVotes(userChoice);
        
        // Always calculate the actual winner based on all votes
        const voteCounts = this.countVotes(partyVotes);
        const hasMajority = this.checkForMajority(voteCounts);
        
        if (hasMajority.winner) {
            // A solution has 50%+ support, show results
            this.displayVotingResults(hasMajority.winner, partyVotes, true);
            this.showScreen('votingResultsScreen');
        } else {
            // No majority, need runoff between top 2 options
            this.showRunoffVote(hasMajority.topTwo, partyVotes, userChoice);
        }
    }
    
    calculatePartyVotes(userChoice = null) {
        const partyVotes = [];
        
        this.gameState.allParties.forEach(party => {
            let partyVote;
            
            // Check if this is the user's party and user made a choice
            if (userChoice && party.name === this.gameState.partyName) {
                // User's party votes for the user's choice
                partyVote = userChoice;
            } else {
                // Other parties vote based on their ideology
                partyVote = this.calculatePartyPreference(party);
            }
            
            partyVotes.push({
                party: party,
                vote: partyVote,
                supportsChosen: false // Will be updated later based on actual winner
            });
        });
        
        return partyVotes;
    }
    
    calculatePartyPreference(party) {
        // Determine party preference based on ideological distance to all options
        const allOptions = ['conservative-right', 'conservative-left', 'progressive-right', 'progressive-left'];
        return this.findClosestOption(party, allOptions);
    }
    
    displayVotingResults(chosenOption, partyVotes, isFinal = false, isRunoff = false) {
        // Update chosen option - get names from current event
        const optionNames = {};
        if (this.currentEvent) {
            Object.entries(this.currentEvent.options).forEach(([optionId, option]) => {
                optionNames[optionId] = option.title;
            });
        } else {
            // Fallback for backwards compatibility
            optionNames = {
                'conservative-right': 'Market Solutions',
                'conservative-left': 'Public Housing',
                'progressive-right': 'Innovation & Incentives',
                'progressive-left': 'Community Solutions'
            };
        }
        
        // Update header for runoff
        if (isRunoff) {
            document.querySelector('.voting-results-title h2').innerHTML = '<i class="fas fa-vote-yea"></i> Runoff Results';
            document.querySelector('.voting-results-title p').textContent = 'Final voting results after runoff election';
        } else {
            document.querySelector('.voting-results-title h2').innerHTML = '<i class="fas fa-vote-yea"></i> Voting Results';
            document.querySelector('.voting-results-title p').textContent = `How all parties voted on ${this.currentEvent ? this.currentEvent.title.toLowerCase() : 'the issue'}`;
        }
        
        document.getElementById('chosenOption').textContent = optionNames[chosenOption];
        
        // Update supportsChosen based on actual winner
        partyVotes.forEach(vote => {
            vote.supportsChosen = vote.vote === chosenOption;
        });
        
        // Calculate total support (based on party percentages)
        const supportingParties = partyVotes.filter(vote => vote.supportsChosen);
        const totalSupport = supportingParties.reduce((sum, vote) => sum + vote.party.percentage, 0);
        
        // Store coalition support for policy effects analysis
        if (this.gameState.lastEventEffects) {
            this.gameState.lastEventEffects.coalitionSupport = totalSupport;
        }
        // Generate news headline for vote outcome
        try {
            const title = `${this.currentEvent ? this.currentEvent.title : 'Policy'}: Parliament backs ${optionNames[chosenOption]}`;
            const positive = totalSupport >= 50;
            const meta = `Support: ${totalSupport.toFixed(1)}%`;
            const content = `${supportingParties.length} parties backed ${optionNames[chosenOption]}.`;
            this.addNewsItem({ type: 'vote', title, content, meta, sentiment: positive ? 'positive' : 'negative' });
        } catch (e) {}
        
        document.getElementById('coalitionSupport').textContent = totalSupport + '%';
        
        // Display party votes
        const votesList = document.getElementById('votesList');
        votesList.innerHTML = '';
        
        partyVotes.forEach(vote => {
            const voteItem = document.createElement('div');
            voteItem.className = 'vote-item';
            
            const voteChoiceClass = vote.vote;
            const voteChoiceText = optionNames[vote.vote];
            
            let voteDisplay = '';
            
            if (isRunoff && this.runoffState && this.runoffState.originalVotes) {
                // For runoff, show both original and runoff votes
                const originalVote = this.runoffState.originalVotes.find(ov => ov.party.name === vote.party.name);
                const originalVoteText = originalVote ? optionNames[originalVote.vote] : 'Unknown';
                
                voteDisplay = `
                    <div class="party-info">
                        <div class="party-symbol ${vote.party.inCoalition ? 'coalition' : 'opposition'}">
                            ${vote.party.name[0].toUpperCase()}
                        </div>
                        <div class="party-details">
                            <div class="party-name">${vote.party.name}</div>
                            <div class="party-percentage">${vote.party.percentage}% • ${vote.party.inCoalition ? 'Coalition' : 'Opposition'}</div>
                        </div>
                    </div>
                    <div class="vote-choices">
                        <div class="original-vote">
                            <span class="vote-label">Original:</span>
                            <span class="vote-choice ${originalVote ? originalVote.vote : ''}">${originalVoteText}</span>
                        </div>
                        <div class="runoff-vote">
                            <span class="vote-label">Runoff:</span>
                            <span class="vote-choice ${voteChoiceClass}">${voteChoiceText}</span>
                        </div>
                    </div>
                `;
            } else {
                // For regular votes, show only the current vote
                voteDisplay = `
                    <div class="party-info">
                        <div class="party-symbol ${vote.party.inCoalition ? 'coalition' : 'opposition'}">
                            ${vote.party.name[0].toUpperCase()}
                        </div>
                        <div class="party-details">
                            <div class="party-name">${vote.party.name}</div>
                            <div class="party-percentage">${vote.party.percentage}% • ${vote.party.inCoalition ? 'Coalition' : 'Opposition'}</div>
                        </div>
                    </div>
                    <div class="vote-choice ${voteChoiceClass}">
                        ${voteChoiceText}
                    </div>
                `;
            }
            
            voteItem.innerHTML = voteDisplay;
            votesList.appendChild(voteItem);
        });
        
        // Generate analysis
        this.generateVotingAnalysis(chosenOption, partyVotes, totalSupport, isRunoff);
        
        // Display effects if available
        this.displayPolicyEffects();
    }
    
    generateVotingAnalysis(chosenOption, partyVotes, coalitionSupport, isRunoff = false) {
        const analysisContent = document.getElementById('votingAnalysis');
        
        let analysis = '';
        
        // Parliamentary Support Analysis
        if (coalitionSupport >= 80) {
            analysis = '<h3>🏛️ Strong Parliamentary Support (80%+)</h3>';
            analysis += '<p><strong>Exceptional Unity:</strong> The parliament demonstrates remarkable consensus on this issue. This level of support indicates that the decision aligns with the core values of most political parties and represents a genuine national priority.</p>';
            analysis += '<p><strong>Implementation Confidence:</strong> With such overwhelming support, this policy can be implemented with full confidence. The government will face minimal resistance and can expect smooth execution across all levels of administration.</p>';
            analysis += '<p><strong>Public Reception:</strong> The strong parliamentary backing suggests this decision will likely be well-received by the public, as it represents a broad political consensus rather than partisan politics.</p>';
        } else if (coalitionSupport >= 60) {
            analysis = '<h3>✅ Moderate Parliamentary Support (60-79%)</h3>';
            analysis += '<p><strong>Solid Majority:</strong> Most parties support this decision, indicating a reasonable level of consensus. While some ideological differences remain, the majority support provides a strong mandate for implementation.</p>';
            analysis += '<p><strong>Implementation Outlook:</strong> This policy can proceed with confidence, though the government should be prepared for some opposition and may need to address concerns from dissenting parties.</p>';
            analysis += '<p><strong>Political Dynamics:</strong> The moderate support suggests this decision strikes a balance that appeals to the center of the political spectrum while maintaining some partisan elements.</p>';
        } else if (coalitionSupport >= 40) {
            analysis = '<h3>⚠️ Divided Parliament (40-59%)</h3>';
            analysis += '<p><strong>Narrow Victory:</strong> The parliament is deeply split on this issue. While the decision passed, it represents a narrow victory that may not reflect broad public consensus.</p>';
            analysis += '<p><strong>Implementation Challenges:</strong> This policy will face significant resistance during implementation. The government should expect opposition from nearly half the parliament and potential legal challenges.</p>';
            analysis += '<p><strong>Political Tensions:</strong> The divided vote will likely increase political tensions and may lead to calls for reconsideration or compromise solutions from opposition parties.</p>';
        } else {
            analysis = '<h3>❌ Weak Parliamentary Support (Under 40%)</h3>';
            analysis += '<p><strong>Controversial Decision:</strong> Most parties oppose this decision, indicating it may be highly controversial or misaligned with parliamentary priorities. This represents a significant political risk for the government.</p>';
            analysis += '<p><strong>Implementation Risks:</strong> This policy faces major implementation challenges. The government should expect strong resistance, potential legal challenges, and possible calls for a vote of no confidence.</p>';
            analysis += '<p><strong>Public Backlash:</strong> The weak parliamentary support suggests this decision may face significant public opposition and could damage the government\'s credibility and stability.</p>';
        }
        
        // Event-specific analysis
        const currentEvent = this.currentEvent;
        if (currentEvent) {
            analysis += `<h3>📋 ${currentEvent.title} - Policy Analysis</h3>`;
            
            // Add event-specific analysis based on the chosen option
            const eventOptionAnalysis = this.getEventSpecificAnalysis(currentEvent.id, chosenOption);
            analysis += eventOptionAnalysis;
        }
        
        // Add runoff-specific analysis
        if (isRunoff) {
            analysis += '<h3>🔄 Runoff Election Analysis</h3>';
            analysis += '<p><strong>Two-Round Process:</strong> This decision was reached through a runoff vote after no option received 50% support in the first round. This indicates that the initial vote was highly contested with multiple viable options.</p>';
            analysis += '<p><strong>Compromise Result:</strong> The final result reflects the preferences of all parties between the two most popular options, representing a compromise between the top two choices rather than a clear first-choice preference.</p>';
            analysis += '<p><strong>Democratic Process:</strong> The runoff system ensured that the final decision has broader support than any single option would have achieved in the first round, strengthening the democratic legitimacy of the outcome.</p>';
        }
        
        // Add coalition dynamics analysis
        analysis += '<h3>🤝 Coalition Dynamics</h3>';
        const supportingParties = partyVotes.filter(vote => vote.vote === chosenOption);
        const opposingParties = partyVotes.filter(vote => vote.vote !== chosenOption);
        
        if (supportingParties.length > 0) {
            analysis += '<p><strong>Supporting Parties:</strong> ';
            analysis += supportingParties.map(vote => `${vote.party.name} (${vote.party.percentage}%)`).join(', ');
            analysis += '</p>';
        }
        
        if (opposingParties.length > 0) {
            analysis += '<p><strong>Opposing Parties:</strong> ';
            analysis += opposingParties.map(vote => `${vote.party.name} (${vote.party.percentage}%)`).join(', ');
            analysis += '</p>';
        }
        
        analysisContent.innerHTML = analysis;
    }
    
    getEventSpecificAnalysis(eventId, chosenOption) {
        const analyses = {
            'housing_crisis': {
                'conservative-right': `
                    <p><strong>Market Solutions Approach:</strong> This decision prioritizes free market mechanisms to address the housing crisis. By reducing regulations and encouraging private development, this approach aims to increase housing supply through market forces.</p>
                    <p><strong>Economic Impact:</strong> This policy typically leads to increased GDP growth as construction and real estate sectors expand. However, it often results in higher wealth inequality as housing becomes more expensive and accessible primarily to those with higher incomes.</p>
                    <p><strong>Social Consequences:</strong> While this approach may increase overall housing supply, it often fails to address affordability for low and middle-income families. Homelessness may actually increase as housing costs rise faster than wages.</p>
                    <p><strong>Long-term Outlook:</strong> This market-driven approach may create a housing boom in the short term, but could lead to housing bubbles and increased economic volatility. The policy favors property developers and investors over first-time homebuyers.</p>
                `,
                'conservative-left': `
                    <p><strong>Public Housing Investment:</strong> This decision represents a significant government intervention in the housing market through massive public housing construction and social housing programs.</p>
                    <p><strong>Economic Impact:</strong> This policy requires substantial government spending, which may decrease GDP in the short term due to increased public debt. However, it creates many construction jobs and provides stable, affordable housing for families.</p>
                    <p><strong>Social Benefits:</strong> This approach directly addresses homelessness and housing affordability by providing government-subsidized housing. It ensures that low and middle-income families have access to decent, affordable homes.</p>
                    <p><strong>Implementation Challenges:</strong> Large-scale public housing projects require significant planning, funding, and time. The government will need to manage construction contracts, ensure quality standards, and maintain the housing stock long-term.</p>
                `,
                'progressive-right': `
                    <p><strong>Innovation & Incentives Approach:</strong> This decision combines market mechanisms with government incentives to promote sustainable and innovative housing solutions, including modern construction methods and green building practices.</p>
                    <p><strong>Economic Impact:</strong> This policy stimulates innovation in the construction sector while providing tax incentives for sustainable development. It may lead to moderate GDP growth through increased construction activity and technological advancement.</p>
                    <p><strong>Environmental Benefits:</strong> By promoting sustainable building practices, this approach addresses both housing and environmental concerns. It encourages the development of energy-efficient, environmentally friendly housing solutions.</p>
                    <p><strong>Market Dynamics:</strong> This approach works within the market system while using government incentives to guide development toward socially beneficial outcomes. It may create new industries around green construction and sustainable housing.</p>
                `,
                'progressive-left': `
                    <p><strong>Community Solutions Approach:</strong> This decision empowers local communities to develop their own housing solutions through cooperative housing, community land trusts, and grassroots development initiatives.</p>
                    <p><strong>Social Impact:</strong> This approach prioritizes community ownership and control over housing, ensuring that development serves local needs rather than external profit motives. It promotes social cohesion and community resilience.</p>
                    <p><strong>Economic Model:</strong> This policy shifts away from traditional market-based housing toward community-controlled alternatives. While it may not generate significant GDP growth, it creates more equitable and sustainable housing solutions.</p>
                    <p><strong>Implementation Strategy:</strong> This approach requires significant community organizing and may take longer to implement than traditional solutions. However, it creates lasting community assets and reduces dependence on external developers.</p>
                `
            },
            'healthcare_crisis': {
                'conservative-right': `
                    <p><strong>Private Healthcare Expansion:</strong> This decision promotes private healthcare providers and insurance systems to reduce the burden on public healthcare infrastructure.</p>
                    <p><strong>Economic Impact:</strong> This approach may increase GDP through private sector growth, but it typically leads to higher healthcare costs and reduced access for lower-income populations. Wealth inequality often increases as healthcare becomes more expensive.</p>
                    <p><strong>Healthcare Access:</strong> While this policy may reduce waiting times for those who can afford private care, it often decreases overall healthcare access as public services are reduced and private costs rise beyond many people's means.</p>
                    <p><strong>Quality Implications:</strong> The healthcare index may decrease as the system becomes more fragmented and quality becomes dependent on ability to pay rather than medical need.</p>
                `,
                'conservative-left': `
                    <p><strong>Public System Investment:</strong> This decision represents a massive government investment in public healthcare infrastructure, staff recruitment, and system strengthening.</p>
                    <p><strong>Economic Impact:</strong> This policy requires significant government spending, which may decrease GDP in the short term due to increased public debt. However, it creates many healthcare jobs and improves public health outcomes.</p>
                    <p><strong>Healthcare Access:</strong> This approach significantly increases healthcare access by expanding public services and reducing barriers to care. It ensures that healthcare is available to all citizens regardless of income.</p>
                    <p><strong>Quality Improvements:</strong> The healthcare index should improve as the public system is strengthened with better infrastructure, more staff, and improved services. However, implementation requires careful management to ensure quality standards.</p>
                `,
                'progressive-right': `
                    <p><strong>Digital Health Innovation:</strong> This decision invests in telemedicine, AI diagnostics, and digital health solutions to modernize healthcare delivery and improve efficiency.</p>
                    <p><strong>Technological Advancement:</strong> This approach leverages technology to improve healthcare delivery, potentially increasing the healthcare index through better diagnostics and more efficient care delivery.</p>
                    <p><strong>Access Implications:</strong> Digital health solutions may improve access for some populations, particularly in rural areas, but may create barriers for those without digital literacy or access to technology.</p>
                    <p><strong>Economic Impact:</strong> This policy stimulates the technology sector while potentially reducing some traditional healthcare jobs through automation. It may increase wealth inequality as tech workers benefit more than traditional healthcare workers.</p>
                `,
                'progressive-left': `
                    <p><strong>Universal Healthcare Reform:</strong> This decision implements comprehensive reform to ensure equal access to quality healthcare for all citizens through a universal system.</p>
                    <p><strong>Equity Focus:</strong> This approach prioritizes healthcare equity and ensures that all citizens have access to the same quality of care regardless of income, location, or background.</p>
                    <p><strong>System Integration:</strong> This policy creates a unified healthcare system that eliminates fragmentation and ensures coordinated care across all levels of the healthcare system.</p>
                    <p><strong>Implementation Challenges:</strong> Universal healthcare reform requires significant bureaucratic restructuring and may face resistance from existing healthcare providers. However, it creates the most equitable and comprehensive healthcare system.</p>
                `
            },
            'economic_recession': {
                'conservative-right': `
                    <p><strong>Austerity Measures:</strong> This decision implements spending cuts and fiscal discipline to reduce government debt and restore market confidence during the economic downturn.</p>
                    <p><strong>Economic Philosophy:</strong> This approach follows classical economic theory that government spending cuts and reduced public debt will restore market confidence and encourage private investment.</p>
                    <p><strong>Social Impact:</strong> While austerity may eventually restore economic stability, it typically increases unemployment and reduces public services in the short term, affecting vulnerable populations most severely.</p>
                    <p><strong>Long-term Outlook:</strong> This policy may restore fiscal stability but often prolongs economic recovery and increases social inequality as public services are reduced.</p>
                `,
                'conservative-left': `
                    <p><strong>Public Works Programs:</strong> This decision launches large-scale public infrastructure projects to create jobs and stimulate economic activity during the recession.</p>
                    <p><strong>Job Creation:</strong> This approach directly addresses unemployment by creating public sector jobs in infrastructure, construction, and public services, providing immediate economic relief to workers.</p>
                    <p><strong>Economic Stimulus:</strong> Public works programs inject money into the economy through wages and materials, creating a multiplier effect that stimulates private sector activity and economic recovery.</p>
                    <p><strong>Infrastructure Benefits:</strong> This policy not only addresses the immediate crisis but also improves long-term infrastructure, creating lasting economic benefits and improved public services.</p>
                `,
                'progressive-right': `
                    <p><strong>Business Incentives:</strong> This decision provides tax breaks, subsidies, and regulatory relief to businesses to encourage investment and job creation during the economic downturn.</p>
                    <p><strong>Private Sector Focus:</strong> This approach relies on private sector investment and innovation to drive economic recovery, using government incentives to encourage business expansion and hiring.</p>
                    <p><strong>Innovation Support:</strong> By supporting businesses, this policy encourages innovation and technological advancement, potentially creating new industries and economic opportunities.</p>
                    <p><strong>Market Dynamics:</strong> This approach works within market mechanisms while using government policy to guide economic recovery toward sustainable growth and job creation.</p>
                `,
                'progressive-left': `
                    <p><strong>Social Safety Net Expansion:</strong> This decision strengthens unemployment benefits, social assistance, and worker protections to support people during the economic crisis.</p>
                    <p><strong>Human-Centered Approach:</strong> This policy prioritizes protecting people from the worst effects of the recession through expanded social programs and worker protections.</p>
                    <p><strong>Economic Stability:</strong> By maintaining consumer spending through social benefits, this approach helps prevent further economic contraction and supports local businesses and communities.</p>
                    <p><strong>Equity Focus:</strong> This policy ensures that the burden of economic recovery is shared fairly and that vulnerable populations are protected during the crisis.</p>
                `
            }
        };
        
        return analyses[eventId]?.[chosenOption] || '<p><strong>Policy Analysis:</strong> This decision represents a significant policy choice that will have various economic, social, and political implications. The specific effects will depend on implementation details and external factors.</p>';
    }
    
    displayPolicyEffects() {
        if (!this.gameState.lastEventEffects) {
            return;
        }
        
        const effects = this.gameState.lastEventEffects;
        const effectsSection = document.getElementById('effectsSection');
        const effectsGrid = document.getElementById('effectsGrid');
        
        // Show the effects section
        effectsSection.style.display = 'block';
        
        // Clear previous effects
        effectsGrid.innerHTML = '';
        
        // Create effect cards for each statistic that changed
        const effectCards = [];
        
        // GDP Effect
        const gdpChange = ((effects.newStats.gdp - effects.originalStats.gdp) / effects.originalStats.gdp) * 100;
        if (Math.abs(gdpChange) > 0.5) { // Only show if change is significant
            effectCards.push(this.createEffectCard(
                'GDP',
                gdpChange,
                effects.originalStats.gdp,
                effects.newStats.gdp,
                'fas fa-chart-line',
                'Total Economic Output'
            ));
        }
        
        // GDP per Capita Effect
        const gdpPerCapitaChange = ((effects.newStats.gdpPerCapita - effects.originalStats.gdpPerCapita) / effects.originalStats.gdpPerCapita) * 100;
        if (Math.abs(gdpPerCapitaChange) > 0.5) {
            effectCards.push(this.createEffectCard(
                'GDP per Capita',
                gdpPerCapitaChange,
                effects.originalStats.gdpPerCapita,
                effects.newStats.gdpPerCapita,
                'fas fa-user-dollar',
                'Economic Output per Person'
            ));
        }
        
        // Wealth Inequality Effect
        const wealthChange = ((effects.newStats.wealthInequality - effects.originalStats.wealthInequality) / effects.originalStats.wealthInequality) * 100;
        if (Math.abs(wealthChange) > 0.5) {
            effectCards.push(this.createEffectCard(
                'Wealth Inequality',
                wealthChange,
                effects.originalStats.wealthInequality,
                effects.newStats.wealthInequality,
                'fas fa-balance-scale',
                'Richest 5% vs Poorest 5%'
            ));
        }
        
        // Homelessness Effect
        const homelessnessChange = ((effects.newStats.homelessness.rate - effects.originalStats.homelessness.rate) / effects.originalStats.homelessness.rate) * 100;
        if (Math.abs(homelessnessChange) > 0.5) {
            effectCards.push(this.createEffectCard(
                'Homelessness Rate',
                homelessnessChange,
                effects.originalStats.homelessness.rate,
                effects.newStats.homelessness.rate,
                'fas fa-home',
                'Percentage of Population'
            ));
        }
        
        // Unemployment Effect
        const unemploymentChange = ((effects.newStats.unemployment.rate - effects.originalStats.unemployment.rate) / effects.originalStats.unemployment.rate) * 100;
        if (Math.abs(unemploymentChange) > 0.5) {
            effectCards.push(this.createEffectCard(
                'Unemployment Rate',
                unemploymentChange,
                effects.originalStats.unemployment.rate,
                effects.newStats.unemployment.rate,
                'fas fa-briefcase',
                'Percentage of Workforce'
            ));
        }
        
        // Access to Healthcare Effect
        const accessToHealthcareChange = ((effects.newStats.accessToHealthcare - effects.originalStats.accessToHealthcare) / effects.originalStats.accessToHealthcare) * 100;
        if (Math.abs(accessToHealthcareChange) > 0.5) {
            effectCards.push(this.createEffectCard(
                'Access to Healthcare',
                accessToHealthcareChange,
                effects.originalStats.accessToHealthcare,
                effects.newStats.accessToHealthcare,
                'fas fa-user-md',
                'Population Coverage'
            ));
        }
        
        // Healthcare Index Effect
        const healthcareIndexChange = ((effects.newStats.healthcareIndex - effects.originalStats.healthcareIndex) / effects.originalStats.healthcareIndex) * 100;
        if (Math.abs(healthcareIndexChange) > 0.5) {
            effectCards.push(this.createEffectCard(
                'Healthcare Index',
                healthcareIndexChange,
                effects.originalStats.healthcareIndex,
                effects.newStats.healthcareIndex,
                'fas fa-heartbeat',
                'Quality Score (0-1)'
            ));
        }
        
        // Immigration Effect
        const immigrationChange = ((effects.newStats.immigration.rate - effects.originalStats.immigration.rate) / effects.originalStats.immigration.rate) * 100;
        if (Math.abs(immigrationChange) > 0.5) {
            // Get voter concern for immigration policy (based on voter issues)
            const immigrationIssue = this.gameState.voterIssues?.find(issue => issue.title === "Immigration Policy");
            const immigrationVoterConcern = immigrationIssue?.priority || 0;
            const isImmigrationVoterConcernHigh = immigrationVoterConcern > 50;
            
            effectCards.push(this.createEffectCard(
                'Immigration Rate',
                immigrationChange,
                effects.originalStats.immigration.rate,
                effects.newStats.immigration.rate,
                'fas fa-globe-americas',
                'Percentage of Population',
                isImmigrationVoterConcernHigh
            ));
        }
        
        // Happiness Effect
        const happinessChange = ((effects.newStats.happiness - effects.originalStats.happiness) / effects.originalStats.happiness) * 100;
        if (Math.abs(happinessChange) > 0.5) {
            effectCards.push(this.createEffectCard(
                'Happiness',
                happinessChange,
                effects.originalStats.happiness,
                effects.newStats.happiness,
                'fas fa-smile',
                'Percentage of Population'
            ));
        }
        
        // Environmental Quality Effect
        const environmentalQualityChange = ((effects.newStats.environmentalQuality - effects.originalStats.environmentalQuality) / effects.originalStats.environmentalQuality) * 100;
        if (Math.abs(environmentalQualityChange) > 0.5) {
            effectCards.push(this.createEffectCard(
                'Environmental Quality',
                environmentalQualityChange,
                effects.originalStats.environmentalQuality,
                effects.newStats.environmentalQuality,
                'fas fa-leaf',
                'Percentage of Population'
            ));
        }
        
        // Add all effect cards to the grid
        effectCards.forEach(card => {
            effectsGrid.appendChild(card);
        });
        
        // Add comprehensive effects analysis
        this.addEffectsAnalysis(effectCards);
    }
    
    addEffectsAnalysis(effectCards) {
        if (effectCards.length === 0) return;
        
        const effectsSection = document.getElementById('effectsSection');
        
        // Remove existing analysis section if it exists
        const existingAnalysis = effectsSection.querySelector('.effects-analysis');
        if (existingAnalysis) {
            existingAnalysis.remove();
        }
        
        // Create analysis section
        let analysisHTML = '<div class="effects-analysis">';
        analysisHTML += '<h3>📊 Policy Impact Analysis</h3>';
        
        // Categorize effects
        const positiveEffects = effectCards.filter(card => card.classList.contains('positive'));
        const negativeEffects = effectCards.filter(card => card.classList.contains('negative'));
        const neutralEffects = effectCards.filter(card => card.classList.contains('neutral'));
        
        if (positiveEffects.length > 0) {
            analysisHTML += '<div class="analysis-category positive">';
            analysisHTML += '<h4>✅ Positive Impacts</h4>';
            analysisHTML += '<p>This policy decision has generated several positive outcomes that will benefit the country:</p>';
            analysisHTML += '<ul>';
            positiveEffects.forEach(card => {
                const label = card.querySelector('.effect-label').textContent;
                const change = card.querySelector('.effect-change').textContent;
                analysisHTML += `<li><strong>${label}:</strong> ${change} - This improvement will have lasting benefits for the economy and society.</li>`;
            });
            analysisHTML += '</ul>';
            analysisHTML += '</div>';
        }
        
        if (negativeEffects.length > 0) {
            analysisHTML += '<div class="analysis-category negative">';
            analysisHTML += '<h4>⚠️ Negative Impacts</h4>';
            analysisHTML += '<p>This policy decision has also created some challenges that will need to be addressed:</p>';
            analysisHTML += '<ul>';
            negativeEffects.forEach(card => {
                const label = card.querySelector('.effect-label').textContent;
                const change = card.querySelector('.effect-change').textContent;
                analysisHTML += `<li><strong>${label}:</strong> ${change} - This decline may require additional policy interventions to mitigate negative consequences.</li>`;
            });
            analysisHTML += '</ul>';
            analysisHTML += '</div>';
        }
        
        if (neutralEffects.length > 0) {
            analysisHTML += '<div class="analysis-category neutral">';
            analysisHTML += '<h4>➖ Neutral Impacts</h4>';
            analysisHTML += '<p>Some indicators remained relatively stable:</p>';
            analysisHTML += '<ul>';
            neutralEffects.forEach(card => {
                const label = card.querySelector('.effect-label').textContent;
                analysisHTML += `<li><strong>${label}:</strong> No significant change - This stability may indicate that the policy had limited impact on this particular area.</li>`;
            });
            analysisHTML += '</ul>';
            analysisHTML += '</div>';
        }
        
        // Overall assessment
        analysisHTML += '<div class="overall-assessment">';
        analysisHTML += '<h4>🎯 Overall Assessment</h4>';
        
        if (positiveEffects.length > negativeEffects.length) {
            analysisHTML += '<p><strong>Net Positive Impact:</strong> This policy decision appears to have generated more positive than negative outcomes. The benefits outweigh the costs, suggesting this was a sound policy choice that will improve the country\'s overall situation.</p>';
        } else if (negativeEffects.length > positiveEffects.length) {
            analysisHTML += '<p><strong>Net Negative Impact:</strong> This policy decision has created more challenges than benefits. While some positive outcomes were achieved, the negative impacts may require additional policy interventions or reconsideration of the approach.</p>';
        } else {
            analysisHTML += '<p><strong>Mixed Impact:</strong> This policy decision has created a balanced mix of positive and negative outcomes. The policy represents a trade-off where some areas improve while others face challenges, requiring careful monitoring and potential adjustments.</p>';
        }
        
        analysisHTML += '<p><strong>Implementation Monitoring:</strong> The government should closely monitor these changes and be prepared to make adjustments if negative trends continue or if positive impacts fail to materialize as expected.</p>';
        analysisHTML += '</div>';
        
        analysisHTML += '</div>';
        
        // Add to effects section
        effectsSection.insertAdjacentHTML('beforeend', analysisHTML);
    }
    
    createEffectCard(label, changePercent, originalValue, newValue, icon, detail, isImmigrationVoterConcernHigh = false) {
        const card = document.createElement('div');
        
        // Determine if this is a negative statistic (where decrease is good)
        const isNegativeStatistic = label.includes('Homelessness') || 
                                   label.includes('Unemployment') || 
                                   label.includes('Wealth Inequality');
        
        // Special case for Immigration: interpretation depends on voter concern level
        const isImmigration = label.includes('Immigration');
        
        // Determine card type based on change
        let cardType = 'neutral';
        let changeIcon = 'fas fa-minus';
        let changeText = 'No Change';
        
        if (changePercent > 0.5) {
            if (isNegativeStatistic) {
                cardType = 'negative'; // Increase in bad statistic is negative
                changeIcon = 'fas fa-arrow-up';
                changeText = `+${changePercent.toFixed(1)}%`;
            } else if (isImmigration) {
                // Immigration increase: positive if low voter concern, negative if high voter concern
                if (isImmigrationVoterConcernHigh) {
                    cardType = 'negative'; // High concern: increase is bad
                    changeIcon = 'fas fa-arrow-up';
                    changeText = `+${changePercent.toFixed(1)}%`;
                } else {
                    cardType = 'positive'; // Low concern: increase is good
                    changeIcon = 'fas fa-arrow-up';
                    changeText = `+${changePercent.toFixed(1)}%`;
                }
            } else {
                cardType = 'positive'; // Increase in good statistic is positive
                changeIcon = 'fas fa-arrow-up';
                changeText = `+${changePercent.toFixed(1)}%`;
            }
        } else if (changePercent < -0.5) {
            if (isNegativeStatistic) {
                cardType = 'positive'; // Decrease in bad statistic is positive
                changeIcon = 'fas fa-arrow-down';
                changeText = `${changePercent.toFixed(1)}%`;
            } else if (isImmigration) {
                // Immigration decrease: negative if low voter concern, positive if high voter concern
                if (isImmigrationVoterConcernHigh) {
                    cardType = 'positive'; // High concern: decrease is good
                    changeIcon = 'fas fa-arrow-down';
                    changeText = `${changePercent.toFixed(1)}%`;
                } else {
                    cardType = 'negative'; // Low concern: decrease is bad
                    changeIcon = 'fas fa-arrow-down';
                    changeText = `${changePercent.toFixed(1)}%`;
                }
            } else {
                cardType = 'negative'; // Decrease in good statistic is negative
                changeIcon = 'fas fa-arrow-down';
                changeText = `${changePercent.toFixed(1)}%`;
            }
        }
        
        // Format values based on type
        let formattedOriginal, formattedNew;
        if (label.includes('GDP per Capita')) {
            formattedOriginal = '$' + Math.round(originalValue).toLocaleString();
            formattedNew = '$' + Math.round(newValue).toLocaleString();
        } else if (label.includes('GDP')) {
            formattedOriginal = '$' + originalValue.toFixed(0) + 'B';
            formattedNew = '$' + newValue.toFixed(0) + 'B';
        } else if (label.includes('Wealth Inequality')) {
            formattedOriginal = originalValue.toFixed(1) + ':1';
            formattedNew = newValue.toFixed(1) + ':1';
        } else if (label.includes('Healthcare Index')) {
            formattedOriginal = originalValue.toFixed(2);
            formattedNew = newValue.toFixed(2);
        } else {
            formattedOriginal = originalValue.toFixed(1) + '%';
            formattedNew = newValue.toFixed(1) + '%';
        }
        
        card.className = `effect-card ${cardType}`;
        card.innerHTML = `
            <div class="effect-header">
                <div class="effect-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="effect-label">${label}</div>
            </div>
            <div class="effect-change">
                <i class="${changeIcon}"></i> ${changeText}
            </div>
            <div class="effect-detail">
                ${formattedOriginal} → ${formattedNew}
                <br>${detail}
            </div>
        `;
        
        return card;
    }
    
    countVotes(partyVotes) {
        const voteCounts = {
            'conservative-right': 0,
            'conservative-left': 0,
            'progressive-right': 0,
            'progressive-left': 0
        };
        
        partyVotes.forEach(vote => {
            voteCounts[vote.vote] += vote.party.percentage;
        });
        
        return voteCounts;
    }
    
    checkForMajority(voteCounts) {
        const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);
        const threshold = totalVotes * 0.5; // 50% threshold
        
        // Find the winner
        let winner = null;
        let maxVotes = 0;
        
        for (const [option, votes] of Object.entries(voteCounts)) {
            if (votes > maxVotes) {
                maxVotes = votes;
                if (votes >= threshold) {
                    winner = option;
                }
            }
        }
        
        // If no winner, find top 2 for runoff
        if (!winner) {
            const sortedOptions = Object.entries(voteCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 2)
                .map(([option]) => option);
            
            return { winner: null, topTwo: sortedOptions };
        }
        
        return { winner: winner, topTwo: null };
    }
    
    showRunoffVote(topTwoOptions, originalVotes, userChoice = null) {
        // Store runoff state
        this.runoffState = {
            topTwo: topTwoOptions,
            originalVotes: originalVotes,
            userChoice: userChoice,
            round: 2
        };
        
        // Update the event screen for runoff
        this.updateEventScreenForRunoff(topTwoOptions);
        this.showScreen('eventScreen');
    }
    
    updateEventScreenForRunoff(topTwoOptions) {
        // Update the event description for runoff
        const eventTitle = this.currentEvent ? this.currentEvent.title : 'Current Issue';
        document.getElementById('eventTitle').textContent = `${eventTitle} - Runoff Vote`;
        document.getElementById('eventDescription').innerHTML = `
            No solution received 50% support in the first round. The two most popular options will now face off in a runoff vote.
            <br><br>
            <strong>Runoff Options:</strong> ${this.getOptionNames(topTwoOptions).join(' vs ')}
        `;
        
        // Clear existing options and generate only the runoff options
        const optionsGrid = document.querySelector('.options-grid');
        optionsGrid.innerHTML = '';
        
        // Generate option cards for only the top two options
        topTwoOptions.forEach(optionId => {
            if (this.currentEvent && this.currentEvent.options[optionId]) {
                const option = this.currentEvent.options[optionId];
                const optionCard = document.createElement('div');
                optionCard.className = 'option-card';
                optionCard.onclick = () => this.selectEventOption(optionId);
                
                optionCard.innerHTML = `
                    <div class="option-icon ${optionId}">
                        <i class="${option.icon}"></i>
                    </div>
                    <div class="option-content">
                        <h5>${option.title}</h5>
                        <p>${option.description}</p>
                        <div class="option-effects">
                            ${option.messages.map(msg => `<span class="effect">${msg}</span>`).join('')}
                        </div>
                    </div>
                `;
                
                optionsGrid.appendChild(optionCard);
            }
        });
        
        // Set the options grid to 2 columns for the runoff
        optionsGrid.style.gridTemplateColumns = '1fr 1fr';
    }
    
    getOptionNames(options) {
        const optionNames = {};
        if (this.currentEvent) {
            Object.entries(this.currentEvent.options).forEach(([optionId, option]) => {
                optionNames[optionId] = option.title;
            });
        } else {
            // Fallback for backwards compatibility
            optionNames = {
                'conservative-right': 'Market Solutions',
                'conservative-left': 'Public Housing',
                'progressive-right': 'Innovation & Incentives',
                'progressive-left': 'Community Solutions'
            };
        }
        
        return options.map(option => optionNames[option]);
    }
    
    selectEventOption(optionType) {
        // Check if this is a runoff vote
        if (this.runoffState && this.runoffState.round === 2) {
            // Store the user's runoff choice
            this.runoffState.userRunoffChoice = optionType;
            this.processRunoffVote();
        } else {
            // Regular first round vote - process the choice and show results
            this.processEventChoice(optionType);
            this.showVotingResults(optionType);
        }
    }
    
    processRunoffVote() {
        // Get the user's runoff choice (new choice made in runoff)
        const userRunoffChoice = this.runoffState.userRunoffChoice;
        
        // Calculate runoff results to determine winner
        const runoffVotes = this.calculateRunoffVotes();
        
        // Determine winner based on runoff votes
        const runoffCounts = this.countVotes(runoffVotes);
        const winner = Object.entries(runoffCounts)
            .sort(([,a], [,b]) => b - a)[0][0];
        
        // Process the winning choice
        this.processEventChoice(winner);
        
        // Show runoff results
        this.displayVotingResults(winner, runoffVotes, true, true);
        this.showScreen('votingResultsScreen');
        
        // Clear runoff state and reset event screen
        this.runoffState = null;
        this.resetEventScreen();
    }
    
    calculateRunoffVotes() {
        const partyVotes = [];
        const userRunoffChoice = this.runoffState.userRunoffChoice;
        
        this.gameState.allParties.forEach(party => {
            let partyVote;
            
            // Check if this is the user's party and user made a runoff choice
            if (userRunoffChoice && party.name === this.gameState.partyName) {
                // User's party votes for the user's runoff choice
                partyVote = userRunoffChoice;
            } else {
                // All other parties choose based on ideological distance to the runoff options
                // This ensures parties vote for the option they're ideologically closest to
                partyVote = this.findClosestOption(party, this.runoffState.topTwo);
            }
            
            partyVotes.push({
                party: party,
                vote: partyVote,
                supportsChosen: false // Will be updated later
            });
        });
        
        return partyVotes;
    }
    
    findClosestOption(party, topTwoOptions) {
        // Find which of the top 2 options is ideologically closest to the party
        const partyPosition = { social: party.socialValue, economic: party.economicValue };
        
        let closestOption = topTwoOptions[0];
        let minDistance = Infinity;
        
        topTwoOptions.forEach(option => {
            const optionPosition = this.getOptionPosition(option);
            const distance = Math.sqrt(
                Math.pow(partyPosition.social - optionPosition.social, 2) +
                Math.pow(partyPosition.economic - optionPosition.economic, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestOption = option;
            }
        });
        
        return closestOption;
    }
    
    getOptionPosition(option) {
        // Return the ideological position of each option
        // These positions align with the party generation ranges:
        // Conservative: social 7-10, Progressive: social 0-3
        // Right: economic 7-10, Left: economic 0-3
        const positions = {
            'conservative-right': { social: 8.5, economic: 8.5 }, // Center of conservative-right range
            'conservative-left': { social: 8.5, economic: 1.5 },  // Center of conservative-left range  
            'progressive-right': { social: 1.5, economic: 8.5 },  // Center of progressive-right range
            'progressive-left': { social: 1.5, economic: 1.5 }    // Center of progressive-left range
        };
        
        return positions[option];
    }
    
    resetEventScreen() {
        // Reset the event screen to its original state
        if (this.currentEvent) {
            document.getElementById('eventTitle').textContent = this.currentEvent.title;
            document.getElementById('eventDescription').textContent = this.currentEvent.description;
        }
        
        // Show all options again
        const allOptions = document.querySelectorAll('.option-card');
        allOptions.forEach(option => {
            option.style.display = 'block';
        });
        
        // Reset the options grid to 2x2
        const optionsGrid = document.querySelector('.options-grid');
        optionsGrid.style.gridTemplateColumns = '1fr 1fr';
    }
    
    showVoterIssues() {
        // Generate random voter issues if not already generated
        if (!this.gameState.voterIssues) {
            this.gameState.voterIssues = this.generateVoterIssues();
        }
        
        // Display the voter issues
        this.displayVoterIssues();
        this.showScreen('voterIssuesScreen');
    }
    
    generateVoterIssues() {
        const allIssues = [
            {
                title: "Healthcare Access",
                description: "Affordable and accessible healthcare for all citizens",
                icon: "fas fa-heartbeat",
                category: "social"
            },
            {
                title: "Economic Growth",
                description: "Creating jobs and boosting the economy",
                icon: "fas fa-chart-line",
                category: "economic"
            },
            {
                title: "Climate Change",
                description: "Environmental protection and sustainability",
                icon: "fas fa-leaf",
                category: "environmental"
            },
            {
                title: "Education Reform",
                description: "Improving schools and educational opportunities",
                icon: "fas fa-graduation-cap",
                category: "social"
            },
            {
                title: "Immigration Policy",
                description: "Border control and immigration management",
                icon: "fas fa-passport",
                category: "social"
            },
            {
                title: "Tax Reform",
                description: "Fair taxation and government spending",
                icon: "fas fa-calculator",
                category: "economic"
            },
            {
                title: "Crime & Safety",
                description: "Law enforcement and public safety",
                icon: "fas fa-shield-alt",
                category: "social"
            },
            {
                title: "Infrastructure",
                description: "Roads, bridges, and public transportation",
                icon: "fas fa-road",
                category: "economic"
            },
            {
                title: "Social Welfare",
                description: "Support for vulnerable populations",
                icon: "fas fa-hands-helping",
                category: "social"
            },
            {
                title: "Technology & Innovation",
                description: "Digital transformation and tech industry",
                icon: "fas fa-microchip",
                category: "economic"
            },
            {
                title: "Housing Crisis",
                description: "Affordable housing and homelessness",
                icon: "fas fa-home",
                category: "social"
            },
            {
                title: "Defense & Security",
                description: "National security and military spending",
                icon: "fas fa-fighter-jet",
                category: "economic"
            }
        ];
        
        // Select 6 random issues
        const shuffled = allIssues.sort(() => 0.5 - Math.random());
        const selectedIssues = shuffled.slice(0, 6);
        
        // Assign priorities and trends
        return selectedIssues.map((issue, index) => {
            const basePriority = 100 - (index * 10); // Decreasing priority
            const variation = Math.random() * 20 - 10; // ±10% variation
            const priority = Math.max(10, Math.min(100, basePriority + variation));
            
            const trends = ['rising', 'falling', 'stable'];
            const trend = trends[Math.floor(Math.random() * trends.length)];
            
            return {
                ...issue,
                priority: Math.round(priority),
                trend: trend,
                percentage: Math.round(priority)
            };
        }).sort((a, b) => b.priority - a.priority); // Sort by priority
    }
    
    displayVoterIssues() {
        const issuesGrid = document.getElementById('issuesGrid');
        issuesGrid.innerHTML = '';
        
        this.gameState.voterIssues.forEach((issue, index) => {
            const issueCard = document.createElement('div');
            issueCard.className = 'issue-card';
            
            const trendIcon = issue.trend === 'rising' ? 'fas fa-arrow-up' : 
                             issue.trend === 'falling' ? 'fas fa-arrow-down' : 
                             'fas fa-minus';
            
            issueCard.innerHTML = `
                <div class="issue-header">
                    <div class="issue-icon">
                        <i class="${issue.icon}"></i>
                    </div>
                    <div class="issue-info">
                        <div class="issue-title">${issue.title}</div>
                        <div class="issue-priority">Priority #${index + 1}</div>
                    </div>
                </div>
                <div class="issue-description">${issue.description}</div>
                <div class="issue-stats">
                    <div class="issue-percentage">${issue.percentage}%</div>
                    <div class="issue-trend ${issue.trend}">
                        <i class="${trendIcon}"></i>
                        ${issue.trend}
                    </div>
                </div>
            `;
            
            issuesGrid.appendChild(issueCard);
        });
        
        // Generate analysis
        this.generateIssuesAnalysis();
    }
    
    generateIssuesAnalysis() {
        const analysisContent = document.getElementById('issuesAnalysis');
        const issues = this.gameState.voterIssues;
        
        // Count issues by category
        const categories = issues.reduce((acc, issue) => {
            acc[issue.category] = (acc[issue.category] || 0) + 1;
            return acc;
        }, {});
        
        const topCategory = Object.entries(categories)
            .sort(([,a], [,b]) => b - a)[0];
        
        const topIssue = issues[0];
        const avgPriority = Math.round(issues.reduce((sum, issue) => sum + issue.priority, 0) / issues.length);
        
        let analysis = `<p><strong>Top Priority:</strong> ${topIssue.title} leads voter concerns at ${topIssue.percentage}% priority.</p>`;
        
        analysis += `<p><strong>Category Focus:</strong> ${topCategory[0]} issues dominate the agenda with ${topCategory[1]} top concerns.</p>`;
        
        analysis += `<p><strong>Overall Sentiment:</strong> Average voter priority is ${avgPriority}%, indicating ${avgPriority > 70 ? 'high' : avgPriority > 50 ? 'moderate' : 'low'} public engagement with current issues.</p>`;
        
        // Add trend analysis
        const risingIssues = issues.filter(issue => issue.trend === 'rising').length;
        const fallingIssues = issues.filter(issue => issue.trend === 'falling').length;
        
        if (risingIssues > fallingIssues) {
            analysis += `<p><strong>Trend Analysis:</strong> More issues are gaining importance, suggesting a dynamic political environment with shifting priorities.</p>`;
        } else if (fallingIssues > risingIssues) {
            analysis += `<p><strong>Trend Analysis:</strong> Several issues are losing prominence, indicating potential stabilization in public concerns.</p>`;
        } else {
            analysis += `<p><strong>Trend Analysis:</strong> Mixed trends suggest a balanced political landscape with stable voter priorities.</p>`;
        }
        
        analysisContent.innerHTML = analysis;
    }
    
    showStatistics() {
        // Generate statistics if not already generated
        if (!this.gameState.statistics) {
            this.gameState.statistics = this.generateStatistics();
        }
        
        // Display the statistics
        this.displayStatistics();
        this.showScreen('statisticsScreen');
    }
    
    generateStatistics() {
        // Assume population of 50 million for calculations
        const population = 50000000;
        
        // Generate current statistics first
        const currentStats = this.generateCurrentStatistics(population);
        
        // Generate historical data (5 time points) if not already generated
        if (!this.gameState.statisticsHistory) {
            this.gameState.statisticsHistory = this.generateStatisticsHistory(population, currentStats);
        }
        
        return currentStats;
    }
    
    generateCurrentStatistics(population) {
        
        // Generate homelessness statistics
        const homelessnessRate = Math.random() * 2 + 0.5; // 0.5% to 2.5%
        const homelessnessCount = Math.round((homelessnessRate / 100) * population);
        
        // Generate homelessness breakdown (percentages that sum to 100%)
        const homelessnessBreakdown = {
            economicHardship: Math.random() * 30 + 20, // 20% to 50% - lost job, can't afford rent
            mentalHealth: Math.random() * 25 + 15, // 15% to 40% - mental health issues
            substanceAbuse: Math.random() * 20 + 10, // 10% to 30% - addiction problems
            domesticViolence: Math.random() * 15 + 5, // 5% to 20% - fleeing abuse
            familyBreakdown: Math.random() * 12 + 3, // 3% to 15% - family conflicts
            eviction: Math.random() * 18 + 7, // 7% to 25% - evicted from housing
            youthRunaway: Math.random() * 10 + 2, // 2% to 12% - young people leaving home
            disability: Math.random() * 8 + 2 // 2% to 10% - physical/mental disabilities
        };
        
        // Normalize homelessness breakdown percentages to sum to 100%
        const totalHomelessnessBreakdown = Object.values(homelessnessBreakdown).reduce((sum, val) => sum + val, 0);
        Object.keys(homelessnessBreakdown).forEach(key => {
            homelessnessBreakdown[key] = (homelessnessBreakdown[key] / totalHomelessnessBreakdown) * 100;
        });
        
        // Generate immigration statistics
        const immigrationRate = Math.random() * 3 + 1; // 1% to 4%
        const immigrationCount = Math.round((immigrationRate / 100) * population);
        
        // Generate wealth inequality (ratio between richest 5% and poorest 5%)
        const wealthInequality = Math.random() * 20 + 5; // 5:1 to 25:1 ratio
        
        // Generate unemployment statistics
        const unemploymentRate = Math.random() * 8 + 3; // 3% to 11%
        const unemploymentCount = Math.round((unemploymentRate / 100) * population);
        
        // Generate available jobs statistics (more realistic ratio to population)
        const availableJobsRate = Math.random() * 3 + 1; // 1% to 4% of population
        const availableJobsCount = Math.round((availableJobsRate / 100) * population);
        
        // Generate available jobs sector breakdown (percentages that sum to 100%)
        const availableJobsSectors = {
            healthcare: Math.random() * 20 + 15, // 15% to 35%
            technology: Math.random() * 15 + 10, // 10% to 25%
            education: Math.random() * 12 + 8, // 8% to 20%
            construction: Math.random() * 18 + 10, // 10% to 28%
            retail: Math.random() * 15 + 8, // 8% to 23%
            manufacturing: Math.random() * 12 + 6, // 6% to 18%
            hospitality: Math.random() * 10 + 5, // 5% to 15%
            finance: Math.random() * 8 + 4 // 4% to 12%
        };
        
        // Normalize sector breakdown percentages to sum to 100%
        const totalSectors = Object.values(availableJobsSectors).reduce((sum, val) => sum + val, 0);
        Object.keys(availableJobsSectors).forEach(key => {
            availableJobsSectors[key] = (availableJobsSectors[key] / totalSectors) * 100;
        });
        
        // Generate unemployment breakdown (percentages that sum to 100%)
        const unemploymentBreakdown = {
            noAvailableJobs: Math.random() * 25 + 15, // 15% to 40%
            physicalHandicap: Math.random() * 15 + 5, // 5% to 20%
            mentalHealth: Math.random() * 12 + 3, // 3% to 15%
            lackOfSkills: Math.random() * 20 + 10, // 10% to 30%
            ageDiscrimination: Math.random() * 10 + 5, // 5% to 15%
            seasonalWork: Math.random() * 15 + 8, // 8% to 23%
            companyClosure: Math.random() * 18 + 7 // 7% to 25%
        };
        
        // Normalize unemployment breakdown percentages to sum to 100%
        const totalUnemploymentBreakdown = Object.values(unemploymentBreakdown).reduce((sum, val) => sum + val, 0);
        Object.keys(unemploymentBreakdown).forEach(key => {
            unemploymentBreakdown[key] = (unemploymentBreakdown[key] / totalUnemploymentBreakdown) * 100;
        });
        
        // Generate GDP (in billions)
        const gdp = Math.random() * 2000 + 1000; // 1,000 to 3,000 billion
        
        // Calculate GDP per capita
        const gdpPerCapita = (gdp * 1000000000) / population; // Convert to per capita
        
        // Generate education statistics (percentages that sum to 100%)
        const educationLevels = {
            phd: Math.random() * 3 + 1, // 1% to 4%
            masters: Math.random() * 8 + 5, // 5% to 13%
            bachelors: Math.random() * 15 + 15, // 15% to 30%
            highSchool: Math.random() * 20 + 25, // 25% to 45%
            middleSchool: Math.random() * 15 + 10, // 10% to 25%
            elementary: Math.random() * 10 + 5, // 5% to 15%
            noSchool: Math.random() * 5 + 1 // 1% to 6%
        };
        
        // Normalize education percentages to sum to 100%
        const totalEducation = Object.values(educationLevels).reduce((sum, val) => sum + val, 0);
        Object.keys(educationLevels).forEach(key => {
            educationLevels[key] = (educationLevels[key] / totalEducation) * 100;
        });
        
        // Generate healthcare statistics
        const accessToHealthcare = Math.random() * 20 + 70; // 70% to 90% access
        const healthcareIndex = Math.random() * 0.4 + 0.6; // 0.6 to 1.0 (closer to 1 = better quality)
        
        // Generate happiness statistics
        const happiness = Math.random() * 30 + 50; // 50% to 80% happiness
        const happinessIndex = Math.random() * 0.4 + 0.6; // 0.6 to 1.0 (closer to 1 = better happiness)
        
        // Generate environment statistics
        const environmentalQuality = Math.random() * 30 + 50; // 50% to 80% environmental quality
        const environmentIndex = Math.random() * 0.4 + 0.6; // 0.6 to 1.0 (closer to 1 = better environment)
        
        return {
            population: population,
            homelessness: {
                rate: homelessnessRate,
                count: homelessnessCount,
                breakdown: homelessnessBreakdown
            },
            immigration: {
                rate: immigrationRate,
                count: immigrationCount
            },
            wealthInequality: wealthInequality,
            unemployment: {
                rate: unemploymentRate,
                count: unemploymentCount,
                breakdown: unemploymentBreakdown
            },
            availableJobs: {
                rate: availableJobsRate,
                count: availableJobsCount,
                sectors: availableJobsSectors
            },
            gdp: gdp,
            gdpPerCapita: gdpPerCapita,
            education: educationLevels,
            accessToHealthcare: accessToHealthcare,
            healthcareIndex: healthcareIndex,
            happiness: happiness,
            happinessIndex: happinessIndex,
            environmentalQuality: environmentalQuality,
            environmentIndex: environmentIndex
        };
    }
    
    generateStatisticsHistory(population, currentStats) {
        const history = [];
        const timePoints = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
        
        for (let i = 0; i < 5; i++) {
            let yearData;
            
            if (i === 4) {
                // Year 5 uses the current statistics (start values)
                yearData = {
                    timePoint: timePoints[i],
                    population: currentStats.population,
                    homelessness: {
                        rate: currentStats.homelessness.rate,
                        count: currentStats.homelessness.count,
                        breakdown: currentStats.homelessness.breakdown
                    },
                    immigration: {
                        rate: currentStats.immigration.rate,
                        count: currentStats.immigration.count
                    },
                    wealthInequality: currentStats.wealthInequality,
                    unemployment: {
                        rate: currentStats.unemployment.rate,
                        count: currentStats.unemployment.count
                    },
                    availableJobs: {
                        rate: currentStats.availableJobs.rate,
                        count: currentStats.availableJobs.count
                    },
                    gdp: currentStats.gdp,
                    gdpPerCapita: currentStats.gdpPerCapita,
                    education: currentStats.education,
                    accessToHealthcare: currentStats.accessToHealthcare,
                    healthcareIndex: currentStats.healthcareIndex,
                    happiness: currentStats.happiness,
                    happinessIndex: currentStats.happinessIndex,
                    environmentalQuality: currentStats.environmentalQuality,
                    environmentIndex: currentStats.environmentIndex
                };
            } else {
                // Years 1-4 generate historical data with variation
                const baseVariation = 0.1; // 10% variation between time points
                
                // Homelessness with slight trend
                const homelessnessBase = 1.5;
                const homelessnessTrend = (Math.random() - 0.5) * 0.5; // -0.25 to +0.25
                const homelessnessRate = Math.max(0.2, homelessnessBase + homelessnessTrend + (Math.random() - 0.5) * baseVariation);
                const homelessnessCount = Math.round((homelessnessRate / 100) * population);
                
                // Immigration with slight trend
                const immigrationBase = 2.5;
                const immigrationTrend = (Math.random() - 0.5) * 0.8; // -0.4 to +0.4
                const immigrationRate = Math.max(0.5, immigrationBase + immigrationTrend + (Math.random() - 0.5) * baseVariation);
                const immigrationCount = Math.round((immigrationRate / 100) * population);
                
                // Wealth inequality with slight trend
                const wealthBase = 15;
                const wealthTrend = (Math.random() - 0.5) * 3; // -1.5 to +1.5
                const wealthInequality = Math.max(5, wealthBase + wealthTrend + (Math.random() - 0.5) * baseVariation);
                
                // Unemployment with slight trend
                const unemploymentBase = 7;
                const unemploymentTrend = (Math.random() - 0.5) * 2; // -1 to +1
                const unemploymentRate = Math.max(2, unemploymentBase + unemploymentTrend + (Math.random() - 0.5) * baseVariation);
                const unemploymentCount = Math.round((unemploymentRate / 100) * population);
                
                // Available jobs with slight trend (more realistic ratio)
                const availableJobsBase = 2.5;
                const availableJobsTrend = (Math.random() - 0.5) * 0.8; // -0.4 to +0.4
                const availableJobsRate = Math.max(0.8, availableJobsBase + availableJobsTrend + (Math.random() - 0.5) * baseVariation);
                const availableJobsCount = Math.round((availableJobsRate / 100) * population);
                
                // GDP with growth trend
                const gdpBase = 2000;
                const gdpGrowth = i * 50 + (Math.random() - 0.5) * 200; // Growth over time
                const gdp = Math.max(800, gdpBase + gdpGrowth + (Math.random() - 0.5) * baseVariation * 100);
                
                // GDP per capita
                const gdpPerCapita = (gdp * 1000000000) / population;
                
                // Education levels (more stable, less variation)
                const educationLevels = {
                    phd: Math.max(0.5, 2 + (Math.random() - 0.5) * 0.5),
                    masters: Math.max(3, 9 + (Math.random() - 0.5) * 2),
                    bachelors: Math.max(10, 22 + (Math.random() - 0.5) * 4),
                    highSchool: Math.max(20, 35 + (Math.random() - 0.5) * 6),
                    middleSchool: Math.max(8, 17 + (Math.random() - 0.5) * 4),
                    elementary: Math.max(3, 10 + (Math.random() - 0.5) * 3),
                    noSchool: Math.max(0.5, 3 + (Math.random() - 0.5) * 1)
                };
                
                // Normalize education percentages
                const totalEducation = Object.values(educationLevels).reduce((sum, val) => sum + val, 0);
                Object.keys(educationLevels).forEach(key => {
                    educationLevels[key] = (educationLevels[key] / totalEducation) * 100;
                });
                
                // Healthcare statistics with slight trend
                const accessToHealthcareBase = 80;
                const accessToHealthcareTrend = (Math.random() - 0.5) * 5; // -2.5 to +2.5
                const accessToHealthcare = Math.max(60, Math.min(95, accessToHealthcareBase + accessToHealthcareTrend + (Math.random() - 0.5) * baseVariation * 10));
                
                const healthcareIndexBase = 0.8;
                const healthcareIndexTrend = (Math.random() - 0.5) * 0.1; // -0.05 to +0.05
                const healthcareIndex = Math.max(0.4, Math.min(1.0, healthcareIndexBase + healthcareIndexTrend + (Math.random() - 0.5) * baseVariation * 0.2));
                
                // Happiness statistics with slight trend
                const happinessBase = 65;
                const happinessTrend = (Math.random() - 0.5) * 8; // -4 to +4
                const happiness = Math.max(30, Math.min(90, happinessBase + happinessTrend + (Math.random() - 0.5) * baseVariation * 15));
                
                const happinessIndexBase = 0.8;
                const happinessIndexTrend = (Math.random() - 0.5) * 0.1; // -0.05 to +0.05
                const happinessIndex = Math.max(0.4, Math.min(1.0, happinessIndexBase + happinessIndexTrend + (Math.random() - 0.5) * baseVariation * 0.2));
                
                // Environment statistics with slight trend
                const environmentalQualityBase = 65;
                const environmentalQualityTrend = (Math.random() - 0.5) * 8; // -4 to +4
                const environmentalQuality = Math.max(30, Math.min(90, environmentalQualityBase + environmentalQualityTrend + (Math.random() - 0.5) * baseVariation * 15));
                
                const environmentIndexBase = 0.8;
                const environmentIndexTrend = (Math.random() - 0.5) * 0.1; // -0.05 to +0.05
                const environmentIndex = Math.max(0.4, Math.min(1.0, environmentIndexBase + environmentIndexTrend + (Math.random() - 0.5) * baseVariation * 0.2));
                
                // Generate historical homelessness breakdown
                const historicalHomelessnessBreakdown = {
                    economicHardship: Math.random() * 30 + 20,
                    mentalHealth: Math.random() * 25 + 15,
                    substanceAbuse: Math.random() * 20 + 10,
                    domesticViolence: Math.random() * 15 + 5,
                    familyBreakdown: Math.random() * 12 + 3,
                    eviction: Math.random() * 18 + 7,
                    youthRunaway: Math.random() * 10 + 2,
                    disability: Math.random() * 8 + 2
                };
                
                // Normalize historical breakdown
                const totalHistoricalBreakdown = Object.values(historicalHomelessnessBreakdown).reduce((sum, val) => sum + val, 0);
                Object.keys(historicalHomelessnessBreakdown).forEach(key => {
                    historicalHomelessnessBreakdown[key] = (historicalHomelessnessBreakdown[key] / totalHistoricalBreakdown) * 100;
                });
                
                yearData = {
                    timePoint: timePoints[i],
                    population: population,
                    homelessness: {
                        rate: homelessnessRate,
                        count: homelessnessCount,
                        breakdown: historicalHomelessnessBreakdown
                    },
                    immigration: {
                        rate: immigrationRate,
                        count: immigrationCount
                    },
                    wealthInequality: wealthInequality,
                    unemployment: {
                        rate: unemploymentRate,
                        count: unemploymentCount
                    },
                    availableJobs: {
                        rate: availableJobsRate,
                        count: availableJobsCount
                    },
                    gdp: gdp,
                    gdpPerCapita: gdpPerCapita,
                    education: educationLevels,
                    accessToHealthcare: accessToHealthcare,
                    healthcareIndex: healthcareIndex,
                    happiness: happiness,
                    happinessIndex: happinessIndex,
                    environmentalQuality: environmentalQuality,
                    environmentIndex: environmentIndex
                };
            }
            
            history.push(yearData);
        }
        
        return history;
    }
    
    displayStatistics() {
        const stats = this.gameState.statistics;
        
        // Display population statistics
        document.getElementById('totalPopulation').textContent = stats.population.toLocaleString();
        
        // Display homelessness statistics
        document.getElementById('homelessnessRate').textContent = stats.homelessness.rate.toFixed(1) + '%';
        document.getElementById('homelessnessCount').textContent = stats.homelessness.count.toLocaleString() + ' people';
        
        // Display immigration statistics
        document.getElementById('immigrationRate').textContent = stats.immigration.rate.toFixed(1) + '%';
        document.getElementById('immigrationCount').textContent = stats.immigration.count.toLocaleString() + ' people';
        
        // Display wealth inequality
        document.getElementById('wealthInequality').textContent = stats.wealthInequality.toFixed(1) + ':1';
        
        // Display unemployment statistics
        document.getElementById('unemploymentRate').textContent = stats.unemployment.rate.toFixed(1) + '%';
        document.getElementById('unemploymentCount').textContent = stats.unemployment.count.toLocaleString() + ' people';
        
        // Display available jobs statistics
        document.getElementById('availableJobs').textContent = stats.availableJobs.count.toLocaleString();
        document.getElementById('availableJobsCount').textContent = 'Available Jobs';
        
        // Display GDP
        document.getElementById('gdp').textContent = '$' + stats.gdp.toFixed(0) + 'B';
        
        // Display GDP per capita
        document.getElementById('gdpPerCapita').textContent = '$' + Math.round(stats.gdpPerCapita).toLocaleString();
        
        // Display healthcare statistics
        document.getElementById('accessToHealthcare').textContent = stats.accessToHealthcare.toFixed(1) + '%';
        document.getElementById('healthcareIndex').textContent = stats.healthcareIndex.toFixed(2);
        
        // Display happiness statistics
        document.getElementById('happiness').textContent = stats.happiness.toFixed(1) + '%';
        document.getElementById('happinessIndex').textContent = 'Index: ' + stats.happinessIndex.toFixed(2);
        
        // Display environmental statistics
        document.getElementById('environmentalQuality').textContent = stats.environmentalQuality.toFixed(1) + '%';
        document.getElementById('environmentIndex').textContent = 'Index: ' + stats.environmentIndex.toFixed(2);
        
        // Display education statistics with animated bars
        this.displayEducationStats(stats.education);
        
        // Add click event listeners to stat cards
        setTimeout(() => {
            this.addStatisticsClickListeners();
        }, 100);
    }
    
    addStatisticsClickListeners() {
        const statCards = document.querySelectorAll('.stat-card');
        console.log('Found stat cards:', statCards.length); // Debug log
        
        statCards.forEach(card => {
            const label = card.querySelector('.stat-label');
            if (label) {
                console.log('Adding click listener to:', label.textContent); // Debug log
                
                // Remove existing click listeners to prevent duplicates
                card.removeEventListener('click', this.handleStatCardClick);
                
                // Add new click listener
                card.addEventListener('click', (e) => {
                    console.log('Stat card clicked:', label.textContent);
                    this.handleStatCardClick(e);
                });
            }
        });
    }
    
    addHealthcareClickListeners() {
        // This function is now redundant since addStatisticsClickListeners handles all cards
        // But keeping it for backward compatibility
        console.log('addHealthcareClickListeners called - now handled by addStatisticsClickListeners');
    }
    
    handleStatCardClick(e) {
        const card = e.currentTarget;
        const statType = this.getStatTypeFromCard(card);
        if (statType) {
            console.log('Clicked stat card:', statType); // Debug log
            this.showStatisticsHistory(statType);
        }
    }
    
    getStatTypeFromCard(card) {
        const label = card.querySelector('.stat-label').textContent;
        const statTypeMap = {
            'Total Population': 'population',
            'Homelessness Rate': 'homelessness',
            'Immigration Rate': 'immigration',
            'Wealth Inequality': 'wealthInequality',
            'Unemployment Rate': 'unemployment',
            'Available Jobs': 'availableJobs',
            'Access to Healthcare': 'accessToHealthcare',
            'Healthcare Index': 'healthcareIndex',
            'Happiness': 'happiness',
            'Environmental Quality': 'environmentalQuality',
            'GDP': 'gdp',
            'GDP per Capita': 'gdpPerCapita'
        };
        return statTypeMap[label] || null;
    }
    
    showStatisticsHistory(statType) {
        const history = this.gameState.statisticsHistory;
        if (!history) return;
        
        // Set modal title
        const statTypeNames = {
            'population': 'Population',
            'homelessness': 'Homelessness Rate',
            'immigration': 'Immigration Rate',
            'wealthInequality': 'Wealth Inequality',
            'unemployment': 'Unemployment Rate',
            'availableJobs': 'Available Jobs',
            'accessToHealthcare': 'Access to Healthcare',
            'healthcareIndex': 'Healthcare Index',
            'happiness': 'Happiness',
            'environmentalQuality': 'Environmental Quality',
            'gdp': 'GDP',
            'gdpPerCapita': 'GDP per Capita'
        };
        
        document.getElementById('historyModalTitle').textContent = `${statTypeNames[statType]} - Historical Trends`;
        
        // Draw chart
        this.drawHistoryChart(statType, history);
        
        // Generate summary
        this.generateHistorySummary(statType, history);
        
        // Show/hide unemployment breakdown based on stat type
        const unemploymentBreakdownElement = document.getElementById('modalUnemploymentBreakdown');
        if (statType === 'unemployment') {
            unemploymentBreakdownElement.style.display = 'block';
            // Display the breakdown data
            if (this.gameState.statistics && this.gameState.statistics.unemployment.breakdown) {
                this.displayModalUnemploymentBreakdown(this.gameState.statistics.unemployment.breakdown);
            }
        } else {
            unemploymentBreakdownElement.style.display = 'none';
        }
        
        // Show/hide homelessness breakdown based on stat type
        const homelessnessBreakdownElement = document.getElementById('modalHomelessnessBreakdown');
        if (statType === 'homelessness') {
            homelessnessBreakdownElement.style.display = 'block';
            // Display the breakdown data
            if (this.gameState.statistics && this.gameState.statistics.homelessness.breakdown) {
                this.displayModalHomelessnessBreakdown(this.gameState.statistics.homelessness.breakdown);
            }
        } else {
            homelessnessBreakdownElement.style.display = 'none';
        }
        
        // Show/hide available jobs sector breakdown based on stat type
        const availableJobsBreakdownElement = document.getElementById('modalAvailableJobsBreakdown');
        if (statType === 'availableJobs') {
            availableJobsBreakdownElement.style.display = 'block';
            // Display the sector breakdown data
            if (this.gameState.statistics && this.gameState.statistics.availableJobs.sectors) {
                this.displayModalAvailableJobsBreakdown(this.gameState.statistics.availableJobs.sectors);
            }
        } else {
            availableJobsBreakdownElement.style.display = 'none';
        }
        
        // Show modal
        document.getElementById('statisticsHistoryModal').style.display = 'block';
        
        // Add click outside to close functionality
        document.getElementById('statisticsHistoryModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('statisticsHistoryModal')) {
                this.closeStatisticsHistory();
            }
        });
        
        // Ensure close button works
        const closeButton = document.querySelector('#statisticsHistoryModal .close');
        if (closeButton) {
            closeButton.onclick = () => this.closeStatisticsHistory();
        }
    }
    
    drawHistoryChart(statType, history) {
        const canvas = document.getElementById('historyChart');
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Chart dimensions
        const margin = 60;
        const chartWidth = canvas.width - 2 * margin;
        const chartHeight = canvas.height - 2 * margin;
        
        // Extract data
        const timePoints = history.map(h => h.timePoint);
        const values = history.map(h => this.getStatValue(h, statType));
        
        // Find min/max for scaling
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const valueRange = maxValue - minValue;
        const padding = valueRange * 0.1; // 10% padding
        
        // Draw axes
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, canvas.height - margin);
        ctx.lineTo(canvas.width - margin, canvas.height - margin);
        ctx.stroke();
        
        // Draw grid lines
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = margin + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(margin, y);
            ctx.lineTo(canvas.width - margin, y);
            ctx.stroke();
        }
        
        // Draw vertical line at Year 5 to indicate current government
        const year5Index = timePoints.findIndex(tp => tp === 'Year 5');
        if (year5Index !== -1) {
            const year5X = margin + (chartWidth / (timePoints.length - 1)) * year5Index;
            
            // Draw dashed vertical line
            ctx.strokeStyle = '#a0aec0';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]); // Dashed line pattern
            ctx.beginPath();
            ctx.moveTo(year5X, margin);
            ctx.lineTo(year5X, canvas.height - margin);
            ctx.stroke();
            ctx.setLineDash([]); // Reset line dash
            
            // Add "Current Government" label
            ctx.fillStyle = '#718096';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.save();
            ctx.translate(year5X, canvas.height - margin + 35);
            ctx.rotate(-Math.PI / 2); // Rotate text 90 degrees
            ctx.fillText('Current Government', 0, 0);
            ctx.restore();
        }
        
        // Draw data line
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        values.forEach((value, index) => {
            const x = margin + (chartWidth / (values.length - 1)) * index;
            const y = canvas.height - margin - ((value - minValue + padding) / (valueRange + 2 * padding)) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // Draw data points with special styling for Year 6
        values.forEach((value, index) => {
            const x = margin + (chartWidth / (values.length - 1)) * index;
            const y = canvas.height - margin - ((value - minValue + padding) / (valueRange + 2 * padding)) * chartHeight;
            
            // Special styling for Year 6 (if it exists)
            if (timePoints[index] === 'Year 6') {
                // Draw a larger, highlighted point for Year 6
                ctx.fillStyle = '#f56565'; // Red color for Year 6
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, 2 * Math.PI);
                ctx.fill();
                
                // Add a white border
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, 2 * Math.PI);
                ctx.stroke();
            } else {
                // Regular styling for other years
                ctx.fillStyle = '#667eea';
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
        
        // Draw labels
        ctx.fillStyle = '#4a5568';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        // X-axis labels
        timePoints.forEach((timePoint, index) => {
            const x = margin + (chartWidth / (timePoints.length - 1)) * index;
            ctx.fillText(timePoint, x, canvas.height - margin + 20);
        });
        
        // Y-axis labels
        ctx.textAlign = 'right';
        for (let i = 0; i <= 4; i++) {
            const value = minValue + (valueRange / 4) * i;
            const y = canvas.height - margin - (chartHeight / 4) * i;
            ctx.fillText(this.formatStatValue(value, statType), margin - 10, y + 4);
        }
    }
    
    getStatValue(historyPoint, statType) {
        // Handle both history points and effects objects
        if (historyPoint.homelessness && typeof historyPoint.homelessness === 'object') {
            // This is a history point
            switch (statType) {
                case 'population':
                    return historyPoint.population;
                case 'homelessness':
                    return historyPoint.homelessness.rate;
                case 'immigration':
                    return historyPoint.immigration.rate;
                case 'wealthInequality':
                    return historyPoint.wealthInequality;
                case 'unemployment':
                    return historyPoint.unemployment.rate;
                case 'availableJobs':
                    return historyPoint.availableJobs.count;
                case 'accessToHealthcare':
                    return historyPoint.accessToHealthcare;
                case 'healthcareIndex':
                    return historyPoint.healthcareIndex;
                case 'happiness':
                    return historyPoint.happiness;
                case 'environmentalQuality':
                    return historyPoint.environmentalQuality;
                case 'gdp':
                    return historyPoint.gdp;
                case 'gdpPerCapita':
                    return historyPoint.gdpPerCapita;
                default:
                    return 0;
            }
        } else {
            // This is an effects object (originalStats or newStats)
            switch (statType) {
                case 'population':
                    return historyPoint.population || 0;
                case 'homelessness':
                    return historyPoint.homelessness?.rate || 0;
                case 'immigration':
                    return historyPoint.immigration?.rate || 0;
                case 'wealthInequality':
                    return historyPoint.wealthInequality || 0;
                case 'unemployment':
                    return historyPoint.unemployment?.rate || 0;
                case 'availableJobs':
                    return historyPoint.availableJobs?.count || 0;
                case 'accessToHealthcare':
                    return historyPoint.accessToHealthcare || 0;
                case 'healthcareIndex':
                    return historyPoint.healthcareIndex || 0;
                case 'gdp':
                    return historyPoint.gdp || 0;
                case 'gdpPerCapita':
                    return historyPoint.gdpPerCapita || 0;
                default:
                    return 0;
            }
        }
    }
    
    formatStatValue(value, statType) {
        switch (statType) {
            case 'population':
                return (value / 1000000).toFixed(0) + 'M';
            case 'homelessness':
            case 'immigration':
            case 'unemployment':
            case 'accessToHealthcare':
            case 'happiness':
            case 'environmentalQuality':
                return value.toFixed(1) + '%';
            case 'availableJobs':
                return Math.round(value).toLocaleString();
            case 'healthcareIndex':
            case 'happinessIndex':
            case 'environmentIndex':
                return value.toFixed(2);
            case 'wealthInequality':
                return value.toFixed(1) + ':1';
            case 'gdp':
                return '$' + value.toFixed(0) + 'B';
            case 'gdpPerCapita':
                return '$' + Math.round(value).toLocaleString();
            default:
                return value.toFixed(1);
        }
    }
    
    generateHistorySummary(statType, history) {
        const values = history.map(h => this.getStatValue(h, statType));
        const firstValue = values[0];
        const lastValue = values[values.length - 1];
        const change = lastValue - firstValue;
        const changePercent = (change / firstValue) * 100;
        
        let trend = 'neutral';
        let trendText = 'stable';
        if (changePercent > 5) {
            trend = 'positive';
            trendText = 'increasing';
        } else if (changePercent < -5) {
            trend = 'negative';
            trendText = 'decreasing';
        }
        
        // Check if Year 6 exists (indicating policy effects)
        const hasYear6 = history.some(h => h.timePoint === 'Year 6');
        let recentChangeText = '';
        
        if (hasYear6) {
            const year5Value = history.find(h => h.timePoint === 'Year 5');
            const year6Value = history.find(h => h.timePoint === 'Year 6');
            
            if (year5Value && year6Value) {
                const recentChange = this.getStatValue(year6Value, statType) - this.getStatValue(year5Value, statType);
                const recentChangePercent = (recentChange / this.getStatValue(year5Value, statType)) * 100;
                
                // Calculate event impact and minister impact separately
                let eventImpactText = '';
                let ministerImpactText = '';
                let totalEventImpact = 0;
                let totalMinisterImpact = 0;
                
                // Event impact (from lastEventEffects)
                if (this.gameState.lastEventEffects && this.gameState.lastEventEffects.originalStats && this.gameState.lastEventEffects.newStats) {
                    const eventOriginalValue = this.getStatValueFromEffects(this.gameState.lastEventEffects.originalStats, statType);
                    const eventNewValue = this.getStatValueFromEffects(this.gameState.lastEventEffects.newStats, statType);
                    
                    if (eventOriginalValue !== null && eventNewValue !== null) {
                        totalEventImpact = eventNewValue - eventOriginalValue;
                        const eventChangePercent = (totalEventImpact / eventOriginalValue) * 100;
                        eventImpactText = `<p><strong>Event Impact:</strong> ${this.formatStatValue(totalEventImpact, statType)} (${eventChangePercent.toFixed(1)}%)</p>`;
                    }
                }
                
                // Minister impact (from lastDailyBoosts)
                if (this.gameState.lastDailyBoosts) {
                    totalMinisterImpact = this.getMinisterBoostForStat(statType, this.gameState.lastDailyBoosts);
                    if (totalMinisterImpact !== 0) {
                        const ministerChangePercent = (totalMinisterImpact / this.getStatValue(year5Value, statType)) * 100;
                        ministerImpactText = `<p><strong>Minister Impact:</strong> ${this.formatStatValue(totalMinisterImpact, statType)} (${ministerChangePercent.toFixed(1)}%)</p>`;
                    }
                }
                
                // Calculate combined impact
                const combinedImpact = totalEventImpact + totalMinisterImpact;
                const combinedImpactPercent = (combinedImpact / this.getStatValue(year5Value, statType)) * 100;
                
                // Combine both impacts
                if (eventImpactText || ministerImpactText) {
                    recentChangeText = `<p><strong>Total Policy Impact (Year 5 → Year 6):</strong> ${this.formatStatValue(combinedImpact, statType)} (${combinedImpactPercent.toFixed(1)}%)</p>`;
                    if (eventImpactText) recentChangeText += eventImpactText;
                    if (ministerImpactText) recentChangeText += ministerImpactText;
                } else {
                    recentChangeText = `<p><strong>Policy Impact (Year 5 → Year 6):</strong> ${this.formatStatValue(recentChange, statType)} (${recentChangePercent.toFixed(1)}%)</p>`;
                }
            }
        }
        
        const summary = `
            <h3>Trend Analysis</h3>
            <p><strong>Current Value:</strong> ${this.formatStatValue(lastValue, statType)}</p>
            <p><strong>5-Year Change:</strong> ${this.formatStatValue(change, statType)} (${changePercent.toFixed(1)}%)</p>
            ${recentChangeText}
            <p><strong>Trend:</strong> <span class="trend ${trend}">${trendText}</span></p>
            <p><strong>Peak:</strong> ${this.formatStatValue(Math.max(...values), statType)} in ${history[values.indexOf(Math.max(...values))].timePoint}</p>
            <p><strong>Lowest:</strong> ${this.formatStatValue(Math.min(...values), statType)} in ${history[values.indexOf(Math.min(...values))].timePoint}</p>
        `;
        
        document.getElementById('historySummary').innerHTML = summary;
    }
    
    closeStatisticsHistory() {
        document.getElementById('statisticsHistoryModal').style.display = 'none';
    }

    // News: storage and rendering
    addNewsItem(item) {
        if (!this.gameState.news) this.gameState.news = [];
        const timestamp = new Date().toLocaleString();
        const normalized = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            title: item.title || 'Update',
            content: item.content || '',
            meta: item.meta || '',
            sentiment: item.sentiment || 'neutral',
            type: item.type || 'general',
            timestamp
        };
        this.gameState.news.unshift(normalized);
        if (this.gameState.news.length > 100) this.gameState.news.pop();
        this.autoSave(); // Auto-save when news is added
        if (document.getElementById('newsScreen') && document.getElementById('newsScreen').style.display !== 'none') {
            this.renderNews();
        }
    }

    showNews() {
        this.renderNews();
        this.showScreen('newsScreen');
    }
    
    showPlayers() {
        this.showScreen('playersScreen');
    }
    
    // Show save menu with slots
    showSaveMenu() {
        this.showScreen('saveMenuScreen');
        // Use setTimeout to ensure the screen is visible before rendering
        setTimeout(() => {
            this.renderSaveSlots();
        }, 100);
    }
    
    // Render save slots
    renderSaveSlots() {
        const container = document.getElementById('saveSlotsContainer');
        if (!container) {
            console.error('Save slots container not found!');
            return;
        }
        
        let html = '';
        for (let slot = 1; slot <= 4; slot++) {
            const slotInfo = this.getSlotInfo(slot);
            const saveDate = slotInfo.exists ? new Date(slotInfo.timestamp).toLocaleString() : '';
            
            html += `
                <div class="save-slot ${slotInfo.exists ? 'occupied' : 'empty'}">
                    <div class="slot-header">
                        <h3>Slot ${slot}</h3>
                        <div class="slot-actions">
                            <button class="btn btn-primary" onclick="game.saveToSlot(${slot})">
                                <i class="fas fa-save"></i> Save Here
                            </button>
                            ${slotInfo.exists ? `
                                <button class="btn btn-danger" onclick="game.deleteSlot(${slot})">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    <div class="slot-content">
                        ${slotInfo.exists ? `
                            <div class="slot-info">
                                <div class="info-item">
                                    <i class="fas fa-flag"></i>
                                    <span>Party: ${slotInfo.partyName}</span>
                                </div>
                                <div class="info-item">
                                    <i class="fas fa-calendar"></i>
                                    <span>Day: ${slotInfo.day}</span>
                                </div>
                                <div class="info-item">
                                    <i class="fas fa-clock"></i>
                                    <span>Saved: ${saveDate}</span>
                                </div>
                            </div>
                        ` : `
                            <div class="empty-slot">
                                <i class="fas fa-folder-open"></i>
                                <p>Empty Slot</p>
                            </div>
                        `}
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
        console.log('Save slots rendered:', html.length > 0 ? 'Success' : 'Empty');
    }
    
    // Render load slots
    renderLoadSlots() {
        const container = document.getElementById('loadSlotsContainer');
        if (!container) {
            console.error('Load slots container not found!');
            return;
        }
        
        let html = '';
        for (let slot = 1; slot <= 4; slot++) {
            const slotInfo = this.getSlotInfo(slot);
            const saveDate = slotInfo.exists ? new Date(slotInfo.timestamp).toLocaleString() : '';
            
            html += `
                <div class="load-slot ${slotInfo.exists ? 'occupied' : 'empty'}">
                    <div class="slot-header">
                        <h3>Slot ${slot}</h3>
                        <div class="slot-actions">
                            ${slotInfo.exists ? `
                                <button class="btn btn-primary" onclick="game.loadFromSlot(${slot})">
                                    <i class="fas fa-play"></i> Load
                                </button>
                                <button class="btn btn-danger" onclick="game.deleteSlot(${slot})">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            ` : `
                                <button class="btn btn-secondary" onclick="game.saveToSlot(${slot})">
                                    <i class="fas fa-save"></i> Save Here
                                </button>
                            `}
                        </div>
                    </div>
                    <div class="slot-content">
                        ${slotInfo.exists ? `
                            <div class="slot-info">
                                <div class="info-item">
                                    <i class="fas fa-flag"></i>
                                    <span>Party: ${slotInfo.partyName}</span>
                                </div>
                                <div class="info-item">
                                    <i class="fas fa-calendar"></i>
                                    <span>Day: ${slotInfo.day}</span>
                                </div>
                                <div class="info-item">
                                    <i class="fas fa-clock"></i>
                                    <span>Saved: ${saveDate}</span>
                                </div>
                            </div>
                        ` : `
                            <div class="empty-slot">
                                <i class="fas fa-folder-open"></i>
                                <p>Empty Slot</p>
                            </div>
                        `}
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
        console.log('Load slots rendered:', html.length > 0 ? 'Success' : 'Empty');
    }

    renderNews() {
        const list = document.getElementById('newsList');
        if (!list) return;
        if (!this.gameState.news || this.gameState.news.length === 0) {
            list.innerHTML = '<div class="news-item neutral"><div class="news-title">No news yet</div><div class="news-meta">Make decisions to generate headlines</div></div>';
            return;
        }
        list.innerHTML = this.gameState.news.map(n => `
            <div class="news-item ${n.sentiment}">
                <div class="news-header">
                    <i class="fas fa-newspaper"></i>
                    <div class="news-title">${n.title}</div>
                </div>
                <div class="news-meta">${n.timestamp}${n.meta ? ' • ' + n.meta : ''}</div>
                <div class="news-content">${n.content}</div>
            </div>
        `).join('');
    }
    displayEducationStats(education) {
        const educationLevels = ['phd', 'masters', 'bachelors', 'highSchool', 'middleSchool', 'elementary', 'noSchool'];
        
        educationLevels.forEach(level => {
            const percentage = education[level];
            const percentageElement = document.getElementById(level + 'Percentage');
            const barElement = document.getElementById(level + 'Bar');
            
            if (percentageElement && barElement) {
                percentageElement.textContent = percentage.toFixed(1) + '%';
                
                // Animate the bar
                setTimeout(() => {
                    barElement.style.width = percentage + '%';
                }, 100);
            }
        });
    }
    
    displayUnemploymentBreakdown(breakdown) {
        const breakdownTypes = ['noAvailableJobs', 'physicalHandicap', 'mentalHealth', 'lackOfSkills', 'ageDiscrimination', 'seasonalWork', 'companyClosure'];
        
        breakdownTypes.forEach(type => {
            const percentage = breakdown[type];
            const percentageElement = document.getElementById(type + 'Percentage');
            const barElement = document.getElementById(type + 'Bar');
            
            if (percentageElement && barElement) {
                percentageElement.textContent = percentage.toFixed(1) + '%';
                
                // Animate the bar
                setTimeout(() => {
                    barElement.style.width = percentage + '%';
                }, 200); // Slightly longer delay for visual effect
            }
        });
    }
    
    displayModalUnemploymentBreakdown(breakdown) {
        const breakdownTypes = ['noAvailableJobs', 'physicalHandicap', 'mentalHealth', 'lackOfSkills', 'ageDiscrimination', 'seasonalWork', 'companyClosure'];
        
        breakdownTypes.forEach(type => {
            const percentage = breakdown[type];
            const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
            const percentageElement = document.getElementById('modal' + capitalizedType + 'Percentage');
            const barElement = document.getElementById('modal' + capitalizedType + 'Bar');
            
            if (percentageElement && barElement) {
                percentageElement.textContent = percentage.toFixed(1) + '%';
                
                // Reset bar width first
                barElement.style.width = '0%';
                
                // Animate the bar
                setTimeout(() => {
                    barElement.style.width = percentage + '%';
                }, 300); // Delay for modal animation
            }
        });
    }
    
    displayModalHomelessnessBreakdown(breakdown) {
        const breakdownTypes = ['economicHardship', 'mentalHealth', 'substanceAbuse', 'domesticViolence', 'familyBreakdown', 'eviction', 'youthRunaway', 'disability'];
        
        breakdownTypes.forEach(type => {
            const percentage = breakdown[type];
            const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
            const percentageElement = document.getElementById('modal' + capitalizedType + 'Percentage');
            const barElement = document.getElementById('modal' + capitalizedType + 'Bar');
            
            if (percentageElement && barElement) {
                percentageElement.textContent = percentage.toFixed(1) + '%';
                
                // Reset bar width first
                barElement.style.width = '0%';
                
                // Animate the bar
                setTimeout(() => {
                    barElement.style.width = percentage + '%';
                }, 300); // Delay for modal animation
            }
        });
    }
    
    displayModalAvailableJobsBreakdown(sectors) {
        const sectorTypes = ['healthcare', 'technology', 'education', 'construction', 'retail', 'manufacturing', 'hospitality', 'finance'];
        
        sectorTypes.forEach(sector => {
            const percentage = sectors[sector];
            const capitalizedSector = sector.charAt(0).toUpperCase() + sector.slice(1);
            const percentageElement = document.getElementById('modal' + capitalizedSector + 'Percentage');
            const barElement = document.getElementById('modal' + capitalizedSector + 'Bar');
            
            if (percentageElement && barElement) {
                percentageElement.textContent = percentage.toFixed(1) + '%';
                
                // Reset bar width first
                barElement.style.width = '0%';
                
                // Animate the bar
                setTimeout(() => {
                    barElement.style.width = percentage + '%';
                }, 400); // Slightly longer delay for visual effect
            }
        });
    }
    
    
    proceedToSecurity() {
        this.showCoalitionSecurity();
    }
    
    showCoalitionSecurity() {
        const security = this.calculateCoalitionSecurity();
        this.displayCoalitionSecurity(security);
        this.showScreen('securityScreen');
    }
    
    calculateCoalitionSecurity() {
        if (this.gameState.allParties.length === 0) return 0.0;
        
        const coalitionParties = this.gameState.allParties.filter(party => party.inCoalition);
        
        if (coalitionParties.length === 1) {
            return 100.0; // Single-party coalition is automatically secure
        }
        
        if (coalitionParties.length === 0) {
            return 0.0; // No coalition
        }
        
        // Calculate ideological coherence with much heavier weighting
        let totalCoherence = 0.0;
        let comparisonCount = 0;
        
        for (let i = 0; i < coalitionParties.length; i++) {
            for (let j = i + 1; j < coalitionParties.length; j++) {
                const socialDiff = Math.abs(coalitionParties[i].socialValue - coalitionParties[j].socialValue);
                const economicDiff = Math.abs(coalitionParties[i].economicValue - coalitionParties[j].economicValue);
                
                // Calculate Euclidean distance (more accurate than simple sum)
                const ideologicalDistance = Math.sqrt(socialDiff * socialDiff + economicDiff * economicDiff);
                
                // Convert distance to coherence score (closer = higher coherence)
                // Maximum distance is ~14.14 (from 0,0 to 10,10)
                const maxDistance = Math.sqrt(200); // sqrt(10^2 + 10^2)
                const normalizedDistance = ideologicalDistance / maxDistance; // 0 to 1
                
                // Coherence score: 1.0 for identical, 0.0 for completely opposite
                const pairCoherence = 1.0 - normalizedDistance;
                
                // Apply exponential penalty for large differences
                const coherenceScore = Math.pow(pairCoherence, 2); // Square to heavily penalize differences
                
                totalCoherence += coherenceScore;
                comparisonCount++;
            }
        }
        
        if (comparisonCount === 0) return 100.0;
        
        const averageCoherence = totalCoherence / comparisonCount;
        
        // Convert coherence to security percentage with heavy weighting
        // Very similar parties (coherence > 0.8) get high security
        // Moderately similar (coherence 0.5-0.8) get medium security  
        // Very different (coherence < 0.5) get low security
        let security;
        if (averageCoherence >= 0.8) {
            security = 80 + (averageCoherence - 0.8) * 100; // 80-100%
        } else if (averageCoherence >= 0.6) {
            security = 60 + (averageCoherence - 0.6) * 100; // 60-80%
        } else if (averageCoherence >= 0.4) {
            security = 40 + (averageCoherence - 0.4) * 100; // 40-60%
        } else if (averageCoherence >= 0.2) {
            security = 20 + (averageCoherence - 0.2) * 100; // 20-40%
        } else {
            security = averageCoherence * 100; // 0-20%
        }
        
        return Math.max(0.0, Math.min(100.0, security));
    }
    
    displayCoalitionSecurity(security) {
        document.getElementById('securityScore').textContent = security.toFixed(1) + '%';
        
        const coalitionParties = this.gameState.allParties.filter(party => party.inCoalition);
        
        let analysisHTML = '';
        if (security >= 80) {
            analysisHTML = '<h4>Very Secure</h4><p>The coalition is very secure. Parties are ideologically aligned and likely to work together effectively.</p>';
        } else if (security >= 60) {
            analysisHTML = '<h4>Moderately Secure</h4><p>The coalition is moderately secure. Some ideological differences exist but parties can likely find common ground.</p>';
        } else if (security >= 40) {
            analysisHTML = '<h4>Somewhat Unstable</h4><p>The coalition is somewhat unstable. Significant ideological differences may cause conflicts and disagreements.</p>';
        } else if (security >= 20) {
            analysisHTML = '<h4>Highly Unstable</h4><p>The coalition is highly unstable. Major ideological conflicts are likely to cause frequent disputes and potential collapse.</p>';
        } else {
            analysisHTML = '<h4>Extremely Unstable</h4><p>The coalition is extremely unstable. Parties are fundamentally opposed and the coalition is likely to collapse soon.</p>';
        }
        
        document.getElementById('securityAnalysis').innerHTML = analysisHTML;
        
        // Generate ideology charts
        this.generateIdeologyCharts();
        
        let detailsHTML = '<h3>Coalition Composition</h3>';
        detailsHTML += `<p>Number of parties in coalition: ${coalitionParties.length}</p>`;
        
        if (coalitionParties.length === 1) {
            detailsHTML += `<p>Single-party coalition detected!</p>`;
            detailsHTML += `<p>Coalition party: ${coalitionParties[0].name}</p>`;
        } else if (coalitionParties.length === 0) {
            detailsHTML += `<p>No coalition parties found!</p>`;
        } else {
            detailsHTML += '<h4>Coalition parties:</h4>';
            coalitionParties.forEach(party => {
                detailsHTML += `<p>- ${party.name} (${party.percentage}%)</p>`;
                detailsHTML += `<p>  Social: ${party.socialIdeology} (${party.socialValue}/10)</p>`;
                detailsHTML += `<p>  Economic: ${party.economicIdeology} (${party.economicValue}/10)</p>`;
            });
        }
        
        document.getElementById('coalitionDetails').innerHTML = detailsHTML;
    }
    
    generateIdeologyCharts() {
        const coalitionParties = this.gameState.allParties.filter(party => party.inCoalition);
        
        // Generate Economic Axis
        this.generateAxisChart('economicAxis', coalitionParties, 'economicValue', 'Economic');
        
        // Generate Social Axis
        this.generateAxisChart('socialAxis', coalitionParties, 'socialValue', 'Social');
    }
    
    generateAxisChart(axisId, parties, valueProperty, axisType) {
        const axisElement = document.getElementById(axisId);
        
        // Clear existing markers
        const existingMarkers = axisElement.querySelectorAll('.party-marker');
        existingMarkers.forEach(marker => marker.remove());
        
        if (parties.length === 0) {
            return;
        }
        
        parties.forEach((party, index) => {
            // Calculate position (0-10 scale to 0-100% position)
            const position = (party[valueProperty] / 10) * 100;
            
            // Create party marker
            const marker = document.createElement('div');
            marker.className = `party-marker ${party.inCoalition ? 'coalition' : 'opposition'}`;
            marker.style.left = `${position}%`;
            marker.style.transform = 'translateX(-50%)';
            marker.textContent = party.name[0].toUpperCase();
            marker.title = `${party.name}: ${axisType} ${party[valueProperty]}/10`;
            
            // Add click event for tooltip
            marker.addEventListener('click', () => {
                this.showPartyTooltip(party, marker);
            });
            
            axisElement.appendChild(marker);
        });
    }
    
    showPartyTooltip(party, marker) {
        // Remove existing tooltip
        const existingTooltip = document.querySelector('.party-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'party-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-header">${party.name}</div>
            <div class="tooltip-details">
                <div>Economic: ${party.economicIdeology} (${party.economicValue}/10)</div>
                <div>Social: ${party.socialIdeology} (${party.socialValue}/10)</div>
                <div>Control: ${party.percentage}%</div>
                <div>Status: ${party.inCoalition ? 'Coalition' : 'Opposition'}</div>
            </div>
        `;
        
        // Position tooltip
        const markerRect = marker.getBoundingClientRect();
        const axisRect = marker.closest('.axis-container').getBoundingClientRect();
        
        tooltip.style.position = 'absolute';
        tooltip.style.left = (markerRect.left - axisRect.left + markerRect.width / 2) + 'px';
        tooltip.style.top = '-120px';
        tooltip.style.transform = 'translateX(-50%)';
        tooltip.style.zIndex = '1000';
        
        marker.closest('.axis-container').appendChild(tooltip);
        
        // Remove tooltip after 3 seconds
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.remove();
            }
        }, 3000);
    }
    
    quitGame() {
        if (confirm('Are you sure you want to quit the game?')) {
            this.showScreen('welcomeScreen');
            this.resetGame();
        }
    }
    
    resetGame() {
        this.gameState = {
            currentDay: 1,
            partyControlPercentage: 0,
            taxRate: 25.0,
            socialIdeology: '',
            economicIdeology: '',
            socialValue: 5,
            economicValue: 5,
            partyName: '',
            playerChoice: '',
            gameRunning: true,
            budgetAllocationDone: false,
            allParties: [],
            budgetSubjects: []
        };
        this.initializeBudgetSubjects();
        this.updateGameStats();
    }
    
    getStatValueFromEffects(effectsStats, statType) {
        // Handle both history points and effects objects
        if (effectsStats.homelessness && typeof effectsStats.homelessness === 'object') {
            // This is an effects object (originalStats or newStats)
            switch (statType) {
                case 'population':
                    return effectsStats.population;
                case 'homelessness':
                    return effectsStats.homelessness.rate;
                case 'immigration':
                    return effectsStats.immigration.rate;
                case 'wealthInequality':
                    return effectsStats.wealthInequality;
                case 'unemployment':
                    return effectsStats.unemployment.rate;
                case 'availableJobs':
                    return effectsStats.availableJobs.count;
                case 'accessToHealthcare':
                    return effectsStats.accessToHealthcare;
                case 'healthcareIndex':
                    return effectsStats.healthcareIndex;
                case 'happiness':
                    return effectsStats.happiness;
                case 'environmentalQuality':
                    return effectsStats.environmentalQuality;
                case 'gdp':
                    return effectsStats.gdp;
                case 'gdpPerCapita':
                    return effectsStats.gdpPerCapita;
                default:
                    return null;
            }
        }
        return null;
    }
    
    getMinisterBoostForStat(statType, boosts) {
        switch (statType) {
            case 'gdp':
                return boosts.gdp;
            case 'unemployment':
                return boosts.unemployment;
            case 'homelessness':
                return boosts.homelessness;
            case 'immigration':
                return boosts.immigration;
            case 'wealthInequality':
                return boosts.wealthInequality;
            case 'accessToHealthcare':
                return boosts.healthcare;
            case 'healthcareIndex':
                return boosts.healthcare;
            case 'happiness':
                return boosts.happiness;
            case 'environmentalQuality':
                return boosts.environment;
            default:
                return 0;
        }
    }
}

// Global game instance
let game;

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    game = new PoliticalRPG();
});

// Global functions for HTML onclick handlers
function startGame() {
    game.startGame();
}

function closeStatisticsHistory() {
    if (window.game) {
        window.game.closeStatisticsHistory();
    } else {
        // Fallback: directly hide the modal
        const modal = document.getElementById('statisticsHistoryModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

function selectPartyType(partyType) {
    game.selectPartyType(partyType);
}

function selectSocialIdeology(ideology) {
    game.selectSocialIdeology(ideology);
}

function selectEconomicIdeology(ideology) {
    game.selectEconomicIdeology(ideology);
}

function setPartyName() {
    game.setPartyName();
}

function showGameScreen() {
    game.showGameScreen();
}

function showGovernmentOverview() {
    game.showGovernmentOverview();
}

function showGovernmentScreen() {
    game.showGovernmentOverview();
}

function showPoliticalCompass() {
    game.showPoliticalCompass();
}

function showCompassScreen() {
    game.showPoliticalCompass();
}

function advanceDay() {
    game.advanceDay();
}

function adjustBudget(subjectIndex, amount) {
    game.adjustBudget(subjectIndex, amount);
}

function finalizeBudget() {
    game.finalizeBudget();
}

function resetBudget() {
    game.resetBudget();
}

function quitGame() {
    game.quitGame();
}
