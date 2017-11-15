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
Dealer.prototype.addCardsToHand = function(cards, hand) {
	for (var i = 0; i < cards.length; i++) {
		hand.push(cards[i]);
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
	this.blackjack = false;
	this.blackjackCount = 0;
	this.values = [];
	this.splitCount = 0;
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

			this.dealer.addCardsToHand(cards, player.hand);
		}, this);

		// give the Dealer 2 cards. Set the 2nd to hidden=true
		var cards = this.dealer.dealCards(2);
		// cards[1].hidden = true;
		this.dealer.addCardsToHand(cards, this.dealer.hand);

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
	var action;
	players.forEach(function(player) {
		// initital action is hit to keep trigger the loop

		do {
			var playerHand = player.hand;

			var playerValue = this.getTotalValue(playerHand);

			action = this.getPlayerAction(dealerHand, playerHand, playerValue, player);
		} while (action === 'hit');
	}, this);

	return action;
};

// args: dealer object and array of player objects

Table.prototype.computeDealerAction = function(dealer, players) {
	var dealerValue = this.getDealerTotalValue(dealer);
	while (dealerValue < 17) {
		dealer.drawCard();
		dealerValue = this.getDealerTotalValue(dealer);
	}
	// debugger;

	// compute who has won or not
	if (!(dealerValue > 21)) {
		// if this case all players who have not alredy lost wins

		// loop through all players that doesn't have lost and check who has won
		players.forEach(function(player) {
			if (
				player.action !== 'loose' &&
				player.action !== 'win' &&
				player.action !== 'tie'
			) {
				if (this.pontoon(this.dealer.hand)) {
					player.action = 'loose';
					player.looses++;
					return;
				}
				// loop through all saved values of player
				// normally one but more then 1 when splitted (2)
				if (player.values) {
					player.values.forEach(function(value) {
						if (value > dealer.totalValue) {
							player.action = 'win';
							player.wins++;
						} else if (value === dealer.totalValue) {
							player.action = 'tie';
							player.ties++;
						} else {
							player.action = 'loose';
							player.looses++;
						}
					});
				} else {
					if (player.totalValue > dealer.totalValue) {
						player.action = 'win';
						player.wins++;
					} else if (player.totalValue === dealer.totalValue) {
						player.action = 'tie';
						player.ties++;
					} else {
						player.action = 'loose';
						player.looses++;
					}
				}
			}
		}, this);
	} else {
		players.forEach(function(player) {
			if (
				player.action !== 'loose' &&
				player.action !== 'win' &&
				player.action !== 'tie' &&
				!player.split
			) {
				player.action = 'win';
				player.wins++;
			} else if (player.split) {
				player.values.forEach(function(value) {
					player.action = 'win';
					player.wins++;
				});
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

	// player has blackjack and dealer not case

	if (this.pontoon(playerHand) && !this.pontoon(dealerHand)) {
		this.win(player);
		player.blackjack = true;
		player.blackjackCount++;
		return player.action;
	}

	if (this.pontoon(playerHand) && this.pontoon(dealerHand)) {
		this.tie(player);
		player.blackjack = true;
		player.blackjackCount++;
		return player.action;
	}

	// here comes the detailed part: Switch Case

	var action = this.edgeCase(player, this.dealer, totalCardValue, playerHand);

	// if (totalCardValue < 17) {
	// 	this.hit(player);
	// 	return player.action;
	// } else if (totalCardValue >= 17 && totalCardValue < 21) {
	// 	this.stand(player);
	// 	return player.action;
	// } else if (totalCardValue > 21) {
	// 	this.loose(player);
	// 	return player.action;
	// }

	return action;
};

Table.prototype.win = function(player) {
	if (player.split !== true) {
		player.action = 'win';
	}

	player.wins++;
};

Table.prototype.tie = function(player) {
	if (player.split !== true) {
		player.action = 'tie';
	}

	player.ties++;
};

// just adds 1 card to current player and set action to hit
// args: player
Table.prototype.hit = function(hand, player) {
	var cards = this.dealer.dealCards(1);
	this.dealer.addCardsToHand(cards, hand);

	player.action = 'hit';
};

// just adds 1 card to current player and set action to stand
// args: player
Table.prototype.stand = function(player, valueStandsOn) {
	//when player finally takes stand it means:
	// he hasn't lost yet save the total value to player array
	player.values.push(valueStandsOn);
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

Table.prototype.getTotalValue = function(hand) {
	// loop through cards and add values. Return it

	var value = 0;
	hand.forEach(function(card) {
		value += card.value;
	}, this);

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
		player.blackjack = false;
		player.values = [];
		player.split = false;
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
	if (hand.length === 2 && hand[0]['value'] + hand[1]['value'] === 21) {
		return true;
	}
	return false;
};

Table.prototype.edgeCase = function(player, dealer, playerTotalValue, playerHand) {
	// var playerTotalValue = this.getPlayerTotalValue(player);
	// var playerHand = player.hand;
	var dealerUpCard = dealer.hand[0].value;
	var playerHasAce = this.hasAce(playerHand);
	var playerHasDouble = this.isDouble(playerHand);
	// debugger;

	switch (true) {
		/* ====== cases when player should stand =======*/

		/* "default cases" */
		case dealerUpCard > 1 &&
			dealerUpCard < 7 &&
			!playerHasDouble &&
			playerTotalValue > 12 &&
			playerTotalValue < 22 &&
			!playerHasAce:
			this.stand(player, playerTotalValue);
			return player.action;
			break;
		case dealerUpCard > 3 &&
			!playerHasDouble &&
			dealerUpCard < 7 &&
			playerTotalValue === 12 &&
			!playerHasAce:
			this.stand(player, playerTotalValue);
			return player.action;
			break;

		/* When the player has 17 in total or greater but under 22, also no aces or double cards like 10 10 */
		case playerTotalValue >= 17 &&
			playerTotalValue <= 21 &&
			!playerHasAce &&
			!playerHasDouble:
			this.stand(player, playerTotalValue);
			return player.action;
			break;

		/* cases when hand has an ace */

		case playerTotalValue === 20 && hasAce:
			this.stand(player, playerTotalValue);
			return player.action;
			break;
		case playerTotalValue === 19 && dealerUpCard !== 6 && hasAce:
			this.stand(player, playerTotalValue);
			return player.action;
			break;

		case playerHand.length === 2 &&
			playerTotalValue === 18 &&
			hasAce &&
			(dealerUpCard < 3 || dealerUpCard > 6) &&
			(dealerUpCard !== 10 && dealerUpCard !== 9):
			this.stand(player, playerTotalValue);
			return player.action;
			break;

		/* cases when hand has double values e.g. 9 9 , 10 10 */
		case playerHand.length === 2 && playerTotalValue === 20 && playerHasDouble:
			this.stand(player, playerTotalValue);
			return player.action;
			break;
		case playerHand.length === 2 &&
			playerTotalValue === 18 &&
			playerHasDouble &&
			(dealerUpCard === 7 || dealerUpCard === 10 || dealerUpCard === 11):
			this.stand(player, playerTotalValue);
			return player.action;
			break;
		case playerHand.length === 2 &&
			playerTotalValue === 14 &&
			playerHasDouble &&
			dealerUpCard === 10:
			this.stand(player, playerTotalValue);
			return player.action;
			break;

		/* ====== cases when player should hit =======*/
		// normal cases

		case playerTotalValue > 12 &&
			playerTotalValue < 17 &&
			dealerUpCard > 6 &&
			!playerHasDouble &&
			!playerHasAce:
			this.hit(playerHand, player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		case playerTotalValue === 12 &&
			(dealerUpCard > 6 || dealerUpCard < 4) &&
			!playerHasAce &&
			!playerHasDouble:
			this.hit(playerHand, player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		case playerTotalValue === 10 &&
			dealerUpCard > 9 &&
			!playerHasAce &&
			!playerHasDouble:
			this.hit(playerHand, player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		case playerTotalValue === 9 &&
			dealerUpCard > 6 &&
			!playerHasAce &&
			!playerHasDouble:
			this.hit(playerHand, player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		case playerTotalValue === 8 &&
			dealerUpCard > 6 &&
			dealerUpCard < 5 &&
			!playerHasAce &&
			!playerHasDouble:
			this.hit(playerHand, player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		case playerTotalValue > 4 &&
			playerTotalValue < 8 &&
			!playerHasAce &&
			!playerHasDouble:
			this.hit(playerHand, player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		// Cases with an ace on the hand
		case playerTotalValue === 18 && hasAce && dealerUpCard > 8 && dealerUpCard < 11:
			this.hit(playerHand, player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		case playerTotalValue === 17 && hasAce && dealerUpCard > 6:
			this.hit(playerHand, player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		case playerTotalValue === 16 && hasAce && (dealerUpCard < 4 || dealerUpCard > 6):
			this.hit(playerHand, player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		case playerTotalValue === 15 && hasAce && (dealerUpCard < 4 || dealerUpCard > 6):
			this.hit(playerHand, player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		case playerTotalValue === 14 && hasAce && (dealerUpCard < 4 || dealerUpCard > 6):
			this.hit(playerHand, player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		case playerTotalValue === 13 && hasAce && (dealerUpCard < 4 || dealerUpCard > 6):
			this.hit(playerHand, player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		/* cases when hand has double values e.g. 9 9 , 10 10 */

		case playerTotalValue === 14 &&
			playerHasDouble &&
			(dealerUpCard === 8 || dealerUpCard === 9 || dealerUpCard === 11):
			this.hit(playerHand, player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		case playerTotalValue === 12 && playerHasDouble && dealerUpCard > 6:
			this.hit(playerHand, player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		case playerTotalValue === 10 && playerHasDouble && dealerUpCard > 9:
			this.hit(playerHand, player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		case playerTotalValue === 8 &&
			playerHasDouble &&
			(dealerUpCard < 5 || dealerUpCard > 6):
			this.hit(playerHand, player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		case playerTotalValue === 6 &&
			playerHasDouble &&
			(dealerUpCard < 4 || dealerUpCard > 7):
			this.hit(playerHand, player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		case playerTotalValue === 4 &&
			playerHasDouble &&
			(dealerUpCard === 2 || dealerUpCard > 7):
			this.hit(playerHand, player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		/* ====== cases when player should split =======*/

		case (playerTotalValue === 22 || playerTotalValue === 16) &&
			playerHasAce &&
			!player.split &&
			playerHasDouble:
			this.split(player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		case playerTotalValue === 18 &&
			!player.split &&
			playerHasDouble &&
			(dealerUpCard < 7 || dealerUpCard === 8 || dealerUpCard === 9):
			this.split(player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		case playerTotalValue === 14 &&
			!player.split &&
			playerHasDouble &&
			dealerUpCard < 8:
			this.split(player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		case playerTotalValue === 12 &&
			!player.split &&
			playerHasDouble &&
			dealerUpCard < 7:
			this.split(player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		case playerTotalValue === 6 &&
			!player.split &&
			playerHasDouble &&
			(dealerUpCard < 8 && dealerUpCard > 3):
			this.split(player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		case playerTotalValue === 4 &&
			!player.split &&
			playerHasDouble &&
			(dealerUpCard < 8 && dealerUpCard > 2):
			this.split(player);
			/* this is just for testing */ player.tested = true;
			return player.action;
			break;

		/* ====== cases when player should double down =======*/
		// normal cases

		case playerTotalValue === 11 &&
			!player.double &&
			!playerHasDouble &&
			!playerHasAce:
			this.double(player);
			return player.action;
			break;

		case playerTotalValue === 10 &&
			!player.double &&
			!playerHasDouble &&
			!playerHasAce &&
			dealerUpCard < 10:
			this.double(player);
			return player.action;
			break;

		case playerTotalValue === 9 &&
			!player.double &&
			!playerHasDouble &&
			!playerHasAce &&
			dealerUpCard < 7:
			this.double(player);
			return player.action;
			break;

		case playerTotalValue === 8 &&
			!player.double &&
			!playerHasDouble &&
			!playerHasAce &&
			(dealerUpCard === 5 || dealerUpCard === 6):
			this.double(player);
			return player.action;
			break;

		// Ace cases

		case playerTotalValue === 19 &&
			!player.double &&
			!playerHasDouble &&
			playerHasAce &&
			dealerUpCard === 6:
			this.double(player);
			return player.action;
			break;

		case playerTotalValue === 18 &&
			!player.double &&
			!playerHasDouble &&
			playerHasAce &&
			(dealerUpCard > 2 && dealerUpCard < 7):
			this.double(player);
			return player.action;
			break;

		// case when you have > 21 but an ace in hand, count it as one
		case playerTotalValue > 21 && playerHasAce && !playerHasDouble:
			this.handleAce(player);
			return player.action;
			break;

		// player looses
		case playerTotalValue > 21:
			this.loose(player);
			return player.action;
			break;

		default:
			// for testing: Set action to loose so loop stops
			this.loose(player);
			return player.action;
			console.log('you landed in default case');
			break;
	}
};

Table.prototype.handleAce = function(player) {
	// loop through hand and map the ace card value to 1

	player.hand.forEach(function(card) {
		if (card.value === 11) {
			card.value = 1;
		}
	});
	player.action = 'hit';
};

Table.prototype.double = function(player) {
	player.double = true;
	player.doubleCount++;

	// add one card to current hand

	var newCard = this.dealer.dealCards(1);
	this.dealer.addCardsToHand(newCard, player.hand);

	var currentValue = this.getPlayerTotalValue(player);

	this.stand(player, currentValue);
};

Table.prototype.split = function(player) {
	// make an array of 2 arrays. Each array initialized with the first and second card of the array
	// [11, 11] ==> [[11], [11]]

	player.split = true;
	player.splitCount++;
	var playerHand = player.hand;
	var splitHand = [[playerHand[0]], [playerHand[1]]];

	var newCard = this.dealer.dealCards(1);
	this.dealer.addCardsToHand(newCard, splitHand[0]);

	newCard = this.dealer.dealCards(1);
	this.dealer.addCardsToHand(newCard, splitHand[1]);
	// console.log(splitHand);

	// add cards to first hand until !hit
	for (var i = 0; i < 2; i++) {
		do {
			var playerHand = splitHand[i];
			var playerValue = this.getTotalValue(playerHand);

			action = this.getPlayerAction(
				this.dealer.hand,
				playerHand,
				playerValue,
				player
			);
		} while (action === 'hit');
	}
};

Table.prototype.hasAce = function(hand) {
	(hasAce = false),
		hand.forEach(function(card) {
			if (card.value === 11) hasAce = true;
		});
	return hasAce;
};

Table.prototype.isDouble = function(hand) {
	isDouble = false;
	var previousValue;
	if (hand.length > 2) {
		return isDouble;
	} else {
		if (hand[0].value === hand[1].value) {
			isDouble = true;
		}
	}
	return isDouble;
};

// function for  testing
// args: value eg. [10, 11], target eg. dealer or player
Table.prototype.customHand = function(values, target) {
	var cards = [];
	target.hand = [];
	values.forEach(function(value) {
		card = new Card(value, 'spades');
		target.hand.push(card);
	});
};
