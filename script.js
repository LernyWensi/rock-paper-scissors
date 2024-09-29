const ANIMATION_TIMEOUT_MS = 1000;

const ATTACK_TYPES = Object.freeze({
    rock: Symbol('rock'),
    paper: Symbol('paper'),
    scissors: Symbol('scissors'),
});

const ROUND_RESULTS = Object.freeze({
    tie: Symbol('tie'),
    player: Symbol('player'),
    computer: Symbol('computer'),
});

const WIN_CONDITIONS = {
    [ATTACK_TYPES.rock]: ATTACK_TYPES.scissors,
    [ATTACK_TYPES.paper]: ATTACK_TYPES.rock,
    [ATTACK_TYPES.scissors]: ATTACK_TYPES.paper,
};

const score = {
    player: 0,
    computer: 0,
    roundsLeft: 3,
    maxRounds: 3,
};

const $playerMenu = document.querySelector('.table-side-menu.player');
const $playerButtons = document.querySelectorAll('.table-side-button.player');
const $computerButtons = document.querySelectorAll('.table-side-button.computer');
const $gameRoundsInput = document.querySelector('.game-rounds-input');
const $gameScorePlayer = document.querySelector('.game-score.player');
const $gameScoreComputer = document.querySelector('.game-score.computer');
const $matchResultOverlay = document.querySelector('.match-result-overlay');

$gameRoundsInput.addEventListener('change', onGameRoundsSelection);
$playerMenu.addEventListener('click', onPlayerAttackSelection);

function onGameRoundsSelection() {
    $gameRoundsInput.value = Math.max(
        parseInt($gameRoundsInput.min),
        Math.min(
            parseInt($gameRoundsInput.value) || parseInt($gameRoundsInput.defaultValue),
            parseInt($gameRoundsInput.max),
        ),
    );

    score.maxRounds = $gameRoundsInput.value;
    score.roundsLeft = $gameRoundsInput.value;

    resetScore();
}

function resetScore() {
    score.roundsLeft = score.maxRounds;
    score.player = 0;
    score.computer = 0;

    $gameRoundsInput.value = score.roundsLeft;
    $gameScorePlayer.textContent = score.player;
    $gameScoreComputer.textContent = score.computer;
}

function onPlayerAttackSelection(event) {
    const playerAttack = ATTACK_TYPES[event.target.dataset.attackType];
    if (playerAttack) playRound(playerAttack);
}

function playRound(playerAttack) {
    const computerAttack = getComputerAttack();

    highlightActiveAttack(playerAttack, $playerButtons);
    highlightActiveAttack(computerAttack, $computerButtons);

    const roundResult = calculateRoundWinner(playerAttack, computerAttack);

    highlightRoundWinner(roundResult);
    incrementScore(roundResult);

    setTimeout(handlePossibleGameEnd, ANIMATION_TIMEOUT_MS);
}

function getComputerAttack() {
    const attacks = Object.values(ATTACK_TYPES);
    return attacks[Math.floor(Math.random() * attacks.length)];
}

function highlightActiveAttack(attack, buttons) {
    buttons.forEach((button) => {
        const buttonState = ATTACK_TYPES[button.dataset.attackType] === attack ? 'active' : 'inactive';
        temporarilyToggleClass(button, buttonState);
    });
}

function temporarilyToggleClass(element, className) {
    element.classList.add(className);
    setTimeout(() => element.classList.remove(className), ANIMATION_TIMEOUT_MS);
}

function calculateRoundWinner(playerAttack, computerAttack) {
    if (playerAttack === computerAttack) return ROUND_RESULTS.tie;
    if (WIN_CONDITIONS[playerAttack] === computerAttack) return ROUND_RESULTS.player;
    return ROUND_RESULTS.computer;
}

function highlightRoundWinner(roundResult) {
    if (roundResult === ROUND_RESULTS.tie) return;

    const winnerActiveButton =
        roundResult === ROUND_RESULTS.player ?
            document.querySelector(`.table-side-button.player.active`)
        :   document.querySelector(`.table-side-button.computer.active`);

    temporarilyToggleClass(winnerActiveButton, 'winner');
}

function incrementScore(roundResult) {
    if (roundResult === ROUND_RESULTS.tie) return;

    score.roundsLeft -= 1;
    $gameRoundsInput.value = score.roundsLeft;

    if (roundResult === ROUND_RESULTS.player) {
        score.player += 1;
        updateScoreSideElement($gameScorePlayer, score.player);
    } else {
        score.computer += 1;
        updateScoreSideElement($gameScoreComputer, score.computer);
    }
}

function updateScoreSideElement(scoreSideElement, scoreSideValue) {
    scoreSideElement.dataset.scoreValue = scoreSideValue;
    temporarilyToggleClass(scoreSideElement, 'active');

    setTimeout(() => {
        scoreSideElement.textContent = scoreSideValue;
    }, ANIMATION_TIMEOUT_MS);
}

function handlePossibleGameEnd() {
    if (score.roundsLeft > 0) return;

    const isPlayerWin = score.player > score.computer;
    const isComputerWin = score.player < score.computer;

    if (isPlayerWin) $matchResultOverlay.innerHTML = '<p>You <span class="win">Won</span> 💚</p>';
    else if (isComputerWin) $matchResultOverlay.innerHTML = '<p>You <span class="lose">Lost</span> 💔</p>';
    else $matchResultOverlay.innerHTML = "<p>It's a <span class='tie'>Tie</span> 🫤</p>";

    resetScore();
    temporarilyToggleClass($matchResultOverlay, 'active');
}
