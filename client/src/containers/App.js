import React from 'react'
import PropTypes from 'prop-types'
import { Route } from 'react-router-dom'
import { connect } from 'react-redux'

import 'antd/dist/antd.css'

import Home from './../components/Home'

class App extends React.Component {
    render () {
        return (
            <div>
                <Route exact path='/' component={Home}/>
            </div>
        )
    }
}

App.propTypes = {
    dispatch: PropTypes.func.isRequired
}

export default connect()(App)