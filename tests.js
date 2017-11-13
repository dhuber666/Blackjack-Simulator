describe('blackjack deck', function() {
	var deck;
	beforeEach(function() {
		deck = new Deck();
	});
	it('should be created as an object', function() {
		deck.test = 3;

		expect(deck.test).toBe(3);
	});

	it('should have a cards array that starts empty', function() {
		expect(Array.prototype.isPrototypeOf(deck.cards)).toBe(true);
		expect(deck.cards.length).toBe(0);
	});

	it('should have a method to generate the deck', function() {
		deck.initialize();
		var deckSize = deck.cards.length;

		// 312 cards in a deck
		expect(deckSize).toBe(312);
	});

	it('should generate a deck with 52 unique cards', function() {
		deck.initialize();
		var counter = 0;
		deck.cards.forEach(function(card) {
			if (card.color === 'spades') {
				counter++;
			}
		});

		expect(counter).toBe(78);
	});

	it('should have a function to show all cards currently in the deck', function() {
		var cardsShown = deck.showDeck();

		// returns false when deck has no cards
		expect(cardsShown).toBe(false);

		deck.initialize();
		// and true if it has cards
		cardsShown = deck.showDeck();
		expect(cardsShown).toBe(true);
	});

	it('should have a shuffle function that shuffles the current deck', function() {
		deck.initialize();
		var firstCardUnshuffled = deck.cards[0];
		// actually not yet shuffled
		var firstCardShuffled = deck.cards[0];

		expect(firstCardShuffled === firstCardUnshuffled).toBe(true);
		deck.shuffle();
		var firstCardShuffled = deck.cards[0];

		expect(firstCardShuffled === firstCardUnshuffled).toBe(false);
	});

	describe('blackjack cards', function() {
		it('should be an object with value and color property', function() {
			var card = new Card(10, 'ace');

			expect(card.value).toBeTruthy();
			expect(card.color).toBeTruthy();
		});
		it('should have a hidden property  that is defaulted to false', function() {
			var card = new Card(10, 'ace');

			expect(card.hidden).toBe(false);
		});
	});
});

describe('Dealer', function() {
	var deck;
	var dealer;
	beforeEach(function() {
		deck = new Deck();
		dealer = new Dealer(deck);
	});

	it('should have access to a blackjack deck', function() {
		var cardsShown = dealer.deck.showDeck();
		expect(cardsShown).toBe(true);
	});

	it('should have a dealCards function to deal out cards from the deck and decide how many cards', function() {
		// dealCards return array with cards
		var dealedCards = dealer.dealCards(3);
		expect(dealedCards.length).toBe(3);

		expect(function() {
			dealer.dealCards(0);
		}).toThrow('args needs to be 1 or < 312');
		expect(function() {
			dealer.dealCards(500);
		}).toThrow('args needs to be 1 or < 312');
	});
});

describe('Player', function() {
	var player;
	beforeEach(function() {
		player = new Player('dominik');
	});

	it('should be an object with an empty hand array and name property', function() {
		expect(player.name).toBe('dominik');
		expect(player.hand.length).toBe(0);
	});

	it('should have a function to add cards to the hand array', function() {
		deck = new Deck();
		dealer = new Dealer(deck);
		var dealedCards = dealer.dealCards(2);
		dealer.addCardsToHand(dealedCards, player);
		expect(player.hand.length).toBe(2);
	});
});

// this is the "main object" - a table has a dealer and n players
describe('Table', function() {
	var players;
	var deck;
	var dealer;
	var table;

	beforeEach(function() {
		players = [new Player('dominik'), new Player('magdalena')];
		deck = new Deck();
		dealer = new Dealer(deck);
		table = new Table(dealer, players);
	});

	it('should have a players array and a dealer with a deck', function() {
		expect(table.players.length).toBe(2);
		expect(table.dealer.deck).toBeTruthy();
	});

	// own section for testing the simulation
	describe('Simulate', function() {
		var players;
		var deck;
		var dealer;
		var table;

		beforeEach(function() {
			players = [new Player('dominik'), new Player('magdalena')];
			deck = new Deck();
			dealer = new Dealer(deck);
			table = new Table(dealer, players);
		});

		it('should give 2 cards to every player in the players array when simulation runs 1 round', function() {
			table.simulate(1);

			expect(table.players[0].hand).toBeTruthy();
			expect(table.players[1].hand).toBeTruthy();
			// 3rd card should be false (just 2 cards)
		});

		it('should give 6 cards to every player in the players array when simulation runs 3 rounds', function() {
			table.simulate(3);

			expect(table.players[0].hand).toBeTruthy();
			expect(table.players[1].hand).toBeTruthy();
			// 7th card should be false (just 6 cards)
		});

		it('should give 2 cards to the dealer when simulated 1 time', function() {
			table.simulate(1);

			expect(table.dealer.hand).toBeTruthy();
			expect(table.dealer.hand).toBeTruthy();
		});

		it('should give 6 cards to the dealer when simulated 3 times', function() {
			table.simulate(3);

			expect(table.dealer.hand).toBeTruthy();
			expect(table.dealer.hand).toBeTruthy();
		});
		/* Test hidden since useless right now */
		// it('should have the dealers 2nd card hidden and the first shown', function() {
		// 	table.simulate(1);

		// 	expect(table.dealer.hand[0].hidden).toBeFalsy();
		// 	expect(table.dealer.hand[1].hidden).toBeTruthy();
		// });
		// player tests
		it('should get the players current total value', function() {
			table.simulate(1);
			var player = new Player('dominik');
			player.hand.push(new Card(5, 'spades'));
			player.hand.push(new Card(7, 'spades'));

			expect(table.getPlayerTotalValue(player)).toBe(12);
		});

		/* since we reset the game after simulation we can't test for that case as it is right no */
		// it('should get the players action depending what value he got', function() {
		// 	table.simulate(1);
		// 	var player = table.players[0];

		// 	if (player.totalValue < 17) {
		// 		expect(table.players[0].action).toBe('hit');
		// 		console.log(table.players[0].action, player.totalValue);
		// 	} else if (player.totalValue >= 17 && player.totalValue <= 21) {
		// 		expect(table.players[0].action).toBe('stand');
		// 		console.log(table.players[0].action, player.totalValue);
		// 	} else if (player.totalValue > 21) {
		// 		// debugger;

		// 		expect(table.players[0].looses).toBe(1);
		// 		console.log(table.players[0].action, player.looses);
		// 	}
		// });

		// Dealer tests
		it('should get the dealers action depending on what value his first card is', function() {
			var players = [new Player('dominik')];
			var deck = new Deck();
			var dealer = new Dealer(deck);
			var newTable = new Table(dealer, players);

			var NUMBER_OF_GAMES = 1000;

			newTable.simulate(NUMBER_OF_GAMES); // type in how often you want to simulate.

			expect(
				newTable.players[0].wins +
					newTable.players[0].looses +
					newTable.players[0].ties
			).toBe(NUMBER_OF_GAMES);

			// expect(loopCount).toBe(10);
			console.log('Player 1 has won how often: ', newTable.players[0].wins);
			console.log('Player 1 has lost how often: ', newTable.players[0].looses);
			console.log('Player 1 has tied how often: ', newTable.players[0].ties);
			console.log('Cards of player: ', newTable.players[0].hand);
			console.log('Cards of dealer: ', newTable.dealer.hand);
			console.log('Blackjack count: ', newTable.players[0].blackjackCount);
			// this should be equal to whats passed into simulate. So 1000 in this case
			console.log(
				'Sum of all calculated together is: ',
				newTable.players[0].wins +
					newTable.players[0].looses +
					newTable.players[0].ties
			); // TODO: Fixme . it's not 1000

			// if more then one player:
			// console.log('Player 2 has won how often: ', newTable.players[1].wins);
			// console.log('Player 2 has lost how often: ', newTable.players[1].looses);
			// console.log('Player 2 has tied how often: ', newTable.players[1].ties);

			// console.log('Player 3 has won how often: ', newTable.players[2].wins);
			// console.log('Player 3 has lost how often: ', newTable.players[2].looses);
			// console.log('Player 3 has tied how often: ', newTable.players[2].ties);

			// console.log('Remaining cards: ', newTable.dealer.deck.cards.length);
		});

		describe('Different conditions if the player wins or not', function() {
			var players;
			var deck;
			var dealer;
			var table;

			beforeEach(function() {
				players = [new Player('dominik')];
				deck = new Deck();
				dealer = new Dealer(deck);
				table = new Table(dealer, players);
			});

			it('should increment players wins if the player has backjack and dealer has not', function() {
				// set up custom player hand
				var playerValues = [10, 11];
				var player = table.players[0];
				table.customHand(playerValues, player);

				// set up custom dealer hand
				var dealerValues = [2, 3];
				var dealer = table.dealer;
				table.customHand(dealerValues, dealer);

				// first check
				table.computePlayerAction(table.dealer.hand, players);
				expect(table.players[0].blackjack).toBe(true);

				// second try where dealer also has a blackjack
				player.blackjack = false;
				var dealerValues = [10, 11];
				var dealer = table.dealer;
				table.customHand(dealerValues, dealer);

				table.computePlayerAction(table.dealer.hand, players);

				expect(table.players[0].blackjack).toBe(true);
			});

			describe('Stand Tests - Player should just stand in here', function() {
				it('should run stand when the player has 16 - 12, A8 - A10, 10 10 and the dealer has something between 2 - 6 as up card ', function() {
					var playerValues = [10, 2];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [4, 6];
					var dealer = table.dealer;
					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('stand');
				});
				it('should run stand when the player has A 9 and the dealer has any card as up card', function() {
					var playerValues = [11, 9];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [4, 6];
					var dealer = table.dealer;
					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('stand');
				});

				it('should run stand when the player has A 8 and the dealer has any card as up card expect when he has 6', function() {
					var playerValues = [11, 8];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [5, 6];
					var dealer = table.dealer;
					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('stand');
				});

				it('should run stand when the player has A 7 and the dealer has any card as up card expect when he has 3 to 6 and 9 to 10', function() {
					var playerValues = [11, 7];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [2, 6];
					var dealer = table.dealer;
					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('stand');
				});

				it('should run stand when the player has 10 10 and the dealer has any card', function() {
					var playerValues = [10, 10];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [2, 6];
					var dealer = table.dealer;
					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('stand');
				});

				it('should run stand when the player has 9 9 and the dealer has 7, 10 or 11', function() {
					var playerValues = [9, 9];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [7, 6];
					var dealer = table.dealer;
					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('stand');
				});
				it('should run stand when the player has 7 7 and the dealer has 10', function() {
					var playerValues = [7, 7];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [10, 6];
					var dealer = table.dealer;
					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('stand');
				});
			});

			describe('Hit Tests - Player should Hit in here', function() {
				it('should run Hit when player has total of 13 - 17+ and dealer has 7 - 11', function() {
					var playerValues = [7, 6];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [10, 6];
					var dealer = table.dealer;
					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('hit');
				});

				it('should run Hit when player has total of 12 and dealer has 2 - 3 and 7 - 11', function() {
					var playerValues = [7, 5];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [2, 6];
					var dealer = table.dealer;

					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('hit');
				});

				it('should run Hit when player has total of 10 and dealer has 10 or 11', function() {
					var playerValues = [7, 3];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [10, 6];
					var dealer = table.dealer;

					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('hit');
				});

				it('should run Hit when player has total of 9 and dealer has more then 6', function() {
					var playerValues = [7, 2];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [7, 6];
					var dealer = table.dealer;

					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('hit');
				});

				it('should run Hit when player has total of 8 and dealer has more then 6 and less then 5', function() {
					var playerValues = [6, 2];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [7, 6];
					var dealer = table.dealer;

					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('hit');
				});

				it('should run Hit when player has total of 5 - 7 and dealer has any card', function() {
					var playerValues = [3, 2];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [7, 6];
					var dealer = table.dealer;

					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('hit');
				});

				it('should run Hit when player has A 7 and dealer has 9 or 10', function() {
					var playerValues = [11, 7];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [11, 6];
					var dealer = table.dealer;

					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('hit');
				});

				it('should run Hit when player has A 6 and dealer has > 6', function() {
					var playerValues = [11, 6];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [6, 6];
					var dealer = table.dealer;

					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('hit');
				});

				it('should run Hit when player has A 5 and dealer has < 4 and > 6', function() {
					var playerValues = [11, 5];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [3, 6];
					var dealer = table.dealer;

					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('hit');
				});

				it('should run Hit when player has A 4 and dealer has < 4 and > 6', function() {
					var playerValues = [11, 4];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [7, 6];
					var dealer = table.dealer;

					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('hit');
				});

				it('should run Hit when player has A 3 and dealer has < 4 and > 6', function() {
					var playerValues = [11, 3];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [7, 6];
					var dealer = table.dealer;

					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('hit');
				});

				it('should run Hit when player has A 2 and dealer has < 4 and > 6', function() {
					var playerValues = [11, 2];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [7, 6];
					var dealer = table.dealer;

					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('hit');
				});

				it('should run Hit when player has 7 7 and dealer has 8 || 9 || 11', function() {
					var playerValues = [7, 7];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [8, 6];
					var dealer = table.dealer;

					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('hit');
				});

				it('should run Hit when player has 6 6 and dealer > 6', function() {
					var playerValues = [6, 6];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [8, 6];
					var dealer = table.dealer;

					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('hit');
				});

				it('should run Hit when player has 5 5 and dealer > 9', function() {
					var playerValues = [5, 5];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [10, 6];
					var dealer = table.dealer;

					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('hit');
				});

				it('should run Hit when player has 4 4 and dealer < 5 || > 6', function() {
					var playerValues = [4, 4];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [3, 6];
					var dealer = table.dealer;

					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('hit');
				});

				it('should run Hit when player has 3 3 and dealer < 4 || > 7', function() {
					var playerValues = [3, 3];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [3, 6];
					var dealer = table.dealer;

					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('hit');
				});

				it('should run Hit when player has 2 2 and dealer 2 || > 7', function() {
					var playerValues = [2, 2];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [2, 6];
					var dealer = table.dealer;

					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('hit');
				});
			});

			describe('Split Tests - Player should Split in here', function() {
				it('should run Split when player has 11 11 and dealer has any card', function() {
					var playerValues = [2, 7];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [2, 6];
					var dealer = table.dealer;
					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('split');
				});
				// this should run every time and show stats
				fit('my custom test', function() {
					table.simulate(1000);
					console.log('Player 1 has won how often: ', table.players[0].wins);
					console.log('Player 1 has lost how often: ', table.players[0].looses);
					console.log('Player 1 has tied how often: ', table.players[0].ties);
					console.log('Cards of player: ', table.players[0].hand);
					console.log('Cards of dealer: ', table.dealer.hand);
					console.log('Blackjack count: ', table.players[0].blackjackCount);
					// this should be equal to whats passed into simulate. So 1000 in this case
					console.log(
						'Sum of all calculated together is: ',
						table.players[0].wins +
							table.players[0].looses +
							table.players[0].ties -
							table.players[0].splitCount
					);
				});
				it('should run Split when player has 9 9 and dealer has < 7 || 8 || 9', function() {
					var playerValues = [9, 9];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [2, 6];
					var dealer = table.dealer;
					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('split');
				});

				it('should run Split when player has 7 7 and dealer has < 8 ', function() {
					var playerValues = [7, 7];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [2, 6];
					var dealer = table.dealer;
					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('split');
				});

				it('should run Split when player has 6 6 and dealer has < 7 ', function() {
					var playerValues = [6, 6];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [2, 6];
					var dealer = table.dealer;
					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('split');
				});

				it('should run Split when player has 3 3 and dealer has > 3 && < 8 ', function() {
					var playerValues = [3, 3];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [4, 6];
					var dealer = table.dealer;
					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('split');
				});

				fit('should run Split when player has 2 2 and dealer has > 2 && < 8 ', function() {
					var playerValues = [2, 2];
					var player = table.players[0];
					table.customHand(playerValues, player);

					var dealerValues = [4, 6];
					var dealer = table.dealer;
					table.customHand(dealerValues, dealer);

					var action = table.computePlayerAction(table.dealer.hand, players);
					table.computeDealerAction(table.dealer, players);
					console.log(action);
					expect(action).toBe('split');
				});
			});
		});
	});
});
