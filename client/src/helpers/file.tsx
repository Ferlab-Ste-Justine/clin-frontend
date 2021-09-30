const scale = 1024;
const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

export const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) {
      return '0';
    }
  
    const dm = decimals < 0 ? 0 : decimals;
  
    const matchedIndex = Math.floor(Math.log(bytes) / Math.log(scale));
  
    return (
      // eslint-disable-next-line no-restricted-properties
      `${parseFloat((bytes / Math.pow(scale, matchedIndex)).toFixed(dm))} ${sizes[matchedIndex]}`
    );
};
  