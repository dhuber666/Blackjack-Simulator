// Global variables

var COLORS = ['spades', 'hearts', 'diamonds', 'clubs'];
// 11 has either value of 11 or 1
var VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11];
var FACES = ['ace', 'jack', 'king', 'queen'];

// one deck consists of 52 cards
// 2 - ace for each color
// 2 , 3, 4, ... , J, Q, K, A

// Deck Class
function Deck() {
	this.cards = [];
}

Deck.prototype.initialize = function() {
	//do it 6 times since a blackjack deck consist of 6 decks
	for (var i = 0; i < 6; i++) {
		// loop through each color
		COLORS.forEach(function(color) {
			// for each color add a card to the deck with color and value
			VALUES.forEach(function(value) {
				this.cards.push(new Card(value, color));
			}, this);
		}, this);
	}
};

Deck.prototype.showDeck = function() {
	if (this.cards.length < 1) {
		return false;
	} else {
		this.cards.forEach(function(card) {
			console.log(card);
		});
		return true;
	}
};

//  this shuffle makes use of lodash built in shuffle function
// which makes use of the fisher yates shuffle, more infos:
// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
Deck.prototype.shuffle = function() {
	// reassign it or make a seperate field for shuffled cards ?
	this.cards = _.shuffle(this.cards);
};

// Dealer Class

function Dealer(deck) {
	this.deck = deck;
	this.deck.initialize();
	this.deck.shuffle();
	this.hand = [];
	this.totalValue = 0;
}

// argument: quant = quantity (how many)
Dealer.prototype.dealCards = function(quant) {
	if (quant < 1 || quant > 312) {
		throw 'args needs to be 1 or < 312';
	}

	var drawnCards = [];
	for (var i = 0; i < quant; i++) {
		// pop out the last card of the deck and push it into the drawn cards array
		drawnCards.push(this.deck.cards.pop());
	}

	return drawnCards;
};

//Takes array of card objects and adds them to the player's hand
Dealer.prototype.addCardsToHand = function(cards, target) {
	for (var i = 0; i < cards.length; i++) {
		target.hand.push(cards[i]);
	}
};

Dealer.prototype.drawCard = function() {
	this.hand.push(this.deck.cards.pop());
};

// Player class
// args: name of the player

function Player(name) {
	this.name = name;
	this.hand = [];
	this.action = null;
	this.looses = 0;
	this.wins = 0;
	this.ties = 0;
	this.totalValue = 0;
}

// Table Class
// args: Player array and Dealer

function Table(dealer, players) {
	this.dealer = dealer;
	this.players = players;
}

// the method where main magic is happening
// here the rounds get simulated
// args: number of how often you want to simulate

Table.prototype.simulate = function(numberOfRounds) {
	// hand out cards 2 for each player.
	// hand 1 card to the dealer heads up (or active) and a 2nd heads down (not active)
	// calculate the player action depending on different factors:
	// what card the dealer has
	// what cards the player has
	// depending on that take different actions:
	// split
	// hit
	// new card
	// double down
	// pay insurance (if dealer has Ace)
	// ...

	//run simulation 'numberOfRounds'.times
	for (var i = 0; i < numberOfRounds; i++) {
		//give every player 2 cards to their hand

		this.players.forEach(function(player) {
			var cards = this.dealer.dealCards(2);

			this.dealer.addCardsToHand(cards, player);
		}, this);

		// give the Dealer 2 cards. Set the 2nd to hidden=true
		var cards = this.dealer.dealCards(2);
		// cards[1].hidden = true;
		this.dealer.addCardsToHand(cards, this.dealer);

		// compute

		this.computePlayerAction(this.dealer.hand, this.players);
		this.computeDealerAction(this.dealer, this.players);
		this.resetPlayers(this.players);
		this.resetDealer(this.dealer);
	}
};

// this computes the action the players want to take and returns it
// args: the current dealer and all players
Table.prototype.computePlayerAction = function(dealerHand, players) {
	players.forEach(function(player) {
		// initital action is hit to keep trigger the loop
		var action;

		do {
			var playerHand = player.hand;
			var playerValue = this.getPlayerTotalValue(player);

			action = this.getPlayerAction(dealerHand, playerHand, playerValue, player);
		} while (action === 'hit'); // TODO: Why is this an infinite loop.
	}, this);
};

// args: dealer object and array of player objects

Table.prototype.computeDealerAction = function(dealer, players) {
	var dealerValue = this.getDealerTotalValue(dealer);
	while (dealerValue < 17) {
		dealer.drawCard();
		dealerValue = this.getDealerTotalValue(dealer);
	}

	// compute who has won or not
	if (!(dealerValue > 21)) {
		// if this case all players who have not alredy lost wins

		// loop through all players that doesn't have lost and check who has won
		players.forEach(function(player) {
			if (player.action !== 'loose') {
				if (player.totalValue > dealer.totalValue) {
					player.action = 'won';
					player.wins++;
				} else if (player.totalValue === dealer.totalValue) {
					player.action = 'tie';
					player.ties++;
				} else {
					player.action = 'loose';
					player.looses++;
				}
			}
		});
	} else {
		players.forEach(function(player) {
			if (player.action !== 'loose') {
				player.action = 'won';
				player.wins++;
			}
		});
	}
};

// this gets just the action and returns it for a single player
// args: dealer hand and player hand
// returns nothing
Table.prototype.getPlayerAction = function(
	dealerHand,
	playerHand,
	totalCardValue,
	player
) {
	// loop through dealerHand
	// dealerHand.forEach(function(dealerCard) {
	// if card is not hidden loop through player cards
	// 	if (!dealerCard.hidden) {
	// 		playerHand.forEach(function(playerCard) {
	// 			// now we have each card and can compare it to the dealers card(s) and do something with it.
	// 			// case 1: player takes card , score 17 or more? stand. Score over 21? loose. Score under 17, take card
	// 			if(totalCardValue < 17) {
	// 				player.hand.push(this.dealer.addCardsToHand(1)); // TODO: own "hit" function?
	// 			}
	// 		});
	// 	}
	// }, this); <<== this whole code gets activated later when we have more advanced checking conditions
	//	 <<== for now I just want to make the app work at minimium

	if (totalCardValue < 17) {
		this.hit(player);
		return player.action;
	} else if (totalCardValue >= 17 && totalCardValue <= 21) {
		this.stand(player);
		return player.action;
	} else if (totalCardValue > 21) {
		this.loose(player);
		return player.action;
	} else {
		console.log('Hi from total value', totalCardValue);
	}
};

// just adds 1 card to current player and set action to hit
// args: player
Table.prototype.hit = function(player) {
	var cards = this.dealer.dealCards(1);
	this.dealer.addCardsToHand(cards, player);

	player.action = 'hit';
};

// just adds 1 card to current player and set action to stand
// args: player
Table.prototype.stand = function(player) {
	player.action = 'stand';
};

// just adds 1 card to current player and set action to stand
// args player
Table.prototype.loose = function(player) {
	player.action = 'loose';
	player.looses++;
};

// gets the value of all cards sum together from Player
// args: player object
// returns: the summed up value, single integer
Table.prototype.getPlayerTotalValue = function(player) {
	// loop through cards and add values. Return it

	var value = 0;
	player.hand.forEach(function(card) {
		value += card.value;
	}, this);

	player.totalValue = value;

	return value;
};

// gets the value of all cards sum together from Dealer
// args: dealer object
// returns: the summed up value, single integer
Table.prototype.getDealerTotalValue = function(dealer) {
	var value = 0;
	dealer.hand.forEach(function(card) {
		value += card.value;
	}, this);

	dealer.totalValue = value;
	return value;
};

// args: Array of player objects
Table.prototype.resetPlayers = function(players) {
	players.forEach(function(player) {
		player.hand = [];
		player.action = null;
		player.totalValue = 0;
	});
};

// args: dealer object
Table.prototype.resetDealer = function(dealer) {
	// if deck is running out of cards crate a new deck with shuffle
	if (dealer.deck.cards.length < 60) {
		dealer.deck.initialize();
		dealer.deck.shuffle();
	}
	dealer.hand = [];
	dealer.totalValue = 0;
};

// Card Class
// args: value and color of a card :)
function Card(value, color) {
	this.value = value;
	this.color = color;
	// card is hidden default
	this.hidden = false;
}

//takes array and determines whether it is a royal pontoon
//takes array [card1, card2]
Table.prototype.pontoon = function(hand) {
	if (arr.length === 2 && hand[0]['value'] + hand[1]['value'] === 21) {
		return true;
	}
	return false;
};
