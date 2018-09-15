'use strict';

class Vector {
  // позволяет контролировать расположение объектов в двумерном пространстве и управлять их размером и перемещением.
  constructor(x = 0, y = 0) { //координаты по оси X и по оси Y
    this.x = x;
    this.y = y;
  }
  plus (vector) {
    if (!(vector instanceof Vector)) {
      throw new Error(`В метод plus передан не вектор`);
    }
    const newX = this.x + vector.x;
    const newY = this.y + vector.y;
    return new Vector(newX, newY); 
    //Создает и возвращает новый объект типа Vector, с новыми координатами
  }
  times (factor) {
    const newX = this.x * factor;
    const newY = this.y * factor;
    return new Vector(newX, newY); 
    //Создает и возвращает новый объект типа Vector, с новыми координатами
  }
}
 
class Actor {
  // позволяет контролировать все движущиеся объекты на игровом поле и контролировать их пересечение.
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

class Level {
  constructor (grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.player = this.actors.find(actor => actor.type === 'player');
    //player — движущийся объект, тип которого — свойство type — равно player. Игорок передаётся с остальными движущимися объектами.
    this.height = this.grid.length; // Высота уровня = количеству строк сетки
    this.width = this.grid.reduce((rez, item) => item.length > rez ? item.length : rez, 0);
      // Ширина уровня равна количеству ячеек сетки
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
      this.status = 'lost'; // меняем статус - проиграли
      return;  // функция ничего не возвращает
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

class LevelParser {
  constructor(dictionaryOfChars = {}) {
    // dictionaryOfChars - словарь движущихся объектов игрового поля
    // тут можно вот так { ...dictionaryOfChars }
    this.dictionaryOfChars = { ...dictionaryOfChars }; // копия
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

class Fireball extends Actor {
  // прототип для движущихся опасностей на игровом поле. Он должен наследовать весь функционал движущегося объекта Actor.
  constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
     super(pos, new Vector(1, 1), speed);
  }

  get type() {
    return 'fireball';
  }

  getNextPosition(time = 1) { 
    return this.pos.plus(this.speed.times(time));
  }

  handleObstacle() {
    // столкновение молнии с препятствием, смена направления на противоположное
    this.speed = this.speed.times(-1);
  }

  act(time, level) {
    const nextPos = this.getNextPosition(time);
    if (level.obstacleAt(nextPos, this.size)) { // если встретиться с обьектом
      this.handleObstacle(); // меняет направление 
    } else {
      this.pos = nextPos
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(2, 0));
  }
}

class VerticalFireball extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(0, 2));
  }
}

class FireRain extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(0, 3));
    this.startPos = this.pos;
  }

  handleObstacle() {
    this.pos = this.startPos;
  }
}

class Coin extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6)); // pos, size
    this.springSpeed = 8; // Скорость подпрыгивания
    this.springDist = 0.07; // Радиус подпрыгивания
    this.spring = Math.random() * (Math.PI * 2); // Фаза подпрыгивания - рандом
    this.startPos = this.pos;
  }

  get type() {
    return 'coin';
  }

  updateSpring(time = 1) {
    // Обновляет фазу подпрыгивания. Это функция времени.
    this.spring += this.springSpeed * time;
  }
  
  getSpringVector() {
    // Создает и возвращает вектор подпрыгивания (только Y)
    return new Vector(0, Math.sin(this.spring) * this.springDist)
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);
    return this.startPos.plus(this.getSpringVector());
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

class Player extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5));
  }

  get type() {
    return 'player';
  }
}


const actorDict = {
  '@': Player,
  'v': FireRain,
  'o': Coin,
  '=': HorizontalFireball,
  '|': VerticalFireball
};
const parser = new LevelParser(actorDict);

loadLevels()
  .then(schemas => {
    return runGame(JSON.parse(schemas), parser, DOMDisplay);
  })
  .then(() => alert('Вы выиграли!'));