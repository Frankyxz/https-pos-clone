// import DateRange from "../../components/DateRange";
// import DataTable from "react-data-table-component";
// import { DataTable } from "primereact/datatable";
// import { Column } from "primereact/column";
// import "../styles/reports.css"
// import "../styles/pos_react.css";
import { customStyles } from "../styles/table-style";
import React, { useEffect, useState, useRef } from "react";
import { Button, Dropdown } from "react-bootstrap";
import BASE_URL from "../../assets/global/url";
import axios from "axios";
import noData from "../../assets/icon/no-data.png";
import DataTable from "react-data-table-component";
import swal from "sweetalert";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { InputText } from "primereact/inputtext";
import { jwtDecode } from "jwt-decode";
import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";

const RfidReports = ({ authrztn }) => {
  const [userId, setuserId] = useState("");
  const [loadHistory, setLoadHistory] = useState([]);
  const [globalFilter, setGlobalFilter] = useState(null);
  const [fromDate, setFromDate] = useState();
  const [endDate, setEndDate] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [filteredTransactions, setFilteredTransactions] = useState(loadHistory);

  const dt = useRef(null);

  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
    }
  };

  useEffect(() => {
    decodeToken();
  }, []);

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
    const filteredData = loadHistory.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      const start = new Date(fromDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return (
        (!fromDate || transactionDate >= start) &&
        (!endDate || transactionDate <= end)
      );
    });
    setFilteredTransactions(filteredData);
  }, [fromDate, endDate, loadHistory]);

  const reloadTableLoadhistory = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/reports/fetchRFIDtransactions`);
      setLoadHistory(res.data);
      setIsLoading(false);
    } catch (error) {
      // console.error(error);
      setIsLoading(true);
    }
  };

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

  useEffect(() => {
    const timer = setTimeout(() => {
      reloadTableLoadhistory();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  function formatDate(datetime) {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(datetime).toLocaleString("en-US", options);
  }

  const header = (
    <div className="table-header">
      <span className="p-input-icon-left">
        {/* <i className="pi pi-search" /> */}
        <InputText
          type="search"
          onInput={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className="form-control search"
          style={{ width: "300px" }}
        />
      </span>
    </div>
  );

  const handleExport = (format) => {
    if (filteredTransactions.length <= 0) {
      swal({
        title: "There are no data to export!",
        icon: "error",
        button: "OK",
      }).then(() => {
        swal.close();
      });

      return;
    }
    // Extract specific fields for export
    axios.post(`${BASE_URL}/reports/rfidReportsLog`, {
      userId,
      format,
    });
    if (format == "excel") {
      const exportedData = filteredTransactions.map((item) => ({
        "TRANSACTION DATE": item.createdAt,
        "RFID NUMBER": item.student_balance.student.rfid,
        "ACCOUNT NAME": `${item.student_balance.student.first_name} ${item.student_balance.student.last_name}`,
        BALANCE: item.student_balance.balance,
        "TOP UP AMOUNT": item.load_amount,
      }));
      // Convert exported data to CSV format
      const csv = [
        Object.keys(exportedData[0]).join(","), // Header row
        ...exportedData.map((item) => Object.values(item).join(",")),
      ].join("\n");
      // Create a Blob containing the CSV data
      const blob = new Blob([csv], { type: "text/csv" });
      // Create a download link and trigger the download
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "rfid_reports.csv";
      link.click();
    } else {
      const doc = new jsPDF({ orientation: "landscape" });

      const tableData = filteredTransactions.map((item) => [
        new Date(item.createdAt).toISOString().split("T")[0],
        item.student_balance.student.rfid,
        `${item.student_balance.student.first_name} ${item.student_balance.student.last_name}`,
        item.student_balance.balance,
        item.load_amount,
      ]);

      doc.autoTable({
        head: [
          [
            "TRANSACTION DATE",
            "RFID NUMBER",
            "ACCOUNT NAME",
            "BALANCE",
            "TOP UP AMOUNT",
          ],
        ],
        body: tableData,
      });
      const link = document.createElement("a");
      const pdfBlob = new Blob([doc.output()], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);
      link.href = window.URL.createObjectURL(pdfBlob);
      link.download = "rfid_reports.pdf";
      link.click();
      window.open(url);
    }
  };

  const handleSelectExport = () => {
    swal({
      title: `Select Export format`,
      text: `Please select export format you desired`,
      buttons: {
        excel: {
          text: "Excel",
          value: "excel",
          className: "--excel",
        },
        pdf: {
          text: "PDF",
          value: "pdf",
          className: "--pdf",
        },
      },
    }).then((value) => {
      if (value === "excel") {
        handleExport("excel");
      } else if (value === "pdf") {
        handleExport("pdf");
      }
    });
  };

  const columns = [
    {
      name: "TRANSACTION DATE",
      selector: (row) => row.createdAt,
      cell: (row) => formatDate(row.createdAt),
      sortable: true,
    },
    {
      name: "RFID NUMBER",
      selector: (row) => row.student_balance.student.rfid,
      cell: (row) => row.student_balance.student.rfid,
      sortable: true,
    },
    {
      name: "ACCOUNT NAME",
      selector: (row) =>
        `${row.student_balance.student.first_name} ${row.student_balance.student.last_name}`,
      cell: (row) =>
        `${row.student_balance.student.first_name} ${row.student_balance.student.last_name}`,
      sortable: true,
    },
    {
      name: "BALANCE",
      selector: (row) => row.student_balance.balance,
      cell: (row) => row.student_balance.balance,
      sortable: true,
    },
    {
      name: "TOP UP AMOUNT",
      selector: (row) => row.load_amount,
      cell: (row) => row.load_amount,
      sortable: true,
    },
  ];
  const handleClearFilter = () => {
    setFromDate("");
    setEndDate("");
  };

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
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

  return (
    <>
      <div className="inventory-container">
        {/* Card */}
        {isLoading ? (
          <div className="loading-container" style={{ margin: "0" }}>
            <FourSquare
              color="#6290FE"
              size="large"
              text="Loading Data..."
              textColor=""
            />
          </div>
        ) : authrztn.includes("RFIDReport-View") ? (
          <div className="custom-card inv-card">
            <div className="pos-head-container">
              <div className="title-content-field">
                <h2>RFID Reload Card Reports</h2>
                <h4 id="dateFilterIndicator"></h4>
              </div>
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

            <div className="table">
              {filteredTransactions.length == 0 ? (
                <>
                  <div className="no-data-table ">
                    <table>
                      <thead>
                        <th>TRANSACTION DATE</th>
                        <th>RFID NUMBER</th>
                        <th>ACCOUNT NAME</th>
                        <th>BALANCE</th>
                        <th>TOP UP AMOUNT</th>
                      </thead>
                      <tbody className="r-no-data">
                        <div>
                          <img
                            src={noData}
                            alt="No Data"
                            className="r-data-icon"
                          />
                          <h2 className="no-data-label">No Data Found</h2>
                        </div>
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-data-table">
                    <DataTable
                      columns={columns}
                      data={filteredTransactions}
                      paginationRowsPerPageOptions={[5, 10, 25]}
                      pagination
                      customStyles={customStyles}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="export-container">
              {authrztn?.includes("RFIDReport-IE") && (
                <button
                  onClick={handleSelectExport}
                  // className={`${
                  //   filteredTransactions.length == 0 ? "e-data" : "e-data"
                  // }`}
                  className="e-data"
                >
                  Export Data
                </button>
              )}
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
      </div>
    </>
  );
};

export default RfidReports;
