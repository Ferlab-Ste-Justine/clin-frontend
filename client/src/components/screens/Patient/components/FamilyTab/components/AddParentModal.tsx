import React, { useState } from 'react';
import intl from 'react-intl-universal';
import { useDispatch, useSelector } from 'react-redux';
import { addParentToFamily } from 'actions/patient';
import { AutoComplete, Form, message, Radio, RadioChangeEvent, Typography } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import Modal from 'antd/lib/modal/Modal';
import api from 'helpers/api';
import { parentTypeToGender } from 'helpers/fhir/familyMemberHelper';
import { GroupMemberStatusCode } from 'helpers/fhir/patientHelper';
import { PatientData } from 'helpers/search/types';
import { State } from 'reducers';
import { FamilyActionStatus } from 'reducers/patient';

import { FamilyMemberType } from 'store/FamilyMemberTypes';

interface Props {
  parentType: FamilyMemberType | null;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  lastName: string;
  firstName: string;
  ramq: string;
}

const AddParentModal = ({ onClose, parentType }: Props): React.ReactElement => {
  const dispatch = useDispatch();
  const [form] = useForm();
  const [searchResult, setSearchResult] = useState<SearchResult[] | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [affectedStatus, setAffectedStatus] = useState<GroupMemberStatusCode | undefined>(
    undefined,
  );
  const family = useSelector((state: State) => state.patient.family);
  const familyActionStatus = useSelector((state: State) => state.patient.familyActionStatus);
  const familyMemberIds = family?.map((member) => member.id);

  async function search(searchTerm: string) {
    const response: any = await api.getPatientsByAutoComplete(
      'complete',
      searchTerm,
      1,
      5,
      parentTypeToGender[parentType!]
    );
    if (response.payload?.data) {
      setSearchResult(
        response.payload.data.data.hits

          .filter((hit: any) => !familyMemberIds?.includes(hit._id) && !hit._source.fetus)
          .map((hit: any) => ({
            firstName: hit._source.firstName,
            id: hit._id,
            lastName: hit._source.lastName,
            ramq: hit._source.ramq,
          })),
      );
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
    form.setFields([
      {
        name: 'patientSearch',
        value: '',
      },
    ]);
  };

  const cleanUpBeforeClosing = () => {
    resetValues();
    onClose();
  };

  async function onSubmit() {
    const callback = (isSuccess: boolean) => {
      isSuccess
        ? message.success(intl.get('screen.patient.details.family.add.success'))
        : message.error(intl.get('screen.patient.details.family.add.error'));
      cleanUpBeforeClosing();
    };
    dispatch(addParentToFamily(selectedPatient?.id, parentType, affectedStatus!, callback));
  }

  const updateStatus = (event: RadioChangeEvent) => {
    setAffectedStatus(event.target.value);
  };

  const onCancel = () => {
    cleanUpBeforeClosing();
  };

  const isAddingParentInProgress = familyActionStatus === FamilyActionStatus.addMemberInProgress;
  const shouldDisableOkButton = !selectedPatient || !affectedStatus || isAddingParentInProgress;

  return (
    <Modal
      cancelButtonProps={{ disabled: isAddingParentInProgress }}
      cancelText={intl.get('screen.patient.details.family.modal.cancel')}
      className="family-tab__details__add-parent__modal"
      okButtonProps={{ disabled: shouldDisableOkButton, loading: isAddingParentInProgress }}
      okText={intl.get('screen.patient.details.family.modal.add')}
      onCancel={onCancel}
      onOk={() => form.submit()}
      title={
        parentType
          ? intl.get(`screen.patient.details.family.modal.title.${parentType.toLowerCase()}`)
          : ''
      }
      visible={!!parentType}
    >
      <Form
        className="family-tab__details__add-parent__modal__form"
        form={form}
        onFinish={onSubmit}
      >
        <Form.Item
          className="family-tab__details__add-parent__modal__form__search"
          label={intl.get('screen.patient.details.family.modal.search.label')}
          labelCol={{ span: 24 }}
          name="patientSearch"
        >
          <AutoComplete
            allowClear
            autoFocus
            notFoundContent={
              searchResult != null && intl.get('screen.patient.details.family.modal.search.empty')
            }
            onSearch={search}
            onSelect={onSelectPatient}
            options={searchResult?.map((sr) => ({
              key: sr.id,
              label: (
                <div>
                  <Typography className="family-tab__details__add-parent__modal__form__search__result__name">
                    {`${sr.lastName.toUpperCase()} ${sr.firstName}`}
                  </Typography>
                  <Typography className="family-tab__details__add-parent__modal__form__search__result__ramq">
                    {sr.ramq}
                  </Typography>
                </div>
              ),
              value: `${sr.lastName.toUpperCase()} ${sr.firstName}`,
            }))}
            placeholder={intl.get('screen.patient.details.family.modal.search.placeholder')}
          />
        </Form.Item>
        {!!selectedPatient && (
          <>
            <div className="family-tab__details__add-parent__modal__patient-card">
              <div className="family-tab__details__add-parent__modal__patient-card__info">
                <span className="family-tab__details__add-parent__modal__patient-card__info__name">
                  {`${selectedPatient.lastName.toUpperCase()} ${selectedPatient.firstName}`}
                </span>
              </div>
              <dl>
                <dt>{intl.get('screen.patient.details.family.modal.ramq')}</dt>
                <dd>{selectedPatient.ramq}</dd>
                <dt>{intl.get('screen.patient.details.family.modal.birthDate')}</dt>
                <dd>{selectedPatient.birthDate || '--'}</dd>
                {!!selectedPatient.mrn && (
                  <>
                    <dt>{intl.get('screen.patient.details.family.modal.file')}</dt>
                    <dd>{`${selectedPatient.mrn[0]} | ${
                      selectedPatient.organization.id.split('/')[1]
                    }`}</dd>
                  </>
                )}
              </dl>
            </div>
            <Form.Item
              className="family-tab__details__add-parent__modal__form__status"
              label={intl.get('screen.patient.details.family.modal.status.label')}
              labelCol={{ span: 24 }}
            >
              <Radio.Group onChange={updateStatus}>
                <Radio value="UNF">
                  {intl.get('screen.patient.details.family.modal.status.no')}
                </Radio>
                <Radio value="AFF">
                  {intl.get('screen.patient.details.family.modal.status.yes')}
                </Radio>
                <Radio value="UNK">
                  {intl.get('screen.patient.details.family.modal.status.unknown')}
                </Radio>
              </Radio.Group>
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default AddParentModal;
