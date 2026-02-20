import React, {useEffect, useState} from "react";
import "./Dashboard.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

const API_URL="http://127.0.0.1:8000/api/";

const STAT_CARD_COLORS = {
  division: "#ffffff",        
  prabhag: "#ffffff",         
  building: "#ffffff",        
  permission: "#ffffff",  //DBA667 A39595 C6C1A5
       
};
export default function Dashboard() {

    const [leads, setLeads] = useState([]);
    const [selectedStat, setSelectedStat] = useState("Total Leads");
    const [showForm, setShowForm] = useState(false);
    const[selectedCompany, setSelectedCompany] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [editableData, setEditableData] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [fieldValue, setFieldValue] = useState("");
    const [activeTab, setActiveTab] = useState("Updates");
    const [statusFilter, setStatusFilter] = useState("All");
    const [newCompany, setNewCompany] = useState({
  CompanyName: "",
  domain: "",
  poc: "",
  email: "",
  phone: "",
  status: "Under Progress"
});

const getFavicon = (website, domain) => {
  if (website) {
    try {
      return `https://www.google.com/s2/favicons?sz=64&domain=${new URL(website).hostname}`;
    } catch {
      return null;
    }
  }

  if (domain) {
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  }

  return null;
};


const extractEmail = (text = "") => {
  const match = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  );
  return match ? match[0].trim() : "";
};

const extractPhone = (text = "") => {
  const match = text.match(
    /(\+?\d{1,3}[\s-]?)?(\d[\s-]?){10}/
  );
  return match ? match[0].replace(/\s+/g, "").trim() : "";
};

const extractName = (text = "") => {
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "")
    .replace(/(\+?\d{1,3}[\s-]?)?(\d[\s-]?){10}/g, "")
    .replace(/\b\d+\b/g, "")
    .replace(/mobile\s*no\.?|phone|email|contact|LEAD|Consultancy/gi, "")
    .replace(/\(.*?\)/g, "")
    .replace(/[|,<>:/]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};


// const parseExcelDate = (value) => {
//   if (!value) return null;

//   if (typeof value !== "string") return null;


//   const cleanValue = value.replace("-", "-").trim();

//   const slashMatch = cleanValue.match(
//     /(\d{1,2})\/(\d{1,2})\/(\d{4}).*?(\d{1,2})(?::(\d{2}))?\s?(am|pm)/i
//   );

//   if (slashMatch) {
//     let day = parseInt(slashMatch[1]);
//     let month = parseInt(slashMatch[2]) - 1;
//     let year = parseInt(slashMatch[3]);
//     let hour = parseInt(slashMatch[4]);
//     let minute = parseInt(slashMatch[5] || "0");
//     let ampm = slashMatch[6].toLowerCase();

//     if (ampm === "pm" && hour < 12) hour += 12;
//     if (ampm === "am" && hour === 12) hour = 0;

//     return new Date(year, month, day, hour, minute);
//   }


//   const textMatch = cleanValue.match(
//     /(\d{1,2})\s([A-Za-z]+)\s(\d{4})\s(\d{1,2})(?::(\d{2}))?\s?(am|pm)/i
//   );

//   if (textMatch) {
//     let day = parseInt(textMatch[1]);
//     let monthName = textMatch[2];
//     let year = parseInt(textMatch[3]);
//     let hour = parseInt(textMatch[4]);
//     let minute = parseInt(textMatch[5] || "0");
//     let ampm = textMatch[6].toLowerCase();

//     const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();

//     if (ampm === "pm" && hour < 12) hour += 12;
//     if (ampm === "am" && hour === 12) hour = 0;

//     return new Date(year, monthIndex, day, hour, minute);
//   }

//   return null;
// };

// const nameFromEmail = (email = "") => {
//   if (!email) return "";

//   return email
//     .split("@")[0]          
//     .replace(/[._-]+/g, " ") 
//     .replace(/\b\w/g, c => c.toUpperCase()) 
//     .trim();
// };

useEffect(() => {
  fetch(API_URL)
    .then(res => res.json())
    .then(result => {
  if (result.status === "success") {
    const cleaned = result.data.companies.map(c => ({
      ...c,
      meetingDate: c.meetingDate
        ? new Date(c.meetingDate)
        : null
    }));

    setLeads(cleaned);
  }
})

    .catch(err => console.error("Error loading companies:", err));
}, []);


// Helpers
const totalLeads = leads.filter(
  l => l.CompanyName || l.Company_Name
).length;

const positiveLeads = leads.filter(
  l => l.status === "Positive"
).length;

const conversationLeads = leads.filter(
  l => l.status === "Under Progress"
).length;

const notInterestedLeads = leads.filter(
  l => l.status === "Not Interested"
).length;

const filteredCompanies = leads.filter(lead =>
  lead.CompanyName?.toLowerCase().includes(searchText.toLowerCase())
);

const visibleCompanies = filteredCompanies.filter(lead => {
  if (statusFilter === "All") return lead.status !== "Skip";
  return lead.status === statusFilter;
});


const isToday = (date) => {
  if (!date) return false;

  const today = new Date();

  const meetingDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return meetingDate.getTime() === currentDate.getTime();
};

const [updates, setUpdates] = useState([]);

useEffect(() => {

  const savedReadMap =
    JSON.parse(localStorage.getItem("readUpdates")) || {};

  const today = new Date();

  
  const currentDay = today.getDay(); 
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const startOfThisWeek = new Date(today);
  startOfThisWeek.setDate(today.getDate() + diffToMonday);
  startOfThisWeek.setHours(0, 0, 0, 0);

  
  const startOfNextWeek = new Date(startOfThisWeek);
  startOfNextWeek.setDate(startOfThisWeek.getDate() + 7);

 
  const endOfNextWeek = new Date(startOfNextWeek);
  endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
  endOfNextWeek.setHours(23, 59, 59, 999);

  const formattedUpdates = leads
    .filter(l => {
      if (!l.meetingDate) return false;

      const meetingDate = new Date(l.meetingDate);

      return (
        meetingDate >= startOfNextWeek &&
        meetingDate <= endOfNextWeek
      );
    })
    .sort((a, b) => a.meetingDate - b.meetingDate)
    .map((lead, index) => ({
      id: index,
      description: `Meeting update for ${lead.CompanyName}`,
      time: lead.meetingDate,
      read: savedReadMap[index] || false
    }));

  setUpdates(formattedUpdates);

}, [leads]);



const formatDate = (dateValue) => {
  if (!dateValue) return "No Date";

  const date = new Date(dateValue);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }) +
  " · " +
  date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};


const getDateColor = (dateValue) => {
  if (!dateValue) return "#adb5bd";

  const date = new Date(dateValue);
  const today = new Date();

  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays =
    (date - today) / (1000 * 60 * 60 * 24);

  if (diffDays === 0) return "#dc3545";   
  if (diffDays <= 2 && diffDays > 0) return "#fd7e14"; 
  if (diffDays > 2) return "#0d6efd";     

  return "#6c757d"; 
};

const unreadUpdates = updates.filter(u => !u.read).length;
const markAsRead = (id) => {
  setUpdates(prev => {
    const updated = prev.map(update =>
      update.id === id ? { ...update, read: true } : update
    );

    const readMap = {};
    updated.forEach(u => {
      if (u.read) readMap[u.id] = true;
    });
    localStorage.setItem("readUpdates", JSON.stringify(readMap));
    return updated;
  });
};

const today = new Date();
today.setHours(0, 0, 0, 0);

const upcomingMeetings = leads
  .filter(l => l.meetingDate)
  .map(l => ({
    company: l.CompanyName,
    date: l.meetingDate
  }))
  .filter(m => {
    const meetingDay = new Date(
      m.date.getFullYear(),
      m.date.getMonth(),
      m.date.getDate()
    );
    return meetingDay >= today;
  })
  .sort((a, b) => a.date - b.date);

const updateCompany = async (company) => {
  try {
    const response = await fetch(`${API_URL}${company.id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(company)
    });

    const result = await response.json();

    if (result.status === "success") {
   
      const res = await fetch(API_URL);
      const data = await res.json();
      
      // Convert meetingDate strings to Date objects
      const cleaned = data.data.companies.map(c => ({
        ...c,
        meetingDate: c.meetingDate ? new Date(c.meetingDate) : null
      }));
      
      setLeads(cleaned);
    }

  } catch (error) {
    console.error("Update failed:", error);
  }
};

const addCompany = async (newCompany) => {
  try {
    const response = await fetch(`${API_URL}addcompany`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newCompany)
    });

    const result = await response.json();

    if (result.status === "success") {
      const res = await fetch(API_URL);
      const data = await res.json();
      
      // Convert meetingDate strings to Date objects
      const cleaned = data.data.companies.map(c => ({
        ...c,
        meetingDate: c.meetingDate ? new Date(c.meetingDate) : null
      }));
      
      setLeads(cleaned);
      setShowForm(false);
    }

  } catch (error) {
    console.error("Add failed:", error);
  }
};

const deleteCompany = async (id) => {
  try {
    const response = await fetch(`${API_URL}${id}/`, {
      method: "DELETE"
    });

    const result = await response.json();

    if (result.status === "success") {
      setLeads(prev => prev.filter(c => c.id !== id));
    }

  } catch (error) {
    console.error("Delete failed:", error);
  }
};


  return (
     <div className="container-fluid p-1">
        <div style={{ padding: "20px" }}>
      <div className="container-fluid mb-0">
  <div className="card border-0 text-center" style={{backgroundColor: "#232323"}}>
    <div className="card-body py-2">
    
      <h2
        className="fw-bold text-light mb-0"
        title="B2B Data"
        style={{
          cursor:"pointer",
          letterSpacing: "1px",
          transition: "transform 0.3s ease"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
      <img src="/B2B.ico" className="me-2" alt="icon"
              width="30" height="30"/>Bussiness Management Software
      </h2>

      <small className="text-light d-block mt-2">
        Bussiness Management Planning
      </small>

    </div>
  </div>
</div>

{/* ------------End header----------------- */}

<hr style={{color:"#ffffff"}}/>
<div className="row ms-2 mt-3 px-3 align-items-start">
  <div className="col-md-3 d-flex flex-column gap-3 mt-4">
    <StatCard title="Total Leads" value={totalLeads}
    active={selectedStat === "Total Leads"} onClick={() => setSelectedStat("Total Leads")}/>

    <StatCard title="Conversation Under Progress" value={conversationLeads}
    active={selectedStat === "Conversation Under Progress"}
    onClick={() => setSelectedStat("Conversation Under Progress")}/>
  
  </div>
<div className="col-md-3 ms-2 d-flex flex-column gap-3 mt-4">
            <StatCard title="Positives" value={positiveLeads} active={selectedStat === "Positives"}
            onClick={() => setSelectedStat("Positives")}/>

            <StatCard title="Client Not Interested" value={notInterestedLeads} 
            color={STAT_CARD_COLORS.permission} active={selectedStat === "Client Not Interested"}
            onClick={() => setSelectedStat("Client Not Interested")}/>
          </div>

{/* Updates */}
  <div className="ms-5 col-md-5">
    <ul className="nav nav-tabs border-0 ms-2">
  {/* Updates Tab */}
  <li className="nav-item">
    <span
      onClick={() => setActiveTab("Updates")}
      className="nav-link fw-bold px-4 py-2 position-relative"
      style={{
        backgroundColor:
          activeTab === "Updates" ? "#0d6efd" : "#000000",
        color: "#fff",
        borderRadius: "8px 8px 0 0",
        border: "none",
        fontSize: "16px",
        cursor: "pointer",
        transition: "0.2s ease"
      }}
    >
      Updates

      {unreadUpdates > 0 && activeTab === "Updates" && (
        <span
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          style={{ fontSize: "10px" }}
        >
          {unreadUpdates}
        </span>
      )}
    </span>
  </li>

  {/* Responses Tab */}
  <li className="nav-item">
    <span
      onClick={() => setActiveTab("Responses")}
      className="nav-link fw-bold px-4 py-2 ms-1"
      style={{
        backgroundColor:
          activeTab === "Responses" ? "#0d6efd" : "#000000",
        color: "#fff",
        borderRadius: "8px 8px 0 0",
        border: "none",
        fontSize: "16px",
        cursor: "pointer",
        transition: "0.2s ease"
      }}
    >
      Responses
    </span>
  </li>
</ul>

    <div
      className="card bg-dark border-0 shadow-sm"
      style={{ maxHeight: "170px", overflowY: "auto" }}
    >
      <div className="card-body p-2">

  {/* Updates Tab  */}
  {activeTab === "Updates" &&
    (updates.length === 0 ? (
      <div className="small text-muted">
        No upcoming updates
      </div>
    ) : (
      updates.map((update) => (
        <div
          key={update.id}
          onClick={() => markAsRead(update.id)}
          className="d-flex align-items-start gap-2 mb-2 p-2 rounded text-start"
          style={{
            background: update.read ? "#2d2d2d" : "#3a3a3a",
            borderLeft: update.read
              ? "4px solid #6c757d"
              : "4px solid #0d6efd",
            cursor: "pointer",
            transition: "0.2s ease"
          }}
        >
          <div className="flex-grow-1">
            <div
              className="small"
              style={{
                color: update.read ? "#bdbdbd" : "#ffffff",
                fontWeight: update.read ? "normal" : "bold"
              }}
            >
              {update.description}
            </div>

            <div
              className="text-start fw-semibold"
              style={{
                fontSize: "11px",
                color: getDateColor(update.time)
              }}
            >
              {formatDate(update.time)}
            </div>
          </div>
        </div>
      ))
    ))}

  {/*  Response Tab */}
  {activeTab === "Responses" &&
  (leads.filter(
    l =>
      l.response &&
      l.response.trim() !== "" &&
      l.response.trim().toLowerCase() !== "na"
  ).length === 0 ? (
    <div className="small text-muted">
      No responses available
    </div>
  ) : (
    leads
      .filter(
        l =>
          l.response &&
          l.response.trim() !== "" &&
          l.response.trim().toLowerCase() !== "na"
      )
      .map((lead, index) => (
        <div
          key={index}
          className="mb-2 p-2 rounded text-start"
          style={{
            background: "#3a3a3a",
            borderLeft: "4px solid #198754"
          }}
        >
          <div className="fw-bold small text-light mb-1">
            {lead.CompanyName}
          </div>

          <div className="small text-light">
            {lead.response}
          </div>
        </div>
      ))
  ))}


</div>

    </div>
  </div>
</div>


{/* End */}
<hr style={{color:"#ffffff"}}/>

<div className="row mt-2 mb-3 align-items-center">
  <div className="col-12">
    <div className="card border-0 shadow-sm bg-dark text-light">
      <div className="card-body py-2 px-3">

        <h6 className="fw-bold text-warning mb-2" style={{cursor:"pointer"}}>
          Upcoming Meetings
        </h6>

        {upcomingMeetings.length === 0 && (
          <div className="small text-muted">
            No upcoming meetings scheduled
          </div>
        )}

        <div className="d-flex gap-2">
          {upcomingMeetings.slice(0, 3).map((m, idx) => (
            <div
  key={idx}
  className={`flex-fill p-2 rounded d-flex justify-content-between align-items-center upcoming-meeting-card ${
    isToday(m.date) ? "meeting-today" : ""
  }`}
  style={{
    backgroundColor: "#2d2d2d",
    borderLeft: "4px solid #fd7e14",
    minWidth: "0"
  }}
>
{/* Company */}
  <span
    className="small fw-semibold text-truncate"
    title={m.company}
    style={{ maxWidth: "65%" }}
  >
    {m.company}
  </span>
  {/* Date first */}
  <span className="small text-info fw-semibold me-2">
    {m.date.toLocaleString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true
})}

  </span>  
</div>
          ))}
        </div>

      </div>
    </div>
  </div>
</div>


{/* Upcoming meeting end */}
<div className="row mt-2 mb-3 align-items-center">
  <div className="col-3 text-start text-light bg-se">
    <h3 className="mb-0  fs-3 ms-1">{selectedStat}</h3>
  </div>

  <div className="col-5">
    <div className="row mt-2 mb-3">
  <div className="col-12 d-flex justify-content-start">
    <div className="dropdown">
      <button
        className="btn btn-outline-light dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
      >
        {statusFilter}
      </button>

      <ul className="dropdown-menu dropdown-menu-start">
        <li>
          <button
            className="dropdown-item"
            onClick={() => setStatusFilter("All")}
          >
            All
          </button>
        </li>
        <li>
          <button
            className="dropdown-item"
            onClick={() => setStatusFilter("Quotation")}
          >
            Quotation Send
          </button>
        </li>
        <li>
          <button
            className="dropdown-item"
            onClick={() => setStatusFilter("Interested")}
          >
            Interested
          </button>
        </li>
        <li>
          <button
            className="dropdown-item"
            onClick={() => setStatusFilter("Awaiting for Meeting")}
          >
            Awaiting for Meeting
          </button>
        </li>
        <li>
          <button
            className="dropdown-item"
            onClick={() => setStatusFilter("Skip")}
          >
            Skip
          </button>
        </li>
      </ul>
    </div>
  </div>
</div>

</div>
  <div className="col-4 text-end">
    <span
  className="badge bg-primary px-3 py-2 me-3"
  style={{ cursor: "pointer", fontSize: "16px" }}
  onClick={() => {
  setShowForm(prev => {
    const newValue = !prev;

    if (newValue) {
      setSelectedCompany(null); 
    }

    return newValue;
  });
}}
>
  + Add Company
</span>
  </div>
</div>

{/* End List */}
        <div className="row mt-2">
  <div className="col-3 text-light" >
  <ul className="list-group">
   <li
  className="list-group-item active fw-bold position-relative"
  style={{ backgroundColor: "#60A5FA" }}
>
  <div className="d-flex align-items-center justify-content-center position-relative">

    {/* Center Area */}
    {!showSearch ? (
      <span className="text-center w-100">Company Names</span>
    ) : (
      <input
        type="text"
        className="form-control form-control-sm text-center"
        placeholder="Search company..."
        style={{ width: "60%" }}
        autoFocus
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
    )}

    {/* Search Icon - Always Right */}
    <FontAwesomeIcon
      icon={faMagnifyingGlass}
      className="text-light position-absolute"
      style={{
        right: "10px",
        cursor: "pointer"
      }}
      onClick={() => setShowSearch(prev => !prev)}
    />

  </div>
</li>


    {/* Company List */}
<div className="company-list-scroll" >
{/* Normal Companies */}
{visibleCompanies.length === 0 ? (
  <li className="list-group-item text-center text-muted">
    No Results Found
  </li>
) : (
  visibleCompanies.map((lead, index) => (
    <li
      key={index}
      className={`list-group-item company-item text-center ${
        selectedCompany?.CompanyName === lead.CompanyName ? "active" : ""
      }`}
      onClick={() => {
        setSelectedCompany(lead);
        setShowForm(false);
      }}
    >
      <span className="d-flex justify-content-center align-items-center gap-2">
        <img
          src={getFavicon(lead.website, lead.domain)}
          alt=""
          style={{ width: "16px", height: "16px" }}
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        <span>{lead.CompanyName}</span>
      </span>
    </li>
  ))
)}
</div>
</ul>
  
</div>

<div className="col-9 text-light">
{/* End list  */}

  {selectedCompany && (
    <>
    <div className="card bg-dark text-light shadow-sm">
      <div className="card-body">

        <h4 className="mb-3 text-start company-web">
  <a
    href={selectedCompany.website}
    target="_blank"
    rel="noopener noreferrer"
    className="d-flex align-items-center gap-2 text-decoration-none"
  >
    <img
      src={getFavicon(selectedCompany.website, selectedCompany.domain)}
      alt=""
      style={{ width: "20px", height: "20px" }}
      onError={(e) => (e.currentTarget.style.display = "none")}
    />
    <span>{selectedCompany.CompanyName}</span>
  </a>
</h4>
 <div
   className="position-absolute d-flex gap-2"
   style={{
     top: "10px",
     right: "10px"
   }}
 >
 
   {/* Skip  */}
   {selectedCompany.status !== "Skip" && (
     <button
       className="btn btn-sm btn-danger"
       onClick={async () => {
  try {
    await fetch(`${API_URL}${selectedCompany.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: "Skip" })
    });

    // fetchCompanies();   
  } catch (err) {
    console.error(err);
  }
}}>
       Skip
     </button>
   )}
 
   {/* Unskip */}
   {selectedCompany.status === "Skip" && (
     <button
       className="btn btn-sm btn-success"
       onClick={async () => {
  try {
    await fetch(`${API_URL}${selectedCompany.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: "Under Progress" })
    });

    // fetchCompanies();
    setSelectedCompany(null);
  } catch (err) {
    console.error(err);
  }
}}

     >
       Unskip
     </button>
   )}
 
   {/* Edit Button  */}
   <button
     className="btn btn-sm text-light"
     style={{
       background: "transparent",
       border: "none"
     }}
     onClick={() => {
   if (editMode) {
     setEditMode(false);
   } else {
     setEditMode(true);
     setEditableData(selectedCompany);
   }
 }}
   >
     <FontAwesomeIcon
       className="company-edit"
       icon={faPenToSquare}
     />
   </button>
 
 </div>
   <hr/>
  <div className="row">

  <div className="col-md-5 pe-2">

    <p className="text-start mb-3">
      <strong>Company Domain : </strong>
      {editMode ? (
        <input
          className="form-control form-control-sm mt-1"
          value={editableData?.domain || ""}
          onChange={(e) =>
            setEditableData({ ...editableData, domain: e.target.value })
          }
        />
      ) : (
        selectedCompany.domain
      )}
    </p>

    <p className="text-start mb-0">
      <strong>Point Of Contact : </strong>
      {editMode ? (
        <input
          className="form-control form-control-sm mt-1"
          value={editableData?.poc || ""}
          onChange={(e) =>
            setEditableData({ ...editableData, poc: e.target.value })
          }
        />
      ) : (
        selectedCompany.poc
      )}
    </p>

    <p className="text-start mb-0">
     Email : {" "}
      {editMode ? (
        <input
          className="form-control form-control-sm mt-1"
          value={editableData?.email || ""}
          onChange={(e) =>
            setEditableData({ ...editableData, email: e.target.value })
          }
        />
      ) : (
        selectedCompany.email
      )}
    </p>

    <p className="text-start mb-0">
      Phone : {" "}
      {editMode ? (
        <input
          className="form-control form-control-sm mt-1"
          value={editableData?.phone || ""}
          onChange={(e) =>
            setEditableData({ ...editableData, phone: e.target.value })
          }
        />
      ) : (
        selectedCompany.phone
      )}
    </p>

  </div>

  <div className="col-md-6">

    <p className="text-start">
      <strong>Availability of Meetings : </strong>
      {editMode ? (
        <input
          className="form-control form-control-sm mt-1"
          value={editableData?.meetingAvailability || ""}
          onChange={(e) =>
            setEditableData({
              ...editableData,
              meetingAvailability: e.target.value
            })
          }
        />
      ) : (
        selectedCompany.meetingAvailability
      )}
    </p>

    <p className="text-start mt-3">
      <strong>Status : </strong>
      {editMode ? (
        <select
          className="form-select form-select-sm mt-1"
          value={editableData?.status || ""}
          onChange={(e) =>
            setEditableData({
              ...editableData,
              status: e.target.value
            })
          }
        >
          <option>Interested</option>
          <option>Awaiting for Meeting</option>
          <option>Quotation</option>
          <option>Skip</option>
        </select>
      ) : (
        selectedCompany.status
      )}
    </p>

  </div>

</div>

{/* Save button */}
{editMode && (
  <div className="text-end mt-3">
    <button
      className="btn btn-primary"
      onClick={() => {
  updateCompany(editableData);
  setSelectedCompany(editableData);
  setEditMode(false);
}}

    >
      Save Changes
    </button>
  </div>
)}
      </div>
    </div>
  
    <div className="d-flex">
    <div className="card bg-primary text-light shadow-sm mt-3 offer position-relative" style={{width: "25rem"}}>
      <div className="card-body">
        
        <h5 className="card-title">Quotation
<FontAwesomeIcon
  icon={faPenToSquare}
  className="position-absolute"
  style={{
    right: "10px",
    cursor: "pointer"
  }}
  onClick={() => {
  if (editingField === "quotes") {
    setEditingField(null);
  } else {
    setEditingField("quotes");
    setFieldValue(selectedCompany.quotes || "");
  }
}}

  />
           
           </h5>
        <hr/>
        <p className="text-start mb-0">
  {editingField === "quotes" ? (
    <>
      <textarea
        className="form-control form-control-sm"
        rows="3"
        value={fieldValue}
        onChange={(e) => setFieldValue(e.target.value)}
      />
      <button
        className="btn btn-sm btn-light mt-2"
        onClick={() => {
          const updatedCompany = {
            ...selectedCompany,
            quotes: fieldValue
          };

          setSelectedCompany(updatedCompany);

          
          updateCompany(updatedCompany);

          setEditingField(null);
        }}
      >
        Save
      </button>
    </>
  ) : (
    selectedCompany.quotes || "No quotes available"
  )}
</p>

      </div>
      
    </div>
    <div className="card ms-4 text-light shadow-sm mt-3 offer bg-secondary position-relative" style={{width: "25rem"}}>
      <div className="card-body">
        <h5 className="card-title">Planning to offer
          <FontAwesomeIcon
          icon={faPenToSquare}
        className="position-absolute"
        style={{
            right: "10px",
            cursor: "pointer"
        }}
    onClick={() => {
    if (editingField === "proposed") {
        setEditingField(null);
    } else {
        setEditingField("proposed");
        setFieldValue(selectedCompany.proposed || "");
    }
    }}
  />
        </h5>
        <hr/>
        <p className="text-start mb-0">
            {editingField === "proposed" ? (
    <>
      <textarea
        className="form-control form-control-sm"
        rows="3"
        value={fieldValue}
        onChange={(e) => setFieldValue(e.target.value)}
      />
      <button
        className="btn btn-sm btn-light mt-2"
        onClick={() => {
          const updatedCompany = {
            ...selectedCompany,
            proposed: fieldValue
          };

          setSelectedCompany(updatedCompany);
            updateCompany(updatedCompany);
          setEditingField(null);
        }}
      >
        Save
      </button>
    </>
  ) : (
    selectedCompany.proposed || "No proposed available"
  )}
</p>

      </div>
    </div>
    <div className="card ms-4 bg-success text-light shadow-sm mt-3 offer position-relative" style={{width: "25rem"}}>
      <div className="card-body">
        <h5 className="card-title reqiure">Client Requests
          <FontAwesomeIcon icon={faPenToSquare} className="position-absolute"
            style={{
            right: "10px",
            cursor: "pointer"
            }}
            onClick={() => {
            if (editingField === "replied") {
            setEditingField(null);
            } else {
            setEditingField("replied");
            setFieldValue(selectedCompany.replied || "");
            }
            }}/>
        </h5>
        <hr/>
        <p className="text-start mb-0">
  {editingField === "replied" ? (
    <>
      <textarea
        className="form-control form-control-sm"
        rows="3"
        value={fieldValue}
        onChange={(e) => setFieldValue(e.target.value)}
      />
      <button
        className="btn btn-sm btn-light mt-2"
        onClick={() => {
          const updatedCompany = {
            ...selectedCompany,
            replied: fieldValue
          };

          setSelectedCompany(updatedCompany);
          updateCompany(updatedCompany);
          setEditingField(null);
        }}
      >
        Save
      </button>
    </>
  ) : (
    selectedCompany.replied || "No replies available"
  )}
</p>
      </div>
    </div>
    </div>
    <div className="card text-light shadow-sm mt-3 offer1 w-100 position-relative" style={{backgroundColor:"#9e53e8"}}>
      <div className="card-body">
        
        <h5 className="card-title">Meeting 1
          <FontAwesomeIcon
  icon={faPenToSquare}
  className="position-absolute"
  style={{
    right: "10px",
    cursor: "pointer"
  }}
  onClick={() => {
  if (editingField === "meet_1") {
    setEditingField(null);
  } else {
    setEditingField("meet_1");
    setFieldValue(selectedCompany.meet_1 || "");
  }}}
  />
        </h5>
        <hr/>
        <p className="text-start mb-0">
  {editingField === "meet_1" ? (
    <>
      <textarea
        className="form-control form-control-sm"
        rows="3"
        value={fieldValue}
        onChange={(e) => setFieldValue(e.target.value)}
      />
      <button
        className="btn btn-sm btn-light mt-2"
        onClick={() => {
          const updatedCompany = {
            ...selectedCompany,
            meet_1: fieldValue
          };

          setSelectedCompany(updatedCompany);
          updateCompany(updatedCompany);
          setEditingField(null);
        }}
      >
        Save
      </button>
    </>
  ) : (
    selectedCompany.meet_1 || "No meet held"
  )}
</p>
      </div>
    </div>

    <div className="card text-light shadow-sm mt-3 offer1 w-100 position-relative" style={{backgroundColor:"#ce8b39"}}>
      <div className="card-body">
        <h5 className="card-title">Meeting 2
          <FontAwesomeIcon
  icon={faPenToSquare}
  className="position-absolute"
  style={{
    right: "10px",
    cursor: "pointer"
  }}
  onClick={() => {
  if (editingField === "meet_2") {
    setEditingField(null);
  } else {
    setEditingField("meet_2");
    setFieldValue(selectedCompany.meet_2 || "");
  }}}/>
        </h5>
        <hr/>
        <p className="text-start mb-0">
  {editingField === "meet_2" ? (
    <>
      <textarea
        className="form-control form-control-sm"
        rows="3"
        value={fieldValue}
        onChange={(e) => setFieldValue(e.target.value)}
      />
      <button
        className="btn btn-sm btn-light mt-2"
        onClick={() => {
          const updatedCompany = {
            ...selectedCompany,
            meet_2: fieldValue
          };

          setSelectedCompany(updatedCompany);
          updateCompany(updatedCompany);
          setEditingField(null);
        }}
      >
        Save
      </button>
    </>
  ) : (
    selectedCompany.meet_2 || "No meeting held"
  )}
</p>

      </div>
    </div>   
    </>
  )}

  {/* End details box */}
  {showForm && (
    <div className="d-flex justify-content-center">
      <div className="card bg-dark text-light shadow-sm" style={{ width: "75%" }}>
        <div className="card-body">
          <h5 className="mb-3">Add Company</h5>

          <form>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Company Name</label>
                <input
                  className="form-control form-control-md"
                  placeholder="Enter company name"
                  onChange={(e) =>
                  setNewCompany({
                    ...newCompany,
                    CompanyName: e.target.value
                    })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Company Domain</label>
                <input
                  className="form-control form-control-md"
                  placeholder="Enter company Domain"
                  onChange={(e) =>
                  setNewCompany({
                    ...newCompany,
                    domain: e.target.value
                    })
                    }
                />
              </div>

              <div className="col-md-6">
                <label className="form-label ">Contact Person</label>
                <input
                  className="form-control form-control-md"
                  placeholder="Enter contact name"
                  onChange={(e) =>
                  setNewCompany({
                    ...newCompany,
                    poc: e.target.value
                    })
                    }
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control form-control-md"
                  onChange={(e) =>
                  setNewCompany({
                    ...newCompany,
                    email: e.target.value
                    })
                    }
                  placeholder="Enter email"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input
                  className="form-control form-control-md"
                  placeholder="Enter phone"
                  onChange={(e) =>
                  setNewCompany({
                    ...newCompany,
                    phone: e.target.value
                    })
                    }
                />
              </div>
              <div className="col-md-6"></div>
              
              <div className="d-grid gap-2 col-6 mx-auto mt-4">
                <button className="btn btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  addCompany(newCompany);
                  }}
                >
                  Save Lead
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  )}
</div>
{/* End of Form */}

{/* ----------------------- */}
        
        </div>
    </div>

    </div>

  );
}

// Stat Card
function StatCard({ title, value, onClick, active }) {
  return (
    <div
      className={`stat-card ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <div className="card-body p-3">
        <h6 className="card-title fw-bold">{title}</h6>
        <div className="fs-5 fw-bold mt-2">{value}</div>
      </div>
    </div>
  );
}
