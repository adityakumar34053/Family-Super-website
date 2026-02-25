// ==========================================
// 1. TAB SWITCHING LOGIC
// ==========================================
function openSection(sectionName, title) {
    document.querySelectorAll('.app-section').forEach(sec => sec.classList.remove('active-section'));
    document.getElementById('section-' + sectionName).classList.add('active-section');
    document.getElementById('app-title').innerText = title;
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active-nav'));
    event.currentTarget.classList.add('active-nav');
}

const todayDateString = new Date().toISOString().split('T')[0];

// ==========================================
// 2. GHAR KA HISAAB (EXPENSE TRACKER W/ SEARCH)
// ==========================================
let familyExpenses = JSON.parse(localStorage.getItem('familyExpensesData')) || [];
const dateInput = document.getElementById('date');
if(dateInput) dateInput.value = todayDateString;

function updateHisabUI() {
    const list = document.getElementById('history-list');
    if(!list) return;
    list.innerHTML = ''; 
    let totalExpense = 0;

    const searchInput = document.getElementById('search-expense');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    const filteredExpenses = familyExpenses.filter(item => {
        return item.member.toLowerCase().includes(searchTerm) || 
               item.description.toLowerCase().includes(searchTerm);
    });

    const uniqueDates = [...new Set(filteredExpenses.map(item => item.date))];
    uniqueDates.sort((a, b) => new Date(b) - new Date(a)); 

    uniqueDates.forEach(dateStr => {
        const parts = dateStr.split('-'); 
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]); 
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const showDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()} (${days[dateObj.getDay()]})`;

        const dateHeader = document.createElement('div');
        dateHeader.className = 'date-header';
        dateHeader.innerText = `📅 ${showDate}`;
        list.appendChild(dateHeader);

        filteredExpenses.forEach((item) => {
            if (item.date === dateStr) {
                const originalIndex = familyExpenses.indexOf(item);
                
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="list-left">
                        <div style="display: flex; align-items: center; margin-bottom: 5px;">
                            <span class="member-badge">👤 ${item.member}</span> 
                            <strong style="font-size: 16px; color: #2d3748; letter-spacing: 0.3px;">${item.description}</strong>
                        </div>
                    </div>
                    <div class="list-right">
                        <span style="font-weight: 800; color: #e74c3c; font-size: 19px;">₹${item.amount}</span> 
                        <button class="delete-btn" onclick="deleteExpense(${originalIndex})" title="Delete">🗑️</button>
                    </div>
                `;
                list.appendChild(li);
            }
        });
    });

    filteredExpenses.forEach(item => totalExpense += item.amount);
    document.getElementById('total-expense').innerText = `₹${totalExpense}`;
}

function addExpense() {
    const member = document.getElementById('member-name').value;
    const desc = document.getElementById('description').value;
    const amt = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;

    if (!member || !desc || isNaN(amt) || amt <= 0 || !date) {
        return Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Bhai, saari details sahi se bhariye!' });
    }
    
    familyExpenses.push({ member: member, description: desc, amount: amt, date: date });
    localStorage.setItem('familyExpensesData', JSON.stringify(familyExpenses));
    updateHisabUI();

    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    
    Swal.fire({ icon: 'success', title: 'Done!', text: 'Kharcha add ho gaya.', timer: 1500, showConfirmButton: false });
}

function deleteExpense(index) {
    Swal.fire({
        title: 'Delete Kar Dein?',
        text: "Kya tum sach mein is kharche ko delete karna chahte ho?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#bdc3c7',
        confirmButtonText: 'Haan, Delete Karo!',
        cancelButtonText: 'Nahi, Chhod do'
    }).then((result) => {
        if (result.isConfirmed) {
            familyExpenses.splice(index, 1);
            localStorage.setItem('familyExpensesData', JSON.stringify(familyExpenses));
            updateHisabUI();
            Swal.fire('Deleted!', 'Kharcha delete ho gaya.', 'success');
        }
    });
}
updateHisabUI();

// ==========================================
// 3. EMI CALCULATOR
// ==========================================
function calculateEMI() {
    const p = parseFloat(document.getElementById('emi-principal').value);
    const r = parseFloat(document.getElementById('emi-rate').value) / 12 / 100;
    const n = parseFloat(document.getElementById('emi-time').value);

    if (isNaN(p) || isNaN(r) || isNaN(n) || p <= 0 || n <= 0) {
        return Swal.fire({ icon: 'error', title: 'Galti', text: 'Sahi details bhariye!' });
    }

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - p;

    document.getElementById('emi-result').style.display = 'block';
    document.getElementById('emi-amount').innerText = `₹${Math.round(emi)}`;
    document.getElementById('emi-interest').innerText = `₹${Math.round(totalInterest)}`;
    document.getElementById('emi-total').innerText = `₹${Math.round(totalAmount)}`;
}

// ==========================================
// 4. GAON KA VYAJ (Rupay Saikra)
// ==========================================
function calculateVyaj() {
    const p = parseFloat(document.getElementById('vyaj-principal').value);
    const rate = parseFloat(document.getElementById('vyaj-rate').value);
    const time = parseFloat(document.getElementById('vyaj-time').value);

    if (isNaN(p) || isNaN(rate) || isNaN(time) || p <= 0 || time <= 0) {
        return Swal.fire({ icon: 'error', title: 'Galti', text: 'Sahi details bhariye!' });
    }

    const interest = (p * rate * time) / 100;
    const total = p + interest;

    document.getElementById('vyaj-result').style.display = 'block';
    document.getElementById('vyaj-only').innerText = `₹${Math.round(interest)}`;
    document.getElementById('vyaj-total').innerText = `₹${Math.round(total)}`;
}

// ==========================================
// 5. DUDH KA HISAAB & CHECKLIST
// ==========================================
let dudhRecords = JSON.parse(localStorage.getItem('familyDudhData')) || [];

const dudhDateInput = document.getElementById('dudh-date');
if(dudhDateInput) dudhDateInput.value = todayDateString;

const monthPicker = document.getElementById('checklist-month-picker');
if(monthPicker) {
    monthPicker.value = todayDateString.slice(0, 7);
    monthPicker.addEventListener('change', updateChecklist);
}

function updateDudhUI() {
    const list = document.getElementById('dudh-list');
    if(!list) return;
    list.innerHTML = '';
    let totalLiter = 0;
    let totalBill = 0;

    dudhRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    dudhRecords.forEach((record, index) => {
        const totalDayLiter = record.morning + record.evening;
        const dayCost = totalDayLiter * record.rate;
        
        totalLiter += totalDayLiter;
        totalBill += dayCost;

        const parts = record.date.split('-'); 
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]); 
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const showDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]} (${days[dateObj.getDay()]})`;

        const li = document.createElement('li');
        li.style.borderLeftColor = '#3498db'; 
        li.innerHTML = `
            <div class="list-left">
                <div style="display: flex; align-items: center; margin-bottom: 6px;">
                    <span class="member-badge" style="background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%);">📅 ${showDate}</span> 
                    <strong style="font-size: 15px; color: #2d3748;">S: ${record.morning}L | Sh: ${record.evening}L</strong>
                </div>
                <div style="font-size: 12px; color: #718096; font-weight: 500;">
                    Rate: ₹${record.rate}/L <span style="color: #cbd5e1; margin: 0 4px;">|</span> Total: ${totalDayLiter}L
                </div>
            </div>
            <div class="list-right">
                <span style="font-weight: 800; color: #3498db; font-size: 19px;">₹${dayCost}</span> 
                <button class="delete-btn" onclick="deleteDudh(${index})" title="Delete">🗑️</button>
            </div>
        `;
        list.appendChild(li);
    });

    document.getElementById('dudh-total-liter').innerText = totalLiter.toFixed(2); 
    document.getElementById('dudh-total-bill').innerText = `₹${Math.round(totalBill)}`;
    
    updateChecklist();
}

function updateChecklist() {
    const grid = document.getElementById('checklist-grid');
    if(!grid || !monthPicker.value) return;

    grid.innerHTML = '';
    
    const yearStr = monthPicker.value.split('-')[0];
    const monthStr = monthPicker.value.split('-')[1];
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    
    const daysInMonth = new Date(year, month, 0).getDate();
    const enteredDates = new Set(dudhRecords.map(record => record.date));

    for (let i = 1; i <= daysInMonth; i++) {
        const dayBox = document.createElement('div');
        dayBox.className = 'day-box';
        dayBox.innerText = i; 

        const checkDateString = `${yearStr}-${monthStr}-${String(i).padStart(2, '0')}`;

        if (enteredDates.has(checkDateString)) {
            dayBox.classList.add('day-yes'); 
        } else if (checkDateString > todayDateString) {
            dayBox.classList.add('day-future'); 
        } else {
            dayBox.classList.add('day-no'); 
        }

        grid.appendChild(dayBox);
    }
}

function addDudh() {
    const dDate = document.getElementById('dudh-date').value;
    const rate = parseFloat(document.getElementById('dudh-rate').value);
    const morn = parseFloat(document.getElementById('dudh-morning').value) || 0; 
    const eve = parseFloat(document.getElementById('dudh-evening').value) || 0;

    if (!dDate || isNaN(rate) || (morn === 0 && eve === 0)) {
        return Swal.fire({ icon: 'error', title: 'Galti', text: 'Date, Rate aur dudh ki quantity daaliye!' });
    }

    if (morn > 5 || eve > 5) {
        return Swal.fire({ icon: 'warning', title: 'Limit Cross!', text: 'Bhai, dudh ki limit 5 Litre tak hi hai. Sahi hisaab daalein!' });
    }

    dudhRecords.push({ date: dDate, rate: rate, morning: morn, evening: eve });
    localStorage.setItem('familyDudhData', JSON.stringify(dudhRecords));
    
    updateDudhUI();
    
    document.getElementById('dudh-morning').value = '';
    document.getElementById('dudh-evening').value = '';
    
    Swal.fire({ icon: 'success', title: 'Add ho gaya!', timer: 1500, showConfirmButton: false });
}

function deleteDudh(index) {
    Swal.fire({
        title: 'Delete Kar Dein?',
        text: "Kya tum sach mein is din ka dudh record delete karna chahte ho?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#bdc3c7',
        confirmButtonText: 'Haan, Delete Karo!',
        cancelButtonText: 'Nahi'
    }).then((result) => {
        if (result.isConfirmed) {
            dudhRecords.splice(index, 1);
            localStorage.setItem('familyDudhData', JSON.stringify(dudhRecords));
            updateDudhUI();
            Swal.fire('Deleted!', 'Dudh ka record delete ho gaya.', 'success');
        }
    });
}
updateDudhUI();
