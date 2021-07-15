import {
  AutoComplete, Form, Radio, RadioChangeEvent, Typography,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import Modal from 'antd/lib/modal/Modal';
import React, { useEffect, useRef, useState } from 'react';
import intl from 'react-intl-universal';
import { useDispatch, useSelector } from 'react-redux';
import { addParentToFamily } from '../../../../../../actions/patient';
import api from '../../../../../../helpers/api';
import { GroupMemberStatusCode } from '../../../../../../helpers/fhir/patientHelper';
import { FamilyMemberType } from '../../../../../../helpers/providers/types';
import { PatientData } from '../../../../../../helpers/search/types';
import { State } from '../../../../../../reducers';

interface Props {
  parentType: FamilyMemberType | null
  onClose: () => void
}

interface SearchResult {
  id: string
  lastName: string
  firstName: string
  ramq: string;
}

const getGenderByType = (type: FamilyMemberType) => {
  switch (type) {
    case FamilyMemberType.FATHER:
      return 'Male';
    case FamilyMemberType.MOTHER:
      return 'Female';
    default:
      throw new Error(`Type [${type}] not supported yet.`);
  }
};

const AddParentModal: React.FC<Props> = ({
  parentType,
  onClose,
}) => {
  const dispatch = useDispatch();
  const [form] = useForm();
  const [searchResult, setSearchResult] = useState<SearchResult[] | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [affectedStatus, setAffectedStatus] = useState<GroupMemberStatusCode | undefined>(undefined);
  const family = useSelector((state: State) => state.patient.family);
  const familyMemberIds = family?.map((member) => member.id);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!!parentType && searchRef != null && searchRef.current != null) {
      setTimeout(() => { searchRef.current?.focus(); }, 50);
    }
  }, [parentType]);

  async function search(searchTerm: string) {
    const response: any = await api.getPatientsByAutoComplete('complete', searchTerm, 1, 5, getGenderByType(parentType!));
    if (response.payload?.data) {
      setSearchResult(response.payload.data.data.hits

        .filter((hit: any) => !familyMemberIds?.includes(hit._id) && !hit._source.fetus)
        .map((hit: any) => ({
          id: hit._id,
          lastName: hit._source.lastName,
          firstName: hit._source.firstName,
          ramq: hit._source.ramq,
        })));
    } else {
      setSearchResult([]);
    }
  }

  async function onSelectPatient(value: string, option: any) {
    const response: any = await api.getPatientById(option.key);
    setSelectedPatient(response.payload.data.data);
  }

  const resetValues = () => {
    setSearchResult(null);
    setSelectedPatient(null);
    setAffectedStatus(undefined);
    form.setFields([{
      name: 'patientSearch',
      value: '',
    }]);
  };

  async function onSubmit() {
    dispatch(addParentToFamily(selectedPatient?.id, parentType, affectedStatus!));
    resetValues();
    onClose();
  }

  const updateStatus = (event: RadioChangeEvent) => {
    setAffectedStatus(event.target.value);
  };

  const onCancel = () => {
    resetValues();
    onClose();
  };

  return (
    <Modal
      visible={!!parentType}
      title={parentType ? intl.get(`screen.patient.details.family.modal.title.${parentType.toLowerCase()}`) : ''}
      className="family-tab__details__add-parent__modal"
      okText={intl.get('screen.patient.details.family.modal.add')}
      cancelText={intl.get('screen.patient.details.family.modal.cancel')}
      okButtonProps={{ disabled: !selectedPatient || !affectedStatus }}
      onCancel={onCancel}
      onOk={() => form.submit()}
    >
      <Form
        form={form}
        className="family-tab__details__add-parent__modal__form"
        onFinish={onSubmit}
      >
        <Form.Item
          labelCol={{ span: 24 }}
          name="patientSearch"
          label={intl.get('screen.patient.details.family.modal.search.label')}
          className="family-tab__details__add-parent__modal__form__search"
        >
          <AutoComplete
            placeholder={intl.get('screen.patient.details.family.modal.search.placeholder')}
            notFoundContent={searchResult != null && intl.get('screen.patient.details.family.modal.search.empty')}
            allowClear
            ref={searchRef}
            onSearch={search}
            options={searchResult?.map((sr) => ({
              key: sr.id,
              value: `${sr.lastName.toUpperCase()} ${sr.firstName}`,
              label: (
                <div>
                  <Typography className="family-tab__details__add-parent__modal__form__search__result__name">
                    { `${sr.lastName.toUpperCase()} ${sr.firstName}` }
                  </Typography>
                  <Typography className="family-tab__details__add-parent__modal__form__search__result__ramq">
                    { sr.ramq }
                  </Typography>
                </div>
              ),
            }))}
            onSelect={onSelectPatient}
          />
        </Form.Item>
        { !!selectedPatient && (
          <>
            <div className="family-tab__details__add-parent__modal__patient-card">
              <div className="family-tab__details__add-parent__modal__patient-card__info">
                <span className="family-tab__details__add-parent__modal__patient-card__info__name">
                  { `${selectedPatient.lastName.toUpperCase()} ${selectedPatient.firstName}` }
                </span>
              </div>
              <dl>
                <dt>
                  { intl.get('screen.patient.details.family.modal.ramq') }
                </dt>
                <dd>{ selectedPatient.ramq }</dd>
                <dt>
                  { intl.get('screen.patient.details.family.modal.birthDate') }
                </dt>
                <dd>{ selectedPatient.birthDate || '--' }</dd>
                { !!selectedPatient.mrn && (
                  <>
                    <dt>
                      { intl.get('screen.patient.details.family.modal.file') }
                    </dt>
                    <dd>{ `${selectedPatient.mrn[0]} | ${selectedPatient.organization.id.split('/')[1]}` }</dd>
                  </>
                ) }
              </dl>
            </div>
            <Form.Item
              labelCol={{ span: 24 }}
              label={intl.get('screen.patient.details.family.modal.status.label')}
              className="family-tab__details__add-parent__modal__form__status"
            >
              <Radio.Group onChange={updateStatus}>
                <Radio value="UNF">
                  { intl.get('screen.patient.details.family.modal.status.no') }
                </Radio>
                <Radio value="AFF">
                  { intl.get('screen.patient.details.family.modal.status.yes') }
                </Radio>
                <Radio value="UNK">
                  { intl.get('screen.patient.details.family.modal.status.unknown') }
                </Radio>
              </Radio.Group>
            </Form.Item>
          </>
        ) }
      </Form>

    </Modal>
  );
};

export default AddParentModal;
