import random

# This function simulates a ball being bowled and returns a random number between 0 and 6
# 0 represents a wicket, while 1-6 represent runs scored on that ball
def bowl():
    return random.randint(0, 6)  # Returns runs scored (0 to 6)

def innings(team_name):
    total_runs = 0
    wickets = 0
    overs = 0
    
    while overs < 5 and wickets < 10:  # Play for a maximum of 5 overs or until 10 wickets
        print(f"\nOver {overs + 1}:")
        for ball in range(6):  # Each over has 6 balls
            if wickets < 10:
                runs = bowl()
                print(f"Ball {ball + 1}: You scored {runs} runs.")
                
                if runs == 0:
                    wickets += 1
                    print("Wicket!! You lost a batsman.")
                else:
                    total_runs += runs
        
        overs += 1  # Increment overs after each over
        print(f"End of Over {overs}: Total Runs = {total_runs}, Wickets = {wickets}")
    
    return total_runs, wickets

# Function to play the game
def play_game():
    print("Welcome to the Cricket Game!")
    team1 = input("Enter the name of Team 1: ")
    team2 = input("Enter the name of Team 2: ")
    
    print(f"\n{team1} is batting now.")
    team1_score, team1_wickets = innings(team1)
    
    print(f"\n{team2} is batting now.")
    team2_score, team2_wickets = innings(team2)
    
    # Determine the Winner
    if team1_score > team2_score:
        print(f"\n{team1} wins by {team1_score - team2_score} runs!")
    elif team2_score > team1_score:
        print(f"\n{team2} wins by {10 - team2_wickets} wickets!!")
    else:
        print("\nIt's a tie!!")

# Start the Game
if __name__ == "__main__":
    play_game()
