"use strict";
(() => {
  // wrapped in an iffy

  const // constant variables
    gameField = $(".game-field"),
    jumper = $('<div class="jumper">'),
    media = window.matchMedia("(max-width: 600px)"),
    overlay = $(".start-screen"),
    skillsList = [
      "JavaScript",
      "CSS3",
      "HTML5",
      "Git/CLI",
      "jQuery",
      "Photoshop",
      "Illustrator",
      "InDesign",
      "Figma",
      "UX/UI",
      "Eating Tacos",
      "Communication",
      "Punctual",
      "WordPress",
      "Debugging",
      "Teamwork",
      "Googling",
      "DevTools",
      "SEO",
      "Node.js",
      "VS Code",
      "Mobile First",
      "Leadership",
      "React",
      "Redux",
      "NextJS",
      "MongoDB",
      "REST API",
      "Mongoose",
    ],
    jumpSound = new Audio("sounds/jump.wav"),
    bgMusic = new Audio("sounds/chiptronical.ogg"),
    deathSound = new Audio("sounds/gameover.wav");

  let // non-constant variables
    startPoint = 150,
    jumperLeftSpace = 50,
    jumperBottomSpace = startPoint,
    movingSkillsChance = 10,
    skillCount = 8, // amount of skills on the gamefield at a time
    skillsArr = [],
    upTimerId,
    downTimerId,
    leftTimerId,
    rightTimerId,
    skillTimerId,
    isGoingLeft = false,
    isGoingRight = false,
    isJumping = false,
    visualLeft = false,
    visualRight = false,
    skillSpeed = 4,
    score = 0,
    audioOn = true,
    gameRunning = false,
    jumpHeight = 299; // ADJUST this number controls the height of the jump

  /* ^^^^^ GLOBAL VARIABLES ^^^^^ */

  //contructor to build new skill platforms
  class Skill {
    constructor(newSkillBottom) {
      this.bottom = newSkillBottom; // defined in create skills
      this.left = randomNum(gameField.innerWidth() - 125); // random number inside the gamefield
      this.element = $(
        '<div class="skill">' +
          skillsList[randomNum(skillsList.length - 1)] +
          "</div>"
      ); // generates skill as div with class of skill and random skill from skills-Arr

      const element = this.element;
      gameField.append(element); // add to game field
      element.css({ left: this.left + "px", bottom: this.bottom + "px" }); // set left and bottom
    }
  }

  //generates a random number from 0 to argument
  function randomNum(num) {
    return Math.floor(Math.random() * num + 1);
  }

  // generates a div in the gamefield for the jumper
  function createJumper() {
    gameField.append(jumper);
    jumperLeftSpace = skillsArr[0].left;
    jumper.css({
      left: jumperLeftSpace + "px",
      bottom: jumperBottomSpace + "px",
    });
  }

  // generates the skill platforms
  function createSkills() {
    for (let i = 0; i < skillCount; i++) {
      let skillGap = gameField.innerHeight() / skillCount; // spaces evenly throughout gamefield
      let newSkillBottom = 100 + i * skillGap; // starts the skills at 100px from bottom at sets the bottom as the gap
      let newSkill = new Skill(newSkillBottom);
      skillsArr.push(newSkill);
    }
  }

  // move the platforms, but only when the jumper is a certain height
  function movePlatforms() {
    // if the jumper is about the bottom 6th of the gamefeild the skills move down
    if (jumperBottomSpace > gameField.innerHeight() / 6) {
      skillsArr.forEach((skill) => {
        skill.bottom -= skillSpeed; // moves down 4 pixels at a time
        let element = skill.element;
        element.css({ bottom: skill.bottom + "px" }); // applies the style to bottom of each skill

        // when the skill gets to the bottom, its deleted and replaced
        if (skill.bottom < 4) {
          let firstSkill = skillsArr[0].element;
          let skillMoveSwap = "right";
          firstSkill.remove(); // if it gets to the bottom, visually remove the first skill
          skillsArr.shift(); // remove it from the array
          let newSkill = new Skill(gameField.height()); // create a new one at the top
          skillsArr.push(newSkill); // add it to array
          if (1 == randomNum(movingSkillsChance)) {
            window.requestAnimationFrame(() => {
              let newElement = newSkill.element;

              if (newSkill.left + 125 >= gameField.width()) {
                skillMoveSwap = "right";
              } else if (newSkill.left <= 2) {
                skillMoveSwap = "left";
              }
              if (skillMoveSwap == "right") {
                newSkill.left -= 2;
              } else if (skillMoveSwap == "left") {
                newSkill.left += 2;
              }
              newElement.css({ left: newSkill.left + "px" });
            });
          }
        }
      });
    }
  }

  // makes the jumper jump on a timer and evokes the fall after a certain distance
  function jump() {
    clearInterval(downTimerId); // clear fall function
    if (audioOn) {
      jumpSound.play();
    }
    isJumping = true;
    upTimerId = setInterval(() => {
      if (visualLeft && isJumping) {
        jumper.css({ backgroundPositionX: `-90px` });
      } else if (visualRight && isJumping) {
        jumper.css({ backgroundPositionX: `-10px` });
      }
      jumperBottomSpace += 20; // ADJUST this to change speed of jump
      jumper.css({ bottom: jumperBottomSpace + "px" }); // applied pixel change to jumperbottom
      if (jumperBottomSpace > startPoint + jumpHeight) {
        score += Math.floor(jumpHeight / 10);
        $(".score").text(`Score:${score}`);
        fall(); // ends jump and starts fall
      }
    }, 30);
    moveBackground();
    levelUp();
  }

  // makes the jumper fall on a timer
  function fall() {
    clearInterval(upTimerId); // clears jump function
    isJumping = false;
    downTimerId = setInterval(() => {
      if (visualLeft && !isJumping) {
        jumper.css({ backgroundPositionX: `-250px` });
      } else if (visualRight && !isJumping) {
        jumper.css({ backgroundPositionX: `-170px` });
      }
      jumperBottomSpace -= 14; // ADJUST this for falling speed
      jumper.css({ bottom: jumperBottomSpace + "px" }); // applies pixel change to jumperbottom
      skillsArr.forEach((skill) => {
        if (
          jumperBottomSpace >= skill.bottom && // if jumper is within the bounds of a skill platform and not jumping, redesignate start ppoint and jump
          jumperBottomSpace <= skill.bottom + skill.element.innerHeight() &&
          jumperLeftSpace + jumper.width() >= skill.left &&
          jumperLeftSpace <= skill.left + skill.element.width() &&
          !isJumping
        ) {
          startPoint = jumperBottomSpace;
          jump();
        }
        if (jumperBottomSpace <= 0) {
          // if you hit the bottom, runs gave over function
          gameOver();
        }
      });
    }, 30); // sets interval
  } // close fall

  // if gameisnt over and youre not already moving in that direction, move in that direction
  function controls(e) {
    if (e.which == "37" && !isGoingLeft) {
      moveLeft();
    } else if (e.which == "39" && !isGoingRight) {
      moveRight();
    }
  }

  // move left at a non-variable speed through the gamefield until contact with left side
  function moveLeft() {
    isGoingRight = false;
    isGoingLeft = true;
    visualLeft = true;
    visualRight = false;
    jumper.css({ backgroundPositionX: `-90px` });
    clearInterval(rightTimerId); // end going right
    leftTimerId = setInterval(() => {
      if (jumperLeftSpace >= 1) {
        // keeps within left side of gamefield
        jumperLeftSpace -= 2; // ADJUST change this to change speed
        jumper.css({ left: jumperLeftSpace + "px" });
      }
    }, 1);
  }

  // move left at a non-variable speed through the gamefield until contact with right side
  function moveRight() {
    isGoingLeft = false;
    isGoingRight = true;
    visualLeft = false;
    visualRight = true;
    jumper.css({ backgroundPositionX: `-10px` });
    clearInterval(leftTimerId); // end going left
    rightTimerId = setInterval(() => {
      if (jumperLeftSpace + jumper.width() <= gameField.width()) {
        // keeps withing right side
        jumperLeftSpace += 2; // change this to change speed
        jumper.css({ left: jumperLeftSpace + "px" });
      }
    }, 1);
  }

  // clears all lateral intervals when a key is released
  function clearMovement() {
    clearInterval(leftTimerId);
    clearInterval(rightTimerId);
    isGoingRight = false;
    isGoingLeft = false;
  }

  // use the score to slowly shift the background pos
  function moveBackground() {
    let integer = score / 50; // decrease this numnber to make it change at a faster pace
    if (integer >= 0 && integer <= 100) {
      // wont throw error or try to continue changing if at top (5000px)
      gameField.css({ backgroundPositionY: `${100 - integer}%` });
    }
  }

  // signify end of game. Cease all movement and display score
  function gameOver() {
    gameRunning = false;
    // clears all Timers
    bgMusic.pause();
    if (audioOn) {
      deathSound.play();
    }
    clearInterval(upTimerId);
    clearInterval(downTimerId);
    clearInterval(skillTimerId);
    clearInterval(leftTimerId);
    clearInterval(rightTimerId);
    gameField.html('<div class="audio"> '); // clear gamefield
    overlay.text(``).appendTo(gameField); // add blank overlay
    gameField.css({ backgroundPositionY: `${100}%` }); // reset background
    // checks local storage and creates high score
    if (localStorage.getItem("score", score.toString()) < score) {
      localStorage.setItem("score", score.toString());
      var highScore = localStorage.getItem("score", score.toString());
    } else {
      highScore = localStorage.getItem("score", score.toString())
        ? localStorage.getItem("score", score.toString())
        : 0;
    }
    // adds the game over screen
    overlay.html(`<h3>GAME OVER!</h3>
  <h3>Score:${score}</h3>
  <h4>Best:${highScore}</h4>
  <p>Oh no!&nbsp You can do better than that.&nbsp<b>Try again </b>and see if you cant beat your score.</p>
  <p class="desktop">Press the <b>SPACE BAR</b> to start</p>
  <p class="mobile">Tap <b>START</b> to start.</p>
  <a class="mobile" href="javascript:;">Start</a>
  <a class="desktop" href="javascript:;">PRESS SPACE</a>`);
    // resets ALL global variables
    bgMusic.currentTime = 0; // reset music
    startPoint = 150;
    jumperLeftSpace = 50;
    jumperBottomSpace = startPoint;
    movingSkillsChance = 10;
    skillCount = 8;
    skillsArr = [];
    isGoingLeft = false;
    isGoingRight = false;
    isJumping = false;
    visualLeft = false;
    visualRight = false;
    skillSpeed = 4;
    score = 0;
    jumpHeight = 299;
    // new event listeners for gameover screen
    $("a.desktop").on("click", start);
    $(document).keyup(function (e) {
      if (e.which == "32") {
        $("a.desktop").trigger("click");
      }
    });
    $(".audio").on("click", toggleAudio);
  }

  // uses the alpha axis of a phone to move left and rright depending on tilt
  function mobileControls(e) {
    const x = e.alpha;
    if (x > 180 && x < 360 && !isGoingRight) {
      moveRight();
    } else if (x > 0 && x < 180 && !isGoingLeft) {
      moveLeft();
    }
  }

  // if the screen is under 600px, change the platform count to 6
  function mediaQueries() {
    if (media.matches) {
      skillCount = 6;
    }
  }

  // catches event listener and asks permision, if
  function mobileStart() {
    DeviceMotionEvent.requestPermission()
      .then((response) => {
        if (response == "granted") {
          start();
          window.addEventListener("deviceorientation", mobileControls);
        }
      })
      .catch(() => {
        alert("Sorry, Device orientation is required for mobile.");
      });
  }

  function toggleAudio() {
    if (audioOn) {
      audioOn = false;
      bgMusic.pause();
      $(this).css({ "background-image": "url(images/sound-off.png)" });
    } else {
      audioOn = true;
      $(this).css({ "background-image": "url(images/sound-on.png)" });
      if (gameRunning) {
        bgMusic.play();
      }
    }
  }

  // Gets harder ever 1000 points till 3k
  function levelUp() {
    if (score > 3000) {
      skillSpeed = 5.5;
      skillsArr[1].element.remove();
      skillsArr[randomNum(skillsArr.length)].element.remove();
      movingSkillsChance = 3;
    } else if (score > 2000) {
      skillSpeed = 5;
      movingSkillsChance = 5;
      skillsArr[1].element.remove();
      $(".score").css({ color: "white" });
    } else if (score > 1000) {
      skillsArr[1].element.remove();
      movingSkillsChance = 8;
    }
  }

  // starts the game
  function start() {
    gameRunning = true;
    bgMusic.volume = 0.25;
    if (audioOn) {
      bgMusic.play();
    }
    mediaQueries();
    overlay.remove();
    createSkills();
    createJumper();
    skillTimerId = setInterval(movePlatforms, 20); // ADJUST set interval to change speed of the platforms
    jump();
    document.addEventListener("keydown", controls); // move when key is pressed down
    document.addEventListener("keyup", clearMovement); // cease movement when key is lifted
    $('<div class="score">').prependTo(gameField);
  }

  // mobile start event listener
  $("a.mobile").on("click", mobileStart);

  // desktop start event listeners (click and space bar)
  $("a.desktop").on("click", start);
  $(document).keyup(function (e) {
    if (e.which == "32") {
      $("a.desktop").trigger("click");
    }
  });

  //audio button
  $(".audio").on("click", toggleAudio);

  //prevents cross-browser zooming (to prevent cheating)
  $(document).keydown(function (e) {
    if (
      e.which == "61" ||
      e.which == "107" ||
      e.which == "173" ||
      e.which == "109" ||
      e.which == "187" ||
      e.which == "189" ||
      e.which == "17"
    ) {
      e.preventDefault();
    }
  });

  $(window).on("mousewheel DOMMouseScroll", function (e) {
    if (e.ctrlKey == true) {
      e.preventDefault();
    }
  });
})(); // fin
