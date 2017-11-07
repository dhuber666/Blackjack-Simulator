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

			expect(table.players[0].hand[0]).toBeTruthy();
			expect(table.players[1].hand[1]).toBeTruthy();
			// 3rd card should be false (just 2 cards)
			expect(table.players[0].hand[2]).toBeFalsy();
		});

		it('should give 6 cards to every player in the players array when simulation runs 3 rounds', function() {
			table.simulate(3);

			expect(table.players[0].hand[5]).toBeTruthy();
			expect(table.players[1].hand[5]).toBeTruthy();
			// 7th card should be false (just 6 cards)
			expect(table.players[0].hand[6]).toBeFalsy();
		});

		it('should give 2 cards to the dealer when simulated 1 time', function() {
			table.simulate(1);

			expect(table.dealer.hand[0]).toBeTruthy();
			expect(table.dealer.hand[1]).toBeTruthy();

			expect(table.dealer.hand[2]).toBeFalsy();
		});

		it('should give 6 cards to the dealer when simulated 3 times', function() {
			table.simulate(3);

			expect(table.dealer.hand[0]).toBeTruthy();
			expect(table.dealer.hand[5]).toBeTruthy();

			expect(table.dealer.hand[6]).toBeFalsy();
		});

		it('should have the dealers 2nd card hidden and the first shown', function() {
			table.simulate(1);

			expect(table.dealer.hand[0].hidden).toBeFalsy();
			expect(table.dealer.hand[1].hidden).toBeTruthy();
		});
	});
});
