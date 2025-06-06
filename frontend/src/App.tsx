import { useState } from 'react';
import { Routes, Route, Link } from 'react-router';
import { useAuth } from './contexts/AuthContext';

// --- Page Imports ---
// Home Page
import HomePage from './pages/HomePage';
// Product Pages
import ProductListPage from './pages/ProductListPage';
import ProductCreatePage from './pages/ProductCreatePage';
import ProductEditPage from './pages/ProductEditPage';
// Category Pages
import CategoryListPage from './pages/CategoryListPage';
import CategoryCreatePage from './pages/CategoryCreatePage';
import CategoryEditPage from './pages/CategoryEditPage';
// Unit Pages
import UnitListPage from './pages/UnitListPage';
import UnitCreatePage from './pages/UnitCreatePage';
import UnitEditPage from './pages/UnitEditPage';
// Manufacturer Pages
import ManufacturerListPage from './pages/ManufacturerListPage';
import ManufacturerCreatePage from './pages/ManufacturerCreatePage';
import ManufacturerEditPage from './pages/ManufacturerEditPage';
// Origin Pages
import OriginListPage from './pages/OriginListPage';
import OriginCreatePage from './pages/OriginCreatePage';
import OriginEditPage from './pages/OriginEditPage';
// Store Pages
import StoreListPage from './pages/StoreListPage';
import StoreCreatePage from './pages/StoreCreatePage';
import StoreEditPage from './pages/StoreEditPage';
// Shopping Record Pages
import ShoppingRecordListPage from './pages/ShoppingRecordListPage';
import ShoppingRecordCreatePage from './pages/ShoppingRecordCreatePage';
import ShoppingRecordEditPage from './pages/ShoppingRecordEditPage';
// Login Page
import LoginPage from './pages/LoginPage';
// Protected Route
import ProtectedRoute from './components/ProtectedRoute';
import './App.css'

// --- Material UI ---
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// アイコン
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import SquareFootIcon from '@mui/icons-material/SquareFoot'; // Unit
import FactoryIcon from '@mui/icons-material/Factory'; // Manufacturer
import PublicIcon from '@mui/icons-material/Public'; // Origin
import StoreIcon from '@mui/icons-material/Store';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 240;

function App() {
  const [mobileOpen, setMobileOpen] = useState(false); // モバイル用のドロワー開閉状態
  const auth = useAuth();
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // ナビゲーションアイテムの定義
  const navItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Products', path: '/products', icon: <InventoryIcon /> },
    { text: 'Categories', path: '/categories', icon: <CategoryIcon /> },
    { text: 'Units', path: '/units', icon: <SquareFootIcon /> },
    { text: 'Manufacturers', path: '/manufacturers', icon: <FactoryIcon /> },
    { text: 'Origins', path: '/origins', icon: <PublicIcon /> },
    { text: 'Stores', path: '/stores', icon: <StoreIcon /> },
    { text: 'Shopping Records', path: '/shopping-records', icon: <ReceiptLongIcon /> },
  ];

  const drawerContent = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            {/* ListItemButton を RouterLink として機能させる */}
            <ListItemButton component={Link} to={item.path} onClick={mobileOpen ? handleDrawerToggle : undefined}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      {/* 認証状態に応じたナビゲーションリンク */}
      <List>
        {auth.isAuthenticated ? (
          <ListItem disablePadding>
            <ListItemButton onClick={() => { auth.logout(); if(mobileOpen) handleDrawerToggle(); }}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        ) : (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/login" onClick={mobileOpen ? handleDrawerToggle : undefined}>
              <ListItemIcon><LoginIcon /></ListItemIcon>
              <ListItemText primary="Login" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar (ヘッダー) */}
      <AppBar
        position="fixed" // 画面上部に固定
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1, // Drawerより手前に表示
        }}
      >
        <Toolbar>
          {/* モバイル表示用のハンバーガーメニューアイコンボタン */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }} // sm (small) 以上の画面では非表示
          >
            <MenuIcon />
          </IconButton>
          {/* アプリケーションタイトル */}
          <Typography variant="h6" noWrap component="div">
            ShopTrack Admin
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {auth.isAuthenticated && auth.user && (
            <Typography sx={{ mr: 2 }}>User: {auth.user.username}</Typography>
          )}
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer (サイドメニュー) */}
      {/* モバイル用 (Temporary Drawer) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' }, // xs (extra-small) で表示, sm 以上で非表示
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      {/* デスクトップ用 (Permanent Drawer) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' }, // xs で非表示, sm 以上で表示
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
        open // permanent なので常に open
      >
        {drawerContent}
      </Drawer>

      {/* メインコンテンツエリア */}
      <Box
        component="main"
        sx={{
          flexGrow: 1, // 残りのスペースを全て使う
          p: 3, // 内側にパディング
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        {/* AppBar の高さ分のスペーサー (コンテンツが隠れないように) */}
        <Toolbar />
        <Routes>
          {/* Home */}
          <Route path="/" element={<HomePage />} />
          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Product Routes */}
          <Route path="/products" element={<ProtectedRoute><ProductListPage /></ProtectedRoute>} />
          <Route path="/products/new" element={<ProtectedRoute><ProductCreatePage /></ProtectedRoute>} />
          <Route path="/products/:id/edit" element={<ProtectedRoute><ProductEditPage /></ProtectedRoute>} />
          {/* Category Routes */}
          <Route path="/categories" element={<ProtectedRoute><CategoryListPage /></ProtectedRoute>} />
          <Route path="/categories/new" element={<ProtectedRoute><CategoryCreatePage /></ProtectedRoute>} />
          <Route path="/categories/:id/edit" element={<ProtectedRoute><CategoryEditPage /></ProtectedRoute>} />
          {/* Unit Routes */}
          <Route path="/units" element={<ProtectedRoute><UnitListPage /></ProtectedRoute>} />
          <Route path="/units/new" element={<ProtectedRoute><UnitCreatePage /></ProtectedRoute>} />
          <Route path="/units/:id/edit" element={<ProtectedRoute><UnitEditPage /></ProtectedRoute>} />
          {/* Manufacturer Routes */}
          <Route path="/manufacturers" element={<ProtectedRoute><ManufacturerListPage /></ProtectedRoute>} />
          <Route path="/manufacturers/new" element={<ProtectedRoute><ManufacturerCreatePage /></ProtectedRoute>} />
          <Route path="/manufacturers/:id/edit" element={<ProtectedRoute><ManufacturerEditPage /></ProtectedRoute>} />
          {/* Origin Routes */}
          <Route path="/origins" element={<ProtectedRoute><OriginListPage /></ProtectedRoute>} />
          <Route path="/origins/new" element={<ProtectedRoute><OriginCreatePage /></ProtectedRoute>} />
          <Route path="/origins/:id/edit" element={<ProtectedRoute><OriginEditPage /></ProtectedRoute>} />
          {/* Store Routes */}
          <Route path="/stores" element={<ProtectedRoute><StoreListPage /></ProtectedRoute>} />
          <Route path="/stores/new" element={<ProtectedRoute><StoreCreatePage /></ProtectedRoute>} />
          <Route path="/stores/:id/edit" element={<ProtectedRoute><StoreEditPage /></ProtectedRoute>} />
          {/* ShoppingRecord Routes */}
          <Route path="/shopping-records" element={<ProtectedRoute><ShoppingRecordListPage /></ProtectedRoute>} />
          <Route path="/shopping-records/new" element={<ProtectedRoute><ShoppingRecordCreatePage /></ProtectedRoute>} />
          <Route path="/shopping-records/:id/edit" element={<ProtectedRoute><ShoppingRecordEditPage /></ProtectedRoute>} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App
