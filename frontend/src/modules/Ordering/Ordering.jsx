import React, { useEffect, useState, useRef } from "react";
// import "../styles/ordering.css";
import "../styles/pos_react.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";
import BASE_URL from "../../assets/global/url";
import Noimg from "../../assets/image/noimg.png";
import swal from "sweetalert";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
// import useStoreCashier from "../../stores/useStoreCashier";
// import NoAccess from "../../assets/image/NoAccess.png";
import noData from "../../assets/icon/no-data.png";
import DataTable from "react-data-table-component";
import { customStyles } from "../styles/table-style";
import useStoreIP from "../../stores/useStoreIP";
const CustomHeader = ({ column }) => (
  <div style={{ textAlign: "center" }}>{column.name}</div>
);

const Ordering = ({ authrztn }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();
  const navigate = useNavigate();
  //for selecting tab sa menu or order records
  const [selectedPage, setSelectedPage] = useState("Menu");
  const handleSelectedPage = (selected) => {
    setSelectedPage(selected);
  };
  const getTabItemStyle = (page) => {
    return {
      border: "1px solid #ccc",
      borderRadius: "4px",
      boxShadow:
        selectedPage === page ? "0px 4px 8px rgba(0, 0, 0, 0.2)" : "none", // Box-shadow for the selected tab-item
      padding: "15px",
      cursor: "pointer",
    };
  };
  //for selecting tab sa menu or order records

  //Use State for End Shift
  const [endShiftCalcModal, setEndShiftCalcModal] = useState(false);
  const [amount, setAmount] = useState(0);
  const [totalCashierSales, setTotalCashierSales] = useState(0);
  const [endShiftModal, setEndShiftModal] = useState(false);
  const [totalCheckout, setTotalCheckout] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalItemSold, setTotalItemSold] = useState(0);
  const [totalRefund, setTotalRefund] = useState(0);
  const [totalCash, setTotalCash] = useState(0);
  const [totalCard, setTotalCard] = useState(0);
  const [employeeName, setEmployeeName] = useState("");
  const [shiftDuration, setShiftDuration] = useState("");
  const [startshiftDate, setStartShiftDate] = useState("");
  //Use State for End Shift

  //use state for fetching section
  const [selectedCategory, setSelectedCategory] = useState("");
  const [CategoryMenu, setCategoryMenu] = useState([]);
  const [ProductMenu, setProductMenu] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [specificationData, setSpecificationData] = useState([]);
  const [cart, setCart] = useState(location.state?.cart || []);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [localQuantities, setLocalQuantities] = useState({});

  const [highlightedSpecificationIndex, setHighlightedSpecificationIndex] =
    useState(null);
  const [selectedSpecificationVariantId, setSelectedSpecificationVariantId] =
    useState(null);
  const [selectedExtraOptionVariantId, setSelectedExtraOptionVariantId] =
    useState({});
  const [selectedExtraNeedingVariantId, setSelectedExtraNeedingVariantId] =
    useState({});

  const [orderType, setOrderType] = useState(true);
  const [showOrder, setShowOrder] = useState(true);

  const [productNameWithSpecification, setProductNameWithSpecification] =
    useState("");
  const [cashierName, setCashierName] = useState("");
  const [userType, setUserType] = useState("");
  const [userId, setuserId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userReference, setUserReference] = useState("");
  //use state for fetching section

  //section para sa specification function
  const [specificationModal, setSpecificationModal] = useState(false);
  const handleCloseSpecificationModal = () => {
    setSpecificationModal(false);
    setHighlightedSpecificationIndex(null);
    setSelectedSpecificationVariantId(null);
    setSelectedExtraOptionVariantId({});
    setSelectedExtraNeedingVariantId({});
  };

  const formattedDate = currentTime.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  const handleSelectSpecification = (specName, index, variantId) => {
    setHighlightedSpecificationIndex(`${specName}-${index}`);
    setSelectedSpecificationVariantId(variantId);
  };

  const handleSelectExtraOption = (groupIndex, variantId) => {
    setSelectedExtraOptionVariantId((prev) => {
      const selectedVariants = prev[groupIndex] || [];
      const isSelected = selectedVariants.includes(variantId);

      if (isSelected) {
        // Remove variantId if already selected
        return {
          ...prev,
          [groupIndex]: selectedVariants.filter((id) => id !== variantId),
        };
      } else {
        // Add variantId if not selected
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
        // Remove variantId if already selected
        return {
          ...prev,
          [groupIndex]: selectedVariantsNeeding.filter(
            (id) => id !== variantId
          ),
        };
      } else {
        // Add variantId if not selected
        return {
          ...prev,
          [groupIndex]: [...selectedVariantsNeeding, variantId],
        };
      }
    });
  };
  //section para sa specification function

  //getting of user data
  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setCashierName(decoded.Fname);
      setUserType(decoded.typeUser);
      setuserId(decoded.id);
    }
  };
  //getting of user data

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

  //when user click the category
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
  //when user click the category

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

  const handleRemoveItem = (productId, variantKey, quantity) => {
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

  const handleToCheckout = () => {
    setOrderType(false);
    setShowOrder(true);
  };

  const handleToCancelOrder = () => {
    setShowOrder(false);
    setOrderType(true);
  };

  const handleNewTransaction = () => {
    const restoredQuantities = { ...localQuantities };
    cart.forEach((item) => {
      restoredQuantities[item.product_inventory_id] += item.quantity;
    });

    setCart([]);
    setLocalQuantities(restoredQuantities);
    setShowOrder(true);
    setOrderType(true);
  };

  const handleViewCart = () => {
    setShowOrder(true);
    setOrderType(true);
  };

  //for order_transaction_id use state 'to, hindi pwedeng ilipat ng pwesto
  const [transactionOrderId, setOrderTransactionId] = useState(
    location.state?.transactionOrderId || null
  );
  //for order_transaction_id use state 'to, hindi pwedeng ilipat ng pwesto
  const handleCheckingOut = (type) => {
    navigate("/order-checkout", {
      state: {
        cart,
        subtotal: calculateTotal(),
        orderType: type,
        transactionOrderId,
      },
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

  useEffect(() => {
    reloadTableCategory();
    decodeToken();
  }, []);

  const [isPrinterReady, setIsPrinterReady] = useState(false);
  const [printerInstance, setPrinterInstance] = useState(null);
  const { setIP, ip } = useStoreIP();

  //function sa pag-end shift ni cashier
  const handleEndShiftModal = () => {
    axios
      .get(BASE_URL + "/endshift/getShift", {
        params: {
          userId,
        },
      })
      .then((res) => {
        const reference = res.data.reference;
        setUserReference(reference);
        axios
          .post(`${BASE_URL}/endshift/endShiftData`, null, {
            params: {
              userId,
              reference,
            },
          })
          .then((res) => {
            if (res.status === 200) {
              setEndShiftModal(true);
              setEmployeeName(res.data.employeeName);
              setShiftDuration(res.data.duration);
              setStartShiftDate(res.data.minCreatedAt);
              setTotalCheckout(res.data.orderCount);
              setTotalIncome(res.data.payableAmountSum);
              setTotalItemSold(res.data.quantitySum);
              setTotalRefund(res.data.voidCount);
              setTotalCash(res.data.cashTotal);
              setTotalCard(res.data.cardTotal);
            } else if (res.status === 202) {
              setEmployeeName("");
              setShiftDuration("");
              setStartShiftDate("");
              setTotalCheckout(0);
              setTotalIncome(0);
              setTotalItemSold(0);
              setTotalRefund(0);
              setTotalCash(0);
              setTotalCard(0);
            }
          })
          .catch((error) => {
            console.error("Error end shift:", error);
            swal({
              title: "Error!",
              text: "There was an error on end shift.",
              icon: "error",
              buttons: false,
              timer: 2000,
            });
          });
      });
  };

  const handleOpenCalculator = () => {
    swal({
      title: "End Shift",
      text: "Would you like to end your shift?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((result) => {
      if (result) {
        setEndShiftCalcModal(true);
        setEndShiftModal(false);
        openCashDrawer();
      }
    });
  };

  const handleEndShift = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const hours = String(currentDate.getHours()).padStart(2, "0");
    const minutes = String(currentDate.getMinutes()).padStart(2, "0");
    const seconds = String(currentDate.getSeconds()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    axios
      .post(BASE_URL + "/endshift/insertEndShift", null, {
        params: {
          userId,
          userReference,
          startshiftDate,
          endshiftDate: formattedDate,
          totalCheckout,
          totalIncome,
          totalItemSold,
          totalRefund,
          totalCash,
          totalCard,
          employeeName,
          shiftDuration,
          amount,
          totalCashierSales,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          swal({
            title: "Shift Ended!",
            text: "Your shift is already ended!",
            icon: "success",
          }).then(() => {
            localStorage.removeItem("accessToken");
            navigate("/");
          });
        } else {
          swal.fire({
            title: "Something Went Wrong!",
            text: "Please contact your supervisor!",
            icon: "error",
          });
        }
      });
  };
  //function sa pag-end shift ni cashier

  useEffect(() => {
    console.log(ip);
  }, [ip]);
  const initPrinter = async () => {
    if (window.IminPrinter) {
      try {
        const printer = new window.IminPrinter(ip);
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

  const ensurePrinterConnection = async () => {
    if (!isPrinterReady || !printerInstance) {
      await initPrinter();
    }
  };

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

  const handleCloseCashierCalc = () => {
    setEndShiftCalcModal(false);
    setEndShiftModal(true);
    setAmount(0);
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
    const totalSales = limitedAmount - totalCash;

    setTotalCashierSales(totalSales);
    setAmount(limitedAmount.toString());
  };

  const handleDel = () => {
    const newAmountStr = amount.slice(0, -1);

    const newAmount = parseFloat(newAmountStr);

    setAmount(newAmountStr);
    const totalSalesAmount = newAmount - totalCash;
    setTotalCashierSales(isNaN(totalSalesAmount) ? 0 : totalSalesAmount);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key;
      {
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
  }, [handleCalculator, handleDel]);

  const handleClear = () => {
    setAmount(0);
    setTotalCashierSales(0);
  };

  // ************************** VOID TRANSACTION SECTION *************************************** \\
  const [posTransaction, setPOStransaction] = useState([]);
  const [productDetailsCheckout, setProductDetailsCheckout] = useState([]);
  const [supervisorInputtedData, setSupervisorInputtedData] = useState([]);

  const [typeOfOrder, setTypeOfOrder] = useState("");
  const [studentId, setStudentId] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [checkoutId, setCheckoutId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [inputtedRFID, setInputtedRFID] = useState("");
  const [userPin, setUserPIN] = useState("");
  const [selectedReason, setSelectedReason] = useState("");

  const [selectedOption, setSelectedOption] = useState(null);
  const [validated, setValidated] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [outOfStockChecked, setOutOfStockChecked] = useState(false);
  const [othersChecked, setOthersChecked] = useState(false);
  const [showProductCheckoutModal, setProductCheckoutModal] = useState(false);
  const [reasonModal, setReasonModal] = useState(false);
  const [chooseModal, setChooseModal] = useState(false);
  const [pinModal, setPinModal] = useState(false);
  const [inputManualRfidModal, setManualRfidModal] = useState(false);
  const [tapCardModal, setTapCardModal] = useState(false);

  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  const dt = useRef(null);

  const handleShow = () => setProductCheckoutModal(true);
  const handleProductCheckoutClose = () => setProductCheckoutModal(false);

  const reloadCheckoutTransaction = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/orderRecords/fetchCheckoutTransaction`
      );
      const currentDate = new Date().toISOString().split("T")[0];
      const filteredData = res.data.filter(
        (transaction) =>
          new Date(transaction.createdAt).toISOString().split("T")[0] ===
          currentDate
      );
      setPOStransaction(filteredData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleFetchProfile = async () => {
      const res = await axios.get(`${BASE_URL}/store_profile/fetchProfile`);
      setIP(res.data.store_ip);
    };

    handleFetchProfile();
  }, []);

  const handleShowProductCheckout = async (row) => {
    setOrderTransactionId(row.order_transaction_id);
    setTypeOfOrder(row.order_type);
    const orderTransactionId = row.order_transaction_id;
    axios
      .get(BASE_URL + "/orderRecords/fetchProductCheckout", {
        params: {
          Idcheckout: orderTransactionId,
        },
      })
      .then((res) => {
        if (row.status === "Pending-Customer") {
          const cartItems = res.data.map((item) => ({
            product_inventory_id: item.product_inventory_id,
            name: item.product_inventory.product.name,
            quantity: item.quantity,
            price: item.product_inventory.product.price,
            variantPrice: item.cart_specification_variants.reduce(
              (sum, variant) =>
                sum + variant.specification_variant.variant_price,
              0
            ),
            variantNames: item.cart_specification_variants
              .map((variant) => variant.specification_variant.variant_name)
              .join(", "),
            variantKey: item.cart_specification_variants
              .map((variant) => variant.specification_variant_id)
              .sort()
              .join("-"),
            eachVariantPrice: item.cart_specification_variants.map(
              (variant) => ({
                variant_name: variant.specification_variant.variant_name,
                variant_price: variant.specification_variant.variant_price,
              })
            ),
            subtotal: item.subtotal,
          }));

          // Update the cart state
          setCart(cartItems);

          // Navigate to the Menu page
          handleSelectedPage("Menu");
        } else {
          setProductDetailsCheckout(res.data);
          handleShow();
        }
      })
      .catch((err) => console.log(err));
  };

  const [searchOrderNum, setSearchOrderNum] = useState("");

  const handleSearchOrderNum = (event) => {
    setSearchOrderNum(event.target.value);
  };

  const filteredTransac = posTransaction.filter((data) =>
    data.order_number.toLowerCase().includes(searchOrderNum.toLowerCase())
  );

  const handleCancel = async (id) => {
    swal({
      title: `Are you sure you want to cancel this order?`,
      text: `Cancel the order?`,
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
    }).then(async (value) => {
      if (value === "YES") {
        handleCancelOrder(id);
      } else {
        swal.close();
      }
    });
  };

  const handleCancelOrder = async (id) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/order/cancel-transac-order/${id}`
      );

      if (res.status == 200) {
        swal({
          icon: "success",
          title: "Order Cancelled",
          text: "This order has been canceled",
        }).then(() => {
          reloadCheckoutTransaction();
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleVoid = (row) => {
    setReasonModal(true);
    setCheckoutId(row.order_transaction_id);
    setPaymentMethod(row.payment_method);
    setStudentId(row.student_id);
    setReceivedAmount(row.received_amount);
  };

  const handleCloseChoose = () => {
    setChooseModal(false);
    setSelectedOption(null);
    setSelectedReason("");
    setCheckoutId("");
    setPaymentMethod("");
    setStudentId("");
    setReceivedAmount(0);
    setIsDisabled(true);
  };

  const handleCloseInputManualRfid = () => {
    setManualRfidModal(false);
  };

  const handleClosePinModal = () => {
    setPinModal(false);
  };

  const handleCloseReasonModal = () => {
    setReasonModal(false);
    setSelectedReason("");
    setCheckoutId("");
    setPaymentMethod("");
    setStudentId("");
    setReceivedAmount(0);
    setIsDisabled(true);
  };

  const handleReasonChange = (event) => {
    setSelectedReason(event.target.value);
    setIsDisabled(false);
    setOutOfStockChecked(false);
    setOthersChecked(false);
  };

  const handleCheckboxChange = (checkboxName) => {
    if (checkboxName === "OutofStock") {
      setOutOfStockChecked(!outOfStockChecked);
      setOthersChecked(false);
    } else {
      setOutOfStockChecked(false);
      setOthersChecked(!othersChecked);
    }

    // Update selectedReason based on checkbox selection
    if (checkboxName === "OutofStock") {
      setSelectedReason(outOfStockChecked ? "" : "Refund-OutofStock");
    } else {
      setSelectedReason(othersChecked ? "" : "Refund-Others");
    }
  };

  const handleConfirm = () => {
    if (selectedReason === "Refund" && !outOfStockChecked && !othersChecked) {
      swal({
        icon: "warning",
        title: "Oops...",
        text: "You need to choose at least one checkbox!",
      }).then(() => {
        setReasonModal(true);
      });
    } else {
      setReasonModal(false);
      setChooseModal(true);
    }
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setChooseModal(false);
    if (option === "rfid") {
      setManualRfidModal(true);
    } else {
      setTapCardModal(true);
    }
  };

  const handleChange = (e, index) => {
    const newValue = e.target.value;
    if (!isNaN(newValue)) {
      setUserPIN((prevPin) => {
        const updatedPin = prevPin.split("");
        updatedPin[index] = newValue;
        return updatedPin.join("");
      });
      // sa pagmove ng focus kada mag-iinput sa field
      if (index < inputRefs.length - 1 && newValue !== "") {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  const handleCheckout = (transactionOrderId, columnOrdernumber, typeOrder) => {
    axios
      .get(BASE_URL + "/orderRecords/fetchTocheckoutTransaction", {
        params: {
          transactionOrderId,
        },
      })
      .then((res) => {
        navigate("/cashier-checkout", {
          state: {
            cartData: res.data,
            orderTransacID: transactionOrderId,
            orderType: typeOrder,
            columnTransacId: transactionOrderId,
            columnOrdernumber: columnOrdernumber,
            selectedPage: selectedPage,
          },
        });
      })
      .catch((err) => console.log(err));
  };

  const handleConfirmInputRfid = async (e) => {
    axios
      .post(`${BASE_URL}/masterList/checkRFIDEmployee`, {
        inputtedRFID,
      })
      .then((res) => {
        if (res.status === 200) {
          const {
            data: { data: employeeData },
          } = res;
          setManualRfidModal(false);
          setPinModal(true);
          setSupervisorInputtedData([employeeData]);
          setSupervisorId(employeeData.col_id);
        } else if (res.status === 201) {
          swal({
            icon: "info",
            title: "No user found",
            text: "Your RFID number not found",
          });
        } else if (res.status === 202) {
          swal({
            icon: "info",
            title: "Not supervisor or admin",
            text: "Please input the supervisor or admin rfid",
          });
        }
      });
  };

  const CheckPIN = async (e) => {
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
      return;
    }

    const userPinMatch = supervisorInputtedData.find(
      (data) => data.user_pin === userPin
    );

    if (!userPinMatch) {
      if (supervisorInputtedData.length === 0) {
        swal({
          icon: "info",
          title: "No user found",
          text: "Your inputted PIN does not match any user.",
        });
      } else {
        swal({
          icon: "error",
          title: "Incorrect PIN",
          text: "Your inputted PIN is incorrect.",
        });
      }
      setUserPIN(""); // Clear the PIN input
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/masterList/checkpin`, {
        checkoutId,
        selectedReason,
        paymentMethod,
        studentId,
        receivedAmount,
        userId,
        supervisorId,
      });

      if (res.status === 200) {
        swal({
          icon: "success",
          title: "Void Transaction Success",
          text: "Void transaction has been successfully.",
        }).then(() => {
          setPinModal(false);
          setValidated(false);
          reloadCheckoutTransaction();
          setUserPIN("");
          setSelectedReason("");
          setCheckoutId("");
          setPaymentMethod("");
          setStudentId("");
          setReceivedAmount(0);
          setSupervisorId("");
          setSupervisorInputtedData([]);
          setIsDisabled(true);
        });
      } else if (res.status === 201) {
        swal({
          icon: "error",
          title: "Incorrect PIN",
          text: "Your inputted PIN is incorrect.",
        }).then(() => {
          setPinModal(true);
          setValidated(false);
          setUserPIN("");
        });
      }
    } catch (error) {
      console.error("Error checking PIN:", error);
      swal({
        icon: "error",
        title: "Error",
        text: "An error occurred while checking the PIN.",
      });
    }

    setValidated(true);
  };

  const columns = [
    {
      name: "ORDER TRANSACTION ID",
      selector: (row) => row.order_transaction_id,
    },
    {
      name: "ORDER NUMBER",
      selector: (row) => row.order_number,
    },
    {
      name: "PAYABLE AMOUNT",
      selector: (row) =>
        Number(row.payable_amount).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      name: "RECEIVED AMOUNT",
      selector: (row) =>
        Number(row.received_amount).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      name: "CHANGE AMOUNT",
      selector: (row) =>
        Number(row.change_amount).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      name: "PAYMENT METHOD",
      selector: (row) => row.payment_method,
    },
    {
      name: "TYPE",
      selector: (row) => row.order_type,
    },
    {
      name: "ACTION",
      cell: (row) => {
        if (row.status === "Pending-Customer") {
          return (
            <>
              <button
                className="btn btn-success"
                onClick={() =>
                  handleCheckout(
                    row.order_transaction_id,
                    row.order_number,
                    row.order_type
                  )
                }
              >
                Checkout
              </button>
              <button
                className="btn btn-danger mx-3"
                onClick={() => handleCancel(row.order_transaction_id)}
              >
                Cancel
              </button>
            </>
          );
        } else if (row.status === "Ordered") {
          return (
            <button className="btn btn-warning" onClick={() => handleVoid(row)}>
              Void
            </button>
          );
        } else if (row.status === "Void") {
          return <span>Voided</span>;
        } else if (row.status === "Cancelled") {
          return <span style={{ color: "red" }}>Cancelled</span>;
        }
      },
    },
  ];

  const productDetailsColumns = [
    {
      name: "SKU #",
      selector: (row) => row.product_inventory.product.sku,
    },
    {
      name: "PRODUCT NAME",
      selector: (row) => row.product_inventory.product.name,
      cell: (row) => (
        <div className="d-flex flex-column p-0">
          <span className="text-center">
            {row.product_inventory.product.name}
          </span>

          {row.cart_specification_variants &&
          row.cart_specification_variants.length > 0 ? (
            <span className="text-center" style={{ fontSize: "10px" }}>
              (
              {row.cart_specification_variants
                .map((variant) => variant?.specification_variant?.variant_name)
                .join(", ")}
              )
            </span>
          ) : (
            <span></span>
          )}
        </div>
      ),
    },
    {
      name: "SUBTOTAL",
      selector: (row) =>
        Number(row.subtotal).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      name: "QUANTITY",
      selector: (row) => row.quantity,
    },
  ];

  useEffect(() => {
    reloadCheckoutTransaction();
  }, []);

  return (
    <>
      <div className="cashier-display-container">
        {/* Header */}
        <div className="header-orders">
          <div className="tab-manual-custom">
            <div
              className="tab-item"
              style={getTabItemStyle("Menu")}
              onClick={() => handleSelectedPage("Menu")}
            >
              <div className="tab-icon">
                <i className="fas fa-list"></i>
              </div>
              <div className="tab-text">
                <h2
                  style={{
                    color: selectedPage === "Menu" ? "#3498db" : "#000",
                  }}
                >
                  Menu
                </h2>
              </div>
            </div>
            <div
              className="tab-item"
              style={getTabItemStyle("Order-Records")}
              onClick={() => {
                handleSelectedPage("Order-Records");
                reloadCheckoutTransaction();
              }}
            >
              <div className="tab-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <div className="tab-text">
                <h2
                  style={{
                    color:
                      selectedPage === "Order-Records" ? "#3498db" : "#000",
                  }}
                >
                  Order Records
                </h2>
              </div>
            </div>

            <div className="current-date-header">
              <div className="calendar-date">
                <i class="bx bx-calendar-alt"></i>
                <h3>{formattedDate}</h3>
              </div>
              <div className="end-shifter-btn">
                <button type="button" onClick={handleEndShiftModal}>
                  <i className="bx bx-time-five"></i>
                  End Shift
                </button>
              </div>
            </div>
          </div>
        </div>
        {selectedPage === "Menu" ? (
          <div className="cashier-body">
            {/* Menus */}
            <div className="menu-nav">
              <div className="menu-nav-header">
                <h2>MENU</h2>
              </div>
              <div className="menu-categories-list">
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

            <div className="products-list-container">
              <div className="products-head">
                <h2>Products</h2>
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control search"
                    placeholder="Search by Product Name"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              <div className="products-lists ">
                {filteredProducts.map((p) => (
                  <div
                    class="card-product"
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
                    <div class="card-body">
                      <h3 class="card-title mx-2 text-center order-title-name">
                        {p.product.name}
                      </h3>
                      <h4 class="text-center mx-4 order-title-price ">
                        ₱
                        {p.product.price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </h4>
                      <h5 className="ms-2 mb-4">{`QTY: ${
                        localQuantities[p.product_inventory_id] !== undefined
                          ? localQuantities[p.product_inventory_id]
                          : p.quantity || 0
                      }`}</h5>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ordering-container">
              <div className="order-table-container">
                {!showOrder ? (
                  <div className="btn-order-table-container">
                    <button
                      className="btn btn-lg btn-outline-primary"
                      onClick={() => navigate("/Menu")}
                    >
                      <span> Back Home</span>
                    </button>
                    <button
                      className="btn btn-lg btn-primary"
                      onClick={handleViewCart}
                    >
                      <span> View Cart</span>
                    </button>
                    <button
                      className="btn btn-lg btn-outline-primary"
                      onClick={handleNewTransaction}
                    >
                      <span> New Transaction</span>
                    </button>
                  </div>
                ) : !orderType ? (
                  <div className="btn-order-table-container">
                    <button
                      className="btn btn-lg btn-outline-primary"
                      onClick={() => handleCheckingOut("Dine-in")}
                    >
                      <span>Dine-in</span>
                    </button>
                    <button
                      className="btn btn-lg btn-primary"
                      onClick={() => handleCheckingOut("Takeout")}
                    >
                      <span>Takeout</span>
                    </button>
                  </div>
                ) : null}
                {showOrder && orderType ? (
                  <div className="table-orders-container">
                    <div className="order-num-container">
                      <h2>{`${userType} - ${cashierName}`}</h2>
                      <div className="number-container fs-1 fw-bold">
                        {typeOfOrder}
                      </div>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>QTY</th>
                          <th>ITEM NAME</th>
                          <th>SUBTOTAL</th>
                          <th>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item, index) => (
                          <tr
                            key={`${item.product_inventory_id}-${item.variantKey}`}
                          >
                            <td>
                              <i
                                className="bx bxs-minus-square blue"
                                onClick={() =>
                                  handleDecreaseQuantity(
                                    item.product_inventory_id,
                                    item.variantKey
                                  )
                                }
                              ></i>
                              {item.quantity}
                              <i
                                className="bx bxs-plus-square blue"
                                onClick={() =>
                                  handleIncreaseQuantity(
                                    item.product_inventory_id,
                                    item.variantKey
                                  )
                                }
                              ></i>
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
                              {item.subtotal.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td>
                              <i
                                className="bx bxs-trash red"
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
                    </table>
                  </div>
                ) : null}
              </div>
              <div className="order-checkout-container">
                <div className="total-container d-flex">
                  <h3 className="total-price">Total</h3>
                  <h3>
                    ₱
                    {calculateTotal().toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h3>
                </div>
                <div className="total-btn-container">
                  <button
                    className="btn btn-lg btn-outline-primary"
                    onClick={handleToCancelOrder}
                  >
                    <span>Cancel Order</span>
                  </button>

                  <button
                    className="btn btn-lg btn-primary"
                    disabled={cart.length <= 0}
                    onClick={handleToCheckout}
                  >
                    <span>Checkout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          selectedPage === "Order-Records" && (
            <>
              <div class="input-group first-col  group-in">
                <input
                  type="text"
                  class="form-control search mx-5 mb-2 mt-4"
                  placeholder="Search by Order Number"
                  aria-describedby="addon-wrapping"
                  onChange={handleSearchOrderNum}
                />
              </div>
              <div className="table">
                {filteredTransac.length == 0 ? (
                  <>
                    <div className="no-data-table ">
                      <table>
                        <thead>
                          <th>ORDER TRANSACTION</th>
                          <th>ORDER NUMBER</th>
                          <th>PAYABLE AMOUNT</th>
                          <th>RECEIVED AMOUNT</th>
                          <th>CHANGE AMOUNT</th>
                          <th>PAYMENT METHOD</th>
                          <th>TYPE</th>
                          <th>ACTION</th>
                        </thead>
                        <tbody className="r-no-data">
                          <div>
                            <img
                              src={noData}
                              alt="No Data"
                              className="no-data-icon"
                            />
                            <h2 className="no-data-label">No Data Found</h2>
                          </div>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="void-data-table">
                      <DataTable
                        columns={columns}
                        data={filteredTransac}
                        customStyles={customStyles}
                        pagination
                        onRowClicked={handleShowProductCheckout}
                      />
                    </div>
                  </>
                )}
              </div>
            </>
          )
        )}
      </div>

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

      {/* for product details in order records */}
      <Modal
        show={showProductCheckoutModal}
        onHide={handleProductCheckoutClose}
        size="xl"
      >
        <Modal.Header>
          <h2>PRODUCT INFORMATION</h2>
        </Modal.Header>
        <Modal.Body>
          <div className="table-containss">
            <div className="main-of-all-tables">
              <DataTable
                columns={productDetailsColumns}
                data={productDetailsCheckout}
                customStyles={customStyles}
                pagination
              />
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* for selecting a reason upon void in order records */}
      <Modal show={reasonModal} onHide={handleCloseReasonModal}>
        <Modal.Body>
          <div className="modal-top-card">
            <h2>Void Reason</h2>
            <div className="modal-top-card-student">
              <Form.Select
                size="lg"
                required
                onChange={handleReasonChange}
                defaultValue=""
              >
                <option disabled value="">
                  Select Reason
                </option>
                <option value="Refund">Refund</option>
                <option value="WrongItem">Wrong Product</option>
              </Form.Select>
            </div>
            {(selectedReason === "Refund" ||
              selectedReason === "Refund-OutofStock" ||
              selectedReason === "Refund-Others") && (
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={outOfStockChecked}
                    onChange={() => handleCheckboxChange("OutofStock")}
                  />
                  Out of Stock
                </label>
                <label style={{ marginLeft: "10px" }}>
                  <input
                    type="checkbox"
                    checked={othersChecked}
                    onChange={() => handleCheckboxChange("Others")}
                  />
                  Others
                </label>
              </div>
            )}
            <div className="button-top-card">
              <button disabled={isDisabled} onClick={handleConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* for selecting if manual input or tap card */}
      <Modal show={chooseModal} onHide={handleCloseChoose}>
        <Modal.Body>
          <div className="modal-top-card">
            <h2>Void Process</h2>
            <div className="d-flex p-5 flex-row w-100 justify-content-between chooseVoid">
              <div
                className={`h2 ${selectedOption === "rfid" ? "selected" : ""}`}
                onClick={() => handleOptionClick("rfid")}
              >
                Input RFID
              </div>
              <div
                className={`h2 ${selectedOption === "tap" ? "selected" : ""}`}
                onClick={() => handleOptionClick("tap")}
              >
                Tap Card
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* for inputting manual rfid */}
      <Modal show={inputManualRfidModal} onHide={handleCloseInputManualRfid}>
        <Modal.Body>
          <div className="modal-top-card">
            <h2>Please Input Supervisor RFID</h2>
            <div>
              <Form.Control
                type="text"
                className="fs-3 mb-2"
                onChange={(e) => setInputtedRFID(e.target.value)}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ border: "none" }}>
          <Button variant="primary" onClick={handleConfirmInputRfid}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* USER PIN SECTION */}
      <Modal show={pinModal}>
        <Form noValidate validated={validated} onSubmit={CheckPIN}>
          <Modal.Body>
            <div className="student-pin-modal-container">
              <h2>Please Enter Your PIN</h2>
              <div className="pin-box-section">
                {inputRefs.map((ref, index) => (
                  <div className="first-form-control" key={index}>
                    <Form.Control
                      type="password"
                      value={userPin[index] || ""}
                      onChange={(e) => handleChange(e, index)}
                      required
                      ref={ref}
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
                <button type="button" onClick={handleClosePinModal}>
                  Cancel
                </button>
              </div>
            </div>
          </Modal.Body>
        </Form>
      </Modal>

      {/* for end shift */}
      <Modal
        show={endShiftModal}
        onHide={() => setEndShiftModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Form>
          <div className="end-modal-category P">
            <div className="end-modal-head">
              <div className="end-acc-nam">
                <h2>{employeeName}</h2>
                <p>
                  <span className="end-gray">Shift duration: </span>
                  {shiftDuration}
                </p>
              </div>
              <div className="start-time">
                <p>
                  <span className="end-gray">Start Time</span>
                </p>
                <p>{startshiftDate}</p>
              </div>
            </div>
            <hr />
            <div className="end-modal-details">
              <h2 className="mb-3">Transaction</h2>
              <div className="end-details">
                <p>Checkout</p>
                <p>{totalCheckout}</p>
              </div>
              <div className="end-details">
                <p>Average Income Value</p>
                <p>
                  {totalIncome.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="end-details">
                <p>Sold Products</p>
                <p>{totalItemSold}</p>
              </div>
              <div className="end-details">
                <p>Refunded</p>
                <p>{totalRefund}</p>
              </div>
            </div>
            <hr />
            <div className="end-modal-details">
              <h2 className="mb-3">Payment Report</h2>
              <div className="end-details">
                <p>Cash</p>
                <p>
                  {totalCash.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="end-details">
                <p>Card</p>
                <p>
                  {totalCard.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
            <hr />
            <div className="end-modal-btn-container">
              <button
                type="button"
                className="end-btn end-cc-btn"
                onClick={() => setEndShiftModal(false)}
                style={{ width: "120px" }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="end-btn end-es-btn"
                onClick={handleOpenCalculator}
              >
                End Shift
              </button>
            </div>
          </div>
        </Form>
      </Modal>

      {/* for cashier calculator */}
      <Modal
        show={endShiftCalcModal}
        onHide={handleCloseCashierCalc}
        backdrop="static"
        keyboard={false}
      >
        <div className="modal-category p-1 end-shift-cal">
          <h2>END SHIFT</h2>
          <h4 className="shitft-p">Check the cash in the cash drawer</h4>
          <hr />
          <div className="shift-cal-container">
            <div className="shift-expected-cash">
              <h3>Expected Cash</h3>
              <h3>
                ₱{" "}
                {totalCash.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
            </div>
            <div className="shift-actual-cash">
              <h3>Actual Ending Cash</h3>
              <h3>
                ₱ {amount === "" ? 0 : parseFloat(amount).toLocaleString()}
              </h3>
            </div>

            <div className="shift-actual-cash border-top mt-5 p-1">
              <h3>Difference</h3>
              <h3>
                ₱{" "}
                {totalCashierSales.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
            </div>

            <div className="calc-container">
              <table>
                <tr>
                  <th onClick={() => handleCalculator("1")}>1</th>
                  <th onClick={() => handleCalculator("2")}> 2</th>
                  <th onClick={() => handleCalculator("3")}>3</th>
                  <th onClick={handleDel}>Del</th>
                </tr>
                <tr>
                  <th onClick={() => handleCalculator("4")}>4</th>
                  <th onClick={() => handleCalculator("5")}>5</th>
                  <th onClick={() => handleCalculator("6")}>6</th>
                  <th onClick={handleClear}>Clear</th>
                </tr>
                <tr>
                  <th onClick={() => handleCalculator("7")}>7</th>
                  <th onClick={() => handleCalculator("8")}>8</th>
                  <th onClick={() => handleCalculator("9")}>9</th>
                  <th rowSpan={2} onClick={handleEndShift}>
                    Enter
                  </th>
                </tr>
                <tr>
                  <th onClick={() => handleCalculator("0")}>0</th>
                  <th onClick={() => handleCalculator("00")}>00</th>
                  <th onClick={() => handleCalculator(".")}>.</th>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <div className="end-modal-btn-container">
          <button
            type="button"
            className="end-btn end-es-btn"
            onClick={handleCloseCashierCalc}
            style={{ marginTop: "10px" }}
          >
            Back
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Ordering;
