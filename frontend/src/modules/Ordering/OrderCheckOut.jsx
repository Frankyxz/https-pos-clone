import React, { useEffect, useState, useRef } from "react";
import rfid from "../../assets/icon/rfid_logo.png";
import "../styles/checkout.css";
import "../styles/kiosk-main.css";
// import "../styles/pos_react.css";
import { Button, Modal, Form } from "react-bootstrap";
import BASE_URL from "../../assets/global/url";
import axios from "axios";
import swal from "sweetalert";
import useStoreIP from "../../stores/useStoreIP";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import useStoreCashier from "../../stores/useStoreCashier";
import { CashRegister } from "@phosphor-icons/react";

// import NoImage from "../../assets/image/eli-logo.png";
const OrderCheckOut = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, subtotal, orderType, transactionOrderId } =
    location.state || {};
  const [amount, setAmount] = useState(0);
  const [received, setReceived] = useState(0);
  const [change, setChange] = useState(0);
  const [rfidNum, setRfidNum] = useState("");
  const [IdStudent, setStudentId] = useState("");
  const [userId, setuserId] = useState("");
  const [userType, setUserType] = useState("");
  const [userName, setUserName] = useState("");
  const [checkoutRemarks, setCheckoutRemarks] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const studentNumberRef = useRef(null);
  const checkOutRemarks = useRef(null);
  const inputRef = useRef(null);

  const [cashierPIN, setCashierPIN] = useState("");
  const [isDrawerDisabled, setIsDrawerDisabled] = useState(false);
  const [pin, setPin] = useState("");
  const [validated, setValidated] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  const [selectedPayment, setSelectedPayment] = useState("CASH");
  const [showPaymentContainer, setShowPaymentContainer] = useState(false);
  const [manualInputModal, setManualInputModal] = useState(false);
  const [showModalCard, setShowModalCard] = useState(false);
  const [showCalc, setShowCalc] = useState(true);
  const [isCheckoutButton, setIsCheckoutButton] = useState(true);
  const [showModalCheckout, setModalCheckout] = useState(false);

  const handleModalCheckout = () => setModalCheckout(true);
  //top up card modal
  const handleCloseModalCheckout = () => setModalCheckout(false);
  const handleCloseTopCard = () => {
    setShowModalCard(false);
    setRfidNum("");
    setStudentId("");
    setSelectedPayment("CASH");
    setIsDrawerDisabled(false);
  };
  //Manual input modal
  const handleCloseManualInput = () => {
    setManualInputModal(false);
    setStudentNumber("");
  };

  //function sa pagprint
  const [isPrinterReady, setIsPrinterReady] = useState(false);
  const [printerInstance, setPrinterInstance] = useState(null);

  const ensurePrinterConnection = async () => {
    if (!printerInstance || !isPrinterReady) {
      console.log("Printer not ready, attempting to reconnect...");
      await initPrinter();
    }
  };

  const { setIP, ip } = useStoreIP(); // Ip for printer

  const initPrinter = async () => {
    if (window.IminPrinter) {
      try {
        const printer = new window.IminPrinter(ip); //palitan ng ip address based sa ip ng printer
        console.log("Attempting to connect to printer...");
        await printer.connect();
        console.log("Successfully connected to printer");
        setPrinterInstance(printer);
        setIsPrinterReady(true);
      } catch (error) {
        console.error("Failed to connect to printer:", error);
        setIsPrinterReady(false);
      }
    } else {
      console.error("IminPrinter library not loaded");
    }
  };

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

  
  function formatDateOnly(datetime) {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    return new Date(datetime).toLocaleString("en-US", options);
  }


  const handleReceiptsClick = async (id) => {
    try {
      await ensurePrinterConnection();
      if (!isPrinterReady || !printerInstance) {
        console.error("Printer not ready");
        return;
      }
      let stud;
      let transac;
      if (IdStudent != null) {
        const transacRes = await axios.get(BASE_URL + "/order/get-transac", {
          params: {
            transacID: id,
          },
        });
        transac = transacRes.data;
        console.log(transac);
        const res = await axios.get(
          BASE_URL + "/orderRecords/fetchStudent-Ereceipt",
          {
            params: {
              id: IdStudent,
            },
          }
        );
        stud = res.data;
      }
      await printerInstance.initPrinter();
      await printerInstance.setAlignment(1);
      await printerInstance.setTextSize(40);
      await printerInstance.setTextStyle(1);
      await printerInstance.printText("DUALTECH");
      await printerInstance.setTextStyle(0);
      // await printerInstance.setTextSize(28);
      // await printerInstance.printText("sample@elogicinnovations.com");
      // Print order details
      await printerInstance.setAlignment(1);
      // Spacing
      await printerInstance.printText(
        "                                                                     "
      );
      // await printerInstance.printText("BILLING");
      // Order NUmber
      await printerInstance.printColumnsText(
        ["Transaction Number:", `${transac.order_number}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Terminal:", `${userType}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Cashier:", `${userName}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Payment Method:", `${selectedPayment}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      const currentDate = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Manila",
      });
      await printerInstance.printColumnsText(
        ["Transaction Date:", `${formatDate(new Date(currentDate))}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      if (stud) {
        await printerInstance.printColumnsText(
          ["ID No.:", `${stud.student.student_number}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.printColumnsText(
          ["Name:", `${stud.student.first_name} ${stud.student.last_name}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.printColumnsText(
          ["Initial Balance:", `${transac.purchased_balance}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.printColumnsText(
          ["Remaining Balance:", `${transac.purchased_balance - subtotal}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
      }
      await printerInstance.setTextStyle(0);
      await printerInstance.setTextSize(28);
      await printerInstance.setAlignment(1);
      await printerInstance.printText(
        "----------------------------------------------------------------------"
      );
      await printerInstance.printColumnsText(
        ["Qty", "Description", "Price", "Subtotal"],
        [1, 2, 1, 1],
        [0, 0, 0, 1],
        [28, 28, 28, 28],
        576
      );
      await printerInstance.printText(
        "----------------------------------------------------------------------"
      );
      await printerInstance.printText(`${orderType}`);
      // Print product details
      for (const product of cart) {
        const productName =
          product.variantNames !== ""
            ? `${product.name} (${product.variantNames})`
            : product.name;
        await printerInstance.printColumnsText(
          [
            `${product.quantity}`,
            `${productName}`,
            `${product.price}`,
            `${product.subtotal}`,
          ],
          [1, 2, 1, 1],
          [0, 0, 0, 1],
          [26, 26, 26, 26],
          576
        );
      }
      await printerInstance.setTextStyle(0);
      await printerInstance.setTextSize(28);
      await printerInstance.setAlignment(1);
      await printerInstance.printText(
        "----------------------------------------------------------------------"
      );
      await printerInstance.printColumnsText(
        ["Total:", `${subtotal}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      if (stud) {
        await printerInstance.printColumnsText(
          ["Tap Card:", `${subtotal}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
      }
      await printerInstance.printColumnsText(
        ["Amount Tendered:", `${stud ? subtotal : amount}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Change", `${change}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.setTextStyle(0);
      await printerInstance.setTextSize(28);
      await printerInstance.setAlignment(1);
      await printerInstance.printText(
        "----------------------------------------------------------------------"
      );

      if(transac.remarks !== ""){
        await printerInstance.setAlignment(0);
        await printerInstance.printText(`Remarks: ${transac.remarks}`);
      }
     
      await printerInstance.setAlignment(1);
      await printerInstance.printText(
        "                                                                     "
      );
      await printerInstance.printText("This document is not valid");
      await printerInstance.printText("For claim of input tax");
      await printerInstance.printText(
        "                                                                     "
      );
      await printerInstance.printText(
        "                                                                     "
      );
      await printerInstance.printText("ELI IT Solutions 2024");
 
      await printerInstance.printAndFeedPaper(100);
      await printerInstance.partialCut();


      // Start of Styling Food STAB

      
      await printerInstance.setTextStyle(0);
      await printerInstance.setTextSize(28);
      await printerInstance.setAlignment(1);
      await printerInstance.printText(
        "----------------------------------------------------------------------"
      );
       await printerInstance.printText(
        "                                                                     "
      );
 
      await printerInstance.printColumnsText(
        ["Order #", `${formatDateOnly(new Date(currentDate))}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.setTextStyle(1);
      await printerInstance.setTextSize(70);
      await printerInstance.printText(`${transac.order_number}`);
      await printerInstance.setAlignment(1);

      await printerInstance.setTextStyle(0);
      await printerInstance.setTextSize(25);
      await printerInstance.setAlignment(1);
      // await printerInstance.printText(formatDateOnly(new Date(currentDate)));

      await printerInstance.printText(
        "                                                                     "
      );
      await printerInstance.setTextStyle(0);
      await printerInstance.setTextSize(28);
      await printerInstance.setAlignment(1);
      await printerInstance.printText(
        "----------------------------------------------------------------------"
      );
      await printerInstance.setAlignment(1);

      await printerInstance.printText(
        "                                                                     "
      );
      await printerInstance.printText(
        "                                                                     "
      );
      await printerInstance.printAndFeedPaper(100);
      await printerInstance.partialCut();



      console.log("Printing completed successfully");
    } catch (error) {
      console.error("Failed to print receipt:", error);
    }
  };

  useEffect(() => {
    initPrinter();

    return () => {
      if (printerInstance) {
        printerInstance.close().catch((error) => {
          console.error("Error closing printer connection:", error);
        });
      }
    };
  }, []);

  const openCashDrawer = async () => {
    try {
      await ensurePrinterConnection();
      if (!isPrinterReady || !printerInstance) {
        console.error("Printer not ready");
        return;
      }

      await printerInstance.openCashBox();
      console.log("Cash drawer opened!");
    } catch (error) {
      console.error("Failed to open cash drawer:", error);
    }
  };
  //function sa pagprint

  //function sa pagback to ordering
  const handleBackClick = () => {
    navigate("/ordering", {
      state: {
        cart,
        subtotal,
        orderType,
        transactionOrderId,
      },
    });
  };

  const handleSelectedPayment = (selected) => {
    setSelectedPayment(selected);
    if (selected === "CARD") {
      setIsDrawerDisabled(true);
      setShowModalCard(true);
    } else {
      setShowCalc(true);
      setShowModalCard(false);
      setShowPaymentContainer(false);
      setIsDrawerDisabled(false);
    }
  };

  const handleManualInput = () => {
    setManualInputModal(true);
  };

  const handleCashierPIN = () => {
    setCashierPIN(true);
  };

  const handleCalcToggle = () => {
    setShowCalc(!showCalc);
  };

  const handleCalculator = (value) => {
    if (value === ".") {
      if (amount.includes(".")) {
        return;
      }
      if (amount === "0") {
        setAmount("0.");
      } else {
        setAmount(amount + ".");
      }
      return;
    }

    const newAmountStr = amount === "0" ? value : amount + value;
    const newAmount = parseFloat(newAmountStr);

    const limitedAmount = Math.min(newAmount, 10000000);
    const changeAmount = limitedAmount - subtotal;

    setAmount(limitedAmount.toString());
    setReceived(limitedAmount);
    setChange(changeAmount);

    setIsCheckoutButton(limitedAmount < subtotal);
  };

  const handleDel = () => {
    const newAmountStr = amount.slice(0, -1);

    const newAmount = parseFloat(newAmountStr);

    setAmount(newAmountStr);
    setReceived(isNaN(newAmount) ? 0 : newAmount);
    const changeAmount = newAmount - subtotal;
    setChange(isNaN(changeAmount) ? 0 : changeAmount);

    setIsCheckoutButton(newAmount < subtotal);
  };

  //For function ng keyboard sa calculator
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key;
      if (
        document.activeElement &&
        document.activeElement.type === "password"
      ) {
        return;
      }
      if (
        selectedPayment !== "CARD" &&
        (!isNaN(key) || key === "." || key === "Backspace")
      ) {
        if (
          document.activeElement === studentNumberRef.current ||
          document.activeElement === checkOutRemarks.current
        )
          return;
        event.preventDefault();
        if (key === "Backspace") {
          handleDel();
        } else {
          handleCalculator(key);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleCalculator, handleDel, selectedPayment]);

  const handleClear = () => {
    setAmount("");
    setReceived(0);
    setChange(0);
    setIsCheckoutButton(true);
  };

  const handleCloseModalPin = () => {
    setCashierPIN(false);
  };

  const handleChange = (e, index) => {
    const newValue = e.target.value;
    if (!isNaN(newValue)) {
      setPin((prevPin) => {
        const updatedPin = prevPin.split("");
        updatedPin[index] = newValue;
        return updatedPin.join("");
      });

      if (index < 3 && newValue !== "") {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  const checkPinCashier = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      swal({
        icon: "error",
        title: "Fields are required",
        text: "Please fill in the red text fields.",
      });
    } else {
      axios
        .post(`${BASE_URL}/masterList/checkCashierPin`, {
          userId,
          pin,
        })
        .then((res) => {
          if (res.status === 200) {
            swal({
              icon: "success",
              title: "Correct PIN",
              text: "Your inputted PIN is correct.",
            }).then(() => {
              // handleCheckout();
              setValidated(false);
              setPin("");
              openCashDrawer();
              setCashierPIN(false);
            });
          } else if (res.status === 201) {
            swal({
              icon: "error",
              title: "Incorrect PIN",
              text: "Your inputted PIN is incorrect.",
            }).then(() => {
              setCashierPIN(true);
              setValidated(false);
              setPin("");
            });
          } else if (res.status === 202) {
            swal({
              icon: "error",
              title: "No User Found",
              text: "Your inputted PIN is not recognized.",
            }).then(() => {
              setCashierPIN(true);
              setValidated(false);
              setPin("");
            });
          }
        });
    }
    setValidated(true);
  };

  //for manual input checker
  const handleManualCheckInput = () => {
    axios
      .post(BASE_URL + "/order/checkStudentNumber", {
        studentNumber,
        subtotal,
      })
      .then((res) => {
        if (res.status === 200) {
          setReceived(subtotal);
          setSelectedPayment("CARD");
          setShowPaymentContainer(true);
          handleCloseManualInput();
          setStudentId(res.data.studentId);
          setIsCheckoutButton(false);
          setIsDrawerDisabled(true);
        } else if (res.status === 201) {
          swal({
            title: "Insufficient Balance!",
            text: "Your balance is not enough.",
            icon: "error",
            button: "OK",
          }).then(() => {
            setStudentNumber("");
            handleCloseManualInput();
          });
        } else if (res.status === 204) {
          swal({
            title: "No customer found!",
            text: "Your student number is not registered on the system.",
            icon: "error",
            button: "OK",
          }).then(() => {
            setStudentNumber("");
            handleCloseManualInput();
          });
        }
      });
  };

  const handleCheckout = () => {
    if (transactionOrderId === null || transactionOrderId === undefined) {
      // If transactionOrderId is null or undefined, use checkoutProcess
      axios
        .post(BASE_URL + "/order/checkoutProcess", {
          cart,
          subtotal,
          orderType,
          received,
          change,
          rfidNum,
          IdStudent,
          userId,
          checkoutRemarks,
          studentNumber,
          selectedPayment,
        })
        .then((res) => {
          if (res.status === 200) {
            handleReceiptsClick(res.data.id);
            swal({
              title: "Checkout Transaction Successful!",
              text: "The checkout has been successful.",
              icon: "success",
              button: "OK",
            }).then(() => {
              navigate("/ordering", {
                state: {
                  cart: [],
                  subtotal: 0,
                  orderType: "",
                  transactionOrderId,
                },
              });
            });
          }
        });
    } else {
      axios
        .post(BASE_URL + "/order/addOrderRecordCheckout", {
          transactionOrderId,
          cart,
          subtotal,
          orderType,
          received,
          change,
          rfidNum,
          IdStudent,
          userId,
          checkoutRemarks,
          studentNumber,
          selectedPayment,
        })
        .then((res) => {
          if (res.status === 200) {
            handleReceiptsClick(res.data.id);
            swal({
              title: "Checkout Transaction Successful!",
              text: "The checkout has been successful.",
              icon: "success",
              button: "OK",
            }).then(() => {
              navigate("/ordering", {
                state: {
                  cart: [],
                  subtotal: 0,
                  orderType: "",
                  transactionOrderId,
                },
              });
            });
          }
        });
    }
  };

  // const handleCheckout = () => {
  //   axios
  //     .post(BASE_URL + "/order/checkoutProcess", {
  //       cart,
  //       subtotal,
  //       orderType,
  //       received,
  //       change,
  //       rfidNum,
  //       IdStudent,
  //       userId,
  //       checkoutRemarks,
  //       studentNumber,
  //       selectedPayment,
  //     })
  //     .then((res) => {
  //       if (res.status === 200) {
  //         handleReceiptsClick(res.data.id);
  //         swal({
  //           title: "Checkout Transaction Successful!",
  //           text: "The checked out have been successful.",
  //           icon: "success",
  //           button: "OK",
  //         }).then(() => {
  //           navigate("/ordering", {
  //             state: {
  //               cart: [],
  //               subtotal: 0,
  //               orderType: "",
  //             },
  //           });
  //         });
  //       }
  //     });
  // };

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
      setUserType(decoded.typeUser);
      setUserName(decoded.Fname);
    }
  };

  useEffect(() => {
    decodeToken();
  }, []);

  useEffect(() => {
    if (showModalCard) {
      inputRef.current.focus();
    }
  }, [showModalCard]);

  return (
    <>
      <div className="checkout-container">
        <div className="head-checkout">
          <div className="check-title d-flex p-4 align-items-center">
            <i className="bx bx-chevron-left" onClick={handleBackClick}></i>
            <h2>Check Out</h2>
            <div className="icon-container">
              {/* <i class="bx bxs-cog"></i> */}
            </div>
          </div>
        </div>
        <div className="check-card d-flex m-3">
          {/* Order Details */}
          <div className="card checkout-order-details-container py-5 px-5">
            <div className="checkout-card-header">
              <h2>Order Details</h2>
              <h2>{orderType}</h2>
            </div>
            <br></br>
            <div className="orders-container">
              <table>
                <thead>
                  <tr>
                    <th>QTY</th>
                    <th>ITEM NAME</th>
                    <th>SUBTOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => (
                    <tr key={`${item.product_inventory_id}-${item.variantKey}`}>
                      <td>{item.quantity}</td>
                      <td>
                        <div className="d-flex flex-column p-0">
                          <span>{item.name}</span>
                          {item.variantNames && (
                            <span
                              className="text-muted"
                              style={{ fontSize: "11px" }}
                            >
                              ({item.variantNames})
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {item.subtotal.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Discount */}
          <div className="card discount-container w-25 px-5 py-5">
            <div className="checkout-card-header">
              {/* <h2>Discount</h2> */}
            </div>

            {/* Special Disc */}
            <div className="special-disc">
              {/* <div className="special-disc-header">
                <h3>Special Discount</h3>
                <button className="btn btn-outline-primary rounded-1">
                  Add charge
                </button>
              </div>
              <div className="special-disc-selection">
                <div>
                  <h4>Promo Sales</h4>
                  <p>- ₱50.00</p>
                </div>
                <div>
                  <h4>PWD</h4>
                  <p>- 10%</p>
                </div>
                <div onClick={handleShowManualDiscModal}>
                  <h4>Manual</h4>
                  <p>Select Product</p>
                </div>
              </div> */}
            </div>
            {/* Method */}
            <div className="method">
              <div className="method-header">
                <h3>Payment Method</h3>
                {/* <button className="btn btn-outline-primary rounded-1">
                  {" "}
                  Open Cash Drawer{" "}
                </button> */}
              </div>
              <div className="special-disc-selection">
                <div
                  className={`sales  ${
                    selectedPayment == "CASH" ? "active" : ""
                  } `}
                  onClick={() => handleSelectedPayment("CASH")}
                >
                  <h4>CASH</h4>
                </div>

                {/* <div
                  className={`sales  ${
                    selectedPayment == "GCASH" ? "active" : ""
                  } `}
                  onClick={() => handleSelectedPayment("GCASH")}
                >
                  <h4>GCASH</h4>
                </div> */}

                <div
                  className={`sales  ${
                    selectedPayment == "CARD" ? "active" : ""
                  } `}
                  onClick={() => handleSelectedPayment("CARD")}
                >
                  <h4>CARD</h4>
                </div>
              </div>
              <div className="sales mb-5" onClick={handleManualInput}>
                <h4>MANUAL INPUT</h4>
              </div>
              <div className="d-flex justify-content-center p-0">
                <div
                  className={`sales mb-5 ${isDrawerDisabled ? "disabled" : ""}`}
                  onClick={!isDrawerDisabled ? handleCashierPIN : null}
                  style={{
                    width: "50%",
                    borderRadius: "6px",
                    pointerEvents: isDrawerDisabled ? "none" : "auto",
                    opacity: isDrawerDisabled ? 0.5 : 1,
                    cursor: isDrawerDisabled ? "not-allowed" : "pointer",
                  }}
                >
                  <CashRegister size={32} />

                  <h4>OPEN CASH DRAWER</h4>
                </div>
              </div>
            </div>
            {/* Details */}
            <div className="payment-details p-2">
              <h3>Payment Details</h3>

              <div className="total-containers py-4">
                {/* <div className="subtotal-container cont">
                  <h4>Subtotal</h4>
                  <div className="subtotal">

                  </div>
                </div> */}
                <div className="discount-container cont">
                  <h4>Discount</h4>
                  <div className="discount">-</div>
                </div>
                <div className="payable-container cont">
                  <h4>Payable</h4>
                  <div className="payable">
                    ₱
                    {subtotal.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="received-container cont">
                  <h4>Received</h4>
                  <div className="received">
                    {received.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="Change-container cont">
                  <h4>{change < 0 ? "To Pay" : "Change"}</h4>
                  <div className="change">
                    {Math.abs(change).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment if CASH */}
          {selectedPayment === "CASH" && (
            <div className="card payment-container px-5 py-5">
              <div className="payment-head">
                <h2>Payment</h2>
                <div className="payable-container">
                  <h4>-</h4>
                </div>
              </div>

              <div className="payment-discount">
                <div className="selected-payment">{selectedPayment}</div>
                <div className="amount-container">
                  {amount === "" ? 0 : parseFloat(amount).toLocaleString()}
                </div>
              </div>

              {showCalc && (
                <div className="calc-container">
                  <table>
                    <tr>
                      <th onClick={() => handleCalculator("1")}>1</th>
                      <td
                        style={{
                          borderTop: "0.1px solid rgb(228, 223, 223)",
                          borderBottom: "0.1px solid rgb(228, 223, 223)",
                        }}
                        onClick={() => handleCalculator("2")}
                      >
                        {" "}
                        2
                      </td>
                      <td
                        style={{
                          borderTop: "0.1px solid rgb(228, 223, 223)",
                          borderBottom: "0.1px solid rgb(228, 223, 223)",
                        }}
                        onClick={() => handleCalculator("3")}
                      >
                        3
                      </td>
                      <th className="calc-gray-btn" onClick={handleCalcToggle}>
                        <img
                          width="32"
                          height="32"
                          src="https://img.icons8.com/ios-filled/50/expand-arrow--v1.png"
                          alt="expand-arrow--v1"
                        />
                      </th>
                    </tr>
                    <tr>
                      <td
                        style={{
                          borderLeft: "0.1px solid rgb(228, 223, 223)",
                          borderBottom: "0.1px solid rgb(228, 223, 223)",
                        }}
                        onClick={() => handleCalculator("4")}
                      >
                        4
                      </td>
                      <td
                        style={{
                          borderBottom: "0.1px solid rgb(228, 223, 223)",
                        }}
                        onClick={() => handleCalculator("5")}
                      >
                        5
                      </td>
                      <td
                        style={{
                          borderBottom: "0.1px solid rgb(228, 223, 223)",
                        }}
                        onClick={() => handleCalculator("6")}
                      >
                        6
                      </td>
                      <td className="calc-gray-btn" onClick={handleDel}>
                        <img
                          width="32"
                          height="32"
                          src="https://img.icons8.com/windows/32/clear-symbol.png"
                          alt="clear-symbol"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{ borderLeft: "0.1px solid rgb(228, 223, 223)" }}
                        onClick={() => handleCalculator("7")}
                      >
                        7
                      </td>
                      <td onClick={() => handleCalculator("8")}>8</td>
                      <td onClick={() => handleCalculator("9")}>9</td>
                      <td
                        className="calc-clear-btn"
                        rowSpan={2}
                        onClick={handleClear}
                      >
                        Clear
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="calc-left-last-button"
                        onClick={() => handleCalculator("0")}
                      >
                        0
                      </td>
                      <td
                        style={{
                          borderTop: "0.1px solid rgb(228, 223, 223)",
                          borderBottom: "0.1px solid rgb(228, 223, 223)",
                        }}
                        onClick={() => handleCalculator("00")}
                      >
                        00
                      </td>
                      <td
                        style={{
                          borderTop: "0.1px solid rgb(228, 223, 223)",
                          borderBottom: "0.1px solid rgb(228, 223, 223)",
                        }}
                        onClick={() => handleCalculator(".")}
                      >
                        .
                      </td>
                    </tr>
                  </table>
                </div>
              )}

              <div className="order-checkout-btn">
                <button
                  className="btn-checkout"
                  disabled={isCheckoutButton}
                  style={{
                    cursor: isCheckoutButton ? "not-allowed" : "pointer",
                  }}
                  onClick={handleModalCheckout}
                >
                  Checkout
                </button>
              </div>
            </div>
          )}

          {/* Payment if PIN is correct */}
          {showPaymentContainer && (
            <div className="payment-container px-3">
              <div className="payment-head">
                {/* <h2>Balance</h2> */}
                <div className="payable-container">
                  {/* <h4>{studentBalance}</h4> */}
                </div>
              </div>

              <div className="payment-discount">
                <div className="selected-payment">{selectedPayment}</div>
                <div className="amount-container">{received}</div>
              </div>
              <div
                id="message-container"
                style={{ color: "red", fontSize: "12px" }}
              ></div>
              <div className="calc-container">
                <table>
                  <tr>
                    <th>1</th>
                    <th>2</th>
                    <th>3</th>
                    <th>^</th>
                  </tr>
                  <tr>
                    <th>4</th>
                    <th>5</th>
                    <th>6</th>
                    <th>Del</th>
                  </tr>
                  <tr>
                    <th>7</th>
                    <th>8</th>
                    <th>9</th>
                    <th rowSpan={2}>Clear</th>
                  </tr>
                  <tr>
                    <th>0</th>
                    <th>00</th>
                    <th>.</th>
                  </tr>
                </table>
              </div>

              <div className="order-checkout-btn">
                <button
                  className="btn-checkout"
                  disabled={isCheckoutButton}
                  style={{
                    cursor: isCheckoutButton ? "not-allowed" : "pointer",
                  }}
                  onClick={handleModalCheckout}
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top card modal */}
      <Modal show={showModalCard} onHide={handleCloseTopCard}>
        <Modal.Body>
          <div className="modal-top-card">
            <h2>Please Tap the card</h2>
            <div className="modal-top-card-student">
              <img src={rfid} />
            </div>
            <div>
              <input
                type="text"
                className="mx-5 input-rfid"
                ref={inputRef}
                value={rfidNum}
                // onChange={handleGetRFID}
              />
            </div>
            <div className="button-top-card"></div>
          </div>
        </Modal.Body>
      </Modal>

      {/* confirmation checkout modal */}
      <Modal show={showModalCheckout} onHide={handleCloseModalCheckout}>
        <Modal.Body>
          <div className="modal-checkout-containers">
            <h2>Checkout Confirmation</h2>
            <div className="paymentmethod-payable">
              <span>{selectedPayment}</span>
              <span>
                ₱
                {received.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="total-checkouts">
              <span>Total</span>
              <span>
                ₱
                {subtotal.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="mt-2">
              <Form.Label
                style={{
                  fontSize: "20px",
                }}
              >
                Remarks
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                style={{
                  fontSize: "16px",
                  height: "100px",
                  maxHeight: "100px",
                  resize: "none",
                  overflowY: "auto",
                }}
                ref={checkOutRemarks}
                name="description"
                placeholder="Description"
                onChange={(e) => setCheckoutRemarks(e.target.value)}
                value={checkoutRemarks}
              />
            </div>

            <div className="checkout-button-confirm">
              <button onClick={handleCheckout}>Confirm</button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* manual input modal */}
      <Modal show={manualInputModal} onHide={handleCloseManualInput}>
        <Modal.Body>
          <div className="modal-top-card">
            <h2>Please Input Student Number</h2>
            <div>
              <Form.Control
                type="text"
                className="fs-3 mb-2"
                ref={studentNumberRef}
                onChange={(e) => setStudentNumber(e.target.value)}
                value={studentNumber}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ border: "none" }}>
          <Button variant="primary" onClick={handleManualCheckInput}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal PIN */}
      <Modal show={cashierPIN}>
        <Form noValidate validated={validated} onSubmit={checkPinCashier}>
          <Modal.Body>
            <div className="student-pin-modal-container">
              <h2>Please Enter Your PIN</h2>
              <div className="pin-box-section">
                {inputRefs.map((ref, index) => (
                  <div className="first-form-control" key={index}>
                    <Form.Control
                      type="password"
                      value={pin[index] || ""}
                      onChange={(e) => handleChange(e, index)}
                      required
                      ref={ref}
                      className="no-eye"
                      style={{
                        height: "70px",
                        fontSize: "22px",
                        textAlign: "center",
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="buttonYes-cancel-section">
                <button type="submit">Enter</button>
                <button type="button" onClick={handleCloseModalPin}>
                  Cancel
                </button>
              </div>
            </div>
          </Modal.Body>
        </Form>
      </Modal>
    </>
  );
};

export default OrderCheckOut;
