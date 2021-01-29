import React, { useState } from 'react';
import IconKit from 'react-icons-kit';
import {
  ic_person,
} from 'react-icons-kit/md';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Select, Form, Input, Radio, Col, Row, Typography, Button,
} from 'antd';

import intl from 'react-intl-universal';
import { getFamilyRelationshipValues } from '../../../../../../helpers/fhir/fhir';

interface Props {
  familyHistoryResources: any[]
}

const FamilyStorySection: React.FC<Props> = ({ familyHistoryResources }) => {
  const [isEthnicitySelected, setIsEthnicitySelected] = useState(false);
  const [hasFamilyHealthCondition, setHasFamilyHealthCondition] = useState(false);
  const [familyHistoryResourcesClone, setFamilyHistoryResourcesClone] = useState([...familyHistoryResources]);
  return (
    <>
      <Form.Item label={intl.get('form.patientSubmission.clinicalInformation.familyHistory.ethnicity')}>
        <Row align="middle">
          <Col span={4}>
            <Select
              placeholder={intl.get('form.patientSubmission.clinicalInformation.familyHistory.ethnicity.placeholder')}
              onChange={(value) => {
                setIsEthnicitySelected(!!value);
              }}
            >
              { ['cafr', 'eu', 'afr', 'latam', 'esas', 'soas', 'abor', 'mix', 'oth'].map((eth) => (
                <Select.Option key={eth} value={eth}>
                  { intl.get(`form.patientSubmission.clinicalInformation.familyHistory.ethnicity.${eth}`) }
                </Select.Option>
              )) }
            </Select>
          </Col>
          <Col>
            <Typography.Text className="optional-item__label">
              { intl.get('form.patientSubmission.form.validation.optional') }
            </Typography.Text>
          </Col>
        </Row>
      </Form.Item>
      {
        isEthnicitySelected && (
          <Form.Item label={intl.get('form.patientSubmission.clinicalInformation.familyHistory.note')}>
            <Row>
              <Col span={12}>
                <Input />
              </Col>
              <Col>
                <Typography.Text className="optional-item__label">
                  { intl.get('form.patientSubmission.form.validation.optional') }
                </Typography.Text>
              </Col>
            </Row>
          </Form.Item>
        )
      }

      <Form.Item label={intl.get('form.patientSubmission.clinicalInformation.familyHistory.consanguinity')}>
        <Row align="middle">
          <Col>
            <Radio.Group>
              <Radio.Button value="yes">
                { intl.get('form.patientSubmission.clinicalInformation.familyHistory.yes') }
              </Radio.Button>
              <Radio.Button value="no">
                { intl.get('form.patientSubmission.clinicalInformation.familyHistory.no') }
              </Radio.Button>
            </Radio.Group>
          </Col>
          <Col>
            <Typography.Text className="optional-item__label">
              { intl.get('form.patientSubmission.form.validation.optional') }
            </Typography.Text>
          </Col>
        </Row>
      </Form.Item>

      <Form.Item label={intl.get('form.patientSubmission.clinicalInformation.familyHistory.familyHealth')}>
        <Row>
          <Col>
            <Radio.Group onChange={(event) => {
              setHasFamilyHealthCondition(event.target.value === 'yes');
            }}
            >
              <Radio.Button value="yes">
                { intl.get('form.patientSubmission.clinicalInformation.familyHistory.yes') }
              </Radio.Button>
              <Radio.Button value="no">
                { intl.get('form.patientSubmission.clinicalInformation.familyHistory.no') }
              </Radio.Button>
            </Radio.Group>
          </Col>
        </Row>
        { hasFamilyHealthCondition && (
          <>
            <Row>
              <Col>
                <Typography.Text className="clinical-information__family-story__details">
                  { intl.get('form.patientSubmission.clinicalInformation.familyHistory.familyHealth.details') }
                </Typography.Text>
              </Col>

            </Row>
            <Row>
              <Col span={20}>
                <ul className="clinical-information__family-story__conditions">
                  { familyHistoryResourcesClone.map((fhr, index) => (
                    <li>
                      <Row gutter={8}>
                        <Col span={14}>
                          <Form.Item noStyle>
                            <Input
                              placeholder={intl.get('form.patientSubmission.clinicalInformation.familyHistory.familyHealth.healthCondition')}
                              aria-label={intl.get('form.patientSubmission.clinicalInformation.familyHistory.familyHealth.healthCondition')}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            noStyle
                          >
                            <Select
                              suffixIcon={<IconKit className="selectIcon" size={12} icon={ic_person} />}
                              className="selectRelation"
                              placeholder={intl.get('form.patientSubmission.clinicalInformation.familyHistory.familyHealth.familyRelation')}
                              aria-label={intl.get('form.patientSubmission.clinicalInformation.familyHistory.familyHealth.familyRelation')}
                              dropdownClassName="selectDropdown"
                            >
                              { Object.values(getFamilyRelationshipValues()).map((rv) => (
                                <Select.Option value={rv.value} key={`relationship_${rv.value}`}>
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
                              onClick={() => {
                                setFamilyHistoryResourcesClone((oldState) => {
                                  const fhrClone = [...oldState];
                                  fhrClone.splice(index, 1);
                                  return fhrClone;
                                });
                              }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </li>
                  )) }
                  <li>
                    <Button
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={() => {
                        setFamilyHistoryResourcesClone((oldState) => ([...oldState, {}]));
                      }}
                    >
                      { intl.get('form.patientSubmission.clinicalInformation.familyHistory.familyHealth.add') }
                    </Button>
                  </li>
                </ul>
              </Col>
            </Row>
          </>
        ) }
      </Form.Item>

    </>
  );
};

export default FamilyStorySection;
