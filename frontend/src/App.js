import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Roles from "./hooks/roles"; // auth fetch
import Login from "./modules/Login/login";

import _Sidebar from "./modules/Sidebar/_Sidebar.jsx";

import Layout from "./layout/layout.jsx";

// import { DataProvider } from "./modules/Forgot Password/sub-modules/data/dataPost";
import ProtectedRoutes from "./hooks/protectedRoute";
import Menu from "./modules/Menu/Menu.jsx";

import UserManagement from "./modules/UserManagement/UserManagement.jsx";
import UserRole from "./modules/UserManagement/UserRole.jsx";
import CreateUserRole from "./modules/UserManagement/Rbac/create-role.jsx";
import UpdateUserRole from "./modules/UserManagement/Rbac/update-role.jsx";

// Navs
import {
  inventoryNav,
  menuNav,
  productNav,
  reportsNav,
  settingsNav,
  userNav,
} from "./modules/Sidebar/navs.js";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
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
              {/* User  */}
              <Route element={<_Sidebar links={userNav} />}>
                <Route
                  path="/user-management"
                  element={
                    <Roles>
                      {(authrztn) => <UserManagement authrztn={authrztn} />}
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
              </Route>
            </Route>
          </Routes>
        </ProtectedRoutes>
      </div>
    </Router>
  );
}

export default App;
