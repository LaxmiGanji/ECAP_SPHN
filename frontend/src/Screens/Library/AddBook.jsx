import { useState, useEffect } from 'react'
import axios from "axios";
import { baseApiURL } from "../../baseUrl";
import { toast } from "react-hot-toast";
import { MdOutlineDelete, MdEdit } from "react-icons/md";
import { FiBook } from "react-icons/fi";

const AddBook = () => {
  const [data, setData] = useState({
    bookName: "", 
    bookCode: "", 
    author: "", 
    genre: "", 
    quantity: "",
    issuedCount: 0
  });
  const [editData, setEditData] = useState(null);
  const [selected, setSelected] = useState("add");
  const [book, setBook] = useState([]);

  useEffect(() => {
    getBookHandler();
  }, []);

  const getBookHandler = () => {
    axios
      .get(`${baseApiURL()}/library/getLibraryBook`)
      .then((response) => {
        if (response.data.success) {
          setBook(response.data.book);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const addBookHandler = () => {
    if (!data.bookName || !data.bookCode || !data.author || !data.quantity) {
      return toast.error('Please fill all required fields!');
    }
    
    toast.loading("Adding Book");
    axios
      .post(`${baseApiURL()}/library/addLibraryBook`, {
        ...data,
        issuedCount: 0 // Ensure new books start with 0 issued copies
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          setData({
            bookName: "", 
            bookCode: "", 
            author: "", 
            genre: "", 
            quantity: "",
            issuedCount: 0
          });
          getBookHandler();
          setSelected("view");
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response?.data?.message || error.message);
      });
  };

  const deleteBookHandler = (id) => {
    toast.loading("Deleting Book");
    axios
      .delete(`${baseApiURL()}/library/deleteLibraryBook/${id}`)
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          getBookHandler();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response?.data?.message || error.message);
      });
  };

  const updateBookHandler = () => {
    if (!editData) return;
    
    if (!editData.bookName || !editData.bookCode || !editData.author || !editData.quantity) {
      return toast.error('Please fill all required fields!');
    }

    toast.loading("Updating Book");
    axios
      .put(`${baseApiURL()}/library/updateLibraryBook/${editData._id}`, {
        ...editData,
        // Don't allow direct modification of issuedCount through the form
        issuedCount: editData.issuedCount || 0
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          setEditData(null);
          setSelected("view");
          getBookHandler();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response?.data?.message || error.message);
      });
  };

  const resetForm = () => {
    setData({
      bookName: "", 
      bookCode: "", 
      author: "", 
      genre: "", 
      quantity: "",
      issuedCount: 0
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <FiBook className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Manage Library Books</h1>
                  <p className="text-blue-100 text-sm">Add, edit, and manage library books</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selected === "add" 
                      ? "bg-white text-blue-600" 
                      : "text-white hover:bg-white/20"
                  }`}
                  onClick={() => setSelected("add")}
                >
                  Add Book
                </button>
                <button
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selected === "view" 
                      ? "bg-white text-blue-600" 
                      : "text-white hover:bg-white/20"
                  }`}
                  onClick={() => setSelected("view")}
                >
                  View Books
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {selected === "add" && (
              <div className="max-w-2xl mx-auto">
                <div className="space-y-8">
                  {/* Book Information Section */}
                  <div>
                    <div className="flex items-center space-x-2 mb-6">
                      <FiBook className="text-blue-600 text-lg" />
                      <h2 className="text-xl font-semibold text-gray-800">Book Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="bookName" className="block text-sm font-medium text-gray-700 mb-2">
                          Book Name *
                        </label>
                        <input
                          type="text"
                          id="bookName"
                          required
                          value={data.bookName}
                          onChange={(e) => setData({ ...data, bookName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter book name"
                        />
                      </div>
                      <div>
                        <label htmlFor="bookCode" className="block text-sm font-medium text-gray-700 mb-2">
                          Book Code *
                        </label>
                        <input
                          type="number"
                          id="bookCode"
                          required
                          value={data.bookCode}
                          onChange={(e) => setData({ ...data, bookCode: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter book code"
                        />
                      </div>
                      <div>
                        <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                          Author *
                        </label>
                        <input
                          type="text"
                          id="author"
                          required
                          value={data.author}
                          onChange={(e) => setData({ ...data, author: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter author name"
                        />
                      </div>
                      <div>
                        <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
                          Genre
                        </label>
                        <input
                          type="text"
                          id="genre"
                          value={data.genre}
                          onChange={(e) => setData({ ...data, genre: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter genre"
                        />
                      </div>
                      <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          required
                          min="1"
                          value={data.quantity}
                          onChange={(e) => setData({ ...data, quantity: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter quantity"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset Form
                  </button>
                  <button
                    type="button"
                    onClick={addBookHandler}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Add Book
                  </button>
                </div>
              </div>
            )}

            {selected === "view" && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-lg">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <th className="py-4 px-6 text-left font-semibold">Book Code</th>
                      <th className="py-4 px-6 text-left font-semibold">Book Name</th>
                      <th className="py-4 px-6 text-left font-semibold">Author</th>
                      <th className="py-4 px-6 text-left font-semibold">Genre</th>
                      <th className="py-4 px-6 text-left font-semibold">Available</th>
                      <th className="py-4 px-6 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {book.map((item) => (
                      <tr key={item._id} className="border-b hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-6 font-medium">{item.bookCode}</td>
                        <td className="py-4 px-6">{item.bookName}</td>
                        <td className="py-4 px-6">{item.author}</td>
                        <td className="py-4 px-6">{item.genre || '-'}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            (item.quantity - (item.issuedCount || 0)) > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.quantity - (item.issuedCount || 0)} / {item.quantity}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex space-x-3">
                            <button
                              className="text-blue-500 hover:text-blue-700 transition-colors"
                              onClick={() => {
                                setEditData(item);
                                setSelected("edit");
                              }}
                              title="Edit"
                            >
                              <MdEdit size={20} />
                            </button>
                            <button
                              className="text-red-500 hover:text-red-700 transition-colors"
                              onClick={() => deleteBookHandler(item._id)}
                              title="Delete"
                            >
                              <MdOutlineDelete size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selected === "edit" && editData && (
              <div className="max-w-2xl mx-auto">
                <div className="space-y-8">
                  {/* Book Information Section */}
                  <div>
                    <div className="flex items-center space-x-2 mb-6">
                      <FiBook className="text-blue-600 text-lg" />
                      <h2 className="text-xl font-semibold text-gray-800">Edit Book Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-2">
                          Book Name *
                        </label>
                        <input
                          type="text"
                          id="editName"
                          required
                          value={editData.bookName}
                          onChange={(e) => setEditData({ ...editData, bookName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter book name"
                        />
                      </div>
                      <div>
                        <label htmlFor="editCode" className="block text-sm font-medium text-gray-700 mb-2">
                          Book Code *
                        </label>
                        <input
                          type="number"
                          id="editCode"
                          required
                          value={editData.bookCode}
                          onChange={(e) => setEditData({ ...editData, bookCode: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter book code"
                        />
                      </div>
                      <div>
                        <label htmlFor="editAuthor" className="block text-sm font-medium text-gray-700 mb-2">
                          Author *
                        </label>
                        <input
                          type="text"
                          id="editAuthor"
                          required
                          value={editData.author}
                          onChange={(e) => setEditData({ ...editData, author: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter author name"
                        />
                      </div>
                      <div>
                        <label htmlFor="editGenre" className="block text-sm font-medium text-gray-700 mb-2">
                          Genre
                        </label>
                        <input
                          type="text"
                          id="editGenre"
                          value={editData.genre}
                          onChange={(e) => setEditData({ ...editData, genre: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter genre"
                        />
                      </div>
                      <div>
                        <label htmlFor="editQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          id="editQuantity"
                          required
                          min="1"
                          value={editData.quantity}
                          onChange={(e) => setEditData({ ...editData, quantity: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter quantity"
                        />
                      </div>
                      <div>
                        <label htmlFor="editIssuedCount" className="block text-sm font-medium text-gray-700 mb-2">
                          Currently Issued
                        </label>
                        <input
                          type="number"
                          id="editIssuedCount"
                          value={editData.issuedCount || 0}
                          readOnly
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setEditData(null);
                      setSelected("view");
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={updateBookHandler}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Update Book
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddBook;