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

// Player class
// args: name of the player

function Player(name) {
	this.name = name;
	this.hand = [];
	this.currentAction = null;
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
		cards[1].hidden = true;
		this.dealer.addCardsToHand(cards, this.dealer);

		// compute

		this.computePlayerAction(this.dealer.hand, this.players);
	}
};

// this computes the action the players want to take and returns it
// args: the current dealer and all players
Table.prototype.computePlayerAction = function(dealerHand, players) {
	players.forEach(function(player) {
		var playerHand = player.hand;
		var actionCase = this.getPlayerAction(dealerHand, playerHand);
	}, this);
};

// this gets just the action and returns it for a single player
// args: dealer hand and player hand

Table.prototype.getPlayerAction = function(dealerHand, playerHand) {
	// loop through dealerHand
	dealerHand.forEach(function(dealerCard) {
		// if card is not hidden loop through player cards
		if (!dealerCard.hidden) {
			playerHand.forEach(function(playerCard) {
				// now we have each card and can compare it to the dealers card(s) and do something with it.
				// TODO: Finish this beast + Tests
			});
		}
	});
};

// Card Class
// args: value and color of a card :)

function Card(value, color) {
	this.value = value;
	this.color = color;
	// card is hidden default
	this.hidden = false;
}
