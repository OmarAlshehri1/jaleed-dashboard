import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

// كائن لحفظ الأعداد السابقة لكل نكهة لمنع الفوران العشوائي عند بداية تشغيل الصفحة
const lastCounts = {
    raspberry: -1,
    blackberry: -1,
    elderflower: -1
};

function listenToVotes() {
    const votesRef = ref(db, 'votes');
    
    onValue(votesRef, (snapshot) => {
        const data = snapshot.val();
        
        const Summary = {
            raspberry: { totalStars: 0, count: 0 },
            blackberry: { totalStars: 0, count: 0 },
            elderflower: { totalStars: 0, count: 0 }
        };

        let totalGlobalCount = 0;

        if (data) {
            Object.values(data).forEach(vote => {
                if (vote && Summary[vote.flavor]) {
                    // تحويل النجوم لرقم صحيح مع التأكد من أنه رقم صالح
                    const starVal = Number(vote.stars);
                    if (!isNaN(starVal) && starVal > 0) {
                        Summary[vote.flavor].totalStars += starVal;
                        Summary[vote.flavor].count += 1;
                        totalGlobalCount += 1;
                    }
                }
            });
        }

        // 🫧 التحقق من وجود تقييم جديد لإطلاق الفقاعات الملونة فوراً
        checkAndTriggerBubbles('raspberry', Summary.raspberry.count, '#AE3653');
        checkAndTriggerBubbles('blackberry', Summary.blackberry.count, '#805ad5');
        checkAndTriggerBubbles('elderflower', Summary.elderflower.count, '#027E7D');

        // تحديث كل منتج باللون والنسبة والنجوم الخاصة به
        updateCardUI('raspberry', Summary.raspberry);
        updateCardUI('blackberry', Summary.blackberry);
        updateCardUI('elderflower', Summary.elderflower);

        // تحديث الأعداد الإجمالية بالفوتر السفلي بشكل فوري
        document.getElementById('global-rating-count').innerText = totalGlobalCount;
        document.getElementById('global-participants-count').innerText = totalGlobalCount;
    });
}

function updateCardUI(flavorId, stats) {
    const card = document.getElementById(flavorId);
    if (!card) return;
    
    const scoreElement = card.querySelector('.score');
    const votesElement = card.querySelector('.total-votes');
    const activeStarsElement = document.getElementById(`stars-active-${flavorId}`);

    // حساب المتوسط الحقيقي الفعلي بناءً على التقييمات الصالحة فقط
    let averageStr = "0.0";
    let numAverage = 0;

    if (stats && stats.count > 0) {
        numAverage = stats.totalStars / stats.count;
        averageStr = numAverage.toFixed(1);
    }

    scoreElement.innerText = averageStr;
    votesElement.innerText = `${stats ? stats.count : 0} votes`;

    // حساب نسبة الامتلاء الدقيقة لتغطية النجوم
    const percentage = (numAverage / 5) * 100;
    if (activeStarsElement) {
        activeStarsElement.style.width = `${percentage}%`;
    }
}

// دالة تفحص إذا زاد العدد الفعلي للأصوات، تطلق الفقاعات الغازية فوراً
function checkAndTriggerBubbles(flavorId, currentCount, colorHex) {
    if (lastCounts[flavorId] === -1) {
        lastCounts[flavorId] = currentCount;
        return;
    }

    if (currentCount > lastCounts[flavorId]) {
        triggerSodaBubbles(flavorId, colorHex);
        lastCounts[flavorId] = currentCount; 
    }
}

// 🫧 دالة صناعة تأثير الفوران الغازي وتصاعد الفقاعات داخل كرت المنتج
function triggerSodaBubbles(cardId, colorHex) {
    const card = document.getElementById(cardId);
    if (!card) return;

    const bubbleCount = 18; 
    
    for (let i = 0; i < bubbleCount; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div');
            bubble.classList.add('bubble');
            
            const size = Math.random() * 16 + 8; 
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            
            const randomX = Math.random() * card.offsetWidth;
            bubble.style.left = `${randomX}px`;
            
            bubble.style.color = colorHex;
            card.appendChild(bubble);
            
            setTimeout(() => {
                bubble.remove();
            }, 2500);
            
        }, i * 80); 
    }
}

window.onload = listenToVotes;

// 🔄 إعادة تنشيط وكسر الكاش كل دقيقة للتأكد من تحديث أجهزة الجميع تلقائياً
setInterval(() => {
    const currentUrl = window.location.origin + window.location.pathname;
    const cacheBuster = `?v=${new Date().getTime()}`;
    window.location.href = currentUrl + cacheBuster;
}, 60000);