import React, { useState, useEffect, useRef } from "react";
import _Sidebar from "../Sidebar/_Sidebar";
// import "../styles/pos_react.css";
import "../styles/dashboard.css";
import netSale from "../../assets/icon/net-sales.png";
import cart from "../../assets/icon/cart.png";
import { Button, Dropdown, Modal, ModalFooter } from "react-bootstrap";
import BASE_URL from "../../assets/global/url";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { FourSquare } from "react-loading-indicators";
import noData from "../../assets/icon/no-data.png";
import NoAccess from "../../assets/image/NoAccess.png";

const DashBoard = ({ authrztn }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [arrow, setArrow] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [storeName, setStoreName] = useState("");
  const [storeCode, setStoreCode] = useState("");
  const [storeStatus, setStoreStatus] = useState(null);
  const [totalPayableAmount, setTotalPayableAmount] = useState(0);
  const [totalInventoryAccumulate, setTotalInventoryAccumulate] = useState(0);
  const [totalRawInventoryAccumulate, setTotalRawInventoryAccumulate] =
    useState(0);
  const [totalOrdered, setTotalOrdered] = useState(0);
  const [totalItemSold, setTotalItemSold] = useState(0);
  const [userId, setuserId] = useState("");
  const [activityLogs, setActivityLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState(activityLogs);
  const [dropdownLogs, setDropdownLogs] = useState([]);

  const [filterDropLogs, setFilterDropLogs] = useState(dropdownLogs);
  const [selectedId, setSelectedId] = useState(null);

  // Modal
  const [showDetails, setShowDetails] = useState(false);
  const [masterName, setMasterName] = useState("");

  const [expandedRow, setExpandedRow] = useState(null);

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
    }
  };
  const todayDate = new Date().toISOString().split("T")[0];
  //function at fetching sa pagclick ng row para magdisplay ang logs sa system
  const handleRowClick = (id, i, masterListName) => {
    setSelectedId(id);
    setExpandedRow(expandedRow == i ? null : i);
    setMasterName(masterListName);
    handleFilterToday();

    setShowDetails(true);

    // setArrow(!arrow);
    axios
      .get(`${BASE_URL}/activityLog/fetchDropdownActivityLog`, {
        params: { id },
      })
      .then((res) => {
        // const filteredLogs = filterDropLogsByDate(res.data);
        setDropdownLogs(res.data);
      })
      .catch((err) => console.log(err));
  };

  const filterDropLogsByDate = (logs) => {
    const today = new Date().toISOString().split("T")[0];
    return logs.filter((log) => {
      const logDate = new Date(log.createdAt).toISOString().split("T")[0];
      return logDate === today;
    });
  };
  //function at fetching sa pagclick ng row para magdisplay ang logs sa system

  //update for close and open of store
  const handleUpdateStatus = async () => {
    try {
      const newStatus = !storeStatus;
      const res = await axios.put(`${BASE_URL}/store_profile/update_status`, {
        storeStatus: newStatus,
        userId,
      });

      handleFetchStatus();
    } catch (err) {
      console.error("Error updating store status:", err);
    }
  };
  //update for close and open of store

  //displaying ng date and time sa dashboard
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function formatDateTime(datetime) {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(datetime).toLocaleString("en-US", options);
  }

  const formattedDate = currentTime.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = currentTime.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
  //displaying ng date and time sa dashboard

  //condition sa pagfetch ng user activity kada araw
  const filterLogsByDate = () => {
    const today = new Date().toISOString().split("T")[0];
    const filtered = activityLogs.filter((log) => {
      const logDate = new Date(log.maxCreatedAt).toISOString().split("T")[0];
      return logDate === today;
    });
    setFilteredLogs(filtered);
  };

  useEffect(() => {
    if (activityLogs.length) {
      filterLogsByDate();
    }
  }, [activityLogs]);
  //condition sa pagfetch ng user activity kada araw

  const handleFetchActivityLog = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/activityLog/getActivityLog`);
      setActivityLogs(res.data);
      setIsLoading(false);
    } catch (error) {
      // console.error("Error fetching activity logs:", error);
    }
  };

  const handleFetchProfile = async () => {
    const res = await axios.get(`${BASE_URL}/store_profile/fetchProfile`);
    setStoreCode(res.data.store_code);
    setStoreName(res.data.store_name || "ELI");
    setIsLoading(false);
  };

  const handleFetchStatus = async () => {
    const res = await axios.get(`${BASE_URL}/store_profile/fetchStatus`);
    setStoreStatus(res.data.status);
    setIsLoading(false);
  };

  const handleDashboardData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/store_profile/DashboardData`);
      setTotalPayableAmount(res.data.totalPayableAmount || 0);
      setTotalInventoryAccumulate(res.data.totalInventoryPrice || 0);
      setTotalRawInventoryAccumulate(res.data.totalRawInventoryPrice || 0);
      setTotalOrdered(res.data.totalOrder || 0);
      setTotalItemSold(res.data.totalProductSold || 0);
    } catch (error) {
      // Handle the error appropriately
      console.error("Error fetching dashboard data:", error);
      // Set defaults or handle error state
      setTotalPayableAmount(0);
      setTotalInventoryAccumulate(0);
      setTotalRawInventoryAccumulate(0);
      setTotalOrdered(0);
      setTotalItemSold(0);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    decodeToken();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFetchStatus();
      handleFetchProfile();
      handleDashboardData();
      handleFetchActivityLog();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  //value ng netsales subtract ang raw, product sa nabentang product
  const netSales = totalPayableAmount;
  // - (totalInventoryAccumulate + totalRawInventoryAccumulate);

  const [showDropdown, setShowDropdown] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const dropdownRef = useRef(null);

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const filteredData = dropdownLogs.filter((inv) => {
      const transactionDate = new Date(inv.createdAt);
      const start = new Date(`${fromDate}T00:00:00Z`);
      const end = new Date(`${endDate}T23:59:59Z`);

      return (
        (!fromDate || transactionDate >= start) &&
        (!endDate || transactionDate <= end)
      );
    });
    setFilterDropLogs(filteredData);
  }, [fromDate, endDate, dropdownLogs]);

  useEffect(() => {
    console.log("FilteDrop", filterDropLogs);
    console.log("Drop", filterDropLogs);
  }, [filterDropLogs, dropdownLogs]);

  const handleFilterToday = () => {
    const currentDate = new Date().toISOString().split("T")[0];
    setFromDate(`${currentDate}`);
    setEndDate(`${currentDate}`);
    console.log(currentDate);
  };

  const handleFilterYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split("T")[0];
    setFromDate(yesterdayDate);
    setEndDate(yesterdayDate);
  };

  const handleFilterLast7Days = () => {
    const today = new Date();
    const last7Days = new Date();
    last7Days.setDate(today.getDate() - 7);
    const todayDate = today.toISOString().split("T")[0];
    const last7DaysDate = last7Days.toISOString().split("T")[0];
    setFromDate(last7DaysDate);
    setEndDate(todayDate);
  };

  const handleFilterLast30Days = () => {
    const today = new Date();
    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 30);

    const todayDate = today.toISOString().split("T")[0];
    const last30DaysDate = last30Days.toISOString().split("T")[0];

    setFromDate(last30DaysDate);
    setEndDate(todayDate);
  };

  const handleClearFilter = () => {
    setFromDate("");
    setEndDate("");
  };

  const handleFilterIndicator = (filterApplied) => {
    let filterText = document.getElementById("dateFilterIndicator");
    let baseText = "Date Filter Applied: ";
    filterText.innerHTML =
      baseText +
      `<span style="color: #3a74a9; font-weight: bold;">${filterApplied}</span>`;
  };

  const handleFilterIndicatorRange = (from, end) => {
    let filterText = document.getElementById("dateFilterIndicator");
    let baseText = "Date Filter Applied: ";
    let rangeText = from + " to " + end;
    filterText.innerHTML =
      baseText +
      `<span style="color: #3a74a9; font-weight: bold;">${rangeText}</span>`;
  };

  const clearFilterIndicatorText = () => {
    let filterText = document.getElementById("dateFilterIndicator");
    filterText.textContent = "";
  };

  useEffect(() => {
    console.log("Logs", activityLogs);
    console.log("Filtered", filteredLogs);
  }, [activityLogs, filteredLogs]);

  return (
    <>
      {isLoading ? (
        <div
          className="loading-container"
          // style={{ margin: "0", marginTop: "18%", marginLeft: "250px" }}
        >
          <FourSquare
            color="#6290FE"
            size="large"
            text="Loading Data..."
            textColor=""
          />
        </div>
      ) : authrztn.includes("Dashboard-View") ? (
        <div className="dashboard-container">
          <div className="custom-card dash-card">
            <div className="store-details">
              <div className="store-container">
                <p>Store Name:</p>
                <p style={{ textTransform: "uppercase" }}>
                  {storeCode}-{storeName}
                </p>
              </div>
              <div className="store-container">
                <p>Store Status:</p>
                <button
                  className={`${storeStatus ? "stats" : "stats-close"}`}
                  onClick={handleUpdateStatus}
                >
                  {storeStatus ? <>OPEN</> : <>CLOSE</>}
                </button>
              </div>
              <div className="store-container">
                <p>Date Time:</p>
                <p>
                  {formattedDate} {formattedTime}
                </p>
              </div>
            </div>
            <hr />
            <div className="sales-details">
              {/* <div className="dash-date-container">
              <div className="dash-from-container">
                <h3>From</h3>
                <input type="date" className="form-control" />
              </div>
              <div className="dash-from-container">
                <h3>To</h3>
                <input type="date" className="form-control" />
              </div>
            </div> */}

              <div className="sales-container custom-card">
                <img src={netSale} />
                <div className="sale">
                  <p>Net Sales</p>
                  <h3>
                    {netSales.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h3>
                </div>
              </div>
              <div className="sales-container custom-card">
                <img src={cart} />
                <div className="sale">
                  <p>Number of Purchased</p>
                  <h3>{totalOrdered}</h3>
                </div>
              </div>
              <div className="sales-container itm-sold custom-card">
                <i class="bx bx-check-circle"></i>
                <div className="sale">
                  <p>Item Sold</p>
                  <h3>{totalItemSold}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="terminal-container mt-3">
            <div className="custom-card terminal-dash">
              <div className="title-content-field pos-head">
                <h6>System Logs</h6>
              </div>
              <hr />
              <table className="custom-table dash-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Terminal number</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((data, index) => (
                    <>
                      <tr>
                        <td
                          onClick={() =>
                            handleRowClick(
                              data.masterlist_id,
                              index,
                              data.masterlist.col_name
                            )
                          }
                        >
                          {data.masterlist.col_name}
                        </td>
                        <td
                          onClick={() =>
                            handleRowClick(
                              data.masterlist_id,
                              index,
                              data.masterlist.col_name
                            )
                          }
                        >
                          {data.masterlist.user_type}
                        </td>
                        <td
                          onClick={() =>
                            handleRowClick(
                              data.masterlist_id,
                              index,
                              data.masterlist.col_name
                            )
                          }
                        >
                          {data.masterlist.col_status}
                        </td>
                        <td
                          onClick={() =>
                            handleRowClick(
                              data.masterlist_id,
                              index,
                              data.masterlist.col_name
                            )
                          }
                        >
                          {/* <div>
                            <i
                              className={`bx ${
                                expandedRow === index
                                  ? "bx-chevron-up"
                                  : "bx-chevron-down"
                              }`}
                              onClick={() =>
                                expandedRow === index
                                  ? setExpandedRow(null)
                                  : setExpandedRow(index)
                              }
                            ></i>
                          </div> */}
                        </td>
                      </tr>

                      {/* {expandedRow === index && (
                        <tr>
                          <td colSpan="4">
                            <table>
                              <thead>
                                <tr>
                                  <th>Activity Logs</th>
                                  <th>Date / Time</th>
                                  <th>
                                    <div className="filter-button-container">
                                      <div className="filter-button-container-container">
                                        <Button
                                          className="responsive nowrap"
                                          style={{ padding: "1px" }}
                                          onClick={handleDropdownToggle}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            fill="currentColor"
                                            className="bi bi-filter"
                                            viewBox="0 0 16 16"
                                          >
                                            <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5" />
                                          </svg>
                                          Filter
                                        </Button>

                                        {showDropdown && (
                                          <Dropdown.Menu
                                            ref={dropdownRef}
                                            show
                                            className="dropdown-menu"
                                          >
                                            <div className="filter-menu-container">
                                              <div className="filter-menu-title-container">
                                                Filter by date
                                                <Dropdown.Divider />
                                              </div>

                                              <div className="filter-menu-body-container">
                                                <div className="days-modal-container">
                                                  <Dropdown.Item
                                                    onClick={() => {
                                                      handleFilterToday();
                                                      handleFilterIndicator(
                                                        "Today"
                                                      );
                                                    }}
                                                  >
                                                    Today
                                                  </Dropdown.Item>
                                                  <Dropdown.Item
                                                    onClick={() => {
                                                      handleFilterYesterday();
                                                      handleFilterIndicator(
                                                        "Yesterday"
                                                      );
                                                    }}
                                                  >
                                                    Yesterday
                                                  </Dropdown.Item>
                                                  <Dropdown.Item
                                                    onClick={() => {
                                                      handleFilterLast7Days();
                                                      handleFilterIndicator(
                                                        "Last 7 Days"
                                                      );
                                                    }}
                                                  >
                                                    Last 7 days
                                                  </Dropdown.Item>
                                                  <Dropdown.Item
                                                    onClick={() => {
                                                      handleFilterLast30Days();
                                                      handleFilterIndicator(
                                                        "Last 30 Days"
                                                      );
                                                    }}
                                                  >
                                                    Last 30 days
                                                  </Dropdown.Item>
                                                  <Dropdown.Item
                                                    className="clear-filt"
                                                    onClick={() => {
                                                      handleClearFilter();
                                                      clearFilterIndicatorText();
                                                    }}
                                                  >
                                                    Clear Filter
                                                  </Dropdown.Item>
                                                </div>

                                                <div className="date-range">
                                                  <p>From:</p>
                                                  <input
                                                    type="date"
                                                    className="form-control i-date"
                                                    id="exampleFormControlInput1"
                                                    value={fromDate}
                                                    onChange={(e) => {
                                                      setFromDate(
                                                        e.target.value
                                                      );
                                                      handleFilterIndicatorRange(
                                                        e.target.value,
                                                        endDate
                                                      );
                                                    }}
                                                  />

                                                  <p>To:</p>
                                                  <input
                                                    type="date"
                                                    className="form-control i-date"
                                                    id="exampleFormControlInput1"
                                                    value={endDate}
                                                    onChange={(e) => {
                                                      setEndDate(
                                                        e.target.value
                                                      );
                                                      handleFilterIndicatorRange(
                                                        fromDate,
                                                        e.target.value
                                                      );
                                                    }}
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          </Dropdown.Menu>
                                        )}
                                      </div>
                                    </div>
                                  </th>
                                </tr>
                              </thead>

                              <tbody style={{ height: "400px" }}>
                                {filterDropLogs.map((data, i) => (
                                  <tr key={i}>
                                    <td>{data.action_taken}</td>
                                    <td>{formatDateTime(data.createdAt)}</td>
                                    <td></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )} */}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <img src={NoAccess} alt="NoAccess" className="no-access-img" />
          <h3>You don't have access to this function.</h3>
        </div>
      )}

      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="xl">
        <Modal.Header>
          <div className="d-flex w-100 p-3 justify-content-between align-items-center">
            <div>
              <p className="h2">{masterName}</p>
            </div>
            <h4 id="dateFilterIndicator"></h4>
            <div className="d-flex p-0 align-items-center">
              <div className="filter-button-container">
                <div className="filter-button-container-container">
                  <Button
                    className="responsive nowrap"
                    onClick={handleDropdownToggle}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-filter"
                      viewBox="0 0 16 16"
                    >
                      <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5" />
                    </svg>
                    Filter
                  </Button>

                  {showDropdown && (
                    <Dropdown.Menu
                      ref={dropdownRef}
                      show
                      className="dropdown-menu"
                    >
                      <div className="filter-menu-container">
                        <div className="filter-menu-title-container">
                          Filter by date
                          <Dropdown.Divider />
                        </div>

                        <div className="filter-menu-body-container">
                          <div className="days-modal-container">
                            <Dropdown.Item
                              onClick={() => {
                                handleFilterToday();
                                handleFilterIndicator("Today");
                              }}
                            >
                              Today
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => {
                                handleFilterYesterday();
                                handleFilterIndicator("Yesterday");
                              }}
                            >
                              Yesterday
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => {
                                handleFilterLast7Days();
                                handleFilterIndicator("Last 7 Days");
                              }}
                            >
                              Last 7 days
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => {
                                handleFilterLast30Days();
                                handleFilterIndicator("Last 30 Days");
                              }}
                            >
                              Last 30 days
                            </Dropdown.Item>
                            <Dropdown.Item
                              className="clear-filt"
                              onClick={() => {
                                handleClearFilter();
                                clearFilterIndicatorText();
                              }}
                            >
                              Clear Filter
                            </Dropdown.Item>
                          </div>

                          <div className="date-range">
                            <p>From:</p>
                            <input
                              type="date"
                              className="form-control i-date"
                              id="exampleFormControlInput1"
                              value={fromDate}
                              onChange={(e) => {
                                setFromDate(e.target.value);
                                handleFilterIndicatorRange(
                                  e.target.value,
                                  endDate
                                );
                              }}
                            />

                            <p>To:</p>
                            <input
                              type="date"
                              className="form-control i-date"
                              id="exampleFormControlInput1"
                              value={endDate}
                              onChange={(e) => {
                                setEndDate(e.target.value);
                                handleFilterIndicatorRange(
                                  fromDate,
                                  e.target.value
                                );
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </Dropdown.Menu>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-category ">
            <div className="filtering-category-container d-flex justify-content-between">
              <div className="d-flex receivingID p-0"></div>
            </div>
            <div className="mt-4">
              <div className="table-container">
                {filterDropLogs.length == 0 ? (
                  <>
                    <div className="dash-tb">
                      <table className="custom-user-table user-transac-table">
                        <thead>
                          <th>Activity Logs</th>
                          <th>Date / Time</th>
                        </thead>
                        <tbody style={{ height: "300px" }}>
                          <div>
                            <img
                              src={noData}
                              alt="No Data"
                              className="no-data-icon mt-0"
                            />
                            <h2 className="no-data-label">No Data Found</h2>
                          </div>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <>
                    {" "}
                    <table className="custom-user-table user-transac-table">
                      <thead>
                        <tr>
                          <th>Activity Logs</th>
                          <th>Date / Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterDropLogs.map((data, i) => (
                          <tr key={i}>
                            <td>{data.action_taken}</td>
                            <td>{formatDateTime(data.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DashBoard;
