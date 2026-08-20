/**
 * BuyFurn Route Inventory & Specifications
 */

const routes = [
  // --- Public Pages ---
  {
    name: 'home',
    path: '/',
    access: 'public',
    role: null,
    screenshotFilename: 'home.png',
    notes: 'Home page with slider and featured products'
  },
  {
    name: 'slider',
    path: '/slider',
    access: 'public',
    role: null,
    screenshotFilename: 'slider.png',
    notes: 'Slider component view'
  },
  {
    name: 'contact',
    path: '/contact',
    access: 'public',
    role: null,
    screenshotFilename: 'contact.png',
    notes: 'Contact Us page'
  },
  {
    name: 'about',
    path: '/about',
    access: 'public',
    role: null,
    screenshotFilename: 'about.png',
    notes: 'About Us page'
  },
  {
    name: 'furniture',
    path: '/furniture',
    access: 'public',
    role: null,
    screenshotFilename: 'furniture.png',
    notes: 'Furniture catalog page with filters and product grid'
  },
  {
    name: 'product-detail',
    path: '/product',
    access: 'public',
    role: null,
    screenshotFilename: 'product-detail.png',
    notes: 'Product detail page (requires productId parameter or dynamic selection)'
  },
  {
    name: 'login',
    path: '/login',
    access: 'public',
    role: null,
    screenshotFilename: 'login.png',
    notes: 'User and admin login page'
  },
  {
    name: 'register',
    path: '/register',
    access: 'public',
    role: null,
    screenshotFilename: 'register.png',
    notes: 'User registration page'
  },
  {
    name: 'verify-otp',
    path: '/verify-otp',
    access: 'public',
    role: null,
    screenshotFilename: 'verify-otp.png',
    notes: 'OTP verification page'
  },
  {
    name: 'forgot-password',
    path: '/forgot-password',
    access: 'public',
    role: null,
    screenshotFilename: 'forgot-password.png',
    notes: 'Forgot password request page'
  },
  {
    name: 'forbidden',
    path: '/forbidden',
    access: 'public',
    role: null,
    screenshotFilename: 'forbidden.png',
    notes: 'Access forbidden 403 error page'
  },

  // --- USER Authenticated Pages ---
  {
    name: 'cart',
    path: '/cart',
    access: 'user',
    role: 'USER',
    screenshotFilename: 'cart.png',
    notes: 'Shopping cart page'
  },
  {
    name: 'userdashbord',
    path: '/userdashbord',
    access: 'user',
    role: 'USER',
    screenshotFilename: 'dashboard.png',
    notes: 'User dashboard overview'
  },
  {
    name: 'userprofile',
    path: '/userprofile',
    access: 'user',
    role: 'USER',
    screenshotFilename: 'profile.png',
    notes: 'User profile details page'
  },
  {
    name: 'updateuser',
    path: '/updateuser',
    access: 'user',
    role: 'USER',
    screenshotFilename: 'update-user.png',
    notes: 'Update user profile form'
  },
  {
    name: 'buyproduct',
    path: '/buyproduct',
    access: 'user',
    role: 'USER',
    screenshotFilename: 'checkout.png',
    notes: 'Buy product / Checkout page'
  },
  {
    name: 'myorders',
    path: '/myorders',
    access: 'user',
    role: 'USER',
    screenshotFilename: 'my-orders.png',
    notes: 'Customer order history'
  },
  {
    name: 'orderplaced',
    path: '/orderplaced',
    access: 'user',
    role: 'USER',
    screenshotFilename: 'order-confirmation.png',
    notes: 'Order confirmation page'
  },

  // --- ADMIN Authenticated Pages ---
  {
    name: 'admin-dashboard',
    path: '/admin',
    access: 'admin',
    role: 'ADMIN',
    screenshotFilename: 'dashboard.png',
    notes: 'Admin dashboard'
  },
  {
    name: 'admin-products',
    path: '/admin/product',
    access: 'admin',
    role: 'ADMIN',
    screenshotFilename: 'products.png',
    notes: 'Admin product management'
  },
  {
    name: 'admin-users',
    path: '/admin/users',
    access: 'admin',
    role: 'ADMIN',
    screenshotFilename: 'users.png',
    notes: 'Admin user management'
  },
  {
    name: 'admin-addproduct',
    path: '/admin/addproduct',
    access: 'admin',
    role: 'ADMIN',
    screenshotFilename: 'add-product.png',
    notes: 'Admin add new product page'
  },
  {
    name: 'admin-productdetails',
    path: '/admin/productdetails',
    access: 'admin',
    role: 'ADMIN',
    screenshotFilename: 'product-details.png',
    notes: 'Admin view product details'
  },
  {
    name: 'admin-orders',
    path: '/admin/orders',
    access: 'admin',
    role: 'ADMIN',
    screenshotFilename: 'orders.png',
    notes: 'Admin order management'
  },
  {
    name: 'admin-visualizationorders',
    path: '/admin/visualizationorders',
    access: 'admin',
    role: 'ADMIN',
    screenshotFilename: 'order-visualization.png',
    notes: 'Admin order visualization & analytics'
  },
  {
    name: 'admin-editproduct',
    path: '/admin/editproduct/1',
    access: 'admin',
    role: 'ADMIN',
    screenshotFilename: 'edit-product.png',
    notes: 'Admin edit product form'
  }
];

module.exports = routes;
