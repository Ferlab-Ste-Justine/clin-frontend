import React, { useState } from 'react';
import IconKit from 'react-icons-kit';
import {
  ic_person,
} from 'react-icons-kit/md';
import intl from 'react-intl-universal';
import { useSelector } from 'react-redux';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button, Col, Form, Input, Radio, Row,   Select, Typography,
} from 'antd';
import { getFamilyRelationshipValues } from 'helpers/fhir/fhir';
import { FamilyObservation } from 'helpers/providers/types';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { State } from 'reducers';

import { HiddenFormInput } from 'components/Utils/HiddenFormInput';

interface Props {
  consanguinity: {
    id: string | undefined,
    value: boolean | undefined
  },
  familyHistoryResources: Partial<FamilyObservation>[]
  isEditMode: boolean,
}

type Ethnicity = {
  id: string;
  code: string;
  note: string;
}

type Consanguinity = {
  id: string | undefined,
  value: boolean | undefined
}

type FamilyStoryState = {
  ethnicity: Partial<Ethnicity>,
  consanguinity: Partial<Consanguinity>
}

enum RadioValue {
  YES = 'yes',
  NO = 'no'
}

const intlKeyPrefix = 'form.patientSubmission.clinicalInformation';

const getInitialValueFmh = (familyHistoryResources: Partial<FamilyObservation>[]) => familyHistoryResources.length === 0 ? RadioValue.NO : RadioValue.YES

const getInitialValueForConsanguinity = (consanguinity: Consanguinity) => {
  if (!consanguinity.id) {
    return null;
  }
  return consanguinity.value ?  RadioValue.YES : RadioValue.NO
}


const FamilyStorySection = ({ consanguinity, familyHistoryResources, isEditMode }: Props): React.ReactElement => {
  const { local } = useSelector((state: State) => state.patientSubmission);

  const [defaultValuesState] = useState<FamilyStoryState>({
    consanguinity: {
      id:local.cons?.id,
      value:local.cons?.value,
    },
    ethnicity: {
      code: local.eth?.code,
      id:local.eth?.id,
      note:local.eth?.note,
    },
  });
  const [isEthnicitySelected, setIsEthnicitySelected] = useState(
    defaultValuesState.ethnicity.id != null && defaultValuesState.ethnicity.code != null,
  );
  const [hasFamilyHealthCondition, setHasFamilyHealthCondition] = useState(
    familyHistoryResources.filter((fmh) => !isEmpty(fmh) && fmh.id != null).length > 0,
  );

  return (
    <>
      <HiddenFormInput name={['ethnicity', 'id']} value={defaultValuesState.ethnicity.id} />
      <HiddenFormInput name={['consanguinity', 'id']} value={consanguinity.id} />
      <Row align="middle" className="clinical-information__row">
        <Col span={8}>
          <Form.Item
            initialValue={defaultValuesState.ethnicity.code}
            label={intl.get('form.patientSubmission.clinicalInformation.familyHistory.ethnicity')}
            name={['ethnicity', 'value']}
          >
            <Select
              className="clinical-information__family-story__ethnicity"
              defaultValue={defaultValuesState.ethnicity.code}
              onChange={(value) => {
                setIsEthnicitySelected(!!value);
              }}
              placeholder={intl.get('form.patientSubmission.clinicalInformation.familyHistory.ethnicity.placeholder')}
            >
              { ['CA-FR', 'EU', 'AFR', 'LAT-AM', 'ES-AS', 'SO-AS', 'ABOR', 'MIX', 'OTH'].map((eth) => (
                <Select.Option key={eth} value={eth}>
                  { intl.get(`form.patientSubmission.form.ethnicity.${eth}`) }
                </Select.Option>
              )) }
            </Select>
          </Form.Item>
        </Col>
        <Col>
          <Typography.Text className="optional-item__label">
            { intl.get('form.patientSubmission.form.validation.optional') }
          </Typography.Text>
        </Col>
      </Row>
      {
        isEthnicitySelected && (
          <Row className="clinical-information__row">
            <Col span={12}>
              <Form.Item
                initialValue={defaultValuesState.ethnicity.note}
                label={intl.get('form.patientSubmission.clinicalInformation.familyHistory.note')}
                name={['ethnicity', 'note']}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col>
              <Typography.Text className="optional-item__label">
                { intl.get('form.patientSubmission.form.validation.optional') }
              </Typography.Text>
            </Col>
          </Row>
        )
      }

      <Row className="clinical-information__row" gutter={8}>
        <Col span={8}>
          <Form.Item
            initialValue={getInitialValueForConsanguinity(consanguinity)}
            label={intl.get('form.patientSubmission.clinicalInformation.familyHistory.consanguinity')}
            name={['consanguinity', 'value']}
          >
            <Radio.Group>
              <Radio.Button value="yes">
                { intl.get('form.patientSubmission.clinicalInformation.familyHistory.yes') }
              </Radio.Button>
              <Radio.Button value="no">
                { intl.get('form.patientSubmission.clinicalInformation.familyHistory.no') }
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col>
          <Typography.Text className="optional-item__label">
            { intl.get('form.patientSubmission.form.validation.optional') }
          </Typography.Text>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Item
            initialValue={isEditMode ? getInitialValueFmh(familyHistoryResources) : null}
            label={intl.get('form.patientSubmission.clinicalInformation.familyHistory.familyHealth')}
            name="familyHealth"
          >
            <Radio.Group
              onChange={(event) => {
                setHasFamilyHealthCondition(event.target.value === 'yes');
              }}
            >
              <Radio.Button value="yes">
                { intl.get('form.patientSubmission.clinicalInformation.familyHistory.yes') }
              </Radio.Button>
              <Radio.Button data-testid="familyHealth" value="no">
                { intl.get('form.patientSubmission.clinicalInformation.familyHistory.no') }
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
      { hasFamilyHealthCondition && (
        <Form.Item label="&nbsp;">
          <Row>
            <Col>
              <Typography.Text className="clinical-information__family-story__details">
                { intl.get('form.patientSubmission.clinicalInformation.familyHistory.familyHealth.details') }
              </Typography.Text>
            </Col>

          </Row>
          <Row>
            <Col span={20}>
              <Form.List
                initialValue={familyHistoryResources}
                name="fmh"
              >
                {
                  (fields, { add, remove }) => (
                    <ul className="clinical-information__family-story__conditions">
                      {
                        fields.map((field, index) => (
                          <li key={field.name}>
                            <Form.Item
                              className="hidden-form"
                              initialValue={get(familyHistoryResources, `[${index}].id`, '')}
                              name={[index, 'id']}
                            >
                              <Input size="small" type="hidden" />
                            </Form.Item>
                            <Row gutter={8}>
                              <Col span={14}>
                                <Form.Item
                                  initialValue={get(familyHistoryResources, `[${index}].note`, '')}
                                  name={[index, 'note']}
                                  noStyle
                                >
                                  <Input
                                    aria-label={intl.get(`${intlKeyPrefix}.familyHistory.familyHealth.healthCondition`)}
                                    placeholder={intl.get(`${intlKeyPrefix}.familyHistory.familyHealth.healthCondition`)}
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={6}>
                                <Form.Item
                                  initialValue={get(familyHistoryResources, `[${index}].code`, null)}
                                  name={[index, 'relation']}
                                  noStyle
                                >
                                  <Select
                                    aria-label={intl.get(`${intlKeyPrefix}.familyHistory.familyHealth.familyRelation`)}
                                    className="clinical-information__family-story__conditions__relation-select"
                                    dropdownClassName="selectDropdown"
                                    placeholder={intl.get(`${intlKeyPrefix}.familyHistory.familyHealth.familyRelation`)}
                                    suffixIcon={<IconKit className="selectIcon" icon={ic_person} size={12} />}
                                  >
                                    { Object.values(getFamilyRelationshipValues()).map((rv) => (
                                      <Select.Option key={`relationship_${rv.value}`} value={rv.value}>
                                        { rv.label }
                                      </Select.Option>
                                    )) }
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col>
                                <Form.Item noStyle>
                                  <Button
                                    icon={<CloseOutlined size={10} />}
                                    onClick={() => remove(field.name)}
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                          </li>
                        ))
                      }
                      <li>
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => add()}
                          size="small"
                        >
                          { intl.get('form.patientSubmission.clinicalInformation.familyHistory.familyHealth.add') }
                        </Button>
                      </li>
                    </ul>
                  )
                }
              </Form.List>
            </Col>
          </Row>
        </Form.Item>
      ) }

    </>
  );
};

export default FamilyStorySection;
