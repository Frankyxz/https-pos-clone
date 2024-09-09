import React, { useEffect, useRef, useState } from "react";
import rfid from "../../assets/icon/rfid_logo.png";
import axios from "axios";
import { Modal, Form } from "react-bootstrap";
import swal from "sweetalert";
import BASE_URL from "../../assets/global/url";
import { useLocation, useNavigate } from "react-router-dom";
const OrderSummary = () => {
  const inputRef = useRef(null);
  const [subtotal, setSubtotal] = useState(0);
  const [rfidNum, setRfidNum] = useState(null);
  const [modalPin, setModalPin] = useState(false);
  const [studentBalance, setStudentBalance] = useState("");
  const [pin, setPin] = useState("");
  const [validated, setValidated] = useState(false);
  // const [studentID, setStudentID] = useState("");
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  const location = useLocation();
  const navigate = useNavigate();

  const { cart, orderType, totalOrder } = location.state;
  // rfid, directKiosk

  const handleChange = (e, index) => {
    const newValue = e.target.value;
    // Check if the input is a number para maprevent ang NaN
    if (!isNaN(newValue)) {
      setPin((prevPin) => {
        const updatedPin = prevPin.split("");
        updatedPin[index] = newValue;
        return updatedPin.join("");
      });

      // para magmove ang focus ng input sa kasunod na input
      if (index < 3 && newValue !== "") {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    if (modalPin) {
      inputRefs[0].current.focus();
    }
  }, [modalPin]);

  const handleGetRFID = async (event) => {
    try {
      const value = event.target.value;

      setRfidNum(value);
      const res = await axios.get(BASE_URL + "/student/checkBalanceKiosk", {
        params: {
          rfidNum: value,
          subtotal,
        },
      });

      if (res.status === 200) {
        setModalPin(true);
        // setStudentID(res.data.student_id);
      } else if (res.status === 201) {
        swal({
          title: "Insufficient Balance!",
          text: "Your balance is not enough change payment method?",
          icon: "error",
          buttons: {
            excel: {
              text: "YES",
              value: "YES",
              className: "--excel",
            },
            pdf: {
              text: "NO",
              value: "NO",
              className: "--pdf",
            },
          },
        }).then((value) => {
          if (value === "YES") {
            navigate("/kiosk-payment-method", {
              state: {
                totalOrder,
                orderType,
                cart,
              },
            });
          } else {
            setRfidNum("");
            inputRef.current.focus();
          }
        });
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };

  const handleCloseModalPin = () => {
    setModalPin(false);
    setRfidNum("");
    // setStudentID("");
    inputRef.current.focus();
  };

  const checkPin = async (e) => {
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
        .post(`${BASE_URL}/student/checkpinKiosk`, {
          rfidNum,
          pin,
        })
        .then((res) => {
          if (res.status === 200) {
            handleCheckout();
            swal({
              icon: "success",
              title: "Correct PIN",
              text: "Your entered PIN is correct.",
            }).then(() => {
              setValidated(false);
              setPin("");
            });
          } else if (res.status === 201) {
            swal({
              icon: "error",
              title: "Incorrect PIN",
              text: "Your entered PIN is incorrect.",
            }).then(() => {
              setModalPin(true);
              setValidated(false);
              setPin("");
            });
          }
        });
    }
    setValidated(true);
  };

  const handleCheckout = () => {
    const transactionIds = cart.map((item) => item.transaction_id);

    axios
      .post(BASE_URL + "/order/checkoutProcessKioskCard", {
        // transactionIds: transactionIds,
        // orderTransacID,
        // subtotal,
        // orderNumber,
        // orderType,
        // rfidNum,
      })
      .then((res) => {
        if (res.status === 200) {
          // navigate("/kiosk-order-number", {
          //   state: { orderNumber: orderNumber },
          // });
        }
      });
  };

  useEffect(() => {
    const handleClick = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <>
      <div className="order-type-container">
        <div className="selection-container ">
          <div className="kiosk-summary-title">
            <h1>Order Summary</h1>
          </div>
          <div className="kiosk-sum-table">
            <table>
              <thead>
                <tr>
                  <th>QTY</th>
                  <th>ITEM NAME</th>
                  <th>PRICE</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={`${item.product_inventory_id}-${item.variantKey}`}>
                    <td>
                      <div className="order-qty">{item.quantity}</div>
                    </td>
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
                      {item.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      {" "}
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
          <div className="px-5">
            <hr />
          </div>

          <div className="kiosk-sum-total">
            <h1>Total Payment</h1>
            <h1 className="sum-total">
              ₱
              {totalOrder
                ? totalOrder.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : ""}
            </h1>
          </div>
          <div className="kiosk-tap-card">
            <h1>Please Tap the card</h1>
            {/* <img src={rfid} /> */}
            <h1 className="ellipsis">...</h1>
          </div>

          <div>
            <input
              type="text"
              className="mx-5 input-rfid"
              // style={{ fontSize: "10rem" }}
              ref={inputRef}
              value={rfidNum}
              onChange={handleGetRFID}
            />
          </div>
        </div>
        {/* <div className="kiosk-w-btn">
          <button type="button">PAY YOUR ORDER</button>
        </div> */}
      </div>

      <Modal show={modalPin} backdrop="static">
        <Form noValidate validated={validated} onSubmit={checkPin}>
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

export default OrderSummary;
