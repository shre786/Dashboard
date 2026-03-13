import React, {useEffect, useState, useRef} from "react";
import "./Dashboard.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faEnvelope, faMagnifyingGlass, faPenToSquare, faPlus, faDotCircle, faXmark, faDropletSlash, faBan } from "@fortawesome/free-solid-svg-icons";


// {/* <div className="row mt-2 mb-3 align-items-center">
//   <div className="col-12">
//     <div className="card border-0 shadow-sm bg-dark text-light">
//       <div className="card-body py-2 px-3">

//         <h6 className="fw-bold text-warning mb-2" style={{cursor:"pointer"}}>
//           Upcoming Meetings
//         </h6>

//         {upcomingMeetings.length === 0 && (
//           <div className="small text-light">
//             No upcoming meetings scheduled
//           </div>
//         )}

//         <div className="d-flex gap-2">
//           {upcomingMeetings.slice(0, 3).map((m, idx) => (
//             <div
//   key={idx}
//   className={`flex-fill p-2 rounded d-flex justify-content-between align-items-center upcoming-meeting-card 
//   ${
//   m.isToday ? "meeting-today" : ""}
//    ${m.isNearest ? "meeting-nearest" : ""}`}
//   style={{
//     backgroundColor: "#2d2d2d",
//     borderLeft: "4px solid #fd7e14",
//     minWidth: "0"
//   }}
// >
// {/* Company */}
//   <span
//     className="small fw-semibold text-truncate"
//     title={m.company}
//     style={{ maxWidth: "65%" }}
//   >
//     {m.company}
//   </span>
//   {/* Date first */}
//   <span className="small text-info fw-semibold me-2">
//     {m.date.toLocaleString("en-IN", {
//   day: "2-digit",
//   month: "short",
//   year: "numeric",
  
// })}

//   </span>  
// </div>
//           ))}
//         </div>

//       </div>
//     </div>
//   </div>
// </div> */}


const API_URL="http://139.5.189.170:8000/api";

const STAT_CARD_COLORS = {
  division: "#ffffff",        
  prabhag: "#ffffff",         
  building: "#ffffff",        
  permission: "#ffffff",  //DBA667 A39595 C6C1A5
       
};
export default function Dashboard() {

    const [leads, setLeads] = useState([]);
    const [time, setTime] = useState(new Date());
    const [sentStatus, setSentStatus] = useState({});
    const [selectedStat, setSelectedStat] = useState("Total Leads");
    const [showForm, setShowForm] = useState(false);
    const[selectedCompany, setSelectedCompany] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [editableData, setEditableData] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [fieldValue, setFieldValue] = useState("");
    const [activeTab, setActiveTab] = useState("UpcomingMeetings");
    const [statusFilter, setStatusFilter] = useState("All");
    const [companyFilter, setcompanyFilter] = useState("");
    const [responses, setResponses] = useState([]);
    const [extraMeetings, setExtraMeetings] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [followups, setFollowups] = useState([]);
    const [followUps, setFollowUps] = useState([]);
const [showInput, setShowInput] = useState(false);
const [newFollowup, setNewFollowup] = useState("");
    const [sendCount, setSendCount] = useState({});
    const [upcomingMeetings, setUpcomingMeetings] = useState([]);
    const [newCompany, setNewCompany] = useState({
  CompanyName: "",
  domain: "",
  website: "",
  poc: "",
  email: "",
  phone: "",
});

const companyListRef = useRef(null);
useEffect(() => { 
  const timer = setInterval(() => { 
    setTime(new Date()); }, 1000); 
  return () => clearInterval(timer); }, []);
  
useEffect(() => {

  if (selectedCompany?.next_follow_up_date) {
    setFollowUps([selectedCompany.next_follow_up_date]);
  } else {
    setFollowUps([]);
  }

}, [selectedCompany]);
// useEffect(() => {
//   // Whenever user selects another company
//   setEditMode(false);
//   setEditingField(null);
//   setEditableData(null);
//   setFieldValue("");
// }, [selectedCompany]);
useEffect(() => {
  if(selectedCompany){
    setEditableData(selectedCompany);
  }
}, [selectedCompany]);


const getFavicon = (website, domain) => {
  const sanitizeDomain = (d) => {
    if (!d) return null;

    let host = d.toString().trim();
    if (host.toLowerCase() === "na" || host.toLowerCase() === "http://example.com") {
      return null;
    }
    try {
      const u = new URL(host);
      host = u.hostname;
    } catch (_) {
      host = host.replace(/^https?:\/\//i, "").split("/")[0];
    }
    return host || null;
  };

  const hostFromWeb = sanitizeDomain(website);
  if (hostFromWeb) {
    return `https://www.google.com/s2/favicons?sz=64&domain=${hostFromWeb}`;
  }

  const hostFromDomain = sanitizeDomain(domain);
  if (hostFromDomain) {
    return `https://www.google.com/s2/favicons?sz=64&domain=${hostFromDomain}`;
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
  console.log("Fetching from:", API_URL);

  fetch(API_URL)
    .then(res => {
      console.log("Raw Response:", res);
      return res.json();
    })
    .then(result => {
      console.log("Full API RESULT:", result);

      if (result.status === "success") {
        console.log("Companies Array:", result.data.companies);

        const cleaned = result.data.companies.map(c => {
        const rawPoc = c.poc || "";

  return {
    ...c,
    meetingDate: c.meetingDate ? new Date(c.meetingDate) : null,

    website:
      c.website && c.website !== 'http://example.com' && c.website !== 'NA'
        ? c.website
        : null,

    // Auto-extract if fields missing
    email: c.email || extractEmail(rawPoc),
    phone: c.phone || extractPhone(rawPoc),
    poc: extractName(rawPoc)
  };
});

        console.log("Cleaned Data Sent To State:", cleaned);

        setLeads(cleaned);
      } else {
        console.log("API did not return success:", result);
      }
    })
    .then(() => {
     
      fetchScheduledMeetings();
    })
    .catch(error => {
      console.error("Fetch Error:", error);
    });

}, []);

const handleFollowupSend = (companyId, index) => {

  if (editMode) return;   // do nothing in edit mode

  const key = `${companyId}_${index}`;

  setSentStatus(prev => ({
    ...prev,
    [key]: true
  }));

};

// Skip Handler
const handleSkip = async (companyId) => {
  console.log("Skip clicked", companyId);
    try {
      const response = await fetch(
        `${API_URL}/companies/${companyId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "Skip" }),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        setLeads(prevLeads =>
  prevLeads.map(lead =>
    lead.id === companyId
      ? { ...lead, status: "Skip" }
      : lead
  )
);
setSelectedCompany(prev =>
      prev?.id === companyId ? null : prev
    );
      }

    } catch (error) {
      console.error("Skip failed", error);
    }
  };

  // Unskip Handler
  const handleUnskip = async (companyId) => {
  try {
    const response = await fetch(
      `${API_URL}/companies/${companyId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Under Progress" }) 
      }
    );

    const result = await response.json();

    if (result.status === "success") {
      setLeads(prev =>
        prev.map(lead =>
          lead.id === companyId
            ? { ...lead, status: "Under Progress" }
            : lead
        )
      );

      setSelectedCompany(null);
    }

  } catch (error) {
    console.error("Unskip failed", error);
  }
};

// ---------Interested Handler--------------
const handleMakeInterested = async (companyId) => {
  try {
    const response = await fetch(
      `${API_URL}/companies/${companyId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Interested" }),
      }
    );

    const result = await response.json();

    if (result.status === "success") {
      setLeads(prev =>
        prev.map(lead =>
          lead.id === companyId
            ? { ...lead, status: "Interested" }
            : lead
        )
      );

      setSelectedCompany(prev =>
        prev?.id === companyId
          ? { ...prev, status: "Interested" }
          : prev
      );
    }

  } catch (error) {
    console.error("Interested update failed", error);
  }
};

//--------------Not Interested Handler------------

const handleNotInterested = async (companyId) => {
  try {
    const response = await fetch(
      `${API_URL}/companies/${companyId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Not Interested" }),
      }
    );

    const result = await response.json();

    if (result.status === "success") {
      setLeads(prev =>
        prev.map(lead =>
          lead.id === companyId
            ? { ...lead, status: "Not Interested" }
            : lead
        )
      );

      setSelectedCompany(prev =>
        prev?.id === companyId
          ? { ...prev, status: "Not Interested" }
          : prev
      );
    }

  } catch (error) {
    console.error("Not Interested failed", error);
  }
};

// --------------Helpers--------------
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

// ----------------Helpers Ended-----------------

// -------------------Filtered based on the Data----------
const visibleCompanies = filteredCompanies.filter(lead => { 

  if (selectedStat === "Client Not Interested") {

  if (statusFilter === "All") {
    return lead.status === "Not Interested";
  }

  if (statusFilter === "Quotation Sent") { 
    return lead.status === "Not Interested" && lead.quotation === "Sent";
  }

  return false;
}

  if (selectedStat === "Conversation In Progress") {
    return lead.status === "Under Progress";
  }

  if (selectedStat === "Positives") {
    return lead.status === "Positive";
  }

  if (selectedStat === "Total Leads") {

    if (statusFilter === "All") {
      return true;
    }

    if (statusFilter === "Interested") {
      return lead.status !== "Skip" && lead.status !== "Not Interested";
    }

    if (statusFilter === "Skip") {
      return lead.status === "Skip";
    }

    return lead.status === statusFilter;
  }

  return true;
}).sort((a, b) =>
    a.CompanyName.localeCompare(b.CompanyName, "en", { sensitivity: "base" })
  );;

// if the current selected company is filtered out, drop the detail view
useEffect(() => {
  if (
    selectedCompany &&
    !visibleCompanies.some(c => c.id === selectedCompany.id)
  ) {
    setSelectedCompany(null);
  }
}, [visibleCompanies, selectedCompany]);


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

const addMeeting = () => {
  setExtraMeetings(prev => [
    ...prev,
    { id: prev.length + 3, value: "" }  
  ]);
};


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
      const meetingDate = l.meetingDate;

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

  const date =
    dateValue instanceof Date
      ? dateValue
      : new Date(dateValue);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
})
    };

const addFollowup = () => {
  if (followUps.length < 3) {
    setShowInput(true);
  }
};

// const saveFollowup = async () => {
//   if (!newFollowup) return;

//   try {
//     await axios.patch(
//       `${API_URL}/companies/followups/${selectedCompany.id}/`,
//       {
//         next_follow_up_date: newFollowup
//       }
//     );

//     setFollowUps(prev => [...prev, newFollowup]);
//     setNewFollowup("");

//     // refresh followups from backend
//     fetchFollowups();

//   } catch (error) {
//     console.error("Follow-up error:", error);
//   }
// };





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
// const markAsRead = (id) => {
//   setUpdates(prev => {
//     const updated = prev.map(update =>
//       update.id === id ? { ...update, read: true } : update
//     );

//     const readMap = {};
//     updated.forEach(u => {
//       if (u.read) readMap[u.id] = true;
//     });
//     localStorage.setItem("readUpdates", JSON.stringify(readMap));
//     return updated;
//   });
// };

const today = new Date();
today.setHours(0, 0, 0, 0);

// const upcomingMeetings = leads
//   .filter(l => l.meetingDate)
//   .map(l => ({
//     company: l.CompanyName,
//     date: l.meetingDate
//   }))
//   .filter(m => {
//     const meetingDay = new Date(
//       m.date.getFullYear(),
//       m.date.getMonth(),
//       m.date.getDate()
//     );
//     return meetingDay >= today;
//   })
//   .sort((a, b) => a.date - b.date);


// Updated Changes function  
const updateCompany = async (company) => {
  try {
    const payload = {
  domain: company.domain || "",
  website:
    company.website && company.website.trim() !== ""
      ? company.website.startsWith("http")
        ? company.website
        : `https://${company.website}`
      : "",

  poc: company.poc || "",
  email: company.email || "",        
  phone: company.phone || "",       

  status:
    company.status && company.status !== "NA"
      ? company.status
      : "",                          

  meetingAvailability: company.meetingAvailability || "",

  meetingDate: company.meetingDate || null,
  quotes: company.quotes || "",
  planning_to_offer: company.planning_to_offer || "",
  replied: company.replied || "",
  meet_1: company.meet_1 || "",
  meet_2: company.meet_2 || "",
  meeting_discussion: company.meeting_discussion || "",
  follow_up_date: newFollowup || null
};

    const response = await fetch(`${API_URL}/companies/${company.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log(result);

    if (result.status === "success") {
      setLeads(prev =>
        prev.map(l =>
          l.id === company.id ? { ...l, ...company } : l
        )
      );
      setSelectedCompany(company);
      fetchUpcomingMeetings();
      fetchFollowups();
    }

  } catch (error) {
    console.error("Update error:", error);
  }
};

const todaysMeetings = upcomingMeetings.filter(m =>
    isToday(m.date)
  );
const upcomingFutureMeetings = upcomingMeetings.filter(
  m => !m.isToday
);

 
const addCompany = async (newCompany) => {
  try {

    const payload = {
      ...newCompany,
      website:
        newCompany.website && newCompany.website.trim() !== ""
          ? newCompany.website.startsWith("http")
            ? newCompany.website
            : `https://${newCompany.website}`
          : ""
    };

    if (!payload.website) {
      delete payload.website;
    }

    const response = await fetch(`${API_URL}/addcompany`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.status === "success") {
      const res = await fetch(API_URL);
      const data = await res.json();
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

const deleteCompany = async (company) => {

  const confirmDelete = window.confirm(
    `Delete company "${company.CompanyName}" ?`
  );

  if (!confirmDelete) return;

  try {

    const response = await fetch(`${API_URL}/companies/delete/${company.id}`, {
      method: "DELETE"
    });

    const result = await response.json();

    if (result.status === "success") {

      // remove company from list
      setLeads(prev =>
        prev.filter(c => c.id !== company.id)
      );

      // clear selected company panel
      setSelectedCompany(null);

      fetchUpcomingMeetings();
      fetchFollowups();
    }

  } catch (error) {
    console.error("Delete error:", error);
  }
};

// ---------------Scheduled Meetings----------------

const fetchScheduledMeetings = async () => {
  try {
    const res = await fetch(`${API_URL}/companies/updates`);
    const data = await res.json();

    if (data.status === "success") {

      const formatted = data.data.updates.map(m => ({
        id: m.company_id,
        CompanyName: m.CompanyName,
        meetingDate: new Date(m.meetingDate),
        status: m.status,
        read: false
      }));

      setUpdates(formatted);
    }

  } catch (error) {
    console.error("Failed to fetch scheduled meetings", error);
  }
};

// --------------Upcoming Meetings----------------
useEffect(() => {
  fetchUpcomingMeetings();
}, []);
const fetchUpcomingMeetings = async () => {
  try {
    const res = await fetch(`${API_URL}/companies/upcoming-meetings`);
    const data = await res.json();

    console.log("UPCOMING MEETINGS RESPONSE:", data);

    if (data.status === "success") {
      const formatted = data.data.meetings.map(m => ({
        company: m.CompanyName,
        date: new Date(m.meetingDate), 
        isToday: m.is_today,
        isNearest: m.is_nearest
      }));

      setUpcomingMeetings(formatted);
      console.log("Formatted Upcoming Meetings:", formatted);
    }
  } catch (error) {
    console.error("Failed to fetch upcoming meetings", error);
  }
};


//-----------Responses---------------
useEffect(() => {
  if (selectedCompany?.pk) {
    fetchResponses(selectedCompany.pk);
  }
}, [selectedCompany]);
const fetchResponses = async (pk) => {
  try {
    const res = await fetch(`${API_URL}/responses/${pk}/`);
    const data = await res.json();

    console.log("FULL RESPONSE:", data);

    if (data.status === "success") {
      setResponses(data.data.responses);
    }
  } catch (error) {
    console.error("Failed to fetch responses", error);
  }
};

// 

// ---------Followups Data in the Dashboard---------

useEffect(() => {
  fetchFollowups();
}, []);

const fetchFollowups = async () => {
  try {
    const response = await fetch(`${API_URL}/companies/followups/`);
    const result = await response.json();

    if (result.status === "success") {
      const allMeetings = [
        ...(result.today_meetings || []),
        ...(result.future_meetings || [])
      ];
      console.log("FOLLOWUP API RESULT:", result);
      const formatted = allMeetings.map(item => ({
        id: item.company_id,
        company: item.CompanyName,
        date: new Date(item.meeting_date),
        status: item.status
      }));

      // Sort by date
      formatted.sort((a, b) => a.date - b.date);

      setFollowups(formatted);
    }
  } catch (error) {
    console.error("Error fetching followups:", error);
  }
};

  const hasToday = followups.some(item => {
    const d = new Date(item.date);
    d.setHours(0,0,0,0);
    return d.getTime() === today.getTime();
  });

  const nearestDate = !hasToday && followups.length > 0
    ? followups[0].date
    : null;

    const handleStatClick = (stat) => {
    setSelectedStat(stat);
    setSelectedCompany(null);
    
    setTimeout(() => {
    companyListRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, 100);

    if (stat === "Total Leads") {
      setStatusFilter("All");
    }
  };

  const handleSendClick = (id) => {

  const count = (sendCount[id] || 0) + 1;

  if (count === 3) {
    setFollowups(prev => prev.filter(item => item.id !== id));
    setSendCount(prev => ({ ...prev, [id]: count }));
    return;
  }

  const newDate = new Date();
  newDate.setDate(newDate.getDate() + (count * 5));
  alert(`Next follow-up for Company will be on ${newDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })}`);
  setFollowups(prev => {
    
    const item = prev.find(c => c.id === id);
    const rest = prev.filter(c => c.id !== id);

    const updatedItem = {
      ...item,
      date: newDate.toISOString()
    };

    return [...rest, updatedItem]; // moves to bottom
  });

  setSendCount(prev => ({
    ...prev,
    [id]: count
  }));
};

useEffect(() => {

  if (selectedCompany) {

    const followups = [
      selectedCompany.follow_up_1,
      selectedCompany.follow_up_2,
      selectedCompany.follow_up_3
    ].filter(Boolean);

    setFollowUps(followups);

  } else {
    setFollowUps([]);
  }

}, [selectedCompany]);



  // -------------Main UI----------------------  

  return (
     <div className="container-fluid p-1">
        <div style={{ padding: "20px 0" }}>
      <div className="container-fluid mb-0">
  <div className="card border-0 text-start" style={{backgroundColor: "#232323"}}>
    <div className="card-body py-2">
    
     <div className="d-flex align-items-start justify-content-between">

  <h3
    className="fw-bold text-light mb-0 d-flex align-items-center flex-column flex-md-row"
    title="B2B Data"
    style={{
      cursor: "pointer",
      letterSpacing: "1px",
      transition: "transform 0.3s ease"
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    <div className="d-flex align-items-center">
      <img
        src="/B2B.ico"
        className="me-2"
        alt="icon"
        width="30"
        height="30"
      />
      <span className="header-main">Business Management Software</span>
    </div>
  </h3>

  <img
    src="https://portal.vasundharaa.in/static/vgtlogo.png"
    alt="VGT Logo"
    width="220"
    className="img-fluid"
  />

</div>

{/* Second Row */}
<div className="d-flex justify-content-between align-items-center mt-1">

  <small className="text-light ms-2">
    Business Management Planning
  </small>

  <div className="live-clock">
    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
  </div>

</div>



      

    </div>
  </div>
</div>

{/* ------------End header----------------- */}

<hr style={{color:"#ffffff"}}/>


{/* -------------Upcoming meetings in the Dashboard----------- */}



<div className="row mt-3 px-3 align-items-start">
  <div className="col-md-2 d-flex flex-column gap-3 mt-4">
    <StatCard title="Total Leads" value={totalLeads}
    active={selectedStat === "Total Leads"} onClick={() => handleStatClick("Total Leads")}/>

   
  
  </div>
  
<div className="col-md-3 mt-4">

  {/* Row for Positives and Conversation */}
  <div className="row g-3">

    <div className="col-md-6">
      <StatCard
        title={<>Positives <br /></>}
        value={positiveLeads}
        active={selectedStat === "Positives"}
        onClick={() => handleStatClick("Positives")}
      />
    </div>

    <div className="col-md-6">
      <StatCard
        title="Conversation In Progress"
        value={conversationLeads}
        active={selectedStat === "Conversation In Progress"}
        onClick={() => handleStatClick("Conversation In Progress")}
      />
    </div>

  </div>

  {/* Second Row */}
  <div className="row g-3 mt-1">

    <div className="col-md-6">
      <StatCard
        title={<>Client Not <br /> Interested</>}
        value={notInterestedLeads}
        active={selectedStat === "Client Not Interested"}
        onClick={() => handleStatClick("Client Not Interested")}
      />
    </div>

    <div className="col-md-6">
      <StatCard
        title={<>Quotation <br/> Sent</>}
        value={notInterestedLeads}
        active={selectedStat === "Quotation Sent"}
        onClick={() => handleStatClick("Quotation Sent")}
      />
    </div>

  </div>

</div>
  <div className="col-3">
    <div className="card border-0 shadow-sm bg-dark text-light">
      <div className="card-body py-2 px-3">
        <h6
          className="fw-bold text-warning mb-2"
          style={{
            cursor: "pointer",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "inline-block"
          }}
        >
          Today's Meetings
        </h6>

        {todaysMeetings.length === 0 && (
          <div className="small text-light">
            No meetings scheduled Today
           </div>
        )}

        <div
  className="upcoming-meeting-container d-flex flex-column gap-2"
>
{todaysMeetings.map((m, idx) =>  (
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
  hour: "2-digit",
  minute:"2-digit",
  
})}

  </span>  
</div>
          ))}
        </div>

      </div>
    </div>
  </div>


{/* Upcoming meetings */}
  <div className="col-md-4">
    <ul className="nav nav-tabs border-0 ms-0">
      <li className="nav-item me-1">
  <span
    onClick={() => {
      setActiveTab("UpcomingMeetings");
    }}
    className="nav-link fw-bold px-3 py-2 ms-1 position-relative"
    style={{
      backgroundColor: activeTab === "UpcomingMeetings" ? "#0d6efd" : "#000000",
      color: "#fff",
      borderRadius: "8px 8px 0 0",
      border: "none",
      fontSize: "16px",
      cursor: "pointer",
      transition: "0.2s ease"
    }}
  >
    Upcoming Meetings

    <span
      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
      style={{ fontSize: "10px" }}
    >
      {upcomingFutureMeetings.length}
    </span>

  </span>
</li>
  {/* Updates Tab */}
  <li className="nav-item">
    <span
      onClick={() => {
  setActiveTab("Updates");
  fetchScheduledMeetings();
  }}
      className="nav-link fw-bold px-4 py-2 position-relative"
      style={{
        backgroundColor:activeTab === "Updates" ? "#0d6efd" : "#000000",
        color: "#fff",borderRadius: "8px 8px 0 0",
        border: "none",fontSize: "16px",
        cursor: "pointer",transition: "0.2s ease"
      }}
    >
      Meeting Schedule
      <span
        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
        style={{ fontSize: "10px" }}
      >
        {unreadUpdates}
      </span>
    </span>
  </li>

  {/* Responses Tab */}
  {/* <li className="nav-item">
    <span
      onClick={() => {
  setActiveTab("Responses");
  fetchResponses();
}}
      className="nav-link fw-bold px-4 py-2 ms-1"
      style={{
        backgroundColor:activeTab === "Responses" ? "#0d6efd" : "#000000",
        color: "#fff", borderRadius: "8px 8px 0 0",
        border: "none", fontSize: "16px",
        cursor: "pointer", transition: "0.2s ease"
      }}>
      Updates
    </span>
  </li> */}

  {/* Follow-ups Tab */}
  <li className="nav-item">
  <span
    onClick={() => {
      setActiveTab("Followup");
    }}
    className="nav-link fw-bold px-4 py-2 ms-1 position-relative"
    style={{
      backgroundColor: activeTab === "Followup" ? "#0d6efd" : "#000000",
      color: "#fff",
      borderRadius: "8px 8px 0 0",
      border: "none",
      fontSize: "16px",
      cursor: "pointer",
      transition: "0.2s ease"
    }}
  >
    Follow - up

    <span
      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
      style={{ fontSize: "10px" }}
    >
      {followups.length}
    </span>

  </span>
</li>
</ul>



    <div className="card bg-dark border-0 shadow-sm"
      style={{ maxHeight: "170px", overflowY: "auto",  maxWidth: "620px" }}>
      <div className="card-body p-2">

  {/* Updates Tab  */}
  {activeTab === "Updates" &&
  (updates.length === 0 ? (
    <div className="small text-muted">
      No meetings scheduled
    </div>
  ) : (
    updates.map((update) => (
  <div
    key={update.id}
    className="d-flex align-items-start gap-2 mb-2 p-2 rounded text-start"
    style={{
      background: "#3a3a3a",
      borderLeft: "4px solid #0d6efd"
    }}
  >
    <div className="flex-grow-1">

      <div className="small text-white fw-bold">
        {update.CompanyName}
      </div>

      <div
        className="text-start fw-semibold"
        style={{
          fontSize: "11px",
          color: getDateColor(update.meetingDate)
        }}
      >
        {formatDate(update.meetingDate)}
      </div>

    </div>
  </div>
))
  ))}


{/* Responses Tab  
  {activeTab === "Responses" &&
  (responses.length === 0 ? (
    <div className="small text-muted">
      No responses available
    </div>
  ) : (
    responses.map((res, index) => {

  console.log("Single response object:", res);  

  return (
    <div
      key={index}
      className="mb-2 p-2 rounded text-start"
      style={{
        background: "#3a3a3a",
        borderLeft: "4px solid #198754"
      }}
    >
      <div className="fw-bold small text-light mb-1">
        {res.CompanyName}
      </div>

      <div className="small text-light">
        {res.response}
      </div>
    </div>
  );
})
  ))}*/}

  {/* Follow-up Tab */}
{activeTab === "Followup" &&
  (followups.length === 0 ? (
    <div className="small text-muted">
      No follow-up meetings scheduled
    </div>
  ) : (
    followups.map((m, idx) => {
      const meetingDate = new Date(m.date);
      meetingDate.setHours(0, 0, 0, 0);
      const isToday = meetingDate.getTime() === today.getTime();

      return (
        <div
          key={idx}
          className="mb-2 p-2 rounded text-start"
          onClick={() => {
            const companyObject = leads.find(l => l.id === m.id);
            if (companyObject) {
              setSelectedCompany(companyObject);
              setShowForm(false);
              {/* window.scrollTo({ top: 500, behavior: "smooth" }); */}
            }
          }}
          style={{
            background: "#3a3a3a",
            borderLeft: isToday ? "4px solid #28a745" : "4px solid #fd7e14",
            cursor: "pointer",
            transition: "all 0.25s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(253, 126, 20, 0.35)";
            e.currentTarget.style.backgroundColor = "#454545";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.backgroundColor = "#3a3a3a";
          }}
        >
          <div className="d-flex justify-content-between align-items-center">

            <div className="fw-bold small text-light">
              {m.company}
            </div>
          <div className="d-flex">

            {/* <FontAwesomeIcon 
            icon={faEnvelope} 
            className="me-2"
            style={{
        right: "10px",
        cursor: "pointer",
        color: "#0d6efd"
      }}
       onClick={(e) => {
    e.stopPropagation(); 
    handleSendClick(m.id);
  }}
             /> */}
             
      

            <div className={`small fw-semibold ${isToday ? "text-success" : "text-info"}`}>
              {isToday
                ? "Today"
                : new Date(m.date).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short"
                  })}
            </div>
</div>
          </div>
        </div>
      );
    })
  ))}

{activeTab === "UpcomingMeetings" &&
  (upcomingFutureMeetings.length === 0 ? (
    <div className="small text-light">
      No upcoming meetings scheduled
    </div>
  ) : (
    upcomingFutureMeetings.map((m, idx) => (
      <div
        key={idx}
        className="upcoming-meeting-card d-flex justify-content-between align-items-center mb-2 p-2 rounded ">
        <span
          className="small fw-semibold text-light text-truncate"
          style={{ maxWidth: "65%" }}
          title={m.company}
        >
          {m.company}
        </span>

        <span className={`small fw-semibold ${m.isToday ? "text-success" : "text-info"}`}>
          {m.isToday
            ? "Today"
            : m.date.toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
              })}
        </span>
      </div>
    ))
  ))}


</div>


<></>
    </div>
  </div>
</div>


{/* End */}
<hr style={{color:"#ffffff"}}/>




{/* Upcoming meeting end */}
<div className="row mt-2 mb-3 align-items-center">
  <div className="col-3 text-start text-light bg-se">
    <h3 className="mb-0  fs-3 ms-1" ref={companyListRef}>{selectedStat}</h3>
  
  </div>


  <div className="col-5">
    <div className="row mt-2 mb-3">
  <div className="col-12 d-flex justify-content-start">
    <div className="dropdown">
      <button
    className="btn btn-outline-light d-lg-none me-2 "
    data-bs-toggle="offcanvas"
    data-bs-target="#companyListCanvas"
  >
    <FontAwesomeIcon icon={faBars}  />
  </button>
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
      Quotation Sent
    </button>
  </li>

  {selectedStat !== "Client Not Interested" && (
    <>
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
    </>
  )}

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


  <div className="col-3 text-light d-none d-lg-block" >
  <ul className="list-group">
   <li
  className="list-group-item active fw-bold position-relative"
  style={{ backgroundColor: "#60A5FA" }}
>
  <div className="d-flex align-items-center justify-content-center position-relative">
  <div className="row">
  <div className="col-12 d-flex justify-content-start">
    <div className="dropdown">
      <button
        className="btn btn-sm text-light dropdown-toggle"
        data-bs-toggle="dropdown"
      >
      <FontAwesomeIcon icon={faBars}/>
        {companyFilter}
      </button>
      
      <ul className="dropdown-menu dropdown-menu-start">

  <li>
    <button
      className="dropdown-item"
      onClick={() => setcompanyFilter("Sort(A-Z)")}
    >
      Sort(A-Z)
    </button>
  </li>

  <li>
    <button
      className="dropdown-item"
      onClick={() => setcompanyFilter("Latest Update")}
    >
      Latest Updated
    </button>
  </li>

  {selectedStat !== "Client Not Interested" && (
    <>
      <li>
        <button
          className="dropdown-item"
          onClick={() => setcompanyFilter("Follow-ups")}
        >
          Follow-ups
        </button>
      </li>

     
    </>
  )}

</ul>
    </div>
  </div>
</div>
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
<div
  className="offcanvas offcanvas-start bg-dark text-light"
  tabIndex="-1"
  id="companyListCanvas"
>
  <div className="offcanvas-header">
    <h5 className="offcanvas-title">Company List</h5>
    <button
      type="button"
      className="btn-close btn-close-white"
      data-bs-dismiss="offcanvas"
    ></button>
  </div>

  <div className="offcanvas-body p-0">

    <ul className="list-group list-group-flush">

      {visibleCompanies.map((lead, index) => (
        <li
          key={index}
          className="list-group-item bg-dark text-light border-secondary"
          onClick={() => {
            setSelectedCompany(lead);
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <img
              src={getFavicon(lead.website, lead.domain)}
              style={{ width: "18px" }}
            />
            {lead.CompanyName}
          </div>
        </li>
      ))}

    </ul>

  </div>
</div>

<div className="col-lg-9 col-12 text-light">
{/* End list  */}

  {selectedCompany && filteredCompanies.some(c => c.id === selectedCompany.id) && (
    <>
    <div className="card bg-dark text-light shadow-sm">
      <div className="card-body">

        <h4 className="mb-3 text-start company-web">
  {
    (() => {
      let companyUrl = selectedCompany.website || selectedCompany.domain || "#";
      if (
        companyUrl !== "#" &&
        !companyUrl.startsWith("http://") &&
        !companyUrl.startsWith("https://")
        ) {
          companyUrl = "https://" + companyUrl;
          }
      return (
        <a
          href={companyUrl}
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
      );
    })()
  }
</h4>
 <div
   className="position-absolute d-flex gap-2"
   style={{
     top: "10px",
     right: "10px"
   }}
 >
   {selectedCompany.status !== "Not Interested" && (
  <button
    className="btn btn-sm btn-warning"
    onClick={() => handleNotInterested(selectedCompany.id)}>
    Company Not Interested
  </button>
)}


{selectedCompany.status === "Not Interested" && (
  <button
    className="btn btn-sm btn-primary"
    onClick={() => handleMakeInterested(selectedCompany.id)}
  >
    Interested
  </button>
)}

   {/* Skip  */}
   {selectedCompany.status !== "Skip" && (
     <button
       className="btn btn-sm btn-danger"
       onClick={() => handleSkip(selectedCompany.id)}>
       Skip
     </button>
   )}
 
   {/* Unskip */}
   {selectedCompany.status === "Skip" && (
     <button
       className="btn btn-sm btn-success"
       onClick={() => handleUnskip(selectedCompany.id)}>
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
     {/* setEditableData(selectedCompany); */}
     setEditableData({
  ...selectedCompany,
  meetingDate: selectedCompany.meetingDate
    ? new Date(selectedCompany.meetingDate)
        .toISOString()
        .slice(0,16)
    : ""
});


   }
 }}
   >
     <FontAwesomeIcon
       className="company-edit"
       icon={faPenToSquare}
     />
   </button>
 <button
  className="btn btn-md text-danger"
  style={{ border: "none" }}
  title="Delete Company"
  onClick={() => deleteCompany(selectedCompany)}
>
  <FontAwesomeIcon icon={faBan} />
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
{editMode &&<p className="text-start mt-1">
  <strong>Website : </strong>

  {editMode ? (
    <input
      type="text"
      className="form-control form-control-sm mt-1"
      value={editableData?.website || ""}
      placeholder="Enter company website"
      onChange={(e) =>
        setEditableData({
          ...editableData,
          website: e.target.value
        })
      }
    />
  ) : (
    <a
      href={
        selectedCompany?.website?.startsWith("http")
          ? selectedCompany.website
          : `https://${selectedCompany.website}`
      }
      target="_blank"
      rel="noreferrer"
    >
      {selectedCompany?.website}
    </a>
  )}
</p>}


  </div>

  <div className="col-md-5">

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

 

<p className="text-start">
  <strong>Meeting Date : </strong>
  {editMode ? (
    <input
      type="datetime-local"
      className="form-control form-control-sm mt-1"
      value={editableData?.meetingDate || ""}
      onChange={(e) =>
        setEditableData({
          ...editableData,
          meetingDate: e.target.value
        })
      }
    />
  ) : (
    selectedCompany.meetingDate
      ? new Date(selectedCompany.meetingDate).toLocaleString("en-IN")
      : "No meeting scheduled"
  )}
</p>

{/* <p className="text-start d-flex flex-column">

<strong>Follow-up</strong>

{editMode ? (
  <div className="mt-2 d-flex gap-2">
    <input
      type="datetime-local"
      className="form-control form-control-sm"
      value={newFollowup}
      onChange={(e) => setNewFollowup(e.target.value)}
    />

    <button
      className="btn btn-success btn-sm"
      onClick={saveFollowup}
      disabled={followUps.length >= 3}
    >
      Save
    </button>
  </div>
) : (
  <div className="mt-1">
    {followUps.length === 0 ? (
      <span className="small text-muted">No follow-ups added</span>
    ) : (
      followUps.map((date, index) => (
        <div key={index} className="small text-info">
          {index + 1} Follow-up : {new Date(date).toLocaleString("en-IN")}
        </div>
      ))
    )}
  </div>
)}

</p> */}

<p className="text-start d-flex flex-column">

<strong>Follow-up</strong>

{editMode ? (

  <div className="mt-2">

    {/* Add followup input */}
    <div className="input-group input-group-sm mb-2">

      <input
        type="datetime-local"
        className="form-control"
        value={newFollowup}
        onChange={(e) => setNewFollowup(e.target.value)}
      />

      <span
        className="input-group-text"
        style={{
          cursor: followUps.length >= 3 ? "not-allowed" : "pointer",
          opacity: followUps.length >= 3 ? 0.5 : 1
        }}
        onClick={() => {
          if (newFollowup && followUps.length < 3) {
            setFollowUps([...followUps, newFollowup]);
            setNewFollowup("");
          }
        }}
      >
        <FontAwesomeIcon icon={faPlus} />
      </span>

    </div>

    {/* Followups visible in edit mode */}
    {followUps.length === 0 ? (
      <span className="small text-muted">No follow-ups added</span>
    ) : (
      followUps.map((date, index) => {

        const key = `${selectedCompany.id}_${index}`;
        const isSent = sentStatus[key];

        return (
          <div
            key={index}
            className="small text-info d-flex align-items-center gap-2 mb-1"
          >

            {index + 1} Follow-up :
            {new Date(date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            })}

            {/* Mail icon only for Followup 2 & 3 */}
            {index > 0 && (
              isSent ? (
                <span className="badge bg-success ms-2">Sent</span>
              ) : (
                <span
                  className="ms-2 text-primary"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    handleFollowupSend(selectedCompany.id, index)
                  }
                >
                  <FontAwesomeIcon icon={faEnvelope} />
                </span>
              )
            )}

          </div>
        );
      })
    )}

  </div>

) : (

  <div className="mt-1">

    {followUps.length === 0 ? (
      <span className="small text-muted">No follow-ups added</span>
    ) : (
      followUps.map((date, index) => {

        const key = `${selectedCompany.id}_${index}`;
        const isSent = sentStatus[key];

        return (
          <div
            key={index}
            className="small text-info d-flex align-items-center gap-2"
          >

            {index + 1} Follow-up :
            {new Date(date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            })}

            {/* Only show Sent text in normal mode */}
            {index > 0 && isSent && (
              <span className="badge bg-success ms-2">Sent</span>
            )}

          </div>
        );
      })
    )}

  </div>

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
        <option>Positives</option>
          <option>Not Interested</option>
          <option>Quotation Sent</option>
          <option>Skip</option>
          <option>Conservation In Progress</option>
          <option>Ignored</option>
          <option>Will Revert</option>
        </select>
      ) : (
        selectedCompany.status
      )}
    </p>

  </div>


</div>



{editMode && (
  <div className="text-end mt-3">
    <button
      className="btn btn-secondary me-2"
      onClick={() => {
        setEditMode(false);
        setEditableData(selectedCompany); 
      }}
    >
      Cancel
    </button>

    <button
      className="btn btn-primary"
      
      onClick={async () => {

  await updateCompany(editableData);

  if (followUps.length > 0) {
    await axios.patch(
      `${API_URL}/companies/followups/${selectedCompany.id}/`,
      {
        follow_up_date: followUps[0]
      }
    );
  }

  fetchFollowups();

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
  {/* onClick={() => {
        updateCompany(editableData);
        setSelectedCompany(editableData);
        setEditMode(false);
      }} */}
    <div className="d-flex">
    <div className="card bg-primary text-light shadow-sm mt-3 offer position-relative" style={{width: "25rem"}}>
      <div className="card-body">
        <div className="mobile-section-header">
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
    setFieldValue(selectedCompany.quotes && selectedCompany.quotes.trim() !== ""
  ? selectedCompany.quotes
  : "No quotes available");
  }
}}

  />
           
           </h5>
           </div>
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
  className=" btn btn-sm btn-light mt-2 me-2"
  onClick={() => {
    setEditingField(null); 
    setFieldValue(selectedCompany.quotes); 
  }}
>
  Cancel
</button>
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
        setFieldValue(selectedCompany.planning_to_offer || "");
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
  className=" btn btn-sm btn-light mt-2 me-2"
  onClick={() => {
    setEditingField(null); 
    setFieldValue(selectedCompany.quotes); 
  }}
>
  Cancel
</button>
      <button
        className="btn btn-sm btn-light mt-2"
        onClick={() => {
          const updatedCompany = {
            ...selectedCompany,
            planning_to_offer: fieldValue
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
    selectedCompany.planning_to_offer || "No proposed available"
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
  className=" btn btn-sm btn-light mt-2 me-2"
  onClick={() => {
    setEditingField(null); 
    setFieldValue(selectedCompany.quotes); 
  }}
>
  Cancel
</button>
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
    <div className="card text-light shadow-sm mt-3 offer1 w-100 position-relative" style={{backgroundColor:"#3963ce"}}>
      <div className="card-body">
        <h5 className="card-title">Clients Initial Response
          <FontAwesomeIcon
  icon={faPenToSquare}
  className="position-absolute"
  style={{
    right: "10px",
    cursor: "pointer"
  }}
  onClick={() => {
  if (editingField === "response") {
    setEditingField(null);
  } else {
    setEditingField("response");
    setFieldValue(selectedCompany.response || "");
  }
}}/>
        </h5>
        <hr/>
        <p className="text-start">
  {editingField === "response" ? (
    <>
    <textarea
      className="form-control form-control-sm mt-1"
      value={fieldValue}
      onChange={(e) => setFieldValue(e.target.value)}
    />
    <button
  className="btn btn-sm btn-light mt-2 me-2"
  onClick={() => {
    setEditingField(null);
    setFieldValue(selectedCompany.response);
  }}
>
  Cancel
</button>

<button
  className="btn btn-sm btn-light mt-2"
  onClick={() => {
    const updatedCompany = {
      ...selectedCompany,
      response: fieldValue
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
    selectedCompany?.response || (
      <span className="text-muted">No responses available</span>
    )
  )}
</p>
      </div>
    </div>



<div className="card text-light shadow-sm mt-3 offer1 w-100 position-relative" style={{backgroundColor:"#3963ce"}}>
      <div className="card-body">
        <h5 className="card-title">Summary of Meetings
          <FontAwesomeIcon
  icon={faPenToSquare}
  className="position-absolute"
  style={{
    right: "10px",
    cursor: "pointer"
  }}
  onClick={() => {
  if (editingField === "meeting_discussion") {
    setEditingField(null);
  } else {
    setEditingField("meeting_discussion");
    setFieldValue(selectedCompany.meeting_discussion || "");
  }}}/>
        </h5>
        <hr/>
        <p className="text-start mb-0">
  {editingField === "meeting_discussion" ? (
    <>
      <textarea
        className="form-control form-control-sm"
        rows="3"
        value={fieldValue}
        onChange={(e) => setFieldValue(e.target.value)}
      />
      <button
  className=" btn btn-sm btn-light mt-2 me-2"
  onClick={() => {
    setEditingField(null); 
    setFieldValue(selectedCompany.quotes); 
  }}
>
  Cancel
</button>
      <button
        className="btn btn-sm btn-light mt-2"
        onClick={() => {
          const updatedCompany = {
            ...selectedCompany,
            meeting_discussion: fieldValue
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
    selectedCompany.meeting_discussion || "NA"
  )}
</p>
      </div>
    </div>

    <div className="d-flex justify-content-end mt-2">
      <button className="btn btn-primary" type="button" onClick={addMeeting}><FontAwesomeIcon icon={faPlus}></FontAwesomeIcon> Meetings</button>
    </div>
    <div className="card text-light mt-2 shadow-sm offer1 w-100 position-relative" style={{backgroundColor:"#9e53e8"}}>
      <div className="card-body">
        
        <h5 className="card-title">MOM of Meeting 1
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
  className=" btn btn-sm btn-light mt-2 me-2"
  onClick={() => {
    setEditingField(null); 
    setFieldValue(selectedCompany.quotes); 
  }}
>
  Cancel
</button>
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
    selectedCompany.meet_1 || "NA"
  )}
</p>
      </div>
    </div>

    <div className="card text-light shadow-sm mt-3 offer1 w-100 position-relative" style={{backgroundColor:"#ce8b39"}}>
      <div className="card-body">
        <h5 className="card-title">MOM of Meeting 2
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
  className=" btn btn-sm btn-light mt-2 me-2"
  onClick={() => {
    setEditingField(null); 
    setFieldValue(selectedCompany.quotes); 
  }}
>
  Cancel
</button>
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
    selectedCompany.meet_2 || "NA"
  )}
</p>


      </div>
    </div>

{extraMeetings.map((meeting, index) => (
  <div
    key={meeting.id}
    className="card text-light shadow-sm mt-3 offer1 w-100 position-relative"
    style={{ backgroundColor: "#9e53e8" }}
  >
    <div className="card-body">
      <h5 className="card-title">
  MOM of Meeting {meeting.id}

  <FontAwesomeIcon
    icon={faPenToSquare}
    className="position-absolute"
    style={{ right: "10px", cursor: "pointer" }}
    onClick={() => {
      if (editingField === `meet_${meeting.id}`) {
        setEditingField(null);
      } else {
        setEditingField(`meet_${meeting.id}`);
        setFieldValue(
          selectedCompany[`meet_${meeting.id}`] || meeting.value || ""
        );
      }
    }}
  />
</h5>
<hr/>
      {editingField === `meet_${meeting.id}` ? (
        <>
          <textarea
            className="form-control form-control-sm"
            rows="3"
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
          />

          <button
            className="btn btn-sm btn-light mt-2 me-2"
            onClick={() => setEditingField(null)}
          >
            Cancel
          </button>

          <button
            className="btn btn-sm btn-light mt-2"
            onClick={() => {
   
              const updatedMeetings = [...extraMeetings];
              updatedMeetings[index].value = fieldValue;
              setExtraMeetings(updatedMeetings);


              const updatedCompany = {
                ...selectedCompany,
                [`meet_${meeting.id}`]: fieldValue
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
        <>
          {meeting.value || "NA"}
        </>
      )}
    </div>
  </div>
))}
       
    </>
  )}

  {/* End details box */}
  {showForm && (
    <div className="d-flex justify-content-center">
      <div className="card bg-dark text-light shadow-sm" style={{ width: "75%" }}>
        <div className="card-body position-relative">
          <button
    type="button"
    className="btn btn-sm btn-outline-light position-absolute top-0 end-0 m-2"
    onClick={() => setShowForm(false)}
  >
    <FontAwesomeIcon
      icon={faXmark}
      

    />
  </button>

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
                <label className="form-label">Company Website</label>
                <input
                  type="url"
                  className="form-control form-control-md"
                  placeholder="https://example.com"
                  onChange={(e) =>
                  setNewCompany({
                    ...newCompany,
                    website: e.target.value
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
              <div className="col-md-8"></div>
              
              <div className="d-grid gap-2 col-4 mx-auto mt-4">
                <button className="btn btn-primary ms-5"
                onClick={(e) => {
                  e.preventDefault();
                  addCompany(newCompany);
                  }}
                >
                  Save Company
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
{/* Follow UP part in the Dashboard  */}
{/* <div className="row mt-2 mb-3 align-items-center">
  <div className="col-12">
    <div className="card border-0 shadow-sm bg-dark text-light">
      <div className="card-body py-2 px-3">

        <h6 className="fw-bold text-warning mb-2" style={{cursor:"pointer"}}>
          Follow-up
        </h6>

        {followups.length === 0 && (
          <div className="small text-muted">
            No follow-up meetings scheduled
          </div>
        )}

        <div
  className="followup-scroll"
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)", 
    gap: "12px",
    overflowY: "auto", 
    overflowX: "hidden",                    
    maxHeight: "150px",                    
  }}
>
          {followups.map((m, idx) => {
            const meetingDate = new Date(m.date);
            meetingDate.setHours(0, 0, 0, 0);
            const isToday = meetingDate.getTime() === today.getTime();

            return (
              <div
                key={idx}
                onClick={() => {
                  const companyObject = leads.find(l => l.id === m.id);
                  if (companyObject) {
                    setSelectedCompany(companyObject);
                    setShowForm(false);
                    window.scrollTo({ top: 500, behavior: "smooth" });
                  }
                }}
                style={{
                  flex: "0 0 calc((100% - 16px) / 3)",
                  minWidth: "180px",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#2d2d2d",
                  borderLeft: isToday ? "4px solid #28a745" : "4px solid #fd7e14",
                  cursor: "pointer",
                  transition: "all 0.25s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(253, 126, 20, 0.35)";
                  e.currentTarget.style.backgroundColor = "#353535";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.backgroundColor = "#2d2d2d";
                }}
              >
                <span
                  className="small fw-semibold text-truncate text-light"
                  title={m.company}
                  style={{ maxWidth: "60%" }}
                >
                  {m.company}
                </span>
                <span className={`small fw-semibold ${isToday ? "text-success" : "text-info"}`} style={{marginLeft: "8px"}}>
                  {isToday ? "Today" : m.date.toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short"
                  })}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  </div>
</div>         */}
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
