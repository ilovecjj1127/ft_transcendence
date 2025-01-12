export const init = () => {
    const playButton = document.getElementById('play-button');
    const gameOutput = document.getElementById('game-output');

    playButton.addEventListener('click', () => {
        const randomNumber = Math.floor(Math.random() * 10) + 1;
        gameOutput.textContent = `You rolled a ${randomNumber}!`;
    });

    console.log('Game Loaded');
};