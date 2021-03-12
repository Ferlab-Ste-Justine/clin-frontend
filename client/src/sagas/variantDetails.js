import {
  all, put, takeLatest,
} from 'redux-saga/effects';

import get from 'lodash/get';
import * as actionTypes from '../actions/type';
// import * as actions from '../actions/app';
import Api, { ApiError } from '../helpers/api';

function* fetchVariantDetails(action) {
  const { payload } = action;
  try {
    yield put({ type: actionTypes.VARIANT_ID_SET, payload });
    const variantDetailsResponse = yield Api.getVariantDetails(payload);
    if (variantDetailsResponse.error) {
      throw new ApiError(variantDetailsResponse.error);
    }

    const patientIds = [...new Set(get(variantDetailsResponse, 'payload.data.data.donors', [])
      .map((donor) => donor.patient_id))];
    const donorsGP = yield Api.getPatientsGenderAndPosition(patientIds);

    yield put({
      type: actionTypes.VARIANT_DETAILS_SUCCEEDED,
      payload: {
        data: variantDetailsResponse.payload.data.data,
        donorsGP,
      },
    });
  } catch (e) {
    yield put({ type: actionTypes.VARIANT_DETAILS_FAILED, payload: e });
  }
}

function* watchVariantDetailsFetch() {
  yield takeLatest(actionTypes.VARIANT_DETAILS_REQUESTED, fetchVariantDetails);
}

export default function* watchedVariantDetailsSagas() {
  yield all([
    watchVariantDetailsFetch(),
  ]);
}
