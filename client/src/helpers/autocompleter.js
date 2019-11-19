import { flatten } from 'lodash';

const Bloodhound = require('bloodhound-js');

export const tokenizeObjectByKeys = (keys = ['label', 'value']) => (datum) => {
  const tokens = [];
  keys.forEach(key => tokens.push(Bloodhound.tokenizers.whitespace(datum[key])));

  return flatten(tokens);
};

const Autocompleter = async (dataset, datumTokenizer = Bloodhound.tokenizers.whitespace, queryTokenizer = Bloodhound.tokenizers.whitespace) => {
  const engine = new Bloodhound({
    sufficient: 1,
    initialize: true,
    local: dataset,
    datumTokenizer,
    queryTokenizer,
  });

  engine.initialize(true);
  return engine;
};

export default Autocompleter;
