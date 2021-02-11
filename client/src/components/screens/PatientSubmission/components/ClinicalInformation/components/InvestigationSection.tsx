import React, { useState } from 'react';
import {
  Radio, Col, Input, Row, Form, Typography,
} from 'antd';
import intl from 'react-intl-universal';

const { TextArea } = Input;

const InvestigationSection: React.FC = () => {
  const [isRealizedSelected, setIsRealizedSelected] = useState(false);
  const [isAbnormalResult, setIsAbnormalResult] = useState(false);
  return (
    <>
      <Form.Item
        label={intl.get('form.patientSubmission.clinicalInformation.cgh')}
        name="cghInterpretationValue"
      >
        <Radio.Group
          buttonStyle="solid"
          onChange={(event) => {
            setIsRealizedSelected(event.target.value === 'realized');
          }}
        >
          <Radio.Button value="realized">
            { intl.get('form.patientSubmission.clinicalInformation.cgh.realized') }
          </Radio.Button>
          <Radio.Button value="non-realized">
            { intl.get('form.patientSubmission.clinicalInformation.cgh.nonRealized') }
          </Radio.Button>
        </Radio.Group>
      </Form.Item>

      { isRealizedSelected && (
        <>
          <Form.Item
            label={intl.get('form.patientSubmission.clinicalInformation.investigationResult')}
            name="cgh.result"
          >
            <Radio.Group
              buttonStyle="solid"
              onChange={(event) => {
                setIsAbnormalResult(event.target.value === 'A');
              }}
            >
              <Radio.Button value="N">
                { intl.get('form.patientSubmission.clinicalInformation.investigationResult.negative') }
              </Radio.Button>
              <Radio.Button value="A">
                { intl.get('form.patientSubmission.clinicalInformation.investigationResult.abnormal') }
              </Radio.Button>
              <Radio.Button value="IND">
                { intl.get('form.patientSubmission.clinicalInformation.investigationResult.indeterminate') }
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          { isAbnormalResult && (
            <Form.Item
              label={intl.get('form.patientSubmission.clinicalInformation.precision')}
              name="cgh.precision"
            >
              <Col span={17}>
                <Input />
              </Col>
            </Form.Item>
          ) }

          <Form.Item
            label={intl.get('form.patientSubmission.clinicalInformation.investigationSummary')}
            name="summaryNote"
          >
            <Row gutter={8}>
              <Col span={17}>
                <TextArea
                  placeholder={intl.get('form.patientSubmission.clinicalInformation.analysis.comments.placeholder')}
                  rows={4}
                />
              </Col>
              <Col>
                <Typography.Text className="optional-item__label">
                  { intl.get('form.patientSubmission.form.validation.optional') }
                </Typography.Text>
              </Col>
            </Row>
          </Form.Item>
        </>
      ) }
    </>
  );
};

export default InvestigationSection;
