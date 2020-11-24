/* eslint-disable */
// @NOTE Konami Code : up up down down left right left right b a

const loadRemoteJs = (url, callback) => {
  const scriptTag = document.createElement('script');
  scriptTag.src = url;
  scriptTag.onload = callback;
  document.body.appendChild(scriptTag);
};

let cursor = 0;
const KONAMI_CODE = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

const activate = () => {
  if (!window.agent) {
    clippy.load('Links', (agent) => {
      window.agent = agent;
      agent.show();
      agent.play('Greeting');
    });
  } else {
    window.agent.play('GoodBye');
    setTimeout(() => {
      window.agent.hide();
      window.agent = null;
    }, 1500)
  }
};

document.addEventListener('keydown', (e) => {
  cursor = (e.keyCode === KONAMI_CODE[cursor]) ? cursor + 1 : 0;
  if (cursor === KONAMI_CODE.length) {
    loadRemoteJs('https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.2/jquery.min.js', () => {
      loadRemoteJs('https://cdn.rawgit.com/smore-inc/clippy.js/master/build/clippy.min.js', activate);
    } )
  }
});
