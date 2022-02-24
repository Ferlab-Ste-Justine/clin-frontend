import React, { useState } from 'react';
import intl from 'react-intl-universal';
import {
  Col, Form, Input,   Radio, Row, Typography,
} from 'antd';

const { TextArea } = Input;

enum InterpretationValue {
  REALIZED = 'realized',
  NON_REALIZED = 'non-realized',
}

type Props = {
  interpretation: string;
  precision?: string;
  summary?: string;
  isEditMode:boolean;
}
const getInitialValueCghInterpretation = (interpretation: string) => interpretation ? InterpretationValue.REALIZED : InterpretationValue.NON_REALIZED

const InvestigationSection = ({ interpretation, isEditMode, precision, summary }: Props): React.ReactElement => {
  const [isRealizedSelected, setIsRealizedSelected] = useState(interpretation != null);
  const [isAbnormalResult, setIsAbnormalResult] = useState(interpretation === 'A');

  return (
    <>
      <Form.Item
        initialValue={isEditMode ? getInitialValueCghInterpretation(interpretation) : null}
        label={intl.get('form.patientSubmission.clinicalInformation.cgh')}
        name="cghInterpretationValue"
      >
        <Radio.Group
          buttonStyle="solid"
          onChange={(event) => {
            setIsRealizedSelected(event.target.value === InterpretationValue.REALIZED);
          }}
        >
          <Radio.Button data-testid="cgh" value={InterpretationValue.REALIZED}>
            { intl.get('form.patientSubmission.clinicalInformation.cgh.realized') }
          </Radio.Button>
          <Radio.Button value={InterpretationValue.NON_REALIZED}>
            { intl.get('form.patientSubmission.clinicalInformation.cgh.nonRealized') }
          </Radio.Button>
        </Radio.Group>
      </Form.Item>

      { isRealizedSelected && (
        <>
          <Form.Item
            initialValue={interpretation}
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
            <Row className="ant-form-item">
              <Col span={17}>
                <Form.Item
                  initialValue={precision}
                  label={intl.get('form.patientSubmission.clinicalInformation.precision')}
                  name="cgh.precision"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          ) }

          <Row gutter={8}>
            <Col span={17}>
              <Form.Item
                initialValue={summary}
                label={intl.get('form.patientSubmission.clinicalInformation.investigationSummary')}
                name="summaryNote"
              >
                <TextArea
                  placeholder={intl.get('form.patientSubmission.clinicalInformation.analysis.comments.placeholder')}
                  rows={4}
                />
              </Form.Item>
            </Col>
            <Col>
              <Typography.Text className="optional-item__label">
                { intl.get('form.patientSubmission.form.validation.optional') }
              </Typography.Text>
            </Col>
          </Row>
        </>
      ) }
    </>
  );
};

export default InvestigationSection;
