#include <iostream>
#include <string>
#include <vector>
#include <limits>
#include <random>
#include <chrono>
#include <cstdlib>
#include <algorithm>
#include <iomanip>
#ifdef _WIN32
#include <windows.h>
#endif

    struct Party {
        std::string name;
        std::string socialIdeology;
        std::string economicIdeology;
        int socialValue;      // 0-10 scale (0=Progressive, 10=Conservative)
        int economicValue;    // 0-10 scale (0=Left, 10=Right)
        int percentage;
        bool inCoalition;
    };
    
    struct BudgetSubject {
        std::string name;
        std::string description;
        int currentSpending;  // Current spending level (0-100)
        int baseSpending;     // Base spending level for reference
    };

class PoliticalRPG {
private:
    std::string playerChoice;
    std::string socialIdeology;
    std::string economicIdeology;
    int socialValue;      // 0-10 scale (0=Progressive, 10=Conservative)
    int economicValue;    // 0-10 scale (0=Left, 10=Right)
    std::string partyName;
    bool gameRunning;
    int partyControlPercentage;
    double taxRate;  // Tax rate as percentage (0.0-100.0)
    std::mt19937 rng;
    std::vector<Party> allParties;
    std::vector<BudgetSubject> budgetSubjects;
    bool budgetAllocationDone;
    int currentDay;
    
public:
    PoliticalRPG() : gameRunning(true), partyControlPercentage(0), taxRate(25.0), socialIdeology(""), economicIdeology(""), socialValue(5), economicValue(5), partyName(""), budgetAllocationDone(false), currentDay(1) {
        // Initialize random number generator with current time
        rng.seed(std::chrono::high_resolution_clock::now().time_since_epoch().count());
        initializeBudgetSubjects();
    }
    
    void initializeBudgetSubjects() {
        budgetSubjects = {
            {"Healthcare", "Public healthcare services and medical infrastructure", 25, 25},
            {"Education", "Schools, universities, and educational programs", 20, 20},
            {"Defense", "Military spending and national security", 15, 15},
            {"Infrastructure", "Roads, bridges, public transportation", 12, 12},
            {"Social Welfare", "Unemployment benefits, housing assistance", 10, 10},
            {"Environment", "Environmental protection and climate initiatives", 8, 8},
            {"Research & Development", "Scientific research and innovation funding", 5, 5},
            {"Law Enforcement", "Police, courts, and justice system", 3, 3},
            {"Foreign Aid", "International development and humanitarian aid", 1, 1},
            {"Culture & Arts", "Museums, theaters, and cultural programs", 1, 1}
        };
    }
    
    void displayBudgetMeeting() {
        clearScreen();
        displayPartyControl();
        
        std::cout << "========================================\n";
        std::cout << "        YEARLY BUDGET MEETING\n";
        std::cout << "========================================\n\n";
        
        std::cout << "Welcome to the annual budget allocation meeting!\n";
        std::cout << "You can adjust spending on each subject by +/- 5%.\n";
        
        // Display coalition economic ideology information
        if (canExceedBudget()) {
            std::cout << "Your left-wing coalition allows deficit spending (budget can exceed 100%).\n";
        } else {
            std::cout << "Your right-wing coalition requires balanced budget (total must be 100%).\n";
        }
        std::cout << "\n";
        
        // Display current budget
        std::cout << "CURRENT BUDGET ALLOCATION:\n";
        std::cout << "==========================\n";
        for (int i = 0; i < budgetSubjects.size(); i++) {
            std::cout << std::setw(2) << (i + 1) << ". " << std::setw(20) << std::left << budgetSubjects[i].name 
                      << " | " << std::setw(3) << budgetSubjects[i].currentSpending << "% | " 
                      << budgetSubjects[i].description << "\n";
        }
        
        std::cout << "\nTotal: " << getTotalBudget() << "%\n\n";
        
        // Budget adjustment interface
        bool budgetComplete = false;
        while (!budgetComplete) {
            std::cout << "What would you like to do?\n";
            std::cout << "1-10. Adjust spending for subject 1-10\n";
            std::cout << "11. Finalize budget\n";
            std::cout << "12. Reset to original budget\n\n";
            std::cout << "Enter your choice (1-12): ";
            
            int choice;
            if (!(std::cin >> choice)) {
                std::cin.clear();
                std::cin.ignore((std::numeric_limits<std::streamsize>::max)(), '\n');
                choice = 0;
            } else {
                std::cin.ignore((std::numeric_limits<std::streamsize>::max)(), '\n');
            }
            
            if (choice >= 1 && choice <= 10) {
                adjustBudgetSubject(choice - 1);
            } else if (choice == 11) {
                int totalBudget = getTotalBudget();
                bool canFinalize = false;
                
                if (canExceedBudget()) {
                    // Left-wing coalition can have deficit spending
                    canFinalize = true;
                    if (totalBudget > 100) {
                        std::cout << "\nBudget finalized with deficit spending! Total: " << totalBudget << "%\n";
                        std::cout << "Deficit: " << (totalBudget - 100) << "%\n";
                    } else {
                        std::cout << "\nBudget finalized! Total: " << totalBudget << "%\n";
                    }
                } else {
                    // Right-wing coalition requires balanced budget
                    if (totalBudget == 100) {
                        canFinalize = true;
                        std::cout << "\nBudget finalized! Total: " << totalBudget << "%\n";
                    } else {
                        std::cout << "\nError: Right-wing coalition requires balanced budget (100%). Current total: " << totalBudget << "%\n";
                    }
                }
                
                if (canFinalize) {
                    budgetComplete = true;
                    // Advance to day 2 and show coalition security
                    currentDay = 2;
                }
                std::cout << "Press Enter to continue...";
                std::cin.get();
            } else if (choice == 12) {
                resetBudget();
                std::cout << "\nBudget reset to original values.\n";
                std::cout << "Press Enter to continue...";
                std::cin.get();
            } else {
                std::cout << "\nInvalid choice! Please enter 1-12.\n";
                std::cout << "Press Enter to continue...";
                std::cin.get();
            }
            
            if (!budgetComplete) {
                clearScreen();
                displayPartyControl();
                std::cout << "========================================\n";
                std::cout << "        YEARLY BUDGET MEETING\n";
                std::cout << "========================================\n\n";
                
                std::cout << "CURRENT BUDGET ALLOCATION:\n";
                std::cout << "==========================\n";
                for (int i = 0; i < budgetSubjects.size(); i++) {
                    std::cout << std::setw(2) << (i + 1) << ". " << std::setw(20) << std::left << budgetSubjects[i].name 
                              << " | " << std::setw(3) << budgetSubjects[i].currentSpending << "% | " 
                              << budgetSubjects[i].description << "\n";
                }
                std::cout << "\nTotal: " << getTotalBudget() << "%\n\n";
            }
        }
        
        // After budget meeting is complete, show coalition security
        displayCoalitionSecurity();
    }
    
    void adjustBudgetSubject(int subjectIndex) {
        if (subjectIndex < 0 || subjectIndex >= budgetSubjects.size()) {
            std::cout << "\nInvalid subject index!\n";
            return;
        }
        
        BudgetSubject& subject = budgetSubjects[subjectIndex];
        
        std::cout << "\nAdjusting: " << subject.name << "\n";
        std::cout << "Current spending: " << subject.currentSpending << "%\n";
        std::cout << "Description: " << subject.description << "\n\n";
        
        std::cout << "What would you like to do?\n";
        std::cout << "1. Increase spending by 5%\n";
        std::cout << "2. Decrease spending by 5%\n";
        std::cout << "3. Cancel\n\n";
        std::cout << "Enter your choice (1-3): ";
        
        int choice;
        if (!(std::cin >> choice)) {
            std::cin.clear();
            std::cin.ignore((std::numeric_limits<std::streamsize>::max)(), '\n');
            choice = 0;
        } else {
            std::cin.ignore((std::numeric_limits<std::streamsize>::max)(), '\n');
        }
        
        switch (choice) {
            case 1:
                if (subject.currentSpending < 100) {
                    subject.currentSpending += 5;
                    
                    if (canExceedBudget()) {
                        // Left-wing coalition can increase spending without decreasing others
                        std::cout << "\nSpending increased by 5%!\n";
                    } else {
                        // Right-wing coalition must balance budget
                        if (!decreaseOtherSubject(subjectIndex, 5)) {
                            subject.currentSpending -= 5; // Revert if can't balance
                            std::cout << "\nCannot increase spending - no other subjects to decrease!\n";
                        } else {
                            std::cout << "\nSpending increased by 5%!\n";
                        }
                    }
                    // Recalculate tax rate after budget change
                    calculateTaxRate();
                } else {
                    std::cout << "\nCannot increase spending - already at maximum!\n";
                }
                break;
            case 2:
                if (subject.currentSpending > 0) {
                    subject.currentSpending -= 5;
                    
                    if (canExceedBudget()) {
                        // Left-wing coalition can decrease spending without increasing others
                        std::cout << "\nSpending decreased by 5%!\n";
                    } else {
                        // Right-wing coalition must balance budget
                        if (!increaseOtherSubject(subjectIndex, 5)) {
                            subject.currentSpending += 5; // Revert if can't balance
                            std::cout << "\nCannot decrease spending - no other subjects to increase!\n";
                        } else {
                            std::cout << "\nSpending decreased by 5%!\n";
                        }
                    }
                    // Recalculate tax rate after budget change
                    calculateTaxRate();
                } else {
                    std::cout << "\nCannot decrease spending - already at minimum!\n";
                }
                break;
            case 3:
                std::cout << "\nAdjustment cancelled.\n";
                break;
            default:
                std::cout << "\nInvalid choice!\n";
                break;
        }
        
        std::cout << "Press Enter to continue...";
        std::cin.get();
    }
    
    bool decreaseOtherSubject(int excludeIndex, int amount) {
        // Find a subject with enough spending to decrease
        for (int i = 0; i < budgetSubjects.size(); i++) {
            if (i != excludeIndex && budgetSubjects[i].currentSpending >= amount) {
                budgetSubjects[i].currentSpending -= amount;
                return true;
            }
        }
        return false;
    }
    
    bool increaseOtherSubject(int excludeIndex, int amount) {
        // Find a subject that can be increased
        for (int i = 0; i < budgetSubjects.size(); i++) {
            if (i != excludeIndex && budgetSubjects[i].currentSpending < 100) {
                budgetSubjects[i].currentSpending += amount;
                return true;
            }
        }
        return false;
    }
    
    int getTotalBudget() {
        int total = 0;
        for (const auto& subject : budgetSubjects) {
            total += subject.currentSpending;
        }
        return total;
    }
    
    void resetBudget() {
        for (auto& subject : budgetSubjects) {
            subject.currentSpending = subject.baseSpending;
        }
        // Recalculate tax rate after budget reset
        calculateTaxRate();
    }
    
    bool isCoalitionLeftWing() {
        if (allParties.empty()) return false;
        
        int totalCoalitionEconomicValue = 0;
        int totalCoalitionPercentage = 0;
        
        for (const auto& party : allParties) {
            if (party.inCoalition) {
                totalCoalitionEconomicValue += party.economicValue * party.percentage;
                totalCoalitionPercentage += party.percentage;
            }
        }
        
        if (totalCoalitionPercentage == 0) return false;
        
        // Calculate weighted average economic value (0-10 scale)
        double averageEconomicValue = (double)totalCoalitionEconomicValue / totalCoalitionPercentage;
        
        // Left-wing is 0-4, Right-wing is 6-10, Center is 4-6
        return averageEconomicValue <= 4.0;
    }
    
    bool canExceedBudget() {
        return isCoalitionLeftWing();
    }
    
    bool isPlayerInCoalition() {
        // Find the player's party and check if it's in the coalition
        for (const auto& party : allParties) {
            if (party.name == partyName) {
                return party.inCoalition;
            }
        }
        return false;
    }
    
    bool isCoalitionConservative() {
        if (allParties.empty()) return false;
        
        int totalCoalitionSocialValue = 0;
        int totalCoalitionPercentage = 0;
        
        for (const auto& party : allParties) {
            if (party.inCoalition) {
                totalCoalitionSocialValue += party.socialValue * party.percentage;
                totalCoalitionPercentage += party.percentage;
            }
        }
        
        if (totalCoalitionPercentage == 0) return false;
        
        // Calculate weighted average social value (0-10 scale)
        double averageSocialValue = (double)totalCoalitionSocialValue / totalCoalitionPercentage;
        
        // Conservative is 6-10, Progressive is 0-4, Center is 4-6
        return averageSocialValue >= 6.0;
    }
    
    void automaticBudgetAllocation() {
        clearScreen();
        displayPartyControl();
        
        std::cout << "========================================\n";
        std::cout << "      AUTOMATIC BUDGET ALLOCATION\n";
        std::cout << "========================================\n\n";
        
        std::cout << "Since your party is not in the coalition, the budget is automatically allocated\n";
        std::cout << "based on the current coalition's ideology.\n\n";
        
        // Store original budget for comparison
        std::vector<int> originalBudget;
        for (const auto& subject : budgetSubjects) {
            originalBudget.push_back(subject.currentSpending);
        }
        
        bool isLeftWing = isCoalitionLeftWing();
        bool isConservative = isCoalitionConservative();
        
        std::cout << "Coalition Analysis:\n";
        std::cout << "- Economic: " << (isLeftWing ? "Left-wing" : "Right-wing") << "\n";
        std::cout << "- Social: " << (isConservative ? "Conservative" : "Progressive") << "\n\n";
        
        // Apply budget changes based on coalition type
        if (isLeftWing) {
            // Left-wing coalitions increase overall budget
            std::cout << "Left-wing coalition increases overall spending:\n";
            
            // Increase key areas
            for (auto& subject : budgetSubjects) {
                if (subject.name == "Healthcare" || subject.name == "Education" || 
                    subject.name == "Social Welfare" || subject.name == "Environment") {
                    subject.currentSpending = (std::min)(100, subject.currentSpending + 5);
                    std::cout << "- " << subject.name << ": +5% (now " << subject.currentSpending << "%)\n";
                }
            }
        } else {
            // Right-wing coalitions decrease overall budget
            std::cout << "Right-wing coalition decreases overall spending:\n";
            
            // Decrease key areas
            for (auto& subject : budgetSubjects) {
                if (subject.name == "Social Welfare" || subject.name == "Environment" || 
                    subject.name == "Foreign Aid" || subject.name == "Research & Development") {
                    subject.currentSpending = (std::max)(0, subject.currentSpending - 5);
                    std::cout << "- " << subject.name << ": -5% (now " << subject.currentSpending << "%)\n";
                }
            }
        }
        
        // Apply social ideology preferences
        if (isConservative) {
            std::cout << "\nConservative coalition priorities:\n";
            
            // Conservatives typically increase defense and culture
            for (auto& subject : budgetSubjects) {
                if (subject.name == "Defense") {
                    subject.currentSpending = (std::min)(100, subject.currentSpending + 3);
                    std::cout << "- " << subject.name << ": +3% (now " << subject.currentSpending << "%)\n";
                } else if (subject.name == "Culture & Arts") {
                    subject.currentSpending = (std::min)(100, subject.currentSpending + 2);
                    std::cout << "- " << subject.name << ": +2% (now " << subject.currentSpending << "%)\n";
                }
            }
        } else {
            std::cout << "\nProgressive coalition priorities:\n";
            
            // Progressives typically increase education, healthcare, and research
            for (auto& subject : budgetSubjects) {
                if (subject.name == "Education" || subject.name == "Healthcare") {
                    subject.currentSpending = (std::min)(100, subject.currentSpending + 3);
                    std::cout << "- " << subject.name << ": +3% (now " << subject.currentSpending << "%)\n";
                } else if (subject.name == "Research & Development") {
                    subject.currentSpending = (std::min)(100, subject.currentSpending + 2);
                    std::cout << "- " << subject.name << ": +2% (now " << subject.currentSpending << "%)\n";
                }
            }
        }
        
        // Recalculate tax rate after budget changes
        calculateTaxRate();
        
        std::cout << "\nNew Total Budget: " << getTotalBudget() << "%\n";
        std::cout << "New Tax Rate: " << std::fixed << std::setprecision(1) << taxRate << "%\n\n";
        
        // Mark that budget allocation has been done
        budgetAllocationDone = true;
        
        std::cout << "Press Enter to continue...";
        std::cin.get();
        
        // Advance to day 2 and show coalition security
        currentDay = 2;
        displayCoalitionSecurity();
    }
    
    double calculateCoalitionSecurity() {
        if (allParties.empty()) return 0.0;
        
        // Count coalition parties
        std::vector<Party> coalitionParties;
        for (const auto& party : allParties) {
            if (party.inCoalition) {
                coalitionParties.push_back(party);
            }
        }
        
        // If only 1 party in coalition, it's automatically 100% secure
        if (coalitionParties.size() == 1) {
            return 100.0;
        }
        
        // If no coalition parties, return 0%
        if (coalitionParties.size() == 0) {
            return 0.0;
        }
        
        // Calculate total ideological differences between all coalition parties
        double totalDifference = 0.0;
        int comparisonCount = 0;
        
        for (int i = 0; i < coalitionParties.size(); i++) {
            for (int j = i + 1; j < coalitionParties.size(); j++) {
                // Calculate social ideology difference (0-10 scale)
                double socialDiff = std::abs(coalitionParties[i].socialValue - coalitionParties[j].socialValue);
                
                // Calculate economic ideology difference (0-10 scale)
                double economicDiff = std::abs(coalitionParties[i].economicValue - coalitionParties[j].economicValue);
                
                // Total difference for this pair (0-20 scale)
                double pairDifference = socialDiff + economicDiff;
                totalDifference += pairDifference;
                comparisonCount++;
            }
        }
        
        if (comparisonCount == 0) return 100.0;
        
        // Average difference per pair (0-20 scale)
        double averageDifference = totalDifference / comparisonCount;
        
        // Convert to security percentage (lower difference = higher security)
        // Scale: 0 difference = 100% security, 20 difference = 0% security
        double security = 100.0 - (averageDifference * 5.0); // 5% per point of difference
        
        // Clamp between 0% and 100%
        return (std::max)(0.0, (std::min)(100.0, security));
    }
    
    void displayCoalitionSecurity() {
        clearScreen();
        displayPartyControl();
        
        std::cout << "========================================\n";
        std::cout << "      COALITION SECURITY ANALYSIS\n";
        std::cout << "========================================\n\n";
        
        // Count coalition parties
        std::vector<Party> coalitionParties;
        for (const auto& party : allParties) {
            if (party.inCoalition) {
                coalitionParties.push_back(party);
            }
        }
        
        std::cout << "Coalition Composition:\n";
        std::cout << "Number of parties in coalition: " << coalitionParties.size() << "\n\n";
        
        if (coalitionParties.size() == 1) {
            std::cout << "Single-party coalition detected!\n";
            std::cout << "Coalition party: " << coalitionParties[0].name << "\n";
            std::cout << "Security Level: 100% (Single-party coalitions are automatically secure)\n\n";
        } else if (coalitionParties.size() == 0) {
            std::cout << "No coalition parties found!\n";
            std::cout << "Security Level: 0% (No coalition exists)\n\n";
        } else {
            std::cout << "Coalition parties:\n";
            for (const auto& party : coalitionParties) {
                std::cout << "- " << party.name << " (" << party.percentage << "%)\n";
                std::cout << "  Social: " << party.socialIdeology << " (" << party.socialValue << "/10)\n";
                std::cout << "  Economic: " << party.economicIdeology << " (" << party.economicValue << "/10)\n";
            }
            
            std::cout << "\nIdeological Analysis:\n";
            
            // Calculate and display differences
            double totalDifference = 0.0;
            int comparisonCount = 0;
            
            for (int i = 0; i < coalitionParties.size(); i++) {
                for (int j = i + 1; j < coalitionParties.size(); j++) {
                    double socialDiff = std::abs(coalitionParties[i].socialValue - coalitionParties[j].socialValue);
                    double economicDiff = std::abs(coalitionParties[i].economicValue - coalitionParties[j].economicValue);
                    double pairDifference = socialDiff + economicDiff;
                    
                    std::cout << "- " << coalitionParties[i].name << " vs " << coalitionParties[j].name << ": ";
                    std::cout << "Social diff: " << socialDiff << ", Economic diff: " << economicDiff;
                    std::cout << ", Total diff: " << pairDifference << "\n";
                    
                    totalDifference += pairDifference;
                    comparisonCount++;
                }
            }
            
            if (comparisonCount > 0) {
                double averageDifference = totalDifference / comparisonCount;
                std::cout << "\nAverage ideological difference: " << std::fixed << std::setprecision(1) << averageDifference << "/20\n";
            }
        }
        
        double security = calculateCoalitionSecurity();
        std::cout << "\n========================================\n";
        std::cout << "    COALITION SECURITY: " << std::fixed << std::setprecision(1) << security << "%\n";
        std::cout << "========================================\n\n";
        
        // Provide interpretation
        if (security >= 80) {
            std::cout << "The coalition is very secure. Parties are ideologically aligned\n";
            std::cout << "and likely to work together effectively.\n";
        } else if (security >= 60) {
            std::cout << "The coalition is moderately secure. Some ideological differences\n";
            std::cout << "exist but parties can likely find common ground.\n";
        } else if (security >= 40) {
            std::cout << "The coalition is somewhat unstable. Significant ideological\n";
            std::cout << "differences may cause conflicts and disagreements.\n";
        } else if (security >= 20) {
            std::cout << "The coalition is highly unstable. Major ideological conflicts\n";
            std::cout << "are likely to cause frequent disputes and potential collapse.\n";
        } else {
            std::cout << "The coalition is extremely unstable. Parties are fundamentally\n";
            std::cout << "opposed and the coalition is likely to collapse soon.\n";
        }
        
        std::cout << "\nPress Enter to continue...";
        std::cin.get();
    }
    
    void calculateTaxRate() {
        int totalBudget = getTotalBudget();
        
        // Base tax rate calculation
        double baseTaxRate = totalBudget * 0.25; // 25% tax rate per 100% budget
        
        // Coalition ideology modifier
        if (isCoalitionLeftWing()) {
            // Left-wing coalitions are more willing to tax
            baseTaxRate *= 1.0; // No reduction
        } else {
            // Right-wing coalitions prefer lower taxes
            baseTaxRate *= 0.8; // 20% reduction
        }
        
        // Add some randomness (±5%)
        double randomFactor = 0.95 + (rng() % 11) * 0.01; // 0.95 to 1.05
        baseTaxRate *= randomFactor;
        
        // Clamp tax rate between 10% and 60%
        taxRate = (std::max)(10.0, (std::min)(60.0, baseTaxRate));
    }
    
    void clearScreen() {
#ifdef _WIN32
        system("cls");
#else
        system("clear");
#endif
    }
    
    std::string generateSpectrum(int value, const std::string& leftLabel, const std::string& rightLabel) {
        std::string spectrum = leftLabel + " |";
        
        // Create 10 positions (0-9) for the spectrum
        // Ensure value is within bounds
        value = (std::max)(0, (std::min)(9, value));
        
        for (int i = 0; i < 10; i++) {
            if (i == value) {
                spectrum += "*";
            } else {
                spectrum += "-";
            }
        }
        
        spectrum += "| " + rightLabel;
        return spectrum;
    }
    
    void displayPartyControl() {
        std::cout << "========================================\n";
        std::cout << "    Day: " << currentDay << "\n";
        std::cout << "    Party Control: " << partyControlPercentage << "%\n";
        std::cout << "    Tax Rate: " << std::fixed << std::setprecision(1) << taxRate << "%\n";
        std::cout << "========================================\n\n";
    }
    
    int generatePartyControlPercentage(const std::string& partyType) {
        if (partyType.find("Small") != std::string::npos) {
            // Small party: 1-10%, weighted towards 4-5%
            // Use normal distribution centered around 4.5 with std dev 1.5
            std::normal_distribution<double> dist(4.5, 1.5);
            int percentage = static_cast<int>(std::round(dist(rng)));
            
            // Clamp to range 1-10
            percentage = (std::max)(1, (std::min)(10, percentage));
            return percentage;
        } else {
            // Big party: 10-75%, weighted towards 30-40%
            // Use normal distribution centered around 35 with std dev 8
            std::normal_distribution<double> dist(35.0, 8.0);
            int percentage = static_cast<int>(std::round(dist(rng)));
            
            // Clamp to range 10-75
            percentage = (std::max)(10, (std::min)(75, percentage));
            return percentage;
        }
    }
    
    void displaySocialIdeologyChoice() {
        clearScreen();
        displayPartyControl();
        std::cout << "Now choose your social ideology:\n\n";
        std::cout << "1. Conservative\n";
        std::cout << "2. Progressive\n\n";
        std::cout << "Enter your choice (1-2): ";
    }
    
    void displayEconomicIdeologyChoice() {
        clearScreen();
        displayPartyControl();
        std::cout << "Now choose your economic ideology:\n\n";
        std::cout << "1. Left (Socialist/Social Democratic)\n";
        std::cout << "2. Right (Free Market/Capitalist)\n\n";
        std::cout << "Enter your choice (1-2): ";
    }
    
    void handleSocialIdeologyChoice() {
        int choice;
        std::cin >> choice;
        
        // Clear input buffer
        std::cin.ignore((std::numeric_limits<std::streamsize>::max)(), '\n');
        
        switch(choice) {
            case 1:
                socialIdeology = "Conservative";
                socialValue = 7 + (rng() % 4); // 7-10 (Conservative range)
                clearScreen();
                displayPartyControl();
                std::cout << "You have chosen: Conservative social ideology\n";
                std::cout << "Conservative parties typically support traditional values,\n";
                std::cout << "law and order, and gradual social change.\n\n";
                break;
            case 2:
                socialIdeology = "Progressive";
                socialValue = rng() % 4; // 0-3 (Progressive range)
                clearScreen();
                displayPartyControl();
                std::cout << "You have chosen: Progressive social ideology\n";
                std::cout << "Progressive parties typically support social reform,\n";
                std::cout << "equality, and rapid social change.\n\n";
                break;
            default:
                clearScreen();
                displayPartyControl();
                std::cout << "Invalid choice! Please enter 1 or 2.\n\n";
                return;
        }
        
        // Continue to economic ideology choice
        displayEconomicIdeologyChoice();
        handleEconomicIdeologyChoice();
    }
    
    void handleEconomicIdeologyChoice() {
        int choice;
        std::cin >> choice;
        
        // Clear input buffer
        std::cin.ignore((std::numeric_limits<std::streamsize>::max)(), '\n');
        
        switch(choice) {
            case 1:
                economicIdeology = "Left";
                economicValue = rng() % 4; // 0-3 (Left range)
                clearScreen();
                displayPartyControl();
                std::cout << "You have chosen: Left economic ideology\n";
                std::cout << "Left-wing economics typically supports government intervention,\n";
                std::cout << "social welfare, and wealth redistribution.\n\n";
                break;
            case 2:
                economicIdeology = "Right";
                economicValue = 7 + (rng() % 4); // 7-10 (Right range)
                clearScreen();
                displayPartyControl();
                std::cout << "You have chosen: Right economic ideology\n";
                std::cout << "Right-wing economics typically supports free markets,\n";
                std::cout << "limited government, and individual responsibility.\n\n";
                break;
            default:
                clearScreen();
                displayPartyControl();
                std::cout << "Invalid choice! Please enter 1 or 2.\n\n";
                return;
        }
        
        // Continue to party naming
        displayPartyNaming();
        handlePartyNaming();
    }
    
    void displayPartyNaming() {
        clearScreen();
        displayPartyControl();
        std::cout << "Now give your party a name:\n\n";
        std::cout << "Enter your party name: ";
    }
    
    void handlePartyNaming() {
        std::getline(std::cin, partyName);
        
        // Trim whitespace
        partyName.erase(0, partyName.find_first_not_of(" \t\n\r"));
        partyName.erase(partyName.find_last_not_of(" \t\n\r") + 1);
        
        // Check if name is empty or too short
        if (partyName.empty() || partyName.length() < 2) {
            clearScreen();
            displayPartyControl();
            std::cout << "Party name must be at least 2 characters long.\n";
            std::cout << "Please enter a valid party name: ";
            handlePartyNaming();
            return;
        }
        
        // Check if name is too long
        if (partyName.length() > 50) {
            clearScreen();
            displayPartyControl();
            std::cout << "Party name is too long (maximum 50 characters).\n";
            std::cout << "Please enter a shorter party name: ";
            handlePartyNaming();
            return;
        }
        
        clearScreen();
        displayPartyControl();
        std::cout << "Your party has been named: " << partyName << "\n\n";
        std::cout << "Press Enter to continue...";
        std::cin.get();
        
        // Continue with the game
        continueGame();
    }
    
    void generateRandomParties() {
        std::vector<std::string> partyNames = {
            "National Unity Party", "Democratic Alliance", "Progressive Front", "Conservative Coalition",
            "Social Justice Party", "Free Market Party", "Green Future", "Traditional Values Party",
            "Workers' Union", "Liberty Party", "Reform Movement", "Stability Party"
        };
        
        std::vector<std::string> socialOptions = {"Progressive", "Conservative"};
        std::vector<std::string> economicOptions = {"Left", "Right"};
        
        // Generate 6-8 random parties
        int numParties = 6 + (rng() % 3);
        
        // First, generate all parties with basic percentages
        for (int i = 0; i < numParties; i++) {
            Party party;
            party.name = partyNames[rng() % partyNames.size()];
            party.socialIdeology = socialOptions[rng() % socialOptions.size()];
            party.economicIdeology = economicOptions[rng() % economicOptions.size()];
            
            // Assign numerical values based on ideology
            if (party.socialIdeology == "Progressive") {
                party.socialValue = rng() % 4; // 0-3 (Progressive range)
            } else {
                party.socialValue = 7 + (rng() % 4); // 7-10 (Conservative range)
            }
            
            if (party.economicIdeology == "Left") {
                party.economicValue = rng() % 4; // 0-3 (Left range)
            } else {
                party.economicValue = 7 + (rng() % 4); // 7-10 (Right range)
            }
            
            // Generate percentage (1-40%, weighted towards smaller values)
            std::normal_distribution<double> dist(15.0, 8.0);
            party.percentage = static_cast<int>(std::round(dist(rng)));
            party.percentage = (std::max)(1, (std::min)(40, party.percentage));
            
            allParties.push_back(party);
        }
        
        // Add player's party
        Party playerParty;
        playerParty.name = partyName;
        playerParty.socialIdeology = socialIdeology;
        playerParty.economicIdeology = economicIdeology;
        playerParty.socialValue = socialValue;
        playerParty.economicValue = economicValue;
        playerParty.percentage = partyControlPercentage;
        // Determine coalition status based on player's initial choice
        playerParty.inCoalition = (playerChoice.find("coalition") != std::string::npos);
        allParties.push_back(playerParty);
        
        // Sort parties by percentage (highest first)
        std::sort(allParties.begin(), allParties.end(), 
                  [](const Party& a, const Party& b) { return a.percentage > b.percentage; });
        
        // Completely new coalition assignment logic
        // Start with coalition at 0%
        int coalitionTotal = 0;
        
        // Reset all parties to opposition first
        for (auto& party : allParties) {
            party.inCoalition = false;
        }
        
        // Function to calculate similarity between two parties
        auto calculateSimilarity = [](const Party& a, const Party& b) -> int {
            // Calculate distance-based similarity (closer values = more similar)
            int socialDistance = std::abs(a.socialValue - b.socialValue);
            int economicDistance = std::abs(a.economicValue - b.economicValue);
            
            // Convert distance to similarity (lower distance = higher similarity)
            int socialSimilarity = 4 - socialDistance; // Max 4, min 0
            int economicSimilarity = 4 - economicDistance; // Max 4, min 0
            
            // If both parties are on completely opposite sides (distance > 6), give very low similarity
            if (socialDistance > 6 && economicDistance > 6) {
                return 0; // Completely opposite ideologies
            }
            
            return socialSimilarity + economicSimilarity;
        };
        
        
        // Try every possible combination to find the best coalition
        int bestCoalitionTotal = 0;
        std::vector<bool> bestCoalition(allParties.size(), false);
        
        // Try starting with each party as the base of the coalition
        for (int startParty = 0; startParty < allParties.size(); startParty++) {
            // Try different similarity thresholds from high to low
            for (int threshold = 8; threshold >= 0; threshold--) {
                // Reset all parties to opposition
                for (auto& party : allParties) {
                    party.inCoalition = false;
                }
                
                // Start with the current party
                allParties[startParty].inCoalition = true;
                int currentTotal = allParties[startParty].percentage;
                
                // Keep adding the most similar parties until we reach 50% or can't find more
                int maxCoalitionParties = (allParties.size() + 1) / 2;
                int currentCoalitionParties = 1;
                
                while (currentTotal < 50 && currentTotal < 100 && currentCoalitionParties < maxCoalitionParties) {
                    int bestSimilarity = -1;
                    int bestIndex = -1;
                    
                    // Find the opposition party most similar to any coalition party
                    for (int i = 0; i < allParties.size(); i++) {
                        if (!allParties[i].inCoalition) {
                            // Calculate maximum similarity to any coalition party
                            int maxSimilarity = 0;
                            for (int j = 0; j < allParties.size(); j++) {
                                if (allParties[j].inCoalition) {
                                    int sim = calculateSimilarity(allParties[i], allParties[j]);
                                    maxSimilarity = (std::max)(maxSimilarity, sim);
                                }
                            }
                            
                            // If this party has higher similarity, or same similarity but higher percentage
                            if (maxSimilarity > bestSimilarity || 
                                (maxSimilarity == bestSimilarity && allParties[i].percentage > allParties[bestIndex].percentage)) {
                                bestSimilarity = maxSimilarity;
                                bestIndex = i;
                            }
                        }
                    }
                    
                    // Add the most similar party to coalition (only if similarity is above threshold)
                    if (bestIndex != -1 && bestSimilarity >= threshold) {
                        allParties[bestIndex].inCoalition = true;
                        currentTotal += allParties[bestIndex].percentage;
                        currentCoalitionParties++;
                    } else {
                        // No more suitable parties to add
                        break;
                    }
                }
                
                // If this combination gives us a better result, save it
                if (currentTotal > bestCoalitionTotal) {
                    bestCoalitionTotal = currentTotal;
                    for (int i = 0; i < allParties.size(); i++) {
                        bestCoalition[i] = allParties[i].inCoalition;
                    }
                }
                
                // If we found a 50%+ coalition, we can stop trying lower thresholds
                if (currentTotal >= 50) {
                    break;
                }
            }
        }
        
        // Apply the best coalition we found
        coalitionTotal = bestCoalitionTotal;
        for (int i = 0; i < allParties.size(); i++) {
            allParties[i].inCoalition = bestCoalition[i];
        }
        
        // Calculate initial tax rate based on coalition and budget
        calculateTaxRate();
        
        // Normalize all percentages to sum to exactly 100%
        int totalPercentage = 0;
        for (const auto& party : allParties) {
            totalPercentage += party.percentage;
        }
        
        if (totalPercentage != 100) {
            // Scale all percentages proportionally to sum to 100
            for (auto& party : allParties) {
                party.percentage = (party.percentage * 100) / totalPercentage;
            }
            
            // Add any remaining percentage to the largest party to ensure exactly 100%
            int newTotal = 0;
            for (const auto& party : allParties) {
                newTotal += party.percentage;
            }
            int remainder = 100 - newTotal;
            if (remainder > 0 && !allParties.empty()) {
                allParties[0].percentage += remainder;
            }
            
            // Recalculate coalition total after normalization
            int newCoalitionTotal = 0;
            for (const auto& party : allParties) {
                if (party.inCoalition) {
                    newCoalitionTotal += party.percentage;
                }
            }
            
            // If coalition is now below 50%, add the most similar opposition party
            if (newCoalitionTotal < 50) {
                // Find the opposition party most similar to any coalition party
                int bestSimilarity = -1;
                int bestIndex = -1;
                
                for (int i = 0; i < allParties.size(); i++) {
                    if (!allParties[i].inCoalition) {
                        // Calculate maximum similarity to any coalition party
                        int maxSimilarity = 0;
                        for (int j = 0; j < allParties.size(); j++) {
                            if (allParties[j].inCoalition) {
                                // Calculate distance-based similarity
                                int socialDistance = std::abs(allParties[i].socialValue - allParties[j].socialValue);
                                int economicDistance = std::abs(allParties[i].economicValue - allParties[j].economicValue);
                                int socialSimilarity = 4 - socialDistance;
                                int economicSimilarity = 4 - economicDistance;
                                int sim = socialSimilarity + economicSimilarity;
                                
                                // If both parties are on completely opposite sides, give very low similarity
                                if (socialDistance > 6 && economicDistance > 6) {
                                    sim = 0; // Completely opposite ideologies
                                }
                                
                                maxSimilarity = (std::max)(maxSimilarity, sim);
                            }
                        }
                        
                        if (maxSimilarity > bestSimilarity && maxSimilarity >= 4) { // Higher similarity threshold
                            bestSimilarity = maxSimilarity;
                            bestIndex = i;
                        }
                    }
                }
                
                if (bestIndex != -1) {
                    allParties[bestIndex].inCoalition = true;
                }
            }
        }
    }
    
    void displayPoliticalCompass() {
        std::cout << "\n========================================\n";
        std::cout << "         POLITICAL COMPASS\n";
        std::cout << "========================================\n\n";
        
        // Create a 21x21 grid (0-20 scale for both axes, much bigger)
        const int gridSize = 21;
        char compass[gridSize][gridSize];
        
        // Initialize grid with spaces
        for (int i = 0; i < gridSize; i++) {
            for (int j = 0; j < gridSize; j++) {
                compass[i][j] = ' ';
            }
        }
        
        // Add axes with thicker lines
        for (int i = 0; i < gridSize; i++) {
            compass[i][10] = '|'; // Vertical line (economic axis)
            compass[10][i] = '-'; // Horizontal line (social axis)
        }
        compass[10][10] = '+'; // Center intersection
        
        // Add quadrant labels
        compass[2][2] = 'P'; compass[2][3] = 'R'; compass[2][4] = 'O'; compass[2][5] = 'G';
        compass[3][2] = 'R'; compass[3][3] = 'E'; compass[3][4] = 'S'; compass[3][5] = 'S';
        compass[4][2] = 'I'; compass[4][3] = 'V'; compass[4][4] = 'E'; compass[4][5] = ' ';
        
        compass[2][16] = 'L'; compass[2][17] = 'E'; compass[2][18] = 'F'; compass[2][19] = 'T';
        compass[3][16] = 'W'; compass[3][17] = 'I'; compass[3][18] = 'N'; compass[3][19] = 'G';
        
        compass[16][2] = 'C'; compass[16][3] = 'O'; compass[16][4] = 'N'; compass[16][5] = 'S';
        compass[17][2] = 'E'; compass[17][3] = 'R'; compass[17][4] = 'V'; compass[17][5] = 'A';
        compass[18][2] = 'T'; compass[18][3] = 'I'; compass[18][4] = 'V'; compass[18][5] = 'E';
        
        compass[16][16] = 'R'; compass[16][17] = 'I'; compass[16][18] = 'G'; compass[16][19] = 'H';
        compass[17][16] = 'T'; compass[17][17] = ' '; compass[17][18] = 'W'; compass[17][19] = 'I';
        compass[18][16] = 'N'; compass[18][17] = 'G'; compass[18][18] = ' '; compass[18][19] = ' ';
        
        // Place parties on the compass (scale from 0-10 to 0-20)
        for (const auto& party : allParties) {
            int x = party.economicValue * 2; // Scale economic (0-10 to 0-20)
            int y = (10 - party.socialValue) * 2; // Scale social (0-10 to 0-20, flipped for display)
            
            // Ensure coordinates are within bounds
            x = (std::max)(0, (std::min)(20, x));
            y = (std::max)(0, (std::min)(20, y));
            
            // Use first letter of party name, or a number if multiple parties at same position
            char symbol = party.name[0];
            if (compass[y][x] != ' ' && compass[y][x] != '|' && compass[y][x] != '-' && compass[y][x] != '+' &&
                compass[y][x] != 'P' && compass[y][x] != 'R' && compass[y][x] != 'O' && compass[y][x] != 'G' &&
                compass[y][x] != 'E' && compass[y][x] != 'S' && compass[y][x] != 'I' && compass[y][x] != 'V' &&
                compass[y][x] != 'L' && compass[y][x] != 'F' && compass[y][x] != 'T' && compass[y][x] != 'W' &&
                compass[y][x] != 'N' && compass[y][x] != 'C' && compass[y][x] != 'A' && compass[y][x] != 'H') {
                // If position is occupied, use a number
                symbol = '1' + (party.name[0] - 'A') % 9;
            }
            compass[y][x] = symbol;
        }
        
        // Display the compass with better formatting
        std::cout << "Economic: Left <-- --> Right\n";
        std::cout << "Social:   Progressive (top) <-- --> Conservative (bottom)\n\n";
        
        for (int i = 0; i < gridSize; i++) {
            std::cout << std::setw(2) << (20-i) << " ";
            for (int j = 0; j < gridSize; j++) {
                std::cout << compass[i][j] << " ";
            }
            std::cout << "\n";
        }
        
        std::cout << "   ";
        for (int j = 0; j < gridSize; j++) {
            std::cout << std::setw(2) << j;
        }
        std::cout << "\n\n";
        
        // Legend
        std::cout << "Party Positions:\n";
        for (const auto& party : allParties) {
            std::cout << party.name[0] << " = " << party.name;
            if (party.inCoalition) {
                std::cout << " (Coalition)";
            } else {
                std::cout << " (Opposition)";
            }
            std::cout << "\n";
        }
        std::cout << "\n";
    }

    void displayGovernmentOverview() {
        clearScreen();
        displayPartyControl();
        
        std::cout << "========================================\n";
        std::cout << "         GOVERNMENT OVERVIEW\n";
        std::cout << "========================================\n\n";
        
        std::cout << std::left << std::setw(25) << "Party Name" 
                  << std::setw(12) << "Social" 
                  << std::setw(12) << "Economic" 
                  << std::setw(10) << "Control" 
                  << "Coalition\n";
        std::cout << std::string(70, '-') << "\n";
        
        for (const auto& party : allParties) {
            std::cout << std::left << std::setw(25) << party.name
                      << std::setw(12) << party.socialIdeology
                      << std::setw(12) << party.economicIdeology
                      << std::setw(10) << (std::to_string(party.percentage) + "%")
                      << (party.inCoalition ? "Yes" : "No") << "\n";
            
            // Display ideology spectrums for each party
            std::cout << std::setw(25) << " " << "Social: " << generateSpectrum(party.socialValue, "Progressive", "Conservative") << "\n";
            std::cout << std::setw(25) << " " << "Economic: " << generateSpectrum(party.economicValue, "Left", "Right") << "\n";
            std::cout << "\n";
        }
        
        std::cout << "\n";
        
        // Show coalition summary
        int coalitionTotal = 0;
        int oppositionTotal = 0;
        std::cout << "Coalition Parties: ";
        for (const auto& party : allParties) {
            if (party.inCoalition) {
                coalitionTotal += party.percentage;
                std::cout << party.name << " (" << party.percentage << "%) ";
            }
        }
        std::cout << "\nTotal Coalition Control: " << coalitionTotal << "%\n\n";
        
        std::cout << "Opposition Parties: ";
        for (const auto& party : allParties) {
            if (!party.inCoalition) {
                oppositionTotal += party.percentage;
                std::cout << party.name << " (" << party.percentage << "%) ";
            }
        }
        std::cout << "\nTotal Opposition Control: " << oppositionTotal << "%\n\n";
        
        std::cout << "What would you like to do?\n";
        std::cout << "1. View Political Compass\n";
        std::cout << "2. Return to Main Menu\n\n";
        std::cout << "Enter your choice (1-2): ";
        
        int choice;
        if (!(std::cin >> choice)) {
            std::cin.clear();
            std::cin.ignore((std::numeric_limits<std::streamsize>::max)(), '\n');
            choice = 0; // Invalid choice
        } else {
            std::cin.ignore((std::numeric_limits<std::streamsize>::max)(), '\n');
        }
        
        switch(choice) {
            case 1:
                displayPoliticalCompass();
                std::cout << "Press Enter to continue...";
                std::cin.get();
                break;
            case 2:
                // Return to main menu
                break;
            default:
                clearScreen();
                displayPartyControl();
                std::cout << "Invalid choice! Please enter 1 or 2.\n\n";
                std::cout << "Press Enter to continue...";
                std::cin.get();
                break;
        }
    }
    
    void displayWelcome() {
        std::cout << "========================================\n";
        std::cout << "    Political/Economical RPG Game\n";
        std::cout << "========================================\n\n";
        std::cout << "Welcome to the world of politics and economics!\n";
        std::cout << "Your decisions will shape the future of your party and nation.\n\n";
    }
    
    void displayStartingOptions() {
        clearScreen();
        displayPartyControl();
        std::cout << "How do you want to start?\n\n";
        std::cout << "1. Small opposition party\n";
        std::cout << "2. Big opposition party\n";
        std::cout << "3. Small coalition party\n";
        std::cout << "4. Big coalition party\n\n";
        std::cout << "Enter your choice (1-4): ";
    }
    
    void handleStartingChoice() {
        int choice;
        std::cin >> choice;
        
        // Clear input buffer
        std::cin.ignore((std::numeric_limits<std::streamsize>::max)(), '\n');
        
        switch(choice) {
            case 1:
                playerChoice = "Small opposition party";
                partyControlPercentage = generatePartyControlPercentage(playerChoice);
                clearScreen();
                displayPartyControl();
                std::cout << "You have chosen: Small opposition party\n";
                std::cout << "Starting as a small opposition party means you have limited resources\n";
                std::cout << "but more freedom to criticize the government and build your base.\n\n";
                break;
            case 2:
                playerChoice = "Big opposition party";
                partyControlPercentage = generatePartyControlPercentage(playerChoice);
                clearScreen();
                displayPartyControl();
                std::cout << "You have chosen: Big opposition party\n";
                std::cout << "Starting as a big opposition party gives you significant influence\n";
                std::cout << "and resources, but you must manage a larger organization.\n\n";
                break;
            case 3:
                playerChoice = "Small coalition party";
                partyControlPercentage = generatePartyControlPercentage(playerChoice);
                clearScreen();
                displayPartyControl();
                std::cout << "You have chosen: Small coalition party\n";
                std::cout << "Starting as a small coalition party means you're part of the government\n";
                std::cout << "but with limited power. You can influence policy but must compromise.\n\n";
                break;
            case 4:
                playerChoice = "Big coalition party";
                partyControlPercentage = generatePartyControlPercentage(playerChoice);
                clearScreen();
                displayPartyControl();
                std::cout << "You have chosen: Big coalition party\n";
                std::cout << "Starting as a big coalition party gives you major government influence\n";
                std::cout << "and resources, but you must manage complex coalition dynamics.\n\n";
                break;
            default:
                clearScreen();
                displayPartyControl();
                std::cout << "Invalid choice! Please enter a number between 1 and 4.\n\n";
                return;
        }
        
        // Continue to ideology choices
        displaySocialIdeologyChoice();
        handleSocialIdeologyChoice();
    }
    
    void continueGame() {
        // Generate random parties for the government overview
        generateRandomParties();
        
        while (gameRunning) {
            clearScreen();
            displayPartyControl();
            std::cout << "Game continues... (This is where the main game loop would be implemented)\n";
            std::cout << "Party name: " << partyName << "\n";
            std::cout << "Party type: " << playerChoice << "\n";
            
            // Display ideologies with visual spectrum lines and star markers
            std::cout << "Social: " << generateSpectrum(socialValue, "Progressive", "Conservative") << "\n";
            std::cout << "Economic: " << generateSpectrum(economicValue, "Left", "Right") << "\n";
            std::cout << "\n";
            
            std::cout << "What would you like to do?\n";
            std::cout << "1. View Government Overview\n";
            std::cout << "2. Continue Game\n";
            std::cout << "3. Quit\n\n";
            std::cout << "Enter your choice (1-3): ";
            
            int choice;
            if (!(std::cin >> choice)) {
                std::cin.clear();
                std::cin.ignore((std::numeric_limits<std::streamsize>::max)(), '\n');
                choice = 0; // Invalid choice
            } else {
                std::cin.ignore((std::numeric_limits<std::streamsize>::max)(), '\n');
            }
            
            switch(choice) {
                case 1:
                    displayGovernmentOverview();
                    break;
                case 2:
                    // Advance to the next day
                    currentDay++;
                    
                    // Check if player is in coalition for budget meeting on day 2
                    if (currentDay == 2) {
                        if (isPlayerInCoalition()) {
                            // Start the yearly budget meeting
                            displayBudgetMeeting();
                        } else {
                            // Automatic budget allocation for opposition parties (only once)
                            if (!budgetAllocationDone) {
                                automaticBudgetAllocation();
                            } else {
                                clearScreen();
                                displayPartyControl();
                                std::cout << "========================================\n";
                                std::cout << "         BUDGET ALREADY ALLOCATED\n";
                                std::cout << "========================================\n\n";
                                std::cout << "The budget has already been automatically allocated based on\n";
                                std::cout << "the current coalition's ideology. No further changes are needed.\n\n";
                                std::cout << "Current Total Budget: " << getTotalBudget() << "%\n";
                                std::cout << "Current Tax Rate: " << std::fixed << std::setprecision(1) << taxRate << "%\n\n";
                                std::cout << "Press Enter to continue...";
                                std::cin.get();
                            }
                        }
                    } else {
                        // For other days, just show day progression
                        clearScreen();
                        displayPartyControl();
                        std::cout << "========================================\n";
                        std::cout << "         DAY " << currentDay << " BEGINS\n";
                        std::cout << "========================================\n\n";
                        std::cout << "A new day has begun. The political landscape continues to evolve.\n\n";
                        std::cout << "Press Enter to continue...";
                        std::cin.get();
                    }
                    break;
                case 3:
                    gameRunning = false;
                    break;
                default:
                    clearScreen();
                    displayPartyControl();
                    std::cout << "Invalid choice! Please enter 1, 2, or 3.\n\n";
                    std::cout << "Press Enter to continue...";
                    std::cin.get();
                    break;
            }
        }
    }
    
    void run() {
        displayWelcome();
        
        while (gameRunning) {
            displayStartingOptions();
            handleStartingChoice();
            
            if (!gameRunning) {
                break;
            }
            
            clearScreen();
            displayPartyControl();
            std::cout << "Would you like to restart? (y/n): ";
            std::string restart;
            std::getline(std::cin, restart);
            
            if (restart != "y" && restart != "Y") {
                gameRunning = false;
            }
        }
        
        clearScreen();
        displayPartyControl();
        std::cout << "Thank you for playing Political/Economical RPG!\n";
        std::cout << "Goodbye!\n";
    }
};

int main() {
    PoliticalRPG game;
    game.run();
    return 0;
}
