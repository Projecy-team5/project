// Basic list with indent for nesting (expand later to full tree)
import axios from 'axios';
import { useState, useEffect } from 'react';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: '', parentId: '' });

    useEffect(() => {
        axios.get('https://localhost:7048/api/Categories').then(res => setCategories(res.data));
    }, []);

    const addCategory = async (e) => {
        e.preventDefault();
        await axios.post('https://localhost:7048/api/Categories', form);
        // reload
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Categories</h1>

            <form onSubmit={addCategory} className="mb-8 bg-white p-6 rounded shadow">
                <input 
                    placeholder="Category Name" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    className="p-3 border rounded mr-4" 
                    required 
                />
                <select 
                    value={form.parentId} 
                    onChange={e => setForm({...form, parentId: e.target.value})}
                    className="p-3 border rounded"
                >
                    <option value="">No Parent</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button type="submit" className="ml-4 bg-blue-600 text-white px-6 py-3 rounded">Add</button>
            </form>

            <ul className="bg-white rounded shadow divide-y">
                {categories.map(c => (
                    <li key={c.id} className="p-4 flex justify-between">
                        <span style={{ paddingLeft: c.parentId ? '20px' : '0' }}>
                            {c.name} {c.parentName && `(under ${c.parentName})`}
                        </span>
                        {/* Edit/Delete buttons */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Categories;