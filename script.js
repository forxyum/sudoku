let wrap = document.getElementById('wrap');
let mouse = {x: 0, y: 0};
let current;
let puzzlesRaw;
let seconds = 0;
let minutes = 0;
let stopwatch;
let muted = true;
let audio = new Audio('audio.mp3');
audio.volume = 0.15;
let fail = new Audio('fail.mp3');
let played = false;
readPuzzles();
reset();


function readPuzzles() {
    let rawFile = new XMLHttpRequest();
    rawFile.open("GET", "./puzzles.txt", false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status === 0) {
                puzzlesRaw = rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
}

function getRandomPuzzle() {
    let rand = Math.floor(Math.random() * 50);
    console.log("Grid: " + (rand + 1));
    let puzzlesArray = puzzlesRaw.split('\n');
    let puzzleArray = [];
    for (let i = 0; i < 9; i++) {
        puzzleArray.push(puzzlesArray[rand * 10 + i + 1].substr(0, 9));
    }
    console.log(puzzleArray);
    return puzzleArray;
}

function reset() {
    resetWatch();
    document.getElementById('selection').style.display = 'none';
    wrap.innerHTML = "";
    for (let i = 0; i < 9; i++) {
        let row = document.createElement('div');
        for (let j = 0; j < 9; j++) {
            let cell = document.createElement('button');
            cell.innerHTML = '<span style="color:Moccasin;">0</span>';
            cell.id = "c" + String(i) + String(j);
            cell.setAttribute("onclick", "options(" + cell.id + ")");
            cell.setAttribute("onmouseover", "highlight(" + cell.id + ")");
            cell.setAttribute("onmouseout", "unhighlight(" + cell.id + ")");
            row.appendChild(cell);
        }
        wrap.append(row);
    }
    played = false;
}


wrap.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

function options(cell) {
    let select = document.getElementById('selection');
    select.style.top = +mouse.y + 'px';
    select.style.left = +mouse.x + 'px';
    select.style.display = 'block';
    current = cell;
}

function choose(selection) {
    let select = document.getElementById('selection');
    select.style.display = 'none';
    if (selection === 'remove') {
        current.innerHTML = '<span style="color:Moccasin;">null</span>';
        current.classList.remove('filled');
    } else {
        current.innerHTML = selection.innerHTML;
        current.classList.add("filled");
        current.classList.remove('wrong');
        current = null;
    }
}

function idToCoord(id) {
    let xy = id.substr(1, 2);
    return [parseInt(xy.substring(0, 1)), parseInt(xy.substring(1, 2))];
}

function coordToId(x, y) {
    return "c" + x + y;
}

function verifyHorizontal(c) {
    let cell = document.getElementById(c);
    let value = cell.innerHTML;
    let coord = idToCoord(c);
    for (let i = 0; i < 9; i++) {
        if (i !== coord[0]) {
            if (document.getElementById(coordToId(i, coord[1])).innerHTML === value) {
                console.log("hori wrong");
                return false;
            }
        }
    }
    return true;
}

function verifyVertical(c) {
    let cell = document.getElementById(c);
    let value = cell.innerHTML;
    let coord = idToCoord(c);
    for (let i = 0; i < 9; i++) {
        if (i !== coord[1]) {
            if (document.getElementById(coordToId(coord[0], i)).innerHTML === value) {
                console.log("verti wrong");
                return false;
            }
        }
    }
    return true;
}

function verifyBox(c) {
    let cell = document.getElementById(c);
    let value = cell.innerHTML;
    let coord = idToCoord(c);
    let block = [parseInt(coord[0] / 3), parseInt(coord[1] / 3)];
    for (let i = 3 * block[0]; i < 3 * block[0] + 3; i++) {
        for (let j = 3 * block[1]; j < 3 * block[1] + 3; j++) {
            if (i !== coord[0] && j !== coord[1]) {
                if (document.getElementById(coordToId(i, j)).innerHTML === value) {
                    console.log("box wrong");
                    return false;
                }
            }
        }
    }
    return true;
}

function submit() {
    document.getElementById('selection').style.display = 'none';
    if (played) {
        if (filled()) {
            if (check()) {
                document.getElementById('form').classList.remove('hidden');
                clearInterval(stopwatch);
                document.getElementById('timer').innerHTML = "00:00";
            } else {
            }
        } else {
            check();
            alert("Only fully filled boards will be sent to the scoreboard.");
        }
    }
}

function save() {
    let score = 30000 - (minutes * 60 + seconds) * 8.33;
    let name = document.getElementById("nameInput").value;
    if (localStorage.getItem('leaderboard')) {
        localStorage.setItem('leaderboard', localStorage.getItem('leaderboard') + ";" + name + "-" + score);
    } else {
        localStorage.setItem('leaderboard', name + "-" + score);
    }
    minutes = 0;
    seconds = 0;
    reset();
}

function check() {
    let correct = true;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let cell = coordToId(i, j);
            if (document.getElementById(cell).classList.contains("filled")) {
                if (verifyHorizontal(cell) && verifyVertical(cell) && verifyBox(cell)) {
                    document.getElementById(cell).classList.remove("wrong");
                } else {
                    document.getElementById(cell).classList.add("wrong");
                    console.log(cell + " was wrong");
                    correct = false;
                    fail.play();
                }
            }
        }
    }
    return correct;
}

function makeNew() {
    document.getElementById('selection').style.display = 'none';
    resetWatch();
    reset();
    let puzzleArray = getRandomPuzzle();
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (puzzleArray[i].charAt(j) === '0') {
                document.getElementById(coordToId(i, j)).innerHTML = '<span style="color:Moccasin;">null</span>';
            } else {
                let temp = document.getElementById(coordToId(i, j));
                temp.innerHTML = puzzleArray[i].charAt(j);
                temp.removeAttribute('onclick');
                temp.style.fontWeight = 'bold';
            }
        }
    }
    stopwatch = window.setInterval(stopWatch, 1000);
    played = true;
}

function highlight(cell) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let current = document.getElementById(coordToId(i, j));
            if (current.innerHTML === cell.innerHTML && parseInt(current.innerHTML)) {
                current.classList.add('highlighted');
            }
        }
    }
}

function unhighlight(cell) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let current = document.getElementById(coordToId(i, j));
            if (current.innerHTML === cell.innerHTML) {
                current.classList.remove('highlighted');
            }
        }
    }
}

function filled() {
    let ret = true;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (!parseInt(document.getElementById(coordToId(i, j)).innerHTML)) {
                ret = false;
            }
        }
    }
    return ret;
}

function stopWatch() {
    seconds++;
    if (seconds / 60 === 1) {
        seconds = 0;
        minutes += 1;
    }
    if(minutes === 60){
        alert("Time's over!")
        reset();
    }
    document.getElementById('timer').innerHTML = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}
function resetWatch(){
    minutes = 0;
    seconds = 0;
    clearInterval(stopwatch);
    document.getElementById('timer').innerHTML = "00:00";
}

function mute() {
    if (muted) {
        audio.play();
        muted = !muted;
    } else {
        audio.pause();
        muted = !muted;
    }
}
