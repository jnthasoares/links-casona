import React, { useState, useEffect } from 'react';
import { Store, MapPin, ChevronRight, ArrowLeft, Utensils, MessageCircle, ShoppingBag, Navigation } from 'lucide-react';
import './index.css';

const STORES = [
  {
    id: 'loja1',
    name: 'Casona Açaí - Santo André',
    address: 'Av. Dom Pedro I, 170 - Vila América',
    lat: -23.6698,
    lng: -46.5165,
    icon: <MapPin size={24} />
  },
  {
    id: 'loja2',
    name: 'Casona Açaí - Mauá',
    address: 'Av. Itapark, 2641 A - Jd. Itapark',
    lat: -23.6735,
    lng: -46.4382,
    icon: <MapPin size={24} />
  }
];

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(distKm) {
  if (distKm === null || distKm === undefined) return null;
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)} m de você`;
  }
  return `${distKm.toFixed(1).replace('.', ',')} km de você`;
}

const DELIVERIES = {
  loja1: [
    { name: 'iFood', desc: 'Peça rápido pelo iFood', icon: <ShoppingBag size={24} />, url: '#' },
    { name: 'Site Oficial', desc: 'Preços exclusivos', icon: <Utensils size={24} />, url: '#' },
    { name: 'WhatsApp', desc: 'Fale com a gente', icon: <MessageCircle size={24} />, url: '#' }
  ],
  loja2: [
    { name: 'iFood', desc: 'Peça rápido pelo iFood', icon: <ShoppingBag size={24} />, url: '#' },
    { name: 'Site Oficial', desc: 'Preços exclusivos', icon: <Utensils size={24} />, url: '#' },
    { name: 'Rappi', desc: 'Entrega turbo', icon: <ShoppingBag size={24} />, url: '#' }
  ]
};

function App() {
  const [selectedStore, setSelectedStore] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const setLocationIfValid = (lat, lng) => {
      if (!isMounted) return;
      setUserLocation((prev) => {
        if (!prev) return { lat, lng };
        return prev;
      });
    };

    // 1. Tenta pegar via IP para resposta instantânea no PC/Mobile
    fetch('https://get.geojs.io/v1/ip/geo.json')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.latitude && data.longitude) {
          setLocationIfValid(parseFloat(data.latitude), parseFloat(data.longitude));
        }
      })
      .catch(() => {});

    // 2. Tenta pegar a localização precisa do navegador (GPS / Wi-Fi)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (isMounted) {
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
          }
        },
        () => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (isMounted) {
                setUserLocation({
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude
                });
              }
            },
            () => {},
            { enableHighAccuracy: false, timeout: 10000 }
          );
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const storesWithDistance = STORES.map((store) => {
    if (!userLocation) return { ...store, distance: null };
    const dist = calculateDistance(userLocation.lat, userLocation.lng, store.lat, store.lng);
    return { ...store, distance: dist };
  }).sort((a, b) => {
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });

  const handleStoreSelect = (storeId) => {
    setSelectedStore(storeId);
  };

  const handleBack = () => {
    setSelectedStore(null);
  };

  return (
    <>
      <div className="profile-section">
        <img src="/logo.png" alt="Casona Açaí" className="brand-logo" />
      </div>

      {!selectedStore ? (
        <div className="cards-container">
          {storesWithDistance.map((store) => (
            <div 
              key={store.id} 
              className="glass-card"
              onClick={() => handleStoreSelect(store.id)}
            >
              <div className="card-content">
                <div className="card-icon">{store.icon}</div>
                <div className="card-text">
                  <div className="card-title-row">
                    <span className="card-title">{store.name}</span>
                  </div>
                  <span className="card-desc">{store.address}</span>
                  {store.distance !== null && (
                    <span className="card-distance">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="distance-icon">
                        <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                      </svg>
                      {formatDistance(store.distance)}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight size={24} color="var(--text-muted)" />
            </div>
          ))}
        </div>
      ) : (
        <div className="cards-container">
          <button className="back-btn" onClick={handleBack}>
            <ArrowLeft size={20} /> Voltar para Lojas
          </button>
          
          {DELIVERIES[selectedStore].map((delivery, idx) => (
            <a 
              key={idx} 
              href={delivery.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card"
            >
              <div className="card-content">
                <div className="card-icon">{delivery.icon}</div>
                <div className="card-text">
                  <span className="card-title">{delivery.name}</span>
                  <span className="card-desc">{delivery.desc}</span>
                </div>
              </div>
              <ChevronRight size={24} color="var(--text-muted)" />
            </a>
          ))}
        </div>
      )}

      <img src="/slogan.png" alt="#bembrasileiro" className="brand-slogan" />
    </>
  );
}

export default App;
