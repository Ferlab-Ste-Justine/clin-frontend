// @NOTE Konami Code : up up down down left right left right b a

import clippy from 'clippyjs';

let cursor = 0;
const KONAMI_CODE = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

const activate = () => {
  clippy.load('Clippy', (agent) => {
    window.agent = agent;
    agent.show();
    agent.play('Greeting');
    agent.speak('Je suis Chromi!');
  });
};

document.addEventListener('keydown', (e) => {
  cursor = (e.keyCode === KONAMI_CODE[cursor]) ? cursor + 1 : 0;
  if (cursor === KONAMI_CODE.length) activate();
});
