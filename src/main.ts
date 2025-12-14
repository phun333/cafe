import './style.css'
import cafes from './cafes.json'

interface Cafe {
  slug: string
  name: string
  location: string
  rating: number
  date: string
  content: string
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getSlug(): string {
  const path = window.location.pathname
  const slug = path.replace(/^\//, '').replace(/\/$/, '')
  return slug
}

function updateSEO(title: string, description: string, keywords: string, url: string): void {
  document.title = title

  const setMeta = (name: string, content: string, isProperty = false) => {
    const attr = isProperty ? 'property' : 'name'
    let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute(attr, name)
      document.head.appendChild(meta)
    }
    meta.content = content
  }

  setMeta('description', description)
  setMeta('keywords', keywords)
  setMeta('og:title', title, true)
  setMeta('og:description', description, true)
  setMeta('og:url', url, true)
  setMeta('twitter:title', title)
  setMeta('twitter:description', description)

  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
  if (canonical) canonical.href = url
}

function createCafeListItem(cafe: Cafe): string {
  return `
    <a href="/${cafe.slug}" class="cafe-item">
      <span class="cafe-name">${cafe.name}</span>
      <span class="cafe-rating">${cafe.rating}/10</span>
      <span class="cafe-location">${cafe.location}</span>
    </a>
  `
}

function getCity(location: string): string {
  const parts = location.split(',')
  return parts.length > 1 ? parts[parts.length - 1].trim() : location.trim()
}

function renderHome(): void {
  updateSEO(
    "Personal Cafe Reviews - Kafe Degerlendirmeleri",
    "Benim kafe degerlendirmelerim. Kafeleri puanliyorum ve deneyimlerimi paylasiyorum.",
    "kafe, cafe, kahve, coffee, review, degerlendirme, Turkiye, Ankara, Istanbul",
    "https://cafe.aliselvet.xyz"
  )

  const allCafes = (cafes as Cafe[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const cities = [...new Set(allCafes.map(c => getCity(c.location)))].sort()

  const cityOptions = cities.map(city => `<option value="${city}">${city}</option>`).join('')
  const cafeOptions = allCafes.map(cafe => `<option value="${cafe.slug}">${cafe.name}</option>`).join('')

  // /goats/ klasöründeki tüm PNG dosyalarını otomatik al
  const goatModules = import.meta.glob('/public/goats/*.png', { eager: true, as: 'url' })
  const goatImages = Object.values(goatModules).map(url => url.replace('/public', ''))
  const randomStart = Math.floor(Math.random() * goatImages.length)

  // ASCII Art kahve fincanı
  const coffeeAscii = `
  (  )   (  )  )
  ) (   )  (  (
  ( )  (    ) )
 ______________
     |_____________| ___
     |             |/ _ \\
     |               | | |
     |               |_| |
  ___|             |\\___/
 /    \\___________/    \\
 \\_____________________/
  `;

  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div class="starfield" id="starfield"></div>
    <div class="home-container">
      <div class="home-header">
        <div class="home-title">
          
          Personal Cafe Reviews
         
        </div>
        <div class="home-subtitle">~ ⸜(｡˃ ᵕ ˂ )⸝♡ ~</div>
      </div>
      <div class="ascii-art-box">${coffeeAscii}</div>
      <div class="filter-box">
        <div class="filter-row">
          <label>CITY:</label>
          <select id="city-filter">
            <option value="">-- All Cities --</option>
            ${cityOptions}
          </select>
        </div>
        <div class="filter-row">
          <label>CAFE:</label>
          <select id="cafe-filter">
            <option value="">-- All Cafes --</option>
            ${cafeOptions}
          </select>
        </div>
      </div>
      <div class="cafe-list">
        <div class="list-header">SELECT A CAFE:</div>
        <div id="cafe-list-items">
          ${allCafes.map(createCafeListItem).join('')}
        </div>
      </div>
      <div class="home-footer">
        <marquee scrollamount="2">Cafe inceleme sayfama hoş geldiniz! 10 üzerinden gittiğim kafeleri degerlendiriyorum!</marquee>
      </div>
    </div>
    <div class="goat-corner">
      <img id="goat-image" src="${goatImages[randomStart]}" alt="Goat" />
    </div>
  `

  // Yıldızları oluştur
  const starfield = document.getElementById('starfield')!
  for (let i = 0; i < 100; i++) {
    const star = document.createElement('div')
    const sizes = ['small', 'medium', 'large']
    const size = sizes[Math.floor(Math.random() * sizes.length)]
    star.className = `star ${size}`
    star.style.left = `${Math.random() * 100}%`
    star.style.top = `${Math.random() * 100}%`
    star.style.animationDelay = `${Math.random() * 2}s`
    starfield.appendChild(star)
  }

  // Ara sıra kayan yıldız ekle
  setInterval(() => {
    const shootingStar = document.createElement('div')
    shootingStar.className = 'shooting-star'
    shootingStar.style.left = `${Math.random() * 50}%`
    shootingStar.style.top = `${Math.random() * 50}%`
    starfield.appendChild(shootingStar)
    setTimeout(() => shootingStar.remove(), 1500)
  }, 3000)


  const cityFilter = document.getElementById('city-filter') as HTMLSelectElement
  const cafeFilter = document.getElementById('cafe-filter') as HTMLSelectElement
  const listContainer = document.getElementById('cafe-list-items')!

  cityFilter.addEventListener('change', () => {
    const selectedCity = cityFilter.value
    const filtered = selectedCity
      ? allCafes.filter(c => getCity(c.location) === selectedCity)
      : allCafes
    listContainer.innerHTML = filtered.map(createCafeListItem).join('')
    cafeFilter.value = ''
  })

  cafeFilter.addEventListener('change', () => {
    const selectedSlug = cafeFilter.value
    if (selectedSlug) {
      window.location.href = '/' + selectedSlug
    }
  })
}

function renderCafePage(cafe: Cafe): void {
  const city = getCity(cafe.location)
  updateSEO(
    `${cafe.name} - ${cafe.rating}/10 | Personal Cafe Reviews`,
    `${cafe.name} kafe degerlendirmesi. ${cafe.location} - ${cafe.rating}/10 puan.`,
    `${cafe.name}, ${city}, kafe, cafe, kahve, coffee, review, degerlendirme, ${cafe.rating}/10`,
    `https://cafe.aliselvet.xyz/${cafe.slug}`
  )

  const visitorCount = Math.floor(Math.random() * 9000) + 1000
  const stars = '*'.repeat(cafe.rating) + '-'.repeat(10 - cafe.rating)

  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <table class="main-table" cellpadding="0" cellspacing="0">
      <tr>
        <td class="sidebar">
          <div class="nav-box">
            <div class="nav-title">NAVIGATION</div>
            <a href="/" class="nav-link">&lt;&lt; BACK</a>
            <div class="nav-divider">--------</div>
            <div class="nav-info">
              <span class="blink">&gt;</span> Visitor #${visitorCount}
            </div>
          </div>
          <div class="construction-box">
            <div class="construction-text blink">!</div>
            <span>UNDER<br>CONSTRUCTION</span>
            <div class="construction-text blink">!</div>
          </div>
        </td>
        <td class="main-content">
          <div class="page-title">
            <div class="title-decoration">*~*~*~*~*</div>
            <h1>Personal Cafe Reviews</h1>
            <div class="title-decoration">*~*~*~*~*</div>
          </div>
          
          <div class="info-table">
            <div class="info-row">
              <span class="info-label">CAFE:</span>
              <span class="info-value cafe-name-value">${cafe.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">RATING:</span>
              <span class="info-value rating-bar">[${stars}] ${cafe.rating}/10</span>
            </div>
            <div class="info-row">
              <span class="info-label">LOCATION:</span>
              <span class="info-value">${cafe.location}</span>
            </div>
            <div class="info-row">
              <span class="info-label">VISITED:</span>
              <span class="info-value">${formatDate(cafe.date)}</span>
            </div>
          </div>

          <div class="divider">=-=-=-=-=-=-=-=-=-=-=-=-=-=</div>

          <div class="review-section">
            <div class="review-header">MY REVIEW:</div>
            <div class="review-content">
              ${cafe.content}
            </div>
          </div>

          <div class="divider">=-=-=-=-=-=-=-=-=-=-=-=-=-=</div>

          <div class="footer-text">
            <marquee behavior="alternate" scrollamount="2">Okuduğunuz için teşekkür ederim!</marquee>
          </div>
        </td>
      </tr>
    </table>

    <div class="bottom-bar">
      <span>(c) ${new Date().getFullYear()} cafe.aliselvet.xyz</span>
    </div>

  `
}

function render404(): void {
  updateSEO(
    "404 - Sayfa Bulunamadi | Personal Cafe Reviews",
    "Aradiginiz kafe bulunamadi.",
    "404, bulunamadi, not found",
    "https://cafe.aliselvet.xyz/404"
  )

  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div class="error-page">
      <h1>404 - NOT FOUND</h1>
      <p>This cafe does not exist in my database!</p>
      <p><a href="/">&lt;&lt; GO BACK TO HOME &gt;&gt;</a></p>
      <div class="blink">* * *</div>
    </div>
  `
}

function router(): void {
  const slug = getSlug()

  if (!slug || slug === 'index.html') {
    renderHome()
    return
  }

  const cafe = (cafes as Cafe[]).find(c => c.slug === slug)
  if (cafe) {
    renderCafePage(cafe)
  } else {
    render404()
  }
}

router()
