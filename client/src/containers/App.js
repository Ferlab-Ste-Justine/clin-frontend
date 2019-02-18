import React from 'react'
import {History} from 'history'
import { ConnectedRouter } from 'connected-react-router'

import 'antd/dist/antd.css'
import routes from './../routes'

const App = ({ history }) => {
    return (
        <ConnectedRouter history={history}>
            { routes }
        </ConnectedRouter>
    )
};

export default App