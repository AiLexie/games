import { Link } from "react-router-dom";
import React from "react";

import { tableToSubs } from "../../../constants/subs";
import AuthService from "../../AuthService";
import getBonuses from "../../../constants/bonus_codes";
import Icon from "../Icon";
import Name from "../Name";
import RightArrow from "../../shared/RightArrow";

import "./TableOverview.css";
import FilterMenu from "./FilterMenu";
import LoadingScreen from "../../layout/LoadingScreen";
import ReactPaginate from "react-paginate";
import "../../../styles/react-paginate.css";
import { isMobile } from "react-device-detect";

const tablesInitDesc = [
  "dress", "hat", "recipe", "material", "random_box", "consumable",
  "coat", "gauntlet", "pants", "shoes",
]


class BonusSubs extends React.Component {
  render() {
    const {
      data
    } = this.props;

    if (data["bonus_code_1"] === undefined) {
      return null;
    }

    const bonusSubs = (
      getBonuses(data).map((b, i) => {
        if (b["operator"] == "*")
          return (
            <React.Fragment key={i}>
              {b["name"]}: {Math.round(b["value"]*100, 2)}%
              <br />
            </React.Fragment>
          )
        
        return (
          <React.Fragment key={i}>
            {b["name"]}: {b["operator"]}{b["value"]}
            <br />
          </React.Fragment>
        )
      })
    )

    return (
      <div className="bonus-subs">
        {bonusSubs}
      </div>
    )
  }
}


class Subs extends React.Component {
  render() {
    const {
      table,
      data
    } = this.props;

    const subsData = tableToSubs[table]
    if (!subsData) {
      return null;
    }

    const subs = (
      Object.keys(subsData).map(k => {
        const val = subsData[k];

        if (Array.isArray(val)) {
          return (
            <React.Fragment key={k}>
              <span>{k}: {data[val[0]]}/{data[val[1]]}</span>
              <br />
            </React.Fragment>
          )
        }

        return (
          <React.Fragment key={k}>
            <span>{k}: {data[val]}</span>
            <br />
          </React.Fragment>
        )
      })
    )

    return (
      <div className="subs">
        {subs}
      </div>
    )
  }
}


class ListItem extends React.Component {
  render() {
    const {
      data,
      table
    } = this.props;

    return (
      <div className="table-overview-list-item">
        <Link className="table-overview-list-item-inner" to={`/database/${table}/${data.code}`}>
          <Icon table={table} data={data} />
          <div className="center">
            <Name table={table} data={data} />
            <Subs table={table} data={data} />
            <BonusSubs data={data} />
          </div>
          <RightArrow />
        </Link>
      </div>
    )
  }
}


export default class TableOverview extends React.Component {
  constructor(props) {
    super(props);

    this.table = this.props.match.params.table;
    this.auth = new AuthService();

    this.state = this._getDefaultState();

    this._getFilteredItems = this._getFilteredItems.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.updateUrlParameters = this.updateUrlParameters.bind(this);
    this.setStateBasedOnUrlParameter = this.setStateBasedOnUrlParameter.bind(this);
  }

  _getDefaultState() {
    return {
      error: false,
      errorMessage: "",
      data: [],
      loading: true,
      filterVisible: false,
      searchString: "",
      order: (tablesInitDesc.indexOf(this.table) > -1) ? "desc" : "asc",
      sortBy: (this.table == "quest") ? "level" : "added",
      filterBy: "all",
      location: "location:-1",
      selectedBonusCodes: [],
      currentPage: 0,
    }
  }

  _fetchItemData() {
    this.auth.fetch("GET", "database/" + this.table)
      .then(res => {
        if (res.error) {
          this.setState({
            error: true,
            errorMessage: res.errorMessage
          })
        }
        else {
          this.setState({
            data: res.body,
            loading: false,
          })
        }
      })
  }

  _getFilteredItems() {
    let {
      searchString,
      data,
      order,
      sortBy,
      filterBy,
      location,
      selectedBonusCodes,
    } = this.state;

    let items = []
    if (searchString.length >= 1) {
      items = data.filter(o => o.name.toLowerCase().includes(searchString.toLowerCase()));
    }
    else {
      items = Object.assign([], data);

      // Location
      if (location) {
        let locationNum = parseInt(location.split(":")[1]);
        if (locationNum != -1) {
          items = items.filter(item => item.location == locationNum);
        }
      }

      // Bonus Stats
      if (selectedBonusCodes.length >= 1) {
        items = items.filter(item => {
          let itemBonusCodes = [];
          [1, 2, 3, 4, 5].forEach(n => itemBonusCodes.push(item[`bonus_code_${n}`]));
          return selectedBonusCodes.every(r => itemBonusCodes.includes(r));
        })
      }

      // Filter
      if (filterBy != "all") {
        if (filterBy.includes("monster_rating:")) {
          let rating = parseInt(filterBy.split("monster_rating:")[1]);
          items = items.filter(item => item.rating_type == rating);
        }
        else if (filterBy.includes("class_land:")) {
          let className = filterBy.split("class_land:")[1];
          items = items.filter(item => item.class_land.includes(className));
        }
      }

      // Sorting
      if (sortBy != "added") {
        items = items.sort((a, b) => ((a[sortBy] < b[sortBy]) ? -1 : ((a[sortBy] > b[sortBy]) ? 1 : 0)));
      };

      // Order
      if (order == "desc") {
        items.reverse();
      }
    }

    return items;
  }

  componentDidMount() {
    this._fetchItemData();
    this.setStateBasedOnUrlParameter();
    
    let tableNameSplits = this.table.split("_");
    let title = "";
    tableNameSplits.forEach(s => {
      title += `${s.charAt(0).toUpperCase() + s.slice(1)} `;
    });
    document.title = title;
  }

  componentWillUpdate(nextProps) {
    if (nextProps.match.params.table != this.table) {
      this.table = nextProps.match.params.table;
      this.setState(this._getDefaultState());
      this._fetchItemData();
    }
  }

  handlePageChange(event) {
    this.setState({currentPage: event.selected}, () => {
      this.updateUrlParameters();
    })
  }

  setStateBasedOnUrlParameter() {
    let urlParams = new URLSearchParams(this.props.location.search);

    let newState = {};

    if (urlParams.has("page")) {
      newState.currentPage = parseInt(urlParams.get("page"));
    }

    if (urlParams.has("search")) {
      newState.searchString = urlParams.get("search");
    }

    if (urlParams.has("order")) {
      newState.order = urlParams.get("order");
    }

    if (urlParams.has("sort")) {
      newState.sortBy = urlParams.get("sort");
    }

    if (urlParams.has("filter")) {
      newState.filterBy = urlParams.get("filter");
    }

    if (urlParams.has("loc")) {
      newState.location = urlParams.get("loc");
    }

    if (urlParams.has("bonuses")) {
      newState.selectedBonusCodes = urlParams.get("bonuses").split(",").map(s => parseInt(s));
    }

    console.log(newState);
    this.setState(newState);

  }

  updateUrlParameters() {
    const {
      currentPage,
      searchString,
      order,
      sortBy,
      filterBy,
      location,
      selectedBonusCodes
    } = this.state;

    let urlParams = new URLSearchParams("");

    urlParams.append("page", currentPage);

    if (searchString.length >= 1) {
      urlParams.append("search", searchString);
    }
    else {
      urlParams.append("order", order);
      urlParams.append("sort", sortBy);

      if (filterBy != "all") {
        urlParams.append("filter", filterBy);
      }

      if (location != "location:-1") {
        urlParams.append("loc", location);
      }

      if (selectedBonusCodes.length >= 1) {
        urlParams.append("bonuses", selectedBonusCodes.toString());
      }
    }

    this.props.history.push({
      search: urlParams.toString()
    })
  }

  handleFilterChange(newState) {
    this.setState(newState, () => {
      this.updateUrlParameters();
    });
  }

  render() {
    const {
      error,
      errorMessage,
      loading,
      filterVisible,
      searchString,
      order,
      sortBy,
      filterBy,
      location,
      currentPage,
      selectedBonusCodes,
    } = this.state;

    if (error) {
      throw Error(errorMessage);
    }

    if (loading) {
      return <LoadingScreen />;
    }

    const itemsPerPage = 50;
    const items = this._getFilteredItems();
    const startOffset = currentPage * itemsPerPage
    const pageItems = items.slice(startOffset, startOffset + itemsPerPage);
    const pageCount = Math.ceil(items.length / itemsPerPage);

    const pageRangeDisplayed = isMobile ? 3: 7;
    const marginPagesDisplayed = isMobile ? 1 : 3;

    return (
      <>
        <FilterMenu
          changeState={this.handleFilterChange}
          table={this.table}
          filterVisible={filterVisible}
          searchString={searchString}
          order={order}
          sortBy={sortBy}
          filterBy={filterBy}
          location={location}
          selectedBonusCodes={selectedBonusCodes}
        />

        <div className="react-paginate-wrapper">
          <ReactPaginate
            forcePage={currentPage}
            pageCount={pageCount}
            pageRangeDisplayed={pageRangeDisplayed}
            marginPagesDisplayed={marginPagesDisplayed}
            onPageChange={this.handlePageChange}
            containerClassName="react-paginate-container"
            pageClassName="react-paginate-button"
            pageLinkClassName="react-paginate-button-inner"
            previousClassName="react-paginate-button"
            previousLinkClassName="react-paginate-button-inner"
            nextClassName="react-paginate-button"
            nextLinkClassName="react-paginate-button-inner"
            breakClassName="react-paginate-button"
            breakLinkClassName="react-paginate-button-inner"
          />
        </div>

        <div className="list-wrapper">
          <div>
            {pageItems.map((item, index) => <ListItem key={index} table={this.table} data={item} />)}
          </div>
        </div>

        <div className="react-paginate-wrapper">
          <ReactPaginate 
            forcePage={currentPage}
            pageCount={pageCount}
            pageRangeDisplayed={pageRangeDisplayed}
            marginPagesDisplayed={marginPagesDisplayed}
            onPageChange={this.handlePageChange}
            containerClassName="react-paginate-container"
            pageClassName="react-paginate-button"
            pageLinkClassName="react-paginate-button-inner"
            previousClassName="react-paginate-button"
            previousLinkClassName="react-paginate-button-inner"
            nextClassName="react-paginate-button"
            nextLinkClassName="react-paginate-button-inner"
            breakClassName="react-paginate-button"
            breakLinkClassName="react-paginate-button-inner"
          />
        </div>
      </>
    )
  }
}
