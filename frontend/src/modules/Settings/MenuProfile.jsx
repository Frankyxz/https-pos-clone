import React, { useState, useEffect, useRef } from "react";
import "../styles/settings.css";
// import "../styles/pos_react.css";
import storeLogo from "../../assets/icon/store-logo.jpg";
import qrCode from "../../assets/icon/qr-code.jpg";
import BASE_URL from "../../assets/global/url";
import NoAccess from "../../assets/image/NoAccess.png";
import axios from "axios";
import QRCode from "qrcode";
import swal from "sweetalert";
import { jwtDecode } from "jwt-decode";
import { FourSquare } from "react-loading-indicators";

function MenuProfile({ authrztn }) {
  const [userId, setuserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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

  const [storeCode, setStoreCode] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeCountry, setStoreCountry] = useState("");
  const [storeImage, setStoreImage] = useState("");
  const [ipPrinter, setIPPrinter] = useState("");
  const [url, setUrl] = useState("");
  const [qrData, setQrData] = useState("");

  const fileInputRefs = useRef(null);

  const handleSelectImage = () => {
    fileInputRefs.current.click();
  };

  const handleoOnFileSelect = (event) => {
    const selectedFile = event.target.files[0]; // Assuming only one file is selected
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB LIMIT

    if (
      selectedFile &&
      allowedTypes.includes(selectedFile.type) &&
      selectedFile.size <= maxSize
    ) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        setStoreImage(base64String);
      };
    } else {
      swal({
        icon: "error",
        title: "File Selection Error",
        text: "Please select a valid image file (PNG, JPEG, JPG, or WEBP) with a maximum size of 5MB.",
      });
    }
  };

  const handleSaveProfile = async () => {
    const res = await axios.put(`${BASE_URL}/store_profile/save_profile`, {
      userId,
      storeCode,
      storeName,
      storeCountry,
      storeImage,
      ipPrinter,
    });

    if (res.status == 200) {
      swal({
        icon: "success",
        title: "Profile successfully saved!",
      });
    }
  };

  const handleFetchProfile = async () => {
    const res = await axios.get(`${BASE_URL}/store_profile/fetchProfile`);
    setStoreCode(res.data.store_code);
    setStoreName(res.data.store_name);
    setStoreCountry(res.data.store_country);
    setStoreImage(res.data.image);
    setIsLoading(false);
    setIPPrinter(res.data.store_ip);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFetchProfile();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerateQR = () => {
    if (url == "") {
      swal({
        icon: "error",
        title: "No input text to convert",
        text: "Please input a text",
      }).then(() => {
        setQrData("");
      });
    }
    QRCode.toDataURL(
      url,
      {
        width: 280,
        margin: 2,
      },
      (err, url) => {
        if (err) return console.error(err);

        setQrData(url);
      }
    );
  };

  return (
    <>
      {isLoading ? (
        <div
          className="loading-container"
          style={{ margin: "0", marginLeft: "250px", marginTop: "20%" }}
        >
          <FourSquare
            color="#6290FE"
            size="large"
            text="Loading Data..."
            textColor=""
          />
        </div>
      ) : authrztn.includes("MenuProfile-View") ? (
        <div className="menu-profile-container">
          <div className="first-menu-profile">
            <div className="menu-title-container">
              <h2>Menu Profile</h2>
            </div>
            <div className="menu-details">
              <div className="menu-inputs">
                <div className="menu-input-container">
                  <h3>Store Code</h3>
                  <input
                    type="text"
                    class="form-control m-0"
                    aria-describedby="addon-wrapping"
                    value={storeCode}
                    onChange={(e) => setStoreCode(e.target.value)}
                  />
                </div>
                <div className="menu-input-container">
                  <h3>Store Name</h3>
                  <input
                    type="text"
                    class="form-control m-0"
                    aria-describedby="addon-wrapping"
                    value={storeName}
                    maxLength={10}
                    onChange={(e) => {
                      if (e.target.value.length <= 10) {
                        setStoreName(e.target.value);
                      }
                    }}
                  />
                  <label htmlFor="">
                    Your name may appear within the system. You can remove it
                    anytime
                  </label>
                </div>

                <div className="menu-input-container">
                  <h3>Country</h3>

                  <input
                    type="text"
                    class="form-control m-0"
                    aria-describedby="addon-wrapping"
                    value={storeCountry}
                    onChange={(e) => setStoreCountry(e.target.value)}
                  />
                </div>

                <div className="menu-input-container">
                  <h3>IP for Printer</h3>

                  <input
                    type="text"
                    class="form-control m-0"
                    aria-describedby="addon-wrapping"
                    value={ipPrinter}
                    onChange={(e) => setIPPrinter(e.target.value)}
                  />
                </div>

                <div className="menu-save-container">
                  {authrztn?.includes("MenuProfile-Add") && (
                    <button onClick={handleSaveProfile}>Save</button>
                  )}
                </div>
              </div>
              <div className="menu-logo">
                <h3>Store Logo</h3>

                <img
                  src={
                    storeImage
                      ? `data:image/png;base64,${storeImage}`
                      : storeLogo
                  }
                  alt="Store"
                />

                <button onClick={handleSelectImage}>Edit Image</button>

                <input
                  type="file"
                  className="file"
                  style={{ display: "none" }}
                  name="file"
                  ref={fileInputRefs}
                  onChange={handleoOnFileSelect}
                />
              </div>
            </div>
          </div>
          <div className="second-menu-profile">
            <div className="qr-title-container"></div>
            <div className="qr-container">
              <div className="qr-generate">
                <h3>Generate QR Code</h3>
                <h4>Input your website link here</h4>
                <input
                  type="text"
                  class="form-control m-0"
                  placeholder="https://website-example.com/"
                  aria-describedby="addon-wrapping"
                  onChange={(e) => setUrl(e.target.value)}
                  value={url}
                />
                <div className="qr-btn-container">
                  <button onClick={handleGenerateQR}>Generate QR Code</button>
                </div>
              </div>
            </div>
            <div className="qr-code-container">
              <h4>Website QR Code</h4>

              {qrData ? (
                <>
                  <img src={qrData} />
                </>
              ) : (
                <img src={qrCode} />
              )}

              {qrData !== "" ? (
                <a href={qrData} download="qr-code.png">
                  <h4 className="save-qr">Save this QR Code</h4>
                </a>
              ) : null}
            </div>
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
            marginTop: "10%",
          }}
        >
          <img src={NoAccess} alt="NoAccess" className="no-access-img" />
          <h3>You don't have access to this function.</h3>
        </div>
      )}
    </>
  );
}

export default MenuProfile;
