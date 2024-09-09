import React, { useEffect, useState, useRef } from "react";
import DataTable from "react-data-table-component";
import swal from "sweetalert";
import { Modal, Button, Form } from "react-bootstrap";
import _Sidebar from "../Sidebar/_Sidebar";
import "../styles/usermanagement.css";
// import "../styles/pos_react.css";
import { customStyles } from "../styles/table-style";
import axios from "axios";
import noData from "../../assets/icon/no-data.png";
import IconExel from "../../assets/icon/excel-icon.png";
import BASE_URL from "../../assets/global/url";
import NoAccess from "../../assets/image/NoAccess.png";
import { Plus, ArrowsClockwise } from "@phosphor-icons/react";
import { jwtDecode } from "jwt-decode";
import { FourSquare } from "react-loading-indicators";

function UserManagement({ authrztn }) {
  const [userId, setuserId] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setEditUserModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [validated, setValidated] = useState(false);
  const [Student, setStudent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  //--------------------------------Add Student---------------------------------//
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [rfid, setRfid] = useState([]);

  const [status, setStatus] = useState(false);
  const [validity, setValidity] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [category, setCategory] = useState("Student");
  const [pin, setPin] = useState("");
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  const [showAddUser, setShowAddUser] = useState(false);
  const [containerClass, setContainerClass] = useState("users-container");
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [showChangeStatusButton, setShowChangeStatusButton] = useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Active");

  const handleShowAddUserModal = () => setShowAddUserModal(true);
  const handleCloseAddUserModal = () => setShowAddUserModal(false);
  const handleShowEditUserModal = () => setEditUserModal(true);
  const handleCloseEditUserModal = () => setEditUserModal(false);
  const handleCloseModal = () => setShowAddUserModal(false);

  const handleCloseStatusModal = () => setShowChangeStatusModal(false);
  const handleShowChangeStatusModal = () => setShowChangeStatusModal(true);
  const [importModal, setImportModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [file, setFile] = useState("");
  const fileRef = useRef();

  ////////////////////////////////////////////

  const [serial, setSerial] = useState("");
  const [logs, setLogs] = useState([]);
  const log = (message) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };
  /* global NDEFReader */
  const handleScan = async () => {
    log("User clicked scan button");

    if (!("NDEFReader" in window)) {
      log("NFC not supported on this device or browser.");
      return;
    }

    try {
      // eslint-disable-next-line no-undef
      const ndef = new NDEFReader();
      await ndef.scan();
      log("> Scan started");

      ndef.addEventListener("readingerror", () => {
        log("Argh! Cannot read data from the NFC tag. Try another one?");
      });

      ndef.addEventListener("reading", ({ message, serialNumber }) => {
        log(`> Serial Number: ${serialNumber}`);
        log(`> Records: (${message.records.length})`);

        setSerial(serialNumber);
        const encoder = new TextEncoder();
        const byteArr = encoder.encode(serialNumber);
        setRfid(byteArr);
      });
    } catch (error) {
      log("Argh! " + error);
      console.log(error);
    }
  };

  useEffect(() => {
    handleScan();
  }, []);

  ///////////////////////////////////////////

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleCategoryFilter = (e) => {
    setCategoryFilter(e.target.value);
  };

  const [search, setSearch] = useState("");

  const processSearch = (search) => {
    search = encodeURIComponent(search);
    axios
      .get(`${BASE_URL}/student/searchCustomer/${search}`)
      .then((res) => {
        setStudent(res.data);
      })
      .catch((err) => console.log(err));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim() === "") {
      reloadTable();
    } else {
      processSearch(value);
    }
  };

  const filteredData = Student.filter(
    (student) =>
      (statusFilter === "" || student.status === statusFilter) &&
      (categoryFilter === "" || student.category === categoryFilter)
  );

  const handleCheckboxChange = (studentIds) => {
    const updatedCheckboxes = [...selectedCheckboxes];

    if (updatedCheckboxes.includes(studentIds)) {
      updatedCheckboxes.splice(updatedCheckboxes.indexOf(studentIds), 1);
    } else {
      updatedCheckboxes.push(studentIds);
    }

    setSelectedCheckboxes(updatedCheckboxes);
    setShowChangeStatusButton(updatedCheckboxes.length > 0);
  };

  const handleSelectAllChange = () => {
    const studentIds = Student.map((data) => data.student_id);

    if (studentIds.length === 0) {
      return;
    }

    if (selectedCheckboxes.length === studentIds.length) {
      setSelectedCheckboxes([]);
      setShowChangeStatusButton(false);
      setSelectAllChecked(false);
    } else {
      setSelectedCheckboxes(studentIds);
      setShowChangeStatusButton(true);
      setSelectAllChecked(true);
    }
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  //update status
  const handleSave = () => {
    axios
      .put(BASE_URL + "/student/statusupdate", {
        studentIds: selectedCheckboxes,
        status: selectedStatus,
      })
      .then((res) => {
        if (res.status === 200) {
          swal({
            title: "Customer status Update!",
            text: "The customer status has been updated successfully.",
            icon: "success",
            button: "OK",
          }).then(() => {
            handleCloseStatusModal();
            reloadTable();
            setSelectAllChecked(false);
            setSelectedCheckboxes([]);
            setShowChangeStatusButton(false);
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const columns = [
    {
      name: (
        <input
          type="checkbox"
          onChange={handleSelectAllChange}
          checked={selectAllChecked}
        />
      ),
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedCheckboxes.includes(row.student_id)}
          onChange={() => handleCheckboxChange(row.student_id)}
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: "RFID",
      selector: (row) => row.rfid,
      sortable: true,
    },
    {
      name: "Student Number",
      selector: (row) => row.student_number,
      sortable: true,
    },
    {
      name: "Full Name",
      selector: (row) => row.first_name + " " + row.last_name,
      sortable: true,
    },
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
    },
    {
      name: "Contact Number",
      selector: (row) => row.contact_number,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Balance",
      selector: (row) => row.student_balances.map((student) => student.balance),
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
    },
  ];

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const createStudent = async (e) => {
    e.preventDefault();

    // Check if email ay tama ang format
    if (email && !validateEmail(email)) {
      swal({
        icon: "error",
        title: "Invalid Email Format",
        text: "Please enter a valid email address",
      });
      return;
    }

    if (contactNumber.length != 11) {
      swal({
        icon: "error",
        title: "Invalid Contact Number",
        text: "Please enter a valid contact number",
      });
      return;
    }

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      swal({
        icon: "error",
        title: "Fields are required",
        text: "Please fill the red text fields",
      });
    } else {
      axios
        .post(`${BASE_URL}/student/create`, {
          firstName: firstName,
          lastName: lastName,
          email: email,
          contactNumber: contactNumber,
          address: address,
          rfid: rfid,
          status: status,
          validity: validity,
          studentNumber: studentNumber,
          category: category,
          pin: pin,
          userId,
        })
        .then((res) => {
          console.log(res);
          if (res.status === 200) {
            swal({
              title: "Created New Customer",
              text: "New customer has been added successfully",
              icon: "success",
              button: "OK",
            }).then(() => {
              setValidated(false);
              reloadTable();
              setCategory("Student");
              setStudentNumber("");
              setRfid("");
              setValidity("");
              setFirstName("");
              setLastName("");
              setContactNumber("");
              setEmail("");
              setAddress("");
              setPin(["", "", "", ""]);
            });
            // reloadTable();
          } else if (res.status === 201) {
            swal({
              title: "Student RFID Code Already Exist",
              text: "Use other RFID Card",
              icon: "error",
              button: "OK",
            }).then(() => {
              reloadTable();
            });
          } else if (res.status === 202) {
            swal({
              title: "Student Number Already Exist",
              text: "Input another Student Number",
              icon: "error",
              button: "OK",
            }).then(() => {
              reloadTable();
            });
          } else if (res.status === 203) {
            swal({
              title: "Email Already Exist",
              text: "Input another email",
              icon: "error",
              button: "OK",
            }).then(() => {
              reloadTable();
            });
          } else {
            swal({
              title: "Something went wrong",
              text: "Please Contact our Support",
              icon: "error",
              button: "OK",
            }).then(() => {
              reloadTable();
            });
          }
        });
    }
    setValidated(true); //for validations
  };
  //--------------------------------End Add Student---------------------------------//

  // const handleChange = (e, index) => {
  //   const newValue = e.target.value;
  //   // Check if the input is a number para maprevent ang NaN
  //   if (!isNaN(newValue)) {
  //     setPin((prevPin) => {
  //       const updatedPin = prevPin.split("");
  //       updatedPin[index] = newValue;
  //       return updatedPin.join("");
  //     });

  //     // para magmove ang focus ng input sa kasunod na input
  //     if (index < 3 && newValue !== "") {
  //       inputRefs[index + 1].current.focus();
  //     }
  //   }
  // };
  const handleChange = (e, index) => {
    const newValue = e.target.value;
    if (!isNaN(newValue)) {
      setPin((prevPin) => {
        // Ensure prevPin is always treated as a string
        const updatedPin = (prevPin ? prevPin.toString() : "").split("");
        updatedPin[index] = newValue;
        return updatedPin.join("");
      });
      if (index < 3 && newValue !== "") {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  //--------------------------------Reload Table---------------------------------//
  const reloadTable = () => {
    axios
      .get(BASE_URL + "/student/getStudents")
      .then((res) => {
        setStudent(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(true);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      reloadTable();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  //--------------------------------End Reload Table---------------------------------//
  //--------------------------------Student Fetch---------------------------------//
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

  //--------------------------------End Student Fetch---------------------------------//

  //--------------------------------Date Format---------------------------------//
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Adding 1 as getMonth() is zero-based
    const day = date.getDate().toString().padStart(2, "0");
    // return `${year}-${month}-${day}`;
    return `${day}-${month}-${year}`;
  };
  //--------------------------------End Date Format---------------------------------//

  //--------------------------------Show Modal Update---------------------------------//
  const handleModalToggle = (updateData = null) => {
    if (authrztn.includes("CustomerList-Edit")) {
      handleShowEditUserModal(!showEditUserModal);
      if (updateData) {
        setUpdateFormData({
          studentId: updateData.student_id,
          firstName: updateData.first_name,
          rfid: updateData.rfid,
          lastName: updateData.last_name,
          email: updateData.email,
          contactNumber: updateData.contact_number,
          address: updateData.address,
          validity: updateData.validity,
          studentNumber: updateData.student_number,
          category: updateData.category,
          student_pin: updateData.student_pin,
        });
      } else {
        setSelectedRow({
          firstName: "",
          lastName: "",
          email: "",
          contactNumber: "",
          address: "",
          validity: "",
          studentNumber: "",
          category: "",
        });
      }
    }
  };
  //--------------------------------End Show Modal Update---------------------------------//
  //--------------------------------Update Student---------------------------------//

  const firstPinRef = useRef(null);
  const secondPinRef = useRef(null);
  const thirdPinRef = useRef(null);
  const fourthPinRef = useRef(null);

  // const handleUpdateFormChange = (e) => {
  //   const { name, value } = e.target;
  //   if (name === "student_pin") {
  //     // If ang student_pin ay being updated, update yung specific digit
  //     const pinDigits = updateFormData.student_pin.split(""); // convertion ng string sa array
  //     const index = parseInt(e.target.getAttribute("data-index"), 10);
  //     pinDigits[index] = value;
  //     setUpdateFormData((prevData) => ({
  //       ...prevData,
  //       student_pin: pinDigits.join(""),
  //     }));

  //     // sa pag move ng focus to next input field
  //     switch (index) {
  //       case 0:
  //         secondPinRef.current.focus();
  //         break;
  //       case 1:
  //         thirdPinRef.current.focus();
  //         break;
  //       case 2:
  //         fourthPinRef.current.focus();
  //         break;
  //       default:
  //         break;
  //     }
  //   } else {
  //     setUpdateFormData((prevData) => ({
  //       ...prevData,
  //       [name]: value,
  //     }));
  //   }
  // };

  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "student_pin") {
      if (!isNaN(value) && value.length <= 1) {
        const pinDigits = updateFormData.student_pin.split("");
        const index = parseInt(e.target.getAttribute("data-index"), 10);
        pinDigits[index] = value;
        setUpdateFormData((prevData) => ({
          ...prevData,
          student_pin: pinDigits.join(""),
        }));
        if (value !== "") {
          switch (index) {
            case 0:
              secondPinRef.current.focus();
              break;
            case 1:
              thirdPinRef.current.focus();
              break;
            case 2:
              fourthPinRef.current.focus();
              break;
            default:
              break;
          }
        }
      }
    } else {
      setUpdateFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const updatevalidateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const [updateFormData, setUpdateFormData] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    email: "",
    address: "",
    validity: "",
    studentNumber: "",
    category: "",
    student_pin: "",
  });

  const updateStudent = async (e) => {
    e.preventDefault();

    if (updateFormData.email && !updatevalidateEmail(updateFormData.email)) {
      swal({
        icon: "error",
        title: "Invalid Email Format",
        text: "Please enter a valid email address",
      });
      return; // Stop further execution if email is invalid
    }

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      swal({
        icon: "error",
        title: "Invalid Input",
        text: "Please fill out all required fields correctly.",
      });
    } else {
      const studentId = updateFormData.studentId;
      const response = await axios.put(
        BASE_URL + `/student/update/${studentId}`,
        {
          firstName: updateFormData.firstName,
          lastName: updateFormData.lastName,
          contactNumber: updateFormData.contactNumber,
          email: updateFormData.email,
          address: updateFormData.address,
          validity: updateFormData.validity,
          student_pin: updateFormData.student_pin,
          studentNumber: updateFormData.studentNumber,
          category: updateFormData.category,
          userId,
        }
      );

      if (response.status === 200) {
        swal({
          title: "Update successful!",
          text: "The Student has been updated successfully.",
          icon: "success",
          button: "OK",
        }).then(() => {
          reloadTable();
          handleCloseEditUserModal();
          setValidated(false);
        });
      } else if (response.status === 202) {
        swal({
          title: "Email Already Exist",
          text: "Input another email",
          icon: "error",
          button: "OK",
        });
      } else if (response.status === 203) {
        swal({
          title: "Student Number Already Exist",
          text: "Input another student number",
          icon: "error",
          button: "OK",
        }).then(() => {
          reloadTable();
        });
      } else {
        swal({
          icon: "error",
          title: "Something went wrong" + response.status,
          text: "Please contact our support",
        });
      }
    }
    setValidated(true);
  };

  //--------------------------------End Update Student---------------------------------//

  const handleAddUserToggle = () => {
    setShowAddUser(!showAddUser);
    setValidated(false);
    setCategory("Student");
    setStudentNumber("");
    setRfid("");
    setValidity("");
    setFirstName("");
    setLastName("");
    setContactNumber("");
    setEmail("");
    setAddress("");
    setPin(["", "", "", ""]);
  };

  useEffect(() => {
    if (showAddUser) {
      setContainerClass("users-div d-flex flex-row");
    } else {
      setContainerClass("users-div");
    }
  }, [showAddUser]);

  // const handleDownloadTemplate = () => {
  //   const headers = [
  //     "CATEGORY",
  //     "STUDENT #",
  //     "RFID #",
  //     "VALIDITY",
  //     "FIRST NAME",
  //     "LAST NAME",
  //     "CONTACT",
  //     "EMAIL ADDRESS",
  //     "HOME ADDRESS",
  //     "STUDENT PIN",
  //   ];

  //   const sampleData = [
  //     "Sample Category",
  //     "1234567890",
  //     "987654321",
  //     "2024/06/08",
  //     "John",
  //     "Doe",
  //     "09123456789",
  //     "studentemail@example.com",
  //     "123 Ohio Street",
  //     "7890",
  //   ];

  //   const rows = [headers, sampleData];
  //   const csvContent = rows.map((row) => row.join(",")).join("\n");

  //   const blob = new Blob([csvContent], { type: "text/csv" });
  //   const link = document.createElement("a");
  //   link.href = window.URL.createObjectURL(blob);
  //   link.download = "template_user.csv";
  //   link.click();
  // };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/student/generate-template`,
        null,
        {
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "template_user.xlsx";
      link.click();
    } catch (error) {
      console.error("Error downloading template:", error);
    }
  };

  function selectspecificFiles() {
    fileRef.current.click();
  }

  const handleCloseImportModal = () => {
    setImportModal(false);
    setFile("");
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

  const handleBulkUser = async () => {
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

      const res = await axios.post(`${BASE_URL}/student/bulk-user`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status == 200) {
        swal({
          title: "Bulk Upload Successfully!",
          text: "All data in the file was successfully loaded",
          icon: "success",
          button: "OK",
        }).then(() => {
          reloadTable();
          handleCloseImportModal();
        });
      }
      if (res.status == 201) {
        swal({
          title: "Invalid Format",
          text: "Please use the given template",
          icon: "error",
          button: "OK",
        }).then(() => {
          handleCloseImportModal();
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className={containerClass}>
        {isLoading ? (
          <div
            className="loading-container"
            style={{ margin: "0", marginLeft: "250px" }}
          >
            <FourSquare
              color="#6290FE"
              size="large"
              text="Loading Data..."
              textColor=""
            />
          </div>
        ) : authrztn.includes("CustomerList-View") ? (
          <div className="users-container">
            <div className="title-container pt-5 stud-man-container">
              <h2>Customer List Management</h2>
              {authrztn.includes("CustomerList-IE") && (
                <div className="download-container">
                  <button type="button">Download Template</button>
                  <button
                    type="button"
                    className="stud-import"
                    onClick={() => setImportModal(true)}
                  >
                    <i class="bx bx-download"></i>Import
                  </button>
                </div>
              )}

              <div>
                <h3>Logs</h3>
                <ul>
                  {logs.map((log, index) => (
                    <li key={index}>{log}</li>
                  ))}
                </ul>
              </div>
              {/* <button onClick={handleScan}>Start NFC Scan</button> */}
              <h2>Serial {serial}</h2>

              {/* <h2>init {init}</h2>
      <h2>err: {err}</h2> */}
            </div>
            <div className="btn-manage-container d-flex justify-content-between">
              <div class="input-group">
                <input
                  type="text"
                  className="form-control m-0"
                  style={{ fontSize: "13px" }}
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search"
                />
              </div>

              <div className="user-filter d-flex p-0">
                <select
                  class="form-select m-0"
                  onChange={handleCategoryFilter}
                  style={{ width: "40%" }}
                >
                  <option disabled selected>
                    Select Category
                  </option>
                  <option value="Student">Student</option>
                  <option value="Visitor">Visitor</option>
                  <option value="Department">Department</option>
                  <option value="Employee">Employee</option>
                </select>

                <select
                  class="form-select m-0"
                  onChange={handleStatusFilterChange}
                  style={{ width: "40%" }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                {showChangeStatusButton
                  ? authrztn.includes("CustomerList-Edit") && (
                      <button
                        className="btn btn-secondary"
                        onClick={handleShowChangeStatusModal}
                      >
                        <ArrowsClockwise size={32} color="#f2f2f2" /> Change
                        Status
                      </button>
                    )
                  : authrztn.includes("CustomerList-Add") && (
                      <button onClick={handleAddUserToggle}>
                        <Plus size={32} color="#f2f2f2" /> Add Customer
                      </button>
                    )}
              </div>
            </div>
            <div className="table">
              {filteredData.length == 0 ? (
                <>
                  <div className="no-data-table">
                    <table>
                      <thead>
                        <th>RFID</th>
                        <th>STUDENT NUMBER</th>
                        <th>FULL NAME</th>
                        <th>CATEGORY</th>
                        <th>CONTACT NUMBER</th>
                        <th>EMAIL</th>
                        <th>BALANCE</th>
                        <th>STATUS</th>
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
                  <div className="c-data-table">
                    <DataTable
                      columns={columns}
                      data={filteredData}
                      pagination
                      paginationRowsPerPageOptions={[5, 10, 25]}
                      highlightOnHover
                      onRowClicked={handleModalToggle}
                      customStyles={customStyles}
                    />
                  </div>
                </>
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
              marginLeft: "12%",
              marginTop: "1.9%",
            }}
          >
            <img src={NoAccess} alt="NoAccess" className="no-access-img" />
            <h3>You don't have access to this function.</h3>
          </div>
        )}
        {showAddUser && (
          <div className="add-account-container pt-5">
            <Form noValidate validated={validated} onSubmit={createStudent}>
              <div className="add-account-content">
                <div className="add-account-title">
                  <h1>Add User</h1>
                  <hr />
                </div>
                <div className="add-account-body">
                  <div className="row">
                    <div className="col-sm">
                      <label htmlFor="category">
                        Category <span style={{ color: "red" }}>*</span>
                      </label>
                      <Form.Select
                        className="form-control search"
                        aria-label="Default select example"
                        required
                        onChange={handleCategoryChange}
                        value={category}
                        style={{ color: "black", height: "40px" }}
                      >
                        <option value="Student">Student</option>
                        <option value="Visitor">Visitor</option>
                        <option value="Department">Department</option>
                        <option value="Employee">Employee</option>
                      </Form.Select>
                    </div>
                    <div className="col-sm">
                      <label htmlFor="">
                        {category === "Student" ? (
                          <>
                            Student # <span style={{ color: "red" }}>*</span>
                          </>
                        ) : (
                          <>
                            Department Name{" "}
                            <span style={{ color: "red" }}>*</span>
                          </>
                        )}
                      </label>
                      <div class="input-group mb-3">
                        <input
                          type="text"
                          required
                          class="form-control search"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          value={studentNumber}
                          onChange={(e) => setStudentNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-sm">
                      <label htmlFor="">
                        RFID # <span style={{ color: "red" }}>*</span>
                      </label>
                      <div class="input-group mb-3">
                        {/* <input
                          type="text"
                          required
                          class="form-control search"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          value={rfid}
                          onChange={(e) => setRfid(e.target.value)}
                        /> */}

                        <input
                          type="text"
                          class="form-control search"
                          value={rfid.join("")}
                        />
                      </div>
                    </div>
                    <div class="col-sm">
                      <label htmlFor="">
                        Validity <span style={{ color: "red" }}>*</span>
                      </label>
                      <div class="input-group mb-3">
                        <input
                          type="date"
                          required
                          class="form-control date"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          value={validity}
                          onChange={(e) => setValidity(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-sm">
                      <label htmlFor="">
                        {category === "Student" ? (
                          <>
                            First Name <span style={{ color: "red" }}>*</span>
                          </>
                        ) : (
                          <>
                            Assigned User First Name{" "}
                            <span style={{ color: "red" }}>*</span>
                          </>
                        )}
                      </label>
                      <div class="input-group mb-3">
                        <input
                          type="text"
                          required
                          class="form-control search"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div class="col-sm">
                      <label htmlFor="">
                        {category === "Student" ? (
                          <>
                            Last Name <span style={{ color: "red" }}>*</span>
                          </>
                        ) : (
                          <>
                            Assigned User Last Name{" "}
                            <span style={{ color: "red" }}>*</span>
                          </>
                        )}
                      </label>
                      <div class="input-group mb-3">
                        <input
                          type="text"
                          required
                          class="form-control search"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-sm">
                      <label htmlFor="">
                        Contact <span style={{ color: "red" }}>*</span>
                      </label>
                      <div class="input-group  mb-3">
                        <input
                          type="tel"
                          required
                          class="form-control search"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          value={contactNumber}
                          onInput={(e) =>
                            (e.target.value = e.target.value.replace(/\D/, ""))
                          }
                          maxLength={13}
                          onChange={(e) => setContactNumber(e.target.value)}
                        />
                      </div>
                    </div>
                    <div class="col-sm">
                      <label htmlFor="">
                        Email Address <span style={{ color: "red" }}>*</span>
                      </label>
                      <div class="input-group mb-3">
                        <input
                          type="email"
                          required
                          class="form-control date"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-sm">
                      <label htmlFor="">Home Address</label>
                      <div class="input-group  mb-3">
                        <input
                          type="text"
                          class="form-control search"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-sm">
                      <div className="label-section">
                        <label htmlFor="">
                          User PIN <span style={{ color: "red" }}>*</span>
                        </label>
                      </div>

                      <div className="pin-sec">
                        <div className="firstbox-pin">
                          <Form.Control
                            type="number"
                            value={pin[0] || ""}
                            onInput={(e) =>
                              (e.target.value = e.target.value.replace(
                                /\D/,
                                ""
                              ))
                            }
                            onChange={(e) => handleChange(e, 0)}
                            style={{ fontSize: "16px", textAlign: "center" }}
                            required
                            ref={inputRefs[0]}
                          />
                        </div>
                        <div className="secondbox-pin">
                          <Form.Control
                            type="number"
                            value={pin[1] || ""}
                            onInput={(e) =>
                              (e.target.value = e.target.value.replace(
                                /\D/,
                                ""
                              ))
                            }
                            onChange={(e) => handleChange(e, 1)}
                            style={{ fontSize: "16px", textAlign: "center" }}
                            required
                            ref={inputRefs[1]}
                          />
                        </div>
                        <div className="thirdbox-pin">
                          <Form.Control
                            type="number"
                            value={pin[2] || ""}
                            onInput={(e) =>
                              (e.target.value = e.target.value.replace(
                                /\D/,
                                ""
                              ))
                            }
                            onChange={(e) => handleChange(e, 2)}
                            style={{ fontSize: "16px", textAlign: "center" }}
                            required
                            ref={inputRefs[2]}
                          />
                        </div>
                        <div className="fourthbox-pin">
                          <Form.Control
                            type="number"
                            value={pin[3] || ""}
                            onInput={(e) =>
                              (e.target.value = e.target.value.replace(
                                /\D/,
                                ""
                              ))
                            }
                            onChange={(e) => handleChange(e, 3)}
                            style={{ fontSize: "16px", textAlign: "center" }}
                            required
                            ref={inputRefs[3]}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="add-account-footer d-flex flex-row">
                <Button variant="outline-primary" onClick={handleAddUserToggle}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save
                </Button>
              </div>
            </Form>
          </div>
        )}
        ;
      </div>

      {/* Modal for Editing the user */}
      <Modal show={showEditUserModal} onHide={handleCloseEditUserModal}>
        <Form noValidate validated={validated} onSubmit={updateStudent}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="modal-user-container">
              <div className="row p-0">
                <div className="col-6">
                  <label htmlFor="">Student #</label>
                  <div class="input-group mb-3">
                    <input
                      type="text"
                      value={updateFormData.studentNumber}
                      required
                      name="studentNumber"
                      class="form-control search"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      onChange={handleUpdateFormChange}
                    />
                  </div>
                </div>
                <div className="col-6">
                  <label htmlFor="category">Category</label>
                  <div className="input-group mb-3">
                    <select
                      className="form-control search"
                      aria-label="Default select example"
                      required
                      name="category"
                      onChange={handleUpdateFormChange}
                      style={{ color: "black" }}
                      value={updateFormData.category}
                    >
                      <option value="Student">Student</option>
                      <option value="Employee">Employee</option>
                      <option value="Visitor">Visitor</option>
                      <option value="Department">Department</option>
                    </select>
                  </div>
                </div>
                <div className="col-6">
                  <label htmlFor="">RFID #</label>
                  <div class="input-group mb-3">
                    <input
                      type="text"
                      value={updateFormData.rfid}
                      class="form-control search"
                      readOnly
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                    />
                  </div>
                </div>
                <div className="col-6">
                  <label htmlFor="">Validity</label>
                  <div class="input-group mb-3">
                    <input
                      type="date"
                      value={updateFormData.validity}
                      name="validity"
                      required
                      class="form-control date"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      onChange={handleUpdateFormChange}
                    />
                  </div>
                </div>
              </div>

              <div className="row p-0">
                <div className="col-6">
                  <label htmlFor="">First Name</label>
                  <div class="input-group mb-3">
                    <input
                      type="text"
                      value={updateFormData.firstName}
                      class="form-control search"
                      name="firstName"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      onChange={handleUpdateFormChange}
                    />
                  </div>
                </div>
                <div className="col-6">
                  <label htmlFor="">Last Name</label>
                  <div class="input-group mb-3">
                    <input
                      type="text"
                      value={updateFormData.lastName}
                      class="form-control search"
                      name="lastName"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      onChange={handleUpdateFormChange}
                    />
                  </div>
                </div>
              </div>

              <div className="row p-0">
                <div className="col-6">
                  <label htmlFor="">Contact</label>
                  <div class="input-group  mb-3">
                    <input
                      type="number"
                      value={updateFormData.contactNumber}
                      class="form-control search"
                      name="contactNumber"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      onInput={(e) =>
                        (e.target.value = e.target.value.replace(/\D/, ""))
                      }
                      onChange={handleUpdateFormChange}
                    />
                  </div>
                </div>
                <div className="col-6">
                  <label htmlFor="">Email</label>
                  <div class="input-group  mb-3">
                    <input
                      type="email"
                      value={updateFormData.email}
                      class="form-control search"
                      name="email"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      onChange={handleUpdateFormChange}
                    />
                  </div>
                </div>
              </div>
              <div className="contact-container">
                <label htmlFor="">Home Address</label>
                <div class="input-group  mb-3">
                  <input
                    type="text"
                    value={updateFormData.address}
                    class="form-control search"
                    name="address"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    onChange={handleUpdateFormChange}
                  />
                </div>
              </div>
              <div className="pinsection-modal">
                <div className="label-section">
                  <label htmlFor="">Student PIN</label>
                </div>

                <div className="pin-sec">
                  <div className="firstbox-pin">
                    <Form.Control
                      type="number"
                      style={{ fontSize: "16px", textAlign: "center" }}
                      value={updateFormData.student_pin[0] || ""}
                      onChange={handleUpdateFormChange}
                      data-index={0}
                      name="student_pin"
                      ref={firstPinRef}
                      required
                      onInput={(e) =>
                        (e.target.value = e.target.value.replace(/\D/, ""))
                      }
                    />
                  </div>
                  <div className="secondbox-pin">
                    <Form.Control
                      type="number"
                      style={{ fontSize: "16px", textAlign: "center" }}
                      value={updateFormData.student_pin[1] || ""}
                      onChange={handleUpdateFormChange}
                      name="student_pin"
                      data-index={1}
                      ref={secondPinRef}
                      required
                      onInput={(e) =>
                        (e.target.value = e.target.value.replace(/\D/, ""))
                      }
                    />
                  </div>
                  <div className="thirdbox-pin">
                    <Form.Control
                      type="number"
                      style={{ fontSize: "16px", textAlign: "center" }}
                      value={updateFormData.student_pin[2] || ""}
                      onChange={handleUpdateFormChange}
                      name="student_pin"
                      data-index={2}
                      ref={thirdPinRef}
                      required
                      onInput={(e) =>
                        (e.target.value = e.target.value.replace(/\D/, ""))
                      }
                    />
                  </div>
                  <div className="fourthbox-pin">
                    <Form.Control
                      type="number"
                      style={{ fontSize: "16px", textAlign: "center" }}
                      value={updateFormData.student_pin[3] || ""}
                      onChange={handleUpdateFormChange}
                      name="student_pin"
                      data-index={3}
                      ref={fourthPinRef}
                      required
                      onInput={(e) =>
                        (e.target.value = e.target.value.replace(/\D/, ""))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-primary"
              onClick={handleCloseEditUserModal}
            >
              Cancel
            </Button>
            {/* <Button
              variant="danger"
              onClick={() => handleDelete(updateFormData.studentId)}
            >
              Delete
            </Button> */}
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* change status modal */}
      <Modal
        size="md"
        show={showChangeStatusModal}
        onHide={handleCloseStatusModal}
        backdrop="static"
        animation={false}
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "24px" }}>Change Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="exampleForm.ControlInput2">
            <Form.Label style={{ fontSize: "20px" }}>Status</Form.Label>
            <Form.Select
              style={{ height: "40px", fontSize: "15px" }}
              onChange={handleStatusChange}
              value={selectedStatus}
            >
              <option value="" disabled>
                Select Status
              </option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-warning"
            onClick={handleSave}
            style={{ fontSize: "20px" }}
          >
            Save
          </Button>
          <Button
            variant="outline-secondary"
            onClick={handleCloseStatusModal}
            style={{ fontSize: "20px" }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

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
          <Button variant="primary" onClick={handleBulkUser}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default UserManagement;
