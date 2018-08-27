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

/* const start = new Vector(30, 50);
const moveTo = new Vector(5, 10);
const finish = start.plus(moveTo.times(2));

console.log(`Исходное расположение: ${start.x}:${start.y}`);
console.log(`Текущее расположение: ${finish.x}:${finish.y}`);
*/

