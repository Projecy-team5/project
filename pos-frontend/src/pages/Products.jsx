import axios from 'axios';
import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Form state
  const [form, setForm] = useState({
    categoryId: '',
    sku: '',
    name: '',
    description: '',
    barcode: '',
    price: '',
    initialStock: 0,
    minQuantity: 0,
  });

  // Load products and categories
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get(search 
          ? `https://localhost:7048/api/Products/search?q=${encodeURIComponent(search)}`
          : 'https://localhost:7048/api/Products'),
        axios.get('https://localhost:7048/api/Categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  // Open modal for add or edit
  const openModal = (product = null) => {
    if (product) {
      setIsEdit(true);
      setCurrentProduct(product);
      setForm({
        categoryId: product.categoryId || '',  // assume you add categoryId to ProductDto
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        barcode: product.barcode || '',
        price: product.currentPrice,
        initialStock: product.stockQuantity,     // for edit, show current
        minQuantity: product.minQuantity,
      });
    } else {
      setIsEdit(false);
      setCurrentProduct(null);
      setForm({
        categoryId: '',
        sku: '',
        name: '',
        description: '',
        barcode: '',
        price: '',
        initialStock: 0,
        minQuantity: 0,
      });
    }
    setModalOpen(true);
  };

  // Handle form submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(`https://localhost:7048/api/Products/${currentProduct.id}`, form);
        alert('Product updated!');
      } else {
        await axios.post('https://localhost:7048/api/Products', form);
        alert('Product added!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data || err.message));
    }
  };

  // Delete with confirmation
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`https://localhost:7048/api/Products/${id}`);
      alert('Product deleted');
      fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <button
          onClick={() => openModal()}
          className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-700"
        >
          <PlusIcon className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, SKU, barcode..."
            className="flex-1 p-3 border rounded-lg"
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Search
          </button>
        </div>
      </form>

      {/* Table */}
      {loading ? <p>Loading...</p> : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">SKU</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-right">Price</th>
                <th className="px-6 py-3 text-right">Stock</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{p.sku}</td>
                  <td className="px-6 py-4">{p.name}</td>
                  <td className="px-6 py-4">{p.categoryName}</td>
                  <td className="px-6 py-4 text-right">${p.currentPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={p.lowStock ? 'text-red-600 font-medium' : ''}>
                      {p.stockQuantity} / {p.minQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center flex justify-center gap-3">
                    <button onClick={() => openModal(p)} className="text-blue-600 hover:text-blue-800">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Transition appear show={modalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900 mb-6">
                    {isEdit ? 'Edit Product' : 'Add New Product'}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit}>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          value={form.categoryId}
                          onChange={e => setForm({...form, categoryId: e.target.value})}
                          className="w-full p-3 border rounded-lg"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                        <input
                          type="text"
                          value={form.sku}
                          onChange={e => setForm({...form, sku: e.target.value})}
                          className="w-full p-3 border rounded-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={e => setForm({...form, name: e.target.value})}
                          className="w-full p-3 border rounded-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={form.description}
                          onChange={e => setForm({...form, description: e.target.value})}
                          className="w-full p-3 border rounded-lg"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                        <input
                          type="text"
                          value={form.barcode}
                          onChange={e => setForm({...form, barcode: e.target.value})}
                          className="w-full p-3 border rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={form.price}
                            onChange={e => setForm({...form, price: e.target.value})}
                            className="w-full p-3 border rounded-lg"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock</label>
                          <input
                            type="number"
                            value={form.minQuantity}
                            onChange={e => setForm({...form, minQuantity: parseInt(e.target.value) || 0})}
                            className="w-full p-3 border rounded-lg"
                            required
                          />
                        </div>
                      </div>

                      {!isEdit && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
                          <input
                            type="number"
                            value={form.initialStock}
                            onChange={e => setForm({...form, initialStock: parseInt(e.target.value) || 0})}
                            className="w-full p-3 border rounded-lg"
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {isEdit ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Products;