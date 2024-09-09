const router = require("express").Router();
// const Product = require("../db/models/product.model");
// const Cart = require("../db/models/cart.model");
const {
  Cart,
  Student,
  Specification_Main,
  Specification_Variant,
  Student_Balance,
  Product_Inventory,
  Product,
  Category,
  Category_Product,
  Order_Counter,
  Order_Transaction,
  Cart_Specification_Variant,
  Balance_History,
  Activity_Log,
  Category_Product_Specification,
  MasterList,
} = require("../db/models/associations");
const { Op } = require("sequelize");
const session = require("express-session");
const moment = require("moment-timezone");
router.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

//route nung si cashier direct nag add cart
router.route("/checkoutProcess").post(async (req, res) => {
  try {
    const {
      cart,
      subtotal,
      orderType,
      received,
      change,
      rfidNum,
      IdStudent,
      userId,
      checkoutRemarks,
      studentNumber,
      selectedPayment,
    } = req.body;
    const currentDate = moment().tz("Asia/Manila").toDate();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const currentMonthDay = `${year}${month}${day}`;

    // Find the last order with the current date prefix
    const lastPayCode = await Order_Transaction.findOne({
      where: {
        order_number: {
          [Op.like]: `${currentMonthDay}C%`,
        },
      },
      order: [["createdAt", "DESC"]],
    });

    let newRefCode;
    if (lastPayCode && lastPayCode.order_number) {
      const latestRefCode = lastPayCode.order_number;
      const sequenceNumber = latestRefCode.slice(-4);
      const latestSequence = parseInt(sequenceNumber, 10);
      const newSequence = String(latestSequence + 1).padStart(4, "0");
      newRefCode = `${currentMonthDay}C${newSequence}`;
    } else {
      newRefCode = `${currentMonthDay}C0001`;
    }

    // Check if the newly may existing order
    let checkOrderNumber = await Order_Transaction.findOne({
      where: {
        order_number: newRefCode,
      },
    });

    // If it exists, increment again until a maging unique
    while (checkOrderNumber) {
      const sequenceNumber = newRefCode.slice(-4);
      const latestSequence = parseInt(sequenceNumber, 10);
      const newSequence = String(latestSequence + 1).padStart(4, "0");
      newRefCode = `${currentMonthDay}C${newSequence}`;

      checkOrderNumber = await Order_Transaction.findOne({
        where: {
          order_number: newRefCode,
        },
      });
    }

    const currentDateCheckout = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Manila",
    });

    const findStudent = await Student_Balance.findOne({
      where: {
        student_id: IdStudent,
      },
    });

    const balance = findStudent ? findStudent.balance : null;

    const newOrder = await Order_Transaction.create({
      payable_amount: subtotal,
      received_amount: received,
      change_amount: change,
      payment_method: selectedPayment,
      order_type: orderType,
      order_number: newRefCode,
      student_id: IdStudent || null,
      masterlist_id: userId || null,
      status: "Ordered",
      date_checkout: currentDateCheckout,
      remarks: checkoutRemarks || "",
      purchased_balance: balance || null,
    });

    const orderTransactionId = newOrder.order_transaction_id;

    if (selectedPayment === "CARD") {
      const StudentData = await Student_Balance.findOne({
        where: {
          student_id: IdStudent,
        },
      });
      if (StudentData) {
        const studentBalance = StudentData.balance;
        await StudentData.update({ balance: studentBalance - subtotal });
      }

      if (newOrder) {
        await Balance_History.create({
          order_transaction_id: newOrder.order_transaction_id,
          student_id: StudentData.student_id,
          old_balance: StudentData.balance,
          new_balance: StudentData.balance - subtotal,
        });
      }
    }

    const productLogs = [];
    for (const item of cart) {
      const cartInsert = await Cart.create({
        quantity: item.quantity,
        subtotal: item.subtotal,
        product_inventory_id: item.product_inventory_id,
        order_transaction_id: orderTransactionId,
        purchased_amount: item.price,
      });

      const invData = await Product_Inventory.findOne({
        where: {
          product_inventory_id: item.product_inventory_id,
        },
      });

      if (invData) {
        const newQuantity = invData.quantity - item.quantity;

        // if (newQuantity <= 0) {
        //   throw new Error(
        //     `Not enough inventory for product_inventory_id: ${item.product_inventory_id}`
        //   );
        // }

        // Update the inventory quantity
        await invData.update({
          quantity: newQuantity,
        });
      }
      if (cartInsert) {
        // Split the variantKey string into an array
        const variantIds = item.variantKey.split("-");
        const variantPrices = item.eachVariantPrice.map(
          (variant) => variant.variant_price
        );

        for (let i = 0; i < variantIds.length; i++) {
          const variantId = variantIds[i];
          const variantPrice = variantPrices[i];

          if (variantId) {
            await Cart_Specification_Variant.create({
              cart_id: cartInsert.transaction_id,
              specification_variant_id: variantId,
              variant_price: variantPrice,
            });
          }
        }
      }

      const product = await Cart.findAll({
        include: [
          {
            model: Product_Inventory,
            required: true,
            include: [
              {
                model: Product,
                required: true,
              },
            ],
          },
          {
            model: Cart_Specification_Variant,
            required: false,
            include: [
              {
                model: Specification_Variant,
                required: true,
              },
            ],
          },
        ],
        where: {
          transaction_id: cartInsert.transaction_id,
        },
      });

      for (const item of product) {
        const productName = item.product_inventory.product.name;

        if (
          item.cart_specification_variants &&
          item.cart_specification_variants.length > 0
        ) {
          const variants = item.cart_specification_variants
            .map((variant) => variant.specification_variant.variant_name)
            .join(", ");
          productLogs.push(`${productName} (${variants})`);
        } else {
          productLogs.push(productName);
        }
      }
    }
    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Ordering: Checkout products ${productLogs.join(
        ", "
      )} total of ${subtotal} payment method ${selectedPayment}`,
    });

    res.status(200).send({ id: newOrder.order_transaction_id });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});
//route nung si cashier direct nag add cart

//route nung order na galing sa order records at nagdagdag order
router.route("/addOrderRecordCheckout").post(async (req, res) => {
  try {
    const {
      transactionOrderId,
      cart,
      subtotal,
      received,
      change,
      IdStudent,
      userId,
      checkoutRemarks,
      selectedPayment,
    } = req.body;

    const findPendingCustomer = await Cart.findAll({
      include: [
        {
          model: Product_Inventory,
          required: true,
        },
      ],
      where: {
        order_transaction_id: transactionOrderId,
      },
    });

    const findOrderTransac = await Order_Transaction.findOne({
      where: {
        order_transaction_id: transactionOrderId,
      },
    });

    if (findPendingCustomer) {
      if (selectedPayment === "CARD") {
        const currentDate = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Manila",
        });

        const findStudent = await Student_Balance.findOne({
          where: {
            student_id: IdStudent,
          },
        });

        if (findStudent) {
          const balance = findStudent.balance;
          await findStudent.update({ balance: balance - subtotal });
        }

        for (const items of cart) {
          const existingCartItem = await Cart.findOne({
            where: {
              order_transaction_id: transactionOrderId,
              product_inventory_id: items.product_inventory_id,
            },
          });

          if (existingCartItem) {
            // Update the existing cart item
            await Cart.update(
              {
                quantity: items.quantity,
                subtotal: items.subtotal,
                purchased_amount: items.price,
              },
              {
                where: {
                  order_transaction_id: transactionOrderId,
                  product_inventory_id: items.product_inventory_id,
                },
              }
            );
          } else {
            // Insert a new cart item if it doesn't exist
            const newCart = await Cart.create({
              order_transaction_id: transactionOrderId,
              quantity: items.quantity,
              subtotal: items.subtotal,
              product_inventory_id: items.product_inventory_id,
              purchased_amount: items.price,
            });

            const variantIds = items.variantKey.split("-");
            const variantPrices = items.eachVariantPrice.map(
              (variant) => variant.variant_price
            );

            for (let i = 0; i < variantIds.length; i++) {
              const variantId = variantIds[i];
              const variantPrice = variantPrices[i];

              if (variantId) {
                await Cart_Specification_Variant.create({
                  cart_id: newCart.transaction_id,
                  specification_variant_id: variantId,
                  variant_price: variantPrice,
                });
              }
            }
          }

          const invData = await Product_Inventory.findOne({
            where: {
              product_inventory_id: items.product_inventory_id,
            },
          });

          if (invData) {
            const newQuantity = invData.quantity - items.quantity;
            await invData.update({
              quantity: newQuantity,
            });
          }
        }

        await findOrderTransac.update({
          payable_amount: subtotal,
          received_amount: received,
          change_amount: change,
          payment_method: "CARD",
          purchased_balance: findStudent.balance + subtotal,
          student_id: findStudent.student_id,
          masterlist_id: userId,
          status: "Ordered",
          date_checkout: new Date(currentDate),
          remarks: checkoutRemarks,
        });

        if (findOrderTransac) {
          await Balance_History.create({
            order_transaction_id: findOrderTransac.order_transaction_id,
            student_id: findStudent.student_id,
            old_balance: findStudent.balance,
            new_balance: findStudent.balance - subtotal,
          });
        }
      } else {
        for (const items of cart) {
          const existingCartItem = await Cart.findOne({
            where: {
              order_transaction_id: transactionOrderId,
              product_inventory_id: items.product_inventory_id,
            },
          });

          if (existingCartItem) {
            // Update the existing cart item
            await Cart.update(
              {
                quantity: items.quantity,
                subtotal: items.subtotal,
                purchased_amount: items.price,
              },
              {
                where: {
                  order_transaction_id: transactionOrderId,
                  product_inventory_id: items.product_inventory_id,
                },
              }
            );
          } else {
            // Insert a new cart item if it doesn't exist
            const newCart = await Cart.create({
              order_transaction_id: transactionOrderId,
              quantity: items.quantity,
              subtotal: items.subtotal,
              product_inventory_id: items.product_inventory_id,
              purchased_amount: items.price,
            });

            const variantIds = items.variantKey.split("-");
            const variantPrices = items.eachVariantPrice.map(
              (variant) => variant.variant_price
            );

            for (let i = 0; i < variantIds.length; i++) {
              const variantId = variantIds[i];
              const variantPrice = variantPrices[i];

              await Cart_Specification_Variant.create({
                cart_id: newCart.transaction_id,
                specification_variant_id: variantId,
                variant_price: variantPrice,
              });
            }
          }

          const invData = await Product_Inventory.findOne({
            where: {
              product_inventory_id: items.product_inventory_id,
            },
          });

          if (invData) {
            const newQuantity = invData.quantity - items.quantity;
            await invData.update({
              quantity: newQuantity,
            });
          }
        }
        if (findOrderTransac) {
          const currentDate = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Manila",
          });
          await findOrderTransac.update({
            payable_amount: subtotal,
            received_amount: received,
            change_amount: change,
            payment_method: "CASH",
            masterlist_id: userId,
            status: "Ordered",
            date_checkout: new Date(currentDate),
            remarks: checkoutRemarks,
          });
        }
      }
    }

    res.status(200).json({});
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});
//route nung order na galing sa order records at nagdagdag order

//route sa pagcheck out ni cashier galing sa order records
router.route("/checkoutOrderRecord").post(async (req, res) => {
  try {
    const {
      columnTransacId,
      selectedPayment,
      subtotal,
      received,
      change,
      userId,
      IdStudent,
      checkoutRemarks,
    } = req.body;

    const findPendingCart = await Cart.findAll({
      include: [
        {
          model: Product_Inventory,
          required: true,
        },
      ],
      where: {
        order_transaction_id: columnTransacId,
      },
    });

    const findOrderTransac = await Order_Transaction.findOne({
      where: {
        order_transaction_id: columnTransacId,
      },
    });

    if (findPendingCart) {
      if (selectedPayment === "CARD") {
        const currentDate = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Manila",
        });

        const findStudent = await Student_Balance.findOne({
          where: {
            student_id: IdStudent,
          },
        });

        if (findStudent) {
          const balance = findStudent.balance;
          await findStudent.update({ balance: balance - subtotal });
        }

        for (const cart of findPendingCart) {
          const cartQTY = cart.quantity;
          const invQTY = cart.product_inventory.quantity;

          const newQuantity = invQTY - cartQTY;

          await Product_Inventory.update(
            { quantity: newQuantity },
            { where: { product_inventory_id: cart.product_inventory_id } }
          );
        }

        await findOrderTransac.update({
          payable_amount: subtotal,
          received_amount: received,
          change_amount: change,
          payment_method: "CARD",
          purchased_balance: findStudent.balance + subtotal,
          student_id: findStudent.student_id,
          masterlist_id: userId,
          status: "Ordered",
          date_checkout: new Date(currentDate),
          remarks: checkoutRemarks,
        });

        if (findOrderTransac) {
          await Balance_History.create({
            order_transaction_id: findOrderTransac.order_transaction_id,
            student_id: findStudent.student_id,
            old_balance: findStudent.balance,
            new_balance: findStudent.balance - subtotal,
          });
        }
      } else {
        for (const cart of findPendingCart) {
          const cartQTY = cart.quantity;
          const invQTY = cart.product_inventory.quantity;

          const newQuantity = invQTY - cartQTY;

          await Product_Inventory.update(
            { quantity: newQuantity },
            { where: { product_inventory_id: cart.product_inventory_id } }
          );
        }

        if (findOrderTransac) {
          const currentDate = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Manila",
          });
          await findOrderTransac.update({
            payable_amount: subtotal,
            received_amount: received,
            change_amount: change,
            payment_method: "CASH",
            masterlist_id: userId,
            status: "Ordered",
            date_checkout: new Date(currentDate),
            remarks: checkoutRemarks,
          });
        }
      }
    }

    
    res.status(200).send({ id: findOrderTransac.order_transaction_id });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});
//route sa pagcheck out ni cashier galing sa order records

//function sa pagfind ng manual input student number
router.route("/checkStudentNumber").post(async (req, res) => {
  try {
    const { studentNumber, subtotal } = req.body;

    const checkStudentNumber = await Student_Balance.findOne({
      include: [
        {
          model: Student,
          required: true,
          where: { student_number: studentNumber },
        },
      ],
    });

    if (checkStudentNumber) {
      const studentBalance = checkStudentNumber.balance;
      if (studentBalance < subtotal) {
        res.status(201).json({ message: "Insufficient Balance" });
      } else if (studentBalance >= subtotal) {
        const studentId = checkStudentNumber.student.student_id;
        res.status(200).json({ message: "Sufficient Balance", studentId });
      }
    } else {
      res.status(204).json({ message: "No Customer found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error" });
  }
});
//function sa pagfind ng manual input student number

//function sa pag pay at counter ni user sa kiosk
router.route("/orderProcess").post(async (req, res) => {
  try {
    const { cart, orderType, totalAmount, selectedPayment } = req.body;

    const currentDate = moment().tz("Asia/Manila").toDate();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const currentMonthDay = `${year}${month}${day}`;

    // Find the last order with the current date prefix
    const lastPayCode = await Order_Transaction.findOne({
      where: {
        order_number: {
          [Op.like]: `${currentMonthDay}K%`,
        },
      },
      order: [["createdAt", "DESC"]],
    });

    let newRefCode;
    if (lastPayCode && lastPayCode.order_number) {
      const latestRefCode = lastPayCode.order_number;
      const sequenceNumber = latestRefCode.slice(-4);
      const latestSequence = parseInt(sequenceNumber, 10);
      const newSequence = String(latestSequence + 1).padStart(4, "0");
      newRefCode = `${currentMonthDay}K${newSequence}`;
    } else {
      newRefCode = `${currentMonthDay}K0001`;
    }

    // Check if the newly may existing order
    let checkOrderNumber = await Order_Transaction.findOne({
      where: {
        order_number: newRefCode,
      },
    });

    // If it exists, increment again until a maging unique
    while (checkOrderNumber) {
      const sequenceNumber = newRefCode.slice(-4);
      const latestSequence = parseInt(sequenceNumber, 10);
      const newSequence = String(latestSequence + 1).padStart(4, "0");
      newRefCode = `${currentMonthDay}K${newSequence}`;

      checkOrderNumber = await Order_Transaction.findOne({
        where: {
          order_number: newRefCode,
        },
      });
    }

    const kioskNewOrder = await Order_Transaction.create({
      payable_amount: totalAmount,
      received_amount: 0,
      change_amount: 0,
      payment_method: selectedPayment,
      order_type: orderType || null,
      order_number: newRefCode,
      student_id: null,
      masterlist_id: null,
      status: "Pending-Customer",
      date_checkout: null,
      remarks: null,
      purchased_balance: null,
    });
    const orderTransactionId = kioskNewOrder.order_transaction_id;
    const orderNumber = kioskNewOrder.order_number;
    for (const item of cart) {
      const cartInsert = await Cart.create({
        quantity: item.quantity,
        subtotal: item.subtotal,
        product_inventory_id: item.product_inventory_id,
        order_transaction_id: orderTransactionId,
        purchased_amount: item.price,
      });

      if (cartInsert) {
        // Split the variantKey string into an array
        const variantIds = item.variantKey.split("-");
        const variantPrices = item.eachVariantPrice.map(
          (variant) => variant.variant_price
        );

        for (let i = 0; i < variantIds.length; i++) {
          const variantId = variantIds[i];
          const variantPrice = variantPrices[i];

          if (variantId) {
            await Cart_Specification_Variant.create({
              cart_id: cartInsert.transaction_id,
              specification_variant_id: variantId,
              variant_price: variantPrice,
            });
          }
        }
      }
    }
    res.status(200).json({ orderNumber });
  } catch (error) {
    res.status(500).send("An error occurred");
  }
});
//function sa pag pay at counter ni user sa kiosk

router.route("/checkoutProcessKioskCard").post(async (req, res) => {
  try {
    const { subtotal, orderNumber, orderType, rfidNum, orderTransacID } =
      req.body;

    const findStudent = await Student_Balance.findOne({
      include: [
        {
          model: Student,
          where: { rfid: rfidNum },
        },
      ],
    });

    const findOrder = await Cart.findAll({
      where: { order_transaction_id: orderTransacID },
    });

    for (const order of findOrder) {
      const { product_inventory_id, quantity } = order;

      const productInventory = await Product_Inventory.findOne({
        where: { product_inventory_id: product_inventory_id },
      });

      if (productInventory) {
        productInventory.quantity -= quantity;
        await productInventory.save();
      }
    }

    if (findStudent) {
      const currentDate = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Manila",
      });

      const balance = findStudent.balance;
      await findStudent.update({ balance: balance - subtotal });

      const orderTransac = await Order_Transaction.findOne({
        where: {
          order_number: orderNumber,
        },
      });

      await orderTransac.update({
        payable_amount: subtotal,
        received_amount: subtotal,
        payment_method: "CARD",
        student_id: findStudent.student_id,
        date_checkout: new Date(currentDate),
        status: "Ordered",
      });

      if (orderTransac) {
        await Balance_History.create({
          order_transaction_id: orderTransac.order_transaction_id,
          student_id: findStudent.student_id,
          old_balance: balance,
          new_balance: balance - subtotal,
        });
      }
    }

    res.status(200).json({});
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

router.route("/get-products").get(async (req, res) => {
  try {
    const data = await Product.findAll();

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Error");
  }
});

//route para sa customer
router.route("/add-cart").post(async (req, res) => {
  try {
    const { id, totalOrder, orderType, orderNumber } = req.body;

    const existingOrderNum = await Order_Transaction.findOne({
      where: {
        order_number: orderNumber,
        status: "Pending-Customer",
      },
    });

    const productInv = await Product_Inventory.findOne({
      where: {
        product_inventory_id: id,
      },
    });

    const price = productInv.price;
    const invQuantity = productInv.quantity;

    if (!existingOrderNum) {
      const orderTransacData = await Order_Transaction.create({
        payable_amount: totalOrder,
        received_amount: 0,
        change_amount: 0,
        order_type: orderType,
        order_number: orderNumber,
        status: "Pending-Customer",
      });

      if (orderTransacData) {
        await Cart.create({
          product_inventory_id: id,
          quantity: 1,
          subtotal: price,
          purchased_amount: price,
          order_transaction_id: orderTransacData.order_transaction_id,
        });

        res.status(200).send({ id: orderTransacData.order_transaction_id });
      }
    } else {
      const idOrderTransaction = existingOrderNum.order_transaction_id;

      const existingPendingCartItem = await Cart.findOne({
        where: {
          product_inventory_id: id,
          order_transaction_id: idOrderTransaction,
        },
      });

      if (existingPendingCartItem) {
        const updatedQty = existingPendingCartItem.quantity + 1;
        const updatedSubtotal = price * updatedQty;

        if (updatedQty > invQuantity) {
          return res.status(202).json({ id: idOrderTransaction });
        } else {
          await existingPendingCartItem.update({
            quantity: updatedQty,
            subtotal: updatedSubtotal,
          });

          await existingOrderNum.update({
            payable_amount: totalOrder,
          });
        }
      } else {
        await Cart.create({
          product_inventory_id: id,
          quantity: 1,
          subtotal: price,
          purchased_amount: price,
          order_transaction_id: idOrderTransaction,
        });
      }

      res.status(200).send({ id: idOrderTransaction });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Error");
  }
});

//route para sa cashier
router.route("/add-cart-cashier").post(async (req, res) => {
  try {
    const { id, totalOrder, orderType, orderNumber, userId } = req.body;

    const existingOrderNum = await Order_Transaction.findOne({
      where: {
        order_number: orderNumber,
        masterlist_id: userId,
        status: "Pending",
      },
    });

    const productInv = await Product_Inventory.findOne({
      where: {
        product_inventory_id: id,
      },
    });

    const price = productInv.price;
    const invQuantity = productInv.quantity;

    if (!existingOrderNum) {
      const orderTransacData = await Order_Transaction.create({
        payable_amount: totalOrder,
        received_amount: 0,
        change_amount: 0,
        order_type: orderType,
        order_number: orderNumber,
        status: "Pending",
        masterlist_id: userId,
      });

      if (orderTransacData) {
        await Cart.create({
          product_inventory_id: id,
          quantity: 1,
          subtotal: price,
          purchased_amount: price,
          order_transaction_id: orderTransacData.order_transaction_id,
        });
        const counter = await Order_Counter.findByPk(1);

        const currentCounter = parseInt(counter.counter, 10);
        const increment = currentCounter + 1;
        const incrementedCounter = String(increment).padStart(3, "0");

        await counter.update({ counter: incrementedCounter });
        res.status(200).send({ id: orderTransacData.order_transaction_id });
      }
    } else {
      const idOrderTransaction = existingOrderNum.order_transaction_id;

      const existingPendingCartItem = await Cart.findOne({
        where: {
          product_inventory_id: id,
          order_transaction_id: idOrderTransaction,
        },
      });

      if (existingPendingCartItem) {
        const updatedQty = existingPendingCartItem.quantity + 1;
        const updatedSubtotal = price * updatedQty;

        if (updatedQty > invQuantity) {
          return res
            .status(202)
            .json({ message: "Not enough quantity", id: idOrderTransaction });
        } else {
          await existingPendingCartItem.update({
            quantity: updatedQty,
            subtotal: updatedSubtotal,
          });

          await existingOrderNum.update({
            payable_amount: totalOrder,
          });
        }
      } else {
        await Cart.create({
          product_inventory_id: id,
          quantity: 1,
          subtotal: price,
          order_transaction_id: idOrderTransaction,
          purchased_amount: price,
        });
      }

      res.status(200).send({ id: idOrderTransaction });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Error");
  }
});

//start ng cart with specification
router.route("/add-cart-cashier-with-specification").post(async (req, res) => {
  try {
    const {
      productInventoryId,
      orderType,
      orderNumber,
      userId,
      selectedVariants,
      selectedPrices,
    } = req.body;

    // Debug logging
    console.log("Received selectedVariants:", selectedVariants);
    console.log("Received selectedPrices:", selectedPrices);

    // Ensure selectedPrices is an array
    if (!Array.isArray(selectedPrices)) {
      return res.status(400).json({ message: "Invalid selectedPrices format" });
    }

    const existingOrderNum = await Order_Transaction.findOne({
      where: {
        order_number: orderNumber,
        masterlist_id: userId,
        status: "Pending",
      },
    });

    const productInv = await Product_Inventory.findOne({
      where: {
        product_inventory_id: productInventoryId,
      },
    });

    const invPrice = productInv.price;
    const invQuantity = productInv.quantity;

    if (!existingOrderNum) {
      const orderTransacData = await Order_Transaction.create({
        payable_amount: 0,
        received_amount: 0,
        change_amount: 0,
        order_type: orderType,
        order_number: orderNumber,
        status: "Pending",
        masterlist_id: userId,
      });

      if (orderTransacData) {
        const NewCart = await Cart.create({
          product_inventory_id: productInventoryId,
          quantity: 1,
          subtotal:
            invPrice + selectedPrices.reduce((acc, price) => acc + price, 0), // Sum of all prices
          order_transaction_id: orderTransacData.order_transaction_id,
        });

        const cartId = NewCart.transaction_id;

        for (let i = 0; i < selectedVariants.length; i++) {
          await Cart_Specification_Variant.create({
            cart_id: cartId,
            specification_variant_id: selectedVariants[i],
          });
        }
        const counter = await Order_Counter.findByPk(1);

        const currentCounter = parseInt(counter.counter, 10);
        const increment = currentCounter + 1;
        const incrementedCounter = String(increment).padStart(3, "0");

        await counter.update({ counter: incrementedCounter });
        return res
          .status(200)
          .send({ id: orderTransacData.order_transaction_id });
      }
    } else {
      const idOrderTransaction = existingOrderNum.order_transaction_id;

      // Find existing cart item with the same product
      const existingCartItem = await Cart.findOne({
        where: {
          product_inventory_id: productInventoryId,
          order_transaction_id: idOrderTransaction,
        },
      });

      if (existingCartItem) {
        // Check if all specifications match
        const cartSpecifications = await Cart_Specification_Variant.findAll({
          where: {
            cart_id: existingCartItem.transaction_id,
          },
        });

        const allSpecificationsMatch =
          cartSpecifications.length === selectedVariants.length &&
          cartSpecifications.every((spec) =>
            selectedVariants.includes(spec.specification_variant_id)
          );

        if (allSpecificationsMatch) {
          // Update existing cart item
          const updatedQty = existingCartItem.quantity + 1;
          if (updatedQty > invQuantity) {
            return res.status(202).json({ message: "Not enough quantity" });
          }
          const newSubTotal =
            (invPrice + selectedPrices.reduce((acc, price) => acc + price, 0)) *
            updatedQty;
          await existingCartItem.update({
            quantity: updatedQty,
            subtotal: newSubTotal,
          });
        } else {
          // Create new cart item with different specifications
          await createNewCartItem(
            idOrderTransaction,
            productInventoryId,
            invPrice,
            selectedVariants,
            selectedPrices
          );
        }
      } else {
        // Create new cart item
        await createNewCartItem(
          idOrderTransaction,
          productInventoryId,
          invPrice,
          selectedVariants,
          selectedPrices
        );
      }

      return res.status(200).send({ id: idOrderTransaction });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Error");
  }
});

// For customer with Specification
router.route("/add-cart-customer-with-specification").post(async (req, res) => {
  try {
    const {
      productInventoryId,
      orderType,
      orderNumber,
      // userId,
      selectedVariants,
      selectedPrices,
    } = req.body;

    // Ensure selectedPrices is an array
    if (!Array.isArray(selectedPrices)) {
      return res.status(400).json({ message: "Invalid selectedPrices format" });
    }

    const existingOrderNum = await Order_Transaction.findOne({
      where: {
        order_number: orderNumber,
        status: "Pending-Customer",
      },
    });

    const productInv = await Product_Inventory.findOne({
      where: {
        product_inventory_id: productInventoryId,
      },
    });

    const invPrice = productInv.price;
    const invQuantity = productInv.quantity;

    if (!existingOrderNum) {
      const orderTransacData = await Order_Transaction.create({
        payable_amount: 0,
        received_amount: 0,
        change_amount: 0,
        order_type: orderType,
        order_number: orderNumber,
        status: "Pending-Customer",
      });

      if (orderTransacData) {
        const NewCart = await Cart.create({
          product_inventory_id: productInventoryId,
          quantity: 1,
          subtotal:
            invPrice + selectedPrices.reduce((acc, price) => acc + price, 0), // Sum of all prices
          order_transaction_id: orderTransacData.order_transaction_id,
          purchased_amount:
            invPrice + selectedPrices.reduce((acc, price) => acc + price, 0),
        });

        const cartId = NewCart.transaction_id;

        for (let i = 0; i < selectedVariants.length; i++) {
          await Cart_Specification_Variant.create({
            cart_id: cartId,
            specification_variant_id: selectedVariants[i],
          });
        }
        const counter = await Order_Counter.findByPk(1);

        const currentCounter = parseInt(counter.counter, 10);
        const increment = currentCounter + 1;
        const incrementedCounter = String(increment).padStart(3, "0");

        await counter.update({ counter: incrementedCounter });
        return res
          .status(200)
          .send({ id: orderTransacData.order_transaction_id });
      }
    } else {
      const idOrderTransaction = existingOrderNum.order_transaction_id;

      // Find existing cart item with the same product
      const existingCartItem = await Cart.findOne({
        where: {
          product_inventory_id: productInventoryId,
          order_transaction_id: idOrderTransaction,
        },
      });

      if (existingCartItem) {
        // Check if all specifications match
        const cartSpecifications = await Cart_Specification_Variant.findAll({
          where: {
            cart_id: existingCartItem.transaction_id,
          },
        });

        const allSpecificationsMatch =
          cartSpecifications.length === selectedVariants.length &&
          cartSpecifications.every((spec) =>
            selectedVariants.includes(spec.specification_variant_id)
          );

        if (allSpecificationsMatch) {
          // Update existing cart item
          const updatedQty = existingCartItem.quantity + 1;
          if (updatedQty > invQuantity) {
            return res.status(202).json({ message: "Not enough quantity" });
          }
          const newSubTotal =
            (invPrice + selectedPrices.reduce((acc, price) => acc + price, 0)) *
            updatedQty;
          await existingCartItem.update({
            quantity: updatedQty,
            subtotal: newSubTotal,
          });
        } else {
          // Create new cart item with different specifications
          await createNewCartItem(
            idOrderTransaction,
            productInventoryId,
            invPrice,
            selectedVariants,
            selectedPrices
          );
        }
      } else {
        // Create new cart item
        await createNewCartItem(
          idOrderTransaction,
          productInventoryId,
          invPrice,
          selectedVariants,
          selectedPrices
        );
      }

      return res.status(200).send({ id: idOrderTransaction });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Error");
  }
});

async function createNewCartItem(
  idOrderTransaction,
  productInventoryId,
  invPrice,
  selectedVariants,
  selectedPrices
) {
  const newCart = await Cart.create({
    product_inventory_id: productInventoryId,
    quantity: 1,
    subtotal: invPrice + selectedPrices.reduce((acc, price) => acc + price, 0),
    purchased_amount:
      invPrice + selectedPrices.reduce((acc, price) => acc + price, 0),
    order_transaction_id: idOrderTransaction,
  });

  for (let i = 0; i < selectedVariants.length; i++) {
    await Cart_Specification_Variant.create({
      cart_id: newCart.transaction_id,
      specification_variant_id: selectedVariants[i],
    });
  }
}

//end ng cart with specification

//plus button function sa pag add ng quantity sa cart
router.route("/add-cart-plusbutton").put(async (req, res) => {
  try {
    const { cartId } = req.body;

    const findCart = await Cart.findOne({
      where: {
        transaction_id: cartId,
      },
    });

    if (findCart) {
      const idOrderTransaction = findCart.order_transaction_id;

      const prodinvId = findCart.product_inventory_id;
      const updatedQty = findCart.quantity + 1; //for new cart quantity
      const subtotalCart = findCart.subtotal;

      const InventoryProd = await Product_Inventory.findOne({
        where: {
          product_inventory_id: prodinvId,
        },
      });

      const invQuantity = InventoryProd.quantity; //inventory quantity
      const productPrice = InventoryProd.price;
      const subtotalNew = subtotalCart + productPrice; //sum sa walang specification

      const cartSpecifications = await Cart_Specification_Variant.findAll({
        where: {
          cart_id: cartId,
        },
        include: [
          {
            model: Specification_Variant,
            required: true,
          },
        ],
      });

      if (!cartSpecifications) {
        if (updatedQty > invQuantity) {
          return res.status(202).json({ message: "Not enough quantity" });
        } else {
          await findCart.update({
            quantity: updatedQty,
            subtotal: subtotalNew,
          });
        }
      } else {
        const variantPrices = cartSpecifications.map(
          (specVariant) => specVariant.specification_variant.variant_price
        );
        const totalVariantPrice = variantPrices.reduce(
          (acc, price) => acc + price,
          0
        );
        const specificationSubtotal =
          subtotalCart + totalVariantPrice + productPrice;
        if (updatedQty > invQuantity) {
          return res.status(202).json({ message: "Not enough quantity" });
        } else {
          await findCart.update({
            quantity: updatedQty,
            subtotal: specificationSubtotal,
          });
        }
      }
      return res.status(200).send({ id: idOrderTransaction });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
//end ng plus button sa pag add ng quantity sa cart

//start sa pagminus ng quantity sa cart
router.route("/subtract-qty").put(async (req, res) => {
  try {
    const { cartId } = req.body;

    const findCart = await Cart.findOne({
      where: {
        transaction_id: cartId,
      },
    });

    if (findCart) {
      const idOrderTransaction = findCart.order_transaction_id;

      const prodinvId = findCart.product_inventory_id;
      const existingCartQTY = findCart.quantity;
      const updatedQty = findCart.quantity - 1; //for decrease new cart quantity
      const subtotalCart = findCart.subtotal;

      const InventoryProd = await Product_Inventory.findOne({
        where: {
          product_inventory_id: prodinvId,
        },
      });

      const productPrice = InventoryProd.price;
      const subtotalNew = subtotalCart - productPrice; //minus sa walang specification

      const cartSpecifications = await Cart_Specification_Variant.findAll({
        where: {
          cart_id: cartId,
        },
        include: [
          {
            model: Specification_Variant,
            required: true,
          },
        ],
      });

      if (cartSpecifications.length === 0) {
        if (existingCartQTY - 1 <= 0) {
          await findCart.destroy();
        } else {
          await findCart.update({
            quantity: updatedQty,
            subtotal: subtotalNew,
          });
        }
      } else {
        const variantPrices = cartSpecifications.map(
          (specVariant) => specVariant.specification_variant.variant_price
        );
        const totalVariantPrice = variantPrices.reduce(
          (acc, price) => acc + price,
          0
        );
        const specificationSubtotal =
          subtotalCart - totalVariantPrice - productPrice;

        if (existingCartQTY - 1 <= 0) {
          const deleteSpecs = await Cart_Specification_Variant.destroy({
            where: {
              cart_id: cartId,
            },
          });
          if (deleteSpecs) {
            await findCart.destroy();
          }
        } else {
          await findCart.update({
            quantity: updatedQty,
            subtotal: specificationSubtotal,
          });
        }
      }
      return res.status(200).send({ id: idOrderTransaction });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
//end ng function sa pagminus ng quantity sa cart

//function ng pagdelete sa cart
router.route("/delete-cart").put(async (req, res) => {
  try {
    const { cartId } = req.body;

    const findCart = await Cart.findOne({
      where: {
        transaction_id: cartId,
      },
    });

    if (findCart) {
      const idOrderTransaction = findCart.order_transaction_id;

      const cartSpecifications = await Cart_Specification_Variant.findAll({
        where: {
          cart_id: cartId,
        },
      });

      if (cartSpecifications.length === 0) {
        await findCart.destroy();
      } else {
        await Cart_Specification_Variant.destroy({
          where: {
            cart_id: cartId,
          },
        });
        await findCart.destroy();
      }

      return res.status(200).send({ id: idOrderTransaction });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Error");
  }
});
//end function ng pagdelete sa cart

//back home function delete the data
router.route("/deletebackhome").put(async (req, res) => {
  try {
    const { transacID } = req.body;

    const findOrderTransaction = await Cart.findAll({
      where: {
        order_transaction_id: transacID,
      },
    });

    const cartIds = findOrderTransaction.map((cart) => cart.transaction_id);

    const checkSpecs = await Cart_Specification_Variant.findAll({
      where: {
        cart_id: cartIds,
      },
    });

    if (checkSpecs.length === 0) {
      await Cart.destroy({
        where: {
          transaction_id: cartIds,
        },
      });

      await Order_Transaction.destroy({
        where: {
          order_transaction_id: transacID,
        },
      });
    } else {
      await Cart_Specification_Variant.destroy({
        where: {
          cart_id: cartIds,
        },
      });

      await Cart.destroy({
        where: {
          transaction_id: cartIds,
        },
      });

      await Order_Transaction.destroy({
        where: {
          order_transaction_id: transacID,
        },
      });
    }

    res.status(200).json("Deletion successful");
  } catch (error) {
    console.error(error);
    res.status(500).json("Error");
  }
});
//back home function delete the data

router
  .route("/checkoutCashierUpdate/:order_transaction_id")
  .put(async (req, res) => {
    try {
      const id = req.params.order_transaction_id;
      const userId = req.query.userId;

      const findTransactionData = await Order_Transaction.findOne({
        where: {
          order_transaction_id: id,
        },
      });

      if (findTransactionData) {
        const currentDate = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Manila",
        });
        await findTransactionData.update({
          status: "Ordered",
          masterlist_id: userId,
          date_checkout: new Date(currentDate),
        });
        res.status(200).json("Transaction updated successfully");
      } else {
        res.status(404).json("Transaction not found");
      }
    } catch (error) {
      console.error(error);
      res.status(500).json("Error");
    }
  });

//fetching ng add to cart
router.route("/get-cart/:transacID").get(async (req, res) => {
  try {
    const { transacID } = req.params;
    const cartItems = await Cart.findAll({
      where: {
        order_transaction_id: transacID,
      },
      include: [
        {
          model: Product_Inventory,
          required: true,
          include: [
            {
              model: Category_Product,
              required: true,
              include: [
                {
                  model: Category,
                  required: true,
                },
                {
                  model: Product,
                  required: true,
                },
              ],
            },
          ],
        },
        {
          model: Cart_Specification_Variant,
          required: false,
          include: [
            {
              model: Specification_Variant,
              required: true,
            },
          ],
        },
      ],
    });

    return res.json(cartItems);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Error");
  }
});

//end ng fetching sa add to cart

router.route("/cancel-transac-order/:id").put(async (req, res) => {
  try {
    const { id } = req.params;

    const findTransac = await Order_Transaction.findOne({
      where: {
        order_transaction_id: id,
      },
    });

    if (findTransac) {
      findTransac.update({
        status: "Cancelled",
      });
    }

    res.status(200).send({ message: "cancelled" });
  } catch (error) {
    console.error(error);
    return res.status(500).json("Error");
  }
});

router.route("/get-transac").get(async (req, res) => {
  try {
    const { transacID } = req.query;
    const cartItems = await Order_Transaction.findOne({
      where: {
        order_transaction_id: transacID,
      },
    });

    return res.json(cartItems);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Error");
  }
});

//fetching ng mga category sa ordering menu
router.route("/category-product").get(async (req, res) => {
  try {
    const data = await Category.findAll();

    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Error");
  }
});

//fetching ng mga product sa menu kapag nakaselect sa category
// router.route("/getProductInventory").get(async (req, res) => {
//   try {
//     const data = await Category_Product.findAll({
//       include: [
//         {
//           model: Product,
//           required: true,
//           include: [
//             {
//               model: Product_Inventory,
//               required: false,
//               where: {
//                 quantity: {
//                   [Op.ne]: 0,
//                 },
//               },
//             },
//             {
//               model: Category_Product_Specification,
//               required: false,
//               include: [
//                 {
//                   model: Specification_Main,
//                   include: [
//                     {
//                       model: Specification_Variant,
//                       where: {
//                         status: 1
//                       }
//                     },
//                   ],
//                 },
//               ],
//             },
//           ],
//           where: {
//             is_archived: 0,
//           },
//         },

//         {
//           model: Category,
//           required: true,
//         },
//       ],
//       where: {
//         category_id: req.query.Idcategory,
//         status: "Active",
//       },
//     });
//     return res.json(data);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "An error occurred" });
//   }
// });

router.route("/getProductInventory").get(async (req, res) => {
  try {
    const data = await Product_Inventory.findAll({
      include: [
        {
          model: Product,
          required: true,
          where: {
            is_archived: 0,
          },
          include: [
            {
              model: Category_Product,
              required: true,
              where: {
                category_id: req.query.Idcategory,
                status: "Active",
              },
            },
            {
              model: Category_Product_Specification,
              required: false,
              include: [
                {
                  model: Specification_Main,
                  include: [
                    {
                      model: Specification_Variant,
                      where: {
                        status: 1,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      where: {
        quantity: {
          [Op.ne]: 0,
        },
      },
    });
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});
module.exports = router;
