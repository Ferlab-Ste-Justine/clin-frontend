/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import uuidv1 from 'uuid/v1';
import {
  Card, Form, Input, Button, Radio, Tree, Select, AutoComplete,
} from 'antd';
import IconKit from 'react-icons-kit';
import {
  ic_add, ic_remove, ic_help, ic_person, ic_visibility, ic_visibility_off,
} from 'react-icons-kit/md';

import {
  map,
} from 'lodash';
import {
  CGH_CODES,
  CGH_VALUES,
  isCGH,
  isHPO,
  isFamilyHistoryResource,
  isIndication,
  cghNote,
  getCGHInterpretationCode,
  getIndicationNote,
  getIndicationId,
  createHPOResource,
  createFamilyHistoryMemberResource,
  getFamilyRelationshipCode,
  getFamilyRelationshipNote,
  hpoOnsetValues,
  getResourceId,
  getHPOCode,
  getHPODisplay,
  getHPOOnsetCode,
  getHPOInterpretationCode,
  hpoInterpretationValues,
  getFamilyRelationshipValues,
} from '../../../helpers/fhir/fhir';

import {
  addHpoResource,
  setHpoResourceDeletionFlag,
  setFamilyRelationshipResourceDeletionFlag,
  addFamilyHistoryResource,
} from '../../../actions/patientSubmission';

import Api from '../../../helpers/api';

const interpretationIcon = {
  O: ic_visibility,
  NO: ic_visibility_off,
  I: ic_help,
};

const HpoHiddenFields = ({
  hpoResource,
  hpoIndex,
  getFieldDecorator,
}) => (
  <div>
    {getFieldDecorator(`hpoIds[${hpoIndex}]`, {
      rules: [],
      initialValue: getResourceId(hpoResource) || '',
    })(
      <Input size="small" type="hidden" />,
    )}

    {getFieldDecorator(`hposToDelete[${hpoIndex}]`, {
      rules: [],
      initialValue: hpoResource.toDelete,
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
  </div>
);

const FamilyRelationshipHiddenFields = ({
  resource,
  index,
  getFieldDecorator,
}) => (
  <div>
    {getFieldDecorator(`familyRelationshipIds[${index}]`, {
      rules: [],
      initialValue: getResourceId(resource) || '',
    })(
      <Input size="small" type="hidden" />,
    )}

    {getFieldDecorator(`familyRelationshipCodes[${index}]`, {
      rules: [],
      initialValue: getFamilyRelationshipCode(resource) || '',
    })(
      <Input size="small" type="hidden" />,
    )}

    {getFieldDecorator(`familyRelationshipNotes[${index}]`, {
      rules: [],
      initialValue: getFamilyRelationshipNote(resource) || '',
    })(
      <Input size="small" type="hidden" />,
    )}

    {getFieldDecorator(`familyRelationshipsToDelete[${index}]`, {
      rules: [],
      initialValue: resource.toDelete,
    })(
      <Input size="small" type="hidden" />,
    )}
  </div>
);

const phenotype = ({
  hpoResource,
  form,
  hpoIndex,
  deleteHpo,
}) => {
  const { getFieldDecorator } = form;
  const { Option, OptGroup } = Select;

  return hpoResource.toDelete ? (<HpoHiddenFields hpoResource={hpoResource} hpoIndex={hpoIndex} getFieldDecorator={getFieldDecorator} />) : (
    <div className="phenotypeBlock">
      <div className="phenotypeFirstLine">
        <div className="leftBlock">
          <span className="hpoTitle">{getHPODisplay(hpoResource)}</span>
          <Button type="link" className="bordelessButton deleteButton" onClick={() => deleteHpo(getHPOCode(hpoResource))}>Supprimer</Button>
        </div>
        <HpoHiddenFields hpoResource={hpoResource} form={form} hpoIndex={hpoIndex} deleteHpo={deleteHpo} getFieldDecorator={getFieldDecorator} />
        <div className="rightBlock">
          <Form.Item>
            {getFieldDecorator(`hpoInterpretation[${hpoIndex}]`, {
              rules: [],
              initialValue: getHPOInterpretationCode(hpoResource),
            })(
              <Select className="select selectObserved" placeholder="Interpretation" size="small" dropdownClassName="selectDropdown">
                {hpoInterpretationValues().map((interpretation, index) => (
                  <Select.Option
                    key={`hpoInterpretation_${index}`}
                  >
                    <IconKit className={`${interpretation.iconClass} icon`} size={14} icon={interpretationIcon[interpretation.value]} />
                    {interpretation.display}
                  </Select.Option>
                ))}
              </Select>,
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator(`hpoOnset[${hpoIndex}]`, {
              rules: [],
              initialValue: getHPOOnsetCode(hpoResource),
            })(
              <Select className="select selectAge" size="small" placeholder="Âge d’apparition" dropdownClassName="selectDropdown">
                {
                hpoOnsetValues.map((group, gIndex) => (
                  <OptGroup label={group.groupLabel} key={`onsetGroup_${gIndex}`}>
                    {group.options.map((o, oIndex) => (
                      <Option value={o.value} key={`onsetOption_${oIndex}`}>{o.display}</Option>
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
        {/*  TODO initalValue */}
        <Form.Item>
          {getFieldDecorator(`hpoNote[${hpoIndex}]`, {
            rules: [],
          })(
            <Input placeholder="Ajouter une note…" size="small" className="input hpoNote" />,
          )}

        </Form.Item>
      </div>
    </div>
  );
};

const INITIAL_TREE_ROOTS = [
  { key: 'HP:0001197', title: 'Anomalie du développement prénatal ou de la naissance', is_leaf: false },
  { key: 'HP:0001507', title: 'Anomalie de la croissance', is_Leaf: false },
  { key: 'HP:0000478', title: 'Anomalie oculaire', is_leaf: false },
  { key: 'HP:0001574', title: 'Anomalie de l\'oreille', is_leaf: false },
  { key: 'HP:0012519', title: 'Anomalie des téguments', is_leaf: false },
  { key: 'HP:0001626', title: 'Anomalie du système cardiovasculaire', is_leaf: false },
  { key: 'HP:0002086', title: 'Anomalie du système respiratoire', is_leaf: false },
  { key: 'HP:0000924', title: 'Anomalie du système musculo-squelettique', is_leaf: false },
  { key: 'HP:0003011', title: 'Anomalie de la musculature', is_leaf: false },
  { key: 'HP:0000119', title: 'Anomalie génito-urinaire', is_leaf: false },
  { key: 'HP:0025031', title: 'Anomalie du système digestif', is_leaf: false },
  { key: 'HP:0000152', title: 'Anomalie tête et cou', is_leaf: false },
  { key: 'HP:0000707', title: 'Anomalie du système nerveux', is_leaf: false },
];

class ClinicalInformation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hpoOptions: [],
      treeData: INITIAL_TREE_ROOTS,
    };

    const { treeData } = this.state;
    this.loadedHpoTreeNodes = treeData.reduce((acc, value) => { acc[value.key] = true; return acc; }, {});
    this.onLoadHpoChildren = this.onLoadHpoChildren.bind(this);
    this.addFamilyHistory = this.addFamilyHistory.bind(this);
    this.deleteFamilyHistory = this.deleteFamilyHistory.bind(this);
    this.handleHpoSearchTermChanged = this.handleHpoSearchTermChanged.bind(this);
    this.handleHpoOptionSelected = this.handleHpoOptionSelected.bind(this);
    this.handleHpoDeleted = this.handleHpoDeleted.bind(this);
    this.handleHpoNodesChecked = this.handleHpoNodesChecked.bind(this);
    this.hpoSelected = this.hpoSelected.bind(this);
  }

  onLoadHpoChildren(treeNode) {
    return new Promise((resolve) => {
      const { treeData } = this.state;
      const { dataRef } = treeNode.props;
      const { key } = dataRef;

      if (treeNode.props.children) {
        resolve();
        return;
      }

      Api.searchHpoChildren(key).then((response) => {
        if (response.payload) {
          const { data } = response.payload.data;
          const { hits } = data;
          const results = map(hits, '_source')
            .map(r => ({ title: r.name, key: r.id, checkable: true }))
            .map(r => ({ ...r, checked: true }));

          treeNode.props.dataRef.children = results;

          results.forEach((r) => { this.loadedHpoTreeNodes[r.key] = true; });

          this.setState({
            treeData: [...treeData],
          });
          resolve();
        }
      });
    });
  }

  addFamilyHistory() {
    const familyHistoryResource = createFamilyHistoryMemberResource({ code: '', node: '', display: '' });
    const { actions } = this.props;
    actions.addFamilyHistoryResource(familyHistoryResource);
  }

  deleteFamilyHistory({ code, id }) {
    const { actions } = this.props;

    actions.setFamilyRelationshipResourceDeletionFlag({ code, id, toDelete: true });
  }

  handleHpoSearchTermChanged(term) {
    Api.searchHpos(term.toLowerCase().trim()).then((response) => {
      if (response.payload) {
        const { data } = response.payload.data;
        const { hits } = data;
        const results = map(hits, '_source');

        this.setState({
          hpoOptions: results,
        });
      }
    });
  }

  hpoSelected({ code, display }) {
    const { actions } = this.props;
    const hpoResource = createHPOResource({
      hpoCode: {
        code,
        display,
      },
    });

    actions.addHpoResource(hpoResource);
  }

  handleHpoNodesChecked(_, info) {
    const { actions, clinicalImpression } = this.props;

    const checkedNodes = info.checkedNodes.map(n => ({ code: n.key, display: n.props.title }));
    const hpoResources = clinicalImpression.investigation[0].item.filter(isHPO);

    // If in resources: make sure it is not marked as toDelete
    const nodesPresent = checkedNodes
      .filter(n => !!hpoResources.find(r => n.code === getHPOCode(r)));
    nodesPresent.forEach((n) => {
      actions.setHpoResourceDeletionFlag({ code: n.code, toDelete: false });
    });

    // If not in resources: add it
    const nodesToAdd = checkedNodes
      .filter(n => !hpoResources.find(r => n.code === getHPOCode(r)));
    nodesToAdd.forEach(this.hpoSelected);
  }

  handleHpoOptionSelected(value) {
    const { hpoOptions } = this.state;
    const option = hpoOptions.find(h => h.name === value);

    this.hpoSelected({ code: option.key, display: option.name });
  }

  handleHpoDeleted(hpoId) {
    const { actions } = this.props;
    actions.setHpoResourceDeletionFlag({ code: hpoId, toDelete: true });
  }

  renderTreeNodes(data) {
    return data.map((item) => {
      const { TreeNode } = Tree;
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} {...item} dataRef={item} />;
    });
  }

  render() {
    const { hpoOptions, treeData } = this.state;

    const hpoOptionsLabels = map(hpoOptions, 'name');
    const { form, clinicalImpression } = this.props;
    const { getFieldDecorator, getFieldValue } = form;

    const { TextArea } = Input;

    const relationshipPossibleValues = getFamilyRelationshipValues();
    const familyHistoryResources = clinicalImpression.investigation[0].item.filter(isFamilyHistoryResource) || [];
    const familyItems = familyHistoryResources.map((resource, index) => (resource.toDelete
      ? <FamilyRelationshipHiddenFields getFieldDecorator={getFieldDecorator} index={index} resource={resource} key={uuidv1()} />
      : (
        <div className="familyLine">
          {getFieldDecorator(`familyRelationshipIds[${index}]`, {
            rules: [],
            initialValue: getResourceId(resource) || '',
          })(
            <Input size="small" type="hidden" />,
          )}

          {getFieldDecorator(`familyRelationshipsToDelete[${index}]`, {
            rules: [],
            initialValue: resource.toDelete,
          })(
            <Input size="small" type="hidden" />,
          )}

          <Form.Item required={false} key={`familyHistoryNote_${getFamilyRelationshipCode(resource)}`}>
            {getFieldDecorator(`familyRelationshipNotes[${index}]`, {
              validateTrigger: ['onChange', 'onBlur'],
              initialValue: getFamilyRelationshipNote(resource),
              rules: [],
            })(
              <Input placeholder="Ajouter une note…" className="input noteInput note" />,
            )}
          </Form.Item>
          <Form.Item required={false} key={`familyRelation_${getFamilyRelationshipCode(resource)}`}>
            {getFieldDecorator(`familyRelationshipCodes[${index}]`, {
              validateTrigger: ['onChange', 'onBlur'],
              initialValue: getFamilyRelationshipCode(resource),
              rules: [],
            })(
              <Select suffixIcon={<IconKit className="selectIcon" size={16} icon={ic_person} />} className="selectRelation" placeholder="Relation parentale" dropdownClassName="selectDropdown">
                {Object.values(relationshipPossibleValues).map(rv => (
                  <Select.Option value={rv.value} key={`relationship_${rv.value}`}>{rv.label}</Select.Option>
                ))}
              </Select>,
            )}
          </Form.Item>
          <Button
            className="delButton"
            disabled={!(getFieldValue(`familyRelationshipNotes[${index}]`)) || !(getFieldValue(`familyRelationshipCodes[${index}]`)) || familyHistoryResources.length === 1}
            shape="round"
            onClick={() => this.deleteFamilyHistory({ code: getFamilyRelationshipCode(resource), id: getResourceId(resource) })}
          >
            <IconKit size={20} icon={ic_remove} />
          </Button>
        </div>
      )));

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

    const hpoResources = clinicalImpression.investigation[0].item.filter(isHPO) || [];
    const hpoCodes = hpoResources.filter(r => !r.toDelete).map(getHPOCode);

    return (
      <div>
        <Card title="Informations cliniques" bordered={false} className="staticCard patientContent">
          {getFieldDecorator('cghId', {
            rules: [],
            initialValue: cghId,
          })(
            <Input size="small" type="hidden" />,
          )}

          {/* TODO initialValue */}
          <Form.Item label="Type d’analyse">
            {getFieldDecorator('analyse', {
              rules: [],
            })(
              <Radio.Group buttonStyle="solid">
                <Radio.Button value="exome"><span className="radioText">Exome</span></Radio.Button>
                <Radio.Button value="genome"><span className="radioText">Génome</span></Radio.Button>
                <Radio.Button value="sequencage"><span className="radioText">Séquençage ciblé</span></Radio.Button>
              </Radio.Group>,
            )}
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
            /* TODO initalValue */
            (form.getFieldsValue().cghInterpretationValue === CGH_CODES.A)
            && (
            <Form.Item label="Précision">
              {getFieldDecorator('cghPrecision', {
                rules: [],
              })(
                <Input placeholder="Veuillez préciser…" className="input note" />,
              )}
            </Form.Item>
            )
          }

          <Form.Item label="Résumé">
            {getFieldDecorator('cghNote', {
              rules: [],
              initialValue: cghNoteValue,
            })(
              <TextArea className="input note" rows={4} />,
            )}
            <span className="optional">Facultatif</span>
          </Form.Item>
        </Card>
        <Card title="Histoire familiale" bordered={false} className="staticCard patientContent">
          <div className="familyLines">
            {familyItems}
          </div>
          <Form.Item>
            {/* <Button className="addFamilyButton" disabled={(!(getFieldValue('note')[getFieldValue('note').length - 1]) && !(getFieldValue('relation')[getFieldValue('relation').length - 1]))} onClick={this.addFamilyHistory}> */}
            <Button className="addFamilyButton" disabled={false} onClick={this.addFamilyHistory}>
              <IconKit size={14} icon={ic_add} />
                Ajouter
            </Button>
          </Form.Item>
        </Card>
        <Card title="Signes cliniques" bordered={false} className="staticCard patientContent">
          <div className="separator">
            <div className="cardSeparator">
              <Form.Item className="searchInput searchInputFull">
                <AutoComplete
                  classeName="searchInput"
                  placeholder="Chercher un signe clinique ..."
                  dataSource={hpoOptionsLabels}
                  onSelect={this.handleHpoOptionSelected}
                  onChange={this.handleHpoSearchTermChanged}
                />

              </Form.Item>
              <Tree
                loadData={this.onLoadHpoChildren}
                checkStrictly
                checkable
                checkedKeys={hpoCodes}
                onCheck={this.handleHpoNodesChecked}
              >
                {this.renderTreeNodes(treeData)}
              </Tree>
            </div>
            <div className="cardSeparator">
              {
                hpoResources.length === 0
                  ? <p>Choisissez au moins un signe clinique depuis l’arbre de gauche afin de fournir l’information la plus complète possible sur le patient à tester.</p>
                  : hpoResources.map((hpoResource, hpoIndex) => phenotype({
                    hpoResource,
                    form,
                    hpoIndex,
                    deleteHpo: this.handleHpoDeleted,
                  }))
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

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    addHpoResource,
    setHpoResourceDeletionFlag,
    setFamilyRelationshipResourceDeletionFlag,
    addFamilyHistoryResource,
  }, dispatch),
});

const mapStateToProps = state => ({
  clinicalImpression: state.patientSubmission.clinicalImpression,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClinicalInformation);
