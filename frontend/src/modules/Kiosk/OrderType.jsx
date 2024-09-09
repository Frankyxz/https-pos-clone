import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import eli_logo from "../../assets/image/eli-logo.png";
const OrderType = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderNumber, setOrderNumber] = useState("");

  // const { studentBalance, rfid, directKiosk } = location.state;
  const generateRandomCode = async () => {
    try {
      // const randomLetters = Math.random()
      //   .toString(36)
      //   .substring(2, 6)
      //   .toUpperCase();
      const date = new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");

      const res = await axios.get(`${BASE_URL}/order/get-order-number`);
      console.log(res.data);

      const referenceCode = `${year}${month}${day}${res.data.orderNum}`;
      setOrderNumber(referenceCode);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    generateRandomCode();
  }, []);

  const handleOrderType = async (type) => {
    try {
      navigate(`/kiosk`, {
        state: {
          orderType: type,
        },
      });
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <div className="order-type-container">
        <div className="selection-container">
          <div className="kiosk-logo-container w-eli-logo">
            <div className="kiosk-img-logo cont-eli-logo">
              {/* <h1>LOGO</h1> */}
              <img src={eli_logo} className="eli-logo" />
            </div>
          </div>
          <div className="choose-type-container">
            <h1>CHOOSE ONE</h1>
            <div
              className="kiosk-dine-in"
              onClick={() => handleOrderType("Dine-in")}
            >
              <h1 className="kiosk-type-p">Dine In</h1>
            </div>
            <h1>OR</h1>
            <div
              className="kiosk-take-out"
              onClick={() => handleOrderType("Take-out")}
            >
              <h1 className="kiosk-type-p">Take Out</h1>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderType;
