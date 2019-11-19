const Bloodhound = require('bloodhound-js');

export const createTokenizer = (datum) => {
  const categoryTokens = [datum.label];
  const subCategoryTokens = datum.data.map(dataDatum => dataDatum.value);

  return Bloodhound.tokenizers.whitespace(categoryTokens.concat(subCategoryTokens));
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
