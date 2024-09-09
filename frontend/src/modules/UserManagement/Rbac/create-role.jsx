import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import swal from "sweetalert";
import _Sidebar from "../../Sidebar/_Sidebar";
import "../../styles/usermanagement.css";
// import "../styles/pos_react.css";
import { customStyles } from "../../styles/table-style";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import axios from "axios";
import BASE_URL from "../../../assets/global/url";
import { jwtDecode } from "jwt-decode";
const CreateUserRole = () => {
  const navigate = useNavigate();
  const [userId, setuserId] = useState("");

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

  const [name, setName] = useState();
  const [validated, setValidated] = useState(false);
  const [desc, setDesc] = useState();
  const [checkedItems, setCheckedItems] = useState([]);

  const selectAll = () => {
    const checkboxIds = [
      "Dashboard-View",
      // "Dashboard-Add",
      // "Dashboard-Edit",
      // "Dashboard-Delete",
      // "Dashboard-IE",
      "InventoryStock-View",
      // "InventoryStock-Add",
      // "InventoryStock-Edit",
      // "InventoryStock-Delete",
      // "InventoryStock-IE",
      "ReceivingStock-View",
      "ReceivingStock-Add",
      // "ReceivingStock-Edit",
      // "ReceivingStock-Delete",
      // "ReceivingStock-IE",
      "OutboundingStock-View",
      "OutboundingStock-Add",
      // "OutboundingStock-Edit",
      // "OutboundingStock-Delete",
      // "OutboundingStock-IE",
      "StockCounting-View",
      "StockCounting-Add",
      // "StockCounting-Edit",
      // "StockCounting-Delete",
      // "StockCounting-IE",
      "EReceipt-View",
      // "EReceipt-Add",
      // "EReceipt-Edit",
      // "EReceipt-Delete",
      "EReceipt-IE",
      "Product-View",
      "Product-Add",
      "Product-Edit",
      "Product-Delete",
      // "Product-IE",
      "Archive-View",
      // "Archive-Add",
      // "Archive-Edit",
      "Archive-Delete",
      // "Archive-IE",
      "RawMaterial-View",
      "RawMaterial-Add",
      "RawMaterial-Edit",
      "RawMaterial-Delete",
      // "RawMaterial-IE",
      "CookBook-View",
      "CookBook-Add",
      "CookBook-Edit",
      // "CookBook-Delete",
      // "CookBook-IE",
      "RFID-View",
      "RFID-Add",
      // "RFID-Edit",
      // "RFID-Delete",
      "RFID-IE",
      "InventoryReport-View",
      // "InventoryReport-Add",
      // "InventoryReport-Edit",
      // "InventoryReport-Delete",
      "InventoryReport-IE",
      "RawInventoryReport-View",
      "RawInventoryReport-IE",
      "POSReport-View",
      // "POSReport-Add",
      // "POSReport-Edit",
      // "POSReport-Delete",
      "POSReport-IE",
      "RFIDReport-View",
      // "RFIDReport-Add",
      // "RFIDReport-Edit",
      // "RFIDReport-Delete",
      "RFIDReport-IE",
      "BulkLoadReport-View",
      "BulkLoadReport-IE",
      "StoreReport-View",
      "StoreReport-IE",
      "CustomerReport-View",
      // "CustomerReport-Add",
      // "CustomerReport-Edit",
      // "CustomerReport-Delete",
      "CustomerReport-IE",
      "CustomerList-View",
      "CustomerList-Add",
      "CustomerList-Edit",
      "CustomerList-Delete",
      "CustomerList-IE",
      "User-View",
      "User-Add",
      "User-Edit",
      "User-Delete",
      // "User-IE",
      "UserRole-View",
      "UserRole-Add",
      "UserRole-Edit",
      "UserRole-Delete",
      "UserTransaction-View",
      // "UserTransaction-Add",
      // "UserTransaction-Edit",
      // "UserTransaction-Delete",
      // "UserTransaction-IE",
      "Ordering-View",
      // "Ordering-Add",
      // "Ordering-Edit",
      // "Ordering-Delete",
      // "Ordering-IE",
      "MenuProfile-View",
      "MenuProfile-Add",
      // "MenuProfile-Delete",
      // "MenuProfile-IE",
      "CustomizationReceipt-View",
      "CustomizationReceipt-Add",
      "CustomizationReceipt-Edit",
      "CustomizationReceipt-Delete",
      // "CustomizationReceipt-IE",
      "Hardware-View",
      "Hardware-Add",
      "Hardware-Edit",
      "Hardware-Delete",
      // "Hardware-IE",
      "LossBack-View",
      "LossBack-Add",
      "LossBack-Edit",
      // "LossBack-Delete",
      // "LossBack-IE",
      "Loyalty-View",
      "Loyalty-Add",
      "Loyalty-Edit",
      "Loyalty-Delete",
      // "Loyalty-IE",
      "ProductExtra-View",
      "ProductExtra-Add",
      "ProductExtra-Edit",
      // "ProductExtra-Delete",
      // "ProductExtra-IE",
    ];

    const updatedCheckboxes = checkboxIds.map((value) => ({
      id: value,
    }));

    setCheckedItems(updatedCheckboxes);

    console.log(updatedCheckboxes);
  };

  const deselectAll = () => {
    setCheckedItems([]);
  };
  // const handleCheckboxChange = (event) => {
  //   const { id, checked } = event.target;
  //   let updatedItems;

  //   if (id === "Dashboard-View") {
  //     if (!checked) {
  //       updatedItems = checkedItems.filter(
  //         (item) => !item.id.startsWith("Dashboard-")
  //       );
  //     } else {
  //       // If checking Dashboard-View, just add it
  //       updatedItems = [...checkedItems, { id }];
  //     }
  //   } else if (id === "InventoryStock-View") {
  //     if (!checked) {
  //       updatedItems = checkedItems.filter(
  //         (item) => !item.id.startsWith("InventoryStock-")
  //       );
  //     } else {
  //       // If checking Dashboard-View, just add it
  //       updatedItems = [...checkedItems, { id }];
  //     }
  //   } else {
  //     if (checkedItems.some((item) => item.id === id)) {
  //       // Remove the item from the checkedItems array
  //       updatedItems = checkedItems.filter((item) => item.id !== id);
  //     } else {
  //       // Add the new item to the checkedItems array
  //       updatedItems = [...checkedItems, { id }];
  //     }
  //   }

  //   // Update the state with the new array
  //   setCheckedItems(updatedItems);

  //   // Log the final state of checkedItems
  //   console.log("Updated checkedItems:", updatedItems);
  // };
  const handleCheckboxChange = (event) => {
    const { id, checked } = event.target;
    let updatedItems;

    if (id === "Dashboard-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("Dashboard-")
        );
      } else {
        // If checking Dashboard-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "InventoryStock-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("InventoryStock-")
        );
      } else {
        // If checking InventoryStock-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "RawInventoryReport-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("RawInventoryReport-")
        );
      } else {
        // If checking RawInventoryReport-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "ReceivingStock-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("ReceivingStock-")
        );
      } else {
        // If checking Receiving-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "OutboundingStock-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("OutboundingStock-")
        );
      } else {
        // If checking Outbounding-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "StockCounting-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("StockCounting-")
        );
      } else {
        // If checking StockCounting-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "EReceipt-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("EReceipt-")
        );
      } else {
        // If checking EReceipt-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "Product-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("Product-")
        );
      } else {
        // If checking Product-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "Archive-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("Archive-")
        );
      } else {
        // If checking Archive-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "RawMaterial-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("RawMaterial-")
        );
      } else {
        // If checking RawMaterial-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "CookBook-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("CookBook-")
        );
      } else {
        // If checking CookBook-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "RFID-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("RFID-")
        );
      } else {
        // If checking RFID-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "InventoryReport-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("InventoryReport-")
        );
      } else {
        // If checking InventoryReport-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "POSReport-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("POSReport-")
        );
      } else {
        // If checking POSReport-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "RFIDReport-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("RFIDReport-")
        );
      } else {
        // If checking RFIDReport-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "BulkLoadReport-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("BulkLoadReport-")
        );
      } else {
        // If checking BulkLoadReport-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "StoreReport-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("StoreReport-")
        );
      } else {
        // If checking StoreReport-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "CustomerReport-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("CustomerReport-")
        );
      } else {
        // If checking CustomerReport-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "CustomerList-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("CustomerList-")
        );
      } else {
        // If checking CustomerList-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "User-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("User-")
        );
      } else {
        // If checking User-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "UserRole-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("UserRole-")
        );
      } else {
        // If checking UserRole-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "UserTransaction-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("UserTransaction-")
        );
      } else {
        // If checking UserTransaction-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "Ordering-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("Ordering-")
        );
      } else {
        // If checking Ordering-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "MenuProfile-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("MenuProfile-")
        );
      } else {
        // If checking MenuProfile-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "CustomizationReceipt-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("CustomizationReceipt-")
        );
      } else {
        // If checking CustomizationReceipt-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "Hardware-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("Hardware-")
        );
      } else {
        // If checking Hardware-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "LossBack-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("LossBack-")
        );
      } else {
        // If checking LossBack-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "Loyalty-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("Loyalty-")
        );
      } else {
        // If checking Loyalty-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else if (id === "ProductExtra-View") {
      if (!checked) {
        updatedItems = checkedItems.filter(
          (item) => !item.id.startsWith("ProductExtra-")
        );
      } else {
        // If checking ProductExtra-View, just add it
        updatedItems = [...checkedItems, { id }];
      }
    } else {
      if (checkedItems.some((item) => item.id === id)) {
        // Remove the item from the checkedItems array
        updatedItems = checkedItems.filter((item) => item.id !== id);
      } else {
        // Add the new item to the checkedItems array
        updatedItems = [...checkedItems, { id }];
      }
    }

    // Update the state with the new array
    setCheckedItems(updatedItems);

    // Log the final state of checkedItems
    console.log("Updated checkedItems:", updatedItems);
  };
  const add = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      // if required fields has NO value
      //    console.log('requried')
      swal({
        icon: "error",
        title: "Fields are required",
        text: "Please fill the red text fields",
      });
    } else {
      if (checkedItems && checkedItems.length === 0) {
        swal({
          icon: "error",
          title: "Checkbox field required",
          text: "Please select at least one checkbox",
        });
        return;
      }
      swal({
        title: `Are you sure want to save this new role?`,
        text: "This action cannot be undo.",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then(async (approve) => {
        if (approve) {
          axios
            .post(`${BASE_URL}/userRole/createRbac`, {
              name,
              desc,
              checkedItems,
              userId,
            })
            .then((res) => {
              // console.log(res);
              if (res.status === 200) {
                swal({
                  title: "Success",
                  text: "Role successfully created",
                  icon: "success",
                  button: "OK",
                }).then(() => {
                  navigate("/user-role");
                });
              } else if (res.status === 202) {
                swal({
                  title: "Rolename already taken",
                  text: "Please input another name",
                  icon: "error",
                  button: "OK",
                });
              } else {
                swal({
                  icon: "error",
                  title: "Something went wrong",
                  text: "Please contact our support",
                });
              }
            });
        }
      });
    }
    setValidated(true); //for validations
  };

  return (
    <>
      <div>
        <div className="create-role-container">
          <div className="title-container pt-5 stud-man-container">
            <h2>Create User Access</h2>
          </div>
          <Form noValidate validated={validated} onSubmit={add}>
            <div className="main-role-container">
              <div className="input-role-container">
                <p>Name</p>
                <Form.Control
                  placeholder="Enter Role Name"
                  className="form-control mb-0"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="input-role-container">
                <p>Description</p>
                <Form.Control
                  placeholder="Description"
                  className="form-control mb-0"
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>
            </div>

            <div className="btn-role-container">
              <button type="button" onClick={selectAll}>
                Select All
              </button>
              <button type="button" onClick={deselectAll}>
                Unselect All
              </button>
            </div>

            {/* Card Section */}
            {/* <div className="custom-card role-card"></div> */}

            <table className="role-table-lists">
              <thead>
                <th>Module</th>
                <th>View</th>
                <th>Add</th>
                <th>Edit</th>
                <th>Archive/Delete</th>
                <th>Import/Export</th>
              </thead>
              <tbody>
                <tr>
                  <td className="module-title" colSpan={6}>
                    Dashboard
                  </td>
                </tr>
                <tr>
                  <td className="sub-module-title">Dashboard</td>
                  <td>
                    <input
                      id="Dashboard-View"
                      type="checkbox"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Dashboard-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      id="Dashboard-Add"
                      type="checkbox"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "Dashboard-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Dashboard-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      id="Dashboard-Edit"
                      type="checkbox"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "Dashboard-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Dashboard-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      id="Dashboard-Delete"
                      type="checkbox"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "Dashboard-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Dashboard-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      id="Dashboard-IE"
                      type="checkbox"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "Dashboard-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Dashboard-IE"
                      )}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="module-title" colSpan={6}>
                    Inventory
                  </td>
                </tr>
                {/* Inventory Stock */}
                <tr>
                  <td className="sub-module-title">Inventory Stock</td>
                  <td>
                    <input
                      type="checkbox"
                      id="InventoryStock-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "InventoryStock-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="InventoryStock-Add"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "InventoryStock-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "InventoryStock-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="InventoryStock-Edit"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "InventoryStock-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "InventoryStock-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="InventoryStock-Delete"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "InventoryStock-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "InventoryStock-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="InventoryStock-IE"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "InventoryStock-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "InventoryStock-IE"
                      )}
                    />
                  </td>
                </tr>
                {/* Receiving */}
                <tr>
                  <td className="sub-module-title">Receiving Stock</td>
                  <td>
                    <input
                      type="checkbox"
                      id="ReceivingStock-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "ReceivingStock-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="ReceivingStock-Add"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "ReceivingStock-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "ReceivingStock-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="ReceivingStock-Edit"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "ReceivingStock-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "ReceivingStock-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="ReceivingStock-Delete"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "ReceivingStock-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "ReceivingStock-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="ReceivingStock-IE"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "ReceivingStock-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "ReceivingStock-IE"
                      )}
                    />
                  </td>
                </tr>
                {/* Outbouding */}
                <tr>
                  <td className="sub-module-title">Outbounding Stock</td>
                  <td>
                    <input
                      type="checkbox"
                      id="OutboundingStock-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "OutboundingStock-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="OutboundingStock-Add"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "OutboundingStock-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "OutboundingStock-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "OutboundingStock-View"
                      //   )
                      // }
                      id="OutboundingStock-Edit"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "OutboundingStock-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "OutboundingStock-View"
                      //   )
                      // }
                      id="OutboundingStock-Delete"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "OutboundingStock-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "OutboundingStock-View"
                      //   )
                      // }
                      id="OutboundingStock-IE"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "OutboundingStock-IE"
                      )}
                    />
                  </td>
                </tr>
                {/* Stock Counting */}
                <tr>
                  <td className="sub-module-title">Stock Counting</td>
                  <td>
                    <input
                      type="checkbox"
                      id="StockCounting-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "StockCounting-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="StockCounting-Add"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "StockCounting-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "StockCounting-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="StockCounting-Edit"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "StockCounting-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "StockCounting-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="StockCounting-Delete"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "StockCounting-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "StockCounting-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="StockCounting-IE"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "StockCounting-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "StockCounting-IE"
                      )}
                    />
                  </td>
                </tr>
                {/* E-receipt */}
                <tr>
                  <td className="module-title" colSpan={6}>
                    E-receipt
                  </td>
                </tr>
                <tr>
                  <td className="sub-module-title">E-receipt</td>
                  <td>
                    <input
                      type="checkbox"
                      id="EReceipt-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "EReceipt-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="EReceipt-Add"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "EReceipt-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "EReceipt-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="EReceipt-Edit"
                      onChange={handleCheckboxChange}
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "EReceipt-View"
                      //   )
                      // }
                      checked={checkedItems.some(
                        (item) => item.id === "EReceipt-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="EReceipt-Delete"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "EReceipt-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "EReceipt-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="EReceipt-IE"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "EReceipt-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "EReceipt-IE"
                      )}
                    />
                  </td>
                </tr>
                {/* Products */}
                <tr>
                  <td className="module-title" colSpan={6}>
                    Products
                  </td>
                </tr>

                {/* Product Data */}
                <tr>
                  <td className="sub-module-title">Products Data</td>
                  <td>
                    <input
                      type="checkbox"
                      id="Product-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Product-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Product-Add"
                      disabled={
                        !checkedItems.some((item) => item.id === "Product-View")
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Product-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Product-Edit"
                      disabled={
                        !checkedItems.some((item) => item.id === "Product-View")
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Product-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Product-Delete"
                      disabled={
                        !checkedItems.some((item) => item.id === "Product-View")
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Product-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Product-IE"
                      disabled
                      // ={
                      //   !checkedItems.some((item) => item.id === "Product-View")
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Product-IE"
                      )}
                    />
                  </td>
                </tr>
                {/* Archive */}
                <tr>
                  <td className="sub-module-title">Archive </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Archive-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Archive-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Archive-Add"
                      disabled
                      // ={
                      //   !checkedItems.some((item) => item.id === "Archive-View")
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Archive-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Archive-Edit"
                      disabled
                      // ={
                      //   !checkedItems.some((item) => item.id === "Archive-View")
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Archive-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Archive-Delete"
                      disabled={
                        !checkedItems.some((item) => item.id === "Archive-View")
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Archive-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Archive-IE"
                      disabled
                      // ={
                      //   !checkedItems.some((item) => item.id === "Archive-View")
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Archive-IE"
                      )}
                    />
                  </td>
                </tr>
                {/* Raw Material */}
                <tr>
                  <td className="sub-module-title">Raw Material</td>
                  <td>
                    <input
                      type="checkbox"
                      id="RawMaterial-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "RawMaterial-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="RawMaterial-Add"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "RawMaterial-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "RawMaterial-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="RawMaterial-Edit"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "RawMaterial-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "RawMaterial-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "RawMaterial-View"
                        )
                      }
                      id="RawMaterial-Delete"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "RawMaterial-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "RawMaterial-View"
                      //   )
                      // }
                      id="RawMaterial-IE"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "RawMaterial-IE"
                      )}
                    />
                  </td>
                </tr>
                {/* Cook Book */}
                <tr>
                  <td className="sub-module-title">Cook Book</td>
                  <td>
                    <input
                      type="checkbox"
                      id="CookBook-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "CookBook-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="CookBook-Add"
                      onChange={handleCheckboxChange}
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "CookBook-View"
                        )
                      }
                      checked={checkedItems.some(
                        (item) => item.id === "CookBook-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="CookBook-Edit"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "CookBook-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "CookBook-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="CookBook-Delete"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "CookBook-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "CookBook-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="CookBook-IE"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "CookBook-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "CookBook-IE"
                      )}
                    />
                  </td>
                </tr>

                <tr>
                  <td className="module-title" colSpan={6}>
                    RFID
                  </td>
                </tr>
                <tr>
                  <td className="sub-module-title">RFID</td>
                  <td>
                    <input
                      type="checkbox"
                      id="RFID-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "RFID-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="RFID-Add"
                      disabled={
                        !checkedItems.some((item) => item.id === "RFID-View")
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "RFID-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="RFID-Edit"
                      disabled
                      // ={
                      //   !checkedItems.some((item) => item.id === "RFID-View")
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "RFID-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="RFID-Delete"
                      disabled
                      // ={
                      //   !checkedItems.some((item) => item.id === "RFID-View")
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "RFID-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="RFID-IE"
                      disabled={
                        !checkedItems.some((item) => item.id === "RFID-View")
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "RFID-IE"
                      )}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="module-title" colSpan={6}>
                    Reports
                  </td>
                </tr>
                {/* Inventory Report */}
                <tr>
                  <td className="sub-module-title">Inventory Report</td>
                  <td>
                    <input
                      type="checkbox"
                      id="InventoryReport-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "InventoryReport-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="InventoryReport-Add"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "InventoryReport-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "InventoryReport-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="InventoryReport-Edit"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "InventoryReport-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "InventoryReport-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="InventoryReport-Delete"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "InventoryReport-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "InventoryReport-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="InventoryReport-IE"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "InventoryReport-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "InventoryReport-IE"
                      )}
                    />
                  </td>
                </tr>

                {/* Raw Inventory Report */}
                <tr>
                  <td className="sub-module-title">
                    Raw Materials Inventory Report
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="RawInventoryReport-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "RawInventoryReport-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="RawInventoryReport-Add"
                      disabled
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "RawInventoryReport-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="RawInventoryReport-Edit"
                      disabled
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "RawInventoryReport-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="RawInventoryReport-Delete"
                      disabled
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "RawInventoryReport-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="RawInventoryReport-IE"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "RawInventoryReport-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "RawInventoryReport-IE"
                      )}
                    />
                  </td>
                </tr>

                {/* POS REPORT */}
                <tr>
                  <td className="sub-module-title">POS Report</td>
                  <td>
                    <input
                      type="checkbox"
                      id="POSReport-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "POSReport-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="POSReport-Add"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "POSReport-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "POSReport-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="POSReport-Edit"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "POSReport-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "POSReport-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="POSReport-Delete"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "POSReport-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "POSReport-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="POSReport-IE"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "POSReport-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "POSReport-IE"
                      )}
                    />
                  </td>
                </tr>
                {/* RFID Report */}
                <tr>
                  <td className="sub-module-title">RFID Report</td>
                  <td>
                    <input
                      type="checkbox"
                      id="RFIDReport-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "RFIDReport-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="RFIDReport-Add"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "RFIDReport-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "RFIDReport-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="RFIDReport-Edit"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "RFIDReport-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "RFIDReport-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="RFIDReport-Delete"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "RFIDReport-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "RFIDReport-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="RFIDReport-IE"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "RFIDReport-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "RFIDReport-IE"
                      )}
                    />
                  </td>
                </tr>
                {/* Bulk Load */}
                <tr>
                  <td className="sub-module-title">Bulk Load Report</td>
                  <td>
                    <input
                      type="checkbox"
                      id="BulkLoadReport-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "BulkLoadReport-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="BulkLoadReport-Add"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "BulkLoadReport-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "BulkLoadReport-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="BulkLoadReport-Edit"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "BulkLoadReport-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "BulkLoadReport-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="BulkLoadReport-Delete"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "BulkLoadReport-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "BulkLoadReport-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="BulkLoadReport-IE"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "BulkLoadReport-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "BulkLoadReport-IE"
                      )}
                    />
                  </td>
                </tr>

                {/* Store Operate Report */}
                <tr>
                  <td className="sub-module-title">Store Operate Report</td>
                  <td>
                    <input
                      type="checkbox"
                      id="StoreReport-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "StoreReport-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="StoreReport-Add"
                      disabled
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "StoreReport-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="StoreReport-Edit"
                      disabled
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "StoreReport-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="StoreReport-Delete"
                      disabled
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "StoreReport-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="StoreReport-IE"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "StoreReport-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "StoreReport-IE"
                      )}
                    />
                  </td>
                </tr>
                {/* Customer Report */}
                <tr>
                  <td className="sub-module-title">Customer Report</td>
                  <td>
                    <input
                      type="checkbox"
                      id="CustomerReport-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "CustomerReport-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="CustomerReport-Add"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "CustomerReport-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "CustomerReport-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="CustomerReport-Edit"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "CustomerReport-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "CustomerReport-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="CustomerReport-Delete"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "CustomerReport-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "CustomerReport-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="CustomerReport-IE"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "CustomerReport-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "CustomerReport-IE"
                      )}
                    />
                  </td>
                </tr>

                <tr>
                  <td className="module-title" colSpan={6}>
                    User
                  </td>
                </tr>
                {/* Customer Lists */}
                <tr>
                  <td className="sub-module-title">Customer Lists</td>
                  <td>
                    <input
                      type="checkbox"
                      id="CustomerList-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "CustomerList-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="CustomerList-Add"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "CustomerList-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "CustomerList-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="CustomerList-Edit"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "CustomerList-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "CustomerList-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="CustomerList-Delete"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "CustomerList-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "CustomerList-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="CustomerList-IE"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "CustomerList-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "CustomerList-IE"
                      )}
                    />
                  </td>
                </tr>
                {/* User Management */}
                <tr>
                  <td className="sub-module-title">User Management</td>
                  <td>
                    <input
                      type="checkbox"
                      id="User-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "User-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="User-Add"
                      disabled={
                        !checkedItems.some((item) => item.id === "User-View")
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "User-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="User-Edit"
                      disabled={
                        !checkedItems.some((item) => item.id === "User-View")
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "User-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="User-Delete"
                      disabled={
                        !checkedItems.some((item) => item.id === "User-View")
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "User-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="User-IE"
                      disabled
                      // ={
                      //   !checkedItems.some((item) => item.id === "User-View")
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "User-IE"
                      )}
                    />
                  </td>
                </tr>
                {/* User Role */}
                <tr>
                  <td className="sub-module-title">User Role</td>
                  <td>
                    <input
                      type="checkbox"
                      id="UserRole-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "UserRole-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="UserRole-Add"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "UserRole-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "UserRole-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="UserRole-Edit"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "UserRole-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "UserRole-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="UserRole-Delete"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "UserRole-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "UserRole-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="UserRole-IE"
                      disabled
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "UserRole-IE"
                      )}
                    />
                  </td>
                </tr>
                {/* Uaser Transaction */}
                <tr>
                  <td className="sub-module-title">User Transaction</td>
                  <td>
                    <input
                      type="checkbox"
                      id="UserTransaction-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "UserTransaction-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="UserTransaction-Add"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "UserTransaction-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "UserTransaction-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="UserTransaction-Edit"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "UserTransaction-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "UserTransaction-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="UserTransaction-Delete"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "UserTransaction-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "UserTransaction-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="UserTransaction-IE"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "UserTransaction-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "UserTransaction-IE"
                      )}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="module-title" colSpan={6}>
                    Ordering
                  </td>
                </tr>
                {/* Ordering */}
                <tr>
                  <td className="sub-module-title">Ordering</td>
                  <td>
                    <input
                      type="checkbox"
                      id="Ordering-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Ordering-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Ordering-Add"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "Ordering-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Ordering-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Ordering-Edit"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "Ordering-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Ordering-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Ordering-Delete"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "Ordering-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Ordering-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Ordering-IE"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "Ordering-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Ordering-IE"
                      )}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="module-title" colSpan={6}>
                    Settings
                  </td>
                </tr>
                {/* Menu Profile */}
                <tr>
                  <td className="sub-module-title">Menu Profile</td>
                  <td>
                    <input
                      type="checkbox"
                      id="MenuProfile-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "MenuProfile-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="MenuProfile-Add"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "MenuProfile-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "MenuProfile-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="MenuProfile-Edit"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "MenuProfile-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "MenuProfile-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="MenuProfile-Delete"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "MenuProfile-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "MenuProfile-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="MenuProfile-IE"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "MenuProfile-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "MenuProfile-IE"
                      )}
                    />
                  </td>
                </tr>
                {/* Customize Receipt */}
                <tr>
                  <td className="sub-module-title">Customization Receipt</td>
                  <td>
                    <input
                      type="checkbox"
                      id="CustomizationReceipt-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "CustomizationReceipt-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="CustomizationReceipt-Add"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "CustomizationReceipt-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "CustomizationReceipt-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="CustomizationReceipt-Edit"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "CustomizationReceipt-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "CustomizationReceipt-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="CustomizationReceipt-Delete"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "CustomizationReceipt-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "CustomizationReceipt-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="CustomizationReceipt-IE"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "CustomizationReceipt-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "CustomizationReceipt-IE"
                      )}
                    />
                  </td>
                </tr>
                {/* Hardware Settings */}
                <tr>
                  <td className="sub-module-title">Hardware Settings</td>
                  <td>
                    <input
                      type="checkbox"
                      id="Hardware-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Hardware-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Hardware-Add"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "Hardware-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Hardware-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Hardware-Edit"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "Hardware-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Hardware-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Hardware-Delete"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "Hardware-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Hardware-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Hardware-IE"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "Hardware-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Hardware-IE"
                      )}
                    />
                  </td>
                </tr>
                {/* Loss Back Customer */}
                <tr>
                  <td className="sub-module-title">Loss Back Customer</td>
                  <td>
                    <input
                      type="checkbox"
                      id="LossBack-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "LossBack-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="LossBack-Add"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "LossBack-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "LossBack-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="LossBack-Edit"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "LossBack-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "LossBack-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="LossBack-Delete"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "LossBack-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "LossBack-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="LossBack-IE"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "LossBack-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "LossBack-IE"
                      )}
                    />
                  </td>
                </tr>
                {/* Loyaltly POints */}
                <tr>
                  <td className="sub-module-title">Loyalty Points</td>
                  <td>
                    <input
                      type="checkbox"
                      id="Loyalty-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Loyalty-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Loyalty-Add"
                      disabled={
                        !checkedItems.some((item) => item.id === "Loyalty-View")
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Loyalty-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Loyalty-Edit"
                      disabled={
                        !checkedItems.some((item) => item.id === "Loyalty-View")
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Loyalty-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Loyalty-Delete"
                      disabled={
                        !checkedItems.some((item) => item.id === "Loyalty-View")
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Loyalty-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="Loyalty-IE"
                      disabled
                      // ={
                      //   !checkedItems.some((item) => item.id === "Loyalty-View")
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "Loyalty-IE"
                      )}
                    />
                  </td>
                </tr>
                {/* Product Extra Options */}
                <tr>
                  <td className="sub-module-title">Product Extra Options</td>
                  <td>
                    <input
                      type="checkbox"
                      id="ProductExtra-View"
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "ProductExtra-View"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="ProductExtra-Add"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "ProductExtra-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "ProductExtra-Add"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="ProductExtra-Edit"
                      disabled={
                        !checkedItems.some(
                          (item) => item.id === "ProductExtra-View"
                        )
                      }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "ProductExtra-Edit"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="ProductExtra-Delete"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "ProductExtra-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "ProductExtra-Delete"
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="ProductExtra-IE"
                      disabled
                      // ={
                      //   !checkedItems.some(
                      //     (item) => item.id === "ProductExtra-View"
                      //   )
                      // }
                      onChange={handleCheckboxChange}
                      checked={checkedItems.some(
                        (item) => item.id === "ProductExtra-IE"
                      )}
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="btn-role-save">
              <button
                type="button"
                className="role-back"
                onClick={() => navigate("/user-role")}
              >
                Back
              </button>
              <button type="submit" className="role-save">
                Save
              </button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default CreateUserRole;
