
'use client';

import { useState, useRef } from 'react';
import { Upload } from 'lucide-react'; // Uses lucide-react icon pack (install if needed)
import { insertExtractedData } from '../lib/db'; // adjust path if needed
import { useEffect } from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';

import * as XLSX from 'xlsx';


// export XLS with filenae that includes timestamp

const exportToXLSX = (data: ExtractedData[], columns: { key: string; label: string }[]) => {
  const worksheetData = [
    columns.map(col => col.label), // header row
    ...data.map(row => columns.map(col => row[col.key] ?? '')),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Extracted Data');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `extracted_data_${timestamp}.xlsx`;

  XLSX.writeFile(workbook, filename);
};


interface ExtractedData {
  document: string;
  company_name?: string;
  company_description?: string;
  industry?: string;
  revenue?: string;
  revenue_growth?: string;
  gross_profit?: string;
  ebitda?: string;
  business_model?: string;
}

// const exportToCSV = (data: ExtractedData[], columns: { key: string; label: string }[]) => {
//   const header = columns.map((col) => col.label).join(',');
//   const rows = data.map((row) =>
//     columns.map((col) => `"${(row[col.key] ?? '').toString().replace(/"/g, '""')}"`).join(',')
//   );
//   const csvContent = [header, ...rows].join('\n');

//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement('a');
//   link.setAttribute('href', url);
//   link.setAttribute('download', 'extracted_data.csv');
//   link.click();
// };

///////////
//////////
//////////
//////////
const columns = [
  { key: 'document', label: 'Document' },
  { key: 'company_name', label: 'Company Name' },
  { key: 'industry', label: 'Industry' },
  { key: 'business_model', label: 'Business Model' },
  { key: 'management_team', label: 'Management Team' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'revenue_growth', label: 'Revenue Growth' },
  { key: 'gross_profit', label: 'Gross Margin' },
  { key: 'ebitda', label: 'EBITDA' },
  { key: 'company_description', label: 'Company Description' },
  { key: 'expenses', label: 'Expenses' },  // hardcoded to check if NEWLY ADDED column data comes visible
  // { key: 'names of places', label: 'Expenses' },  // hardcoded to check if NEWLY ADDED column data comes visible
  { key: 'actions', label: '' } // to support deeltion fro persisten postgres

];
//ADDED BELOW TO MAKE COLUMSND ETECTION DYNAMIC
// const columns = columnKeys
//   .filter(key => key !== 'raw_text' && key !== 'id') // hide backend fields
//   .map(key => ({
//     key,
//     label: key === 'document'
//       ? 'Document'
//       : key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // format nicely
//   }))
//   .concat([{ key: 'actions', label: '' }]);
  //////////////////
  ////////////////
  ///////////////
  ///////////////

export default function Home() {
  const [results, setResults] = useState<ExtractedData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  // const [expandedCells, setExpandedCells] = useState<{ [key: string]: boolean }>({});
  const [expandedCells, setExpandedCells] = useState<{ [key: string]: boolean }>({});

  // const [columnKeys, setColumnKeys] = useState<string[]>([]);


  const toggleExpanded = (rowIdx: number, key: string) => {
    const cellKey = `${rowIdx}-${key}`;
    setExpandedCells((prev) => ({ ...prev, [cellKey]: !prev[cellKey] }));
  };
///////////////////////// //////////////////////////////////////////////////////////////////////////////////////////////
//////////
// Function to call your new API endpoint
  const submitCustomField = async () => {
    if (!newFieldName || !fieldPurpose) return;

    const res = await fetch('/api/addField', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({   field_name: newFieldName.trim(), purpose: fieldPurpose.trim() }),
    });

    const result = await res.json();
    console.log("🧠 Field generation result:", result);

    setShowFieldModal(false);
    setNewFieldName('');
    setFieldPurpose('');
  };
//////////
///////////////////////// //////////////////////////////////////////////////////////////////////////////////////////////

  const [uploadingCount, setUploadingCount] = useState(0);

////////////////////////// //////////////////////////////////////////////////////////////////////////////////////////////
///////////
// New state for modal and input
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [fieldPurpose, setFieldPurpose] = useState('');
 //////////
///////////////////////// //////////////////////////////////////////////////////////////////////////////////////////////


  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch('/api/getRecords');
        const data = await res.json();
        setResults(data.records); // Replace `setResults` with your actual state setter
      } catch (error) {
        console.error("Failed to fetch records:", error);
      }
    };

  fetchRecords();
}, []);


  const fileInputRef = useRef<HTMLInputElement>(null);

  // const handleUpload = async (file: File) => {
  //   setLoading(true);

  //   const formData = new FormData();
  //   formData.append('file', file);

  //   const res = await fetch('http://127.0.0.1:8000/upload', {
  //     method: 'POST',
  //     body: formData,
  //   });

  //   const data = await res.json();
  //   let parsed;

  //   if (data.structured_data?.raw_output) {
  //     const cleaned = data.structured_data.raw_output
  //       .replace(/```json\n?/, '')
  //       .replace(/```$/, '');
  //     parsed = JSON.parse(cleaned);
  //   } else {
  //     parsed = data.structured_data;
  //   }

  //   setResults((prev) => [
  //     // ...prev,
  //     {
  //       document: file.name,
  //       ...parsed,
  //     },
  //     ...prev,

  //   ]);

  //   await insertExtractedData(record);

  //   setLoading(false);
  // };

  // const handleUpload = async (file: File) => {
  //   setLoading(true);
  
  //   const formData = new FormData();
  //   formData.append('file', file);
  
  //   // Send file to your FastAPI backend
  //   const res = await fetch('http://127.0.0.1:8000/upload', {
  //     method: 'POST',
  //     body: formData,
  //   });
  
  //   const data = await res.json();
  //   let parsed;
  
  //   if (data.structured_data?.raw_output) {
  //     const cleaned = data.structured_data.raw_output
  //       .replace(/```json\n?/, '')
  //       .replace(/```$/, '');
  //     parsed = JSON.parse(cleaned);
  //   } else {
  //     parsed = data.structured_data;
  //   }
  
  //   const record = {
  //     document: file.name,
  //     ...parsed,
  //   };
  
  //   // Step 2: Add the record to the UI
  //   setResults((prev) => [record, ...prev]);
  
  //   // Step 3: Send record to your internal Next.js API
  //   await fetch('/api/saveRecord', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(record),
  //   });
  
  //   setLoading(false);
  // };
  
  // new handleuplaod function to display and upload multiple files
  const handleUpload = async (file: File) => {
    setUploadingCount((count) => count + 1);
    setLoading(true);
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const res = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      });
  
      const data = await res.json();
      const parsed = data.structured_data?.raw_output
        ? JSON.parse(data.structured_data.raw_output.replace(/```json\n?/, '').replace(/```$/, ''))
        : data.structured_data;
  
      // const record = {
      //   document: file.name,
      //   ...parsed,
      // };
      const record = {
        document: file.name,
      };
      
      for (const key in parsed) {
        const value = parsed[key];
      
        // Attempt to parse if it's a JSON string
        if (typeof value === 'string') {
          try {
            const parsedValue = JSON.parse(value);
            record[key] = parsedValue;
          } catch {
            record[key] = value; // fallback: raw string
          }
        } else {
          record[key] = value;
        }
      }
      setResults((prev) => [record, ...prev]);
  
      // await fetch('/api/saveRecord', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(record),
      // });
      // 🧠 Helper to safely parse fields that may be stringified JSON
      function parseIfString(value: any) {
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }
        return value;
      }

      // 🧹 Normalize record before sending to backend
      const cleanedRecord = {
        ...record,
        company_name: parseIfString(record.company_name),
        company_description: parseIfString(record.company_description),
        industry: parseIfString(record.industry),
        business_model: parseIfString(record.business_model),
        management_team: parseIfString(record.management_team),
        revenue: parseIfString(record.revenue),
        revenue_growth: parseIfString(record.revenue_growth),
        gross_profit: parseIfString(record.gross_profit),
        ebitda: parseIfString(record.ebitda),
        expenses: parseIfString(record.expenses),  // 

      };

      // await fetch('/api/saveRecord', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(cleanedRecord),
      // });



    } catch (error) {
      console.error('❌ Upload failed:', error);
    } finally {
      setUploadingCount((count) => count - 1);
      setLoading(false);
    }
  };
  

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   // if (e.target.files?.[0]) {
  //   //   handleUpload(e.target.files[0]);
  //   // }
  //   // file handler for multiple files to be looped over
  //   if (e.target.files) {
  //     Array.from(e.target.files).forEach((file) => {
  //       handleUpload(file);
  //   });
  // };
  // Handling multiple files in parallel

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
  
    Array.from(files).forEach((file) => {
      handleUpload(file);
    });
  
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-6 md:px-8 py-4 overflow-visible">

      {/* <div className="flex justify-between items-center mb-2"> */}
      {/* for responsive design  */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-2"> 

        {/* <h1 className="text-2xl font-semibold">ProSights</h1> */}
        <div className="flex items-center space-x-2 pl-4">
          {/* <img src="/prosights_logo1.png" alt="ProSights" className="h-8 w-auto" /> */}
          <img src="/prosights_logo1.png" alt="ProSights" className="h-30 w-30 w-auto mr-2" />

          <span className="text-l font-light text-gray-800">Deal dashboard</span>
          {/* <span className="text-2xl font-bold text-gray-900 tracking-tight">ProSights</span> */}

        </div>

        {/* <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={triggerFileSelect}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded hover:bg-blue-100 transition"
          >
            <Upload size={16} />
            {loading ? 'Processing...' : 'Add Document'}
          </button>
        </div> */}
        <div className="flex space-x-3">
          {/* <button
            onClick={triggerFileSelect}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-sm text-gray-600 font-normal rounded hover:bg-blue-50 transition"
            >
            <Upload size={16} />
            {loading ? 'Processing...' : 'Add Document'}
          </button>  */}
          {/* Adding a spinener to Add Dcoument button */}
          {/* <button
            onClick={triggerFileSelect}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-sm text-gray-600 font-normal rounded hover:bg-blue-50 transition"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Upload size={16} />
                Add Document
              </>
            )}
          </button> */}
          {/* Addingm multple spinner for multiple file uploads */}
          <button
            onClick={triggerFileSelect}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-sm text-gray-600 font-normal rounded hover:bg-blue-50 transition"
            >
            {uploadingCount > 0 ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Uploading {uploadingCount}...
              </>
            ) : (
              <>
                <Upload size={16} />
                Add Document
              </>
            )}
          </button>

          <button
            // onClick={() => alert('Export to CSV triggered!')}
            // implementing the export function now
            onClick={() => exportToXLSX(results, columns)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-sm text-gray-600 font-normal rounded hover:bg-blue-50 transition"
            >
            Export to XLS
          </button>

{/* ///////////////////////// ////////////////////////////////////////////////////////////////////////////////////////////// */}
{/* ////////// */}

          <button
            onClick={() => setShowFieldModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-sm text-gray-600 font-medium rounded hover:bg-blue-200 transition"
            >
            + Add Custom Field
          </button>
{/* ///////////// */}
{/* ///////////////////////// ////////////////////////////////////////////////////////////////////////////////////////////// */}

          <input
            ref={fileInputRef}  
            type="file"
            // Adding multiple file uploading now 
            multiple              
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"


          />

      </div>


      </div>

      {/* testing hover working on above the table */}
      {/* <div className="group relative w-fit bg-yellow-100 text-sm px-2 py-1 mt-4">
        Hover test
        <div className="absolute z-50 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-md top-full mt-1">
           Tooltip is working!
        </div>
      </div> */}
      
      {/* <div className="w-full bg-white p-6 rounded-lg shadow-md overflow-x-auto"> */}
      {/* THIS IS LINE overflow-x-auto will fx the table going over visble browser width */}

      {/* <div className="w-full bg-white p-6 rounded-lg shadow-md overflow-visible"> */}
      <div className="w-full bg-white p-6 rounded-lg shadow-md relative overflow-visible z-0">
        {/* <table className="min-w-full text-sm text-gray-800 border border-gray-200"> */}
        {/* // removing vertical table lines    */}
        {/* <table className="min-w-full text-sm text-gray-800 border-y border-gray-200"> */}
        {/* <table className="min-w-full text-sm text-gray-800 border-t border-l border-b border-transparent"> */}
        <div className="overflow-x-auto relative z-0">
          <table className="min-w-full text-sm text-gray-800 relative z-0">

              <thead className="bg-gray-100 text-left text-gray-600 uppercase text-xs tracking-wider">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      // className="px-4 py-3 border-b border-gray-200 whitespace-nowrap"
                      className={`px-2 py-3 whitespace-nowrap ${
                        col.key === 'actions' ? 'bg-white border-none bg-transparent' : 'border-y border-gray-200 border-x border-transparent'
                      }`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center text-gray-400 py-6"
                    >
                      No documents added yet.
                    </td>
                  </tr>
                ) : (
                  results.map((row, idx) => (
                    /////////////////
                    <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                      {columns.map(({ key }) =>
                        key === 'actions' ? (
                          // <td key="delete" className="px-2 py-3 border-b border-transparent align-middle text-center bg-transparent">
                        <td key="delete" className="bg-white group-hover:bg-white align-middle text-center px-3 bg-transparent border-none">
                            <button
                              onClick={() => {
                                const updated = results.filter((_, i) => i !== idx);
                                setResults(updated);
                                //  aall persistent deletion API here if time allows me
                              }}
                              className="text-red-500 text-lg font-light hover:text-red-700 leading-none"
                              title="Delete row"
                            >
                              ×
                            </button>
                          </td>
                        ) : (
                          ////////
                          // <td key={key} className="px-2 py-3 text-left align-center">
                          //   {/* {[ 'company_description', 'company_name', 'business_model', 'management_team', 'revenue', 'revenue_growth', 'industry', 'ebitda', 'gross_profit'].includes(key) ? ( */}
                          //   {/* // {['company_description', 'management_team', 'revenue', 'industry'].includes(key) ? ( */}
                          //     {/* (() => { */}
                          //       {/* const cellKey = `${idx}-${key}`; */}
                          //       {/* const isExpanded = expandedCells[cellKey]; */}

                          //       {/* return ( */}
                          //         {/* <div */}
                          //           {/* className={`relative text-sm text-left whitespace-pre-wrap pr-6 transition-all duration-300 ease-in-out ${ */}
                          //             {/* isExpanded ? '' : 'max-h-[96px] overflow-hidden' */}
                          //           {/* }`} */}
                          //         {/* > */}
                          //           {/* <span>{row[key] || '—'}</span> */}

                          //           {/* {(row[key]?.length ?? 0) > 250 && ( */}
                          //             {/* <> */}
                          //               {/* {!isExpanded && ( */}
                          //                 {/* <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white/30 to-transparent pointer-events-none transition-opacity duration-300" /> */}
                          //               {/* )} */}
                          //               {/* <button */}
                          //                 {/* onClick={() => toggleExpanded(idx, key)} */}
                          //                 {/* className="absolute bottom-[-2px] right-[-2px] text-blue-500 bg-transparent hover:opacity-80 transition" */}
                          //                 {/* title={isExpanded ? 'Collapse' : 'Expand'} */}
                          //               {/* > */}
                          //                 {/* {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} */}
                          //               {/* </button> */}
                          //             {/* </> */}
                          //           {/* )} */}

                          //           {/* <span>{row[key] || '—'}</span> */}

                          //           {/* {!isExpanded && (row[key]?.length ?? 0) > 250 && ( */}
                          //             {/* <> */}
                          //               {/* Fade shadow */}
                          //               {/* <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" /> */}
                          //               {/* <button */}
                          //                 {/* onClick={() => toggleExpanded(idx, key)} */}
                          //                 {/* className="absolute bottom-0 right-1 text-blue-500 text-xs font-medium hover:underline bg-transparent" */}
                          //                 {/* > */}
                          //                 {/* more button to expand text in cell */}
                          //                 {/* ... */}
                          //               {/* </button> */}
                          //             {/* </> */}
                          //           {/* )} */}

                          //           {/* {isExpanded && ( */}
                          //             {/* <button */}
                          //               {/* onClick={() => toggleExpanded(idx, key)} */}
                          //               {/* className="absolute bottom-0 right-1 text-blue-500 text-xs font-medium hover:underline bg-transparent" */}
                          //               {/* > */}
                          //               {/* button to contract text in cell */}
                          //               {/* - less */}
                          //             {/* </button> */}
                          //           {/* )} */}


                          //         {/* </div> */}
                          //       {/* ); */}
                          //     {/* })() */}
                          //   {/* ) : ( */}
                          //     {/* <div className="truncate max-w-[200px] whitespace-nowrap" title={row[key]}> */}
                          //       {/* {row[key] || '—'} */}
                          //     {/* </div> */}
                          //   {/* )} */}

                          //   {Array.isArray(row[key]) ? (
                          //     <div className="relative group">
                          //       <div className="truncate max-w-[200px] whitespace-nowrap">
                          //         {row[key].map((entry: any) => entry.value).join(', ')}
                          //         {/* change to hover text just display page number */}
                          //         {/* {row[key].map((entry: any) => `Page ${entry.page}`).join(', ')}  */}

                          //       </div>
                          //       <div className="absolute z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-md top-full mt-1 w-max">
                          //         {row[key].map((entry: any, i: number) => (
                          //           <div key={i}>
                          //             {/* {entry.value} <span className="text-gray-400">(Page {entry.page})</span> */}
                          //             {entry.value} <span className="text-gray-400">(Page {entry.page}, {entry.source_document})</span>

                          //           </div>
                          //         ))}
                          //       </div>
                          //     </div>
                          //   ) : (
                          //     (() => {
                          //       const cellKey = `${idx}-${key}`;
                          //       const isExpanded = expandedCells[cellKey];

                          //       return (
                          //         <div
                          //           className={`relative text-sm whitespace-pre-wrap pr-6 transition-all duration-300 ease-in-out ${
                          //             isExpanded ? '' : 'max-h-[96px] overflow-hidden'
                          //           }`}
                          //         >
                          //           <span>{row[key] || '—'}</span>

                          //           {(row[key]?.length ?? 0) > 250 && (
                          //             <>
                          //               {!isExpanded && (
                          //                 <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white/30 to-transparent pointer-events-none transition-opacity duration-300" />
                          //               )}
                          //               <button
                          //                 onClick={() => toggleExpanded(idx, key)}
                          //                 className="absolute bottom-[-2px] right-[-2px] text-blue-500 bg-transparent hover:opacity-80 transition"
                          //                 title={isExpanded ? 'Collapse' : 'Expand'}
                          //               >
                          //                 {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          //               </button>
                          //             </>
                          //           )}
                          //         </div>
                          //       );
                          //     })()
                          //   )}
                                

                          // </td>
                        // <td key={key} className="px-2 py-3 text-left align-center">
                        //   {(() => {
                        //     let cellData = row[key];
                        
                        //     // Try parsing stringified JSON (common bug)
                        //     if (typeof cellData === 'string') {
                        //       try {
                        //         const parsed = JSON.parse(cellData);
                        //         if (Array.isArray(parsed)) cellData = parsed;
                        //       } catch (e) {}
                        //     }
                        
                        //     if (Array.isArray(cellData)) {
                        //       return (
                        //         <div className="relative group max-w-[200px] truncate whitespace-nowrap">
                        //           {cellData[0]?.value || '—'}
                        //           <div className="absolute z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-md top-full mt-1 w-max">
                        //             {cellData.map((entry: any, i: number) => (
                        //               <div key={i}>Page {entry.page}</div>
                        //             ))}
                        //           </div>
                        //         </div>
                        //       );
                        //     } else {
                        //       return (
                        //         <div className="truncate max-w-[200px] whitespace-nowrap">
                        //           {cellData || '—'}
                        //         </div>
                        //       );
                        //     }
                        //   })()}
                        // </td>
                        /////////
                        /////////
                        /////// THINGS ARE WORKING WITH THE FOLLOWING TD BLOCK WITHOUT THE HOVER
                        // <td key={key} className="px-2 py-3 text-left align-center">
                        //   {(() => {
                        //     let cellData = row[key];

                        //     // Attempt to parse stringified JSON
                        //     if (typeof cellData === 'string') {
                        //       try {
                        //         const parsed = JSON.parse(cellData);
                        //         if (Array.isArray(parsed)) cellData = parsed;
                        //       } catch {
                        //         // fallback: leave as string
                        //       }
                        //     }

                        //     // Render arrays (from JSONB or parsed JSON strings)
                        //     if (Array.isArray(cellData)) {
                        //       const values = cellData.map((entry: any) => entry?.value).filter(Boolean).join(', ');
                        //       return (
                        //         <div className="relative group max-w-[200px] truncate whitespace-nowrap">
                        //           {values || '—'}
                        //           <div className="absolute z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-md top-full mt-1 w-max">
                        //             {cellData.map((entry: any, i: number) => (
                        //               <div key={i}>
                        //                 {entry.value} <span className="text-gray-400">(Page {entry.page}, {entry.source_document})</span>
                        //               </div>
                        //             ))}
                        //           </div>
                        //         </div>
                        //       );
                        //     }

                        //     // Fallback for plain strings or empty
                        //     return (
                        //       <div className="truncate max-w-[200px] whitespace-nowrap">
                        //         {cellData || '—'}
                        //       </div>
                        //     );
                        //   })()}
                        // </td>
                        /////////////
                        /////////////
                        ///////////// HOVER IMPLEMENTATION WORKS TILL HERE \/ WELL BELOW:
                        
                        // <td key={key} className="group relative px-2 py-3 text-left align-middle">
                        //   {(() => {
                        //     let cellData = row[key];

                        //     if (typeof cellData === 'string') {
                        //       try {
                        //         const parsed = JSON.parse(cellData);
                        //         if (Array.isArray(parsed)) cellData = parsed;
                        //       } catch {}
                        //     }

                        //     if (Array.isArray(cellData) && cellData.length > 0) {
                        //       return (
                        //         <div className="max-w-[200px] truncate whitespace-nowrap text-ellipsis">
                        //           <span className="cursor-pointer">
                        //             {cellData[0]?.value || '—'}
                        //           </span>

                        //           {/* Tooltip that now works when hovering over the <td> */}
                        //           {/* <div className="absolute hidden group-hover:block bg-red-500 text-white text-xs rounded px-2 py-1 shadow-lg top-full mt-1 w-[300px] whitespace-normal z-50"> */}
                        //           <div className="absolute hidden group-hover:block bg-gray-600 text-white text-xs rounded px-2 py-1 shadow-lg top-full mt-1 w-[300px] whitespace-normal z-50">

                        //             {/* DEBUG TOOLTIP<br /> */}
                        //             {cellData.map((entry: any, i: number) => (
                        //               <div key={i}>
                        //                 {entry.value}{' '}
                        //                 <span className="text-gray-300">
                        //                   (Page {entry.page}, {entry.source_document})
                        //                 </span>
                        //               </div>
                        //             ))}


                        //           </div>
                        //         </div>
                        //       );
                        //     }

                        //     return (
                        //       <div className="truncate max-w-[200px] whitespace-nowrap">
                        //         {cellData || '—'}
                        //       </div>
                        //     );
                        //   })()}
                        // </td>
                        
                    // <td
                    //     key={key}
                    //     className="px-2 py-3 text-left align-middle cursor-pointer"
                    //     onClick={() => toggleExpanded(idx, key)}
                    //   >
                    //     {(() => {
                    //       let cellData = row[key];
                    //       const cellKey = `${idx}-${key}`;
                    //       const isExpanded = expandedCells[cellKey];
  
                    //       if (typeof cellData === 'string') {
                    //         try {
                    //           const parsed = JSON.parse(cellData);
                    //           if (Array.isArray(parsed)) cellData = parsed;
                    //         } catch {}
                    //       }
  
                    //       if (Array.isArray(cellData) && cellData.length > 0) {
                    //         return (
                    //           <div className="relative max-w-[200px]">
                    //             {/* Display all values inline */}
                    //             <div
                    //               className={`group ${
                    //                 isExpanded
                    //                   ? 'whitespace-pre-wrap'
                    //                   : 'truncate whitespace-nowrap text-ellipsis'
                    //               }`}
                    //             >
                    //               <span>
                    //                 {cellData.map((entry: any) => entry.value).join(' | ') || '—'}
                    //               </span>
  
                    //               {/* Tooltip visible on hover without click */}
                    //               <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg top-full mt-1 w-[300px] whitespace-normal z-50">
                    //                 {cellData.map((entry: any, i: number) => (
                    //                   <div key={i}>
                    //                     <span className="text-gray-400">Page {entry.page}:</span> {entry.value}
                    //                   </div>
                    //                 ))}
                    //               </div>
                    //             </div>
                    //           </div>
                    //         );
                    //       }
  
                    //       // Non-array fallback
                    //       return (
                    //         <div
                    //           className={`${
                    //             isExpanded
                    //               ? 'whitespace-pre-wrap'
                    //               : 'truncate max-w-[200px] whitespace-nowrap'
                    //           }`}
                    //         >
                    //           {cellData || '—'}
                    //         </div>
                    //       );
                    //     })()}
                    // </td>
                        ///////////// DONT FUCK WITH ANYTHING ABOVE THIS!!!
                        /////////////CONDUCTING ALL TESTING BELOW THIS LINE TO MODIFY HOVER DATA!!

                        // <td key={key} className="group relative px-2 py-3 text-left align-middle">
                        //   {(() => {
                        //     let cellData = row[key];

                        //     if (typeof cellData === 'string') {
                        //       try {
                        //         const parsed = JSON.parse(cellData);
                        //         if (Array.isArray(parsed)) cellData = parsed;
                        //       } catch {}
                        //     }

                        //     if (Array.isArray(cellData) && cellData.length > 0) {
                        //       return (
                        //         <div className="max-w-[200px] truncate whitespace-nowrap text-ellipsis">
                        //           <span className="cursor-pointer">
                        //             {cellData[0]?.value || '—'}
                        //           </span>

                        //           {/* Tooltip that now works when hovering over the <td> */}
                        //           {/* <div className="absolute hidden group-hover:block bg-red-500 text-white text-xs rounded px-2 py-1 shadow-lg top-full mt-1 w-[300px] whitespace-normal z-50"> */}
                        //           <div className="absolute hidden group-hover:block bg-gray-600 text-white text-xs rounded px-2 py-1 shadow-lg top-full mt-1 w-[300px] whitespace-normal z-50">

                        //             {/* DEBUG TOOLTIP<br /> */}
                        //             {cellData.map((entry: any, i: number) => (
                        //               <div key={i}>
                        //                 <span className="text-gray-400">Page {entry.page}:</span> {entry.value}
                        //               </div>
                        //             ))}


                        //           </div>
                        //         </div>
                        //       );
                        //     }

                        //     return (
                        //       <div className="truncate max-w-[200px] whitespace-nowrap">
                        //         {cellData || '—'}
                        //       </div>
                        //     );
                        //   })()}
                        // </td>
                        /////// the above is working to show hover data automaically but it DOES NOT display ALL VALUE PAIRS in the cell
                        // <td
                        // key={key}
                        // className="px-2 py-3 text-left align-middle"
                        // onClick={() => toggleExpanded(idx, key)}
                        // >
                        // {(() => {
                        //   let cellData = row[key];
                        //   const cellKey = `${idx}-${key}`;
                        //   const isExpanded = expandedCells[cellKey];

                        //   if (typeof cellData === 'string') {
                        //     try {
                        //       const parsed = JSON.parse(cellData);
                        //       if (Array.isArray(parsed)) cellData = parsed;
                        //     } catch {}
                        //   }

                        //   if (Array.isArray(cellData) && cellData.length > 0) {
                        //     return (
                        //       <div
                        //         className={`group relative ${
                        //           isExpanded ? 'whitespace-pre-wrap' : 'max-w-[200px] truncate whitespace-nowrap text-ellipsis'
                        //         } cursor-pointer`}
                        //       >
                        //         <span className="cursor-pointer">
                        //           {cellData.map((entry: any) => entry.value).join(' | ') || '—'}
                        //         </span>
                        //         {/* adding the above line to display all value pairs in array */}
                                
                        //         {/* <span className="cursor-pointer whitespace-pre-wrap block">
                        //           {cellData.map((entry: any, i: number) => (
                        //             <div key={i}>{entry.value}</div>
                        //           ))}
                        //         </span> */}


                        //         {/* Tooltip stays the same */}
                        //         <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg top-full mt-1 w-[300px] whitespace-normal z-50">
                        //           {cellData.map((entry: any, i: number) => (
                        //             <div key={i}>
                        //               <span className="text-gray-400">Page {entry.page}:</span> {entry.value}
                        //             </div>
                        //           ))}
                        //         </div>
                        //       </div>
                        //     );
                        //   }

                        //   return (
                        //     <div
                        //       className={`${
                        //         isExpanded ? 'whitespace-pre-wrap' : 'truncate max-w-[200px] whitespace-nowrap'
                        //       } cursor-pointer`}
                        //     >
                        //       {cellData || '—'}
                        //     </div>
                        //   );
                        // })()}
                        // </td>
                         /////// the above is working to show hover data ON CLICKING but it DOES display ALL VALUE PAIRS in the cell
                      ///////////////////////////////////////////////
                      //////////////////////////////////////////////
                      //////////////////////////////////////////////
                      ///// THIS IS WORKING <td> block with best implementation so far!!
                      <td
                      key={key}
                      className="px-2 py-3 text-left align-middle cursor-pointer"
                      onClick={() => toggleExpanded(idx, key)}
                      >
                      {(() => {
                        let cellData = row[key];
                        const cellKey = `${idx}-${key}`;
                        const isExpanded = expandedCells[cellKey];

                        if (typeof cellData === 'string') {
                          try {
                            const parsed = JSON.parse(cellData);
                            if (Array.isArray(parsed)) cellData = parsed;
                          } catch {}
                        }

                        if (Array.isArray(cellData) && cellData.length > 0) {
                          return (
                            <div className="relative max-w-[200px]">
                              {/* Display all values inline */}
                              <div
                                className={`group ${
                                  isExpanded
                                    ? 'whitespace-pre-wrap'
                                    : 'truncate whitespace-nowrap text-ellipsis'
                                }`}
                              >
                                <span>
                                  {cellData.map((entry: any) => entry.value).join(' | ') || '—'}
                                </span>

                                {/* Tooltip visible on hover without click */}
                                <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg top-full mt-1 w-[300px] whitespace-normal z-50">
                                  {cellData.map((entry: any, i: number) => (
                                    <div key={i}>
                                      <span className="text-gray-400">Page {entry.page}:</span> {entry.value}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Non-array fallback
                        return (
                          <div
                            className={`${
                              isExpanded
                                ? 'whitespace-pre-wrap'
                                : 'truncate max-w-[200px] whitespace-nowrap'
                            }`}
                          >
                            {cellData || '—'}
                          </div>
                        );
                      })()}
                      </td>

                      //////////ABOVE THIS IS WORKING FOR BOTH HOVER AND EXPANDING/COLLAPSING ROWS!!!!
                      ////////?DONT TOUCH SHIT ABOVE THIS!!!
    
                        //////////////
                        //////////////
                        //////////////
                        )
                      )}
                    </tr>


                  ))
                  
                  
                )}
              </tbody>
          </table>
        </div>

      </div>
{/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
{/* /////////////////// */}
      {/* Modal for adding field */}
      {/* {showFieldModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-xl w-full max-w-md">
            <h2 className="text-small font-light color-gray-600 mb-3">Add Custom Field</h2>
            <input
              type="text"
              placeholder="Field name (e.g. expenses)"
              className="w-full mb-3 border px-3 py-2 rounded"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
            />
            <textarea
              placeholder="Purpose for extraction (used in AI prompt)"
              className="w-full mb-3 border px-3 py-2 rounded"
              rows={4}
              value={fieldPurpose}
              onChange={(e) => setFieldPurpose(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowFieldModal(false)} className="text-gray-500 hover:underline">Cancel</button>
              <button onClick={submitCustomField} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add</button>
            </div>
          </div>
        </div>
      )} */}
      {showFieldModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-transparent bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md px-6 py-5 space-y-5 text-gray-800">
            <h2 className="text-sm font-light text-gray-800">Add Custom Field</h2>

            <input
              type="text"
              placeholder="Field name (e.g. expenses)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
            />

            <textarea
              placeholder="Purpose for extraction (used in AI prompt)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={4}
              value={fieldPurpose}
              onChange={(e) => setFieldPurpose(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowFieldModal(false)}
                className="text-sm text-gray-600 hover:text-gray-800 transition"
              >
                Cancel
              </button>
              {/* <button
                onClick={submitCustomField}
                className="text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition"
              >
                Add
              </button> */}
              <button
                onClick={submitCustomField}
                disabled={!newFieldName.trim() || !fieldPurpose.trim()}
                className={`px-4 py-2 rounded transition ${
                  !newFieldName.trim() || !fieldPurpose.trim()
                    ? 'bg-gray-300 text-sm text-gray-500 cursor-not-allowed'
                    : 'bg-blue-300 text-sm text-white hover:bg-blue-500'
                }`}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

{/* /////////////////// */}
{/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

    </main>
  );
}
