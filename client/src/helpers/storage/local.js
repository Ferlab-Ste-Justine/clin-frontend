import store from 'store';


const read = key => store.get(`${window.CLIN.namespace}${key}`);

const write = (key, value) => store.set(`${window.CLIN.namespace}${key}`, value);

const remove = key => store.get(`${window.CLIN.namespace}${key}`);

const flush = () => store.each((value, key) => {
  if (key.indexOf(window.CLIN.namespace) !== -1) {
    remove(key);
  }
});

export default {
  keys: {
    location: 'LOCATION',
  },
  read,
  write,
  remove,
  flush,
};
