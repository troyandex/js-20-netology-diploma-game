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

/* пример кода:
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