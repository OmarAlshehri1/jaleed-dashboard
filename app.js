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
                if (Summary[vote.flavor]) {
                    Summary[vote.flavor].totalStars += parseInt(vote.stars);
                    Summary[vote.flavor].count += 1;
                    totalGlobalCount += 1;
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

    const average = stats.count > 0 ? (stats.totalStars / stats.count).toFixed(1) : "0.0";
    
    scoreElement.innerText = average;
    votesElement.innerText = `${stats.count} votes`;

    // حساب نسبة الامتلاء الدقيقة لتغطية النجوم بشكل كامل ومنع الحواف الرمادية
    const percentage = (parseFloat(average) / 5) * 100;
    if (activeStarsElement) {
        activeStarsElement.style.width = `${percentage}%`;
    }
}

// دالة تفحص إذا زاد العدد الفعلي للأصوات، تطلق الفقاعات الغازية فوراً
function checkAndTriggerBubbles(flavorId, currentCount, colorHex) {
    // إذا كانت هذه أول مرة يتم جلب البيانات عند فتح الصفحة، نقوم بحفظ العدد فقط دون إطلاق فقاعات
    if (lastCounts[flavorId] === -1) {
        lastCounts[flavorId] = currentCount;
        return;
    }

    // إذا زاد عدد التقييمات الحالي عن العدد السابق، يعني ذلك وصول تقييم جديد بالثانية الحالية!
    if (currentCount > lastCounts[flavorId]) {
        triggerSodaBubbles(flavorId, colorHex);
        lastCounts[flavorId] = currentCount; // تحديث العدد القديم بالجديد
    }
}

// 🫧 دالة صناعة تأثير الفوران الغازي وتصاعد الفقاعات داخل كرت المنتج
function triggerSodaBubbles(cardId, colorHex) {
    const card = document.getElementById(cardId);
    if (!card) return;

    const bubbleCount = 18; // عدد الفقاعات في الفورة الواحدة
    
    for (let i = 0; i < bubbleCount; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div');
            bubble.classList.add('bubble');
            
            // تحديد حجم عشوائي طبيعي للفقاعة
            const size = Math.random() * 16 + 8; // بين 8px و 24px
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            
            // توزيع الفقاعات عشوائياً على كامل عرض الكرت من الأسفل
            const randomX = Math.random() * card.offsetWidth;
            bubble.style.left = `${randomX}px`;
            
            // صبغ التوهج اللوني الخاص بكل نكهة
            bubble.style.color = colorHex;
            
            card.appendChild(bubble);
            
            // تنظيف الـ DOM بعد انتهاء الحركة تلقائياً للحفاظ على سلاسة وأداء الصفحة
            setTimeout(() => {
                bubble.remove();
            }, 2500);
            
        }, i * 80); // تأخير زمني بسيط متتابع لإعطاء شكل الفوران المتصاعد
    }
}

window.onload = listenToVotes;