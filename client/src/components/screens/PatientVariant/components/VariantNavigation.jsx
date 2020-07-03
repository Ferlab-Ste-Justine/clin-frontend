
import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import {
  find, cloneDeep, debounce,
} from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Menu, Input, AutoComplete, Tag, Typography, Col, Tooltip, Button,
} from 'antd';
import IconKit from 'react-icons-kit';
import {
  ic_widgets,
  ic_gps_fixed,
  ic_group,
  ic_search,
  ic_call_split,
  ic_assessment,
  ic_done,
  ic_keyboard_arrow_right,
  ic_info_outline,
  ic_cloud_upload,
} from 'react-icons-kit/md';
import GenericFilter from '../../../Query/Filter/Generic';
import SpecificFilter from '../../../Query/Filter/Specific';
import NumericalComparisonFilter from '../../../Query/Filter/NumericalComparison';
import GenericBooleanFilter from '../../../Query/Filter/GenericBoolean';
import CompositeFilter from '../../../Query/Filter/Composite';
import AutoCompleteFilter from '../../../Query/Filter/Autocomplete';
import { sanitizeInstructions } from '../../../Query/helpers/query';
import {
  FILTER_TYPE_GENERIC,
  FILTER_TYPE_NUMERICAL_COMPARISON,
  FILTER_TYPE_GENERICBOOL,
  FILTER_TYPE_COMPOSITE,
  FILTER_TYPE_SPECIFIC,
} from '../../../Query/Filter/index';
import { INSTRUCTION_TYPE_OPERATOR, OPERATOR_TYPE_AND_NOT } from '../../../Query/Operator';
import './navigation.scss';
import {
  fetchGenesByAutocomplete,
} from '../../../../actions/variant';
import { variantShape } from '../../../../reducers/variant';

const getCategoryIcon = (label) => {
  const iconGenomicPath = <path id="gene-a" d="M15.3623576,15.3626389 C16.6196371,14.1042341 17.1837108,12.2966662 17.0211,10.1475594 C16.4874103,10.0732874 15.93881,9.96356731 15.3755803,9.81024054 C15.3460402,9.80208187 15.3170629,9.79589253 15.2875229,9.78773386 C15.3556056,10.2991982 15.3744549,10.7839359 15.3485722,11.2399775 L13.6079617,9.49908567 C13.1929948,9.47038965 12.8013785,9.47770432 12.4393023,9.52384302 L15.1966521,12.2823182 C15.0106907,13.0323534 14.6671824,13.6704178 14.1686594,14.1692221 C13.6692924,14.6685891 13.0284147,15.0104093 12.2764102,15.1960895 L9.52271768,12.4421156 C9.47657898,12.8047545 9.46982698,13.1966521 9.49880433,13.6119004 L11.2354762,15.3488536 C10.3850049,15.3966803 9.43325362,15.2849909 8.40301027,15.0047827 C5.2954002,14.1585314 2.66605711,14.6097904 1,16.2764102 L2.1934168,17.469827 C3.41327894,16.2499648 5.46082431,15.953158 7.95962864,16.6339851 C11.06752,17.4788297 13.6965818,17.027008 15.3623576,15.3626389 Z M14.6162611,6.21564214 C15.1502321,6.28991419 15.6988325,6.3990716 16.2623435,6.55239837 C16.2927275,6.56055704 16.3222675,6.56730904 16.3520889,6.57490505 C16.2693768,5.94640596 16.2561542,5.3550429 16.3146715,4.81066254 L18.3827543,6.87958925 C18.7774652,6.88605992 19.1485441,6.85877057 19.4903643,6.79321986 L16.5152623,3.81755521 C16.7124771,3.18061612 17.0301027,2.63285976 17.4695456,2.19397946 L16.2758475,1 C15.0171613,2.25868617 14.4530876,4.06709804 14.6162611,6.21564214 Z M7.64734843,17.4253763 C7.73062315,18.0566887 7.7435645,18.6503024 7.68420312,19.1958081 L5.61049374,17.1215361 C5.21634548,17.1150654 4.8455479,17.1429174 4.50429034,17.2090308 L7.48276832,20.1883528 C7.28555352,20.8224785 6.96849065,21.3691096 6.53045435,21.8071459 L7.72387115,23.0011253 C8.98255732,21.7421578 9.54663103,19.9340273 9.38317626,17.7854832 C8.84920523,17.7112111 8.30060487,17.6020537 7.73681249,17.448727 C7.70699114,17.440287 7.67773245,17.4338163 7.64734843,17.4253763 Z M16.0403714,7.36657758 C12.9321986,6.52201435 10.3031369,6.97327332 8.63764243,8.63820509 C7.38008159,9.89604726 6.81572654,11.7047405 6.97861865,13.8532846 C7.51230834,13.9275566 8.06090871,14.0372767 8.62413842,14.1906035 C8.65367844,14.1987621 8.68265579,14.2055141 8.71219581,14.2131101 C8.48937966,12.5349557 8.77662118,11.1339148 9.55028837,10.1512168 L13.2453228,13.8476579 C13.3601069,13.7635392 13.4695456,13.6740751 13.569419,13.574483 C13.6690111,13.4746096 13.7587565,13.3651709 13.8425939,13.2503868 L10.1467154,9.55535237 C11.3882403,8.57349838 13.3015895,8.37121958 15.5969897,8.99606133 C18.7045998,9.84231256 21.3339429,9.39105359 23,7.72443382 L21.8065832,6.53101702 C20.5867211,7.75087917 18.5391757,8.0474047 16.0403714,7.36657758 Z" />;
  switch (label) {
    default:
      return null;
    case 'category_variant':
      return (
        <IconKit size={24} icon={ic_widgets} />
      );
    case 'category_genomic':
      return (
        <svg className="svgIcon">{iconGenomicPath}</svg>
      );
    case 'category_impacts':
      return (
        <IconKit size={24} icon={ic_gps_fixed} />
      );
    case 'category_cohort':
      return (
        <IconKit size={24} icon={ic_group} />
      );
    case 'category_zygosity':
      return (
        <IconKit size={24} icon={ic_call_split} />
      );
    case 'category_metric':
      return (
        <IconKit size={24} icon={ic_assessment} />
      );
  }
};


class VariantNavigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeFilterId: null,
      searchSelection: {},
      searchResults: [],
      searchValue: '',
      searchGeneValue: '',
      geneSearch: false,
      activeMenu: [],
    };
    this.searchQuery = '';
    this.handleFilterSelection = this.handleFilterSelection.bind(this);
    this.handleCategoryOpenChange = this.handleCategoryOpenChange.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleFilterRemove = this.handleFilterRemove.bind(this);
    this.handleNavigationSearch = this.handleNavigationSearch.bind(this);
    this.handleNavigationSelection = this.handleNavigationSelection.bind(this);
    this.renderFilterType = this.renderFilterType.bind(this);
    this.handleAutoCompleteChange = this.handleAutoCompleteChange.bind(this);
    this.getHighlightSearch = this.getHighlightSearch.bind(this);
    this.getHighlightSearchGene = this.getHighlightSearchGene.bind(this);
    this.handleGeneAutoCompleteChange = this.handleGeneAutoCompleteChange.bind(this);
    this.handleGeneSearch = this.handleGeneSearch.bind(this);
    this.handleGeneSelection = this.handleGeneSelection.bind(this);
    this.handleMenuSelection = this.handleMenuSelection.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  getHighlightSearch(value) {
    const { searchValue } = this.state;
    const regex = new RegExp(searchValue, 'i');
    let tempoValue = value;
    const highlightValue = [];
    const highlightPart = value.split(regex);
    let haveMoreValue = true;

    while (haveMoreValue) {
      const matchValue = tempoValue.match(regex);
      if (matchValue) {
        highlightValue.push(matchValue[0]);
        tempoValue = tempoValue.slice(matchValue.index + matchValue[0].length);
      } else {
        haveMoreValue = false;
      }
    }

    return highlightPart.map((stringPart, index) => (
      <React.Fragment>
        { index === 0 ? null : <span className="highlight">{highlightValue[index - 1]}</span>}{stringPart}
      </React.Fragment>
    ));
  }

  getHighlightSearchGene(value) {
    const { searchGeneValue } = this.state;
    const regex = new RegExp(searchGeneValue, 'i');
    let tempoValue = value;
    const highlightValue = [];
    const highlightPart = value.split(regex);
    let haveMoreValue = true;

    while (haveMoreValue) {
      const matchValue = tempoValue.match(regex);
      if (matchValue) {
        highlightValue.push(matchValue[0]);
        tempoValue = tempoValue.slice(matchValue.index + matchValue[0].length);
      } else {
        haveMoreValue = false;
      }
    }

    return highlightPart.map((stringPart, index) => (
      <React.Fragment>
        { index === 0 ? null : <span className="highlight">{highlightValue[index - 1]}</span>}{stringPart}
      </React.Fragment>
    ));
  }

  handleMenuSelection(e) {
    const { activeMenu } = this.state;
    const newActiveMenu = activeMenu === e.key ? [] : [e.key];
    this.setState({
      activeMenu: newActiveMenu,
    });
  }

  handleClickOutside(event) {
    const openMenu = document.querySelector('.submenuOpen');
    const clickX = event.clientX;
    const clickY = event.clientY;
    if (openMenu) {
      const menuX = Number(openMenu.style.left.replace('px', ''));
      const menuY = Number(openMenu.style.top.replace('px', ''));
      if (clickX < menuX || clickX > (menuX + openMenu.offsetWidth) || clickY < menuY || clickY > menuY + openMenu.offsetHeight) {
        this.setState({
          activeMenu: [],
        });
      }
    }
  }

  handleNavigationSearch(query) {
    if (query && query.length > 2) {
      this.searchQuery = query;
      const { autocomplete } = this.props;
      autocomplete.then((engine) => {
        engine.search(query, debounce((searchResults) => {
          const groupedResults = searchResults.reduce((accumulator, result) => {
            if (!accumulator[result.id]) {
              accumulator[result.id] = {
                id: result.id,
                type: result.type,
                label: result.label,
                matches: [],
              };
            }
            accumulator[result.id].matches.push(result);
            return accumulator;
          }, {});
          this.setState({
            searchResults: Object.values(groupedResults).filter(group => group.matches.length > 0),
          });
        }, 750, { leading: true }));
      });
    } else if (this.searchQuery !== query) {
      this.searchQuery = query;
      this.setState({
        searchResults: [],
      });
    }
  }

  handleGeneSearch(query) {
    if (query && query.length > 2) {
      const { actions } = this.props;
      actions.fetchGenesByAutocomplete(query);
      this.setState({
        geneSearch: true,
      });
    } else {
      this.searchGeneQuery = query;
      this.setState({
        geneSearch: false,
      });
    }
  }

  handleGeneSelection(key) {
    const { searchGeneValue } = this.state;
    const { variant, activeQuery } = this.props;
    const match = variant.geneResult.hits;
    const draftSelection = find(variant.draftQueries, { key: activeQuery });
    let selectionValue = [];

    const instruction = find(draftSelection.instructions, (o) => {
      if (o.data.id === 'gene_symbol') {
        return o;
      }
      return null;
    });

    if (instruction === undefined) {
      selectionValue.push(key.key);
    } else {
      const { data } = instruction;
      const { selection } = data;
      if (!selection.includes(key.key)) {
        selectionValue = selection.concat(key.key);
      } else {
        selectionValue = selection;
      }
    }

    const geneFilter = AutoCompleteFilter.structFromArgs('gene_symbol', 'generic', searchGeneValue, match, selectionValue);
    this.handleFilterChange(geneFilter);
    this.setState({
      geneSearch: false,
      searchGeneValue: null,
      activeMenu: [],
    });
  }

  handleNavigationSelection(datum) {
    this.searchQuery = '';
    const selection = JSON.parse(datum);
    if (selection.type !== 'filter') {
      this.setState({
        activeFilterId: null,
        searchSelection: {
          category: selection.id,
          filter: selection.subid,
        },
        searchResults: [],
      });
    } else {
      const { activeQuery, queries } = this.props;
      this.setState({
        activeFilterId: null,
        searchSelection: {},
        searchResults: [],
      }, () => {
        const query = find(queries, { key: activeQuery });
        let filter = null;
        if (query) {
          filter = find(query.instructions, instruction => instruction.data.id === selection.subid);
        }
        const { schema } = this.props;
        const category = find(schema.categories, ['id', selection.id]);
        const filterDefinition = find(category.filters, ['id', selection.subid]);
        const filterType = filterDefinition.type;
        if (!filter) {
          switch (filterType) {
            case FILTER_TYPE_GENERIC:
              filter = GenericFilter.structFromArgs(selection.subid, [selection.value]);
              break;
            case FILTER_TYPE_GENERICBOOL:
              filter = GenericBooleanFilter.structFromArgs(selection.subid, [selection.value]);
              break;
            case FILTER_TYPE_SPECIFIC:
              filter = SpecificFilter.structFromArgs(selection.subid, [selection.value]);
              break;
            case FILTER_TYPE_COMPOSITE:
              filter = CompositeFilter.structFromArgs(selection.subid,
                CompositeFilter.qualityCompositionStructFromArgs(selection.value));
              break;
            default: break;
          }
        } else {
          switch (filterType) {
            case FILTER_TYPE_GENERIC:
            case FILTER_TYPE_GENERICBOOL:
            case FILTER_TYPE_SPECIFIC:
              if (filter.data.values.indexOf(selection.value) === -1) {
                filter.data.values.push(selection.value);
              }
              break;
            case FILTER_TYPE_COMPOSITE:
              filter = CompositeFilter.structFromArgs(selection.subid,
                CompositeFilter.qualityCompositionStructFromArgs(selection.value));
              break;
            default: break;
          }
          filter = filter.data;
        }
        this.handleFilterChange(filter);
      });
    }
  }


  handleFilterSelection({ key }) {
    this.setState({
      activeFilterId: key,
      searchSelection: {},
      activeMenu: [],
    });
  }

  handleFilterRemove(filter) {
    filter.remove = true;
    this.handleFilterChange(filter);
  }


  handleFilterChange(filter) {
    const { onEditCallback } = this.props;
    if (onEditCallback) {
      const { activeQuery, queries } = this.props;
      const query = find(queries, { key: activeQuery });
      if (filter && query) {
        const updatedQuery = cloneDeep(query);
        let updatedInstructions = [];
        if (!filter.remove) {
          let updated = false;
          updatedInstructions = updatedQuery.instructions.map((instruction) => {
            if (instruction.data.id === filter.id) {
              updated = true;
              return {
                type: 'filter',
                data: filter,
              };
            }
            return instruction;
          });
          if (!updated) {
            const andNotOperator = find(updatedQuery.instructions, instruction => (instruction.type === INSTRUCTION_TYPE_OPERATOR && instruction.data.type === OPERATOR_TYPE_AND_NOT));
            if (!andNotOperator) {
              updatedInstructions.push({
                type: 'filter',
                data: filter,
              });
            }
          }
        } else {
          updatedInstructions = updatedQuery.instructions.filter((instruction) => {
            if (instruction.data.id === filter.id) {
              return false;
            }
            return true;
          });
        }
        updatedQuery.instructions = sanitizeInstructions(updatedInstructions);
        onEditCallback(updatedQuery);
      }
    }
  }


  handleCategoryOpenChange() {
    this.setState({
      activeFilterId: null,
      searchSelection: {},
    });
  }

  handleAutoCompleteChange(e) {
    e = !e ? '' : e;
    this.setState({ searchValue: e });
  }


  handleGeneAutoCompleteChange(e) {
    e = !e ? null : e;
    this.setState({ searchGeneValue: e });
  }

  renderFilterType(categoryData) {
    const {
      activeQuery, queries, data, patient,
    } = this.props;

    const { searchSelection, activeFilterId } = this.state;
    const currentActiveFilterId = searchSelection.filter ? searchSelection.filter : activeFilterId;
    const activeQueryData = find(queries, { key: activeQuery });
    const activeFilterForActiveQuery = activeQueryData ? find(activeQueryData.instructions, q => q.data.id === currentActiveFilterId) : null;
    const dataSet = data[currentActiveFilterId] ? data[currentActiveFilterId] : [];
    const config = categoryData.config && categoryData.config[categoryData.id];
    const filterOptions = {
      editable: true,
      selectable: false,
      removable: false,
    };

    switch (categoryData.type) {
      default:
        return null;
      case FILTER_TYPE_GENERIC:
        return (
          <GenericFilter
            overlayOnly
            autoOpen
            options={filterOptions}
            data={(activeFilterForActiveQuery ? activeFilterForActiveQuery.data : GenericFilter.structFromArgs(currentActiveFilterId))}
            dataSet={dataSet}
            config={config}
            onEditCallback={this.handleFilterChange}
            onRemoveCallback={this.handleFilterRemove}
            onCancelCallback={this.handleCategoryOpenChange}
          />
        );
      case FILTER_TYPE_SPECIFIC:
        return (
          <SpecificFilter
            overlayOnly
            autoOpen
            options={filterOptions}
            data={(activeFilterForActiveQuery ? activeFilterForActiveQuery.data : SpecificFilter.structFromArgs(currentActiveFilterId))}
            dataSet={dataSet}
            externalDataSet={patient}
            config={config}
            onEditCallback={this.handleFilterChange}
            onRemoveCallback={this.handleFilterRemove}
            onCancelCallback={this.handleCategoryOpenChange}
          />
        );
      case FILTER_TYPE_NUMERICAL_COMPARISON:
        return (
          <NumericalComparisonFilter
            overlayOnly
            autoOpen
            options={filterOptions}
            data={(activeFilterForActiveQuery ? activeFilterForActiveQuery.data : NumericalComparisonFilter.structFromArgs(currentActiveFilterId))}
            facets={data}
            dataSet={dataSet}
            config={config}
            onEditCallback={this.handleFilterChange}
            onRemoveCallback={this.handleFilterRemove}
            onCancelCallback={this.handleCategoryOpenChange}
          />
        );
      case FILTER_TYPE_GENERICBOOL:
        return (
          <GenericBooleanFilter
            overlayOnly
            autoOpen
            options={filterOptions}
            data={(activeFilterForActiveQuery ? activeFilterForActiveQuery.data : GenericBooleanFilter.structFromArgs(currentActiveFilterId))}
            dataSet={categoryData.search && Object.keys(categoryData.search).length > 0 ? Object.keys(categoryData.search).reduce((accumulator, keyName) => {
              const datum = data[keyName];
              if (datum && datum[0]) {
                accumulator.push({ value: keyName, count: datum[0].count });
              }
              return accumulator;
            }, []) : []}
            config={config}
            onEditCallback={this.handleFilterChange}
            onRemoveCallback={this.handleFilterRemove}
            onCancelCallback={this.handleCategoryOpenChange}
          />
        );
      case FILTER_TYPE_COMPOSITE:
        return (
          <CompositeFilter
            overlayOnly
            autoOpen
            options={filterOptions}
            data={(activeFilterForActiveQuery ? activeFilterForActiveQuery.data : CompositeFilter.structFromArgs(currentActiveFilterId))}
            facets={data}
            dataSet={dataSet}
            config={config}
            onEditCallback={this.handleFilterChange}
            onRemoveCallback={this.handleFilterRemove}
            onCancelCallback={this.handleCategoryOpenChange}
          />
        );
    }
  }


  render() {
    // eslint-disable-next-line react/prop-types
    const { schema, variant } = this.props;
    const {
      activeFilterId, searchResults, searchSelection, searchValue, geneSearch, searchGeneValue, activeMenu,
    } = this.state;
    let autocompletesCount = 0;
    const geneItem = [];
    if (variant.geneResult.hits) {
      variant.geneResult.hits.map((item, index) => {
        if (index <= 4) {
          const alias = [];
          if (item.highlight.alias) {
            item.highlight.alias.map((a) => {
              alias.push(a.replace(/[}{]/g, ''));
              return true;
            });
          }

          const geneObj = {
            geneSymbol: item._source.geneSymbol,
            alias: alias.join(', '),
          };
          geneItem.push(geneObj);
        }
        return true;
      });
    }

    const autocompletes = searchValue !== '' ? searchResults.filter(group => group.label !== '').map((group) => {
      autocompletesCount += group.matches.length;
      return (
        <AutoComplete.OptGroup key={group.id} disabled label={(<Typography.Text strong className="label">{group.label}</Typography.Text>)}>
          {group.matches.map(match => (
            <AutoComplete.Option key={match.id} value={JSON.stringify(match)} className="value">
              <Col>
                <Typography.Text style={{ maxWidth: 280 }} ellipsis>
                  <IconKit size={16} icon={ic_done} className="iconCheck" />
                  {this.getHighlightSearch(match.value)}
                </Typography.Text>
              </Col>
              <Col justify="end" align="end" className="valueCount">
                {match.count && (<Tag color="#f0f2f5">{intl.get('components.query.count', { count: match.count })}</Tag>)}
              </Col>
            </AutoComplete.Option>
          ))}
        </AutoComplete.OptGroup>
      );
    }) : [];
    if (autocompletesCount > 0) {
      autocompletes.unshift((
        <AutoComplete.Option key="count" disabled>
          <Typography.Text className="totalCount">
            {autocompletesCount}{' '}result(s)
          </Typography.Text>
        </AutoComplete.Option>
      ));
    }
    const generateMenuComponent = (selection, children) => {
      if (!selection.category || !selection.filter) {
        return (
          <Menu
            mode="horizontal"
            onOpenChange={this.handleCategoryOpenChange}
            className="menu"
            openKeys={activeMenu}
          >
            {children}
          </Menu>
        );
      }
      return (
        <Menu
          mode="horizontal"
          onOpenChange={this.handleCategoryOpenChange}
          openKeys={[searchSelection.category]}
          selectedKeys={[searchSelection.filter]}
          className="menu"
        >
          {children}
        </Menu>
      );
    };

    return (
      <div className="navigationFilter">
        <AutoComplete
          key="autocompleter"
          allowClear
          autoFocus
          size="large"
          dataSource={autocompletes}
          onSearch={this.handleNavigationSearch}
          onSelect={this.handleNavigationSelection}
          value={this.searchQuery}
          className="autocomplete"
          dropdownClassName="dropwDownAutoComplete"
          onChange={this.handleAutoCompleteChange}
          open
        >
          <Input prefix={<IconKit size={24} icon={ic_search} />} placeholder="Recherche de filtres" />
        </AutoComplete>
        {generateMenuComponent(searchSelection, schema.categories ? schema.categories.map((category) => {
          if (category.filters && category.filters.length > 0) {
            const { id } = category;
            const label = intl.get(`screen.patientvariant.${category.label}`);
            const categoryInfo = find(schema.categories, ['id', (searchSelection.category || id)]);
            const categoryData = find(categoryInfo.filters, ['id', (searchSelection.filter || activeFilterId)]);
            const filter = categoryData ? this.renderFilterType(categoryData) : null;
            return (
              <Menu.SubMenu
                key={id}
                onTitleClick={this.handleMenuSelection}
                title={(
                  <span className="subMenuTitle">
                    <div>
                      {getCategoryIcon(category.label)}
                      <span className="value">{label}</span>
                    </div>
                    <IconKit size={24} icon={ic_keyboard_arrow_right} className="iconRightArrowDropDown" />
                  </span>
                )}
                popupClassName={activeMenu.includes(id) ? 'submenuOpen menuDropdown' : 'menuDropdown'}
              >
                {activeFilterId === null && category.label === 'category_variant' && (
                  <div className="variantsHeader">
                    <Typography.Text>
                    Identifiant
                      <Tooltip overlayClassName="tooltip" placement="right" title="Cras justo odio, dapibus ac facilisis in, egestas eget quam. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.">
                        <Button>
                          <IconKit size={16} className="iconInfo" icon={ic_info_outline} />
                        </Button>
                      </Tooltip>
                    </Typography.Text>
                    <Input placeholder="ex: chr7:g:399383 A>T, rs93939, etc" />
                    <Button>
                      <IconKit size={18} icon={ic_cloud_upload} />
                    Importer une liste
                    </Button>

                  </div>
                )}
                {activeFilterId === null && category.label === 'category_genomic' && (
                <div className="variantsHeader">
                  <Typography.Text>
                    Identifiant de gêne
                    <Tooltip overlayClassName="tooltip" placement="right" title="Cras justo odio, dapibus ac facilisis in, egestas eget quam. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.">
                      <Button>
                        <IconKit size={16} className="iconInfo" icon={ic_info_outline} />
                      </Button>
                    </Tooltip>
                  </Typography.Text>
                  <AutoComplete
                    key="geneAutocompleter"
                    allowClear
                    size="large"
                    onSearch={this.handleGeneSearch}
                    className="geneAutocomplete"
                    onChange={this.handleGeneAutoCompleteChange}
                    value={searchGeneValue}
                    open
                  >
                    <Input placeholder="Recherche de filtres" />
                  </AutoComplete>

                </div>
                )}
                { (!geneSearch || category.label !== 'category_genomic') && activeFilterId === null && !searchSelection.category && category.filters.map(f => (f.search && f.label !== 'filter_gene_symbol') && (
                  <Menu.SubMenu
                    key={f.id}
                    title={
                      f.label === 'filter_gene_symbol' ? null
                        : (
                          <div className={category.label === 'category_variant' ? 'subMenuVariant' : 'subMenuTitle'}>
                            {intl.get(`screen.patientvariant.${f.label}`)}
                            <IconKit size={24} icon={ic_keyboard_arrow_right} className="iconRightArrow" />
                          </div>
                        )

                      }

                    onTitleClick={this.handleFilterSelection}
                    className="filterChoise"
                  />
                ))}
                { geneSearch && variant.geneResult.hits && category.label === 'category_genomic' && (
                  <Menu
                    className="geneMenuList"
                  >
                    {
                    geneItem.map(item => (
                      <Menu.Item key={item.geneSymbol} onClick={this.handleGeneSelection}>
                        <div className="geneValues">
                          <div className="geneSymbol">{this.getHighlightSearchGene(item.geneSymbol)}</div>
                          <div className="alias">{this.getHighlightSearchGene(item.alias)}</div>
                        </div>

                      </Menu.Item>
                    ))
                    }
                  </Menu>
                )}
                { filter }
              </Menu.SubMenu>
            );
          }
          return null;
        }) : null)}
      </div>
    );
  }
}

VariantNavigation.propTypes = {
  schema: PropTypes.shape({}).isRequired,
  patient: PropTypes.shape({}).isRequired,
  data: PropTypes.shape({}),
  autocomplete: PropTypes.shape({}).isRequired,
  queries: PropTypes.array,
  activeQuery: PropTypes.string,
  onEditCallback: PropTypes.func,
  actions: PropTypes.shape({}).isRequired,
  variant: PropTypes.shape(variantShape).isRequired,
};

VariantNavigation.defaultProps = {
  onEditCallback: () => {},
  data: [],
  queries: [],
  activeQuery: '',
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    fetchGenesByAutocomplete,
  }, dispatch),
});

const mapStateToProps = state => ({
  variant: state.variant,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(VariantNavigation);
