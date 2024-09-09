import React, { useState, useEffect } from "react";
import mainScreen from "../../assets/icon/pizza.jpg";
import "../styles/kiosk-main.css";
import touch from "../../assets/icon/touch.jpg";
import Carousel from "react-bootstrap/Carousel";
import carb from "../../assets/icon/carbonara.jpg";
import eli_logo from "../../assets/image/eli-logo.png";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
const MainScreen = () => {
  const navigate = useNavigate();
  const [kioskCurrentImages, setKioskCurrentImages] = useState([]);

  // const handleEnterKiosk = () => {
  //   navigate("/kiosk-order-type");
  // };
  const handleEnterKiosk = () => {
    navigate("/kiosk-check");
  };

  const handleFetchImages = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/kiosk_settings/fetchKioskImgs`
      );

      setKioskCurrentImages(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    handleFetchImages();
  }, []);
  return (
    <>
      <div className="main-screen-kiosk" onClick={handleEnterKiosk}>
        <div className="kiosk-welcome-container">
          <h1>Welcome t</h1>
          {/* <div className="float-end bg-primary w-100">
            <div className="version">
              <p>v.1.0</p>
            </div>
           
          </div> */}
          <Link to="/" style={{ color: "black", textDecoration: "none" }}>
            <div
              className="logout mt-5 "
              onClick={() => {
                localStorage.removeItem("accessToken");
              }}
            >
              {/* <i class="bx bx-log-out-circle bx-rotate-90 logout-i"></i> */}
              <h1 className="text-dark" style={{ cursor: "text" }}>
                o{" "}
              </h1>
              {/* <p>Logout</p> */}
            </div>
          </Link>

          <h1 className="mx-3"> ELI</h1>
        </div>
        <Carousel fade>
          {kioskCurrentImages.map((image, index) => (
            <Carousel.Item key={index}>
              <img
                src={`data:image/jpeg;base64,${image.kiosk_img}`}
                alt={`Kiosk Image ${index}`}
              />
            </Carousel.Item>
          ))}
        </Carousel>
        <div className="kiosk-foot-container">
          <h1>TAP ANYWHERE TO ORDER</h1>
          <div className="d-grid align-items-center">
            <img src={touch} />
          </div>
        </div>
      </div>
    </>
  );
};

export default MainScreen;
