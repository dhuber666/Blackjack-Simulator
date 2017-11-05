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

	describe('blackjack cards', function() {
		it('should be an object with value and color property', function() {
			var card = new Card(10, 'ace');

			expect(card.value).toBeTruthy();
			expect(card.color).toBeTruthy();
		});
	});
});
