import axios from 'axios';
import { useState, useEffect } from 'react';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchProducts = async (query = '') => {
        setLoading(true);
        try {
            const url = query 
                ? `https://localhost:7048/api/Products/search?q=${encodeURIComponent(query)}`
                : 'https://localhost:7048/api/Products';
            const res = await axios.get(url);
            setProducts(res.data);
        } catch (err) {
            alert('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts(search);
    };

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Products</h1>

            <form onSubmit={handleSearch} className="mb-8">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, SKU, or barcode..."
                        className="flex-1 p-3 border rounded-lg"
                    />
                    <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                        Search
                    </button>
                </div>
            </form>

            {loading ? <p>Loading...</p> : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">SKU</th>
                                <th className="px-6 py-3 text-left">Name</th>
                                <th className="px-6 py-3 text-left">Category</th>
                                <th className="px-6 py-3 text-left">Barcode</th>
                                <th className="px-6 py-3 text-right">Price</th>
                                <th className="px-6 py-3 text-right">Stock</th>
                                <th className="px-6 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id} className="border-t hover:bg-gray-50">
                                    <td className="px-6 py-4">{p.sku}</td>
                                    <td className="px-6 py-4">{p.name}</td>
                                    <td className="px-6 py-4">{p.categoryName}</td>
                                    <td className="px-6 py-4">{p.barcode || '-'}</td>
                                    <td className="px-6 py-4 text-right">${p.currentPrice.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">{p.stockQuantity}</td>
                                    <td className="px-6 py-4 text-center">
                                        {p.lowStock ? 
                                            <span classadece className="bg-red-100 text-red-800 px-3 py-1 rounded">Low Stock</span> : 
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded">OK</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Products;