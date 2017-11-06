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

// Card Class
// args: value and color of a card :)

function Card(value, color) {
	this.value = value;
	this.color = color;
	// card is hidden default
	this.hidden = true;
}
