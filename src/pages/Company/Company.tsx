import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router';
import { api } from '../../utils/axiosInstance';
import endPointApi from '../../utils/endPointApi';
import { Edit } from 'lucide-react';

const Company = () => {
    const navigate = useNavigate();
    const [company, setCompany] = useState([]);
    const [loading, setLoading] = useState(false);

      // 🔹 Edit estimate
    const handleEdit = (id: number) => {
        navigate(`/company/edit/${id}`);
    };
    
      // 🔹 Get all company
  const getCompany = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${endPointApi.getAllCompany}`);

      if (res.data) {
        setCompany(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCompany();
  }, []);
  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Company List</h2>
        <button
          onClick={() => navigate("/company/add")}
          className="primary-color text-white px-4 py-2 rounded hover:primary-color"
        >
          + Add Company
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Sr.</th>
              <th className="border p-2">Company Name</th>
              <th className="border p-2">GST Number</th>
              <th className="border p-2">Phone Number</th>
              <th className="border p-2">State</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : company.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  No companys found
                </td>
              </tr>
            ) : (
              company.map((item: any, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2">{item.company_name}</td>
                  <td className="border p-2">{item.gst_number}</td>
                  <td className="border p-2">
                    {" "}
                    {item.phone_number}
                  </td>
                  <td className="border p-2">
                      {item.state}
                  </td>

                  {/* Actions */}
                  <td className="border p-2">
                    <div className="flex items-center justify-center gap-2">
                      {/* View */}
                      

                      {/* Download */}
                      

                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Company