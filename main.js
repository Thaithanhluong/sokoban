const WALL = '#';
const TARGET = '.';
const PERSON = '@';
const BOX = '$';
const BOX_ON_TARGET = '*';
const PERSON_ON_TARGET = '+';
const PATH = ' ';
const LEFT = 0;
const RIGHT = 1;
const UP = 2;
const DOWN = 3;
let games = [];
let currentGame;
let gameLoaded = false;

function loadRandomGame() {
	currentGame = loadGames();
	renderGame(currentGame);
}

function renderGame(currentGame) {
	if (!currentGame || !gameLoaded) return;
	// console.log(currentGame);

	document.getElementById('result').style.display = 'none';

	document.getElementById('level').innerHTML = currentGame.level;
	document.getElementById('author').innerHTML =
		'Tác giả chế ra level này là ' + currentGame.author;

	let rows = currentGame.height;
	let columns = currentGame.maxWidth;
	let width = Math.floor((window.innerWidth - 100) / columns);
	const height =
		window.innerHeight > 600
			? window.innerHeight - 300
			: window.innerHeight - 100;
	while (width * rows > height) {
		width -= 10;
	}

	let markup = '<table id="my_board">';

	for (let row = 0; row < rows; row++) {
		markup += createRow(width, row, columns, currentGame);
	}

	markup += '</table>';

	document.getElementById('board').innerHTML = markup;

	if (
		window.innerWidth < 800 ||
		window.innerHeight < 800 ||
		navigator.userAgent.match(/(iPod|iPhone|iPad)/) ||
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
			navigator.userAgent
		)
	) {
		document.getElementById('control').style.display = '';
		if (window.innerWidth > window.innerHeight) {
			document.getElementById('control').style.position = 'absolute';
			document.getElementById('control').style.left = '10px';
			document.getElementById('control').style.top = '100px';
			document.getElementById('control').style.zIndex = 50;
			document.getElementById('board').style.marginLeft = '100px';
		}
	}
}

function createRow(width, row, columns, currentGame) {
	if (columns < 1) return '';

	let markup = `<tr>`;
	let hitWall = false;
	for (let col = 0; col < columns; col++) {
		markup += `<td style="width: ${width}px; height: ${width}px;" >`;

		switch (currentGame.data[row][col]) {
			case WALL:
				hitWall = true;
				markup += `<img src="./wall.png" width="${width}" height="${width}" />`;
				break;
			case PERSON:
				markup += `<img src="./person.png" width="${width}" height="${width}" />`;
				break;
			case PERSON_ON_TARGET:
				markup += `<img src="./person.png" width="${width}" height="${width}" />`;
				break;
			case TARGET:
				markup += `<img src="./target.png" width="${width}" height="${width}" />`;
				break;
			case BOX:
				markup += `<img src="./box0.png" width="${width}" height="${width}" />`;
				break;
			case BOX_ON_TARGET:
				markup += `<img src="./box1.png" width="${width}" height="${width}" />`;
				break;
			case PATH:
				if (hitWall)
					markup += `<img src="./path.png" width="${width}" height="${width}" />`;
				else
					markup += `<img src="./blank.png" width="${width}" height="${width}" />`;
				break;
			default:
				markup += `<img src="./wall.png" width="${width}" height="${width}" />`;
				break;
		}

		markup += '</td>';
	}
	markup += '</tr>';

	return markup;
}

function loadGames() {
	let rawData = boards[0].split(';');
	const len = rawData.length;

	let currentIndex = 0;
	while (currentIndex + 1 < len) {
		let data = rawData[currentIndex].split('\n').filter((d) => d !== '');
		let max = 0;
		let targets = 0;
		let boxesOnTargets = 0;
		let boxes = 0;
		let personRow = 0;
		let personColumn = 0;
		let currentRow = 0;
		data.shift();
		data.forEach((element) => {
			if (element.length > max) max = element.length;
			targets += element.split(TARGET).length - 1;
			targets += element.split(BOX_ON_TARGET).length - 1;
			targets += element.split(PERSON_ON_TARGET).length - 1;

			boxes += element.split(BOX_ON_TARGET).length - 1;
			boxes += element.split(BOX).length - 1;

			boxesOnTargets += element.split(BOX_ON_TARGET).length - 1;

			let i = element.indexOf(PERSON);
			if (i < 0) {
				i = element.indexOf(PERSON_ON_TARGET);
			}
			if (i >= 0) {
				personRow = currentRow;
				personColumn = i;
			}
			currentRow++;
		});
		let game = {
			author: 'Roger Delaporte',
			level: rawData[currentIndex + 1].split('\n')[0],
			height: data.length,
			maxWidth: max,
			targets: targets,
			boxes: boxes,
			boxesOnTargets: boxesOnTargets,
			personRow: personRow,
			personColumn: personColumn,
			data: data,
		};
		games.push(game);
		currentIndex++;
	}
	const gameNo = Math.floor(Math.random() * (games.length - 1));

	gameLoaded = true;
	return games[gameNo];
}

document.onkeydown = function (e) {
	if (!gameLoaded) return;

	switch (e.keyCode) {
		case 37:
			// console.log('left');
			doMove(LEFT);
			break;
		case 38:
			// console.log('up');
			doMove(UP);
			break;
		case 39:
			// console.log('right');
			doMove(RIGHT);
			break;
		case 40:
			// console.log('down');
			doMove(DOWN);
			break;
	}
};

function doMove(direction) {
	if (!currentGame || !gameLoaded) return;

	let x0 = currentGame.personColumn;
	let y0 = currentGame.personRow;
	let x1 = 0;
	let y1 = 0;

	switch (direction) {
		case LEFT:
			x1--;
			break;
		case UP:
			y1--;
			break;
		case RIGHT:
			x1++;
			break;
		case DOWN:
			y1++;
			break;
	}
	// console.log('person', y0, x0);
	if (
		currentGame.data[y0 + y1][x0 + x1] === PATH ||
		currentGame.data[y0 + y1][x0 + x1] === TARGET
	) {
		currentGame.data[y0] =
			currentGame.data[y0].substr(0, x0) +
			(currentGame.data[y0][x0] === PERSON_ON_TARGET ? TARGET : PATH) +
			currentGame.data[y0].substr(x0 + 1);

		currentGame.data[y0 + y1] =
			currentGame.data[y0 + y1].substr(0, x0 + x1) +
			(currentGame.data[y0 + y1][x0 + x1] === TARGET
				? PERSON_ON_TARGET
				: PERSON) +
			currentGame.data[y0 + y1].substr(x0 + x1 + 1);

		currentGame.personColumn = x0 + x1;
		currentGame.personRow = y0 + y1;
		renderGame(currentGame);
	} else if (
		currentGame.data[y0 + y1][x0 + x1] === BOX ||
		currentGame.data[y0 + y1][x0 + x1] === BOX_ON_TARGET
	) {
		if (
			currentGame.data[y0 + y1 * 2][x0 + x1 * 2] === PATH ||
			currentGame.data[y0 + y1 * 2][x0 + x1 * 2] === TARGET
		) {
			if (currentGame.data[y0 + y1 * 2][x0 + x1 * 2] === TARGET) {
				currentGame.boxesOnTargets++;
			}
			if (currentGame.data[y0 + y1][x0 + x1] === BOX_ON_TARGET) {
				currentGame.boxesOnTargets--;
			}

			currentGame.data[y0] =
				currentGame.data[y0].substr(0, x0) +
				(currentGame.data[y0][x0] === PERSON_ON_TARGET
					? TARGET
					: PATH) +
				currentGame.data[y0].substr(x0 + 1);
			currentGame.data[y0 + y1] =
				currentGame.data[y0 + y1].substr(0, x0 + x1) +
				(currentGame.data[y0 + y1][x0 + x1] === BOX_ON_TARGET
					? PERSON_ON_TARGET
					: PERSON) +
				currentGame.data[y0 + y1].substr(x0 + x1 + 1);
			currentGame.data[y0 + y1 * 2] =
				currentGame.data[y0 + y1 * 2].substr(0, x0 + x1 * 2) +
				(currentGame.data[y0 + y1 * 2][x0 + x1 * 2] === TARGET
					? BOX_ON_TARGET
					: BOX) +
				currentGame.data[y0 + y1 * 2].substr(x0 + x1 * 2 + 1);
			currentGame.personColumn = x0 + x1;
			currentGame.personRow = y0 + y1;

			renderGame(currentGame);
			if (currentGame.boxesOnTargets === currentGame.boxes) {
				console.log('solved !');
				document.getElementById('result').style.display = '';
				document.getElementById('result').style.left = '40%';
				document.getElementById('result').style.top = '20%';
			}
		}
	}
}
