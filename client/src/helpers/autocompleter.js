import flatten from 'lodash/flatten';

const Bloodhound = require('bloodhound-js');

export const tokenizeObjectByKeys = (keys = ['value']) => (datum) => {
  const tokens = [];
  keys.forEach((key) => {
    if (datum[key].length > 2) {
      tokens.push(Bloodhound.tokenizers.whitespace(datum[key].replace(/((?![\w:]).)/g, ' ')));
    }
  });

  return flatten(tokens);
};

const Autocompleter = async (
  dataset,
  datumTokenizer = Bloodhound.tokenizers.whitespace,
  queryTokenizer = Bloodhound.tokenizers.whitespace,
) => {
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
