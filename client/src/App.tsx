import React from 'react';
import logo from './logo.svg';
import './App.css';
import TestingComponenet from './Test';

type Props = {
  id: string;
}

function App(props: Props) {
  const { id } = props;

  return (
    <div className="App" id={id}>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <TestingComponenet />
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
