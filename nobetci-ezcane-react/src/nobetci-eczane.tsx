"use client"

import { useState } from "react"
import "./eczane-style.css"

interface Eczane {
  isim: string
  adres: string
  telefon: string
}

function semtDuzenle(semt: string): string {
  const trMap: { [key: string]: string } = {
    ç: "c",
    Ç: "c",
    ğ: "g",
    Ğ: "g",
    ı: "i",
    I: "i",
    İ: "i",
    ö: "o",
    Ö: "o",
    ş: "s",
    Ş: "s",
    ü: "u",
    Ü: "u",
  }
  return semt
    .split("")
    .map((c: string) => trMap[c] || c)
    .join("")
    .toLowerCase()
    .replace(/\s+/g, "-")
}

function NobetciEczaneler() {
  const [semt, setSemt] = useState<string>("Izmit")
  const [eczaneler, setEczaneler] = useState<Eczane[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const semtler = [
    "Başiskele",
    "Çayırova",
    "Darıca",
    "Derince",
    "Dilovası",
    "Gebze",
    "Gölcük",
    "Izmit",
    "Kandıra",
    "Karamürsel",
    "Kartepe",
    "Kocaeli Merkez",
    "Körfez",
  ]

  const fetchEczaneler = async () => {
    setLoading(true)
    setError(null)

    const semtURL = semtDuzenle(semt)
    const apiUrl = `http://185.136.206.170/api/eczane.php?semt=${encodeURIComponent(semtURL)}`

    try {
      const response = await fetch(apiUrl)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setEczaneler([])
      } else {
        setEczaneler(data)
      }
    } catch (err) {
      setError("Veri çekme hatası! Lütfen internet bağlantınızı kontrol edin.")
    }

    setLoading(false)
  }

  return (
    <div className="eczane-container">
      <div className="eczane-header">
        <div className="eczane-logo">
          <span>+</span>
        </div>
        <h1>Nöbetçi Eczaneler</h1>
        <p>Kocaeli bölgesindeki nöbetçi eczaneleri kolayca bulun</p>
      </div>

      <div className="eczane-search">
        <div className="eczane-search-inner">
          <select value={semt} onChange={(e) => setSemt(e.target.value)} className="eczane-select">
            {semtler.map((ilce) => (
              <option key={ilce} value={ilce}>
                {ilce}
              </option>
            ))}
          </select>

          <button onClick={fetchEczaneler} className="eczane-button" disabled={loading}>
            {loading ? (
              <>
                <span className="eczane-spinner"></span>
                Aranıyor
              </>
            ) : (
              <>
                <span>🔍</span>
                Eczaneleri Bul
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="eczane-error">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="eczane-loading">
          <div className="eczane-spinner-large"></div>
          <span>Eczaneler Yükleniyor...</span>
        </div>
      )}

      <div className="eczane-grid">
        {eczaneler.map((eczane, index) => {
          const tamAdres = eczane.adres.split("»")[0].trim()
          const mapsQuery = `${eczane.isim} ${tamAdres}`
          const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`
          const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`

          return (
            <div key={index} className="eczane-card">
              <div className="eczane-card-header">
                <h2>{eczane.isim}</h2>
              </div>
              <div className="eczane-card-content">
                <iframe
                  title={`Harita - ${eczane.isim}`}
                  src={mapsEmbed}
                  width="100%"
                  height="180"
                  className="eczane-map"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>

                <div className="eczane-info">
                  <div className="eczane-info-item">
                    <span className="eczane-icon">📍</span>
                    <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="eczane-link">
                      {tamAdres}
                    </a>
                  </div>

                  <div className="eczane-info-item">
                    <span className="eczane-icon">📞</span>
                    <a href={`tel:${eczane.telefon.replace(/\s+/g, "")}`} className="eczane-link">
                      {eczane.telefon}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {!loading && eczaneler.length === 0 && !error && (
        <div className="eczane-empty">
          <div className="eczane-empty-icon">
            <span>🔍</span>
          </div>
          <h3>Henüz Eczane Bulunamadı</h3>
          <p>Lütfen bir ilçe seçin ve "Eczaneleri Bul" butonuna tıklayarak nöbetçi eczaneleri görüntüleyin.</p>
        </div>
      )}

      <footer className="eczane-footer">
        <p>© {new Date().getFullYear()} Nöbetçi Eczane Uygulaması</p>
      </footer>
    </div>
  )
}

export default NobetciEczaneler