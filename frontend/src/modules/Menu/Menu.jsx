import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/menu.css";
import BASE_URL from "../../assets/global/url";
import axios from "axios";
import {
  inventoryNav,
  productNav,
  reportsNav,
  settingsNav,
  userNav,
} from "../Sidebar/navs";
import { jwtDecode } from "jwt-decode";
import swal from "sweetalert2";
// import "../styles/pos_react.css";
const Menu = ({ authrztn }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [storeName, setStoreName] = useState("");
  const [storeStatus, setStoreStatus] = useState(null);
  const [userId, setuserId] = useState("");
  const isDashboardViewAuthorized = authrztn.includes("Dashboard-View");
  const isEReceiptViewAuthorized = authrztn.includes("EReceipt-View");
  const isOrderingViewAuthorized = authrztn.includes("Ordering-View");
  const isOrderingEnabled = isOrderingViewAuthorized && storeStatus;

  const isInventoryViewAuthorized = [
    "InventoryStock-View",
    "ReceivingStock-View",
    "OutboundingStock-View",
    "StockCounting-View",
  ].some((permission) => authrztn.includes(permission));
  const isProductCategoryViewAuthorized = [
    "Product-View",
    "Archive-View",
    "RawMaterial-View",
    "CookBook-View",
  ].some((permission) => authrztn.includes(permission));
  const isRFIDViewAuthorized = authrztn.includes("RFID-View");
  const isReportsViewAuthorized = [
    "InventoryReport-View",
    "RawInventoryReport-View",
    "POSReport-View",
    "RFIDReport-View",
    "BulkLoadReport-View",
    "StoreReport-View",
    "CustomerReport-View",
  ].some((permission) => authrztn.includes(permission));
  const isUserViewAuthorized = [
    "CustomerList-View",
    "User-View",
    "UserRole-View",
    "UserTransaction-View",
  ].some((permission) => authrztn.includes(permission));
  const isSettingsViewAuthorized = [
    "MenuProfile-View",
    "CustomizationReceipt-View",
    "Hardware-View",
    "LossBack-View",
    "Loyalty-View",
    "ProductExtra-View",
  ].some((permission) => authrztn.includes(permission));
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

  const handleFetchProfile = async () => {
    const res = await axios.get(`${BASE_URL}/store_profile/fetchProfile`);
    setStoreName(res.data.store_name || "ELI");
  };

  const handleFetchStatus = async () => {
    const res = await axios.get(`${BASE_URL}/store_profile/fetchStatus`);
    setStoreStatus(res.data.status);
  };

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
    }
  };

  const handleCheckShift = () => {
    axios
      .post(BASE_URL + "/endshift/checkShift", null, {
        params: {
          userId,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          swal
            .fire({
              title: "Start Shift",
              text: "Would you like to start your shift?",
              icon: "question",
              showCancelButton: true,
              confirmButtonText: "Yes",
              cancelButtonText: "No",
            })
            .then((result) => {
              if (result.isConfirmed) {
                axios
                  .post(BASE_URL + "/endshift/insertStartShift", null, {
                    params: {
                      userId,
                    },
                  })
                  .then((res) => {
                    if (res.status === 200) {
                      swal
                        .fire({
                          title: "Shift Started!",
                          text: "Your shift is already started!",
                          icon: "success",
                        })
                        .then(() => {
                          navigate("/ordering");
                        });
                    } else {
                      swal.fire({
                        title: "Something Went Wrong!",
                        text: "Please contact your supervisor!",
                        icon: "error",
                      });
                    }
                  });
              }
            });
        } else if (res.status === 201) {
          navigate("/ordering");
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    handleFetchProfile();
    handleFetchStatus();
    decodeToken();
  }, []);

  const getFirstAuthorizedPath = (authrztn, navItems) => {
    for (let item of navItems) {
      if (authrztn.includes(item.auth)) {
        return item.to;
      }
    }
    return "#";
  };

  const firstInventoryPath = getFirstAuthorizedPath(authrztn, inventoryNav);
  const firstReportPath = getFirstAuthorizedPath(authrztn, reportsNav);
  const firstUserPath = getFirstAuthorizedPath(authrztn, userNav);
  const firstproductPath = getFirstAuthorizedPath(authrztn, productNav);
  const firstSettingsPath = getFirstAuthorizedPath(authrztn, settingsNav);
  return (
    <>
      <div className="menu-container">
        <div className="time-container">
          <div className="time">
            <div>{formattedDate}</div>
            &nbsp;
            {formattedTime}
          </div>
        </div>

        <div className="title-menu">
          <span className="blue">{storeName || "ELI"}</span>
          <span className="of">POINT OF SALE</span>
        </div>
        <div className="sentence">
          Point of sale application intended to be used within the Coppel chain
          stores
        </div>

        <div className="buttons-container mt-4">
          <div className="menus">
            <Link
              to={isDashboardViewAuthorized ? "/Dashboard" : "#"}
              style={{ textDecoration: "none" }}
            >
              <button disabled={!isDashboardViewAuthorized}>
                <i class="bx bx-home icon-btn"></i>
                <div className="btn-details">
                  <h2>DASHBOARD</h2>
                  <p className="desc">Analytic Dashboard</p>
                </div>
              </button>
            </Link>
            <Link to={firstInventoryPath} style={{ textDecoration: "none" }}>
              <button disabled={!isInventoryViewAuthorized}>
                <i class="bx bx-package icon-btn"></i>
                <div className="btn-details">
                  <h2>INVENTORY</h2>
                  <p className="desc">Manage and tracking of stocks</p>
                </div>
              </button>
            </Link>
            <Link
              to={isEReceiptViewAuthorized ? "/E-Receipts" : "#"}
              style={{ textDecoration: "none" }}
            >
              <button disabled={!isEReceiptViewAuthorized}>
                <i class="bx bx-coin-stack icon-btn"></i>
                <div className="btn-details">
                  <h2>E-RECEIPTS</h2>
                  <p className="desc">Receipt generation and print</p>
                </div>
              </button>
            </Link>
          </div>
          <div className="menus">
            <Link
              to={isProductCategoryViewAuthorized ? firstproductPath : "#"}
              style={{ textDecoration: "none" }}
            >
              <button disabled={!isProductCategoryViewAuthorized}>
                <i class="bx bx-package icon-btn"></i>
                <div className="btn-details">
                  <h2>PRODUCTS</h2>
                  <p className="desc">Catalog and Manage Product</p>
                </div>
              </button>
            </Link>
            <Link
              to={isRFIDViewAuthorized ? "/nfc-load" : "#"}
              style={{ textDecoration: "none" }}
            >
              <button disabled={!isRFIDViewAuthorized}>
                <i class="bx bx-rfid  "></i>
                <div className="btn-details">
                  <h2>RFID</h2>
                  <p className="desc">RFID Load</p>
                </div>
              </button>
            </Link>
            <Link
              to={isReportsViewAuthorized ? firstReportPath : "#"}
              style={{ textDecoration: "none" }}
            >
              <button disabled={!isReportsViewAuthorized}>
                <i class="bx bxs-bar-chart-alt-2 icon-btn"></i>
                <div className="btn-details">
                  <h2>REPORTS</h2>
                  <p className="desc">Generate and analyze reports</p>
                </div>
              </button>
            </Link>
          </div>
          <div className="menus">
            <Link
              to={isUserViewAuthorized ? firstUserPath : "#"}
              style={{ textDecoration: "none" }}
            >
              <button disabled={!isUserViewAuthorized}>
                <i class="bx bx-user icon-btn"></i>
                <div className="btn-details">
                  <h2>USERS</h2>
                  <p className="desc">User profiles and Access Controls</p>
                </div>
              </button>
            </Link>
            {/* <Link
              to={isOrderingEnabled ? "/ordering" : "#"}
              style={{ textDecoration: "none" }}
            > */}
            <button disabled={!isOrderingEnabled} onClick={handleCheckShift}>
              <i class="bx bx-border-all icon-btn"></i>
              <div className="btn-details">
                <h2>ORDERING</h2>
                <p className="desc">Process and Track Orders</p>
              </div>
            </button>
            {/* </Link> */}
            <Link
              to={isSettingsViewAuthorized ? firstSettingsPath : "#"}
              style={{ textDecoration: "none" }}
            >
              <button disabled={!isSettingsViewAuthorized}>
                <i class="bx bx-cog icon-btn"></i>
                <div className="btn-details">
                  <h2>SETTINGS</h2>
                  <p className="desc">Configure System and Options</p>
                </div>
              </button>
            </Link>
          </div>
          {/* <div className="menus">
            <Link to={"/kiosk-main"} style={{ textDecoration: "none" }}>
              <button>
                <i class="bx bx-cog icon-btn"></i>
                <div>
                  <h2>Kiosk</h2>
                  <p className="desc">Create, track</p>
                </div>
              </button>
            </Link>
          </div> */}
        </div>

        {/* <div className="buttons-container mt-4">
          <div className="menus">
            <Link to={"/Dashboard"} style={{ textDecoration: "none" }}>
              <button>
                <i class="bx bx-home icon-btn"></i>
                <div className="btn-details">
                  <h2>DASHBOARD</h2>
                  <p className="desc">Analytic Dashboard</p>
                </div>
              </button>
            </Link>
            <Link to={"/inventory-stocks"} style={{ textDecoration: "none" }}>
              <button>
                <i class="bx bx-package icon-btn"></i>
                <div className="btn-details">
                  <h2>INVENTORY</h2>
                  <p className="desc">Products</p>
                </div>
              </button>
            </Link>
            <Link to={"/E-Receipts"} style={{ textDecoration: "none" }}>
              <button>
                <i class="bx bx-coin-stack icon-btn"></i>
                <div className="btn-details">
                  <h2>E-RECEIPTS</h2>
                  <p className="desc">Products</p>
                </div>
              </button>
            </Link>

            <Link to={"/product-category"} style={{ textDecoration: "none" }}>
              <button>
                <i class="bx bx-package icon-btn"></i>
                <div className="btn-details">
                  <h2>PRODUCTS</h2>
                  <p className="desc">Manage and track</p>
                </div>
              </button>
            </Link>
            <Link to={"/Product"} style={{ textDecoration: "none" }}>
              <button>
                <i class="bx bx-rfid  "></i>
                <div className="btn-details">
                  <h2>RFID</h2>
                  <p className="desc">Creaate, track</p>
                </div>
              </button>
            </Link>
            <Link to={"/Product"} style={{ textDecoration: "none" }}>
              <button>
                <i class="bx bxs-bar-chart-alt-2 icon-btn"></i>
                <div className="btn-details">
                  <h2>REPORTS</h2>
                  <p className="desc">Creaate, track</p>
                </div>
              </button>
            </Link>

            <Link to={"/user-management"} style={{ textDecoration: "none" }}>
              <button>
                <i class="bx bx-user icon-btn"></i>
                <div className="btn-details">
                  <h2>USERS</h2>
                  <p className="desc">Creaate, track</p>
                </div>
              </button>
            </Link>
            <Link to={"/ordering"} style={{ textDecoration: "none" }}>
              <button>
                <i class="bx bx-border-all icon-btn"></i>
                <div className="btn-details">
                  <h2>ORDERING</h2>
                  <p className="desc">Creaate, track</p>
                </div>
              </button>
            </Link>
            <Link to={"/Product"} style={{ textDecoration: "none" }}>
              <button>
                <i class="bx bx-cog icon-btn"></i>
                <div className="btn-details">
                  <h2>SETTINGS</h2>
                  <p className="desc">Creaate, track</p>
                </div>
              </button>
            </Link>
          </div>
        </div> */}

        <div className="footer">
          <div className="version">
            <p>v.1.0</p>
          </div>
          <Link to="/" style={{ color: "black", textDecoration: "none" }}>
            <div
              className="logout"
              onClick={() => {
                localStorage.removeItem("accessToken");
              }}
            >
              <i class="bx bx-log-out-circle bx-rotate-90 logout-i"></i>
              <p>Logout</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Menu;
