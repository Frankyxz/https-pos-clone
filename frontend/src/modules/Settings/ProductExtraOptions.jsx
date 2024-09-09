import { Modal, Button, Form } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import BASE_URL from "../../assets/global/url";
import swal from "sweetalert";
import axios from "axios";
import UpdateSpecification from "./update/updateSpecification";
import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";

import { jwtDecode } from "jwt-decode";
const ProductExtraOptions = ({ authrztn }) => {
  const [userId, setuserId] = useState("");

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
    }
  };

  const [updateIDSpecs, setUpdateIDSpecs] = useState("");
  const [specsData, setSpecsData] = useState([]);
  const [optionsData, setOptionsData] = useState([]);
  const [needingData, setNeedingData] = useState([]);
  const [Category, setCategory] = useState([]);
  const [product, setProduct] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [validated, setValidated] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Specification");
  const [toggleAddBtn, setToggleAddBtn] = useState(false);
  const [isUpdateSpecification, setIsUpdateSpecification] = useState(false);
  //start specification function
  const [linkModal, setLinkModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSpec, setCurrentSpec] = useState({
    name: "",
    type: selectedTab,
    subOptions: [{ subName: "", price: "" }],
  });

  const handleAddSubOption = () => {
    setCurrentSpec((prevSpec) => {
      const newSpec = {
        ...prevSpec,
        subOptions: [...prevSpec.subOptions, { subName: "", price: "" }],
      };
      return newSpec;
    });
  };

  const handleSubOptionChange = (index, field, value) => {
    const newSubOptions = [...currentSpec.subOptions];
    newSubOptions[index][field] = value;
    setCurrentSpec({ ...currentSpec, subOptions: newSubOptions });
  };

  const handleRemoveSubOption = (index) => {
    if (currentSpec.subOptions.length > 1) {
      const newSubOptions = currentSpec.subOptions.filter(
        (_, i) => i !== index
      );
      setCurrentSpec({ ...currentSpec, subOptions: newSubOptions });
    } else {
      swal({
        title: "Oopps!",
        text: "You can't remove the last sub-option.",
        icon: "error",
        buttons: false,
        timer: 2000,
        dangerMode: true,
      });
    }
  };

  const reloadTableCategory = () => {
    axios
      .get(BASE_URL + "/category/getCategory")
      .then((res) => {
        setCategory(res.data);
      })
      .catch((err) => console.log(err));
  };

  const reloadTableSpecification = () => {
    const delay = setTimeout(() => {
      axios
        .get(BASE_URL + "/variant/getSpecification")
        .then((res) => {
          setIsUpdateSpecification(false);
          setSpecsData(res.data);
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(true);
        });
    }, 1000);

    return () => clearTimeout(delay);
  };
  
useEffect(()=> {
console.log("Specs", specsData)
}, [specsData])

  const reloadTableExtraOption = () => {
    const delay = setTimeout(() => {
      axios
        .get(BASE_URL + "/variant/getExtraOption")
        .then((res) => {
          setIsUpdateSpecification(false);
          setOptionsData(res.data);
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(true);
        });
    }, 1000);

    return () => clearTimeout(delay);
  };

  const reloadTableExtraNeeding = () => {
    const delay = setTimeout(() => {
      axios
        .get(BASE_URL + "/variant/getExtraNeeding")
        .then((res) => {
          setNeedingData(res.data);
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(true);
        });
    }, 1000);

    return () => clearTimeout(delay);
  };

  useEffect(() => {
    reloadTableCategory();
    decodeToken();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedTab === "Specification") {
        reloadTableSpecification();
      } else if (selectedTab === "Options") {
        reloadTableExtraOption();
      } else if (selectedTab === "Needing") {
        reloadTableExtraNeeding();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [selectedTab]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    const Idcategory = categoryId;
    // localStorage.setItem("selectedCategory", categoryId);
    axios
      .get(BASE_URL + "/variant/fetchSpecificProdCategory_settings", {
        params: {
          Idcategory,
        },
      })
      .then((res) => {
        setProduct(res.data);
        // console.log(res.data);
      })
      .catch((err) => console.log(err));
  };

  const handleCheckboxChange = (prod_id, prod_name, prod_sku) => {
    setSelectedProducts((prevSelected) => {
      const productData = {
        prod_id: prod_id,
        prod_name: prod_name,
        prod_sku: prod_sku,
      };

      let newSelected;
      if (prevSelected.some((item) => item.prod_id === prod_id)) {
        newSelected = prevSelected.filter((item) => item.prod_id !== prod_id);
      } else {
        newSelected = [...prevSelected, productData];
      }
      console.log("Updated selected products:", newSelected);

      return newSelected;
    });
  };

  const add_specification = async (e) => {
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
      swal({
        title: "Create this new variant?",
        text: "",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((confirmed) => {
        if (confirmed) {
          axios
            .post(`${BASE_URL}/variant/createVariant`, {
              currentSpec,
              selectedProducts,
              userId,
            })
            .then((res) => {
              if (res.status === 200) {
                swal({
                  title: "Success",
                  text: "Variant created successfully",
                  icon: "success",
                  buttons: false,
                  timer: 2000,
                  dangerMode: true,
                }).then(() => {
                  handleClose();
                  switch (selectedTab) {
                    case "Specification":
                      reloadTableSpecification();
                      break;
                    case "Options":
                      reloadTableExtraOption();
                      break;
                    case "Needing":
                      reloadTableExtraNeeding();
                      break;
                    default:
                      break;
                  }
                });
              } else if (res.status === 201) {
                swal({
                  title: "Variant already exist",
                  text: "Please input another Variant Name",
                  icon: "error",
                  buttons: false,
                  timer: 2000,
                  dangerMode: true,
                });
              } else {
                swal({
                  title: "Something Went Wrong",
                  text: "Please contact your support immediately",
                  icon: "error",
                  buttons: false,
                  timer: 2000,
                  dangerMode: true,
                }).then(() => {
                  handleClose();
                  switch (selectedTab) {
                    case "Specification":
                      reloadTableSpecification();
                      break;
                    case "Options":
                      reloadTableExtraOption();
                      break;
                    case "Needing":
                      reloadTableExtraNeeding();
                      break;
                    default:
                      break;
                  }
                });
              }
            });
        }
      });
    }
    setValidated(true);
  };

  const handleClose = () => {
    setLinkModal(false);
    setValidated(false);
    setCurrentSpec({
      name: "",
      type: selectedTab,
      subOptions: [{ subName: "", price: "" }],
    });
    setSelectedProducts([]);
  };
  //End specification section

  const [editSpecTab, setEditSpecTab] = useState(false);
  const [editSpecification, setEditSpecification] = useState(null);
  const [inputs, setInputs] = useState([]);

  const handleToggleAddBtn = () => {
    setEditSpecification(null);
    setEditSpecTab(false);
    setToggleAddBtn(true);
    setIsUpdateSpecification(false);
    setCurrentSpec({
      name: "",
      type: selectedTab,
      subOptions: [{ subName: "", price: "" }],
    });
    setSelectedProducts([]);
  };

  const handleEdit = (data) => {
    if (authrztn?.includes("ProductExtra-Edit")) {
      setIsUpdateSpecification(true);
      setCurrentSpec(data);
      setUpdateIDSpecs(data.specification_main_id);
    }
  };

  const handleChangeTab = (selected) => {
    setIsLoading(true);
    setSelectedTab(selected);
    setToggleAddBtn(false);
    setIsUpdateSpecification(false);
    // setEditSpecTab(false);
    // setInputs([]);
    setCurrentSpec({
      name: "",
      type: selected,
      subOptions: [{ subName: "", price: "" }],
    });
    setSelectedProducts([]);
  };

  // console.log(currentSpec);

  //Fetch all the entered text in the input
  const handleSave = () => {
    if (selectedTab != "Options") {
      const allValues = inputs.map((input) => ({
        text: input.text,
        number: input.number,
      }));
      console.log(" Values:", allValues);
    } else {
      const allValues = inputs.map((input) => input.text);
      console.log(" Values:", allValues);
    }
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
      ) : authrztn.includes("ProductExtra-View") ? (
        <div className="extra-options-container">
          <div className="product-extra-nav">
            <div className="custom-card">
              <div className="extra-title-container mb-5">
                <h2>Product Extra Options</h2>
              </div>
              <hr />
              <div
                className="product-extra-tab"
                onClick={() => handleChangeTab("Specification")}
              >
                <h2>Specification</h2>
              </div>
              <div
                className="product-extra-tab"
                onClick={() => handleChangeTab("Options")}
              >
                <h2>Extra Options</h2>
              </div>
              <div
                className="product-extra-tab"
                onClick={() => handleChangeTab("Needing")}
              >
                <h2>Extra Needing</h2>
              </div>
            </div>
          </div>
          <div className="product-extra-specification">
            <div className="custom-card">
              {/* Specification */}
              {selectedTab == "Specification" ? (
                <>
                  <div className="specification-card">
                    <div className="extra-title-container ">
                      <div className="d-flex p-0">
                        <i class="bx bx-chevron-right"></i>
                        <h2>Specification</h2>
                      </div>
                      <div className="extra-add-container">
                        {authrztn?.includes("ProductExtra-Add") && (
                          <button onClick={handleToggleAddBtn}>Add</button>
                        )}
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="extra-lists-container">
                    {specsData.map((data) => (
                      <div className="extra-lists">
                        <div className="extra-name">
                          <h3>{data.specification_name}</h3>
                          <i className="bx bxs-chevron-right"></i>
                        </div>
                        <div
                          className="extra-sub-options"
                          onClick={() => {
                            handleEdit(data);
                          }}
                        >
                          {data.specification_variants
                            // .filter(
                            //   (variant) =>
                            //     variant.variant_name !== "Default_Regular"
                            // )
                            .map((variant) => (
                              <div className="extra-sub-container">
                                <h3>
                                  {variant.variant_name} - ₱
                                  {variant.variant_price}
                                </h3>
                              </div>
                            ))}
                        </div>
                        <div className="num-prod-link">
                          {/* <p htmlFor="">{spec.linked.length} Product Link</p> */}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : selectedTab == "Options" ? (
                <>
                  {/* Extra Options */}
                  <div className="extra-options-card">
                    <div className="extra-title-container ">
                      <div className="d-flex p-0">
                        <i class="bx bx-chevron-right"></i>
                        <h2>Extra Options</h2>
                      </div>
                      <div className="extra-add-container">
                        {authrztn?.includes("ProductExtra-Add") && (
                          <button onClick={handleToggleAddBtn}>Add</button>
                        )}
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="extra-lists-container">
                    {optionsData.map((data) => (
                      <div className="extra-lists">
                        <div className="extra-name">
                          <h3>{data.specification_name}</h3>
                          <i className="bx bxs-chevron-right"></i>
                        </div>
                        <div
                          className="extra-sub-options"
                          onClick={() => {
                            handleEdit(data);
                          }}
                        >
                          {data.specification_variants.map((variant) => (
                            <div className="extra-sub-container">
                              <h3>
                                {variant.variant_name} - ₱
                                {variant.variant_price}
                              </h3>
                            </div>
                          ))}
                        </div>
                        <div className="num-prod-link">
                          {/* <p htmlFor="">{spec.linked.length} Product Link</p> */}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Extra Needing */}
                  <div className="extra-options-card">
                    <div className="extra-title-container ">
                      <div className="d-flex p-0">
                        <i class="bx bx-chevron-right"></i>
                        <h2>Extra Needing</h2>
                      </div>
                      <div className="extra-add-container">
                        {authrztn?.includes("ProductExtra-Add") && (
                          <button onClick={handleToggleAddBtn}>Add</button>
                        )}
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="extra-lists-container">
                    {needingData.map((data) => (
                      <div className="extra-lists">
                        <div className="extra-name">
                          <h3>{data.specification_name}</h3>
                          <i className="bx bxs-chevron-right"></i>
                        </div>
                        <div
                          className="extra-sub-options"
                          onClick={() => {
                            handleEdit(data);
                          }}
                        >
                          {data.specification_variants.map((variant) => (
                            <div className="extra-sub-container">
                              <h3>
                                {variant.variant_name} - ₱
                                {variant.variant_price}
                              </h3>
                            </div>
                          ))}
                        </div>
                        <div className="num-prod-link">
                          {/* <p htmlFor="">{spec.linked.length} Product Link</p> */}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          {!toggleAddBtn && editSpecTab ? (
            <>
              <div className="product-extra-add">
                {/* Edit Specification */}
                {!toggleAddBtn &&
                editSpecTab &&
                selectedTab == "Specification" ? (
                  <></>
                ) : !toggleAddBtn && editSpecTab && selectedTab == "Options" ? (
                  <>
                    {/*Edit Options */}
                    {/* <div className="specification-add">
                    <div className="custom-card ">
                      <div className="extra-title-container mb-5">
                        <h2>Edit Options</h2>
                      </div>
                      <hr />
                      <div className="spec-body-container">
                        <div className="prod-extra-input-container">
                          <h3>Name:</h3>
                          <input
                            type="text"
                            class="form-control mt-2"
                            value={
                              editSpecification ? editSpecification.name : ""
                            }
                          />
                        </div>
                        <div className="prod-sub-container">
                          <h3>Sub Options:</h3>
                          {inputs.map((input, index) => (
                            <div key={index} className="sub-input">
                              <input
                                type="text"
                                className="form-control mt-2 mb-0"
                                name="text"
                                value={input.text}
                                onChange={(e) => handleInputChange(index, e)}
                              />

                              <i
                                className="bx bx-trash"
                                onClick={() => handleDeleteInput(index)}
                              ></i>
                            </div>
                          ))}
                        </div>
                        <div className="prod-add-sub">
                          <button onClick={addNewInput}>
                            <i class="bx bx-plus"></i>Add New
                          </button>
                        </div>
                        <div className="link-prod-container">
                          <h3>Link Products</h3>
                          <i
                            class="bx bx-link"
                            onClick={() => setLinkModal(true)}
                          ></i>
                        </div>
                        <div className="link-selected-list">
                          <ul>
                            {editSpecification
                              ? editSpecification.linked.map((item, index) => (
                                  <li key={index}>{item.name}</li>
                                ))
                              : null}
                          </ul>
                        </div>
                      </div>
                      <div className="prod-extra-btn-container">
                        <button
                          className="prod-c-btn"
                          onClick={() => setToggleAddBtn(false)}
                        >
                          Cancel
                        </button>
                        <button className="prod-s-btn" onClick={handleSave}>
                          Save
                        </button>
                      </div>
                    </div>
                  </div> */}
                  </>
                ) : !toggleAddBtn && editSpecTab && selectedTab == "Needing" ? (
                  <>
                    {/* Edit Needing */}
                    {/* <div className="specification-add">
                    <div className="custom-card ">
                      <div className="extra-title-container mb-5">
                        <h2>Edit Needing</h2>
                      </div>
                      <hr />
                      <div className="spec-body-container">
                        <div className="prod-extra-input-container">
                          <h3>Name:</h3>
                          <input
                            type="text"
                            class="form-control mt-2"
                            value={
                              editSpecification ? editSpecification.name : ""
                            }
                          />
                        </div>
                        <div className="prod-sub-container">
                          <h3>Sub Options:</h3>
                          {inputs.map((input, index) => (
                            <div key={index} className="sub-input">
                              <input
                                type="text"
                                className="form-control mt-2 mb-0"
                                name="text"
                                value={input.text}
                                onChange={(e) => handleInputChange(index, e)}
                              />
                              <input
                                type="number"
                                className="form-control mt-2 mb-0"
                                name="number"
                                value={input.number}
                                onChange={(e) => handleInputChange(index, e)}
                              />
                              <i
                                className="bx bx-trash"
                                onClick={() => handleDeleteInput(index)}
                              ></i>
                            </div>
                          ))}
                        </div>
                        <div className="prod-add-sub">
                          <button onClick={addNewInput}>
                            <i class="bx bx-plus"></i>Add New
                          </button>
                        </div>
                        <div className="link-prod-container">
                          <h3>Link Products</h3>
                          <i
                            class="bx bx-link"
                            onClick={() => setLinkModal(true)}
                          ></i>
                        </div>
                        <div className="link-selected-list">
                          <ul>
                            {editSpecification
                              ? editSpecification.linked.map((item, index) => (
                                  <li key={index}>{item.name}</li>
                                ))
                              : null}
                          </ul>
                        </div>
                      </div>
                      <div className="prod-extra-btn-container">
                        <button
                          className="prod-c-btn"
                          onClick={() => setToggleAddBtn(false)}
                        >
                          Cancel
                        </button>
                        <button className="prod-s-btn" onClick={handleSave}>
                          Save
                        </button>
                      </div>
                    </div>
                  </div> */}
                  </>
                ) : null}
              </div>
            </>
          ) : (
            <>
              {/* add specification */}
              <div className="product-extra-add">
                {isUpdateSpecification === true && (
                  <UpdateSpecification
                    currentSpec={currentSpec}
                    setCurrentSpec={setCurrentSpec}
                    updateIDSpecs={updateIDSpecs}
                    reloadTableSpecification={reloadTableSpecification}
                    reloadTableExtraOption={reloadTableExtraOption}
                    reloadTableExtraNeeding={reloadTableExtraNeeding}
                    userId={userId}
                  />
                )}
                {toggleAddBtn && selectedTab == "Specification" ? (
                  <>
                    {isUpdateSpecification === false && (
                      <div className="specification-add">
                        <div className="custom-card ">
                          <div className="extra-title-container mb-5">
                            <h2>Add Specification</h2>
                          </div>
                          <hr />
                          <Form
                            noValidate
                            validated={validated}
                            onSubmit={add_specification}
                          >
                            <div className="spec-body-container">
                              <div className="prod-extra-input-container">
                                <h3>Name:</h3>
                                <Form.Control
                                  type="text"
                                  class="form-control mt-2"
                                  value={currentSpec.name}
                                  onChange={(e) =>
                                    setCurrentSpec({
                                      ...currentSpec,
                                      name: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div className="prod-sub-container">
                                <h3>Sub Options:</h3>
                                {currentSpec.subOptions.map(
                                  (subOption, index) => (
                                    <div className="sub-input" key={index}>
                                      <Form.Control
                                        type="text"
                                        className="mt-2 mb-0"
                                        placeholder="sub name"
                                        required
                                        value={subOption.subName}
                                        onChange={(e) =>
                                          handleSubOptionChange(
                                            index,
                                            "subName",
                                            e.target.value
                                          )
                                        }
                                      />
                                      <Form.Control
                                        type="number"
                                        className="mt-2 mb-0"
                                        placeholder="price"
                                        value={subOption.price}
                                        onChange={(e) =>
                                          handleSubOptionChange(
                                            index,
                                            "price",
                                            e.target.value
                                          )
                                        }
                                      />
                                      <i
                                        className="bx bx-trash"
                                        onClick={() =>
                                          handleRemoveSubOption(index)
                                        }
                                        style={{
                                          cursor:
                                            currentSpec.subOptions.length > 1
                                              ? "pointer"
                                              : "not-allowed",
                                          opacity:
                                            currentSpec.subOptions.length > 1
                                              ? 1
                                              : 0.5,
                                        }}
                                      ></i>
                                    </div>
                                  )
                                )}
                              </div>
                              <div className="prod-add-sub">
                                <button
                                  type="button"
                                  onClick={handleAddSubOption}
                                >
                                  <i className="bx bx-plus"></i>Add New
                                </button>
                              </div>
                              <div className="link-prod-container">
                                <h3>Link Products</h3>
                                <i
                                  class="bx bx-link"
                                  onClick={() => setLinkModal(true)}
                                ></i>
                              </div>
                              <div className="link-selected-list d-flex">
                                <div
                                  className="d-flex w-100 p-0"
                                  style={{ overflowY: "auto" }}
                                >
                                  <ul className="custom-list">
                                    {selectedProducts.map((data) => (
                                      <li>
                                        {" "}
                                        <span className="h3">{`(${data.prod_sku}) ${data.prod_name}`}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div className="prod-extra-btn-container">
                              <button
                                className="prod-c-btn"
                                type="button"
                                onClick={() => setToggleAddBtn(false)}
                              >
                                Cancel
                              </button>
                              <button className="prod-s-btn" type="submit">
                                Save
                              </button>
                            </div>
                          </Form>
                        </div>
                      </div>
                    )}
                  </>
                ) : toggleAddBtn && selectedTab == "Options" ? (
                  <>
                    {/* Extra Options */}
                    {isUpdateSpecification === false && (
                      <div className="specification-add">
                        <div className="custom-card ">
                          <div className="extra-title-container mb-5">
                            <h2>Add Extra Option</h2>
                          </div>
                          <hr />
                          <Form
                            noValidate
                            validated={validated}
                            onSubmit={add_specification}
                          >
                            <div className="spec-body-container">
                              <div className="prod-extra-input-container">
                                <h3>Name:</h3>
                                <Form.Control
                                  type="text"
                                  class="form-control mt-2"
                                  value={currentSpec.name}
                                  onChange={(e) =>
                                    setCurrentSpec({
                                      ...currentSpec,
                                      name: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div className="prod-sub-container">
                                <h3>Sub Options:</h3>
                                {currentSpec.subOptions.map(
                                  (subOption, index) => (
                                    <div className="sub-input" key={index}>
                                      <Form.Control
                                        type="text"
                                        className="mt-2 mb-0"
                                        placeholder="sub name"
                                        required
                                        value={subOption.subName}
                                        onChange={(e) =>
                                          handleSubOptionChange(
                                            index,
                                            "subName",
                                            e.target.value
                                          )
                                        }
                                      />
                                      <Form.Control
                                        type="number"
                                        className="mt-2 mb-0"
                                        placeholder="price"
                                        value={subOption.price}
                                        onChange={(e) =>
                                          handleSubOptionChange(
                                            index,
                                            "price",
                                            e.target.value
                                          )
                                        }
                                      />
                                      <i
                                        className="bx bx-trash"
                                        onClick={() =>
                                          handleRemoveSubOption(index)
                                        }
                                        style={{
                                          cursor:
                                            currentSpec.subOptions.length > 1
                                              ? "pointer"
                                              : "not-allowed",
                                          opacity:
                                            currentSpec.subOptions.length > 1
                                              ? 1
                                              : 0.5,
                                        }}
                                      ></i>
                                    </div>
                                  )
                                )}
                              </div>
                              <div className="prod-add-sub">
                                <button
                                  type="button"
                                  onClick={handleAddSubOption}
                                >
                                  <i className="bx bx-plus"></i>Add New
                                </button>
                              </div>
                              <div className="link-prod-container">
                                <h3>Link Products</h3>
                                <i
                                  class="bx bx-link"
                                  onClick={() => setLinkModal(true)}
                                ></i>
                              </div>
                              <div className="link-selected-list d-flex">
                                <div
                                  className="d-flex w-100 p-0"
                                  style={{ overflowY: "auto" }}
                                >
                                  <ul className="custom-list">
                                    {selectedProducts.map((data) => (
                                      <li>
                                        {" "}
                                        <span className="h3">{`(${data.prod_sku}) ${data.prod_name}`}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div className="prod-extra-btn-container">
                              <button
                                className="prod-c-btn"
                                type="button"
                                onClick={() => setToggleAddBtn(false)}
                              >
                                Cancel
                              </button>
                              <button className="prod-s-btn" type="submit">
                                Save
                              </button>
                            </div>
                          </Form>
                        </div>
                      </div>
                    )}
                  </>
                ) : toggleAddBtn && selectedTab == "Needing" ? (
                  <>
                    {isUpdateSpecification === false && (
                      <div className="specification-add">
                        <div className="custom-card ">
                          <div className="extra-title-container mb-5">
                            <h2>Add Extra Needing</h2>
                          </div>
                          <hr />
                          <Form
                            noValidate
                            validated={validated}
                            onSubmit={add_specification}
                          >
                            <div className="spec-body-container">
                              <div className="prod-extra-input-container">
                                <h3>Name:</h3>
                                <Form.Control
                                  type="text"
                                  class="form-control mt-2"
                                  value={currentSpec.name}
                                  onChange={(e) =>
                                    setCurrentSpec({
                                      ...currentSpec,
                                      name: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div className="prod-sub-container">
                                <h3>Sub Options:</h3>
                                {currentSpec.subOptions.map(
                                  (subOption, index) => (
                                    <div className="sub-input" key={index}>
                                      <Form.Control
                                        type="text"
                                        className="mt-2 mb-0"
                                        placeholder="sub name"
                                        required
                                        value={subOption.subName}
                                        onChange={(e) =>
                                          handleSubOptionChange(
                                            index,
                                            "subName",
                                            e.target.value
                                          )
                                        }
                                      />
                                      <Form.Control
                                        type="number"
                                        className="mt-2 mb-0"
                                        placeholder="price"
                                        value={subOption.price}
                                        onChange={(e) =>
                                          handleSubOptionChange(
                                            index,
                                            "price",
                                            e.target.value
                                          )
                                        }
                                      />
                                      <i
                                        className="bx bx-trash"
                                        onClick={() =>
                                          handleRemoveSubOption(index)
                                        }
                                        style={{
                                          cursor:
                                            currentSpec.subOptions.length > 1
                                              ? "pointer"
                                              : "not-allowed",
                                          opacity:
                                            currentSpec.subOptions.length > 1
                                              ? 1
                                              : 0.5,
                                        }}
                                      ></i>
                                    </div>
                                  )
                                )}
                              </div>
                              <div className="prod-add-sub">
                                <button
                                  type="button"
                                  onClick={handleAddSubOption}
                                >
                                  <i className="bx bx-plus"></i>Add New
                                </button>
                              </div>
                              <div className="link-prod-container">
                                <h3>Link Products</h3>
                                <i
                                  class="bx bx-link"
                                  onClick={() => setLinkModal(true)}
                                ></i>
                              </div>
                              <div className="link-selected-list d-flex">
                                <div
                                  className="d-flex w-100 p-0"
                                  style={{ overflowY: "auto" }}
                                >
                                  <ul className="custom-list">
                                    {selectedProducts.map((data) => (
                                      <li>
                                        {" "}
                                        <span className="h3">{`(${data.prod_sku}) ${data.prod_name}`}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div className="prod-extra-btn-container">
                              <button
                                className="prod-c-btn"
                                type="button"
                                onClick={() => setToggleAddBtn(false)}
                              >
                                Cancel
                              </button>
                              <button className="prod-s-btn" type="submit">
                                Save
                              </button>
                            </div>
                          </Form>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </>
          )}
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
      {/* Start Specification modal  */}
      <Modal show={linkModal} size="xl" onHide={() => setLinkModal(false)}>
        <div className="modal-category p-1">
          <h2>Link Product</h2>
          <div className="link-list-container">
            <div className="cat-list-container">
              {Category.map((category, index) => (
                <div
                  className={`form-cat-container ${
                    selectedCategory === category.category_id ? "selected" : ""
                  }`}
                  key={index}
                  onClick={() => {
                    handleCategoryClick(category.category_id);
                  }}
                >
                  <div className="d-flex">
                    <h3>{category.name}</h3>
                  </div>
                </div>
              ))}
            </div>
            {/* <div className="form-prod-container">
              <input
                type="checkbox"
                id="checkbox-all"
                checked={selectedProducts.length === product.length}
                onChange={handleAllCheckboxChange}
              />
              <label htmlFor="checkbox-all">All</label>
            </div> */}
            <div className="prod-list-container">
              <div className="form-check-container">
                {product.map((p, index) => (
                  <div className="form-prod-container" key={index}>
                    <input
                      type="checkbox"
                      id={`checkbox-${p.product.product_id}`}
                      checked={selectedProducts.some(
                        (item) => item.prod_id === p.product.product_id
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          p.product.product_id,
                          p.product.name,
                          p.product.sku
                        )
                      }
                    />
                    <label htmlFor={`checkbox-${p.product.product_id}`}>
                      {p.product.name}
                    </label>
                  </div>
                ))}
              </div>
              <div className="lower-link-container">
                <label htmlFor="">{selectedProducts.length} selected</label>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      {/* End Specification modal  */}
    </>
  );
};

export default ProductExtraOptions;
