import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function Workerlist() {
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    setSearchResults(staffList); // Initialize searchResults with all staffList data
  }, [staffList]);

  const fetchStaff = async () => {
    try {
      const response = await axios.get('/api/staff/all');
      setStaffList(response.data);
    } catch (error) {
      console.error('Error fetching staff list:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const confirmed = window.confirm('Are you sure you want to delete this staff member?');
      if (confirmed) {
        await axios.delete(`/api/staff/${id}`);
        setStaffList(staffList.filter((staff) => staff._id !== id));
        toast.success('Staff member deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const handleSearch = () => {
    const results = staffList.filter((staff) => {
      // Check if the staff matches the selected types
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(staff.type);
      
      // Check if the name or ID contains the search term
      const nameOrIdMatch = staff.username.toLowerCase().includes(searchTerm.toLowerCase()) || staff.id.includes(searchTerm);

      // Return true if both conditions are met
      return typeMatch && nameOrIdMatch;
    });

    setSearchResults(results);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setSearchResults(staffList); // Reset searchResults to all staffList data
  };

  const handleTypeChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedTypes([...selectedTypes, value]);
    } else {
      setSelectedTypes(selectedTypes.filter((type) => type !== value));
    }
  };

  function downloadAsPdf() {
    const doc = new jsPDF();
  
    // Add title
    doc.setFontSize(16);
    doc.text('Worker List Report', 10, 20);
  
    // Add table
    const table = document.getElementById('tableToPrint');
    html2canvas(table, { ignoreElements: (element) => element.id === 'excludeFromPDF' }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 180; // Adjust width as needed
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      doc.addImage(imgData, 'PNG', 10, 30, imgWidth, imgHeight);
  
      // Save PDF
      doc.save('worker_list_report.pdf');
    });
  }
  

  return (
    <div className='flex'>
      <div className="p-8 w-3/5 ml-72">
        <h1 className="text-3xl font-bold mb-6 text-center mt-10 ml-64 text-slate-500">Worker List</h1>
        
        <div className="mb-4 flex">
          <input
            type="text"
            placeholder="Search by name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-3 rounded-lg border-2 border-gray-300 mr-2 focus:outline-none focus:border-blue-500"
          />
          <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600">Search</button>
          <button onClick={clearSearch} className="bg-gray-500 text-white px-4 py-2 rounded ml-2 hover:bg-gray-600 focus:outline-none focus:bg-gray-600">Clear</button>
        </div>
        <div className="mb-4 flex">
          <label className="mr-4">
            <input
              type="checkbox"
              value="Supervisor"
              checked={selectedTypes.includes("Supervisor")}
              onChange={handleTypeChange}
              className="mr-1"
            />
            Supervisor
          </label>
          <label className="mr-4">
            <input
              type="checkbox"
              value="Driver"
              checked={selectedTypes.includes("Driver")}
              onChange={handleTypeChange}
              className="mr-1"
            />
            Driver
          </label>
          <label>
            <input
              type="checkbox"
              value="Labor"
              checked={selectedTypes.includes("Labor")}
              onChange={handleTypeChange}
              className="mr-1"
            />
            Labor
          </label>
        </div>
        <div>
          <table id="tableToPrint" className="w-full border-collapse mt-14">
            {/* Table header */}
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border">Name</th>
                <th className="py-2 px-4 border">ID</th>
                <th className="py-2 px-4 border">Type</th>
                <th className="py-2 px-4 border">Number</th>
                <th className="py-2 px-4 border">Email</th>
                <th className="py-2 px-4 border">Address</th>
                <th className="py-2 px-4 border">Join Date</th>
                <th className="py-2 px-4 border">License</th>
                <th className="py-2 px-4 border" id="excludeFromPDF">Actions</th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody>
              {searchResults.map((staff, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                  <td className="py-2 px-4 border">{staff.username}</td>
                  <td className="py-2 px-4 border">{staff.id}</td>
                  <td className="py-2 px-4 border">{staff.type}</td>
                  <td className="py-2 px-4 border">{staff.number}</td>
                  <td className="py-2 px-4 border">{staff.email}</td>
                  <td className="py-2 px-4 border">{staff.address}</td>
                  <td className="py-2 px-4 border">{staff.joindate}</td>
                  <td className="py-2 px-4 border">{staff.license}</td>
                  <td className="py-2 px-4 border" id="excludeFromPDF">
                    <div className="flex justify-between">
                      <Link to={`/Updatestaff/${staff._id}`}>
                        <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600">Update</button>
                      </Link>
                      <button className="bg-red-500 text-white px-3 py-1 rounded ml-2 hover:bg-red-600 focus:outline-none focus:bg-red-600" onClick={() => handleDelete(staff._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to='/Addworkers'>
            <div className="bg-slate-600 text-white p-1 rounded-lg uppercase hover:opacity-95 text-center mt-5 w-56 ml-0.5">Add A New Worker</div>
          </Link>
          <div className="bg-slate-600 text-white p-1 rounded-lg uppercase hover:opacity-95 text-center mt-5 w-56 ml-0.5" onClick={downloadAsPdf}>Download Report</div>
          
        </div>
      </div>
    </div>
  );
}
