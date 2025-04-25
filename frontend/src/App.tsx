import { Routes, Route, Link } from 'react-router';
import HomePage from './pages/HomePage';
import ItemsListPage from './pages/ItemsListPage';
import ProductCreatePage from './pages/ProductCreatePage';
import ProductEditPage from './pages/ProductEditPage';
import './App.css'

function App() {
  return (
    <>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/items">Items List</Link></li>
          <li><Link to="/items/new">Add Item</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/items" element={<ItemsListPage />} />
        <Route path="/items/new" element={<ProductCreatePage />} />
        <Route path="/items/:id/edit" element={<ProductEditPage />} />
        {/* 他のルート（データ作成、詳細、編集など）を後で追加 */}
        {/* 例: <Route path="/items/new" element={<ItemCreatePage />} /> */}
        {/* 例: <Route path="/items/:itemId" element={<ItemDetailPage />} /> */}
        {/* 例: <Route path="/items/:itemId/edit" element={<ItemEditPage />} /> */}
      </Routes>
    </>
  )
}

export default App
