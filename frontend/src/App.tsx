import { Routes, Route, Link } from 'react-router';
import Home from './pages/Home';
import ItemsList from './pages/ItemsList';
import ProductCreate from './pages/ProductCreate';
import './App.css'

function App() {
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/items">Items List</Link>
          </li>
          <li>
            <Link to="/items/new">Add Item</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/items" element={<ItemsList />} />
        <Route path="/items/new" element={<ProductCreate />} />
        {/* 他のルート（データ作成、詳細、編集など）を後で追加 */}
        {/* 例: <Route path="/items/new" element={<ItemCreatePage />} /> */}
        {/* 例: <Route path="/items/:itemId" element={<ItemDetailPage />} /> */}
        {/* 例: <Route path="/items/:itemId/edit" element={<ItemEditPage />} /> */}
      </Routes>
    </>
  )
}

export default App
