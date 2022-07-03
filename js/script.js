"use strict";
(() => {
  const gameField = $(".game-field"),
    jumper = $('<div class="jumper">'),
    media = window.matchMedia("(max-width: 600px)"),
    overlay = $(".start-screen"),
    skillsList = [
      "JavaScript",
      "Typescript",
      "Storybook",
      "MUI",
      "CSS3",
      "HTML5",
      "Git/CLI",
      "jQuery",
      "Photoshop",
      "Illustrator",
      "GraphQL",
      "Figma",
      "UX/UI",
      "Eating Tacos",
      "Communication",
      "Punctual",
      "Debugging",
      "Teamwork",
      "MySQL",
      "DevTools",
      "Gatsby",
      "NodeJS",
      "Leadership",
      "ReactJS",
      "Redux",
      "NextJS",
      "MongoDB",
      "REST API",
    ],
    jumpSound = new Audio("sounds/jump.wav"),
    bgMusic = new Audio("sounds/chiptronical.ogg"),
    deathSound = new Audio("sounds/gameover.wav");

  let startPoint = 150,
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

  class Skill {
    constructor(newSkillBottom) {
      this.bottom = newSkillBottom;
      this.left = randomNum(gameField.innerWidth() - 125);
      this.element = $(
        '<div class="skill">' +
          skillsList[randomNum(skillsList.length - 1)] +
          "</div>"
      ); // generates skill as div with class of skill and random skill from skills-Arr

      const element = this.element;
      gameField.append(element);
      element.css({ left: this.left + "px", bottom: this.bottom + "px" });
    }
  }

  function randomNum(num) {
    return Math.floor(Math.random() * num + 1);
  }

  function createJumper() {
    gameField.append(jumper);
    jumperLeftSpace = skillsArr[0].left;
    jumper.css({
      left: jumperLeftSpace + "px",
      bottom: jumperBottomSpace + "px",
    });
  }

  function createSkills() {
    for (let i = 0; i < skillCount; i++) {
      let skillGap = gameField.innerHeight() / skillCount;
      let newSkillBottom = 100 + i * skillGap;
      let newSkill = new Skill(newSkillBottom);
      skillsArr.push(newSkill);
    }
  }

  function movePlatforms() {
    if (jumperBottomSpace > gameField.innerHeight() / 6) {
      skillsArr.forEach(skill => {
        skill.bottom -= skillSpeed;
        let element = skill.element;
        element.css({ bottom: skill.bottom + "px" });

        // when the skill gets to the bottom, its deleted and replaced
        if (skill.bottom < 4) {
          let firstSkill = skillsArr[0].element;
          let skillMoveSwap = "right";
          firstSkill.remove();
          skillsArr.shift();
          let newSkill = new Skill(gameField.height());
          skillsArr.push(newSkill);
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
    clearInterval(downTimerId);
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
      jumperBottomSpace += 20;
      jumper.css({ bottom: jumperBottomSpace + "px" });
      if (jumperBottomSpace > startPoint + jumpHeight) {
        score += Math.floor(jumpHeight / 10);
        $(".score").text(`Score:${score}`);
        fall();
      }
    }, 30);
    moveBackground();
    levelUp();
  }

  function fall() {
    clearInterval(upTimerId);
    isJumping = false;
    downTimerId = setInterval(() => {
      if (visualLeft && !isJumping) {
        jumper.css({ backgroundPositionX: `-250px` });
      } else if (visualRight && !isJumping) {
        jumper.css({ backgroundPositionX: `-170px` });
      }
      jumperBottomSpace -= 14;
      jumper.css({ bottom: jumperBottomSpace + "px" });
      skillsArr.forEach(skill => {
        if (
          jumperBottomSpace >= skill.bottom &&
          jumperBottomSpace <= skill.bottom + skill.element.innerHeight() &&
          jumperLeftSpace + jumper.width() >= skill.left &&
          jumperLeftSpace <= skill.left + skill.element.width() &&
          !isJumping
        ) {
          startPoint = jumperBottomSpace;
          jump();
        }
        if (jumperBottomSpace <= 0) {
          gameOver();
        }
      });
    }, 30);
  }

  function controls(e) {
    if (e.which == "37" && !isGoingLeft) {
      moveLeft();
    } else if (e.which == "39" && !isGoingRight) {
      moveRight();
    }
  }

  function moveLeft() {
    isGoingRight = false;
    isGoingLeft = true;
    visualLeft = true;
    visualRight = false;
    jumper.css({ backgroundPositionX: `-90px` });
    clearInterval(rightTimerId);
    leftTimerId = setInterval(() => {
      if (jumperLeftSpace >= 1) {
        jumperLeftSpace -= 2;
        jumper.css({ left: jumperLeftSpace + "px" });
      }
    }, 1);
  }

  function moveRight() {
    isGoingLeft = false;
    isGoingRight = true;
    visualLeft = false;
    visualRight = true;
    jumper.css({ backgroundPositionX: `-10px` });
    clearInterval(leftTimerId);
    rightTimerId = setInterval(() => {
      if (jumperLeftSpace + jumper.width() <= gameField.width()) {
        jumperLeftSpace += 2;
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

  function moveBackground() {
    let integer = score / 50;
    if (integer >= 0 && integer <= 100) {
      gameField.css({ backgroundPositionY: `${100 - integer}%` });
    }
  }

  function gameOver() {
    gameRunning = false;
    bgMusic.pause();
    if (audioOn) {
      deathSound.play();
    }
    clearInterval(upTimerId);
    clearInterval(downTimerId);
    clearInterval(skillTimerId);
    clearInterval(leftTimerId);
    clearInterval(rightTimerId);
    gameField.html('<div class="audio"> ');
    overlay.text(``).appendTo(gameField);
    gameField.css({ backgroundPositionY: `${100}%` });
    if (localStorage.getItem("score", score.toString()) < score) {
      localStorage.setItem("score", score.toString());
      var highScore = localStorage.getItem("score", score.toString());
    } else {
      highScore = localStorage.getItem("score", score.toString())
        ? localStorage.getItem("score", score.toString())
        : 0;
    }
    overlay.html(`<h3>GAME OVER!</h3>
  <h3>Score:${score}</h3>
  <h4>Best:${highScore}</h4>
  <p>Oh no!&nbsp You can do better than that.&nbsp<b>Try again </b>and see if you cant beat your score.</p>
  <p class="desktop">Press the <b>SPACE BAR</b> to start</p>
  <p class="mobile">Tap <b>START</b> to start.</p>
  <a class="mobile" href="javascript:;">Start</a>
  <a class="desktop" href="javascript:;">PRESS SPACE</a>`);
    bgMusic.currentTime = 0;
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
    $("a.desktop").on("click", start);
    $(document).keyup(function (e) {
      if (e.which == "32") {
        $("a.desktop").trigger("click");
      }
    });
    $(".audio").on("click", toggleAudio);
  }

  function mobileControls(e) {
    const x = e.alpha;
    if (x > 180 && x < 360 && !isGoingRight) {
      moveRight();
    } else if (x > 0 && x < 180 && !isGoingLeft) {
      moveLeft();
    }
  }

  function mediaQueries() {
    if (media.matches) {
      skillCount = 6;
    }
  }

  function mobileStart() {
    DeviceMotionEvent.requestPermission()
      .then(response => {
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
    skillTimerId = setInterval(movePlatforms, 20);
    jump();
    document.addEventListener("keydown", controls);
    document.addEventListener("keyup", clearMovement);
    $('<div class="score">').prependTo(gameField);
  }

  $("a.mobile").on("click", mobileStart);

  $("a.desktop").on("click", start);
  $(document).keyup(function (e) {
    if (e.which == "32") {
      $("a.desktop").trigger("click");
    }
  });

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
})();
