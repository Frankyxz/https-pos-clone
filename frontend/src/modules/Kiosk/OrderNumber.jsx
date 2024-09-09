import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
const OrderNumber = () => {
  const location = useLocation();
  const orderNumber = location.state.orderNumber;
  const mop = location.state.mop;

  const navigate = useNavigate();

  const handleToMainScreen = () => {
    navigate("/kiosk-main");
  };
  return (
    <>
      <div className="order-type-container">
        <div className="selection-container">
          <div className="order-ty-container">
            <h1>Thank You!</h1>
          </div>
          <div className="your-num-container">
            <h1>YOUR ORDER NUMBER IS</h1>
            <h1 className="kiosk-order-num">{orderNumber}</h1>
          </div>
          <div className="px-5">
            <hr />
          </div>
          <div className="kiosk-proceed-container">
            {mop == "counter" ? (
              <>
                <h1>
                  Please proceed to cashier <br />
                  for payment
                </h1>
              </>
            ) : null}
          </div>
          <div className="kiosk-start-new">
            <button onClick={handleToMainScreen}>Start New Order</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderNumber;
