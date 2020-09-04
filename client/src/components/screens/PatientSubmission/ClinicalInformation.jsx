/* eslint-disable no-unused-vars */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */
import React from 'react';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import {
  Card, Form, Input, Button, Radio, Tree, Select,
} from 'antd';
import IconKit from 'react-icons-kit';
import {
  ic_add, ic_remove, ic_help, ic_person, ic_visibility, ic_visibility_off,
} from 'react-icons-kit/md';

import {
  CGH_CODES,
  CGH_VALUES,
  isCGH,
  isIndication,
  cghInterpretation,
  cghNote,
  getCGHInterpretationCode,
  getIndicationNote,
  getIndicationId,
  createHPOResource,
  hpoOnsetValues,
  getHPOId,
  getResourceToBeDeletedStatus,
  getHPOCode,
  getHPODisplay,
  getHPONote,
  getHPOOnsetCode,
  getHPOInterpretationCode,
  hpoInterpretationValues,
} from '../../../helpers/fhir/fhir';

const mockHpoResources = [
  {
    hpoCode: { code: 'HP-000001', display: 'Strange head' },
    onset: { code: 'Neonatal', display: 'NeoNatal' },
    category: {
      code: '',
      display: '',
    },
    interpretation: { code: 'O', display: 'Observé' },
    note: 'Some notes on hpo observation',
  },
].map(createHPOResource);

/**
 *
 * @param {
 * hpoIds,
 hpoCodes,
 hpoDisplays,
 hpoOnsets,
 hpoNotes,
 hpoInterpretationsCode,
} param
 */

const interpretationIcon = {
  O: ic_visibility,
  NO: ic_visibility_off,
  I: ic_help,
};

const phenotype = ({ hpoResource, form, hpoIndex }) => {
  const { getFieldDecorator } = form;
  const { Option, OptGroup } = Select;

  if (form.getFieldsValue().hposToDelete && form.getFieldsValue().hposToDelete[hpoIndex]) {
    return null;
  }

  const deleteHpo = (index) => {
    // TODO form.setFieldsValue(`hposToDelete[${index}]`, true);
  };
  return (
    <div className="phenotypeBlock">
      <div className="phenotypeFirstLine">
        <div className="leftBlock">
          <span className="hpoTitle">{getHPODisplay(hpoResource)}</span>
          <Button type="link" className="bordelessButton deleteButton" onClick={() => deleteHpo(hpoIndex)}>Supprimer</Button>
        </div>

        {getFieldDecorator(`hpoIds[${hpoIndex}]`, {
          rules: [],
          initialValue: getHPOId(hpoResource) || '',
        })(
          <Input size="small" type="hidden" />,
        )}

        {getFieldDecorator(`hposToDelete[${hpoIndex}]`, {
          rules: [],
          initialValue: getResourceToBeDeletedStatus(hpoResource) || '',
        })(
          <Input size="small" type="hidden" />,
        )}

        {getFieldDecorator(`hpoCodes[${hpoIndex}]`, {
          rules: [],
          initialValue: getHPOCode(hpoResource) || '',
        })(
          <Input size="small" type="hidden" />,
        )}

        {getFieldDecorator(`hpoDisplays[${hpoIndex}]`, {
          rules: [],
          initialValue: getHPODisplay(hpoResource) || '',
        })(
          <Input size="small" type="hidden" />,
        )}

        <div className="rightBlock">
          <Form.Item>
            {getFieldDecorator(`hpoInterpretationCodes[${hpoIndex}]`, {
              rules: [],
              initialValue: getHPOInterpretationCode(hpoResource),
            })(
              <Select className="select selectObserved" placeholder="Interpretation" size="small" dropdownClassName="selectDropdown">
                {hpoInterpretationValues().map((interpretation, index) => (
                  <Select.Option key={`hpoInterpretation_${index}`}><IconKit className={`${interpretation.iconClass} icon`} size={14} icon={interpretationIcon[interpretation.value]} />{interpretation.display}</Select.Option>
                ))}
              </Select>,
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator(`hpoOnsets[${hpoIndex}]`, {
              rules: [],
              initialValue: getHPOOnsetCode(hpoResource),
            })(
              <Select className="select selectAge" size="small" placeholder="Age d’apparition" dropdownClassName="selectDropdown">
                {
                hpoOnsetValues.map(group => (
                  <OptGroup label={group.groupLabel}>
                    {group.options.map(o => (
                      <Option value={o.value}>{o.display}</Option>
                    ))}
                  </OptGroup>
                ))
              }
              </Select>,
            )}
          </Form.Item>
        </div>
      </div>
      <div className="phenotypeSecondLine">
        <Form.Item>
          {getFieldDecorator(`hpoNotes[${hpoIndex}]`, {
            rules: [],
            initialValue: getHPONote(hpoResource),
          })(
            <Input placeholder="Ajouter une note…" size="small" className="input hpoNote" />,
          )}
        </Form.Item>
      </div>
    </div>
  );
};

class ClinicalInformation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };

    this.addFamilyHistory = this.addFamilyHistory.bind(this);
    this.deleteFamilyHistory = this.deleteFamilyHistory.bind(this);
  }

  addFamilyHistory() {
    const { form } = this.props;
    const keys = form.getFieldValue('familyHistory');
    const nextKeys = keys.concat(keys.length + 1);
    form.setFieldsValue({
      familyHistory: nextKeys,
    });
  }

  deleteFamilyHistory(index) {
    const { form } = this.props;
    const keys = form.getFieldValue('familyHistory');
    const notes = form.getFieldValue('note');
    // eslint-disable-next-line no-unused-vars
    const relation = form.getFieldValue('relation');
    notes.splice(index, 1);
    relation.splice(index, 1);
    keys.splice(index, 1);
    if (keys.length === 0) {
      return;
    }
    form.setFieldsValue({
      familyHistory: keys,
      note: notes,
      relation,
    });
  }

  render() {
    const { form, clinicalImpression } = this.props;
    const { getFieldDecorator, getFieldValue } = form;

    const { TextArea, Search } = Input;
    const { TreeNode } = Tree;

    const getRelationValues = () => ({
      father: {
        value: 'FTH',
        label: intl.get('form.patientSubmission.form.father'),
      },
      mother: {
        value: 'MTH',
        label: intl.get('form.patientSubmission.form.mother'),
      },
      brother: {
        value: 'BRO',
        label: intl.get('form.patientSubmission.form.brother'),
      },
      sister: {
        value: 'SIS',
        label: intl.get('form.patientSubmission.form.sister'),
      },
      halfBrother: {
        value: 'HBRO',
        label: intl.get('form.patientSubmission.form.halfBrother'),
      },
      halfSister: {
        value: 'HSIS',
        label: intl.get('form.patientSubmission.form.halfSister'),
      },
      identicalTwin: {
        value: 'ITWIN',
        label: intl.get('form.patientSubmission.form.identicalTwin'),
      },
      fraternalTwin: {
        value: 'FTWIN',
        label: intl.get('form.patientSubmission.form.fraternalTwin'),
      },
      daughter: {
        value: 'DAUC',
        label: intl.get('form.patientSubmission.form.daughter'),
      },
      son: {
        value: 'SONC',
        label: intl.get('form.patientSubmission.form.son'),
      },
      maternalAunt: {
        value: 'MAUNT',
        label: intl.get('form.patientSubmission.form.maternalAunt'),
      },
      paternalAunt: {
        value: 'PAUNT',
        label: intl.get('form.patientSubmission.form.paternalAunt'),
      },
      maternalUncle: {
        value: 'MUNCLE',
        label: intl.get('form.patientSubmission.form.maternalUncle'),
      },
      paternalUncle: {
        value: 'PUNCHE',
        label: intl.get('form.patientSubmission.form.paternalUncle'),
      },
      maternalCousin: {
        value: 'MCOUSIN',
        label: intl.get('form.patientSubmission.form.maternalCousin'),
      },
      paternalCousin: {
        value: 'PCOUSIN',
        label: intl.get('form.patientSubmission.form.paternalCousin'),
      },
      maternalGrandfather: {
        value: 'MGRFTH',
        label: intl.get('form.patientSubmission.form.maternalGrandfather'),
      },
      paternalGrandfather: {
        value: 'PGRFTH',
        label: intl.get('form.patientSubmission.form.paternalGrandfather'),
      },
      maternalGrandmother: {
        value: 'MGRMTH',
        label: intl.get('form.patientSubmission.form.maternalGrandmother'),
      },
      paternalGrandmother: {
        value: 'PGRMTH',
        label: intl.get('form.patientSubmission.form.paternalGrandmother'),
      },
      nephew: {
        value: 'NEPHEW',
        label: intl.get('form.patientSubmission.form.nephew'),
      },
      niece: {
        value: 'NIECE',
        label: intl.get('form.patientSubmission.form.niece'),
      },
      maternalMember: {
        value: 'MATMEM',
        label: intl.get('form.patientSubmission.form.maternalMember'),
      },
      paternalMember: {
        value: 'PATMEM',
        label: intl.get('form.patientSubmission.form.paternalMember'),
      },
    });

    const relationValues = getRelationValues();

    getFieldDecorator('familyHistory', {
      initialValue: [1],
    });
    const familyInfo = getFieldValue('familyHistory');
    const familyItems = familyInfo.map((k, index) => (
      <div className="familyLine">
        <Form.Item required={false} key={`note_${index}`}>
          {getFieldDecorator(`note[${index}]`, {
            validateTrigger: ['onChange', 'onBlur'],
            rules: [],
          })(
            <Input placeholder="Ajouter une note…" className="input noteInput note" />,
          )}
        </Form.Item>
        <Form.Item required={false} key={`relation_${index}`}>
          {getFieldDecorator(`relation[${index}]`, {
            validateTrigger: ['onChange', 'onBlur'],
            rules: [],
          })(
            <Select suffixIcon={<IconKit className="selectIcon" size={16} icon={ic_person} />} className="selectRelation" placeholder="Relation parentale" dropdownClassName="selectDropdown">
              {Object.values(relationValues).map((rv, i) => (
                <Select.Option value={rv.value} key={`relationship_${i}`}>{rv.label}</Select.Option>
              ))}
            </Select>,
          )}
        </Form.Item>
        <Button className="delButton" disabled={!(getFieldValue(`note[${index}]`)) && !(getFieldValue(`relation[${index}]`))} shape="round" onClick={() => this.deleteFamilyHistory(index)}>
          <IconKit size={20} icon={ic_remove} />
        </Button>
      </div>

    ));
    const selectedPhenotype = ['coucou'];


    let cghInterpretationValue;
    let cghNoteValue;
    let cghResource = {};
    let cghId = null;
    if (clinicalImpression) {
      cghResource = clinicalImpression.investigation[0].item.find(isCGH) || {};
      cghId = cghResource.id;
      cghInterpretationValue = getCGHInterpretationCode(cghResource);
      cghNoteValue = cghNote(cghResource);
    }

    let indicationNoteValue;
    let indicationResource;
    if (clinicalImpression) {
      indicationResource = clinicalImpression.investigation[0].item.find(isIndication) || {};
      indicationNoteValue = getIndicationNote(indicationResource);
    }

    return (
      <div>
        <Card title="Informations cliniques" bordered={false} className="staticCard patientContent">

          {getFieldDecorator('cghId', {
            rules: [],
            initialValue: cghId,
          })(
            <Input size="small" type="hidden" />,
          )}

          <Form.Item label="Type d’analyse">
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="exome"><span className="radioText">Exome</span></Radio.Button>
              <Radio.Button value="genome"><span className="radioText">Génome</span></Radio.Button>
              <Radio.Button value="sequencage"><span className="radioText">Séquençage ciblé</span></Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Card>
        <Card title="Résumé de l’investigation" bordered={false} className="staticCard patientContent">
          <Form.Item label="CGH">
            {getFieldDecorator('cghInterpretationValue', {
              rules: [],
              initialValue: cghInterpretationValue,
            })(
              <Radio.Group buttonStyle="solid">
                {CGH_VALUES().map((v, index) => (
                  <Radio.Button key={`cghValue_${index}`} value={v.value}><span className="radioText">{v.display}</span></Radio.Button>
                ))}
              </Radio.Group>,
            )}
          </Form.Item>
          {
            (form.getFieldsValue().cghInterpretationValue === CGH_CODES.A)
            && (
            <Form.Item label="Précision">
              {getFieldDecorator('cghNote', {
                rules: [],
                initialValue: cghNoteValue,
              })(
                <Input placeholder="Veuillez préciser…" className="input note" />,
              )}
            </Form.Item>
            )
          }

          <Form.Item label="Résumé">
            <TextArea className="input note" rows={4} />
            <span className="optional">Facultatif</span>
          </Form.Item>
        </Card>
        <Card title="Histoire familiale" bordered={false} className="staticCard patientContent">
          <div className="familyLines">
            {familyItems}
          </div>
          <Form.Item>
            <Button className="addFamilyButton" disabled={(!(getFieldValue('note')[getFieldValue('note').length - 1]) && !(getFieldValue('relation')[getFieldValue('relation').length - 1]))} onClick={this.addFamilyHistory}>
              <IconKit size={14} icon={ic_add} />
                Ajouter
            </Button>
          </Form.Item>
        </Card>
        <Card title="Signes cliniques" bordered={false} className="staticCard patientContent">
          <div className="separator">
            <div className="cardSeparator">
              <Form.Item className="searchInput searchInputFull">
                <Search classeName="searchInput" placeholder="Filtrer les signes par titre…" />
              </Form.Item>
              <Tree checkable selectable={false}>
                <TreeNode checkable={false} title="Eye Defects" key="0-0">
                  <TreeNode checkable={false} title="Abnormality of the optical nerve" key="0-0-0" disabled>
                    <TreeNode title="Abnormality of optic chiasm morphology" key="0-0-0-0" disableCheckbox />
                    <TreeNode title="leaf" key="0-0-0-1" />
                  </TreeNode>
                  <TreeNode checkable={false} title="parent 1-1" key="0-0-1">
                    <TreeNode title="sss" key="0-0-1-0" />
                  </TreeNode>
                </TreeNode>
              </Tree>
            </div>
            <div className="cardSeparator">
              {
                selectedPhenotype.length === 0
                  ? <p>Choisissez au moins un signe clinique depuis l’arbre de gauche afin de fournir l’information la plus complète possible sur le patient à tester.</p>
                  : mockHpoResources.map((hpoResource, hpoIndex) => phenotype({ hpoResource, form, hpoIndex }))
              }
            </div>
          </div>

        </Card>
        <Card title="Indications" bordered={false} className="staticCard patientContent">
          {getFieldDecorator('indicationId', {
            rules: [],
            initialValue: getIndicationId(indicationResource) || '',
          })(
            <Input size="small" type="hidden" />,
          )}

          <Form.Item label="Hypothèse(s) de diagnostic">
            {getFieldDecorator('indication', {
              rules: [],
              initialValue: indicationNoteValue,
            })(
              <TextArea className="input note" rows={4} />,
            )}
          </Form.Item>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  clinicalImpression: state.patientSubmission.clinicalImpression,
});

export default connect(
  mapStateToProps,
)(ClinicalInformation);
