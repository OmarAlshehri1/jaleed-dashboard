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

        // تحديث المظهر الفردي لكل نكهة مع النجوم الملونة الخاصة بها
        updateCardUI('raspberry', Summary.raspberry);
        updateCardUI('blackberry', Summary.blackberry);
        updateCardUI('elderflower', Summary.elderflower);

        // تحديث الإحصائيات بالأيقونات في الأسفل بدقة
        // إجمالي التقييمات يمثل مجموع الأصوات، وإجمالي المشاركين كذلك يمثل عدد التقييمات الفريدة الداخلة
        document.getElementById('global-rating-count').innerText = totalGlobalCount;
        document.getElementById('global-participants-count').innerText = totalGlobalCount;
    });
}

function updateCardUI(flavorId, stats) {
    const card = document.getElementById(flavorId);
    const scoreElement = card.querySelector('.score');
    const votesElement = card.querySelector('.total-votes');
    const activeStarsElement = document.getElementById(`stars-active-${flavorId}`);

    const average = stats.count > 0 ? (stats.totalStars / stats.count).toFixed(1) : "0.0";
    
    scoreElement.innerText = average;
    votesElement.innerText = `${stats.count} votes`;

    // حساب التعبئة المئوية الدقيقة لتغطية النجوم بشكل مثالي بدون أخطاء تداخل
    const percentage = (parseFloat(average) / 5) * 100;
    activeStarsElement.style.width = `${percentage}%`;
}

window.onload = listenToVotes;