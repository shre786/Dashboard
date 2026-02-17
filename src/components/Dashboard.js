import React, {useEffect, useState} from "react";
import "./Dashboard.css";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

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


const extractName = (text = "") => {
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "")
    .replace(/(\+?\d{1,3}[\s-]?)?(\d[\s-]?){10}/g, "")
    .replace(/\b\d+\b/g, "")
    .replace(/mobile\s*no\.?|phone|email|contact|LEAD|Consultancy/gi, "")
    .replace(/\(.*?\)/g, "")
    .replace(/[|,<>:/]/g, "")

    .trim();
};

  const extractEmail = (text = "") => {
  const match = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  );
  return match ? match[0] : "";
};


const extractPhone = (text = "") => {
  const match = text.match(
    /(\+?\d{1,3}[\s-]?)?(\d[\s-]?){10}/
  );
  return match ? match[0].replace(/\s+/g, " ").trim() : "";
};

const parseExcelDate = (value) => {
  if (!value) return null;

  if (typeof value !== "string") return null;

  // Remove special dashes and normalize text
  const cleanValue = value.replace("–", "-").trim();

  // ---- FORMAT 1: 16/02/2026 at 4pm ----
  const slashMatch = cleanValue.match(
    /(\d{1,2})\/(\d{1,2})\/(\d{4}).*?(\d{1,2})(?::(\d{2}))?\s?(am|pm)/i
  );

  if (slashMatch) {
    let day = parseInt(slashMatch[1]);
    let month = parseInt(slashMatch[2]) - 1;
    let year = parseInt(slashMatch[3]);
    let hour = parseInt(slashMatch[4]);
    let minute = parseInt(slashMatch[5] || "0");
    let ampm = slashMatch[6].toLowerCase();

    if (ampm === "pm" && hour < 12) hour += 12;
    if (ampm === "am" && hour === 12) hour = 0;

    return new Date(year, month, day, hour, minute);
  }

  // ---- FORMAT 2: Fri 13 Feb 2026 4pm - 4:30pm ----
  const textMatch = cleanValue.match(
    /(\d{1,2})\s([A-Za-z]+)\s(\d{4})\s(\d{1,2})(?::(\d{2}))?\s?(am|pm)/i
  );

  if (textMatch) {
    let day = parseInt(textMatch[1]);
    let monthName = textMatch[2];
    let year = parseInt(textMatch[3]);
    let hour = parseInt(textMatch[4]);
    let minute = parseInt(textMatch[5] || "0");
    let ampm = textMatch[6].toLowerCase();

    const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();

    if (ampm === "pm" && hour < 12) hour += 12;
    if (ampm === "am" && hour === 12) hour = 0;

    return new Date(year, monthIndex, day, hour, minute);
  }

  return null;
};





const nameFromEmail = (email = "") => {
  if (!email) return "";

  return email
    .split("@")[0]          
    .replace(/[._-]+/g, " ") 
    .replace(/\b\w/g, c => c.toUpperCase()) 
    .trim();
};

  useEffect(() => {
  fetch("./media/Dashboard.xlsx")
    .then(res => res.arrayBuffer())
    .then(buffer => {
      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: false
});

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(sheet);

      const normalizedData = rawData.map(row => {

  let website = row["Company Website"];

  if (website && !website.startsWith("http")) {
    website = "https://" + website;
  }

  const poc = row["Point of Contact"] || "";
  const email = extractEmail(poc) || row["Email"];
  return {
    Init: row["Initiated"],
    CompanyName: row["Company Name"],
    website: website,
    status: row["Status"] || row["status"],
    poc: extractName(poc) || nameFromEmail(email),
    email: extractEmail(poc) || row["Email"],
    phone: extractPhone(poc) || row["Phone"],
    domain: row["Company Domain"],
    followUps: row["Follow-Ups( Mail, Call )"],
    replied: row["Reply"],
    response: row["Response"],
    offerings: row["Offerings"],
    proposed: row["Proposed"],
    quotes: row["Quotation"],
    meetingSummary: row["Meeting Disscussion Summary"],
    meetingAvailability: row["Availability for Metting"],
    meet_1: row["Meeting 1"],
    meet_2: row["Meeting 2"],
    meetingDate: parseExcelDate(row["Meeting Dates"]),

  };
});


      setLeads(normalizedData);
    })
    .catch(err => console.error("Excel fetch error:", err));
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

const visibleCompanies = filteredCompanies;
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

  // Get start of current week (Monday)
  const currentDay = today.getDay(); // 0=Sun, 1=Mon
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const startOfThisWeek = new Date(today);
  startOfThisWeek.setDate(today.getDate() + diffToMonday);
  startOfThisWeek.setHours(0, 0, 0, 0);

  // Start of next week
  const startOfNextWeek = new Date(startOfThisWeek);
  startOfNextWeek.setDate(startOfThisWeek.getDate() + 7);

  // End of next week
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
      <img 
              src="/B2B.ico"
              className="me-2"   
              alt="icon"
              width="30"
              height="30"
            />
        B2B LEADS
      </h2>

      <small className="text-light d-block mt-2">
        B2B Planning
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
      <li className="nav-item">
        <span
  className="nav-link active fw-bold px-4 py-2 position-relative"
  style={{
    backgroundColor: "#0d6efd",
    color: "#fff",
    borderRadius: "8px 8px 0 0",
    border: "none",
    fontSize: "18px",
    cursor: "pointer"
  }}>
  Updates

  {/* Notification Count */}
  {unreadUpdates > 0 && (
    <span
      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
      style={{ fontSize: "10px" }}
    >
      {unreadUpdates}
    </span>
  )}
</span>
      </li>
    </ul>
    <div
      className="card bg-dark border-0 shadow-sm"
      style={{ maxHeight: "170px", overflowY: "auto" }}
    >
      <div className="card-body p-2">
        {updates.map((update) => (
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

      {/* Description */}
      <div
        className="small"
        style={{
          color: update.read ? "#bdbdbd" : "#ffffff",
          fontWeight: update.read ? "normal" : "bold"
        }}
      >
        {update.description}
      </div>

      {/* Time */}
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
  <div className="col-4 text-start text-light bg-se">
    <h3 className="mb-0  fs-3 ms-1">{selectedStat}</h3>
  </div>

  
  <div className="col-8 text-end">
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
  + Add Leads
</span>
  </div>
</div>

{/* End List */}
        <div className="row mt-2">
  <div className="col-3 text-light" >
  <ul className="list-group">
    <li className="list-group-item active fw-bold text-center" style={{backgroundColor:"#60A5FA"}} >
  <div className="d-flex justify-content-center align-items-center gap-2 m-1">
    Company Names
    {/* Search Icon */}
    <FontAwesomeIcon
      icon={faMagnifyingGlass}
      className="text-light"
      size="sm"
      style={{ cursor: "pointer" }}
      onClick={() => setShowSearch(prev => !prev)}
    />

  </div>

  {/* Search Box */}
  {showSearch && (
  <div className="mt-2 px-2">
    <nav className="navbar bg-transparent p-0">
      <form className="w-100" role="search">
        <div className="input-group input-group-sm">
          <input
            className="form-control"
            type="search"
            placeholder="Search company..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          {/* <span className="input-group-text bg-dark border-0">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="text-light"
              style={{cursor:"pointer"}}
            />
          </span> */}
        </div>
      </form>
    </nav>
  </div>
)}

</li>

    {/* Company List */}
<div className="company-list-scroll" >
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
                {/* {!selectedCompany && (
    <div className="text-center mt-5 text-muted">
      Select a company to view details
    </div>
  )} */}

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
   <hr/>
        <div className="row">
            <div className="col-md-5 pe-5">
        <p className="text-start mb-4"><strong>Company Domain :</strong> {selectedCompany.domain}</p>
        <p className="text-start mb-0"><strong>Point Of Contact :</strong> {selectedCompany.poc}</p>
        <p className="text-start mb-0">Email : {selectedCompany.email}</p>
        <p className="text-start mb-0">Phone : {selectedCompany.phone}</p>     
        </div>
        <div className="col-md-6">
        <p className="text-start"><strong>Meeting Discussion Summary :</strong> {selectedCompany.meetingSummary}</p>
        <p className="text-start mt-4"><strong>Availability of Meetings :</strong> {selectedCompany.meetingAvailability}</p>
        <p className="text-start mt-4"><strong>Status :</strong> {selectedCompany.status}</p>
        </div>
        </div>
      </div>
    </div>
  
    <div className="d-flex">
    <div className="card bg-primary text-light shadow-sm mt-3 offer" style={{width: "25rem"}}>
      <div className="card-body">
        
        <h5 className="card-title">Quatation</h5>
        <hr/>
        <p className="text-start mb-0">
          {selectedCompany.quotes || "No quotes available"}
        </p>
      </div>
    </div>
    <div className="card ms-4 text-light shadow-sm mt-3 offer bg-secondary" style={{width: "25rem"}}>
      <div className="card-body">
        <h5 className="card-title">Planning to offer</h5>
        <hr/>
        <p className="text-start mb-0">
          {selectedCompany.proposed || "Yet To Plan"}
        </p>
      </div>
    </div>
    <div className="card ms-4 bg-success text-light shadow-sm mt-3 offer" style={{width: "25rem"}}>
      <div className="card-body">
        <h5 className="card-title reqiure">Client Requests</h5>
        <hr/>
        <p className="text-start mb-0">
          {selectedCompany.replied || "No requirements available"}
        </p>
      </div>
    </div>
    </div>
    <div className="card text-light shadow-sm mt-3 offer1 w-100" style={{backgroundColor:"#9e53e8"}}>
      <div className="card-body">
        
        <h5 className="card-title">Meeting 1</h5>
        <hr/>
        <p className="text-start mb-0">
          {selectedCompany.meet_1}
        </p>
      </div>
    </div>

    <div className="card text-light shadow-sm mt-3 offer1 w-100" style={{backgroundColor:"#ce8b39"}}>
      <div className="card-body">
        <h5 className="card-title">Meeting 2</h5>
        <hr/>
        <p className="text-start mb-0">
          {selectedCompany.meet_2 || "Yet To Plan"}
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
          <h5 className="mb-3">Add Lead</h5>

          <form>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Company Name</label>
                <input
                  className="form-control form-control-md"
                  placeholder="Enter company name"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Company Domain</label>
                <input
                  className="form-control form-control-md"
                  placeholder="Enter company Domain"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label ">Contact Person</label>
                <input
                  className="form-control form-control-md"
                  placeholder="Enter contact name"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control form-control-md"
                  placeholder="Enter email"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input
                  className="form-control form-control-md"
                  placeholder="Enter phone"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Status</label>
                <select className="form-select form-select-md">
                  <option>Positive</option>
                  <option>Under Progress</option>
                  <option>Not Interested</option>
                </select>
              </div>

              <div className="d-grid gap-2 col-6 mx-auto mt-4">
                <button className="btn btn-primary">
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

