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

			expect(card.hidden).toBe(true);
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

	it('should have a function to add cards to the hand array', function(){
		deck = new Deck();
		dealer = new Dealer(deck);
		var dealedCards = dealer.dealCards(2);
		player.addCardsToHand(dealedCards);
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
});

describe('twoCardHand', function(){
	var hand;
	var deck;

	beforeEach(function() {
		deck = new Deck();
		hand = [deck[0], deck[1]];
	});
	it('should have an array with two random cards', function() {
		expect(twoCardHand.hand.length).toBe(2);
	})
});
