/* eslint-disable */
const Bloodhound = require('bloodhound-js');


export const createTokenizerByKey = key => (datum) => {

  console.log('+++++++')
  console.log(key)
  console.log(datum.label)
  console.log(datum)
  console.log(datum[key])
  console.log('----+')

  const categoryTokens = Bloodhound.tokenizers.whitespace(datum.label);
  const subCategoryTokens = datum.data.map(dataDatum => dataDatum.value )

  const test = categoryTokens.concat(subCategoryTokens);
  console.log(test);


  return test;
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
  return engine
};

export default Autocompleter;
