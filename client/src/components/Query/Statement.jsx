/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Menu, Button, Checkbox, Tooltip, Badge, Dropdown, Icon, Modal, Row, Col, Divider, Select, Input, Collapse, message,
} from 'antd';
const { Option } = Select;
import {
  cloneDeep, find, findIndex, pull, pullAllBy, filter, isEmpty, isEqual, every, remove,
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
      statementTitle: null,
      saveTitleModalInputValue: '',
      saveTitleModalVisible: false,
      statementVisualClueText: '',
      originalTitle: '',
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
    this.createDraftStatement = this.createDraftStatement.bind(this);
    this.duplicateStatement = this.duplicateStatement.bind(this);
    this.updateStatement = this.updateStatement.bind(this);
    this.setStatementAsDefault = this.setStatementAsDefault.bind(this);
    this.deleteStatement = this.deleteStatement.bind(this);
    this.selectStatement = this.selectStatement.bind(this);
    this.onPositionChange = this.onPositionChange.bind(this);
    this.onStatementTitleChange = this.onStatementTitleChange.bind(this);
    this.onFocus=this.onFocus.bind(this)
    this.onBlur=this.onBlur.bind(this)
    this.handleCancelModal = this.handleCancelModal.bind(this);
    this.showConfirmForDestructiveStatementAction = this.showConfirmForDestructiveStatementAction.bind(this);

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

  showConfirmForDestructiveStatementAction(title, content, okText = 'Ok', cancelText = 'Cancel', funcToCallBack) {
    Modal.confirm({
      title,
      content,
      okText,
      cancelText,
      onOk() {funcToCallBack()},
      onCancel() {},
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
        statementVisualClueText: this.props.intl.formatMessage({ id: 'screen.patientvariant.statementVisualClue.modification.text' }),
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
  createDraftStatement() {

    const newStatement = {
      id: 'draft',
      description: this.state.saveTitleModalInputValue,
      title: this.props.intl.formatMessage({ id: 'screen.patientvariant.statementTitleSave.modal.inputPlaceHolder' }),
      queries : [{
        key: uuidv1(),
        instructions: []
      }]
    };

    const  callbackCreateDraft = () => {
      this.setState({
          statementTitle: null,
          statementVisualClueText: this.props.intl.formatMessage({ id: 'screen.patientvariant.statementVisualClue.modification.text' }),
        }
      );
      this.props.onCreateDraftStatementCallback(newStatement)
      this.handleNewQuery(this,newStatement.queries[0])
    };

    if (this.state.statementVisualClueText) {
      this.showConfirmForDestructiveStatementAction(
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmDraft.modal.title' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmDraft.modal.content' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmDraft.modal.ok' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmDraft.modal.cancel' }),
        callbackCreateDraft)
    } else {
      callbackCreateDraft()
    }


  }

  duplicateStatement(e) {
    let id =  e.currentTarget ? e.currentTarget.getAttribute('dataid') : e
    if (!id) {
      const { activeStatementId } = this.props;
      id = activeStatementId
    }
    const callbackDuplicate = () => {

      this.setState({
          statementTitle: null,
          statementVisualClueText: this.props.intl.formatMessage({ id: 'screen.patientvariant.statementVisualClue.modification.text' }),
        }
      );
      if (e.stopPropagation) {
        e.stopPropagation();
      }
      this.props.onDuplicateStatementCallback(id);

    };
    if (this.state.statementVisualClueText) {
      this.showConfirmForDestructiveStatementAction(
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmDuplicate.modal.title' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmDuplicate.modal.content' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmDuplicate.modal.ok' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmDuplicate.modal.cancel' }),
        callbackDuplicate)
    } else {
      callbackDuplicate()
    }

  }

  updateStatement(e) {
    let id =  e.target ? e.target.getAttribute('dataid') : e
    if (!id) {
      id = this.props.activeStatementId
    }
    this.setState({
      statementTitle: null,
      statementVisualClueText: '',
      }
    );
    if (e.stopPropagation) { e.stopPropagation(); }
    this.props.onUpdateStatementCallback(id, this.state.statementTitle, false);
  }

  setStatementAsDefault(e) {
    let id =  e.currentTarget ? e.currentTarget.getAttribute('dataid') : e
    if (!id) {
      const { activeStatementId } = this.props;
      id = activeStatementId
      // only reset title if setting the currently selected one to default
      this.setState({
        statementVisualClueText: '',
      });
    }
    if (e.stopPropagation) { e.stopPropagation(); }
    this.props.onUpdateStatementCallback(id, this.state.statementTitle, true);
  }

  deleteStatement(e) {
    let id =  e.currentTarget ? e.currentTarget.getAttribute('dataid') : e
    if (!id) {
      const { activeStatementId } = this.props;
      id = activeStatementId
      this.setState({
        statementTitle: null,
        statementVisualClueText: '',
      });
    }

    if (e.stopPropagation) { e.stopPropagation(); }
    this.props.onDeleteStatementCallback(id);
  }

  selectStatement(e) {
    let  id = e.target ? e.target.getAttribute('dataid') : e
    if (!id) {
      const { activeStatementId } = this.props;
      id = activeStatementId
    }
    const callbackSelect = () => {
      this.setState({
        statementTitle: null,
        statementVisualClueText: '',
      });
      this.props.onSelectStatementCallback(id);
    };
    if (this.state.statementVisualClueText) {
      this.showConfirmForDestructiveStatementAction(
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmSelect.modal.title' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmSelect.modal.content' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmSelect.modal.ok' }),
        this.props.intl.formatMessage({ id: 'screen.patientvariant.statementConfirmSelect.modal.cancel' }),
        callbackSelect)
    } else {
      callbackSelect()
    }

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
        statementVisualClueText: this.props.intl.formatMessage({ id: 'screen.patientvariant.statementVisualClue.modification.text' }),
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
        statementVisualClueText: this.props.intl.formatMessage({ id: 'screen.patientvariant.statementVisualClue.modification.text' }),
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
      statementVisualClueText: this.props.intl.formatMessage({ id: 'screen.patientvariant.statementVisualClue.modification.text' }),
    }, () => {
      onRemoveCallback(keysToRemove);
    });
  }

  handleNewQuery(event, query= '') {
    const { onEditCallback } = this.props;
    const { display } = this.state;

    const newQuery = query ? query : {
      key: uuidv1(),
      instructions: []
    };
    const newDisplay = cloneDeep(this.props.display);
    display.push(newDisplay);
    this.setState({
      display,
      statementVisualClueText: this.props.intl.formatMessage({ id: 'screen.patientvariant.statementVisualClue.modification.text' }),
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

  onStatementTitleChange(e) {
    const { value } = e.target;
    this.setState({
      statementTitle: value,
      statementVisualClueText: this.props.intl.formatMessage({ id: 'screen.patientvariant.statementVisualClue.modification.text' }),
      }
    );
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
      searchData, target, activeStatementId, statements, queriesHaveChanges, } = this.props;
    const foundActiveStatement = statements.find(statement => statement._id === activeStatementId)
    const activeStatement = foundActiveStatement ? foundActiveStatement._source : {}
    const statementsToDisplay = statements.filter(statement => statement._id != activeStatementId)
    const statementTitle = activeStatement.title ? activeStatement.title : ''
    const { Panel } = Collapse;
    const { Option } = Select;

    const { expandIconPosition, selectIsOpen, titleWidth } = this.state;
    if (!data) return null;
    const { display, original, checkedQueries, queriesChecksAreIndeterminate, queriesAreAllChecked,
      saveTitleModalVisible, saveTitleModalConfirmLoading, saveTitleModalInputValue,
    } = this.state;
    const {
      editable, reorderable, removable, duplicatable,
    } = options;
    const activeStatementIsDraft = activeStatementId === 'draft' ? true : false
    const checkedQueriesCount = checkedQueries.length;
    const newText = intl.formatMessage({ id: 'screen.patientvariant.statement.new' });
    const saveText = intl.formatMessage({ id: 'screen.patientvariant.statement.save' });
    const combineText = intl.formatMessage({ id: 'screen.patientvariant.statement.combine' });
    const deleteText = intl.formatMessage({ id: 'screen.patientvariant.statement.delete' });
    const newQueryText = intl.formatMessage({ id: 'screen.patientvariant.statement.newQuery' });
    const myFilterText = intl.formatMessage({ id: 'screen.patientvariant.statement.myFilter' });
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
              className={isChecked ?  `${styleStatement.check} ${styleStatement.querySelector} ${!isActive ? styleStatement.unActiveCheck : null}` : `${styleStatement.querySelector} ${!isActive ? styleStatement.unActiveCheck : null}`}
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
        }, this.props.onCreateDraftStatementCallback(newStatement))
    };

    //const activeStatementCanBeDeleted = !data.lastUpdatedOn
    const activeStatementCanBeDeleted =  !(activeStatementIsDraft || activeStatementId == null)  ;
    if (activeStatementIsDraft) {
      activeStatementCanBeSaved = true;
    }

    const contextSelectStatement = ({ key }) => {

      this.selectStatement(key)
    }
    activeStatementCanBeSaved = activeStatementCanBeSaved && (activeStatementId != null)

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
              // placeholder={modalTitleSaveInputPlaceHolder}
              onChange={this.onModalSaveTitleInputChange}
              defaultValue={modalTitleSaveInputDefault}
              value={this.state.saveTitleModalInputValue}
          />

        </Modal>
        <div className={styleStatement.header}>
          <Row type="flex" className={styleStatement.toolbar}>
            <div>{( queriesHaveChanges ?
              this.props.intl.formatMessage({ id: 'screen.patientvariant.statementVisualClue.modification.text' }) :
              this.state.statementVisualClueText)}</div>
          </Row>
          <Row type="flex" className={styleStatement.toolbar}>
            <div className={styleStatement.navigation}>
              <div>
                <Input
                    id="statementTitle"
                    onChange={this.onStatementTitleChange}
                    autocomplete="off"
                    value={(this.state.statementTitle || this.state.statementTitle === '' ? this.state.statementTitle: statementTitle)}
                    disabled={activeStatementId == null}
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
                              className={styleStatement.button}
                              onClick={this.setStatementAsDefault}
                              disabled={activeStatementId == null}
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
                      disabled={activeStatementIsDraft}
                      onClick={this.createDraftStatement}
                      className={styleStatement.button}
                  >
                    <IconKit size={20} icon={ic_note_add} />
                    {newText}
                  </Button>
                  <Button
                      type="default"
                      disabled={!activeStatementCanBeSaved}
                      onClick={this.updateStatement}
                      className={styleStatement.button}
                  >
                     <IconKit size={20} icon={ic_save} />
                    {saveText}
                  </Button>
                  <Button
                      type="default"
                      className={styleStatement.button}
                      type="default"
                      disabled={activeStatementIsDraft || activeStatementId == null}
                      onClick={this.duplicateStatement}
                  >
                    <IconKit size={20} icon={ic_content_copy} />
                    {duplicateText}
                  </Button>
                  <Button
                      type="default"
                      disabled={!activeStatementCanBeDeleted}
                      onClick={this.deleteStatement}
                      className={styleStatement.button}
                  >
                    <IconKit size={20} icon={ic_delete} />
                    {deleteText}
                  </Button>
                  <Divider type="vertical" className={styleStatement.divider}/>
                  <Button
                    type="disabled"
                    className={styleStatement.button}
                    disabled={true} // @TODO
                  >
                        <IconKit size={20} icon={ic_share} />
                  </Button>
                  <Divider type="vertical" className={styleStatement.divider} />

                  <Dropdown.Button
                      className={styleStatement.button}
                      icon={(<><IconKit className={selectIsOpen ? styleStatement.openSelect : null} icon={ic_folder} size={20}/>{myFilterText}</>)}
                      trigger={['click']}
                      placement={'bottomLeft'}
                      style={{ width: 250 }}
                      disabled={ (statementsToDisplay.length == 0) }
                      overlay={ (statementsToDisplay && statementsToDisplay.length > 0 ? (
                        <Menu onClick={contextSelectStatement}>
                          {
                            statementsToDisplay.map(statementOptions => (
                                <Menu.Item key={statementOptions._id}>

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
                                  { (<Icon
                                      type="star"
                                      style={{ marginRight: 10, marginLeft: 20 }}
                                      className={statementOptions._source.isDefault ? `${styleStatement.starFilled} ${styleStatement.star}` : `${styleStatement.star}`}
                                      theme={statementOptions._source.isDefault ? 'filled' : 'outlined'}
                                      dataid={statementOptions._id}
                                      onClick={this.setStatementAsDefault}
                                  />)}

                                </Menu.Item>))
                          }
                          </Menu>):(<></>))
                  }
                  >
                  </Dropdown.Button>

                </div>
              </div>
              <Divider className={styleStatement.dividerHorizontal}/>
            </div>
          </Row>
          <Row type="flex" className={styleStatement.toolbar}>
                  <Menu onClick={this.handleCombine} mode="horizontal" className={styleStatement.menuCombine}>
                    <Menu.Item key={SUBQUERY_TYPE_INTERSECT} disabled={checkedQueriesCount<2 ? true : false}>
                        <Button
                            className={`${styleStatement.button} ${styleStatement.combineBtn}` }
                            disabled={checkedQueriesCount<2 ? true : false}
                        >
                        <svg>
                              <path id="and-a" d="M7.82479753,18.9949289 C5.47047361,18.8077295 3.45024683,17.671674 2.18108759,15.8212414 C1.38577602,14.6616768 1,13.4130053 1,11.998319 C1,10.5836328 1.38577602,9.33496125 2.18108759,8.17539668 C3.10970457,6.821474 4.44967311,5.84054939 6.06643375,5.33112728 C6.79857581,5.10043814 7.47705463,5.00149948 8.32687524,5.00149948 C9.56241251,5.00149948 10.602363,5.23914799 11.6907961,5.77022097 L11.9992153,5.92070684 L12.3076346,5.77022097 C13.0747798,5.39591213 13.8198933,5.17229731 14.7104352,5.04911927 C15.1839278,4.98362691 16.1591832,4.98362691 16.6326758,5.04911927 C18.3167614,5.2820583 19.7575625,5.97229909 20.9101372,7.09831075 C22.0368154,8.19902291 22.7113995,9.51686169 22.9485637,11.0804945 C23.0171454,11.5326576 23.0171454,12.4639805 22.9485637,12.9161436 C22.6330952,14.9960408 21.4820046,16.7369116 19.6748132,17.8672564 C18.4605497,18.6267415 17.1529756,18.9951386 15.6715555,18.9951386 C14.4360182,18.9951386 13.3960677,18.7574901 12.3076346,18.2264163 L11.9992153,18.0759313 L11.6907961,18.2264163 C10.6628338,18.7279844 9.64142171,18.9731934 8.4846713,18.9961055 C8.20063872,19.0017283 7.90369556,19.0012002 7.82479753,18.994925 L7.82479753,18.9949289 Z M8.52748584,17.860724 C9.14412955,17.8183705 9.61677561,17.7286362 10.172708,17.5483717 C10.4245837,17.4666987 10.9758872,17.2350845 10.9758872,17.210938 C10.9758872,17.2051378 10.8622192,17.1180764 10.7232915,17.0174671 C10.3945712,16.7794139 9.88408426,16.3052888 9.6205964,15.9933181 C8.83862864,15.0674634 8.36985911,14.0318974 8.18700916,12.8263574 C8.1250748,12.4180258 8.1250748,11.576983 8.18700916,11.1686514 C8.36982973,9.96330529 8.83792189,8.92908875 9.62040648,8.00165902 C9.89028379,7.68179031 10.4323318,7.18274088 10.7490657,6.96253219 C10.886076,6.86727556 10.99899,6.78262046 11,6.77440912 C11.0032399,6.74757497 10.4511461,6.51238886 10.172708,6.42199816 C8.84018085,5.98941368 7.47771714,5.98904898 6.13090293,6.42091808 C5.7652449,6.53816959 5.09167328,6.85624341 4.75772567,7.0693594 C3.4628789,7.89569461 2.55974327,9.10640306 2.17969705,10.5253645 C2.03398715,11.0693969 2,11.3454917 2,11.9851353 C2,12.624779 2.03398715,12.9008739 2.17969705,13.4449062 C2.4532996,14.4664442 3.01680901,15.4097578 3.7982792,16.1544085 C4.28537573,16.6185556 4.80139259,16.9677565 5.4443143,17.2683206 C6.28392553,17.6608365 7.04606997,17.8379113 8.08703287,17.8823226 C8.12978249,17.8841461 8.3279864,17.8744282 8.52748584,17.8607254 L8.52748584,17.860724 Z M20.2052598,16.1081738 C21.1347824,15.2250786 21.7423367,14.0783692 21.9509089,12.8134018 C22.0163637,12.4164252 22.0163637,11.5139529 21.9509089,11.1169763 C21.6746288,9.44136819 20.7213806,8.0172345 19.2490202,7.08040811 C18.9161886,6.86863565 18.244869,6.55256805 17.8804331,6.43605584 C16.538268,6.00695786 15.1833322,6.00723593 13.8521391,6.43687821 C13.6039678,6.51697621 13,6.77215997 13,6.79691814 C13,6.80268169 13.113288,6.88919278 13.2517513,6.98916771 C13.5793727,7.22572022 14.0881532,7.69685539 14.3507602,8.00685949 C14.9958334,8.76836001 15.4563189,9.66707655 15.6698518,10.5812945 C15.7894027,11.0931385 15.8244379,11.4095671 15.8244379,11.9774785 C15.8244379,13.2469734 15.4772229,14.3674919 14.7614074,15.4080486 C14.3658906,15.9829975 13.8204442,16.5491432 13.2840464,16.9414744 C13.1491243,17.0401593 13.0354823,17.1290685 13.0315082,17.1390519 C13.0203839,17.1669978 13.548754,17.3950476 13.8521391,17.4932439 C14.7521359,17.7845457 15.6141317,17.8748188 16.5634909,17.7771932 C17.9131563,17.6384052 19.2296452,17.0350585 20.2052598,16.1081738 Z"/>
                        </svg>
                          Intersection
                        </Button>
                    </Menu.Item>
                    <Menu.Item key={SUBQUERY_TYPE_UNITE} disabled={checkedQueriesCount<2 ? true : false}>
                        <Button
                          className={`${styleStatement.button} ${styleStatement.combineBtn}` }
                          disabled={checkedQueriesCount<2 ? true : false}
                        >
                          <svg>
                                 <path id="or-a" d="M8.58256714,18.9740809 C9.29888234,18.9237684 9.84792512,18.8171715 10.4937164,18.6030306 C10.7863048,18.5060101 11.4267191,18.2308699 11.4267191,18.2021862 C11.4267191,18.1952961 11.2946782,18.0918733 11.1332943,17.9723581 C10.7514412,17.6895686 10.1584413,17.1263457 9.85236401,16.7557479 C8.94400122,15.6559051 8.39946216,14.4257329 8.18705612,12.9936452 C8.11511176,12.5085786 8.11511176,11.5094853 8.18705612,11.0244195 C8.39942718,9.59256173 8.9431805,8.36399337 9.85214304,7.26227851 C10.1656427,6.88229952 10.7953054,6.28946752 11.163235,6.02787648 C11.3223911,5.91471984 11.4535562,5.81415533 11.4547294,5.80440172 C11.458493,5.77252401 10.8171611,5.4931412 10.4937164,5.38576407 C8.94580476,4.87188736 7.36311743,4.87145412 5.79860793,5.38448103 C5.37384619,5.5237667 4.59140161,5.90161367 4.203475,6.15477914 C2.69933363,7.13640061 1.65021825,8.57462856 1.20874351,10.2602441 C1.03948072,10.9065123 1,11.2344915 1,11.9943386 C1,12.7541849 1.03948072,13.082165 1.20874351,13.7284331 C1.52656939,14.9419408 2.18116339,16.0625238 3.08894689,16.9471108 C3.65477689,17.4984814 4.25420095,17.913305 5.00104147,18.2703519 C5.97636543,18.7366302 6.86169943,18.9469811 8.07092086,18.9997387 C8.12058038,19.0019049 8.35082129,18.9903602 8.58256714,18.9740829 L8.58256714,18.9740809 Z M16.6635709,18.9423582 C18.2366502,18.7764388 19.7710609,18.0551617 20.9081716,16.9471083 C21.991561,15.8914037 22.6996852,14.5205587 22.9427829,13.008341 C23.0190724,12.5337712 23.0190724,11.4549019 22.9427829,10.980332 C22.620769,8.97720988 21.5097277,7.27471483 19.7936435,6.15477664 C19.4057169,5.90161117 18.6232723,5.52376503 18.1985106,5.38447936 C16.6341726,4.87151078 15.0549507,4.87184237 13.5034017,5.38546247 C13.2141499,5.48121642 12.5102057,5.78627836 12.5102057,5.81587577 C12.5102057,5.82276586 12.6422466,5.92618639 12.8036301,6.04570157 C13.1854836,6.3284911 13.7784839,6.89171487 14.084561,7.26231184 C14.8364149,8.17265543 15.3731255,9.24703487 15.6220049,10.3399459 C15.7613456,10.9518344 15.8021802,11.3301121 15.8021802,12.0090278 C15.8021802,13.5266576 15.3974903,14.8661931 14.5631837,16.1101362 C14.1021959,16.797465 13.4664602,17.4742695 12.841271,17.9432856 C12.684015,18.0612595 12.5515615,18.1675471 12.5469295,18.1794815 C12.5339638,18.2128896 13.1497965,18.4855142 13.5034017,18.6029042 C14.5523774,18.9511437 15.5570614,19.0590617 16.6635709,18.9423537 L16.6635709,18.9423582 Z M14.8098747,13.4819947 C14.9640405,12.9334993 15,12.6551395 15,12.0102483 C15,11.3653578 14.9640405,11.0869979 14.8098747,10.5385026 C14.420146,9.15191834 13.47638,7.92115239 12.1850348,7.11544792 L12,7 L11.8149652,7.11544792 C10.5236199,7.92115239 9.5798542,9.15191834 9.19012525,10.5385026 C9.0359595,11.0869979 9,11.3653578 9,12.0102483 C9,12.6551395 9.0359595,12.9334993 9.19012525,13.4819947 C9.51537933,14.6391885 10.2421494,15.7165445 11.207507,16.4725379 C11.5900887,16.7721467 11.9708875,17.0176222 12.0241995,16.9990064 C12.0471342,16.9909978 12.1638742,16.9204181 12.2836213,16.8421629 C13.5356983,16.0239258 14.4295981,14.8349501 14.8098747,13.4819947 Z"/>
                          </svg>
                          Union
                        </Button>
                    </Menu.Item>
                    <Menu.Item key={SUBQUERY_TYPE_SUBTRACT} disabled={checkedQueriesCount<2 ? true : false}>
                        <Button
                            className={`${styleStatement.button} ${styleStatement.combineBtn}` }
                            disabled={checkedQueriesCount<2 ? true : false}
                        >
                          <svg>
                                     <path id="exclude-a" d="M7.82479752,18.9949258 C5.47047361,18.8077264 3.45024682,17.6716713 2.18108759,15.8212386 C1.38577602,14.6616744 1,13.4130032 1,11.9983173 C1,10.5836313 1.38577602,9.33496008 2.18108759,8.17539583 C3.10970457,6.82147345 4.44967311,5.84054881 6.06643374,5.33112728 C6.79857581,5.10043797 7.47705462,5.00149901 8.32687523,5.00149901 C9.56241249,5.00149901 10.6023629,5.23914809 11.6907961,5.77022102 L11.9992152,5.92070608 L12.3076344,5.77022102 C13.0747802,5.39591227 13.819893,5.17229711 14.7104354,5.04911926 C15.1839279,4.98362691 16.1591832,4.98362691 16.6326758,5.04911926 C18.3167614,5.28205847 19.7575625,5.97229855 20.9101371,7.09831014 C22.0368154,8.19902204 22.7113993,9.51686048 22.9485636,11.080493 C23.0171455,11.532656 23.0171455,12.4639786 22.9485636,12.9161416 C22.6330949,14.9960385 21.4820045,16.736909 19.6748132,17.8672528 C18.4605496,18.6267385 17.1529756,18.9951355 15.6715555,18.9951355 C14.436018,18.9951355 13.3960676,18.7574863 12.3076344,18.2264134 L11.9992152,18.0759284 L11.6907961,18.2264134 C10.662834,18.7279814 9.64142194,18.9731903 8.48467129,18.9961024 C8.20063871,19.001733 7.90369555,19.0011971 7.82479752,18.9949219 L7.82479752,18.9949258 Z M20.1997507,16.1526935 C21.1321339,15.2642396 21.7415579,14.1105725 21.9507719,12.8379298 C22.0164283,12.4385444 22.0164283,11.5305964 21.9507719,11.131211 C21.6736416,9.44543596 20.7174598,8.01266115 19.2405684,7.07015044 C18.9067125,6.85709308 18.2333269,6.53910741 17.8677695,6.42188818 C16.5213263,5.99013982 15.1592384,5.99050442 13.8270785,6.42296936 C13.5487172,6.51333512 12.9967759,6.74845615 13,6.77528332 C13.001027,6.78349211 13.113907,6.86812418 13.2508798,6.96335411 C13.5675266,7.18350226 14.1094251,7.68241403 14.3792275,8.00219451 C15.0267967,8.76971678 15.4880584,9.6727728 15.7021889,10.5922822 C15.8221078,11.1072319 15.8572507,11.4255804 15.8572507,11.9969376 C15.8572507,12.5682949 15.8221078,12.8866434 15.7021889,13.4015931 C15.4879988,14.3213582 15.0260962,15.2255277 14.3790381,15.9916489 C14.1156227,16.3035336 13.6052761,16.7775279 13.2766467,17.0155162 C13.1377576,17.1160977 13.0241207,17.2031358 13.0241207,17.2089336 C13.0241207,17.2330736 13.5752719,17.4646238 13.8270785,17.5462743 C14.7309329,17.8393555 15.594648,17.9300459 16.5467744,17.8318434 C17.9005934,17.6922098 19.2211337,17.0852015 20.1997507,16.1526935 Z M12.2363508,16.2079252 C13.2797482,15.4923613 14.024665,14.4525801 14.341562,13.2693946 C14.4700338,12.789725 14.5,12.546294 14.5,11.9823246 C14.5,11.4183552 14.4700338,11.1749242 14.341562,10.6952546 C14.0167883,9.48266027 13.2303163,8.40633248 12.1541954,7.70172838 L12,7.60076691 L11.8458041,7.70172838 C10.7696832,8.40633248 9.9832118,9.48266027 9.6584377,10.6952546 C9.52996625,11.1749242 9.5,11.4183552 9.5,11.9823246 C9.5,12.546294 9.52996625,12.789725 9.6584377,13.2693946 C9.92948275,14.2813823 10.5351244,15.2235506 11.339589,15.8846811 C11.658407,16.1466947 11.9757396,16.3613683 12.0201661,16.3450879 C12.0392782,16.3380842 12.1365615,16.2763609 12.2363508,16.2079252 Z"/>
                          </svg>
                          Exclusion
                        </Button>
                    </Menu.Item>
                  </Menu>

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
  onCreateDraftStatementCallback: PropTypes.func,
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
  onCreateDraftStatementCallback: () => {},
  onUpdateStatementCallback: () => {},
  onDeleteStatementCallback: () => {},
  onSelectStatementCallback: () => {},
  onDuplicateStatementCallback: () => {},
};

export default Statement;
