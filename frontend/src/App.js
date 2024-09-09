import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Roles from "./hooks/roles"; // auth fetch
import Login from "./modules/Login/login";

import Dashboard from "./modules/Dashboard/dashboard";
// import ForgotPass from "./modules/Forgot Password/sub-modules/fgpass";
// import OTP from "./modules/Forgot Password/sub-modules/otp";
// import ConfirmPass from "./modules/Forgot Password/sub-modules/cpass";
import ProductCategoryMain from "./modules/ProductCategory/ProductCategoryManagement.jsx";
import ProductCategory from "./modules/ProductCategory/ProductCategory.jsx";
import ProductManagement from "./modules/Product/ProductManagement";

import Sidebar from "./modules/Sidebar/sidebar";

import Layout from "./layout/layout.jsx";

// import { DataProvider } from "./modules/Forgot Password/sub-modules/data/dataPost";
import ProtectedRoutes from "./hooks/protectedRoute";
import Menu from "./modules/Menu/Menu.jsx";
import AddStocks from "./modules/Inventory/AddStocks.jsx";
import OutboundStocks from "./modules/Inventory/OutboundStocks.jsx";
import StockCounting from "./modules/Inventory/StockCounting.jsx";
import UserManagement from "./modules/UserManagement/UserManagement.jsx";
import UserRole from "./modules/UserManagement/UserRole.jsx";
import CreateUserRole from "./modules/UserManagement/Rbac/create-role.jsx";
import UpdateUserRole from "./modules/UserManagement/Rbac/update-role.jsx";
import OrderCheckOut from "./modules/Ordering/OrderCheckOut.jsx";
import CashierCheckout from "./modules/Ordering/CashierCheckout.jsx";
import Ordering from "./modules/Ordering/Ordering.jsx";
import UserTransaction from "./modules/UserManagement/UserTransaction.jsx";
import EmployeeList from "./modules/UserManagement/EmployeeList.jsx";
import InventoryStock from "./modules/Inventory/InventoryStock.jsx";
import ArchiveProduct from "./modules/ProductCategory/ArchiveProduct.jsx";
import RawMaterials from "./modules/ProductCategory/RawMaterials.jsx";
import _Sidebar from "./modules/Sidebar/_Sidebar.jsx";
// Navs
import {
  inventoryNav,
  menuNav,
  productNav,
  reportsNav,
  settingsNav,
  userNav,
} from "./modules/Sidebar/navs.js";
import Cookbook from "./modules/ProductCategory/Cookbook.jsx";
import EReceipts from "./modules/E-Receipts/EReceipts.jsx";
import Kiosk from "./modules/Kiosk/Kiosk.jsx";
import Nfc from "./modules/NFC/Nfc.jsx";
import InventoryReports from "./modules/Reports/InventoryReports.jsx";
import PosReports from "./modules/Reports/PosReports.jsx";
import RfidReports from "./modules/Reports/RfidReports.jsx";
import StudentReports from "./modules/Reports/StudentReports.jsx";
import StudentReportDetails from "./modules/Reports/StudentReportDetails.jsx";
import MenuProfile from "./modules/Settings/MenuProfile.jsx";
import LoyaltyPoints from "./modules/Settings/LoyaltyPoints.jsx";
import LossBack from "./modules/Settings/LossBack.jsx";
import ProductExtraOptions from "./modules/Settings/ProductExtraOptions.jsx";
import CustomizeReceipt from "./modules/Settings/CustomizeReceipt.jsx";
import HardwareSettings from "./modules/Settings/HardwareSettings.jsx";
import CustomerDisplay from "./modules/CustomerDisplay/CustomerDisplay.jsx";

import MainScreen from "./modules/Kiosk/MainScreen.jsx";
import OrderNumber from "./modules/Kiosk/OrderNumber.jsx";
import OrderSummary from "./modules/Kiosk/OrderSummary.jsx";
import OrderType from "./modules/Kiosk/OrderType.jsx";
import PaymentMethod from "./modules/Kiosk/PaymentMethod.jsx";
import KioskTapCard from "./modules/Kiosk/KioskTapCard.jsx";
import KioskCheckBal from "./modules/Kiosk/KioskCheckBal.jsx";
import BulkLoadReports from "./modules/Reports/BulkLoadReports.jsx";
import RawMaterialReport from "./modules/Reports/RawMaterialReport.jsx";
import StoreOperateReports from "./modules/Reports/StoreOperateReports.jsx";
import TestPrintReceipt from "./modules/Settings/TestPrintReceipt.jsx";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* <Route path="/" element={<Login />} /> */}
          <Route path="/" element={<Login />} />
          {/* <Route path="/forgotpass" element={<ForgotPass />} />
            <Route path="/OTP" element={<OTP />} />
            <Route path="/ConfirmPassword/:email?" element={<ConfirmPass />} /> */}
        </Routes>

        <ProtectedRoutes>
          <Routes>
            <Route
              path="/menu"
              element={
                <Roles>{(authrztn) => <Menu authrztn={authrztn} />}</Roles>
              }
            />
            <Route element={<Layout />}>
              {/* <Route
                path="/productManagement"
                element={<ProductManagement />}
              />

              <Route
                path="/productCategoryMain"
                element={<ProductCategoryMain />}
              /> */}

              {/* Menu Nav  */}
              {/* <Route element={<_Sidebar links={menuNav} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/e-receipts" element={<EReceipts />} />
              </Route> */}

              {/* Inventory */}
              {/* <Route element={<_Sidebar links={inventoryNav} />}> */}
              <Route
                path="/productManagement"
                element={<ProductManagement />}
              />

              <Route
                path="/productCategoryMain"
                element={<ProductCategoryMain />}
              />

              {/* Menu Nav  */}
              <Route element={<_Sidebar links={menuNav} />}>
                <Route
                  path="/dashboard"
                  element={
                    <Roles>
                      {(authrztn) => <Dashboard authrztn={authrztn} />}
                    </Roles>
                  }
                />
                <Route
                  path="/e-receipts"
                  element={
                    <Roles>
                      {(authrztn) => <EReceipts authrztn={authrztn} />}
                    </Roles>
                  }
                />
              </Route>

              {/* Inventory */}
              <Route element={<_Sidebar links={inventoryNav} />}>
                <Route
                  path="/inventory-stocks"
                  element={
                    <Roles>
                      {(authrztn) => <InventoryStock authrztn={authrztn} />}
                    </Roles>
                  }
                />
                <Route
                  path="/add-stocks"
                  element={
                    <Roles>
                      {(authrztn) => <AddStocks authrztn={authrztn} />}
                    </Roles>
                  }
                />
                <Route
                  path="/out-bound-stocks"
                  element={
                    <Roles>
                      {(authrztn) => <OutboundStocks authrztn={authrztn} />}
                    </Roles>
                  }
                />
                <Route
                  path="/stock-counting"
                  element={
                    <Roles>
                      {(authrztn) => <StockCounting authrztn={authrztn} />}
                    </Roles>
                  }
                />
              </Route>
              {/* Product */}
              <Route element={<_Sidebar links={productNav} />}>
                <Route
                  path="/product-category"
                  element={
                    <Roles>
                      {(authrztn) => <ProductCategory authrztn={authrztn} />}
                    </Roles>
                  }
                />
                <Route
                  path="/archive-product"
                  element={
                    <Roles>
                      {(authrztn) => <ArchiveProduct authrztn={authrztn} />}
                    </Roles>
                  }
                />
                <Route
                  path="/raw-materials"
                  element={
                    <Roles>
                      {(authrztn) => <RawMaterials authrztn={authrztn} />}
                    </Roles>
                  }
                />
                <Route
                  path="/cook-book"
                  element={
                    <Roles>
                      {(authrztn) => <Cookbook authrztn={authrztn} />}
                    </Roles>
                  }
                />
              </Route>
              {/* Reports */}
              <Route element={<_Sidebar links={reportsNav} />}>
                <Route
                  path="/inventory-reports"
                  element={
                    <Roles>
                      {(authrztn) => <InventoryReports authrztn={authrztn} />}
                    </Roles>
                  }
                />
                <Route
                  path="/pos-reports"
                  element={
                    <Roles>
                      {(authrztn) => <PosReports authrztn={authrztn} />}
                    </Roles>
                  }
                />
                <Route
                  path="/rfid-reports"
                  element={
                    <Roles>
                      {(authrztn) => <RfidReports authrztn={authrztn} />}
                    </Roles>
                  }
                />

                <Route
                  path="/customer-reports"
                  element={
                    <Roles>
                      {(authrztn) => <StudentReports authrztn={authrztn} />}
                    </Roles>
                  }
                />
                <Route
                  path="/raw-materials-reports"
                  element={
                    <Roles>
                      {(authrztn) => <RawMaterialReport authrztn={authrztn} />}
                    </Roles>
                  }
                />
                <Route
                  path="/store-operation-reports"
                  element={
                    <Roles>
                      {(authrztn) => (
                        <StoreOperateReports authrztn={authrztn} />
                      )}
                    </Roles>
                  }
                />
                <Route
                  path="/bulk-load-reports"
                  element={
                    <Roles>
                      {(authrztn) => <BulkLoadReports authrztn={authrztn} />}
                    </Roles>
                  }
                />
                <Route
                  path="/customer-report-details/:name/:id"
                  element={<StudentReportDetails />}
                />
              </Route>
              {/* Settings */}
              <Route element={<_Sidebar links={settingsNav} />}>
                <Route
                  path="/menu-profile"
                  element={
                    <Roles>
                      {(authrztn) => <MenuProfile authrztn={authrztn} />}
                    </Roles>
                  }
                />
                <Route
                  path="/test-print"
                  element={
                    <Roles>
                      {(authrztn) => <TestPrintReceipt authrztn={authrztn} />}
                    </Roles>
                  }
                  // element={<TestPrintReceipt />}
                  // element={
                  //   <Roles>
                  //     {(authrztn) => <TestPrintReceipt authrztn={authrztn} />}
                  //   </Roles>
                  // }
                />

                <Route
                  path="/loyalty-points"
                  element={
                    <Roles>
                      {(authrztn) => <LoyaltyPoints authrztn={authrztn} />}
                    </Roles>
                  }
                />
                <Route
                  path="/loss-back"
                  element={
                    <Roles>
                      {(authrztn) => <LossBack authrztn={authrztn} />}
                    </Roles>
                  }
                />
                <Route
                  path="/product-extra-options"
                  element={
                    <Roles>
                      {(authrztn) => (
                        <ProductExtraOptions authrztn={authrztn} />
                      )}
                    </Roles>
                  }
                />
                <Route
                  path="/customize-receipt"
                  element={
                    <Roles>
                      {(authrztn) => <CustomizeReceipt authrztn={authrztn} />}
                    </Roles>
                  }
                />
                <Route
                  path="/hardware-settings"
                  element={
                    <Roles>
                      {(authrztn) => <HardwareSettings authrztn={authrztn} />}
                    </Roles>
                  }
                />
              </Route>
              {/* User  */}
              <Route element={<_Sidebar links={userNav} />}>
                <Route
                  path="/user-transaction"
                  element={
                    <Roles>
                      {(authrztn) => <UserTransaction authrztn={authrztn} />}
                    </Roles>
                  }
                />
                <Route
                  path="/user-management"
                  element={
                    <Roles>
                      {(authrztn) => <UserManagement authrztn={authrztn} />}
                    </Roles>
                  }
                />
                {/* <Route path="/emp-list" element={<Roles>
                        {(authrztn) => <EmployeeList authrztn={authrztn} />}
                      </Roles>< />} /> */}

                <Route
                  path="/emp-list"
                  element={
                    <Roles>
                      {(authrztn) => <EmployeeList authrztn={authrztn} />}
                    </Roles>
                  }
                />
                <Route
                  path="/user-role"
                  element={
                    <Roles>
                      {(authrztn) => <UserRole authrztn={authrztn} />}
                    </Roles>
                  }
                />
                <Route path="/create-user-role" element={<CreateUserRole />} />
                <Route
                  path="/update-user-role/:id"
                  element={<UpdateUserRole />}
                />
              </Route>

              {/* NFC */}
              {/* <Route
                  path="/nfc-load"
                  element={
                    <Roles>
                      {(authrztn) => <InventoryStock authrztn={authrztn} />}
                    </Roles>
                  }
                /> */}
              {/* <Route
                  path="/add-stocks"
                  element={
                    <Roles>
                      {(authrztn) => <AddStocks authrztn={authrztn} />}
                    </Roles>
                  }
                /> */}
              {/* <Route
                  path="/out-bound-stocks"
                  element={
                    <Roles>
                      {(authrztn) => <OutboundStocks authrztn={authrztn} />}
                    </Roles>
                  }
                /> */}
              {/* <Route
                  path="/stock-counting"
                  element={
                    <Roles>
                      {(authrztn) => <StockCounting authrztn={authrztn} />}
                    </Roles>
                  }
                /> */}
              {/* </Route> */}
              {/* Product */}
              {/* <Route element={<_Sidebar links={productNav} />}> */}
              <Route
                path="/product-category"
                element={
                  <Roles>
                    {(authrztn) => <ProductCategory authrztn={authrztn} />}
                  </Roles>
                }
              />
              {/* <Route
                  path="/archive-product"
                  element={
                    <Roles>
                      {(authrztn) => <ArchiveProduct authrztn={authrztn} />}
                    </Roles>
                  }
                /> */}
              {/* <Route
                  path="/raw-materials"
                  element={
                    <Roles>
                      {(authrztn) => <RawMaterials authrztn={authrztn} />}
                    </Roles>
                  }
                /> */}
              {/* <Route
                  path="/cook-book"
                  element={
                    <Roles>
                      {(authrztn) => <Cookbook authrztn={authrztn} />}
                    </Roles>
                  }
                /> */}
              {/* </Route> */}
              {/* Reports */}
              {/* <Route element={<_Sidebar links={reportsNav} />}> */}
              {/* <Route
                path="/inventory-reports"
                element={
                  <Roles>
                    {(authrztn) => <InventoryReports authrztn={authrztn} />}
                  </Roles>
                }
              /> */}
              {/* <Route
                path="/pos-reports"
                element={
                  <Roles>
                    {(authrztn) => <PosReports authrztn={authrztn} />}
                  </Roles>
                }
              /> */}
              {/* <Route
                path="/rfid-reports"
                element={
                  <Roles>
                    {(authrztn) => <RfidReports authrztn={authrztn} />}
                  </Roles>
                }
              /> */}

              {/* <Route
                path="/customer-reports"
                element={
                  <Roles>
                    {(authrztn) => <StudentReports authrztn={authrztn} />}
                  </Roles>
                }
              /> */}
              {/* <Route
                path="/raw-materials-reports"
                element={
                  <Roles>
                    {(authrztn) => <RawMaterialReport authrztn={authrztn} />}
                  </Roles>
                }
              /> */}
              {/* <Route
                path="/store-operation-reports"
                element={
                  <Roles>
                    {(authrztn) => <StoreOperateReports authrztn={authrztn} />}
                  </Roles>
                }
              /> */}
              {/* <Route
                path="/bulk-load-reports"
                element={
                  <Roles>
                    {(authrztn) => <BulkLoadReports authrztn={authrztn} />}
                  </Roles>
                }
              /> */}
              {/* <Route
                path="/customer-report-details/:name/:id"
                element={<StudentReportDetails />}
              /> */}
              {/* </Route> */}
              {/* Settings */}
              {/* <Route element={<_Sidebar links={settingsNav} />}> */}
              {/* <Route
                path="/menu-profile"
                element={
                  <Roles>
                    {(authrztn) => <MenuProfile authrztn={authrztn} />}
                  </Roles>
                }
              /> */}
              {/* <Route
                path="/loyalty-points"
                element={
                  <Roles>
                    {(authrztn) => <LoyaltyPoints authrztn={authrztn} />}
                  </Roles>
                }
              /> */}
              {/* <Route
                path="/loss-back"
                element={
                  <Roles>
                    {(authrztn) => <LossBack authrztn={authrztn} />}
                  </Roles>
                }
              /> */}
              {/* <Route
                path="/product-extra-options"
                element={
                  <Roles>
                    {(authrztn) => <ProductExtraOptions authrztn={authrztn} />}
                  </Roles>
                }
              /> */}
              {/* <Route
                path="/customize-receipt"
                element={
                  <Roles>
                    {(authrztn) => <CustomizeReceipt authrztn={authrztn} />}
                  </Roles>
                }
              /> */}
              {/* <Route
                path="/hardware-settings"
                element={
                  <Roles>
                    {(authrztn) => <HardwareSettings authrztn={authrztn} />}
                  </Roles>
                }
              /> */}
              {/* </Route> */}
              {/* User  */}
              {/* <Route element={<_Sidebar links={userNav} />}> */}
              {/* <Route
                  path="/user-transaction"
                  element={
                    <Roles>
                      {(authrztn) => <UserTransaction authrztn={authrztn} />}
                    </Roles>
                  }
                /> */}
              {/* <Route
                  path="/user-management"
                  element={
                    <Roles>
                      {(authrztn) => <UserManagement authrztn={authrztn} />}
                    </Roles>
                  }
                /> */}
              {/* <Route path="/emp-list" element={<Roles>
                        {(authrztn) => <EmployeeList authrztn={authrztn} />}
                      </Roles>< />} /> */}

              {/* <Route
                  path="/emp-list"
                  element={
                    <Roles>
                      {(authrztn) => <EmployeeList authrztn={authrztn} />}
                    </Roles>
                  }
                /> */}
              {/* <Route
                  path="/user-role"
                  element={
                    <Roles>
                      {(authrztn) => <UserRole authrztn={authrztn} />}
                    </Roles>
                  }
                /> */}
              {/* <Route path="/create-user-role" element={<CreateUserRole />} /> */}
              {/* <Route
                  path="/update-user-role/:id"
                  element={<UpdateUserRole />}
                /> */}
              {/* </Route> */}

              {/* NFC */}
              <Route
                path="/nfc-load"
                element={
                  <Roles>{(authrztn) => <Nfc authrztn={authrztn} />}</Roles>
                }
              />
            </Route>
            {/* Ordering */}
            <Route path="/order-checkout" element={<OrderCheckOut />} />
            <Route path="/cashier-checkout" element={<CashierCheckout />} />
            <Route
              path="/ordering"
              element={
                <Roles>{(authrztn) => <Ordering authrztn={authrztn} />}</Roles>
              }
            />
            {/* Kiosk */}
            <Route path="/kiosk/" element={<Kiosk />} />
            <Route path="/kiosk-check" element={<KioskCheckBal />} />
            <Route path="/kiosk-tap" element={<KioskTapCard />} />
            <Route path="/kiosk-main" element={<MainScreen />} />
            <Route path="/kiosk-order-number" element={<OrderNumber />} />
            <Route path="/kiosk-order-summary" element={<OrderSummary />} />
            <Route path="/kiosk-order-type" element={<OrderType />} />
            <Route path="/kiosk-payment-method" element={<PaymentMethod />} />

            {/* Customer Display */}
            <Route path="/customer-display" element={<CustomerDisplay />} />
          </Routes>
        </ProtectedRoutes>
      </div>
    </Router>
  );
}

export default App;
