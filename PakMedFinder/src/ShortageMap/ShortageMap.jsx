import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Loader2, ArrowLeft, Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MarkerClusterGroup from 'react-leaflet-markercluster';


// Icon Setup
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function RecenterMap({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom);
    }, [center, zoom, map]);
    return null;
}

const ShortageMap = () => {
    const [shortages, setShortages] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [city, setCity] = useState("Lahore"); // Default City
    const [mapCenter, setMapCenter] = useState([31.5204, 74.3587]);
    const [loading, setLoading] = useState(true);
    const [selectedClusterData, setSelectedClusterData] = useState([]);
    const navigate = useNavigate();

   useEffect(() => {
    const fetchShortageData = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/shortages');
            const json = await response.json();
            
            // If success is true, use json.data; otherwise, default to empty array
            if (json.success) {
                setShortages(json.data);
            } else {
                setShortages([]);
            }
        } catch (err) {
            console.error("Map fetch error:", err);
            setShortages([]);
        } finally {
            setLoading(false);
        }
    };
    fetchShortageData();
}, []);

    // Geocoding function: City name ko coordinates mein badalna
    const handleSearch = async () => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${city}`);
            const data = await response.json();
            if (data && data.length > 0) {
                setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
            } else {
                alert("Location not found!");
            }
        } catch (error) {
            console.error("Geocoding failed", error);
        }
    };

    const filteredShortages = useMemo(() => {
        return shortages.filter(med => 
            med.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [shortages, searchTerm]);

    if (loading) return <div style={{display:'flex', height:'100vh', justifyContent:'center', alignItems:'center'}}><Loader2 className="animate-spin" size={40} /></div>;

    return (
        <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
            {/* Search UI Container */}
            <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => navigate(-1)} style={{background:'white', border:'none', padding:'8px', borderRadius:'8px', width:'fit-content'}}><ArrowLeft size={18} /></button>
                
                <div style={{ display: 'flex', gap: '5px' }}>
                    <div style={{display: 'flex', alignItems: 'center', background: 'white', padding: '0 10px', borderRadius: '8px', flex: 1, border: '1px solid #ddd'}}>
                        <MapPin size={16} />
                        <input value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: '10px', border: 'none', width: '100%' }} />
                    </div>
                    <button onClick={handleSearch} style={{ background: '#2563eb', color: 'white', padding: '0 15px', borderRadius: '8px', border: 'none' }}>Search</button>
                </div>

                <div style={{display: 'flex', alignItems: 'center', background: 'white', padding: '0 10px', borderRadius: '8px', border: '1px solid #ddd'}}>
                    <Search size={16} />
                    <input placeholder="Search Medicine..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '10px', border: 'none', width: '100%' }} />
                </div>
            </div>
<div className="map-wrapper" style={{ position: 'relative', height: '100vh' }}>
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <RecenterMap center={mapCenter} zoom={13} />
    
    {/* ✅ CORRECTED: eventHandlers is a prop, not a child element */}
   <MarkerClusterGroup
    eventHandlers={{
        clusterclick: (e) => {
            const markers = e.layer.getAllChildMarkers();
            // Map the leaflet markers back to your original data objects
            const data = markers.map(m => m.options.data); 
            setSelectedClusterData(data); // 🔥 SAVE DATA TO STATE
        }
    }}
>
    {filteredShortages
        .filter(med => med.lat && med.lng)
        .map((med, idx) => (
            <Marker 
                key={med._id || idx} 
                position={[parseFloat(med.lat), parseFloat(med.lng)]} 
                icon={redIcon}
                data={med} // 🔥 PASS DATA HERE SO WE CAN RETRIEVE IT LATER
            >
                <Popup>
                    <h3>{med.name}</h3>
                    <p>Pharmacy: {med.pharmacyName}</p>
                </Popup>
            </Marker>
        ))}
</MarkerClusterGroup>
</MapContainer>
{/* 🔥 ADD THIS BELOW OR BESIDE YOUR MAP CONTAINER */}
{selectedClusterData.length > 0 && (
        <div className="sidebar-list">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Shortage List</h3>
                <button onClick={() => setSelectedClusterData([])}>✕ Close</button>
            </div>
            <hr />
            <ul>
                {selectedClusterData.map((item, index) => (
                    <li key={index} style={{ marginBottom: '10px' }}>
                        <strong>{item.name}</strong><br />
                        <small>{item.pharmacyName}</small>
                    </li>
                ))}
            </ul>
    </div>
)}
</div>
        </div>
    );
};

export default ShortageMap;