// SELECT CANVAS ELEMENT
const cvs = document.getElementById("breakout");
const ctx = cvs.getContext("2d");

// Fixed canvas size, no need for dynamic resizing
 const canvasWidth = 300;
const canvasHeight = 600;

// ADD BORDER TO CANVAS
cvs.style.border = "1px solid #0ff";

// MAKE LINE THIK WHEN DRAWING TO CANVAS
ctx.lineWidth = 3;

// GAME VARIABLES AND CONSTANTS
const PADDLE_WIDTH = 50;
const PADDLE_MARGIN_BOTTOM = 40;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 6;
let LIFE = 3; // PLAYER HAS 3 LIVES
let SCORE = 0;
const SCORE_UNIT = 10;
let LEVEL = 1;
const MAX_LEVEL = 3;
let GAME_OVER = false;
let leftArrow = false;
let rightArrow = false;

// CREATE THE PADDLE
const paddle = {
  x: cvs.width / 2 - PADDLE_WIDTH / 2,
  y: cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dx: 5,
};

// DRAW PADDLE
function drawPaddle() {
  ctx.fillStyle = "#2e3548";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.strokeStyle = "#ffcd05";
  ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// CONTROL THE PADDLE
document.addEventListener("keydown", function (event) {
  if (event.keyCode == 37) {
    leftArrow = true;
  } else if (event.keyCode == 39) {
    rightArrow = true;
  }
});
document.addEventListener("keyup", function (event) {
  if (event.keyCode == 37) {
    leftArrow = false;
  } else if (event.keyCode == 39) {
    rightArrow = false;
  }
});

// MOVE PADDLE
function movePaddle() {
  if (rightArrow && paddle.x + paddle.width < cvs.width) {
    paddle.x += paddle.dx;
  } else if (leftArrow && paddle.x > 0) {
    paddle.x -= paddle.dx;
  }
}

// Variables to track touch movement
let touchStartX = 0;
let touchMoveX = 0;
let lastTouchX = 0;

// Add touch event listeners
cvs.addEventListener("touchstart", function (event) {
    event.preventDefault(); // Prevent scrolling/zooming on touch start
},{passive:false});

cvs.addEventListener("touchmove", function (event) {
    event.preventDefault(); // Prevent scrolling/zooming on touch move
    let touchX = event.touches[0].pageX;
    let canvasRect = cvs.getBoundingClientRect(); // Get canvas position and size
    let canvasScale = cvs.width / canvasRect.width; // Calculate the scale factor of the canvas
    let relativeX = (touchX - canvasRect.left) * canvasScale; // Adjust touch X to be relative to the canvas and consider scale
    
    // Update paddle position based on touch, centered on the touch point
    paddle.x = relativeX - paddle.width / 2;
    
    // Clamp paddle position to stay within canvas bounds
    paddle.x = Math.max(Math.min(paddle.x, cvs.width - paddle.width), 0);
}, { passive: false });
   

cvs.addEventListener("touchend", function (event) {
  const touchEndX = touchMoveX;

  // Calculate the difference between touch start and end positions
  const touchDiff = touchEndX - touchStartX;

  // Determine the direction of touch movement and move the paddle accordingly
  if (touchDiff > 0 && paddle.x + paddle.width < cvs.width) {
    // Move paddle to the right
    paddle.x += paddle.dx;
  } else if (touchDiff < 0 && paddle.x > 0) {
    // Move paddle to the left
    paddle.x -= paddle.dx;
  }
  touchStartX = 0;
  touchMoveX = 0;
});

// Mouse Control for Paddle Movement
cvs.addEventListener("mousemove", function (event) {
  let relativeX = event.clientX - cvs.getBoundingClientRect().left;

  // Ensure paddle moves smoothly with mouse and stays within canvas bounds
  if (relativeX > 0 && relativeX < cvs.width) {
    paddle.x = relativeX - paddle.width / 2;
    // Clamp paddle position within canvas bounds
    paddle.x = Math.max(Math.min(paddle.x, cvs.width - paddle.width), 0);
  }
});

// CREATE THE BALL
const ball = {
  x: cvs.width / 2,
  y: paddle.y - BALL_RADIUS,
  radius: BALL_RADIUS,
  speed: 6,
  dx: 3 * (Math.random() * 2 - 1),
  dy: -3,
};

// DRAW THE BALL
function drawBall() {
  ctx.beginPath();

  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffcd05";
  ctx.fill();

  ctx.strokeStyle = "#2e3548";
  ctx.stroke();

  ctx.closePath();
}

// MOVE THE BALL
function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;
}

// BALL AND WALL COLLISION DETECTION
function ballWallCollision() {
  if (ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
    // WALL_HIT.play();
  }

  if (ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
    //WALL_HIT.play();
  }

  if (ball.y + ball.radius > cvs.height) {
    LIFE--; // LOSE LIFE
    //  LIFE_LOST.play();
    resetBall();
  }
}

// RESET THE BALL
function resetBall() {
  ball.x = cvs.width / 2;
  ball.y = paddle.y - BALL_RADIUS;
  ball.dx = 3 * (Math.random() * 2 - 1);
  ball.dy = -3;
}

// BALL AND PADDLE COLLISION
function ballPaddleCollision() {
  if (
    ball.x < paddle.x + paddle.width &&
    ball.x > paddle.x &&
    paddle.y < paddle.y + paddle.height &&
    ball.y > paddle.y
  ) {
    // // PLAY SOUND
    // PADDLE_HIT.play();

    // CHECK WHERE THE BALL HIT THE PADDLE
    let collidePoint = ball.x - (paddle.x + paddle.width / 2);

    // NORMALIZE THE VALUES
    collidePoint = collidePoint / (paddle.width / 2);

    // CALCULATE THE ANGLE OF THE BALL
    let angle = (collidePoint * Math.PI) / 3;

    ball.dx = ball.speed * Math.sin(angle);
    ball.dy = -ball.speed * Math.cos(angle);
  }
}

// CREATE THE BRICKS
const brick = {
  row: 1,
  column: 7,
  width: 30,
  height: 10,
  offSetLeft: 10,
  offSetTop: 10,
  marginTop: 40,
  fillColor: "#2e3548",
  strokeColor: "#FFF",
};

let bricks = [];

function createBricks() {
  for (let r = 0; r < brick.row; r++) {
    bricks[r] = [];
    for (let c = 0; c < brick.column; c++) {
      bricks[r][c] = {
        x: c * (brick.offSetLeft + brick.width) + brick.offSetLeft,
        y:
          r * (brick.offSetTop + brick.height) +
          brick.offSetTop +
          brick.marginTop,
        status: true,
      };
    }
  }
}

createBricks();

// draw the bricks
function drawBricks() {
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      let b = bricks[r][c];
      // if the brick isn't broken
      if (b.status) {
        ctx.fillStyle = brick.fillColor;
        ctx.fillRect(b.x, b.y, brick.width, brick.height);

        ctx.strokeStyle = brick.strokeColor;
        ctx.strokeRect(b.x, b.y, brick.width, brick.height);
      }
    }
  }
}

// ball brick collision
function ballBrickCollision() {
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      let b = bricks[r][c];
      // if the brick isn't broken
      if (b.status) {
        if (
          ball.x + ball.radius > b.x &&
          ball.x - ball.radius < b.x + brick.width &&
          ball.y + ball.radius > b.y &&
          ball.y - ball.radius < b.y + brick.height
        ) {
          // BRICK_HIT.play();
          ball.dy = -ball.dy;
          b.status = false; // the brick is broken
          SCORE += SCORE_UNIT;
        }
      }
    }
  }
}

// show game stats
function showGameStats(text, textX, textY, img, imgX, imgY) {
  // draw text
  ctx.fillStyle = "#FFF";
  ctx.font = "25px Germania One";
  ctx.fillText(text, textX, textY);

  // draw image
  ctx.drawImage(img, imgX, imgY, (width = 25), (height = 25));
}

// DRAW FUNCTION
function draw() {
  drawPaddle();
  drawBall();
  drawBricks();
  // SHOW SCORE
  showGameStats(SCORE, 35, 25, SCORE_IMG, 5, 5);
  // SHOW LIVES
  showGameStats(LIFE, cvs.width - 25, 25, LIFE_IMG, cvs.width - 55, 5);
  // SHOW LEVEL
  showGameStats(LEVEL, cvs.width / 2, 25, LEVEL_IMG, cvs.width / 2 - 30, 5);
}

// game over
function gameOver() {
  if (LIFE <= 0) {
    showYouLose();
    GAME_OVER = true;
  }
}

// level up
function levelUp() {
  let isLevelDone = true;

  // check if all the bricks are broken
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      isLevelDone = isLevelDone && !bricks[r][c].status;
    }
  }

  if (isLevelDone) {
    //  WIN.play();

    if (LEVEL >= MAX_LEVEL) {
      showYouWin();
      GAME_OVER = true;
      return;
    }
    brick.row++;
    createBricks();
    ball.speed += 1;
    resetBall();
    LEVEL++;
  }
}

// UPDATE GAME FUNCTION
function update() {
  movePaddle();

  moveBall();

  ballWallCollision();

  ballPaddleCollision();

  ballBrickCollision();

  gameOver();

  levelUp();
}

// GAME LOOP
function loop() {
  // CLEAR THE CANVAS
  ctx.drawImage(BG_IMG, 0, 0);
  draw();
  update();
  if (!GAME_OVER) {
    requestAnimationFrame(loop);
  }
}
// loop();

// SELECT SOUND ELEMENT
// const soundElement  = document.getElementById("sound");

// soundElement.addEventListener("click", audioManager);

// function audioManager(){
//     // CHANGE IMAGE SOUND_ON/OFF
//     let imgSrc = soundElement.getAttribute("src");
//     let SOUND_IMG = imgSrc == "img/SOUND_ON.png" ? "img/SOUND_OFF.png" : "img/SOUND_ON.png";

//     soundElement.setAttribute("src", SOUND_IMG);

//     // MUTE AND UNMUTE SOUNDS
//     WALL_HIT.muted = WALL_HIT.muted ? false : true;
//     PADDLE_HIT.muted = PADDLE_HIT.muted ? false : true;
//     BRICK_HIT.muted = BRICK_HIT.muted ? false : true;
//     WIN.muted = WIN.muted ? false : true;
//     LIFE_LOST.muted = LIFE_LOST.muted ? false : true;
// }

// GAME LOOP
// function loop() {
  
//     // CLEAR THE CANVAS
//     ctx.drawImage(BG_IMG, 0, 0);
//     draw();
//     update();
//     if (!GAME_OVER) {
//         requestAnimationFrame(loop);
//     }
   
//   }
  
  // START GAME FUNCTION
function startGame() {
    
    GAME_OVER = false;
    SCORE = 0;
    LIFE = 3;
    LEVEL = 1;
    createBricks(); // Initialize or re-initialize bricks
    
    loop(); 
  }

// MODIFY TO START GAME ONLY WHEN CLICK ON PLAY BUTTON

 // start.addEventListener("click", startGame); // start the game

// SHOW GAME OVER MESSAGE
/* SELECT ELEMENTS */
const gameover = document.getElementById("gameover");
const youwin = document.getElementById("youwin");
const youlose = document.getElementById("youlose");
const restart = document.getElementById("restart");
const start = document.getElementById("start");

// CLICK ON PLAY AGAIN BUTTON
restart.addEventListener("click", function () {
  location.reload(); // reload the page
});

start.addEventListener("click", function () {
    startGame(); // start the game
},{ once: true });

// SHOW YOU WIN
function showYouWin() {
  gameover.style.display = "block";
  youwin.style.display = "block";
}

// SHOW YOU LOSE
function showYouLose() {
  gameover.style.display = "block";
  youlose.style.display = "block";
}
