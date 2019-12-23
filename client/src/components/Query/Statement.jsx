/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Menu, Button, Checkbox, Tooltip, Badge, Dropdown, Icon, Modal, Row, Col, Divider, Select, Input, Collapse
} from 'antd';
const { Option } = Select;
import {
  cloneDeep, find, findIndex, pull, pullAllBy, filter, isEmpty, isEqual, every,
} from 'lodash';
import uuidv1 from 'uuid/v1';
import DragSortableList from 'react-drag-sortable';
import IconKit from 'react-icons-kit';
import {
  software_pathfinder_intersect, software_pathfinder_unite, software_pathfinder_subtract,
} from 'react-icons-kit/linea';
import {
  ic_folder, ic_delete, ic_content_copy, ic_save, ic_note_add, ic_share, ic_unfold_more
} from 'react-icons-kit/md';
import Query from './index';
import {
  INSTRUCTION_TYPE_SUBQUERY, SUBQUERY_TYPE_INTERSECT, SUBQUERY_TYPE_UNITE, SUBQUERY_TYPE_SUBTRACT, createSubquery,
} from './Subquery';
import { createOperator } from './Operator';

import'./statement.scss';
import styleStatement from './statement.module.scss';

export const convertIndexToLetter = index => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(index);

export const convertIndexToColor = index => `#${[
  'bbeaff', 'ffbe9d', 'f3c0d4', 'c8ffc7', 'fff3b1', 'd3d9e7', 'dcb1b2', 'fcd2d3',
  'c3f3e7', 'ffd694', 'fbe9e9', 'ff9fa2', 'e0c1cd', 'eaceb4', 'b4e6ea',
][index]}`;

class Statement extends React.Component {
  constructor(props) {
    super(props);
    const { data, display, original, currentStatement } = props;
    this.state = {
      original: cloneDeep(original),
      checkedQueries: [],
      queriesChecksAreIndeterminate: false,
      queriesAreAllChecked: false,
      display: cloneDeep(data).map(() => ({ ...display })),
      visible: false,
      expandIconPosition: 'left',
      statementTitle: '',
      saveTitleModalInputValue: '',
      saveTitleModalVisible: false,
      options: {
        copyable: null,
        duplicatable: null,
        editable: null,
        removable: null,
        reorderable: null,
        selectable: null,
        undoable: null,
      },
      selectIsOpen:false,
    };
    this.isCopyable = this.isCopyable.bind(this);
    this.isEditable = this.isEditable.bind(this);
    this.isDuplicatable = this.isDuplicatable.bind(this);
    this.isRemovable = this.isRemovable.bind(this);
    this.isReorderable = this.isReorderable.bind(this);
    this.isSelectable = this.isSelectable.bind(this);
    this.isUndoable = this.isUndoable.bind(this);
    this.handleCopy = this.handleCopy.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDisplay = this.handleDisplay.bind(this);
    this.handleDuplicate = this.handleDuplicate.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.confirmRemoveChecked = this.confirmRemoveChecked.bind(this);
    this.confirmRemove = this.confirmRemove.bind(this);
    this.getSubqueryKeys = this.getSubqueryKeys.bind(this);
    this.showDeleteConfirm = this.showDeleteConfirm.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleReorder = this.handleReorder.bind(this);
    this.handleUndo = this.handleUndo.bind(this);
    this.handleCheckQuery = this.handleCheckQuery.bind(this);
    this.handleCheckAllQueries = this.handleCheckAllQueries.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleRemoveChecked = this.handleRemoveChecked.bind(this);
    this.handleNewQuery = this.handleNewQuery.bind(this);
    this.handleCombine = this.handleCombine.bind(this);
    this.findQueryIndexForKey = this.findQueryIndexForKey.bind(this);
    this.findQueryTitle = this.findQueryTitle.bind(this)
    this.getStatements = this.getStatements.bind(this);
    this.onModalSaveTitleInputChange = this.onModalSaveTitleInputChange.bind(this);
    this.createStatement = this.createStatement.bind(this);
    this.duplicateStatement = this.duplicateStatement.bind(this);
    this.updateStatement = this.updateStatement.bind(this);
    this.setStatementAsDefault = this.setStatementAsDefault.bind(this);
    this.deleteStatement = this.deleteStatement.bind(this);
    this.selectStatement = this.selectStatement.bind(this);
    this.onPositionChange = this.onPositionChange.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onFocus=this.onFocus.bind(this)
    this.onBlur=this.onBlur.bind(this)
    this.handleCancelModal = this.handleCancelModal(this);

  }

  isCopyable() {
    const { options } = this.props;
    const { copyable } = options;
    return copyable === true;
  }

  isDuplicatable() {
    const { options } = this.props;
    const { duplicatable } = options;
    return duplicatable === true;
  }

  isEditable() {
    const { options } = this.props;
    const { editable } = options;
    return editable === true;
  }

  isRemovable() {
    const { options } = this.props;
    const { removable } = options;
    return removable === true;
  }

  isReorderable() {
    const { options } = this.props;
    const { reorderable } = options;
    return reorderable === true;
  }

  isSelectable() {
    const { options } = this.props;
    const { selectable } = options;
    return selectable === true;
  }

  isUndoable() {
    const { options } = this.props;
    const { undoable } = options;
    return undoable === true;
  }

  handleCopy() {
    if (this.isCopyable()) {
      return true;
    }
  }

  handleClick(key) {
    const { activeQuery, onSelectCallback } = this.props;
    const isActive = activeQuery === key;
    if (!isActive) {
      onSelectCallback(key);
    }
  }

  handleEdit(query) {
    if (this.isEditable()) {
      const { onEditCallback } = this.props;
      onEditCallback(query);
    }
  }

  handleDisplay(config) {
    const { display } = this.state;
    const updatedDisplayList = [
      ...display,
    ];
    updatedDisplayList[config.index] = config.display;
    this.setState({
      display: updatedDisplayList,
    });
  }

  handleDuplicate(query) {
    if (this.isDuplicatable()) {
      const { onDuplicateCallback } = this.props;
      const { display } = this.state;
      const index = query.index + 1;
      const clone = cloneDeep(query);
      clone.data.key = uuidv1();
      const displayClone = cloneDeep(display);
      const howDisplayed = this.state.display[query.index];
      displayClone.splice(index, 0, howDisplayed);
      this.setState({
        display: displayClone,
      }, () => {
        onDuplicateCallback(clone, index);
      });
    }
  }

  handleRemove(key) {
    if (this.isRemovable()) {
      const subqueryKeys = this.getSubqueryKeys([key]);
      if (!isEmpty(subqueryKeys)) {
        const subqueryKeysToDelete = [
          ...subqueryKeys,
          key
        ];
        this.showDeleteConfirm(subqueryKeysToDelete);
      } else {
        this.confirmRemove([key]);
      }
    }
  }

  getStatements() {
    this.props.onGetStatementsCallback();
  }
  createStatement() {
    this.setState({
        saveTitleModalVisible: true
    })
  }

  duplicateStatement(e) {
    let id =  e.target ? e.target.getAttribute('dataid') : e
    if (!id) {
      const { activeStatementId } = this.props;
      id = activeStatementId
    }

    if (e.stopPropagation) { e.stopPropagation(); }
    this.props.onDuplicateStatementCallback(id);
  }

  updateStatement(e) {
    let id =  e.target ? e.target.getAttribute('dataid') : e
    if (!id) {
      const { activeStatementId } = this.props;
      id = activeStatementId
    }

    this.props.onUpdateStatementCallback(id, this.state.statementTitle, false);
  }

  setStatementAsDefault(e) {
    let id =  e.target ? e.target.getAttribute('dataid') : e
    if (!id) {
      const { activeStatementId } = this.props;
      id = activeStatementId
    }

    this.props.onUpdateStatementCallback(id, this.state.statementTitle, true);
  }

  deleteStatement(e) {
    let id =  e.target ? e.target.getAttribute('dataid') : e
    if (!id) {
      const { activeStatementId } = this.props;
      id = activeStatementId
    }

    if (e.stopPropagation) { e.stopPropagation(); }
    this.props.onDeleteStatementCallback(id);
  }

  selectStatement(e) {
    let id =  e.target ? e.target.getAttribute('dataid') : e
    if (!id) {
      const { activeStatementId } = this.props;
      id = activeStatementId
    }

    this.props.onSelectStatementCallback(id);
  }

  confirmRemove(keys) {
    this.props.onRemoveCallback(keys);
  }

  handleReorder(sorted) {
    if (this.isReorderable() && !isEmpty(sorted)) {
      const { display } = this.state;
      const { onSortCallback, data } = this.props;
      const sortedIndices = sorted.map(clip => clip.index);
      const sortedData = sortedIndices.map(sortedIndice => data[sortedIndice]);
      const sortedDisplay = sortedIndices.map(sortedIndice => display[sortedIndice]);
      this.setState({
        display: sortedDisplay,
      }, () => {
        onSortCallback(sortedData)
      });
    }
  }

  handleSelect(item) {
    if (this.isSelectable()) {
      return true;
    }
  }

  handleUndo() {
    if (this.isUndoable()) {
      this.props.onDraftHistoryUndoCallback();
    }
  }

  handleCheckQuery(e) {
    const { data } = this.props;
    const { checkedQueries } = this.state;
    const { target } = e;
    const { value, checked } = target;
    if (!checked) {
      pull(checkedQueries, value);
    } else {
      if (checkedQueries.indexOf(value) !== -1) {
        return;
      }
      checkedQueries.push(value);
    }
    const queriesCount = data.length;
    const checkedQueriesCount = checkedQueries.length;
    const queriesAreAllChecked = (queriesCount === checkedQueriesCount);
    this.setState({
      checkedQueries,
      queriesAreAllChecked,
      queriesChecksAreIndeterminate: (!queriesAreAllChecked && checkedQueriesCount > 0),
    });
  }

  handleCombine({ key }) {
    const { data } = this.props;

    const { checkedQueries, display } = this.state;
    const defaultDisplay = cloneDeep(this.props.display);
    display.push(defaultDisplay);

    if (checkedQueries.length > 1) {
      const { onBatchEditCallback } = this.props;
      const sortedCheckedQueries = cloneDeep(checkedQueries);
      sortedCheckedQueries.sort((a, b) => this.findQueryIndexForKey(a) - this.findQueryIndexForKey(b));
      const instructions = sortedCheckedQueries.reduce((accumulator, query) => {
        const subquery = createSubquery(key, query);
        const operator = createOperator(key);
        return [...accumulator, subquery, operator];
      }, []);

      instructions.pop();
      const newSubquery = {
        key: uuidv1(),
        instructions,
      };
      const newDraft = [
        ...data,
        newSubquery
      ]
      this.setState({
        checkedQueries: [],
        display,
      }, () => {
        onBatchEditCallback(newDraft, newSubquery);
      });
    }
  }

  handleCheckAllQueries(e) {
    const { target } = e;
    const { checked } = target;
    if (!checked) {
      this.setState({
        checkedQueries: [],
        queriesChecksAreIndeterminate: false,
        queriesAreAllChecked: false,
      });
    } else {
      const { data } = this.props;
      const checkedQueries = data.reduce((accumulator, query) => [...accumulator, query.key], []);
      this.setState({
        checkedQueries,
        queriesChecksAreIndeterminate: false,
        queriesAreAllChecked: true,
      });
    }
  }

  getSubqueryKeys(keysToSearchFor) {
    const { data } = this.props;
    const subqueryKeys = data.filter(({ instructions }) => {
      return Boolean(instructions.find((i) => {
        return i.type === INSTRUCTION_TYPE_SUBQUERY && keysToSearchFor.indexOf(i.data.query) !== -1;
      }))
    }).map(({ key }) => key);
    return subqueryKeys;
  }

  handleRemoveChecked() {
    if (this.isRemovable()) {
      const { checkedQueries } = this.state;
      const subqueryKeys = this.getSubqueryKeys(checkedQueries);
      if (!isEmpty(subqueryKeys)) {
        const subqueryKeysToDelete = [
          ...subqueryKeys,
          ...checkedQueries
        ];
        this.showDeleteConfirm(subqueryKeysToDelete);
      } else {
        this.confirmRemoveChecked();
      }
    }
  }

  showDeleteConfirm(keys) {
    const { confirm } = Modal;
    const { intl } = this.props;
    const modalTitle = intl.formatMessage({ id: 'screen.patientvariant.statement.modal.title' });
    const modalContent = intl.formatMessage({ id: 'screen.patientvariant.statement.modal.content' });
    const modalOk = intl.formatMessage({ id: 'screen.patientvariant.statement.modal.ok' });
    const modalCancel = intl.formatMessage({ id: 'screen.patientvariant.statement.modal.cancel' });
    confirm({
      title: modalTitle,
      content: modalContent,
      okText: modalOk,
      okType: 'danger',
      cancelText: modalCancel,
      onOk: () => {
        this.confirmRemove(keys);
      },
    });
  }


  handleCancelModal() {
    this.setState({
      saveTitleModalVisible : false,
      //saveTitleModalConfirmLoading: false,
    });
  };

  confirmRemoveChecked() {
    const { checkedQueries } = this.state;
    const { onRemoveCallback } = this.props;
    const keysToRemove = checkedQueries.reduce((accumulator, key) => [...accumulator, key], []);
    this.setState({
      checkedQueries: [],
      queriesChecksAreIndeterminate: false,
      queriesAreAllChecked: false,
    }, () => {
      onRemoveCallback(keysToRemove);
    });
  }

  handleNewQuery() {
    const { onEditCallback } = this.props;
    const { display } = this.state;
    const newQuery = {
      key: uuidv1(),
      instructions: []
    };
    const newDisplay = cloneDeep(this.props.display);
    display.push(newDisplay);
    this.setState({
      display,
    }, () => {
      onEditCallback(newQuery)
    });
  }

  findQueryIndexForKey(key) {
    const { data } = this.props;
    return findIndex(data, { key });
  }

  findQueryTitle(key) {
    const { data } = this.props;
    return find(data, { key }).title;
  }

  onPositionChange(expandIconPosition) {
    this.setState({ expandIconPosition });
  };

  onChange(e) {
    const { value } = e.target;
    this.setState({statementTitle:value})
    console.log(value)
    const length =value.length -( value.length *0.2)
    e.target.style.width = length + "ch";
  }

  onFocus() {
   this.setState({ selectIsOpen:true });
  }
  onBlur() {
   this.setState({ selectIsOpen:false });
  }

  onModalSaveTitleInputChange(e) {
    const { value } = e.target;
    this.setState({saveTitleModalInputValue:value})
  }

  render() {
    const { activeQuery, data, externalData, options, intl, facets, matches, categories,
      searchData, target, activeStatementId, statements } = this.props;
    const foundActiveStatement = statements.find(statement => statement._id === activeStatementId)
    const activeStatement = foundActiveStatement ? foundActiveStatement._source : {}
    const statementTitle = activeStatement.title ? activeStatement.title : ""
    const { Panel } = Collapse;
    const { Option } = Select;

    const { expandIconPosition, selectIsOpen, titleWidth } = this.state;
    if (!data) return null;
    const { display, original, checkedQueries, queriesChecksAreIndeterminate, queriesAreAllChecked,
      saveTitleModalVisible, saveTitleModalConfirmLoading,
    } = this.state;
    const {
      editable, reorderable, removable, duplicatable,
    } = options;

    const checkedQueriesCount = checkedQueries.length;
    const newText = intl.formatMessage({ id: 'screen.patientvariant.statement.new' });
    const saveText = intl.formatMessage({ id: 'screen.patientvariant.statement.save' });
    const combineText = intl.formatMessage({ id: 'screen.patientvariant.statement.combine' });
    const deleteText = intl.formatMessage({ id: 'screen.patientvariant.statement.delete' });
    const newQueryText = intl.formatMessage({ id: 'screen.patientvariant.statement.newQuery' });
    const combineAnd = intl.formatMessage({ id: 'screen.patientvariant.statement.and' });
    const combineOr = intl.formatMessage({ id: 'screen.patientvariant.statement.or' });
    const combineAndNot = intl.formatMessage({ id: 'screen.patientvariant.statement.andnot' });
    const combineSelectionToolTip = intl.formatMessage({ id: 'screen.patientvariant.statement.tooltip.combineSelection' });;
    const duplicateText = intl.formatMessage({ id: 'screen.patientvariant.query.menu.duplicate' });

    const modalTitleSaveTitle = intl.formatMessage({ id: 'screen.patientvariant.statementTitleSave.modal.title' });
    const modalTitleSaveContent = intl.formatMessage({ id: 'screen.patientvariant.statementTitleSave.modal.content' });
    const modalTitleSaveInputLabel = intl.formatMessage({ id: 'screen.patientvariant.statementTitleSave.modal.inputLabel' });
    const modalTitleSaveInputPlaceHolder = intl.formatMessage({ id: 'screen.patientvariant.statementTitleSave.modal.inputPlaceHolder' });
    const modalTitleSaveInputDefault = intl.formatMessage({ id: 'screen.patientvariant.statementTitleSave.modal.inputDefault' });
    const modalTitleSaveOk = intl.formatMessage({ id: 'screen.patientvariant.statementTitleSave.modal.ok' });
    const modalTitleSaveCancel = intl.formatMessage({ id: 'screen.patientvariant.statementTitleSave.modal.cancel' });

    let activeStatementCanBeSaved = false;
    const queries = data.reduce((accumulator, query, index) => {
      const isChecked = checkedQueries.indexOf(query.key) !== -1;
      const isActive = activeQuery === query.key;
      const initial = find(original, { key: query.key }) || null;
      const classNames = [styleStatement.queryContainer];
      const isDirty = !isEqual(initial, query);

      if (isDirty) { classNames.push(styleStatement.dirtyContainer); activeStatementCanBeSaved = true; }
      if (isActive) { classNames.push(styleStatement.activeContainer) } else { classNames.push(styleStatement.inactiveContainer) }
      if (!query.title) {
        query.title = `Requête ${(index+1)}`;
      }

      return [...accumulator, (
        <div className={classNames.join(' ')} key={query.key}>
          <Checkbox
            className={styleStatement.querySelector}
            key={`selector-${query.key}`}
            value={query.key}
            checked={isChecked}
            onChange={this.handleCheckQuery}
          />
          <Query
            key={query.key}
            original={initial}
            draft={query}
            display={display[index]}
            options={options}
            index={index}
            active={isActive}
            results={(matches[query.key] ? matches[query.key] : 0)}
            intl={intl}
            facets={(facets[query.key] ? facets[query.key] : {})}
            target={target}
            categories= {categories}
            onCopyCallback={this.handleCopy}
            onEditCallback={this.handleEdit}
            onDisplayCallback={this.handleDisplay}
            onDuplicateCallback={this.handleDuplicate}
            onRemoveCallback={this.handleRemove}
            onSelectCallback={this.handleSelect}
            onUndoCallback={this.handleUndo}
            onClickCallback={this.handleClick}
            findQueryIndexForKey={this.findQueryIndexForKey}
            findQueryTitle={this.findQueryTitle}
            searchData={searchData}
            externalData={externalData}
          />
        </div>
      )];
    }, []);

    // antd Modal have a strange binding with their button
    // need to declare them here
    const handleSaveTitleModalCancel = () => {
      this.setState({
        saveTitleModalVisible: false
      })
    };

    const handleSaveTitleModalOk = () => {
        const newStatement = {
            description: this.state.saveTitleModalInputValue,
            title: this.state.saveTitleModalInputValue,
            queries : [{
                key: uuidv1(),
                instructions: []
            }]
        };
        this.setState({
            saveTitleModalVisible: false
        }, this.props.onCreateStatementCallback(newStatement))
    };

    const activeStatementIsEmpty = every(data, (datum) => { return datum.instructions.length === 0 } )
    const activeStatementCanBeDeleted = !data.lastUpdatedOn;
    if (activeStatementIsEmpty) {
      activeStatementCanBeSaved = false;
    }

    return (
      <div className={styleStatement.statement}>
        <Modal
            title={modalTitleSaveTitle}
            okText={modalTitleSaveOk}
            cancelText={modalTitleSaveCancel}
            visible={saveTitleModalVisible}
            onCancel={handleSaveTitleModalCancel}
            onOk={handleSaveTitleModalOk}
            zIndex={99999}

        >
          <h2>{modalTitleSaveContent}</h2>
          {modalTitleSaveInputLabel}<br/>
          <Input
              placeholder={modalTitleSaveInputPlaceHolder}
              onChange={this.onModalSaveTitleInputChange}
              defaultValue={modalTitleSaveInputDefault}
          />

        </Modal>
        <div className={styleStatement.header}>
          <Row type="flex" className={styleStatement.toolbar}>
            <div className={styleStatement.navigation}>
              <div>
                <Input
                    id="statementTitle"
                    placeHolder={statementTitle}
                    onChange={this.onChange}
                    autocomplete="off"
                    addonBefore={(
                        <Button
                            type="default"
                        >
                            <IconKit size={24} icon={ic_unfold_more} />
                        </Button>
                    )}
                    addonAfter={(
                        <div>
                          <Button
                              type="default"
                              onClick={this.setStatementAsDefault}
                            >
                            <Icon
                                className={activeStatement.isDefault ? `${styleStatement.starFilled} ${styleStatement.star}` : `${styleStatement.star}`}
                                type="star"
                                theme={activeStatement.isDefault ? 'filled' : 'outlined'}
                            />
                          </Button>
                        </div>
                    )}
                />
                <div>
                  <Button
                      type="default"
                      disabled={activeStatementIsEmpty}
                      onClick={this.createStatement}
                  >
                    <IconKit size={20} icon={ic_note_add} />
                    {newText}
                  </Button>
                  <Button
                      type="default"
                      disabled={!activeStatementCanBeSaved}
                      onClick={this.updateStatement}
                  >
                     <IconKit size={20} icon={ic_save} />
                    {saveText}
                  </Button>
                  <Button
                      type="disabled"
                      disabled={true} // @TODO
                      onClick={this.duplicateStatement}
                  >
                    <IconKit size={20} icon={ic_content_copy} />
                    {duplicateText}
                  </Button>
                  <Button
                      type="default"
                      disabled={!activeStatementCanBeDeleted}
                      onClick={this.deleteStatement}
                  >
                    <IconKit size={20} icon={ic_delete} />
                    {deleteText}
                  </Button>
                  <Divider type="vertical" className={styleStatement.divider}/>
                  <Button
                    type="disabled"
                    disabled={true} // @TODO
                  >
                        <IconKit size={20} icon={ic_share} />
                  </Button>
                  <Divider type="vertical" className={styleStatement.divider} />
                  <Button
                      type="default"
                  >
                    <IconKit className={selectIsOpen ? styleStatement.openSelect : null}size={20} icon={ic_folder} />
                  </Button>

                  <Select
                    key="statement-list"
                      placeholder="Mes filtres"
                      style={{ width: 250 }}
                      onChange={this.selectStatement}
                      onFocus={this.onFocus}
                      onBlur={this.onBlur}
                    >
                    { statements.map(statementOptions => {
                      return (
                          <Option value={statementOptions._id}>
                            {statementOptions._source.isDefault && (<Icon
                              type="star"
                              theme="filled"
                              style={{ marginRight: 10 }}
                            />)}
                            {statementOptions._source.title}
                            <IconKit size={20}
                              icon={ic_content_copy}
                              style={{ marginLeft: 10 }}
                              dataid={statementOptions._id}
                              onClick={this.duplicateStatement}
                            />
                            <IconKit size={20}
                              icon={ic_delete}
                              style={{ marginLeft: 10 }}
                              dataid={statementOptions._id}
                              onClick={this.deleteStatement}
                            />
                          </Option>
                      );
                    }) }
                  </Select>

                </div>
              </div>
              <Divider className={styleStatement.dividerHorizontal}/>
            </div>
          </Row>
          <Row type="flex" className={styleStatement.toolbar}>
            <div className={styleStatement.navigation}>
              <div>
              { editable && (
                <Tooltip title={combineSelectionToolTip}>
                  <Dropdown
                    disabled={(checkedQueriesCount < 2)}
                    trigger={['click']}
                    overlay={(
                      <Menu onClick={this.handleCombine}>
                        <Menu.Item key={SUBQUERY_TYPE_INTERSECT}>
                          <IconKit size={24} icon={software_pathfinder_intersect} />
                          {combineAnd}
                        </Menu.Item>
                        <Menu.Item key={SUBQUERY_TYPE_SUBTRACT}>
                          <IconKit size={24} icon={software_pathfinder_subtract} />
                          {combineAndNot}
                        </Menu.Item>
                        <Menu.Item key={SUBQUERY_TYPE_UNITE}>
                          <IconKit size={24} icon={software_pathfinder_unite} />
                          {combineOr}
                        </Menu.Item>
                      </Menu>
                    )}
                  >
                    <Button icon="block">
                      {combineText}
                      {' '}
                      <Icon type="caret-down" />
                    </Button>
                  </Dropdown>
                </Tooltip>
              ) }
            </div>
            </div>
          </Row>

        </div>
        <div className={styleStatement.body}>
          {reorderable
            ? (
              <DragSortableList
                key="sortable"
                type="vertical"
                items={queries.map((query, index) => ({ id: query.key, content: query, index }))}
                onSort={this.handleReorder}
                className={styleStatement.draggableContainer}
              />
            ) : queries
          }
        </div>
        <div className={styleStatement.footer}>
          <Tooltip title={newQueryText}>
            <Button type="primary" onClick={this.handleNewQuery}>{newQueryText}</Button>
          </Tooltip>
        </div>
      </div>
    );
  }
}

Statement.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  data: PropTypes.array.isRequired,
  activeStatementId: PropTypes.string,
  externalData: PropTypes.shape({}),
  display: PropTypes.shape({}),
  options: PropTypes.shape({}),
  target: PropTypes.shape({}),
  onSelectCallback: PropTypes.func,
  onEditCallback: PropTypes.func,
  onSortCallback: PropTypes.func,
  onRemoveCallback: PropTypes.func,
  onDuplicateCallback: PropTypes.func,
  onDraftHistoryUndoCallback: PropTypes.func,
  onGetStatementsCallback: PropTypes.func,
  onCreateStatementCallback: PropTypes.func,
  onUpdateStatementCallback: PropTypes.func,
  onDeleteStatementCallback: PropTypes.func,
  onSelectStatementCallback: PropTypes.func,
  onDuplicateStatementCallback: PropTypes.func,
};

Statement.defaultProps = {
  display: {
    compoundOperators: true,
    viewableSqon: false,
  },
  options: {
    copyable: true,
    duplicatable: true,
    editable: true,
    removable: true,
    reorderable: true,
    selectable: true,
    undoable: true,
  },

  target: {},
  externalData: {},

  onSelectCallback: () => {},
  onEditCallback: () => {},
  onBatchEditCallback: () => {},
  onSortCallback: () => {},
  onRemoveCallback: () => {},
  onDuplicateCallback: () => {},
  onDraftHistoryUndoCallback: () => {},
  onGetStatementsCallback: () => {},
  onCreateStatementCallback: () => {},
  onUpdateStatementCallback: () => {},
  onDeleteStatementCallback: () => {},
  onSelectStatementCallback: () => {},
  onDuplicateStatementCallback: () => {},
};

export default Statement;
