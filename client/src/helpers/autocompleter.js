const Bloodhound = require('bloodhound-js');

export const createTokenizer = (datum) => {
  const categoryTokens = Bloodhound.tokenizers.whitespace(datum.label);
  const subCategoryTokens = datum.data.reduce(dataDatum => Bloodhound.tokenizers.whitespace(dataDatum.value));

  return categoryTokens.concat(subCategoryTokens);
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
