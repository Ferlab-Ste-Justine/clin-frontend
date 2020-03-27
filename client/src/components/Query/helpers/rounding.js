export const roundDown = digits => (value) => {
  const multiplicator = 10 ** digits;
  return Math.floor(multiplicator * value) / multiplicator;
};

export const roundUp = digits => (value) => {
  const multiplicator = 10 ** digits;
  return Math.ceil(multiplicator * value) / multiplicator;
};
