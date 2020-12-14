/* eslint-disable */ // @TODO
import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import {
  Menu, Button, Checkbox, Tooltip, Dropdown, Icon, Modal, Row, Divider, Input, Popconfirm, Typography,
} from 'antd';
import { StarOutlined, StarFilled, InfoCircleFilled } from '@ant-design/icons';
import {
  cloneDeep, find, findIndex, pull, isEmpty, isEqual,
} from 'lodash';
import { v1 as uuidv1 } from 'uuid';
import DragSortableList from 'react-drag-sortable';
import IconKit from 'react-icons-kit';
import {
  ic_folder, ic_delete, ic_content_copy, ic_save, ic_note_add, ic_share, ic_edit, ic_add, ic_unfold_less, ic_unfold_more
} from 'react-icons-kit/md';
import Query from './index';
import {
  createSubqueryInstruction, INSTRUCTION_TYPE_SUBQUERY,
} from './Subquery';
import {
  createOperatorInstruction, getSvgPathFromOperatorType, OPERATOR_TYPE_AND, OPERATOR_TYPE_OR,
} from './Operator';
import { calculateTitleWidth } from './helpers/query';
import './styles/statement.scss';
import styleStatement from './styles/statement.module.scss';

class Statement extends React.Component {
  constructor(props) {
    super(props);
    const {
      data, display, original,
    } = props;
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
      dropDownIsOpen: false,
      modalIsOpen: false,
      dropdownClickValue: null,
      draftTitle:null,
      openFilter:true,
    };
    this.isCopyable = this.isCopyable.bind(this);
    this.isEditable = this.isEditable.bind(this);
    this.isDuplicatable = this.isDuplicatable.bind(this);
    this.isRemovable = this.isRemovable.bind(this);
    this.isReorderable = this.isReorderable.bind(this);
    this.isSelectable = this.isSelectable.bind(this);
    this.isUndoable = this.isUndoable.bind(this);
    this.isDirty = this.isDirty.bind(this);
    this.actionIsDisabled = this.actionIsDisabled.bind(this);
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
    this.handleCombine = this.handleCombine.bind(this);
    this.findQueryIndexForKey = this.findQueryIndexForKey.bind(this);
    this.findQueryTitle = this.findQueryTitle.bind(this);
    this.getStatements = this.getStatements.bind(this);
    this.onModalSaveTitleInputChange = this.onModalSaveTitleInputChange.bind(this);
    this.createDraftStatement = this.createDraftStatement.bind(this);
    this.duplicateStatement = this.duplicateStatement.bind(this);
    this.updateStatement = this.updateStatement.bind(this);
    this.toggleStatementAsDefault = this.toggleStatementAsDefault.bind(this);
    this.deleteStatement = this.deleteStatement.bind(this);
    this.selectStatement = this.selectStatement.bind(this);
    this.onPositionChange = this.onPositionChange.bind(this);
    this.onStatementTitleChange = this.onStatementTitleChange.bind(this);
    this.handleCancelModal = this.handleCancelModal.bind(this);
    this.showConfirmForDestructiveStatementAction = this.showConfirmForDestructiveStatementAction.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
    this.isDropdownOpen = this.isDropdownOpen.bind(this);
    this.handlePopUpConfirm = this.handlePopUpConfirm.bind(this);
    this.showModal = this.showModal.bind(this)
    this.handleTitleInputFocus = this.handleTitleInputFocus.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.handleTitleChange = this.handleTitleChange.bind(this)
    this.handleFilterView = this.handleFilterView.bind(this)
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

  isDirty() {
    const {
      statements, activeStatementId, data, original,
    } = this.props;
    const { statementTitle } = this.state;
    const activeStatement = statements[activeStatementId];
    const activeStatementHasSingleEmptyQuery = data.length === 1 && data[0].instructions.length === 0;
    const statementIsDraft = !activeStatement || activeStatementId === 'draft';
    const titleHasChanges = statementTitle !== null && statementTitle !== activeStatement.title;
    const queriesHaveChanges = statementIsDraft ? !activeStatementHasSingleEmptyQuery : !isEqual(data, original);

    return (titleHasChanges === true) || (queriesHaveChanges === true);
  }

  actionIsDisabled(action) {
    const { statements, activeStatementId, data } = this.props;
    const activeStatement = statements[activeStatementId];
    const statementIsDraft = !activeStatement || activeStatementId === 'draft';
    switch (action) {
      default:
      case 'share':
        return true;
      case 'new':
        return (statementIsDraft && (data.length === 1 && data[0].instructions.length === 0));
      case 'save':
        return !this.isDirty();
      case 'duplicate':
        return statementIsDraft;
      case 'delete':
        return statementIsDraft;
    }
  }

  handleCopy() {
    if (this.isCopyable()) {
      return true;
    }

    return false;
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

  showConfirmForDestructiveStatementAction(title, content, okText, cancelText, funcToCallBack) {
    Modal.confirm({
      title,
      content,
      okText,
      cancelText,
      onOk() { funcToCallBack(); },
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
      }, () => {
        onDuplicateCallback(query, clone, index);
      });
    }
  }

  handleRemove(key) {
    if (this.isRemovable()) {
      const subqueryKeys = this.getSubqueryKeys([key]);
      if (!isEmpty(subqueryKeys)) {
        this.showDeleteConfirm([key]);
      } else {
        this.confirmRemove([key]);
      }
    }
  }

  onPositionChange(expandIconPosition) {
    this.setState({ expandIconPosition });
  }

  getSubqueryKeys(keysToSearchFor) {
    const { data } = this.props;
    const subqueryKeys = data.filter(({ instructions }) => Boolean(instructions.find(i => i.type === INSTRUCTION_TYPE_SUBQUERY && keysToSearchFor.indexOf(i.data.query) !== -1))).map(({ key }) => key);
    return subqueryKeys;
  }

  getStatements() {
    const { onGetStatementsCallback } = this.props;
    onGetStatementsCallback();
  }

  isDuplicatable() {
    const { options } = this.props;
    const { duplicatable } = options;
    return duplicatable === true;
  }

  createDraftStatement() {
    const callbackCreateDraft = () => {
      this.setState({
        statementTitle: null,
      }, () => {
        const { onCreateDraftStatementCallback } = this.props;
        const statement = {
          title: intl.get('screen.patientvariant.modal.statement.save.input.title.default'),
        };
        onCreateDraftStatementCallback(statement);
      });
    };

    if (this.isDirty()) {
      this.showConfirmForDestructiveStatementAction(
        intl.get('screen.patientvariant.modal.statement.draft.title'),
        intl.get('screen.patientvariant.modal.statement.draft.body'),
        intl.get('screen.patientvariant.modal.statement.draft.button.ok'),
        intl.get('screen.patientvariant.modal.statement.draft.button.cancel'),
        callbackCreateDraft,
      );
    } else {
      callbackCreateDraft();
    }
  }

  duplicateStatement(e) {
    let id = e.currentTarget ? e.currentTarget.getAttribute('dataid') : e;
    if (!id) {
      const { activeStatementId } = this.props;
      id = activeStatementId;
    }
    if (e.stopPropagation) { e.stopPropagation(); }
    const callbackDuplicate = () => {
      this.setState({
        statementTitle: null,
      });
      this.props.onDuplicateStatementCallback(id); /* eslint-disable-line */
    };
    if (this.isDirty()) {
      this.showConfirmForDestructiveStatementAction(
        intl.get('screen.patientvariant.modal.statement.duplicate.title'),
        intl.get('screen.patientvariant.modal.statement.duplicate.body'),
        intl.get('screen.patientvariant.modal.statement.duplicate.button.ok'),
        intl.get('screen.patientvariant.modal.statement.duplicate.button.cancel'),
        callbackDuplicate,
      );
    } else {
      callbackDuplicate();
    }
  }

  updateStatement(e) {
    const {
      activeStatementId, statements, data, onUpdateStatementCallback,
    } = this.props;
    const { statementTitle } = this.state;
    let id = e.target ? e.target.getAttribute('dataid') : e;
    if (!id) {
      id = activeStatementId;
    }

    const title = statementTitle !== null ? statementTitle : statements[id].title;
    onUpdateStatementCallback(id, title, '', data, false);
    if (e.stopPropagation) { e.stopPropagation(); }
  }

  toggleStatementAsDefault(e) {
    const id = e.currentTarget ? e.currentTarget.getAttribute('dataid') : '';
    this.props.onSetDefaultStatementCallback(id);
  }

  deleteStatement(value) {
    const { dropDownIsOpen } = this.state;
    const { onDeleteStatementCallback } = this.props;
    let id = value.currentTarget ? value.currentTarget.getAttribute('dataid') : value;
    if (!id) {
      const { activeStatementId } = this.props;
      id = activeStatementId;
      this.setState({
        statementTitle: null,
      });
    }
    
    onDeleteStatementCallback(id);
    value.currentTarget ? value.stopPropagation() : null; /* eslint-disable-line */
  }

  selectStatement(value) {
    let id = value;
    if (!id) {
      const { activeStatementId } = this.props;
      id = activeStatementId;
    }

    this.setState({
      statementTitle: null,
      dropDownIsOpen: false,
    });
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
        onSortCallback(sortedData);
      });
    }
  }

  handleSelect() {
    if (this.isSelectable()) {
      return true;
    }

    return false;
  }

  handleUndo() {
    if (this.isUndoable()) {
      const { onDraftHistoryUndoCallback } = this.props;
      onDraftHistoryUndoCallback();
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
    const { data, newCombinedQueryCallback } = this.props;

    const { checkedQueries, display } = this.state;
    const defaultDisplay = cloneDeep(this.props.display);
    display.push(defaultDisplay);

    if (checkedQueries.length > 1) {
      const { onBatchEditCallback } = this.props;
      const sortedCheckedQueries = cloneDeep(checkedQueries);
      sortedCheckedQueries.sort((a, b) => this.findQueryIndexForKey(a) - this.findQueryIndexForKey(b));
      const instructions = sortedCheckedQueries.reduce((accumulator, query) => {
        const subquery = createSubqueryInstruction(query);
        const operator = createOperatorInstruction(key);
        return [...accumulator, subquery, operator];
      }, []);

      instructions.pop();
      const newSubquery = {
        key: uuidv1(),
        instructions,
      };
      const newDraft = [
        ...data,
        newSubquery,
      ];
      this.setState({
        checkedQueries: [],
        display,
      }, () => {
        onBatchEditCallback(newDraft, newSubquery);
        newCombinedQueryCallback(newSubquery.key);
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

  isCopyable() {
    const { options } = this.props;
    const { copyable } = options;
    return copyable === true;
  }

  handleRemoveChecked() {
    if (this.isRemovable()) {
      const { checkedQueries } = this.state;
      const subqueryKeys = this.getSubqueryKeys(checkedQueries);
      if (!isEmpty(subqueryKeys)) {
        this.showDeleteConfirm(checkedQueries);
      } else {
        this.confirmRemoveChecked();
      }
    }
  }

  showDeleteConfirm(keys) {
    const modalTitle = intl.get('screen.patientvariant.modal.statement.delete.title');
    const modalContent = intl.get('screen.patientvariant.modal.statement.delete.body');
    const modalOk = intl.get('screen.patientvariant.modal.statement.delete.button.ok');
    const modalCancel = intl.get('screen.patientvariant.modal.statement.delete.button.cancel');
    Modal.confirm({
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
      saveTitleModalVisible: false,
    });
  }

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

  findQueryIndexForKey(key) {
    const { data } = this.props;
    return findIndex(data, { key });
  }

  findQueryTitle(key) {
    const { data } = this.props;
    const query = find(data, { key });
    return (query ? query.title : '');
  }

  onStatementTitleChange(e) {
    const inputValue = document.querySelector(".inputTitle").value
    const {
      activeStatementId, data, onUpdateStatementCallback,
    } = this.props;

    this.setState({
      statementTitle: inputValue,
      modalIsOpen: false,
    }, () => { onUpdateStatementCallback(activeStatementId, inputValue, '', data, false); });
  }

  onModalSaveTitleInputChange(e) {
    const { value } = e.target;
    this.setState({ saveTitleModalInputValue: value });
  }

  onCancel() {
    const dropdown = document.querySelector('.filterDropdown');
    dropdown.focus();

    this.setState({
      dropdownClickValue: null,

    });
  }

  toggleMenu(e) {
    let { dropdownClickValue } = this.state;
    if (e === false) {
      dropdownClickValue = null;
    }
    this.setState({
      dropDownIsOpen: !this.isDropdownOpen(),
      dropdownClickValue,
    });
  }

  isDropdownOpen() {
    const { dropDownIsOpen } = this.state;
    return dropDownIsOpen === true;
  }


  handlePopUpConfirm(e) {
    const id = e.target.getAttribute('dataid');
    if (this.isDirty()) {
      this.setState({ dropdownClickValue: id });
    } else {
      this.selectStatement(id);
    }
  }

  showModal(){
    this.setState({ modalIsOpen : true})
  }

  closeModal(){
    const { activeStatementId, statements } = this.props;
    const activeStatement = statements[activeStatementId];
    const statementTitle = this.state.statementTitle !== null ? this.state.statementTitle : activeStatement.title;
    this.setState({ modalIsOpen : false,
                    draftTitle :statementTitle
                  })
  }

  handleTitleInputFocus(e){
    e.target.select();
  }

  handleTitleChange(e){
    const value = e.target.value
    this.setState({ draftTitle : value})
  }

  handleFilterView(){
    const { openFilter } = this.state;

    this.setState({
      openFilter: !openFilter,
    })
  }

  render() {
    const { data, activeStatementId, statements, defaultStatementId } = this.props;
    const activeStatement = statements[activeStatementId];
    const { Text } = Typography;
    if (!data || !activeStatement) return null;
    const { dropDownIsOpen, dropdownClickValue, openFilter } = this.state;
    if (!data) return null;
    const {
      activeQuery, externalData, options, facets, categories, searchData, target, activeStatementTotals,
    } = this.props;
    const {
      display, original, checkedQueries, saveTitleModalVisible, modalIsOpen, draftTitle
    } = this.state;
    const {
      reorderable,
    } = options;

    const inactiveStatementKeys = Object.keys(statements).filter(key => key !== 'draft');
    const statementTitle = this.state.statementTitle !== null ? this.state.statementTitle : activeStatement.title;
    const checkedQueriesCount = checkedQueries.length;
    const newText = intl.get('screen.patientvariant.statement.new');
    const saveText = intl.get('screen.patientvariant.statement.save');
    const deleteText = intl.get('screen.patientvariant.statement.delete');
    const newQueryText = intl.get('screen.patientvariant.statement.newQuery');
    const myFilterText = intl.get('screen.patientvariant.statement.myFilter');
    const duplicateText = intl.get('screen.patientvariant.query.menu.duplicate');
    const editTitleText = intl.get('screen.patientvariant.query.menu.editTitle');
    const defaultFilterText = intl.get('screen.patientvariant.statement.tooltip.defaultFilter');
    const modalTitleSaveTitle = intl.get('screen.patientvariant.modal.statement.save.title');
    const modalTitleSaveContent = intl.get('screen.patientvariant.modal.statement.save.body');
    const modalTitleSaveInputLabel = intl.get('screen.patientvariant.modal.statement.save.input.title.label');
    const modalTitleSaveInputDefault = intl.get('screen.patientvariant.modal.statement.save.input.title.default');
    const modalTitleSaveOk = intl.get('screen.patientvariant.modal.statement.save.button.ok');
    const modalTitleSaveCancel = intl.get('screen.patientvariant.modal.statement.save.button.cancel');
    const modalTitleChangeTitle = intl.get('screen.patientvariant.modal.statement.changeTitle.title');
    const width = calculateTitleWidth(statementTitle);

    let containsEmptyQueries = false;

    const queries = data.reduce((accumulator, query, index) => {
      const isChecked = checkedQueries.indexOf(query.key) !== -1;
      const isActive = activeQuery === query.key;
      const initial = find(original, { key: query.key }) || null;
      const classNames = [styleStatement.queryContainer];
      const isDirty = !isEqual(initial, query);
      if (!containsEmptyQueries) {
        containsEmptyQueries = query.instructions.length < 1;
      }

      if (isDirty) { classNames.push(styleStatement.dirtyContainer); }
      if (isActive) { classNames.push(styleStatement.activeContainer); } else { classNames.push(styleStatement.inactiveContainer); }
      if (!query.title) {
        query = {
          ...query, 
          title: intl.get('screen.patientvariant.query.title.increment', {count: (index + 1)})
        };
      }

      return [...accumulator, (
        <div className={classNames.join(' ')} key={query.key}>
          <Checkbox
            className={isChecked ? `${styleStatement.check} ${styleStatement.querySelector} ${!isActive ? styleStatement.unActiveCheck : null}` : `${styleStatement.querySelector} ${!isActive ? styleStatement.unActiveCheck : null}`}
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
            results={(activeStatementTotals[query.key] ? activeStatementTotals[query.key] : null)}
            facets={(facets[query.key] ? facets[query.key] : {})}
            target={target}
            categories={categories}
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
        saveTitleModalVisible: false,
      });
    };

    const handleSaveTitleModalOk = () => {
      const newStatement = {
        description: this.state.saveTitleModalInputValue,
        title: this.state.saveTitleModalInputValue,
        queries: [{
          key: uuidv1(),
          instructions: [],
        }],
      };
      this.setState({
        saveTitleModalVisible: false,
      }, this.props.onCreateDraftStatementCallback(newStatement));
    };

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
          {modalTitleSaveInputLabel}
          <br />
          <Input
            onChange={this.onModalSaveTitleInputChange}
            defaultValue={modalTitleSaveInputDefault}
            value={statementTitle}
          />

        </Modal>
        <div className={styleStatement.header}>
          <Row align={"bottom"} className={`flex-row ${styleStatement.toolbar}`}>
            <div className={styleStatement.message}>
              {this.isDirty() && (
              <>
                <InfoCircleFilled />
                { intl.get('screen.patientvariant.form.statement.unsavedChanges') }
              </>
              )}
              {!this.isDirty() && (<>&nbsp;</>)}
            </div>
          </Row>
          <Row  className={`flex-row ${styleStatement.toolbar}`}>
            <div className={styleStatement.navigation}>
              <div>
                <div className={styleStatement.title}>
                  <Tooltip overlayClassName={styleStatement.tooltip} title={openFilter ? "Masquer" : "Ouvrir"}>
                  <Button
                      type="default"
                      className={`${styleStatement.button} ${styleStatement.foldButton}`}
                      dataid={(activeStatement.uid === defaultStatementId) ? '' : activeStatement.uid}
                      onClick={this.handleFilterView}
                      disabled={activeStatementId == null}
                    >
                        <IconKit
                        icon={openFilter ? ic_unfold_less : ic_unfold_more}
                        size={24}
                        className={`${styleStatement.icon} ${styleStatement.iconFold}`}
                        />
                    </Button>
                  </Tooltip>
                  <Tooltip overlayClassName={styleStatement.tooltip} title={editTitleText}>
                    <div>
                      <Button onClick={this.showModal} className={styleStatement.editTitleButton}>
                        {statementTitle} 
                                             
                        <IconKit
                        icon={ic_edit}
                        size={18}
                        className={`${styleStatement.iconTitle} ${styleStatement.icon} ${modalIsOpen ? `${styleStatement.focusIcon}` : null}`}
                        />
                      </Button>
                      <Modal
                        visible={modalIsOpen}
                        onOk={this.onStatementTitleChange}
                        onCancel = {this.closeModal}
                        okText={modalTitleSaveOk}
                        cancelText={modalTitleSaveCancel}
                        className={styleStatement.titleModal}
                        width={488}
                        destroyOnClose={true}
                      >
                        <Text className={styleStatement.modalTitle}>{modalTitleChangeTitle}</Text>
                        <label className={styleStatement.modalLabel}>
                          {modalTitleSaveInputLabel}
                          <Input className={`inputTitle ${styleStatement.inputTitle}`} defaultValue={statementTitle} autoFocus onChange={this.handleTitleChange} onFocus={this.handleTitleInputFocus}/>
                        </label>
                        
                      </Modal>

                    </div>
                  </Tooltip>
                  {activeStatementId !== 'draft' && (
                  <Tooltip overlayClassName={styleStatement.tooltip} title={defaultFilterText}>
                    <Button
                      type="default"
                      className={styleStatement.button}
                      dataid={(activeStatement.uid === defaultStatementId) ? '' : activeStatement.uid}
                      onClick={this.toggleStatementAsDefault}
                      disabled={activeStatementId == null}
                    >
                    {
                      activeStatement.uid === defaultStatementId ?                               
                      (<StarFilled  
                        style={{ fontSize: '16px' }}
                      className={`${styleStatement.starFilled} ${styleStatement.star}`}
                      dataid=''
                      onClick={this.toggleStatementAsDefault}
                      />) : 
                      (<StarOutlined 
                        style={{ fontSize: '16px' }}
                        className={`${styleStatement.starOutlined} ${styleStatement.star}`}
                        dataid={activeStatement.uid}
                        onClick={this.toggleStatementAsDefault} />)
                        
                    }
                    </Button>
                  </Tooltip>
                  )}
                </div>
                <div>
                  <Button
                    type="default"
                    onClick={this.createDraftStatement}
                    disabled={this.actionIsDisabled('new')}
                    className={styleStatement.button}
                  >
                    <IconKit size={20} icon={ic_note_add} />
                    {newText}
                  </Button>
                  <Button
                    type="default"
                    disabled={this.actionIsDisabled('save')}
                    onClick={this.updateStatement}
                    className={styleStatement.button}
                  >
                    <IconKit size={20} icon={ic_save} />
                    {saveText}
                  </Button>
                  <Button
                    type="default"
                    className={styleStatement.button}
                    disabled={this.actionIsDisabled('duplicate')}
                    onClick={this.duplicateStatement}
                  >
                    <IconKit size={20} icon={ic_content_copy} />
                    {duplicateText}
                  </Button>
                  <Button
                    type="default"
                    disabled={this.actionIsDisabled('delete')}
                    className={styleStatement.button}
                  >
                    <Popconfirm
                      title={intl.get('screen.patientvariant.popconfirm.statement.delete.body')}
                      okText={intl.get('screen.patientvariant.popconfirm.statement.delete.button.ok')}
                      cancelText={intl.get('screen.patientvariant.popconfirm.statement.delete.button.cancel')}
                      onConfirm={this.deleteStatement}
                      icon={null}
                      overlayClassName={styleStatement.popconfirm}
                    >
                      <a>
                        <IconKit size={20} icon={ic_delete} />
                        {deleteText}
                      </a>
                    </Popconfirm>
                  </Button>
                  <Divider type="vertical" className={styleStatement.divider} />
                  <Button
                    type="disabled"
                    className={styleStatement.button}
                    disabled={this.actionIsDisabled('share')}
                  >
                    <IconKit size={20} icon={ic_share} />
                  </Button>
                  <Divider type="vertical" className={styleStatement.divider} />
                  <Dropdown
                    trigger={['click']}
                    className={`${styleStatement.button} ${dropDownIsOpen ? `${styleStatement.buttonActive}` : null} filterDropdown `}
                    disabled={(inactiveStatementKeys.length == 0)}
                    visible={this.isDropdownOpen()}
                    onVisibleChange={this.toggleMenu}
                    overlayClassName={`${styleStatement.dropdown} `}
                    overlay={(inactiveStatementKeys.length > 0 ? (
                      <Menu>
                        { inactiveStatementKeys.map(key => (
                          <Menu.Item key={statements[key].uid}>
                            <Popconfirm
                              title={intl.get('screen.patientvariant.popconfirm.statement.load.body')}
                              okText={intl.get('screen.patientvariant.popconfirm.statement.load.button.ok')}
                              cancelText={intl.get('screen.patientvariant.popconfirm.statement.load.button.cancel')}
                              onConfirm={() => this.selectStatement(statements[key].uid)}
                              onCancel={this.onCancel}
                              icon={null}
                              className={statements[key].uid}
                              overlayClassName={`${styleStatement.popconfirm}`}
                              dataid={statements[key].uid}
                              visible={!!(this.isDirty() && dropdownClickValue === statements[key].uid)}
                            >
                              <div
                                className={styleStatement.dropdownTitle}
                                dataid={statements[key].uid}
                                onClick={this.handlePopUpConfirm}
                              >
                                {statements[key].title}
                              </div>
                            </Popconfirm>
                            <div className={styleStatement.dropdownNavigation}>
                              <IconKit
                                size={20}
                                icon={ic_content_copy}
                                dataid={statements[key].uid}
                                className={styleStatement.displayOnHover}
                                onClick={this.duplicateStatement}
                              />
                              <Popconfirm
                                title={intl.get('screen.patientvariant.popconfirm.statement.delete.body')}
                                okText={intl.get('screen.patientvariant.popconfirm.statement.delete.button.ok')}
                                cancelText={intl.get('screen.patientvariant.popconfirm.statement.delete.button.cancel')}
                                placement="topRight"
                                onConfirm={() => this.deleteStatement(statements[key].uid)}
                                onCancel={this.onCancel}
                                icon={null}
                                overlayClassName={styleStatement.popconfirm}
                              >
                                <IconKit
                                  size={20}
                                  icon={ic_delete}
                                  dataid={statements[key].uid}
                                  className={styleStatement.displayOnHover}
                                />
                              </Popconfirm>
                              {
                                key === defaultStatementId ?                               
                                (<StarFilled  
                                  style={{ fontSize: '20px' }}
                                className={`${styleStatement.starFilled} ${styleStatement.star}`}
                                dataid={(statements[key].uid === defaultStatementId) ? '' : statements[key].uid}
                                onClick={this.toggleStatementAsDefault}
                                />) : 
                                (<StarOutlined 
                                  style={{ fontSize: '20px' }}
                                  className={`${styleStatement.starOutlined} ${styleStatement.star}`}
                                  dataid={(statements[key].uid === defaultStatementId) ? '' : statements[key].uid}
                                  onClick={this.toggleStatementAsDefault} />)
                                  
                              }
                            </div>
                          </Menu.Item>
                        ))
                        }
                      </Menu>
                    ) : (<></>))
                   }
                  >
                    <Button>
                      <IconKit
                        size={20}
                        icon={ic_folder}
                        onClick={this.duplicateStatement}
                      />
                      {myFilterText}
                    </Button>
                  </Dropdown>
                </div>
              </div>
            </div>
            {openFilter ? (<Divider className={styleStatement.dividerHorizontal} />) : null}
          </Row>
        </div>
        {
          openFilter ? (
            <>
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
            <Button type="primary" disabled={containsEmptyQueries} onClick={() => this.props.onNewQueryCallback()} className={styleStatement.newQueryButton}>
              <IconKit size={20} icon={ic_add} />
              {newQueryText}
            </Button>
            <Row type="flex" className={styleStatement.toolbar}>
              <Menu onClick={this.handleCombine} mode="horizontal" className={styleStatement.menuCombine}>
                <Menu.Item key={OPERATOR_TYPE_AND} disabled={checkedQueriesCount < 2}>
                  <Button
                    className={`${styleStatement.button} ${styleStatement.combineBtn}`}
                    disabled={checkedQueriesCount < 2}
                  >
                    <svg>
                      { getSvgPathFromOperatorType(OPERATOR_TYPE_AND) }
                    </svg>
                    { intl.get('components.query.instruction.subquery.operator.and') }
                  </Button>
                </Menu.Item>
                <Menu.Item key={OPERATOR_TYPE_OR} disabled={checkedQueriesCount < 2}>
                  <Button
                    className={`${styleStatement.button} ${styleStatement.combineBtn}`}
                    disabled={checkedQueriesCount < 2}
                  >
                    <svg>
                      { getSvgPathFromOperatorType(OPERATOR_TYPE_OR) }
                    </svg>
                    { intl.get('components.query.instruction.subquery.operator.or') }
                  </Button>
                </Menu.Item>
                { /* Not implement in clin-proxy-api yet
                <Menu.Item key={OPERATOR_TYPE_AND_NOT} disabled={checkedQueriesCount < 2}>
                  <Button
                    className={`${styleStatement.button} ${styleStatement.combineBtn}`}
                    disabled={checkedQueriesCount < 2}
                  >
                    <svg>
                      { getSvgPathFromOperatorType(OPERATOR_TYPE_AND_NOT) }
                    </svg>
                    { intl.get('components.query.instruction.subquery.operator.andNot') }
                  </Button>
                </Menu.Item>
                */ }
              </Menu>
  
            </Row>
          </div>
          </>
          ) :null
        }

      </div>
    );
  }
}

Statement.propTypes = {
  statements: PropTypes.shape({}).isRequired,
  data: PropTypes.array.isRequired,
  original: PropTypes.array.isRequired,
  activeStatementId: PropTypes.string,
  defaultStatementId: PropTypes.string,
  activeQuery: PropTypes.string,
  activeStatementTotals: PropTypes.shape({}),
  externalData: PropTypes.shape({}),
  display: PropTypes.shape({}),
  options: PropTypes.shape({}),
  target: PropTypes.shape({}),
  onSelectCallback: PropTypes.func,
  onEditCallback: PropTypes.func,
  onNewQueryCallback: PropTypes.func,
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
  onBatchEditCallback: PropTypes.func,
  onSetDefaultStatementCallback: PropTypes.func,
  newCombinedQueryCallback: PropTypes.func,
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
  activeStatementId: '',
  defaultStatementId: '',
  activeStatementTotals: {},
  target: {},
  externalData: {},
  onSelectCallback: () => {},
  onEditCallback: () => {},
  onNewQueryCallback: () => {},
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
  onBatchEditCallback: () => {},
  onSetDefaultStatementCallback: () => {},
  newCombinedQueryCallback: () => {}
};

export default Statement;
