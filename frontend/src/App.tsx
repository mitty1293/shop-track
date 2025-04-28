import { Routes, Route, Link } from 'react-router';
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
import './App.css'

function App() {
  return (
    <>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">Products List</Link></li>
          <li><Link to="/categories">Categories List</Link></li>
          <li><Link to="/units">Units List</Link></li>
          <li><Link to="/manufacturers">Manufacturers List</Link></li>
          <li><Link to="/origins">Origins List</Link></li>
          <li><Link to="/stores">Stores List</Link></li>
          <li><Link to="/shopping-records">ShoppingRecords List</Link></li>
        </ul>
      </nav>
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage />} />
        {/* Product Routes */}
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/new" element={<ProductCreatePage />} />
        <Route path="/products/:id/edit" element={<ProductEditPage />} />
        {/* Category Routes */}
        <Route path="/categories" element={<CategoryListPage />} />
        <Route path="/categories/new" element={<CategoryCreatePage />} />
        <Route path="/categories/:id/edit" element={<CategoryEditPage />} />
        {/* Unit Routes */}
        <Route path="/units" element={<UnitListPage />} />
        <Route path="/units/new" element={<UnitCreatePage />} />
        <Route path="/units/:id/edit" element={<UnitEditPage />} />
        {/* Manufacturer Routes */}
        <Route path="/manufacturers" element={<ManufacturerListPage />} />
        <Route path="/manufacturers/new" element={<ManufacturerCreatePage />} />
        <Route path="/manufacturers/:id/edit" element={<ManufacturerEditPage />} />
        {/* Origin Routes */}
        <Route path="/origins" element={<OriginListPage />} />
        <Route path="/origins/new" element={<OriginCreatePage />} />
        <Route path="/origins/:id/edit" element={<OriginEditPage />} />
        {/* Store Routes */}
        <Route path="/stores" element={<StoreListPage />} />
        <Route path="/stores/new" element={<StoreCreatePage />} />
        <Route path="/stores/:id/edit" element={<StoreEditPage />} />
        {/* ShoppingRecord Routes */}
        <Route path="/shopping-records" element={<ShoppingRecordListPage />} />
        <Route path="/shopping-records/new" element={<ShoppingRecordCreatePage />} />
        <Route path="/shopping-records/:id/edit" element={<ShoppingRecordEditPage />} />
      </Routes>
    </>
  )
}

export default App
