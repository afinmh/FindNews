const newsGrid = document.getElementById('newsGrid');
const statusContainer = document.getElementById('statusContainer');
const paginationContainer = document.getElementById('pagination');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const languageSwitcher = document.getElementById('languageSwitcher');

let currentPage = 1;
let currentQuery = 'ai';
const pageSize = 6;
let currentLanguage = 'id'; // Bahasa default

// Objek untuk menyimpan teks terjemahan
const translations = {
    id: {
        headerTitle: "FindNews Hari Ini!",
        headerSubtitle: "Edisi Terkini Perkembangan Kecerdasan Buatan",
        searchInputPlaceholder: "Cari topik...",
        searchButton: "Cari",
        loadingText: "Memuat berita terbaru...",
        errorText: "Gagal memuat:",
        noNewsText: "Tidak ada berita yang ditemukan.",
        pageInfo: (page, total) => `Halaman ${page} dari ${total}`,
        prevButton: "Sebelumnya",
        nextButton: "Berikutnya",
        imagePlaceholder: "Gambar+Tidak+Ada"
    },
    en: {
        headerTitle: "FindNews Today!",
        headerSubtitle: "Latest Edition on Artificial Intelligence Developments",
        searchInputPlaceholder: "Search topics...",
        searchButton: "Search",
        loadingText: "Loading latest news...",
        errorText: "Failed to load:",
        noNewsText: "No news found.",
        pageInfo: (page, total) => `Page ${page} of ${total}`,
        prevButton: "Previous",
        nextButton: "Next",
        imagePlaceholder: "Image+Not+Available"
    }
};

function updateUIText(lang) {
    const t = translations[lang];
    document.getElementById('headerTitle').textContent = t.headerTitle;
    document.getElementById('headerSubtitle').textContent = t.headerSubtitle;
    document.getElementById('searchInput').placeholder = t.searchInputPlaceholder;
    document.getElementById('searchButton').textContent = t.searchButton;
}

function showLoading(isLoading) {
    if (isLoading) {
        newsGrid.innerHTML = '';
        paginationContainer.innerHTML = '';
        statusContainer.innerHTML = `<div class="status-container"><p>${translations[currentLanguage].loadingText}</p></div>`;
    } else {
        statusContainer.innerHTML = '';
    }
}

function showError(message) {
    newsGrid.innerHTML = '';
    paginationContainer.innerHTML = '';
    statusContainer.innerHTML = `<div class="status-container"><p>${translations[currentLanguage].errorText} ${message}</p></div>`;
}

async function fetchNews(query, page, lang) {
    showLoading(true);
    try {
        // Menambahkan parameter 'lang' ke URL fetch
        const response = await fetch(`/api/news?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}&language=${lang}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        renderNews(data.articles);
        renderPagination(page, data.totalResults);
    } catch (error) {
        console.error("Fetch error:", error);
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

function renderNews(articles) {
    if (!articles || articles.length === 0) {
        newsGrid.innerHTML = `<p style="text-align:center; grid-column: 1 / -1;">${translations[currentLanguage].noNewsText}</p>`;
        return;
    }

    newsGrid.innerHTML = articles.map(article => {
        // --- PERUBAHAN DI SINI: Teks gambar pengganti dinamis ---
        const placeholderText = translations[currentLanguage].imagePlaceholder;
        const imageUrl = article.urlToImage || `https://placehold.co/600x400/EAEFF5/7895B2?text=${placeholderText}`;
        
        const description = (article.description || '').substring(0, 150) + '...';
        const publishedDate = new Date(article.publishedAt).toLocaleDateString(currentLanguage === 'id' ? 'id-ID' : 'en-US', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        const maxTitleLength = 80;
        let title = article.title;
        if (title.length > maxTitleLength) {
            title = title.substring(0, maxTitleLength).trim() + '...';
        }

        return `
            <div class="news-item">
                <img src="${imageUrl}" class="news-image" alt="${article.title}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/EAEFF5/7895B2?text=Gagal+Dimuat';">
                <div class="news-content">
                    <h2>
                        <a href="${article.url}" target="_blank" rel="noopener noreferrer">${title}</a>
                    </h2>
                    <p class="news-description">${description}</p>
                    <div class="news-meta">
                        <strong>${article.source.name}</strong> &bull; ${publishedDate}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderPagination(page, totalResults) {
    const maxResults = 100;
    const totalPages = Math.ceil(Math.min(totalResults, maxResults) / pageSize);
    
    paginationContainer.innerHTML = '';
    if (totalPages <= 1) return;

    const prevDisabled = page <= 1 ? 'disabled' : '';
    const nextDisabled = page >= totalPages ? 'disabled' : '';
    const t = translations[currentLanguage];

    paginationContainer.innerHTML = `
        <button id="prevPage" ${prevDisabled}><i class="fas fa-arrow-left"></i> ${t.prevButton}</button>
        <span class="page-info">${t.pageInfo(page, totalPages)}</span>
        <button id="nextPage" ${nextDisabled}>${t.nextButton} <i class="fas fa-arrow-right"></i></button>
    `;

    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchNews(currentQuery, currentPage, currentLanguage);
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchNews(currentQuery, currentPage, currentLanguage);
        }
    });
}

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newQuery = searchInput.value.trim();
    if (newQuery && newQuery !== currentQuery) {
        currentQuery = newQuery;
        currentPage = 1;
        fetchNews(currentQuery, currentPage, currentLanguage);
    }
});

languageSwitcher.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const selectedLang = e.target.dataset.lang;
        if (selectedLang !== currentLanguage) {
            currentLanguage = selectedLang;
            // Update tampilan tombol
            document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            // Update teks UI
            updateUIText(currentLanguage);
            // Fetch berita dengan bahasa baru
            fetchNews(currentQuery, currentPage, currentLanguage);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    updateUIText(currentLanguage); // Set teks awal
    fetchNews(currentQuery, currentPage, currentLanguage);
});