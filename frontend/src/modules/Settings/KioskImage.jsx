import React, { useEffect, useRef, useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import eli_logo from "../../assets/image/eli-logo.png";
import mainScreen from "../../assets/icon/pizza.jpg";
import carb from "../../assets/icon/carbonara.jpg";
import DataTable from "react-data-table-component";
import { customStyles } from "../styles/table-style";
import { Button, Modal } from "react-bootstrap";
import swal from "sweetalert";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
const KioskImage = () => {
  const [kioskImages, setKioskImages] = useState([]);
  const [showAddImageKioskModal, setShowAddImageKioskModal] = useState(false);
  const [kioskCurrentImages, setKioskCurrentImages] = useState([]);
  const fileInputRef = useRef(null);

  function selectFiles() {
    fileInputRef.current.click();
  }

  const handleCloseKioskModal = () => {
    setShowAddImageKioskModal(false);
  };
  const onFileSelect = (event) => {
    const selectedFiles = event.target.files;
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB LIMIT

    if (selectedFiles.length + kioskImages.length > 5) {
      swal({
        icon: "error",
        title: "File Selection Error",
        text: "You can only upload up to 5 images.",
      });
      return;
    }

    const newImages = Array.from(selectedFiles).filter((file) => {
      if (!allowedTypes.includes(file.type) || file.size > maxSize) {
        swal({
          icon: "error",
          title: "File Selection Error",
          text: "Please select a valid image file (PNG, JPEG, JPG, or WEBP) with a maximum size of 5MB.",
        });
        return false;
      }
      return true;
    });

    const readers = newImages.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          resolve(reader.result.split(",")[1]); // Only the base64 string
        };
      });
    });

    Promise.all(readers).then((base64Images) => {
      setKioskImages((prevImages) => [...prevImages, ...base64Images]);
    });
  };
  const mainKioskColumn = [
    {
      name: "Image",
      selector: (row) => (
        <img
          src={`data:image/jpeg;base64,${row.kiosk_img}`}
          alt="Kiosk"
          style={{ width: "100px", height: "100px" }}
        />
      ),
    },
    {
      name: "Action",
    },
  ];

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

  useEffect(() => {
    console.log(kioskCurrentImages);
  }, [kioskCurrentImages]);

  const handleSaveImages = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/kiosk_settings/save_kiosk_image`,
        {
          images: kioskImages,
        }
      );

      if (response.status === 200) {
        swal("Success!", "Images uploaded successfully!", "success");
        setShowAddImageKioskModal(false);
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <div className="kiosk-img">
        <div className="kiosk-main-prev">
          <div className="receipt-test-head-container">
            <div className="receipt-type-container ms-0">
              <h2>Main Kiosk Screen Images:</h2>
            </div>
            <div style={{ paddingTop: "20px" }}>
              <button
                className="btn btn-lg btn-outline-primary pe-5"
                onClick={() => setShowAddImageKioskModal(true)}
              >
                ADD IMAGES
              </button>
            </div>
          </div>
          <div className="kiosk-imgs" style={{ paddingTop: "80px" }}>
            <DataTable
              columns={mainKioskColumn}
              customStyles={customStyles}
              data={kioskCurrentImages}
              pagination
            />
          </div>
        </div>
      </div>

      <Modal show={showAddImageKioskModal} onHide={handleCloseKioskModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            <h2>Upload Image</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="productFileinputs">
            <div className="uploading-product-image-section">
              <span className="select" role="button" onClick={selectFiles}>
                Upload
              </span>
              <input
                name="file"
                type="file"
                className="file"
                ref={fileInputRef}
                onChange={onFileSelect}
                required
                multiple
              />
            </div>
            {kioskImages.map((image, index) => (
              <img
                key={index}
                src={`data:image/png;base64,${image}`}
                alt={`kiosk-${index}`}
                style={{ width: "100px", margin: "10px" }}
              />
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary">Cancel</Button>
          <Button variant="primary" onClick={handleSaveImages}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default KioskImage;
