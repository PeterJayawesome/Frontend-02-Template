class Dog {
  constructor(name, year) {
    this.name = name;
    this.year = year;
  }
}

class Person {
  constructor(name) {
    this.name = name;
    this.health = 100;
	}
	
	damaged(name, damageType) {
		this.health -= 10;
		console.log(`Oche! ${this.name} is ${damageType} by ${name}!`);
	}
}

let Tom = new Person('Tom');
let Bob = new Dog('Bob');

Tom.damaged(Bob.name, 'bited');