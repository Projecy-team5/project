import axios from 'axios';
import { useState, useEffect, Fragment } from 'react';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const API_URL = 'https://localhost:7048/api/Users';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Cashier',
  });

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_URL);
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user = null) => {
    if (user) {
      setIsEdit(true);
      setCurrentUser(user);
      setForm({
        username: user.username,
        email: user.email,
        password: '', 
        role: user.role,
      });
    } else {
      setIsEdit(false);
      setCurrentUser(null);
      setForm({
        username: '',
        email: '',
        password: '',
        role: 'Cashier',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        // Construct payload for Update
        const updateData = {
          email: form.email,
          role: form.role,
          ...(form.password ? { newPassword: form.password } : {})
        };
        await axios.put(`${API_URL}/${currentUser.id}`, updateData);
        toast.success('User updated successfully');
      } else {
        await axios.post(API_URL, form);
        toast.success('User created successfully');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data || 'Operation failed');
    }
  };

  const handleDisable = async (id) => {
    if (!window.confirm('Are you sure you want to disable this user?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success('User status updated');
      fetchUsers();
    } catch {
      toast.error('Failed to change user status');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <PlusIcon className="h-5 w-5" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Username</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{u.username}</td>
                <td className="px-6 py-4 text-gray-600">{u.email}</td>
                <td className="px-6 py-4 text-gray-600">{u.role}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    u.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => openModal(u)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    {u.status === 'Active' && (
                      <button onClick={() => handleDisable(u.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Section */}
      <Transition show={modalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setModalOpen(false)}>
          {/* Background overlay */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 shadow-2xl transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <Dialog.Title className="text-2xl font-bold text-gray-900">
                      {isEdit ? 'Edit User' : 'Create New User'}
                    </Dialog.Title>
                    <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                       <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {!isEdit && (
                      <div>
                        <label className="block text-sm font-semibold mb-1">Username</label>
                        <input
                          type="text"
                          value={form.username}
                          onChange={e => setForm({...form, username: e.target.value})}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold mb-1">Email Address</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({...form, email: e.target.value})}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        {isEdit ? 'New Password (optional)' : 'Password'}
                      </label>
                      <input
                        type="password"
                        placeholder={isEdit ? 'Leave blank to keep current' : 'Enter password'}
                        value={form.password}
                        onChange={e => setForm({...form, password: e.target.value})}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        {...(!isEdit && { required: true })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">Role</label>
                      <select
                        value={form.role}
                        onChange={e => setForm({...form, role: e.target.value})}
                        className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="Cashier">Cashier</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md transition-colors"
                      >
                        {isEdit ? 'Save Changes' : 'Create User'}
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

export default Users;