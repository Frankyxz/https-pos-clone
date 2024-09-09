import React, { useState, useEffect } from "react";
import food from "../../assets/icon/food-pic.jpg";
import "../styles/kiosk.css";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
import swal from "sweetalert";
import sample from "../../assets/icon/sisig.jpg";
import { Modal, Button, ModalFooter } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Noimg from "../../assets/image/noimg.png";
import eli_logo from "../../assets/image/eli-logo.png";
const Kiosk = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderType = location.state;

  const [selectedPage, setSelectedPage] = useState("kiosk");
  const handleSelectedPage = (selected) => {
    setSelectedPage(selected);
  };
  //use state for fetching section
  const [selectedCategory, setSelectedCategory] = useState();
  const [CategoryMenu, setCategoryMenu] = useState([]);
  const [ProductMenu, setProductMenu] = useState([]);
  const [specificationData, setSpecificationData] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState(location.state?.cart || []);
  const [localQuantities, setLocalQuantities] = useState({});

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [productNameWithSpecification, setProductNameWithSpecification] =
    useState("");

  const [showOrderModal, setShowOrderModal] = useState(false);

  const handleCloseShowOrderModal = () => {
    setShowOrderModal(false);
    setSelectedPage("kiosk");
  };
  //section para sa specification function
  const [highlightedSpecificationIndex, setHighlightedSpecificationIndex] =
    useState(null);
  const [selectedSpecificationVariantId, setSelectedSpecificationVariantId] =
    useState(null);
  const [selectedExtraOptionVariantId, setSelectedExtraOptionVariantId] =
    useState({});
  const [selectedExtraNeedingVariantId, setSelectedExtraNeedingVariantId] =
    useState({});
  const [specificationModal, setSpecificationModal] = useState(false);
  const handleCloseSpecificationModal = () => {
    setSpecificationModal(false);
    setHighlightedSpecificationIndex(null);
    setSelectedSpecificationVariantId(null);
    setSelectedExtraOptionVariantId({});
    setSelectedExtraNeedingVariantId({});
  };

  const handleSelectSpecification = (specName, index, variantId) => {
    setHighlightedSpecificationIndex(`${specName}-${index}`);
    setSelectedSpecificationVariantId(variantId);
  };

  const handleSelectExtraOption = (groupIndex, variantId) => {
    setSelectedExtraOptionVariantId((prev) => {
      const selectedVariants = prev[groupIndex] || [];
      const isSelected = selectedVariants.includes(variantId);

      if (isSelected) {
        return {
          ...prev,
          [groupIndex]: selectedVariants.filter((id) => id !== variantId),
        };
      } else {
        return {
          ...prev,
          [groupIndex]: [...selectedVariants, variantId],
        };
      }
    });
  };

  const handleSelectExtraNeeding = (groupIndex, variantId) => {
    setSelectedExtraNeedingVariantId((prev) => {
      const selectedVariantsNeeding = prev[groupIndex] || [];
      const isSelectedNeeding = selectedVariantsNeeding.includes(variantId);

      if (isSelectedNeeding) {
        return {
          ...prev,
          [groupIndex]: selectedVariantsNeeding.filter(
            (id) => id !== variantId
          ),
        };
      } else {
        return {
          ...prev,
          [groupIndex]: [...selectedVariantsNeeding, variantId],
        };
      }
    });
  };
  //section para sa specification function

  //fetching ng mga category
  const reloadTableCategory = () => {
    axios
      .get(BASE_URL + "/order/category-product")
      .then((res) => {
        setCategoryMenu(res.data);
      })
      .catch((err) => console.log(err));
  };
  //fetching ng mga category

  //function ng search sa product menu
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    const filtered = ProductMenu.filter((data) =>
      data.product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, ProductMenu]);
  //function ng search sa product menu

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    const Idcategory = categoryId;
    axios
      .get(BASE_URL + "/order/getProductInventory", {
        params: {
          Idcategory,
        },
      })
      .then((res) => {
        const products = res.data;
        const initialQuantities = {};

        // Retrieve current quantities from the response
        products.forEach((p) => {
          initialQuantities[p.product_inventory_id] = p.quantity;
        });

        // Adjust quantities based on the cart data
        const adjustedQuantities = { ...initialQuantities };

        cart.forEach((item) => {
          if (initialQuantities.hasOwnProperty(item.product_inventory_id)) {
            adjustedQuantities[item.product_inventory_id] -= item.quantity;
          }
        });

        // Update localQuantities with adjusted values
        setLocalQuantities(adjustedQuantities);
        setProductMenu(products);
      })
      .catch((err) => console.log(err));
  };

  //function sa pagselect ng product at maadd to cart
  const handleSpecificationModal = (specMainIds) => {
    axios
      .get(BASE_URL + "/specifications/fetchSpecificSpecification", {
        params: {
          specMainIds: specMainIds,
        },
      })
      .then((res) => {
        setSpecificationData(res.data);
        setSpecificationModal(true);
      });
  };

  const handleClick = (product) => {
    if (!specificationModal) {
      const specifications = product.product.category_product_specifications;
      const specMainIds = specifications
        .filter((spec) => spec.specification_main)
        .map((spec) => spec.specification_main.specification_main_id);

      if (
        specifications &&
        specifications.length > 0 &&
        specMainIds.length > 0
      ) {
        setProductNameWithSpecification(product.product.name);
        setSelectedProduct(product);
        handleSpecificationModal(specMainIds);
      } else {
        addToCart(product);
      }
    }
  };

  const addToCart = (product, variants = []) => {
    const currentQuantity = localQuantities[product.product_inventory_id];

    if (currentQuantity > 0) {
      setLocalQuantities((prev) => ({
        ...prev,
        [product.product_inventory_id]: Math.max(0, currentQuantity - 1),
      }));

      setCart((prevCart) => {
        const variantKey = variants
          .map((v) => v.specification_variant_id)
          .sort()
          .join("-");
        const existingProduct = prevCart.find(
          (item) =>
            item.product_inventory_id === product.product_inventory_id &&
            item.variantKey === variantKey
        );

        if (existingProduct) {
          return prevCart.map((item) =>
            item.product_inventory_id === product.product_inventory_id &&
            item.variantKey === variantKey
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  subtotal:
                    (item.quantity + 1) * (item.price + item.variantPrice),
                }
              : item
          );
        } else {
          const variantPrice = variants.reduce(
            (sum, v) => sum + v.variant_price,
            0
          );
          const variantNames = variants.map((v) => v.variant_name).join(", ");
          const eachVariantPrice = variants.map((v) => ({
            variant_name: v.variant_name,
            variant_price: v.variant_price,
          }));
          return [
            ...prevCart,
            {
              product_inventory_id: product.product_inventory_id,
              name: product.product.name,
              quantity: 1,
              price: product.product.price,
              variantPrice: variantPrice,
              variantNames: variantNames,
              variantKey: variantKey,
              eachVariantPrice: eachVariantPrice,
              subtotal: product.product.price + variantPrice,
              productImage: product.product.image,
            },
          ];
        }
      });
    } else {
      swal({
        icon: "error",
        title: "Quantity Exceeded",
        text: "The quantity is not enough.",
      });
    }
  };

  const handleConfirmSpecification = () => {
    if (selectedProduct) {
      const selectedVariants = [
        ...Object.values(selectedExtraOptionVariantId).flat(),
        ...Object.values(selectedExtraNeedingVariantId).flat(),
      ];

      if (selectedSpecificationVariantId) {
        selectedVariants.push(selectedSpecificationVariantId);
      }

      const variants = specificationData
        .flatMap((spec) => spec.specification_variants)
        .filter((variant) =>
          selectedVariants.includes(variant.specification_variant_id)
        );

      addToCart(selectedProduct, variants);
      handleCloseSpecificationModal();
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const handleIncreaseQuantity = (productId, variantKey) => {
    const availableQuantity = localQuantities[productId] || 0;
    if (availableQuantity > 0) {
      setLocalQuantities((prev) => ({
        ...prev,
        [productId]: Math.max(0, availableQuantity - 1),
      }));
      setCart((prevCart) => {
        return prevCart.map((item) => {
          if (
            item.product_inventory_id === productId &&
            item.variantKey === variantKey
          ) {
            return {
              ...item,
              quantity: item.quantity + 1,
              subtotal: (item.quantity + 1) * (item.price + item.variantPrice),
            };
          }
          return item;
        });
      });
    } else {
      swal({
        icon: "error",
        title: "Quantity Exceeded",
        text: "The quantity is not enough.",
      });
    }
  };

  const handleDecreaseQuantity = (productId, variantKey) => {
    setLocalQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
    setCart((prevCart) => {
      return prevCart.reduce((acc, item) => {
        if (
          item.product_inventory_id === productId &&
          item.variantKey === variantKey
        ) {
          if (item.quantity > 1) {
            acc.push({
              ...item,
              quantity: item.quantity - 1,
              subtotal: (item.quantity - 1) * (item.price + item.variantPrice),
            });
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
    });
  };

  useEffect(() => {
    console.log("cart", cart);
  }, [cart]);

  const handleRemoveItem = (productId, variantKey, quantity) => {
    // Restore the original quantity in localQuantities
    setLocalQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + quantity,
    }));

    // Remove the item from the cart
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(
            item.product_inventory_id === productId &&
            item.variantKey === variantKey
          )
      )
    );
  };

  const handleCancelOrder = async () => {
    swal({
      title: `Are you sure you want to cancel this order?`,
      icon: "warning",
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
    }).then(async (value) => {
      if (value === "YES") {
        navigate("/kiosk-main");
      } else {
        swal.close();
      }
    });
  };

  useEffect(() => {
    // Update localQuantities based on cart if cart changes
    const initialQuantities = {};
    ProductMenu.forEach((p) => {
      initialQuantities[p.product_inventory_id] = p.quantity;
    });

    const adjustedQuantities = { ...initialQuantities };
    cart.forEach((item) => {
      if (initialQuantities.hasOwnProperty(item.product_inventory_id)) {
        adjustedQuantities[item.product_inventory_id] -= item.quantity;
      }
    });

    setLocalQuantities(adjustedQuantities);
  }, [cart, ProductMenu]);

  const handlePlaceOrder = () => {
    setSelectedPage("payment-method");
    setShowOrderModal(false);
  };

  const handlePaymentMethod = async (payment) => {
    if (payment == "pay-at-counter") {
      const totalAmount = calculateTotal();
      axios
        .post(BASE_URL + "/order/orderProcess", {
          cart,
          orderType: orderType.orderType,
          totalAmount,
          selectedPayment: payment,
        })
        .then((res) => {
          if (res.status === 200) {
            const { orderNumber } = res.data;
            navigate(`/kiosk-order-number`, {
              state: {
                orderNumber,
                mop: "counter",
              },
            });
          }
        });
    } else {
      const totalAmount = calculateTotal();
      navigate(`/kiosk-order-summary`, {
        state: {
          orderType,
          totalOrder: totalAmount,
          cart,
        },
      });
    }
  };

  useEffect(() => {
    reloadTableCategory();
  }, []);

  return (
    <>
      {selectedPage === "kiosk" ? (
        <div className="kiosk-container ">
          {/* Header */}
          <div className="food-pic-header">
            <img src={food} />
          </div>
          <div className="kiosk-body">
            {/* Kiosk Menu */}
            <div className="kiosk-nav">
              <div className="kiosk-nav-header">
                <h2>MENU</h2>
              </div>
              <div className="menu-categories-list kiosk-cat">
                {CategoryMenu.map((c, index) => (
                  <>
                    <div
                      key={index}
                      className={`category ${
                        selectedCategory === c.category_id ? "selected" : ""
                      }`}
                      onClick={() => {
                        handleSelectCategory(c.category_id);
                      }}
                    >
                      {c.category_image ? (
                        <img
                          src={`data:image/png;base64,${c.category_image}`}
                          alt="Category"
                        />
                      ) : (
                        <img src={Noimg} alt="No image" />
                      )}

                      <h3>{c.name}</h3>
                    </div>
                  </>
                ))}
              </div>
            </div>
            {/* Kiosk Products */}
            <div className="kiosk-list-container">
              <div className="kiosk-head-m">
                <div className="kiosk-head">
                  <>
                    <img src={sample} className="kiosk-categ-pic" />
                    <h1 className="kiosk-categ">Products</h1>
                  </>
                </div>
              </div>
              <div className="kiosk-lists ">
                <div className="kiosk-product-container">
                  {filteredProducts.map((p) => {
                    // const cartItem = addCartQTY[p.product_inventory_id];

                    const quantity = cart
                      .filter(
                        (item) =>
                          item.product_inventory_id === p.product_inventory_id
                      )
                      .reduce((acc, item) => acc + item.quantity, 0);

                    return (
                      <div
                        className="kiosk-product"
                        onClick={() => handleClick(p)}
                        key={p.product_inventory_id}
                      >
                        {p.product.image ? (
                          <img
                            src={`data:image/png;base64,${p.product.image}`}
                            alt="Category"
                          />
                        ) : (
                          <img src={Noimg} alt="No image" />
                        )}

                        <div className="kiosk-product-name">
                          <h3 className="card-title mx-2">{p.product.name}</h3>
                          <h4 className="mx-4 mb-0">
                            ₱
                            {p.product.price.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </h4>
                        </div>

                        {quantity > 0 && (
                          <div className="qty-circle">{quantity}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="kiosk-order-summary">
            <table className="kiosk-table">
              <thead>
                <tr>
                  <th>QTY</th>
                  <th>IMAGE</th>
                  <th>ITEM NAME</th>
                  <th>PRICE</th>
                  <th>SUBTOTAL</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={`${item.product_inventory_id}-${item.variantKey}`}>
                    <td>
                      <div className="order-qty">
                        <i
                          class="bx bxs-minus-square blue"
                          onClick={() =>
                            handleDecreaseQuantity(
                              item.product_inventory_id,
                              item.variantKey
                            )
                          }
                        ></i>
                        {item.quantity}
                        <i
                          class="bx bxs-plus-square blue"
                          onClick={() =>
                            handleIncreaseQuantity(
                              item.product_inventory_id,
                              item.variantKey
                            )
                          }
                        ></i>
                      </div>
                    </td>
                    <td>
                      {item.productImage ? (
                        <img
                          src={`data:image/png;base64,${item.productImage}`}
                          alt="Category"
                          className="kiosk-cart-img"
                        />
                      ) : (
                        <img
                          src={Noimg}
                          alt="No image"
                          className="kiosk-cart-img"
                        />
                      )}
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
                    <td>
                      <i
                        class="bx bxs-trash red"
                        onClick={() =>
                          handleRemoveItem(
                            item.product_inventory_id,
                            item.variantKey,
                            item.quantity
                          )
                        }
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
              <div className="total-order-container">
                <div className="kiosk-order-container">
                  <div className="total-order">
                    <h2>
                      Total Order: ₱
                      {calculateTotal().toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </h2>
                  </div>
                </div>

                <div className="kiosk-payment-container">
                  <button
                    className="kiosk-payment"
                    onClick={() => setShowOrderModal(true)}
                    disabled={cart.length <= 0}
                  >
                    <h1>Review + Payment</h1>
                  </button>

                  <button
                    className="kiosk-payment-cancel"
                    onClick={handleCancelOrder}
                  >
                    <h1>Cancel Order</h1>
                  </button>
                </div>
              </div>
            </table>
          </div>
        </div>
      ) : (
        selectedPage === "payment-method" && (
          <div className="order-type-container">
            <div className="selection-container">
              <div className="kiosk-logo-container  w-eli-logo">
                <div className="kiosk-img-logo  cont-eli-logo">
                  <img src={eli_logo} className="eli-logo" />
                </div>
              </div>
              <div className="choose-type-container">
                <h1>PAYMENT METHOD</h1>
                <div
                  className="kiosk-dine-in"
                  onClick={() => handlePaymentMethod("pay-at-counter")}
                >
                  <h1 className="kiosk-payment-p">PAY AT COUNTER</h1>
                </div>

                <div
                  className={`kiosk-take-out`}
                  onClick={() => handlePaymentMethod("e-wallet")}
                >
                  <h1 className="kiosk-payment-p">E-WALLET</h1>
                </div>
              </div>
            </div>
          </div>
        )
      )}
      {/* for ordering specification */}
      <Modal
        show={specificationModal}
        onHide={handleCloseSpecificationModal}
        size="xl"
      >
        <Modal.Header>
          <h1>{productNameWithSpecification}</h1>
        </Modal.Header>
        <Modal.Body>
          <>
            <h1>Specification</h1>
            <div className="d-flex p-5 flex-column border-bottom">
              <div className="d-flex flex-column p-0 specification-row">
                {specificationData
                  .filter((v) => v.specification_type === "Specification")
                  .map((v, i) => (
                    <React.Fragment key={i}>
                      <div className="h2">{v.specification_name}</div>
                      <div className="d-flex flex-row p-0">
                        {v.specification_variants.map((data, index) => (
                          <div
                            className={`specific-border ${
                              highlightedSpecificationIndex ===
                              `${v.specification_name}-${index}`
                                ? "highlighted"
                                : ""
                            }`}
                            onClick={() =>
                              handleSelectSpecification(
                                v.specification_name,
                                index,
                                data.specification_variant_id
                              )
                            }
                            key={index}
                          >
                            <span className="h3">
                              {`${data.variant_name} = ₱ ${data.variant_price}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </React.Fragment>
                  ))}
              </div>
            </div>
          </>

          <>
            <h1 className="mt-2">Extra Options</h1>
            <div className="d-flex p-5 flex-column border-bottom">
              <div className="d-flex flex-column p-0 specification-row">
                {specificationData
                  .filter((v) => v.specification_type === "Options")
                  .map((v, groupIndex) => (
                    <React.Fragment key={groupIndex}>
                      <div className="h2">{v.specification_name}</div>
                      <div className="d-flex flex-row p-0">
                        {v.specification_variants.map((data, variantIndex) => (
                          <div
                            className={`specific-border ${
                              (
                                selectedExtraOptionVariantId[groupIndex] || []
                              ).includes(data.specification_variant_id)
                                ? "highlighted"
                                : ""
                            }`}
                            key={variantIndex}
                            onClick={() =>
                              handleSelectExtraOption(
                                groupIndex,
                                data.specification_variant_id
                              )
                            }
                          >
                            <span className="h3">
                              {`${data.variant_name} = ₱ ${data.variant_price}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </React.Fragment>
                  ))}
              </div>
            </div>
          </>

          <>
            <h1 className="mt-2">Extra Needing</h1>
            <div className="d-flex p-5 flex-column ">
              <div className="d-flex flex-column p-0 specification-row">
                {specificationData
                  .filter((v) => v.specification_type === "Needing")
                  .map((v, groupIndex) => (
                    <React.Fragment key={groupIndex}>
                      <div className="h2">{v.specification_name}</div>
                      <div className="d-flex flex-row p-0">
                        {v.specification_variants.map((data, variantIndex) => (
                          <div
                            className={`specific-border ${
                              (
                                selectedExtraNeedingVariantId[groupIndex] || []
                              ).includes(data.specification_variant_id)
                                ? "highlighted"
                                : ""
                            }`}
                            key={variantIndex}
                            onClick={() =>
                              handleSelectExtraNeeding(
                                groupIndex,
                                data.specification_variant_id
                              )
                            }
                          >
                            <span className="h3">
                              {`${data.variant_name} = ₱ ${data.variant_price}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </React.Fragment>
                  ))}
              </div>
            </div>
          </>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="warning"
            type="button"
            onClick={handleConfirmSpecification}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* for preview of orders  */}
      <Modal show={showOrderModal} onHide={handleCloseShowOrderModal} size="lg">
        <div className="kiosk-modal-head">
          <h1>Order Preview</h1>
          <div className="d-flex p-0 align-items-center">
            <button type="button" onClick={handleCloseShowOrderModal}>
              Back to Menu
            </button>
          </div>
        </div>
        <Modal.Body>
          <div className="modal-category">
            <table className="kiosk-table">
              <thead>
                <tr>
                  <th>QTY</th>
                  <th>IMAGE</th>
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
                      {item.productImage ? (
                        <img
                          src={`data:image/png;base64,${item.productImage}`}
                          alt="Category"
                          className="kiosk-cart-img"
                        />
                      ) : (
                        <img
                          src={Noimg}
                          alt="No image"
                          className="kiosk-cart-img"
                        />
                      )}
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
        </Modal.Body>

        <div className="total-payment">
          <div className="d-flex p-0 kiosk-total-container">
            <h2 className="total-title">Total Payment:</h2>
            <h2 className="total">
              {calculateTotal().toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
          </div>
          <div className="d-flex p-0 align-items-center">
            <button className="btn-place" onClick={handlePlaceOrder}>
              Place Order
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Kiosk;
