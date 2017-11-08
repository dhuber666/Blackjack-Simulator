# Blackjack-Simulator
Simulates 1000's of Blackjack games

#### The goal of this app is:

* Run or simulate a blackjack game n times
* Based on that make the best possible moves (as a player) that gives you the highest chance of winning
* Compute of often the computer has won and how often he has lost
* Add further features like set a bet and display at the end of simulation how much they earned or quite if they are broke

##### So the UI for it at the first version is really:

* A inpout where you can set how often you want to simulate the game
* A button that kicks off the code
* A visible paragraph / div that displays the result

For later version there could be features like options:

* If you want to split or never split
* If you want to double down or not, ... 

The basics of the game blackjack are in the file "notes.MD". 

## The very early first version is now ready. You can test it out by going into the tests.js files an go to the last test. You can type in a number into the simulate function. It also works with 1000 tests. You see how often player has won in the console. 

As the algorithm is working now the player has a chance of about 35% to 45 % per game to win when played solo vs dealer. No optimizations for the player actions yet. There is a minor bug in it. Because when it calculates it 1000 times. And you sum up how often the player has lost + won + tied it's not 1000. But it should be. 