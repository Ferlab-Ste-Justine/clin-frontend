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

class ClinicalInformation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    // eslint-disable-next-line react/prop-types
    const { form, clinicalImpression } = this.props;
    const { getFieldDecorator, getFieldValue } = form;

    const { TextArea, Search } = Input;
    const { TreeNode } = Tree;
    const { Option, OptGroup } = Select;

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
    getFieldDecorator('keys', { initialValue: [] });
    const keys = getFieldValue('keys');
    const familyItems = keys.map(k => (
      <>
        <Form.Item required={false} key={k}>
          {getFieldDecorator(`names[${k}]`, {
            validateTrigger: ['onChange', 'onBlur'],
            rules: [
              {
                required: true,
                whitespace: true,
                message: "Please input passenger's name or delete this field.",
              },
            ],
          })(
            <Input placeholder="Ajouter une note…" className="input noteInput note" />,
          )}
        </Form.Item>
        <Form.Item required={false} key={k}>
          {getFieldDecorator(`names[${k}]`, {
            validateTrigger: ['onChange', 'onBlur'],
            rules: [
              {
                required: true,
                whitespace: true,
                message: "Please input passenger's name or delete this field.",
              },
            ],
          })(
            <Select suffixIcon={<IconKit className="selectIcon" size={16} icon={ic_person} />} className="selectRelation" placeholder="Relation parental" dropdownClassName="selectDropdown">
              {Object.values(relationValues).map(rv => (
                <Select.Option value={rv.value}>{rv.label}</Select.Option>
              ))}
            </Select>,
          )}
        </Form.Item>
        <Button className="delButton" shape="round">
          <IconKit size={20} icon={ic_remove} />
        </Button>
      </>

    ));

    /*     const familyItems = (
      <div className="familyLine">
        <Form.Item>
          <Input placeholder="Ajouter une note…" className="input noteInput note" />
        </Form.Item>
        <Form.Item>
          <Select suffixIcon={<IconKit className="selectIcon" size={16} icon={ic_person} />} className="selectRelation" placeholder="Relation parental" dropdownClassName="selectDropdown">
            {Object.values(relationValues).map(rv => (
              <Select.Option value={rv.value}>{rv.label}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button className="delButton" shape="round">
            <IconKit size={20} icon={ic_remove} />
          </Button>
        </Form.Item>
      </div>
    ); */

    const selectedPhenotype = ['coucou'];
    const phenotypeItem = (
      <div className="phenotypeBlock">
        <div className="phenotypeFirstLine">
          <div className="leftBlock">
            <span className="hpoTitle">Abnormal cornea morphology</span>
            <Button type="link" className="bordelessButton deleteButton">Supprimer</Button>
          </div>
          <div className="rightBlock">
            <Form.Item>
              <Select className="select selectObserved" defaultValue="O" placeholder="Interpretation" size="small" dropdownClassName="selectDropdown">
                <Select.Option value="O"><IconKit className="observedIcon icon" size={14} icon={ic_visibility} />Observé</Select.Option>
                <Select.Option value="NO"><IconKit className="notObservedIcon icon" size={14} icon={ic_visibility_off} />Non-observé</Select.Option>
                <Select.Option value="I"><IconKit className="unknownIcon icon" size={14} icon={ic_help} />Inconu</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Select className="select selectAge" size="small" placeholder="Âge d’apparition" dropdownClassName="selectDropdown">
                <OptGroup label="Pediatric onset">
                  <Option value="Juvenile onset">Juvenile</Option>
                  <Option value="Childhood onset">Childhood</Option>
                  <Option value="Infantile onset">Infantile</Option>
                </OptGroup>
                <OptGroup label="Adult onset">
                  <Option value="YoungAdult onset">Young adult</Option>
                  <Option value="MiddleAge onset">Middle age</Option>
                  <Option value="Late onset">Late</Option>
                </OptGroup>
                <OptGroup label="Antenatal onset">
                  <Option value="Fetal onset">Fetal</Option>
                  <Option value="Embryonal onset">Embryonal</Option>
                </OptGroup>
                <OptGroup label="Neonatal onset">
                  <Option value="YoungAdult onset">Neonatal</Option>
                </OptGroup>
                <OptGroup label="Congenital onset">
                  <Option value="YoungAdult onset">Congenital</Option>
                </OptGroup>
              </Select>
            </Form.Item>
          </div>
        </div>
        <div className="phenotypeSecondLine">
          <Form.Item>
            <Input placeholder="Ajouter une note…" size="small" className="input hpoNote" />
          </Form.Item>
        </div>

      </div>

    );

    let cgh;
    if (clinicalImpression) {
      const observations = clinicalImpression.investigation[0].item;
      if (observations.length) {
        // eslint-disable-next-line prefer-destructuring
        cgh = observations[0];
      }
    }
    return (
      <div>
        <Form>
          <Card title="Informations cliniques" bordered={false} className="staticCard patientContent">

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
              {getFieldDecorator('cgh', {
                rules: [],
                initialValue: cgh ? cgh.value : undefined,
              })(
                <Radio.Group buttonStyle="solid" onChange={(e) => { console.log('CGH value changed: ', e.target.value); }}>
                  <Radio.Button value={false}><span className="radioText">Négatif</span></Radio.Button>
                  <Radio.Button value><span className="radioText">Anormal</span></Radio.Button>
                  <Radio.Button value={null}><span className="radioText">Sans objet</span></Radio.Button>
                </Radio.Group>,
              )}
            </Form.Item>
            {
              form.getFieldsValue().cgh === true
                ? (
                  <Form.Item label="Précision">
                    {getFieldDecorator('cghNote', {
                      rules: [],
                      initialValue: cgh ? cgh.note : undefined,
                    })(
                      <Input placeholder="Veuillez préciser…" className="input note" />,
                    )}
                  </Form.Item>
                ) : null
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
              <Button className="addFamilyButton">
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
                    : phenotypeItem
                }
              </div>
            </div>

          </Card>
          <Card title="Indications" bordered={false} className="staticCard patientContent">
            <Form.Item label="Hypothèse(s) de diagnostic">
              <TextArea className="input note" rows={4} />
            </Form.Item>
          </Card>
        </Form>
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
