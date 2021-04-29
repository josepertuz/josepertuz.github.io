document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid"); //selecciona todos los elementos de la grid
  let squares = Array.from(document.querySelectorAll(".grid div")); //selecciona todos los divs del grid
  const scoreDisplay = document.querySelector("#score"); //elemento de puntaje
  const startBtn = document.querySelector("#start-button"); //elemento de boton de start
  const width = 10; //ancho predeterminado de la grid
  let nextRandom = 0; //valor para escoger el tetromino en la minigrid
  let timerId; //valor del intervalo de tiempo se deja null para que el juego no avance hasta presionar start
  let score = 0; //valor inicial del puntaje
  const colors = [
    //colores para cada tetromino!
    "orange",
    "red",
    "purple",
    "green",
    "blue",
  ];

  //Figuras de Tetris (Tetrominoes!)
  //Se establecen las figuras del tetris con una matriz que contiene el índice de la matriz squares
  //para formar la figura (como el ancho es 10 se debe sumar para obtener los demás bloques)

  const lTetromino = [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2],
  ];

  const zTetromino = [
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
  ];

  const tTetromino = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1],
  ];

  const oTetromino = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
  ];

  const iTetromino = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
  ];

  const theTetrominoes = [
    lTetromino,
    zTetromino,
    tTetromino,
    oTetromino,
    iTetromino,
  ];

  let currentPosition = 4; //Posición inicial del tetromino
  let currentRotation = 0; //Se inicia siempre con la primera rotación

  //seleccionar un tetramino aleatoriamente
  let random = Math.floor(Math.random() * theTetrominoes.length);
  let current = theTetrominoes[random][currentRotation]; //tetromino seleccionado

  //dibujar el tetromino

  function draw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.add("tetromino"); //se agrega la clase 'tetromino' para cambiar de color cada bloque o div de la matriz current
      squares[currentPosition + index].style.backgroundColor = colors[random]; //agrega color diferente a cada tetramino
    });
  }

  // borrar el tetromino
  function undraw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.remove("tetromino"); //se quita la clase tetromino a los bloques de la matriz current y así se borra el color y desaparece
      squares[currentPosition + index].style.backgroundColor = ""; //quita el color de cada tetramino
    });
  }

  //hacer que el tetromino se mueva cada segundo hacia abajo
  //timerId = setInterval(moveDown, 1000)         //esencialmente esto dibuja el tetromino y 1000 milisegundos después lo coloca un espacio por debajo (ya no es necesario con el botón de start)

  //asignar keycode a cada tecla
  function control(e) {
    if (e.keyCode === 37) {
      moveLeft();
    } else if (e.keyCode === 39) {
      moveRight();
    } else if (e.keyCode === 38) {
      rotate();
    } else if (e.keyCode === 40) {
      moveDown();
    }
  }

  document.addEventListener("keyup", control);

  //función para mover hacía abajo (dibuja primero, luego le suma el ancho a la posición actual colocandolo así un espacio por debajo (ver matriz en Excel))
  function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    freeze();
  }

  // función para congelar el tetromino en el fondo
  function freeze() {
    if (
      current.some((index) =>
        squares[currentPosition + index + width].classList.contains("taken")
      )
    ) {
      //verifica si alguno de los bloques debajo del tetromino (por eso se le suma el ancho) tiene la clase 'taken' (esto es por la linea de 10 divs finales invisibles )
      current.forEach((index) =>
        squares[currentPosition + index].classList.add("taken")
      ); //si la condición se cumple entonces se añade la clase taken al bloque de tetromino (da como un efecto en cascada)
      //seleccionar aleatoriamente un tetromino nuevo
      random = nextRandom;
      nextRandom = Math.floor(Math.random() * theTetrominoes.length);
      current = theTetrominoes[random][currentRotation]; //tetromino seleccionado
      currentPosition = 4;
      draw();
      displayShape();
      addScore();
      gameOver();
    }
  }

  //mover el tetromino a la izquierda pero detenerlo en el borde del grid es decir en los cuadros (0, 10, 20, 30, ...)
  function moveLeft() {
    undraw();
    const isALeftEdge = current.some(
      (index) => (currentPosition + index) % width === 0
    ); //chequea si un bloque del tetromino está en los cuadros 0, 10, 20 etc

    if (!isALeftEdge) {
      currentPosition -= 1; //si el tetromino no está en el borde restale un espacio a la posición actual para que se mueva a la izq
    }

    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken")
      )
    ) {
      currentPosition += 1; //si el tetromino se topa con un div que tiene ya la clase taken o sea está congelado se devuelve entonces un espacio hacia la derecha para no superponerse
    }

    draw();
  }

  //mover tetromino a la derecha pero detenerlo en el borde es decir cuadros (9, 19, 29, ...)

  function moveRight() {
    undraw();
    const isARightEdge = current.some(
      (index) => (currentPosition + index) % width === width - 1
    ); //chequea si un bloque del tetromino está en los cuadros 9, 19, 29 etc

    if (!isARightEdge) {
      currentPosition += 1; //si el tetromino no está en el borde restale un espacio a la posición actual para que se mueva a la izq
    }

    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken")
      )
    ) {
      currentPosition -= 1; //si el tetromino se topa con un div que tiene ya la clase taken o sea está congelado se devuelve entonces un espacio hacia la derecha para no superponerse
    }

    draw();
  }

  //rotación del tetromino
  function rotate() {
    undraw();
    currentRotation++; //nos movemos a través de la matriz de tetromino para obtener la nueva figura
    if (currentRotation === current.length) {
      //si la rotación es igual al máx número de rotaciones posibles entonces regresamos a cero
      currentRotation = 0;
    }
    current = theTetrominoes[random][currentRotation];
    draw();
  }

  //mostrar el sgte tetromino en la mini caja
  const displaySquares = document.querySelectorAll(".mini-grid div"); //se seleccionan todos los elementos div en el div de clase minigrid
  const displayWidth = 4; //se necesita otra variable para el ancho en la mini caja
  const displayIndex = 0;

  //mostrar el tetromino sin rotación
  const upNextTetrominoes = [
    [1, displayWidth + 1, displayWidth * 2 + 1, 2], //lTetromino
    [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], //zTetromino
    [1, displayWidth, displayWidth + 1, displayWidth + 2], //tTetromino
    [0, 1, displayWidth, displayWidth + 1], //oTetromino
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1], //iTetromino
  ];

  //mostrar la figura en la mini caja

  function displayShape() {
    displaySquares.forEach((square) => {
      square.classList.remove("tetromino"); //elimina cualquier rastro de la clase tetromino de la grid
      square.style.backgroundColor = "";
    });

    upNextTetrominoes[nextRandom].forEach((index) => {
      displaySquares[displayIndex + index].classList.add("tetromino"); //ahora para el tetromino seleccionado aleatoriamente en la minicaja se agrega la clase tetromino a cada bloque
      displaySquares[displayIndex + index].style.backgroundColor =
        colors[nextRandom]; //selecciona el color del tetromino en la minicaja
    });
  }

  //añadir funcionalidad al boton de start
  startBtn.addEventListener("click", () => {
    if (timerId) {
      //si se presiona el botón y existe un valor de timerId determinado pausamos el juego
      clearInterval(timerId); //función para pausar
      timerId = null;
    } else {
      draw(); //si el timerId ya es nulo entonces empezamos el juego de nuevo dibujando un tetromino en su posición original o sea 4
      timerId = setInterval(moveDown, 700); //invocamos la función moveDown para crear un nuevo timerId
      nextRandom = Math.floor(Math.random() * theTetrominoes.length); //seleccionar la sgte figura aleatoria en el minigrid
      displayShape();
    }
  });

  //función para el puntaje
  function addScore() {
    for (let i = 0; i < 199; i += width) {
      const row = [
        i,
        i + 1,
        i + 2,
        i + 3,
        i + 4,
        i + 5,
        i + 6,
        i + 7,
        i + 8,
        i + 9,
      ]; //definimos nuestra fila para ver si está completa

      if (row.every((index) => squares[index].classList.contains("taken"))) {
        //chequea si todos los elementos de la fila tienen la clase taken que es el de un tetromino
        score += 10; //sumar el puntaje si la fila está completa
        scoreDisplay.innerHTML = score; //muestra el puntaje en el html
        row.forEach((index) => {
          //elimina la clase taken de todos los bloques de la fila completada
          squares[index].classList.remove("taken");
          squares[index].classList.remove("tetromino"); //elimina la clase tetromino para que no aparezca ningún bloque azul
          squares[index].style.backgroundColor = "";
        });
        const squaresRemoved = squares.splice(i, width); //retira del array squares la fila completada
        squares = squaresRemoved.concat(squares); //agregamos los bloques de la fila retirada de nuevo a la matriz (se agregan desde el inicio)
        squares.forEach((cell) => grid.appendChild(cell)); //luego se apendan estos bloques al grid es decir arriba para que no parezca que se encoge el cuadro
      }
    }
  }

  //función de game over
  function gameOver() {
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken")
      )
    ) {
      //se chequea si existe un bloque en el tetromino inicial con la clase taken o sea que ya esté sobre otro bloque
      scoreDisplay.innerHTML = "Game Over"; //si lo anterior es verdadero ponemos Game Over en el score
      clearInterval(timerId); //se detiene el juego y el intervalo de tiempo se elimina
    }
  }
});

//José Carlos Pertuz Amaya 2020
