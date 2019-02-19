import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

const Navigation = () => (
    <nav>
        <FormattedMessage id='nav.home' defaultMessage=' ' />
    </nav>
)

export default connect()(Navigation)
