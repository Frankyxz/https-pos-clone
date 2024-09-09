import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/nfc.css";
// import "../styles/pos_react.css";
import DataTable from "react-data-table-component";
import { customStyles } from "../styles/table-style";
import rfidLogo from "../../assets/icon/rfid_logo.png";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
import Form from "react-bootstrap/Form";
import IconExel from "../../assets/icon/excel-icon.png";
import swal from "sweetalert";
import studentLogo from "../../assets/icon/student.png";
import empLogo from "../../assets/icon/employee.png";
import departmentLogo from "../../assets/icon/department.png";
import visitorLogo from "../../assets/icon/visitor.png";
import allLogo from "../../assets/icon/all-agree.png";
import { jwtDecode } from "jwt-decode";
import { Modal, Button } from "react-bootstrap";
import nfc from "../../assets/icon/nfc-load.jpeg";
import noData from "../../assets/icon/no-data.png";
import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";

const Nfc = ({ authrztn }) => {
  const [userId, setuserId] = useState("");
  const [loadTransaction, setLoadTransaction] = useState([]);
  const [userListModal, setShowUserListModal] = useState(false);
  const [overAllModal, setOverAllModal] = useState(false);
  const [receiptModal, setReceiptModal] = useState(false);
  const [customerList, setCustomerList] = useState([]);
  const [studentLists, setStudentLists] = useState([]);
  const [file, setFile] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [importModal, setImportModal] = useState(false);
  const [templateModal, setTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const fileRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  //------------------------------------ StudentBalance Render ----------------------------//

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
    }
  };

  const userListColumn = [
    { name: "RFID NUMBER", selector: (row) => row.rfid },
    {
      name: "NAME",
      selector: (row) => row.name,
    },
    {
      name: "BALANCE",
      selector: (row) => row.balance,
    },
  ];

  const userData = customerList.map((data, i) => ({
    key: i,
    rfid: data.student.rfid,
    name: data.student.first_name + " " + data.student.last_name,
    balance: data.balance,
  }));

  const handleLoadStudents = () => {
    swal({
      icon: "success",
      title: "Successfully Loaded",
      text: "Regin Legaspi card has been loaded 1000 successfully!.",
    }).then(() => {
      setOverAllModal(false);
    });
  };
  // useEffect(() => {
  // axios
  // .get(BASE_URL + "/load_transaction/getLoadTransaction")
  // .then((res) => setLoadTransaction(res.data))
  // .catch((err) => console.log(err));
  // }, []);

  useEffect(() => {
    axios
      .get(BASE_URL + "/load_transaction/getLoadTransaction")
      .then((res) => {
        const sortedLoadTransaction = res.data.sort(
          (a, b) => b.load_transaction_id - a.load_transaction_id
        );
        setLoadTransaction(sortedLoadTransaction);
        console.log("Data", sortedLoadTransaction);
      })
      .catch((err) => console.log(err));
  }, []);
  //------------------------------------ End of StudentBalance Render ------------------------//
  //------------------------------------- Fetch Customer List ----------------------------------//
  const fetchCustomerList = async () => {
    try {
      const res = await axios.get(
        BASE_URL + "/load_transaction/getCustomerList"
      );
      const sortedCustomerList = res.data.sort(
        (a, b) => b.student_id - a.student_id
      );
      setCustomerList(sortedCustomerList);
    } catch (error) {
      setIsLoading(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomerList();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  // useEffect(() => {
  //   axios
  //     .get(BASE_URL + "/load_transaction/getCustomerList")
  //     .then((res) => {
  //       const sortedCustomerList = res.data.sort(
  //         (a, b) => b.student_id - a.student_id
  //       );
  //       setCustomerList(sortedCustomerList);
  //     })
  //     .catch((err) => console.log(err));
  // }, []);
  //------------------------------------- End Fetch Customer List ----------------------------------//
  //----------------------------- Date Format -------------------------------------------//
  const formatDate = (dateString) => {
    if (!dateString) return ""; // Handle undefined or null dates
    const date = new Date(dateString);
    if (isNaN(date)) return ""; // Handle invalid dates

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    const year = dateTime.getFullYear();
    const month = (dateTime.getMonth() + 1).toString().padStart(2, "0");
    const day = dateTime.getDate().toString().padStart(2, "0");
    const hours = dateTime.getHours().toString().padStart(2, "0");
    const minutes = dateTime.getMinutes().toString().padStart(2, "0");
    const seconds = dateTime.getSeconds().toString().padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  //----------------------------- End Date Format ------------------------------------------//

  //---------------------------------- Table -------------------------------------------//

  const columns = [
    {
      name: "STUDENT NUMBER / DEPARTMENT NAME",
      selector: (row) => row.student_balance.student.student_number,
    },
    {
      name: "TAP CARD NUMBER",
      selector: (row) => row.student_balance.student.rfid,
    },
    {
      name: "NAME",
      selector: (row) =>
        row.student_balance.student.first_name +
        " " +
        row.student_balance.student.last_name,
    },
    {
      name: "PREVIOUS BALANCE",
      selector: (row) => row.old_balance,
    },
    {
      name: "TOP UP ",
      selector: (row) => row.load_amount,
    },
    {
      name: "NEW BALANCE",
      selector: (row) => row.new_balance,
    },
    // {
    //   name: "EARNED POINTS",
    //   selector: (row) => row.earnedPoints,
    // },
    {
      name: "TRANSACTION DATE",
      selector: (row) => formatDateTime(row.createdAt),
    },
  ];

  //--------------------------------------- End Table ----------------------------------------//
  //-------------------------------- Search Student details using RFID ----------------------------///
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [idNumber, setIDNumber] = useState("");
  const [validity, setValidity] = useState("");
  const [rfid, setRfid] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [studentBalanceId, setStudentBalanceId] = useState("");
  const [topUpCardNumber, setTopUpCardNumber] = useState(null);

  const handleTopUpCardChange = (event) => {
    const value = event.target.value;

    setTopUpCardNumber(value);
    axios
      .get(`${BASE_URL}/load_transaction/getStudentByTopUpCard`, {
        params: {
          topUpCardNumber: value,
        },
      })
      .then((response) => {
        const studentData = response.data;
        setName(
          `${studentData.student.first_name} ${studentData.student.last_name}`
        );
        setBalance(studentData.balance);
        setValidity(studentData.student.validity);
        setStudentBalanceId(studentData.student_balance_id);
      })
      .catch((error) => {
        console.error("Error fetching student data:", error);
        setName("");
        setBalance("");
        setValidity("");
      });
  };
  //-------------------------------- End of Search Student details using RFID -----------------------------//
  //------------------------------- Top Up card --------------------------------------------//

  const [loadMultiple, setLoadMultiple] = useState(false);
  const [studentIDs, setStudentIDS] = useState([]);
  const [checkAll, setCheckAll] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (topUpAmount < 20) {
      swal({
        icon: "error",
        title: "Oops...",
        text: "The minimum Top-Up amount is 20 pesos",
      });
    } else {
      if (loadMultiple) {
        axios
          .post(`${BASE_URL}/load_transaction/multiple-load`, {
            studentIDs,
            topUpAmount: topUpAmount,
            userId,
          })
          .then((res) => {
            swal({
              title: "New Transaction Added",
              text: "All Cards Successfully Loaded",
              icon: "success",
              button: "OK",
            }).then(() => {
              reloadTable();
              reloadTableCustomerList();
              setLoadMultiple(false);
              setStudentIDS([]);
              setTopUpAmount("");
              setName("");
              setValidity("");
              setTopUpCardNumber("");
            });
          });
      } else {
        axios
          .post(`${BASE_URL}/load_transaction/addTopUp`, {
            student_balance_id: studentBalanceId,
            topUpAmount: topUpAmount,
            userId,
          })
          .then((response) => {
            console.log("Top-up saved successfully:", response.data);
            swal({
              title: "New Transaction Added",
              text: "The Transaction has been success",
              icon: "success",
              button: "OK",
            }).then(() => {
              reloadTable();
              reloadTableCustomerList();
              setName("");
              setBalance("");
              setValidity("");
              setTopUpAmount("");
              setTopUpCardNumber("");
            });
          })
          .catch((error) => {
            console.error("Error saving top-up:", error);
          });
      }
    }
  };

  //------------------------------- End Top Up card -------------------------------------------//
  //--------------------------------Reload Table---------------------------------//
  const reloadTable = () => {
    axios
      .get(BASE_URL + "/load_transaction/getLoadTransaction")
      .then((res) => {
        const sortedLoadTransaction = res.data.sort(
          (a, b) => b.load_transaction_id - a.load_transaction_id
        );
        setLoadTransaction(sortedLoadTransaction);
        console.log("Load", sortedLoadTransaction);
      })
      .catch((err) => console.log(err));
  };

  const reloadTableCustomerList = () => {
    axios
      .get(BASE_URL + "/load_transaction/getCustomerList")
      .then((res) => {
        const sortedCustomerList = res.data.sort(
          (a, b) => b.student_id - a.student_id
        );
        setCustomerList(sortedCustomerList);
      })
      .catch((err) => console.log(err));
  };
  //--------------------------------End Reload Table---------------------------------//

  const handleShowCustomerListsModal = () => {
    setShowUserListModal(true);
  };

  const handleCancelLoad = () => {
    if (studentIDs.length == 0) {
      setTopUpCardNumber("");
      setName("");
      setIDNumber("");
      setShowUserListModal(false);
      setLoadMultiple(false);
    }
    setShowUserListModal(false);
  };

  const handleConfirmLoad = async () => {
    try {
      if (studentIDs.length == 0) {
        setTopUpCardNumber("");
        setName("");
        setIDNumber("");
        setShowUserListModal(false);
        setLoadMultiple(false);
      } else {
        setTopUpCardNumber(`Reload ${studentIDs.length} cards`);
        setName(`${studentIDs.length} Customers`);
        setIDNumber(`${studentIDs.length} ID Number`);
        setShowUserListModal(false);
        setLoadMultiple(true);
      }

      // setStudentIDS([]);
      // setCheckAll(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelTopUp = () => {
    setName("");
    setBalance("");
    setValidity("");
    setTopUpAmount("");
    setTopUpCardNumber("");
    setStudentIDS([]);
    setIDNumber("");
  };

  const handleSearcStudent = async (e) => {
    const searchValue = e.target.value;

    try {
      const response = await axios.get(
        BASE_URL + "/load_transaction/searchStudent",
        {
          params: {
            search: searchValue,
          },
        }
      );
      setCustomerList(response.data);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim() == "") {
      reloadTable();
    } else {
      handleSearch(value);
    }
  };

  const handleSearch = async (search) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/load_transaction/getSearchLoadTransac`,
        {
          params: {
            search,
          },
        }
      );
      setLoadTransaction(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const generateRandomCode = async () => {
    try {
      const randomLetters = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();
      const date = new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");

      const res = await axios.get(
        `${BASE_URL}/product_inventory_accumulate/get-transaction-number`
      );
      console.log(res.data);

      const referenceCode = `${year}${month}${day}${randomLetters}${res.data.transactionNum}`;
      setTransactionNumber(referenceCode);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    generateRandomCode();
    decodeToken();
  }, []);

  const handleDownloadTemplate = async () => {
    const res = await axios.get(`${BASE_URL}/load_transaction/template`, {
      params: {
        category: selectedTemplate,
      },
    });

    let exportData;
    const arrData = res.data;

    if (selectedTemplate == "all") {
      exportData = arrData.map((student) => ({
        "STUDENT NUMBER/DEPARTMENT NAME": student.student_number,
        "FIRST NAME": student.first_name,
        "LAST NAME": student.last_name,
        "RFID NUMBER": student.rfid,
        "TOP UP AMOUNT": 0,
        CATEGORY: student.category,
      }));
    } else if (selectedTemplate == "Student") {
      exportData = arrData.map((student) => ({
        "STUDENT NUMBER": student.student_number,
        "FIRST NAME": student.first_name,
        "LAST NAME": student.last_name,
        "RFID NUMBER": student.rfid,
        "TOP UP AMOUNT": 0,
        CATEGORY: student.category,
      }));
    } else if (
      selectedTemplate == "Visitor" ||
      selectedTemplate == "Department" ||
      selectedTemplate == "Employee"
    ) {
      exportData = arrData.map((student) => ({
        "DEPARTMENT NAME": student.student_number,
        "FIRST NAME": student.first_name,
        "LAST NAME": student.last_name,
        "RFID NUMBER": student.rfid,
        "TOP UP AMOUNT": 0,
        CATEGORY: student.category,
      }));
    }

    if (!exportData || exportData.length === 0) {
      swal({
        title: `No Data Found for ${selectedTemplate}`,
        text: `There is no available data to export for ${selectedTemplate}`,
        icon: "error",
        button: "OK",
      });
      return;
    }

    setTemplateModal(false);
    setSelectedTemplate("");

    const csv = [
      Object.keys(exportData[0]).join(","), // Header row
      ...exportData.map((item) => Object.values(item).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `${selectedTemplate}.csv`;
    link.click();
    //for getting logs ng user na nagclick ng download template
    axios.post(`${BASE_URL}/load_transaction/downloadTemplate`, {
      userId,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const validType = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
      "application/csv", // .csv
    ];

    if (selectedFile && validType.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      swal({
        title: "Please upload a valid excel file!",
        icon: "error",
        button: "OK",
      });
    }
  };

  const handleUploadBulk = async () => {
    try {
      if (file == "") {
        swal({
          title: "Choose a file",
          text: "Please input a file",
          icon: "error",
          button: "OK",
        });
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("transactionNumber", transactionNumber);
      formData.append("userId", userId);

      const res = await axios.post(
        `${BASE_URL}/load_transaction/bulk`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status == 200) {
        swal({
          title: "Bulk Load Successfully!",
          text: "All data in the file was successfully loaded",
          icon: "success",
          button: "OK",
        }).then(() => {
          handleCloseImportModal();
          reloadTable();
        });
      }
      if (res.status == 202) {
        swal({
          title: "Invalid Format",
          text: "Please use the given template",
          icon: "error",
          button: "OK",
        }).then(() => {
          setImportModal(false);
          handleCloseImportModal();
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckboxChange = (student_id) => {
    setStudentIDS((prevSelectedID) => {
      if (prevSelectedID.includes(student_id)) {
        return prevSelectedID.filter((ID) => ID !== student_id);
      } else {
        return [...prevSelectedID, student_id];
      }
    });
  };

  const handleCheckAllChange = () => {
    if (checkAll) {
      setStudentIDS([]);
    } else {
      const allStudentIDs = customerList.map((c) => c.student.student_id);
      setStudentIDS(allStudentIDs);
    }
    setCheckAll(!checkAll);
  };

  const allChecked = customerList.every((c) =>
    studentIDs.includes(c.student.student_id)
  );

  const studentColumns = [
    {
      name: (
        <input
          type="checkbox"
          onChange={handleCheckAllChange}
          checked={allChecked}
        />
      ),
      cell: (row) => (
        <input
          type="checkbox"
          onChange={() => handleCheckboxChange(row.student_id)}
          checked={studentIDs.includes(row.student_id)}
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: "RFID",
      selector: (row) => row.student.rfid,
    },
    {
      name: "STUDENT ID",
      selector: (row) => row.student.student_number,
    },
    {
      name: "NAME",
      selector: (row) => row.student.first_name + " " + row.student.last_name,
    },
    {
      name: "BALANCE",
      selector: (row) => row.balance,
    },
  ];

  function selectspecificFiles() {
    fileRef.current.click();
  }

  const handleCloseImportModal = () => {
    setImportModal(false);
    setFile("");
  };

  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isLoading ? (
        <div className="loading-container" style={{ marginRight: "15%" }}>
          <FourSquare
            color="#6290FE"
            size="large"
            text="Loading Data..."
            textColor=""
          />
        </div>
      ) : authrztn.includes("RFID-View") ? (
        <div className="nfc-container">
          <div className="nfc-lists-container">
            <div className="nfc-title-container">
              <div className="nfc-title">
                <Link to={"/menu"}>
                  <i className="bx bx-chevron-left"></i>
                </Link>
                <h2>Top up Transaction</h2>
              </div>
              <div className="nfc-search-contain">
                <div className="nfc-search-container">
                  <input
                    type="text"
                    className="form-control search m-0"
                    placeholder="Search Student Name"
                    aria-describedby="addon-wrapping"
                    onChange={handleSearchChange}
                    value={searchQuery}
                  />
                  <button onClick={handleShowCustomerListsModal}>
                    Load All
                  </button>
                </div>
                <div className="download-container ms-3">
                  {authrztn?.includes("RFID-IE") && (
                    <button
                      type="button"
                      onClick={() => setTemplateModal(true)}
                    >
                      Download Template
                    </button>
                  )}
                  {/* <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                /> */}
                  {authrztn?.includes("RFID-IE") && (
                    <button type="button" onClick={() => setImportModal(true)}>
                      Import
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="table">
              {loadTransaction.length == 0 ? (
                <>
                  <div className="no-data-table">
                    <table>
                      <thead>
                        <th>ID</th>
                        <th>TAP CARD NUMBER</th>
                        <th>NAME</th>
                        <th>PREVIOUS BALANCE</th>
                        <th>TOP UP</th>
                        <th>NEW BALANCE</th>
                        <th>TRAMSACTION DATE</th>
                      </thead>
                      <tbody className="inr-no-data">
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
                      data={loadTransaction}
                      customStyles={customStyles}
                      pagination
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          {authrztn?.includes("RFID-Add") && (
            <div className="nfc-load-container">
              <div className="rfid-logo-container">
                <h3>Please Tap the card</h3>
                <img src={rfidLogo} className="rfid-logo" />
                <h2 className="my-rfid">My RFID</h2>
              </div>
              <Form onSubmit={handleSubmit}>
                <div className="load-input-container px-4">
                  <div className="nfc-sort-container top-input">
                    {/* <div className="nfc-f-sort">
                  <h3>Custom Category</h3>
                  <select
                    className="form-select m-0"
                    aria-label="Default select example"
                  >
                    <option disabled>All Category</option>
                    <option value="Student">Student</option>
                    <option value="Employee">Employee</option>
                    <option value="Visitor">Visitor</option>
                    <option value="Department">Department</option>
                  </select>
                </div> */}

                    {/* <div className="nfc-f-sort">
                  <h3>ID Number</h3>
                  <input
                    type="text"
                    className="form-control m-0"
                    value={idNumber}
                  />
                </div> */}
                  </div>
                  <div className="top-input">
                    <h3>Top Up Card #</h3>
                    <input
                      type="text"
                      value={topUpCardNumber}
                      onChange={handleTopUpCardChange}
                      className="form-control search m-0"
                      aria-describedby="addon-wrapping"
                    />
                  </div>
                  <div className="top-input">
                    <h3>Name</h3>
                    <input
                      type="text"
                      value={name}
                      readOnly
                      className="form-control search m-0"
                      aria-describedby="addon-wrapping"
                    />
                  </div>
                  <div className="top-input">
                    <div className="nfc-valid d-flex p-0 align-items-center justify-content-between">
                      <h3>Valid Til</h3>
                      <label className="switch">
                        <input type="checkbox" onChange={handleToggle} />
                        <span className="slider round"></span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={isOpen ? formatDate(validity) : ""}
                      readOnly
                      className="form-control search m-0"
                      aria-describedby="addon-wrapping"
                    />
                  </div>
                  <div className="top-input">
                    {/* <h3>Balance</h3>
                <input
                  type="number"
                  value={balance}
                  readOnly
                  className="form-control search m-0"
                  aria-describedby="addon-wrapping"
                /> */}
                  </div>
                  <div className="top-input">
                    <h3>Top Up</h3>
                    <input
                      type="number"
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      value={topUpAmount}
                      className="form-control search m-0"
                      aria-describedby="addon-wrapping"
                    />
                    {/* <label htmlFor="" className="text-danger">
                  Minimum top up is 50
                </label> */}
                  </div>
                  <div className="nfc-button-container d-flex p-0">
                    <button
                      type="button"
                      className="load-c-button load-btn"
                      onClick={handleCancelTopUp}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="load-l-button load-btn nfc-load"
                      disabled={name.length == 0}
                    >
                      Load
                    </button>
                  </div>
                </div>
              </Form>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "100%",
            marginTop: "10%",
          }}
        >
          <img src={NoAccess} alt="NoAccess" className="no-access-img" />
          <h3>You don't have access to this function.</h3>
        </div>
      )}

      <Modal show={userListModal} onHide={handleCancelLoad} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <h2>CUSTOMER LISTS</h2>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-3">
          <div className="modal-category upload align-items-center pb-1 m-2">
            <input
              type="text"
              className="form-control search mb-4"
              placeholder="Search Student Name"
              aria-describedby="addon-wrapping"
              onChange={handleSearcStudent}
            />

            <div className="table">
              <DataTable
                columns={studentColumns}
                data={customerList}
                customStyles={customStyles}
                pagination
                onRowClicked={handleCheckboxChange}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-primary"
            // onClick={() => setShowUserListModal(false)}
            onClick={handleCancelLoad}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit" onClick={handleConfirmLoad}>
            Confirm
          </Button>
        </Modal.Footer>
        {/* <Form noValidate onSubmit={handleConfirmLoad}></Form> */}
      </Modal>

      <Modal show={overAllModal} onHide={() => setOverAllModal(false)}>
        <Modal.Body className="p-2">
          <div className="modal-nfc">
            <div className="nfc-head-container d-flex">
              <img src={nfc} />

              <div className="nfc-details">
                <h3>RFID #: 130 Cards</h3>
                <h3>Name: 130 Students</h3>
                <h3>
                  Reload: <span className="nfc-reload">₱2000</span>
                </h3>
              </div>
            </div>
            <hr />
            <h2>Reload this card?</h2>
            <h3 className="mt-3">Are you sure you want to load this card?</h3>
          </div>
          <div className="nfc-btn-container">
            <button
              className="nfc-cc-btn nfc-btn"
              onClick={() => setOverAllModal(false)}
            >
              Cancel
            </button>
            <button className="nfc-cf-btn nfc-btn" onClick={handleLoadStudents}>
              Confirm
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Download Template */}
      <Modal
        show={templateModal}
        onHide={() => setTemplateModal(false)}
        size="xl"
      >
        <Modal.Header>
          <h2>Select Template File</h2>
        </Modal.Header>
        <Modal.Body className="p-2">
          <div className="card-template-cont my-5">
            <div
              className={`card card-template ${
                selectedTemplate == "Student" ? "selected-temp" : ""
              }`}
              onClick={() => setSelectedTemplate("Student")}
            >
              <div className={`card-body card-temp-body`}>
                <img src={studentLogo} />
                <h2 className="">Student </h2>
              </div>
            </div>
            <div
              className={`card card-template ${
                selectedTemplate === "Department" ? "selected-temp" : ""
              }`}
              onClick={() => setSelectedTemplate("Department")}
            >
              <div className="card-body card-temp-body">
                <img src={departmentLogo} />
                <h2 className="">Department </h2>
              </div>
            </div>
            <div
              className={`card card-template ${
                selectedTemplate == "Visitor" ? "selected-temp" : ""
              }`}
              onClick={() => setSelectedTemplate("Visitor")}
            >
              <div className="card-body card-temp-body">
                <img src={visitorLogo} />
                <h2 className="">Visitor </h2>
              </div>
            </div>
            <div
              className={`card card-template ${
                selectedTemplate == "Employee" ? "selected-temp" : ""
              }`}
              onClick={() => setSelectedTemplate("Employee")}
            >
              <div className={`card-body card-temp-body`}>
                <img src={empLogo} />
                <h2 className="">Employee </h2>
              </div>
            </div>
            <div
              className={`card card-template ${
                selectedTemplate == "all" ? "selected-temp" : ""
              }`}
              onClick={() => setSelectedTemplate("all")}
            >
              <div className="card-body card-temp-body">
                <img src={allLogo} />
                <h2 className="">All </h2>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setTemplateModal(false);
              setSelectedTemplate("");
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDownloadTemplate}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Import Modal */}

      <Modal show={importModal} onHide={handleCloseImportModal}>
        <Modal.Header>
          <h2>Upload Excel File</h2>
        </Modal.Header>
        <Modal.Body className="p-2">
          {/* <input
            type="file"
            onChange={handleFileChange}
           
          /> */}

          <div className="product-upload-container">
            <div
              className="nfc-image-main-container"
              onClick={selectspecificFiles}
            >
              <div className="nfcFileinputs">
                <div className="uploading-nfc-section">
                  <img src={IconExel} style={{ height: "10rem" }} />
                  {!file ? (
                    <>
                      <span className="select h2 my-3" role="button">
                        Upload
                      </span>
                    </>
                  ) : null}

                  <input
                    name="file"
                    type="file"
                    className="file"
                    ref={fileRef}
                    onChange={handleFileChange}
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  />
                  {file && (
                    <p className="file-name h2 my-3">
                      Selected file: {file.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseImportModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUploadBulk}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* NFC Receipt Modal */}
      <Modal show={receiptModal} onHide={() => setReceiptModal(false)}>
        <div className="modal-nfc">
          <div className="nfc-receipt-title">
            <h1>PRINT RECEIPT</h1>
          </div>
          <hr />
          <div className="nfc-receipt">
            <div className="title-receipt">
              <h2>Shop Name</h2>
            </div>
            <div className="nfc-dashed-receipt"></div>
            <div className="nfc-card-details nfc-card-num">
              <p>Card Number: </p>
              <p>252-564</p>
            </div>
            <div className="nfc-card-details ">
              <p>Student ID: </p>
              <p>4545-5412</p>
            </div>
            <div className="nfc-dashed-receipt"></div>
            <div className="nfc-receipt-head nfc-card-details">
              <h2>Customer Name</h2>
              <h2>Subtotal</h2>
            </div>
            <div className="nfc-card-details nfc-cust-details">
              <p>Regin Legaspi </p>
              <p>₱400</p>
            </div>
            <div className="nfc-card-details">
              <h3>INITIAL BALANCE</h3>
              <h3>₱100.00</h3>
            </div>
            <div className="nfc-card-details">
              <h3>AMOUNT LOADED</h3>
              <h3>₱400.00</h3>
            </div>
            <div className="nfc-card-details">
              <h3>TOTAL AMOUNT</h3>
              <h3>₱500.00</h3>
            </div>
            <div className="nfc-dashed-receipt"></div>
            <div className="nfc-card-details">
              <p>Transaction By: </p>
              <p>Angelo</p>
            </div>
            <div className="nfc-card-details">
              <p>Transaction ID: </p>
              <p>16123123465</p>
            </div>
            <div className="nfc-card-details">
              <p>Print Time: </p>
              <p>2023-06-08 12:30</p>
            </div>
          </div>

          <div className="end-modal-btn-container mt-4">
            <button
              type="button"
              className=" end-cc-btn nfc-c-btn"
              onClick={() => setReceiptModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className=" end-es-btn nfc-c-btn"
              onClick={handleLoadStudents}
            >
              Print
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Nfc;
