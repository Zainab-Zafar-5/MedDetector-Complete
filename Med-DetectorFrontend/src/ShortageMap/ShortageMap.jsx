import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import {
  ArrowLeft, Search, MapPin, X, AlertTriangle, RefreshCw, PackageSearch, Building2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ShortageMap.css';

const API_BASE_URL = 'http://localhost:5000';
const DEFAULT_CITY = 'Lahore';
const DEFAULT_CENTER = [31.5204, 74.3587];

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SEVERITY = {
  critical: { threshold: 5,  color: '#C1432D', label: 'Critical'  },
  low:      { threshold: 20, color: '#E05A3A', label: 'Low stock' },
};

function getSeverity(stock) {
  return stock <= SEVERITY.critical.threshold ? SEVERITY.critical : SEVERITY.low;
}

function createSeverityIcon(stock) {
  const severity = getSeverity(stock);
  return L.divIcon({
    className: 'severity-marker',
    html: `<span class="severity-marker__badge" style="background:${severity.color}">${stock}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

// ✅ zoom bhi accept karta hai ab
function RecenterMap({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

const ShortageMap = () => {
  const navigate = useNavigate();

  const [shortages, setShortages]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [loadError, setLoadError]     = useState(null);

  const [city, setCity]               = useState(DEFAULT_CITY);
  const [mapCenter, setMapCenter]     = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom]         = useState(13); // ✅ zoom state
  const [searching, setSearching]     = useState(false);

  const [medicineTerm, setMedicineTerm] = useState('');
  const [pharmacyTerm, setPharmacyTerm] = useState('');
  const debouncedMedicine = useDebouncedValue(medicineTerm, 250);
  const debouncedPharmacy = useDebouncedValue(pharmacyTerm, 250);

  const [selectedClusterData, setSelectedClusterData] = useState([]);
  const [toast, setToast] = useState(null);

  const geocodeAbortRef = useRef(null);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    return () => geocodeAbortRef.current?.abort();
  }, []);

  const fetchShortages = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/shortages`);
      const json = await response.json();
      if (json.success) {
        setShortages(json.data);
      } else {
        setShortages([]);
        setLoadError(json.message || 'Could not load shortage data.');
      }
    } catch (err) {
      setShortages([]);
      setLoadError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchShortages(); }, [fetchShortages]);

  const handleCitySearch = useCallback(async (e) => {
    e.preventDefault();
    const query = city.trim();
    if (!query) return;

    geocodeAbortRef.current?.abort();
    const controller = new AbortController();
    geocodeAbortRef.current = controller;

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query + ', Pakistan')}`,
        { signal: controller.signal }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setMapZoom(13);
      } else {
        showToast(`Couldn't find "${query}". Try a different city.`, 'error');
      }
    } catch (err) {
      if (err.name !== 'AbortError') showToast('Location search failed. Try again.', 'error');
    } finally {
      setSearching(false);
    }
  }, [city, showToast]);

  // Pharmacy names list (pehle define — filteredShortages se pehle chahiye)
  const pharmacyNames = useMemo(() => {
    const names = [...new Set(shortages.map((s) => s.pharmacyName).filter(Boolean))];
    return names;
  }, [shortages]);

  const filteredShortages = useMemo(() => {
    const med  = debouncedMedicine.trim().toLowerCase();
    const phar = debouncedPharmacy.trim().toLowerCase();
    return shortages.filter((s) => {
      const matchMed = !med || s.name?.toLowerCase().includes(med);
      // Exact match: "Care Pharmacy" exact hai to sirf wohi — "Health Care" nahi
      const exactExists = pharmacyNames.some(n => n.toLowerCase() === phar);
      const matchPhar = !phar || (exactExists
        ? s.pharmacyName?.toLowerCase() === phar
        : s.pharmacyName?.toLowerCase().includes(phar));
      return matchMed && matchPhar;
    });
  }, [shortages, debouncedMedicine, debouncedPharmacy, pharmacyNames]);

  const mappableShortages = useMemo(
    () => filteredShortages.filter((s) => s.lat && s.lng),
    [filteredShortages]
  );

  // ✅ Pharmacy filter hone pe zoom 17 (street level) par fly karo
  useEffect(() => {
    if (!debouncedPharmacy.trim()) return;
    const match = mappableShortages.find((s) =>
      s.pharmacyName?.toLowerCase().includes(debouncedPharmacy.trim().toLowerCase())
    );
    if (match) {
      setMapCenter([parseFloat(match.lat), parseFloat(match.lng)]);
      setMapZoom(17); // ✅ Street level zoom — markers clearly dikhenge
    }
  }, [debouncedPharmacy, mappableShortages]);

  // ✅ Pharmacy clear hone pe zoom reset
  useEffect(() => {
    if (!debouncedPharmacy.trim()) {
      setMapZoom(13);
    }
  }, [debouncedPharmacy]);

  const clusterEventHandlers = useMemo(() => ({
    clusterclick: (e) => {
      const markers = e.layer.getAllChildMarkers();
      setSelectedClusterData(markers.map((m) => m.options.data));
    },
  }), []);

  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') setSelectedClusterData([]); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="shortage-map shortage-map__loading">
        <div className="loading-card">
          <span className="loading-spinner" aria-hidden="true" />
          <p>Loading shortage data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shortage-map">
      <header className="shortage-map__panel">
        <button type="button" className="icon-button" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={18} />
        </button>

        <form className="search-row" onSubmit={handleCitySearch}>
          <div className="input-wrap">
            <MapPin size={16} aria-hidden="true" />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City (e.g. Lahore)"
              aria-label="City"
            />
          </div>
          <button type="submit" className="primary-button" disabled={searching}>
            {searching ? <RefreshCw size={16} className="spin" aria-hidden="true" /> : 'Go'}
          </button>
        </form>

        <div className="input-wrap">
          <Building2 size={16} aria-hidden="true" />
          <input
            value={pharmacyTerm}
            onChange={(e) => setPharmacyTerm(e.target.value)}
            placeholder="Filter by pharmacy name…"
            aria-label="Filter by pharmacy name"
            list="pharmacy-suggestions"
          />
          <datalist id="pharmacy-suggestions">
            {pharmacyNames.map((n) => <option key={n} value={n} />)}
          </datalist>
          {pharmacyTerm && (
            <button type="button" className="clear-button" onClick={() => setPharmacyTerm('')} aria-label="Clear pharmacy">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="input-wrap">
          <Search size={16} aria-hidden="true" />
          <input
            value={medicineTerm}
            onChange={(e) => setMedicineTerm(e.target.value)}
            placeholder="Search medicine name…"
            aria-label="Search medicine name"
          />
          {medicineTerm && (
            <button type="button" className="clear-button" onClick={() => setMedicineTerm('')} aria-label="Clear medicine">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="result-summary" aria-live="polite">
          {filteredShortages.length} shortage{filteredShortages.length !== 1 ? 's' : ''}
          {mappableShortages.length !== filteredShortages.length && (
            <span className="muted"> · {mappableShortages.length} mapped</span>
          )}
        </div>
      </header>

      <div className="shortage-map__canvas">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          whenReady={() => setTimeout(() => window.dispatchEvent(new Event('resize')), 100)}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <RecenterMap center={mapCenter} zoom={mapZoom} />

          <MarkerClusterGroup eventHandlers={clusterEventHandlers}>
            {mappableShortages.map((med, idx) => (
              <Marker
                key={med._id || idx}
                position={[parseFloat(med.lat), parseFloat(med.lng)]}
                icon={createSeverityIcon(med.stock)}
                data={med}
              >
                <Popup>
                  <div className="popup-card">
                    <strong>{med.name}</strong>
                    <span className="popup-card__pharmacy">🏥 {med.pharmacyName}</span>
                    <span className="popup-card__pharmacy">📍 {med.address || med.location || '—'}</span>
                    <span className="popup-card__stock" style={{ color: getSeverity(med.stock).color }}>
                      {getSeverity(med.stock).label} · {med.stock} left
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        {!loadError && mappableShortages.length === 0 && (
          <div className="empty-state">
            <PackageSearch size={28} aria-hidden="true" />
            <p>No mapped shortages match your search.</p>
          </div>
        )}

        {loadError && (
          <div className="empty-state empty-state--error">
            <AlertTriangle size={28} aria-hidden="true" />
            <p>{loadError}</p>
            <button type="button" className="primary-button" onClick={fetchShortages}>Retry</button>
          </div>
        )}
      </div>

      {selectedClusterData.length > 0 && (
        <aside className="cluster-sidebar" role="dialog" aria-label="Shortage list">
          <div className="cluster-sidebar__header">
            <h3>Shortage list</h3>
            <button type="button" className="icon-button" onClick={() => setSelectedClusterData([])} aria-label="Close list">
              <X size={16} />
            </button>
          </div>
          <ul className="cluster-sidebar__list">
            {selectedClusterData.map((item, index) => (
              <li key={item._id || index}>
                <span className="severity-dot" style={{ background: getSeverity(item.stock).color }} aria-hidden="true" />
                <div>
                  <strong>{item.name}</strong>
                  <span className="muted">{item.pharmacyName}</span>
                  <span className="muted" style={{ fontSize: '11px' }}>📍 {item.address || item.location || '—'}</span>
                </div>
                <span className="stock-pill">{item.stock} left</span>
              </li>
            ))}
          </ul>
        </aside>
      )}

      {toast && (
        <div className={`toast toast--${toast.type}`} role="status">
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ShortageMap;