const chessboard = document.getElementById("chessboard");
const queensContainer = document.getElementById("queensContainer");
const addQueenBtn = document.getElementById("addQueenBtn");
const removeQueenBtn = document.getElementById("removeQueenBtn");
const confirmBtn = document.getElementById("confirmBtn");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const currentPageEl = document.getElementById("currentPage");
const totalPagesEl = document.getElementById("totalPages");

// 翻页
let currentPage = 1;
let totalPages = 1; // 总解数
let allSolutions = []; // 存储所有解

let squares = document.querySelectorAll(".square");

const queenPositions = {};

const MIN_BOARD_SIZE = 1;
const MAX_BOARD_SIZE = 20;
const SQUARE_SIZE = 60;
let BOARD_SIZE = 8;

const increaseBoardBtn = document.getElementById("increaseBoardBtn");
const decreaseBoardBtn = document.getElementById("decreaseBoardBtn");

addQueenBtn.addEventListener("click", addQueen);
removeQueenBtn.addEventListener("click", removeQueen);
increaseBoardBtn.addEventListener("click", increaseBoardSize);
decreaseBoardBtn.addEventListener("click", decreaseBoardSize);
confirmBtn.addEventListener("click", searchSolutions);
prevPageBtn.addEventListener("click", goToPrevPage);
nextPageBtn.addEventListener("click", goToNextPage);

class Queen8Solver {
  constructor() {
    this.nq = 0;
    this.chess = [];
    this.answer = [];
    this.num = 0;
  }

  solveAll(size) {
    this.nq = size;
    this.chess = new Array(this.nq);
    this.answer = [];
    this.num = 0;
    
    this.solveAllHelper(0);
    return this.answer;
  }

  solveSpecific(size, existingQueens) {
    this.nq = size;
    this.chess = new Array(this.nq).fill(-1);
    this.answer = [];
    this.num = 0;
    
    for (const queen of existingQueens) {
      const row = queen[0];
      const col = queen[1];
      if (row >= 0 && row < this.nq && col >= 0 && col < this.nq) {
        this.chess[row] = col;
      }
    }
    
    this.solveSpecificHelper(0);
    
    return this.answer;
  }

  solveAllHelper(step) {
    if (step === this.nq) {
      ++this.num;
      this.answer.push([...this.chess]);
      return;
    }
    
    for (let i = 0; i < this.nq; i++) {
      this.chess[step] = i;
      if (this.checkAll(step)) {
        this.solveAllHelper(step + 1);
      }
    }
  }
  
  solveSpecificHelper(step) {
    if (step === this.nq) {
      ++this.num;
      this.answer.push([...this.chess]);
      return;
    }
    
    // 如果当前行已有棋子（来自existingQueens），则直接检查并跳到下一行
    if (this.chess[step] !== -1) {
      if (this.checkSpecific(step)) {
        this.solveSpecificHelper(step + 1);
      }
      return;
    }
    
    // 尝试在当前行的每一列放置皇后
    for (let i = 0; i < this.nq; i++) {
      this.chess[step] = i;
      if (this.checkSpecific(step)) {
        this.solveSpecificHelper(step + 1);
      }
    }
    
    // 回溯
    this.chess[step] = -1;
  }

  checkAll(step) {
    for (let i = 0; i < step; i++) {
      if (this.chess[i] === this.chess[step] ||
          Math.abs(i - step) === Math.abs(this.chess[i] - this.chess[step])) {
        return false;
      }
    }
    return true;
  }

  checkSpecific(step) {
    for (let i = 0; i < this.nq; i++) {
      if (i === step || this.chess[i] === -1) {
        continue;
      }
      
      if (this.chess[i] === this.chess[step] ||
          Math.abs(i - step) === Math.abs(this.chess[i] - this.chess[step])) {
        return false;
      }
    }
    return true;
  }

}

const queenSolver = new Queen8Solver();

function getAllSolutions(size = BOARD_SIZE) {
  const solutions = queenSolver.solveAll(size);
  return solutions;
}

function getSpecificSolutions(existingQueens, size = BOARD_SIZE) {
  const solutions = queenSolver.solveSpecific(size, existingQueens);
  return solutions;
}

function searchSolutions() {
  const existingQueens = [];
  for (let id in queenPositions) {
    const position = queenPositions[id];
    if (position) {
      existingQueens.push([position.row, position.col]);
    }
  }

  let solutions;
  if (existingQueens.length > 0) {
    solutions = getSpecificSolutions(existingQueens);
  } else {
    solutions = getAllSolutions();
  }

  allSolutions = solutions;
  currentPage = 1;
  updatePagination();

  displayCurrentPageSolutions();

  alert(`找到 ${solutions.length} 个解`);
}

// 更新
function updatePagination() {
  totalPages = allSolutions.length; 
  currentPage = Math.min(currentPage, totalPages);

  currentPageEl.textContent = currentPage;
  totalPagesEl.textContent = totalPages;

  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;
}

function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--;
    updatePagination();
    displayCurrentPageSolutions();
  }
}

function goToNextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    updatePagination();
    displayCurrentPageSolutions();
  }
}

function displayCurrentPageSolutions() {
  if (
    allSolutions.length > 0 &&
    currentPage > 0 &&
    currentPage <= allSolutions.length
  ) {
    applySolution(allSolutions[currentPage - 1]);
  }
}

function updateButtonStates() {
  const currentQueenCount = Object.keys(queenPositions).length;
  addQueenBtn.disabled = currentQueenCount >= BOARD_SIZE;
  removeQueenBtn.disabled = currentQueenCount <= 0;
  increaseBoardBtn.disabled = BOARD_SIZE >= MAX_BOARD_SIZE;
  decreaseBoardBtn.disabled = BOARD_SIZE <= MIN_BOARD_SIZE;
}

function addQueen() {
  const currentQueenCount = Object.keys(queenPositions).length;

  if (currentQueenCount >= BOARD_SIZE) {
    return; 
  }

  const newQueenId = currentQueenCount + 1;

  const newQueen = document.createElement("div");
  newQueen.className = "queen";
  newQueen.dataset.queenId = newQueenId;

  const queenImg = document.createElement("img");
  queenImg.src = "queen.png";
  queenImg.alt = `Queen ${newQueenId}`;

  newQueen.appendChild(queenImg);
  queensContainer.appendChild(newQueen);

  queenPositions[newQueenId] = null;

  makeQueenDraggable(newQueen);

  updateButtonStates();
}

function removeQueen() {
  const currentQueenCount = Object.keys(queenPositions).length;

  if (currentQueenCount <= 0) {
    return; 
  }

  const lastQueenId = currentQueenCount;

  const lastQueen = document.querySelector(`[data-queen-id="${lastQueenId}"]`);

  if (lastQueen) {
    lastQueen.remove();
    delete queenPositions[lastQueenId];
    updateButtonStates();
  }
}

function makeQueenDraggable(queenEl) {
  Draggable.create(queenEl, {
    bounds: window,
    zIndexBoost: true,

    onDragStart: function () {
      addClass(this.target, "dragging");
      squares.forEach(sq => removeClass(sq, "highlight"));
    },

    onDrag: function (e) {
      const centerX = this.pointerX;
      const centerY = this.pointerY;
      const nearest = findNearestSquare(centerX, centerY);

      squares.forEach(sq => removeClass(sq, "highlight"));
      if (nearest) {
        const targetSquare = document.querySelector(
          `[data-row="${nearest.row}"][data-col="${nearest.col}"]`
        );
        addClass(targetSquare, "highlight");
      }
    },

    onDragEnd: function () {
      removeClass(this.target, "dragging");

      const centerX = this.pointerX;
      const centerY = this.pointerY;
      const nearest = findNearestSquare(centerX, centerY);


      squares.forEach(sq => removeClass(sq, "highlight"));

      if (nearest) {

        snapToSquare(this.target, nearest.row, nearest.col);
      } else {

        returnToStart(this.target);
      }
    },
  });
}

function createChessboard(size) {
  // 清空棋盘
  chessboard.innerHTML = "";

  const boardSize = size * SQUARE_SIZE + 20;

  chessboard.style.width = `${boardSize}px`;
  chessboard.style.height = `${boardSize}px`;
  chessboard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  chessboard.style.gridTemplateRows = `repeat(${size}, 1fr)`;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const square = document.createElement("div");
      square.className = `square ${(row + col) % 2 === 0 ? "light" : "dark"}`;
      square.dataset.row = row;
      square.dataset.col = col;
      square.style.width = `${SQUARE_SIZE}px`;
      square.style.height = `${SQUARE_SIZE}px`;
      chessboard.appendChild(square);
    }
  }

  squares = document.querySelectorAll(".square");

  checkQueenPositions();
}

function checkQueenPositions() {
  for (let id in queenPositions) {
    const position = queenPositions[id];
    if (position) {
      const { row, col } = position;
      if (row >= BOARD_SIZE || col >= BOARD_SIZE) {
        const queenEl = document.querySelector(`[data-queen-id="${id}"]`);
        if (queenEl) {
          returnToStart(queenEl);
        }
      }
    }
  }
}

function applySolution(solution) {
  
  for (let id in queenPositions) {
    const queenEl = document.querySelector(`[data-queen-id="${id}"]`);
    if (queenEl && queenPositions[id]) {
      queenPositions[id] = null;
      if (queenEl.classList.contains("on-board")) {
        queenEl.style.position = "";
        queensContainer.appendChild(queenEl);
        queenEl.classList.remove("on-board");
        gsap.set(queenEl, { x: 0, y: 0 });
      }
    }
  }

  const requiredQueenCount = solution.length;
  const currentQueenCount = Object.keys(queenPositions).length;

  while (Object.keys(queenPositions).length < requiredQueenCount) {
    addQueen();
  }

  const availableQueenIds = Object.keys(queenPositions).map(id => parseInt(id)).sort((a, b) => a - b);

  solution.forEach((col, rowIndex) => {
    if (rowIndex < availableQueenIds.length) {
      const queenId = availableQueenIds[rowIndex];
      const queenEl = document.querySelector(`[data-queen-id="${queenId}"]`);
      if (queenEl) {
        snapToSquare(queenEl, rowIndex, col);
      }
    }
  });
}

function increaseBoardSize() {
  if (BOARD_SIZE < MAX_BOARD_SIZE) {
    BOARD_SIZE++;
    createChessboard(BOARD_SIZE);
    updateButtonStates();
  }
}

function decreaseBoardSize() {
  if (BOARD_SIZE > MIN_BOARD_SIZE) {
    BOARD_SIZE--;
    createChessboard(BOARD_SIZE);
    updateButtonStates();
  }
}

function addClass(el, className) {
  el.classList.add(className);
}

function removeClass(el, className) {
  el.classList.remove(className);
}

createChessboard(BOARD_SIZE);

function findNearestSquare(x, y) {
  const boardRect = chessboard.getBoundingClientRect();

  if (
    x < boardRect.left ||
    x > boardRect.right ||
    y < boardRect.top ||
    y > boardRect.bottom
  ) {
    return null;
  }

  const relX = x - boardRect.left;
  const relY = y - boardRect.top;
  const col = Math.floor(relX / SQUARE_SIZE);
  const row = Math.floor(relY / SQUARE_SIZE);

  if (col >= 0 && col < BOARD_SIZE && row >= 0 && row < BOARD_SIZE) {
    return { row, col };
  }
  return null;
}

function snapToSquare(queenEl, row, col) {
  const x = col * SQUARE_SIZE + SQUARE_SIZE/2 - queenEl.offsetWidth / 2;
  const y = row * SQUARE_SIZE + SQUARE_SIZE/2 - queenEl.offsetHeight / 2;

  if (!queenEl.classList.contains("on-board")) {
    queenEl.style.position = "absolute";
    chessboard.appendChild(queenEl);
    addClass(queenEl, "on-board");
  }

  gsap.to(queenEl, {
    duration: 0.3,
    x: x,
    y: y,
    ease: "power2.inOut",
  });

  const queenId = queenEl.dataset.queenId;
  queenPositions[queenId] = { row, col };
}

function returnToStart(queenEl) {
  const queenId = queenEl.dataset.queenId;

  queenPositions[queenId] = null;

  // Animate back
  gsap.to(queenEl, {
    duration: 0.2,
    x: 0,
    y: 0,
    onComplete: function () {
      if (queenEl.classList.contains("on-board")) {
        queenEl.style.position = "";
        queensContainer.appendChild(queenEl);
        removeClass(queenEl, "on-board");
      }
    },
  });
}

function initializeQueens() {
  const queens = document.querySelectorAll(".queen");
  queens.forEach(queen => {
    makeQueenDraggable(queen);
    const queenId = queen.dataset.queenId;
    queenPositions[queenId] = null;
  });

  updateButtonStates();
}

initializeQueens();


