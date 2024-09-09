export const menuNav = [{ to: "/Menu", icon: "bx-arrow-back", label: "Menu" }];
export const inventoryNav = [
  { to: "/Menu", icon: "bx-arrow-back", label: "Menu" },
  {
    to: "/inventory-stocks",
    icon: "bx-package",
    label: "Inventory Stock",
    auth: "InventoryStock-View",
  },
  {
    to: "/add-stocks",
    icon: "bx-package",
    label: "Receiving Stock",
    auth: "ReceivingStock-View",
  },
  {
    to: "/out-bound-stocks",
    icon: "bx-archive-in",
    label: "Out Bounding Stock",
    auth: "OutboundingStock-View",
  },
  {
    to: "/stock-counting",
    icon: "bx-purchase-tag",
    label: "Stock counting",
    auth: "StockCounting-View",
  },
];
export const productNav = [
  { to: "/Menu", icon: "bx-arrow-back", label: "Menu" },
  {
    to: "/product-category",
    icon: "bx-package",
    label: "Products Data",
    auth: "Product-View",
  },
  {
    to: "/archive-product",
    icon: "bx-archive-in",
    label: "Archive Products",
    auth: "Archive-View",
  },
  // {
  //   to: "/ApplyPromotion",
  //   icon: "bx-purchase-tag",
  //   label: "Apply Promotion",
  // },
  {
    to: "/raw-materials",
    icon: "bx bxs-cabinet",
    label: "Raw Materials",
    auth: "RawMaterial-View",
  },
  {
    to: "/cook-book",
    icon: "bx bxs-book-alt",
    label: "Cook Book",
    auth: "CookBook-View",
  },
];

export const userNav = [
  { to: "/Menu", icon: "bx-arrow-back", label: "Menu" },
  {
    to: "/user-management",
    icon: "bx bx-user-plus",
    label: "Customer List",
    auth: "CustomerList-View",
  },
  {
    to: "/emp-list",
    icon: "bx bxs-user-detail",
    label: "User Management",
    auth: "User-View",
  },
  {
    to: "/user-transaction",
    icon: "bx bx-money-withdraw",
    label: "User Transaction",
    auth: "UserTransaction-View",
  },
  {
    to: "/user-role",
    icon: "bi bi-person-check-fill",
    label: "User Role",
    auth: "UserRole-View",
  },
];

export const reportsNav = [
  { to: "/Menu", icon: "bx-arrow-back", label: "Menu" },
  {
    to: "/inventory-reports",
    icon: "bx bx-line-chart",
    label: "Inventory Reports",
    auth: "InventoryReport-View",
  },
  {
    to: "/raw-materials-reports",
    icon: "bx bxs-report",
    label: "Raw Material Reports",
    auth: "RawInventoryReport-View",
  },
  {
    to: "/pos-reports",
    icon: "bx bx-desktop",
    label: "POS Reports",
    auth: "POSReport-View",
  },
  {
    to: "/rfid-reports",
    icon: "bx bxs-objects-horizontal-left",
    label: "RFID Reports",
    auth: "RFIDReport-View",
  },
  {
    to: "/bulk-load-reports",
    icon: "bx bxs-report",
    label: "Bulk Load Reports",
    auth: "BulkLoadReport-View",
  },
  {
    to: "/store-operation-reports",
    icon: "bx bxs-report",
    label: "Store Operation Reports",
    auth: "StoreReport-View",
  },
  {
    to: "/customer-reports",
    icon: "bx bx-bar-chart-alt-2",
    label: "Customer Reports",
    auth: "CustomerReport-View",
  },
];
export const settingsNav = [
  { to: "/Menu", icon: "bx-arrow-back", label: "Menu" },
  {
    to: "/menu-profile",
    icon: "bx bxs-id-card",
    label: "Menu Profile",
    auth: "MenuProfile-View",
  },
  // {
  //   to: "/customize-receipt",
  //   icon: "bx bx-receipt",
  //   label: "Customization Receipt",
  //   auth: "CustomizationReceipt-View",
  // },
  {
    to: "/hardware-settings",
    icon: "bx bxs-cog",
    label: "Hardware Settings",
    auth: "Hardware-View",
  },
  // {
  //   to: "/loss-back",
  //   icon: "bx bx-face",
  //   label: "Loss Back Customer",
  //   auth: "LossBack-View",
  // },
  // {
  //   to: "/loyalty-points",
  //   icon: "bx bx-message-square-add",
  //   label: "Loyalty Points Bracket",
  //   auth: "Loyalty-View",
  // },
  {
    to: "/product-extra-options",
    icon: "bx bx-customize",
    label: "Product Extra Options",
    auth: "ProductExtra-View",
  },
];
