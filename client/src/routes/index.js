import React from 'react'
import { Route, Switch } from 'react-router'
import Navigation from '../components/Navigation'
import Home from '../components/Home'
import NoMatch from '../components/NoMatch'

const routes = (
    <div>
        <Navigation />
        <Switch>
            <Route exact path="/" component={Home} />
            <Route component={NoMatch} />
        </Switch>
    </div>
)

export default routes