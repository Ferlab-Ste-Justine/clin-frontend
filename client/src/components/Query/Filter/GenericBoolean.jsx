/* eslint-disable */

import React from 'react';

import Filter from './index';
import FILTER_TYPE_GENERICBOOL from './index'

class NumericalComparisonFilter extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };

    // @NOTE Initialize Component State
  }
      getLabel() {
        return "allo"
      }

      getPopoverContent() {
          const { data } = this.props;
          const { operand } = data;
          return (
              <div>
                  <Typography.Text>{operand}</Typography.Text>
                  <ul>
                      <li>VALUE 1</li>
                      <li>VALUE 3</li>
                  </ul>
              </div>
          );
      }

    getEditor() {

        return (
            <>
                coucou
            </>
        );
    }

    render() {
        return <Filter
            {...this.props}
            type:{FILTER_TYPE_GENERICBOOL}
            editor={this.getEditor()}
            label={this.getLabel()}
            legend={this.getPopoverLegend()}
            content={this.getPopoverContent()}
        />;
    }


}