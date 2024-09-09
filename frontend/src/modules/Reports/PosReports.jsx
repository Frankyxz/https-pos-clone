import React, { useEffect, useState, useRef } from "react";
import { Button, Dropdown } from "react-bootstrap";
import BASE_URL from "../../assets/global/url";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import swal from "sweetalert";
import { InputText } from "primereact/inputtext";
import noData from "../../assets/icon/no-data.png";
// import "../styles/reports.css"
// import "../styles/pos_react.css";
import DataTable from "react-data-table-component";
import { customStyles } from "../styles/table-style";
// import Form from "react-bootstrap/Form";
import { jwtDecode } from "jwt-decode";
import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";

const PosReports = ({ authrztn }) => {
  const [userId, setuserId] = useState("");
  const [posTransaction, setPOStransaction] = useState([]);
  const [globalFilter, setGlobalFilter] = useState(null);
  const [fromDate, setFromDate] = useState();
  const [endDate, setEndDate] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [filteredTransactions, setFilteredTransactions] =
    useState(posTransaction);

  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);

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
    const filteredData = posTransaction.filter((transaction) => {
      const transactionDate = new Date(transaction.order_transaction.createdAt);
      const start = new Date(`${fromDate}T00:00:00Z`);
      const end = new Date(`${endDate}T23:59:59Z`);

      return (
        (!fromDate || transactionDate >= start) &&
        (!endDate || transactionDate <= end)
      );
    });
    setFilteredTransactions(filteredData);
    console.log(filteredData);
  }, [fromDate, endDate, posTransaction]);

  const dt = useRef(null);

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

  const reloadPOSTransactionhistory = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/reports/fetchPOStransactions`);
      setPOStransaction(res.data);
      setIsLoading(false);
    } catch (error) {
      // console.error(error);
      setIsLoading(true);
    }
  };

  useEffect(() => {
    console.log("POOOS", filteredTransactions);
  }, [filteredTransactions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      reloadPOSTransactionhistory();
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
    axios.post(`${BASE_URL}/reports/posReportsLog`, {
      userId,
      format,
    });
    if (format == "excel") {
      const exportedData = filteredTransactions.map((item) => ({
        "TRANSACTION DATE": item.order_transaction.createdAt,
        "TRANSACTION ID": item.order_transaction.order_number,
        "PRODUCT NAME":  item.cart_specification_variants.length > 0 
        ? `${item.product_inventory.product.name} (${item.cart_specification_variants.map(variant => variant.specification_variant.variant_name).join(", ")})`
        : item.product_inventory.product.name,
        QUANTITY: item.quantity,
        "UNIT PRICE": item.product_inventory.product.price,
        AMOUNT: item.subtotal,
        STATUS:
          item.order_transaction.status === "Ordered"
            ? "Success"
            : item.order_transaction.status,
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
      link.download = "pos_reports.csv";
      link.click();
    } else {
      const doc = new jsPDF({ orientation: "landscape" });

      const tableData = filteredTransactions.map((item) => {
        let status =
          item.order_transaction.status === "Ordered"
            ? "Success"
            : item.order_transaction.status;


        let prodName =  item.cart_specification_variants.length > 0 
        ? `${item.product_inventory.product.name} (${item.cart_specification_variants.map(variant => variant.specification_variant.variant_name).join(", ")})`
        : item.product_inventory.product.name

        return [
          new Date(item.order_transaction.createdAt)
            .toISOString()
            .split("T")[0],
          item.order_transaction.order_number,
          prodName,
          item.quantity,
          item.product_inventory.product.price,
          item.subtotal,
          status,
        ];
      });

      doc.autoTable({
        head: [
          [
            "TRANSACTION DATE",
            "TRANSACTION ID",
            "PRODUCT NAME",
            "QUANTITY",
            "UNIT PRICE",
            "AMOUNT",
            "STATUS",
          ],
        ],
        body: tableData,
      });
      const link = document.createElement("a");
      const pdfBlob = new Blob([doc.output()], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);
      link.href = window.URL.createObjectURL(pdfBlob);
      link.download = "pos_reports.pdf";
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

  const columns = [
    {
      name: "TRANSACTION DATE",
      selector: (row) => formatDate(row.order_transaction.createdAt),
      sortable: true,
    },
    {
      name: "TRANSACTION ID",
      selector: (row) => row.order_transaction.order_number,
      sortable: true,
    },
    {
      name: "PRODUCT NAME",
      selector: (row) => 
        row.cart_specification_variants.length > 0 
          ? `${row.product_inventory.product.name} (${row.cart_specification_variants.map(variant => variant.specification_variant.variant_name).join(", ")})`
          : row.product_inventory.product.name,
    },
    
    {
      name: "QTY",
      selector: (row) => row.quantity,
      sortable: true,
    },
    {
      name: "UNIT PRICE",
      selector: (row) => row.purchased_amount,
      sortable: true,
    },
    {
      name: "AMOUNT",
      selector: (row) => row.subtotal,
      sortable: true,
    },
    {
      name: "STATUS",
      selector: (row) =>
        row.order_transaction.status === "Ordered"
          ? "Success"
          : row.order_transaction.status,
      cell: (row) => (
        <div
          style={{
            backgroundColor:
              row.order_transaction.status === "Ordered"
                ? "green"
                : row.order_transaction.status === "Void"
                ? "red"
                : row.order_transaction.status === "Cancelled"
                ? "gray"
                : "orange",
            padding: "5px",
            width: "6em",
            color: "white",
            textAlign: "center",
            borderRadius: "5px",
          }}
        >
          {row.order_transaction.status === "Ordered"
            ? "Success"
            : row.order_transaction.status}
        </div>
      ),
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
        ) : authrztn.includes("POSReport-View") ? (
          <div className="custom-card inv-card">
            <div className="pos-head-container">
              <div className="title-content-field">
                <h2>POS Transaction Report</h2>
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

            <div className="table custom-datatable pos-rep">
              {filteredTransactions.length == 0 ? (
                <>
                  <div className="no-data-table">
                    <table>
                      <thead>
                        <th>TRANSACTION DATE</th>
                        <th>TRANSACTION ID</th>
                        <th>PRODUCT NAME</th>
                        <th>QTY</th>
                        <th>UNIT PRICE</th>
                        <th>AMOUNT</th>
                        <th>STATUS</th>
                        <th>PAYMENT METHOD</th>
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
                      pagination
                      paginationRowsPerPageOptions={[5, 10, 25]}
                      highlightOnHover
                      customStyles={customStyles}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="export-container">
              {authrztn?.includes("POSReport-IE") && (
                <button onClick={handleSelectExport} className="e-data">
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

export default PosReports;
