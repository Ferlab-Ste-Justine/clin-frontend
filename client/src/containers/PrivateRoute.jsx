import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';
import { userShape } from '../reducers/user';

const PrivateRoute = ({ component, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      !rest.user.username
        ? <Redirect to="/" />
        : <component {...props} />
    )
    }
  />
);

PrivateRoute.defaultProps = {
  user: userShape,
};

PrivateRoute.propTypes = {
  component: PropTypes.oneOfType([PropTypes.instanceOf(React.Component), PropTypes.func]).isRequired,
  user: PropTypes.shape(userShape),
};

const mapStateToProps = state => ({
  user: state.user,
});

export default connect(mapStateToProps)(PrivateRoute);
