import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import {
  ArrowLeft,
  Search,
  MapPin,
  X,
  AlertTriangle,
  RefreshCw,
  PackageSearch,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ShortageMap.module.css';

const API_BASE_URL = 'http://localhost:5000';
const DEFAULT_CITY = 'Lahore';
const DEFAULT_CENTER = [31.5204, 74.3587];

// Leaflet's default marker icon paths break under most bundlers (Vite/CRA).
// Pointing them at a CDN avoids the classic "broken image" pin.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- Severity model --------------------------------------------------------
// Encodes how urgent a shortage is. Drives marker color so urgency is
// readable on the map at a glance, without opening a popup.
const SEVERITY = {
  critical: { threshold: 5, color: '#C1432D', label: 'Critical' },
  low: { threshold: 20, color: '#D98B3F', label: 'Low stock' },
};

function getSeverity(stock) {
  return stock <= SEVERITY.critical.threshold ? SEVERITY.critical : SEVERITY.low;
}

// Circular marker that shows the stock count directly, color-coded by
// severity — the map's single most useful visual signal.
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

// --- Small utility hook: debounce a fast-changing value --------------------
function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

// Re-centers the map whenever `center` changes. Must render inside
// <MapContainer> because useMap() only works in that context.
function RecenterMap({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

const ShortageMap = () => {
  const navigate = useNavigate();

  const [shortages, setShortages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [city, setCity] = useState(DEFAULT_CITY);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [searching, setSearching] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 250);

  const [selectedClusterData, setSelectedClusterData] = useState([]);
  const [toast, setToast] = useState(null);

  const geocodeAbortRef = useRef(null);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
  }, []);

  // Auto-dismiss the toast after a few seconds.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Cancel any in-flight geocoding request if the component unmounts.
  useEffect(() => {
    return () => geocodeAbortRef.current?.abort();
  }, []);

  // --- Fetch shortage data from the backend --------------------------------
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
      console.error('Shortage fetch failed:', err);
      setShortages([]);
      setLoadError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShortages();
  }, [fetchShortages]);

  // --- Geocode a city name into map coordinates -----------------------------
  // Fixes the original freeze: shows a non-blocking toast instead of
  // alert(), disables the button while in flight, and encodes the query.
  const handleCitySearch = useCallback(
    async (e) => {
      e.preventDefault();
      const query = city.trim();
      if (!query) return;

      geocodeAbortRef.current?.abort();
      const controller = new AbortController();
      geocodeAbortRef.current = controller;

      setSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
            query
          )}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        if (data && data.length > 0) {
          setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          showToast(`Couldn't find "${query}". Try a different city.`, 'error');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Geocoding failed:', err);
          showToast('Location search failed. Try again.', 'error');
        }
      } finally {
        setSearching(false);
      }
    },
    [city, showToast]
  );

  // --- Derived data ------------------------------------------------------------
  const filteredShortages = useMemo(() => {
    const term = debouncedSearchTerm.trim().toLowerCase();
    if (!term) return shortages;
    return shortages.filter((med) => med.name?.toLowerCase().includes(term));
  }, [shortages, debouncedSearchTerm]);

  const mappableShortages = useMemo(
    () => filteredShortages.filter((med) => med.lat && med.lng),
    [filteredShortages]
  );

  const clusterEventHandlers = useMemo(
    () => ({
      clusterclick: (e) => {
        const markers = e.layer.getAllChildMarkers();
        setSelectedClusterData(markers.map((m) => m.options.data));
      },
    }),
    []
  );

  // Close the cluster sidebar with Escape for keyboard users.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedClusterData([]);
    };
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
        <button
          type="button"
          className="icon-button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>

        <form className="search-row" onSubmit={handleCitySearch}>
          <div className="input-wrap">
            <MapPin size={16} aria-hidden="true" />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              aria-label="City"
            />
          </div>
          <button type="submit" className="primary-button" disabled={searching}>
            {searching ? <RefreshCw size={16} className="spin" aria-hidden="true" /> : 'Go'}
          </button>
        </form>

        <div className="input-wrap">
          <Search size={16} aria-hidden="true" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search medicine name…"
            aria-label="Search medicine name"
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-button"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="result-summary" aria-live="polite">
          {filteredShortages.length} shortage{filteredShortages.length !== 1 ? 's' : ''} found
          {mappableShortages.length !== filteredShortages.length && (
            <span className="muted"> · {mappableShortages.length} mapped</span>
          )}
        </div>
      </header>

      <div className="shortage-map__canvas">
        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <RecenterMap center={mapCenter} zoom={13} />

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
                    <span className="popup-card__pharmacy">{med.pharmacyName}</span>
                    <span
                      className="popup-card__stock"
                      style={{ color: getSeverity(med.stock).color }}
                    >
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
            <button type="button" className="primary-button" onClick={fetchShortages}>
              Retry
            </button>
          </div>
        )}
      </div>

      {selectedClusterData.length > 0 && (
        <aside className="cluster-sidebar" role="dialog" aria-label="Shortage list">
          <div className="cluster-sidebar__header">
            <h3>Shortage list</h3>
            <button
              type="button"
              className="icon-button"
              onClick={() => setSelectedClusterData([])}
              aria-label="Close list"
            >
              <X size={16} />
            </button>
          </div>
          <ul className="cluster-sidebar__list">
            {selectedClusterData.map((item, index) => (
              <li key={item._id || index}>
                <span
                  className="severity-dot"
                  style={{ background: getSeverity(item.stock).color }}
                  aria-hidden="true"
                />
                <div>
                  <strong>{item.name}</strong>
                  <span className="muted">{item.pharmacyName}</span>
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