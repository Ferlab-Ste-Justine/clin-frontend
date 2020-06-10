/* eslint-disable no-undef */

import { saveAs } from 'file-saver';
import Api, { ApiError } from '../api'; // Only to get an excel file from data that is already available from the frontend

const exportToExcel = async (filename, headerRow, dataRows) => {
  const xlObject = {
    filename,
    style: {
      font: {
        color: '#000000',
        size: 12,
      },
      numberFormat: '0.00; (0.00); -',
      alignment: {
        wrapText: true,
        vertical: 'top',
      },
    },
    sheet: {
      data: [
        headerRow,
        ...dataRows,
      ],
    },
  };

  const response = await Api.convertToExcelData(xlObject);
  if (response.error) {
    throw new ApiError(response.error);
  }

  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    // eslint-disable-next-line no-bitwise
    for (let i = 0; i !== s.length; i += 1) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  const blob = new Blob([s2ab(atob(response.payload.data))], {
    type: '',
  });
  saveAs(blob, `${xlObject.filename}.xlsx`);
};

export default exportToExcel;
