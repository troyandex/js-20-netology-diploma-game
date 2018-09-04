'use strict';
// класс Vector, позволяет контролировать расположение объектов в двумерном пространстве и управлять их размером и перемещением.
class Vector {
  constructor(x = 0, y = 0) { //координаты по оси X и по оси Y
    this.x = x;
    this.y = y;
  }
  plus (vector) {
    if (!(vector instanceof Vector)) {
      throw new Error(`В метод plus передан не вектор`);
    }
    const addX = this.x + vector.x;
    const addY = this.y + vector.y;
    return new Vector(addX, addY); 
    //Создает и возвращает новый объект типа Vector, с новыми координатами
  }
  times (factor) {
    const addX = this.x * factor;
    const addY = this.y * factor;
    return new Vector(addX, addY); 
    //Создает и возвращает новый объект типа Vector, с новыми координатами
  }
}

/* пример кода:
 const start = new Vector(30, 50);
const moveTo = new Vector(5, 10);
const finish = start.plus(moveTo.times(2));

console.log(`Исходное расположение: ${start.x}:${start.y}`);
console.log(`Текущее расположение: ${finish.x}:${finish.y}`);
*/

// класс Actor, позволяет контролировать все движущиеся объекты на игровом поле и контролировать их пересечение.
class Actor {
  constructor(position = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (!(position instanceof Vector) ||
      !(size instanceof Vector) ||
      !(speed instanceof Vector)) {
      throw new Error(`В конструктор класса Actor передан не вектор`);
    }
    this.pos = position;
    this.size = size;
    this.speed = speed;
  }
  
  act() {
  }

  get left() {//границы объекта по X
    return this.pos.x;
  }
  get top() { //границы объекта по Y
    return this.pos.y;
  }
  get right() {//границы объекта по X + размер
    return this.pos.x + this.size.x;
  }
  get bottom() { //границы объекта по Y + размер
    return this.pos.y + this.size.y
  }
  get type() {
    return 'actor';
  }

  isIntersect(otherActor) { 
  //Метод проверяет, пересекается ли текущий объект с переданным объектом.
    if (!(otherActor instanceof Actor)) {
      throw new Error(`В метод isIntersect передан не объект типа Actor`);
    }
    if (this === otherActor) { // Объект не пересекается сам с собой
      return false;
    }   
    //проверяем, пересекается ли текущий объект с переданным объектом
    return this.right > otherActor.left && 
           this.left < otherActor.right && 
           this.top < otherActor.bottom && 
           this.bottom > otherActor.top;
  }
}

/* 
// пример кода:
const items = new Map();
const player = new Actor();
items.set('Игрок', player);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));

function position(item) {
  return ['left', 'top', 'right', 'bottom']
    .map(side => `${side}: ${item[side]}`)
    .join(', ');  
}

function movePlayer(x, y) {
  player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
  console.log(`${title}: ${position(item)}`);
  if (player.isIntersect(item)) {
    console.log(`Игрок подобрал ${title}`);
  }
}

items.forEach(status);
movePlayer(10, 10);
items.forEach(status);
movePlayer(5, -5);
items.forEach(status);
*/
// Результат работы примера:
/*
Игрок: left: 0, top: 0, right: 1, bottom: 1
Первая монета: left: 10, top: 10, right: 11, bottom: 11
Вторая монета: left: 15, top: 5, right: 16, bottom: 6
Игрок: left: 10, top: 10, right: 11, bottom: 11
Первая монета: left: 10, top: 10, right: 11, bottom: 11
Игрок подобрал Первая монета
Вторая монета: left: 15, top: 5, right: 16, bottom: 6
Игрок: left: 15, top: 5, right: 16, bottom: 6
Первая монета: left: 10, top: 10, right: 11, bottom: 11
Вторая монета: left: 15, top: 5, right: 16, bottom: 6
Игрок подобрал Вторая монета
*/
class Level {
  constructor (grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.player = this.actors.find(actor => actor.type === 'player');
    //player — движущийся объект, тип которого — свойство type — равно player. Игорок передаётся с остальными движущимися объектами.
    this.height = this.grid.length; // Высота уровня = количеству строк сетки
    this.width = this.grid.reduce((rez, item) => {
      // Ширина уровня равна количеству ячеек сетки
      if (rez > item.length) {
        return rez;
      } else {
        return item.length;
      }
    }, 0);
    this.status = null; // состояние прохождения уровня
    this.finishDelay = 1; // таймаут после окончания игры, равен 1 после создания. Необходим, чтобы после выигрыша или проигрыша игра не завершалась мгновенно
  }

  isFinished() { // Определяет, завершен ли уровень
    return this.status !== null && this.finishDelay < 0;
  }

  actorAt(actor) { // Определяет, расположен ли какой-то другой движущийся объект в переданной позиции
    if (!(actor instanceof Actor)) {
      throw new Error(`В метод actorAt не передан движущийся объект типа Actor`);
    }
    return this.actors.find(actorEl => actorEl.isIntersect(actor));
  }
  
  obstacleAt(position, size) { 
  //определяет, нет ли препятствия в указанном месте.
    if (!(position instanceof Vector) ||
      !(size instanceof Vector)) {
      throw new Error(`В метод obstacleAt передан не вектор`);
    }

    const borderLeft = Math.floor(position.x);
    const borderRight = Math.ceil(position.x + size.x);
    const borderTop = Math.floor(position.y);
    const borderBottom = Math.ceil(position.y + size.y);

//Если описанная двумя векторами область выходит за пределы игрового поля, 
//то метод вернет строку lava, если область выступает снизу. 
//И вернет wall в остальных случаях. Будем считать, что игровое поле слева, 
//сверху и справа огорожено стеной и снизу у него смертельная лава.

    if (borderLeft < 0 || borderRight > this.width || borderTop < 0) {
      return 'wall';
    } 
    if (borderBottom > this.height) {
      return 'lava';
    }
    
    for (let y = borderTop; y < borderBottom; y++) {
      for (let x = borderLeft; x < borderRight; x++) {
        const gridLevel = this.grid[y][x];
        if (gridLevel) {
          return gridLevel;
        }
      }
    }
  }
  
  removeActor(actor) { // удаляет переданный объект с игрового поля
    const actorIndex = this.actors.indexOf(actor); //возвращает индекс объекта
    if (actorIndex !== -1) {
      this.actors.splice(actorIndex, 1); //удаляем один элемент с найденного индекса.
    }
  }

  noMoreActors(type) { 
  //Определяет, остались ли еще объекты переданного типа на игровом поле
    return !this.actors.some(actor => actor.type === type)
  }

  //playerTouched - Меняет состояние игрового поля при касании игроком каких-либо объектов или препятствий.
  playerTouched(touchedType, actor) {
  //Тип препятствия или объекта, движущийся объект  
    if (this.status !== null) {
      return;
    }
    if (['lava', 'fireball'].some((el) => el === touchedType)) { 
      //если коснулись lava или fireball
      return this.status = 'lost'; // проиграли
    } 
    if (touchedType === 'coin' && actor.type === 'coin') { 
      //если коснулись монеты
      this.removeActor(actor); //удаляем ее
      if (this.noMoreActors('coin')) { //если монет больше нет
        return this.status = 'won' // выиграли
      }
    }
  }
}

// Пример кода
/*
const grid = [
  [undefined, undefined],
  ['wall', 'wall']
];

function MyCoin(title) {
  this.type = 'coin';
  this.title = title;
}
MyCoin.prototype = Object.create(Actor);
MyCoin.constructor = MyCoin;

const goldCoin = new MyCoin('Золото');
const bronzeCoin = new MyCoin('Бронза');
const player = new Actor();
const fireball = new Actor();

const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);

level.playerTouched('coin', goldCoin);
level.playerTouched('coin', bronzeCoin);

if (level.noMoreActors('coin')) {
  console.log('Все монеты собраны');
  console.log(`Статус игры: ${level.status}`);
}

const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
if (obstacle) {
  console.log(`На пути препятствие: ${obstacle}`);
}

const otherActor = level.actorAt(player);
if (otherActor === fireball) {
  console.log('Пользователь столкнулся с шаровой молнией');
}
*/
// Результат выполнения:
// Все монеты собраны
// Статус игры: won
// На пути препятствие: wall
// Пользователь столкнулся с шаровой молнией

class LevelParser {
  constructor(dictionaryOfChars = {}) {
    // dictionaryOfObjects - словарь движущихся объектов игрового поля
    this.dictionaryOfChars = Object.assign({}, dictionaryOfChars); // копия
  }

  actorFromSymbol(char) {
  // Возвращает конструктор объекта по его символу, используя словарь
    return this.dictionaryOfChars[char];
  }

  obstacleFromSymbol(char) {
  // принимает символ - возвращает строку, соответствующую символу препятствия
    if (char === 'x') {
      return 'wall';
    }
    if (char === '!') {
      return 'lava';
    } 
  }

  createGrid(plan) {
    // Принимает массив строк и преобразует его в массив массивов с препятствиями и пкстотами
    return plan.map(line => line.split(''))
      .map(line => line
        .map(line => this.obstacleFromSymbol(line))
      );
  }

  createActors(plan) { 
  //Аналогично createGrid принимает массив строк и преобразует его в массив только движущихся объектов
    return plan.reduce((rez, itemY, y) => { // обьеденяем в результат
      itemY.split('').forEach((itemX, x) => {
        const constructor = this.actorFromSymbol(itemX); // достаем консутруктор
        if (typeof constructor === 'function') {
          const actor = new constructor(new Vector(x, y));
          if (actor instanceof Actor) { // только движ обьекты
            rez.push(actor);
          }
        }
      });
      return rez;
    },[]);
  }

  parse(plan) {
    return new Level(this.createGrid(plan), this.createActors(plan));
  }
}

// Пример использования

const plan = [
  ' @ ',
  'x!x'
];

const actorsDict = Object.create(null);
actorsDict['@'] = Actor;

const parser = new LevelParser(actorsDict);
const level = parser.parse(plan);

level.grid.forEach((line, y) => {
  line.forEach((cell, x) => console.log(`(${x}:${y}) ${cell}`));
});

level.actors.forEach(actor => console.log(`(${actor.pos.x}:${actor.pos.y}) ${actor.type}`));


/* Результат выполнения кода:
(0:0) undefined
(1:0) undefined
(2:0) undefined
(0:1) wall
(1:1) lava
(2:1) wall
(1:0) actor */