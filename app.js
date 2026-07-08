import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// الربط المباشر برابط قاعدة البيانات الفعلي لمشروعك
const firebaseConfig = {
  apiKey: "AIzaSyCuj5OVlYi6HxcYpRcDRDSI0vd--eQZWbc",
  authDomain: "jaleed-event.firebaseapp.com",
  databaseURL: "https://jaleed-event-default-rtdb.firebaseio.com", 
  projectId: "jaleed-event",
  storageBucket: "jaleed-event.firebasestorage.app",
  messagingSenderId: "46385770939",
  appId: "1:46385770939:web:20bfd36ea0e031ed15149e",
  measurementId: "G-QP4ZFKC43T"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentLang = 'ar';

const translations = {
    ar: {
        mainTitle: "التقييم المباشر للجمهور",
        voteWord: "تصويت",
        totalParticipants: "إجمالي المشاركين",
        globalRating: "متوسط التقييم العام",
        toggleBtn: "English"
    },
    en: {
        mainTitle: "Live Audience Reviews",
        voteWord: "votes",
        totalParticipants: "Total Participants",
        globalRating: "Global Rating Average",
        toggleBtn: "عربي"
    }
};

// التحكم في اللغات بالداشبورد
const langBtn = document.getElementById('lang-btn');
langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    
    if (currentLang === 'ar') {
        document.documentElement.setAttribute('lang', 'ar');
        document.documentElement.setAttribute('dir', 'rtl');
        langBtn.innerText = translations.ar.toggleBtn;
    } else {
        document.documentElement.setAttribute('lang', 'en');
        document.documentElement.setAttribute('dir', 'ltr');
        langBtn.innerText = translations.en.toggleBtn;
    }

    // تحديث العناوين الثابتة
    document.getElementById('main-title').innerText = translations[currentLang].mainTitle;
    document.getElementById('lbl-total-participants').innerText = translations[currentLang].totalParticipants;
    document.getElementById('lbl-global-rating').innerText = translations[currentLang].globalRating;

    // تحديث أسماء النكهات
    document.querySelectorAll('.flavor-title').forEach(h2 => {
        h2.innerText = h2.getAttribute(`data-${currentLang}`);
    });

    // سحب تحديث فوري للأصوات لقلب الكلمات المصاحبة للعدد (تصويت / votes)
    triggerUIRefresh();
});

let globalSummary = {};

function listenToVotes() {
    const votesRef = ref(db, 'votes');
    
    onValue(votesRef, (snapshot) => {
        const data = snapshot.val();
        
        const Summary = {
            raspberry: { totalStars: 0, count: 0 },
            blackberry: { totalStars: 0, count: 0 },
            elderflower: { totalStars: 0, count: 0 }
        };

        let totalGlobalStars = 0;
        let totalGlobalCount = 0;

        if (data) {
            Object.values(data).forEach(vote => {
                if (Summary[vote.flavor]) {
                    Summary[vote.flavor].totalStars += parseInt(vote.stars);
                    Summary[vote.flavor].count += 1;
                    
                    totalGlobalStars += parseInt(vote.stars);
                    totalGlobalCount += 1;
                }
            });
        }

        globalSummary = Summary;

        // تحديث كل كارد على حدة
        updateCardUI('raspberry', Summary.raspberry);
        updateCardUI('blackberry', Summary.blackberry);
        updateCardUI('elderflower', Summary.elderflower);

        // تحديث الإحصائيات الإجمالية بالأسفل
        document.getElementById('global-count').innerText = totalGlobalCount;
        const globalAvg = totalGlobalCount > 0 ? (totalGlobalStars / totalGlobalCount).toFixed(1) : "0.0";
        document.getElementById('global-average').innerHTML = `${globalAvg} <span class="small-five">/5</span>`;
    });
}

function updateCardUI(flavorId, stats) {
    const card = document.getElementById(flavorId);
    const scoreElement = card.querySelector('.score');
    const votesElement = card.querySelector('.total-votes');
    const activeStarsElement = document.getElementById(`stars-active-${flavorId}`);

    const average = stats.count > 0 ? (stats.totalStars / stats.count).toFixed(1) : "0.0";
    
    scoreElement.innerText = average;
    votesElement.innerHTML = `${stats.count} <span class="vote-word">${translations[currentLang].voteWord}</span>`;

    const percentage = (parseFloat(average) / 5) * 100;
    activeStarsElement.style.width = `${percentage}%`;
}

function triggerUIRefresh() {
    if (globalSummary.raspberry) {
        updateCardUI('raspberry', globalSummary.raspberry);
        updateCardUI('blackberry', globalSummary.blackberry);
        updateCardUI('elderflower', globalSummary.elderflower);
    }
}

window.onload = listenToVotes;