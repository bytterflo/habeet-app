function showScreen(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
    screen.classList.remove('active');
  });

  document.getElementById(screenId).classList.add('active');

  const nav = document.getElementById('bottom-nav');

  const appScreens = [
    'habits-screen',
    'planner-screen',
    'focus-screen',
    'leaderboard-screen',
    'profile-screen'
  ];

  if (appScreens.includes(screenId)) {
    nav.style.display = 'flex';
  } else {
    nav.style.display = 'none';
  }

  const navButtons = nav.querySelectorAll('button');
  navButtons.forEach(button => {
    button.classList.remove('active');
  });

  const activeButton = nav.querySelector(`[data-screen="${screenId}"]`);
  if (activeButton) {
    activeButton.classList.add('active');
  }

  if (screenId !== 'focus-screen' && focusIsRunning) {
    failFocusSession();
  }

  if (screenId === 'focus-screen') {
    updateFocusDisplay();
  }

  if (screenId === 'profile-screen') {
    loadProfile();
  }

  if (screenId === 'habits-screen') {
    renderHabitDays();
    renderHabitsList();
    loadDailyChallenge();
  }

  if (screenId === 'planner-screen') {
    initPlanner();
  }

  if (screenId === 'leaderboard-screen') {
    updateLeaderboardScore();
  }
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);

  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈";
  } else {
    input.type = "password";
    btn.textContent = "🙉";
  }
}

function openAbout() {
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('about-popup').style.display = 'block';
}

function closeAbout() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('about-popup').style.display = 'none';
}

function closeAllPopups() {
  closeAbout();
  closeSettings();
  closeHabitsCalendar();
  closeCustomFocusTime();

  const emojiPicker = document.getElementById('emoji-picker');
  if (emojiPicker) {
    emojiPicker.classList.remove('show');
  }
}

function toggleCustomMajor() {
  const majorSelect = document.getElementById('profile-major');
  const customMajor = document.getElementById('custom-major');

  if (majorSelect.value === 'custom') {
    customMajor.style.display = 'block';
    customMajor.disabled = false;
    customMajor.focus();
  } else {
    customMajor.style.display = 'none';
    customMajor.disabled = true;
    customMajor.value = '';
  }
}

function enableProfileEdit() {
  const profileName = document.getElementById('profile-name');
  const profileMajor = document.getElementById('profile-major');
  const customMajor = document.getElementById('custom-major');
  const saveBtn = document.getElementById('profile-save-btn');

  profileName.disabled = false;
  profileMajor.disabled = false;

  if (profileMajor.value === 'custom') {
    customMajor.disabled = false;
    customMajor.style.display = 'block';
  }

  saveBtn.style.display = 'block';
}

async function saveProfile() {
  const profileName = document.getElementById('profile-name');
  const profileMajor = document.getElementById('profile-major');
  const customMajor = document.getElementById('custom-major');
  const saveBtn = document.getElementById('profile-save-btn');

  const name = profileName.value;
  const major = profileMajor.value === 'custom'
    ? customMajor.value
    : profileMajor.value;

  localStorage.setItem(getUserKey('habeeName'), name);
  localStorage.setItem(getUserKey('habeeMajor'), major);

  try {
    const user = window.auth.currentUser;

    if (user) {
      await window.setDoc(
        window.doc(window.db, "users", user.uid),
        {
          name: name,
          email: user.email,
          major: major,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    }

    profileName.disabled = true;
    profileMajor.disabled = true;
    customMajor.disabled = true;
    saveBtn.style.display = 'none';

    alert('Profile saved!');
  } catch (error) {
    alert(error.message);
  }
}

function openSettings() {
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('settings-popup').style.display = 'block';
}

function closeSettings() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('settings-popup').style.display = 'none';
}

function openChangePassword() {
  alert("Change password coming next 👀");
}

function deleteAccount() {
  const confirmDelete = confirm("Are you sure you want to delete your account?");
  
  if (confirmDelete) {
    alert("Delete logic will be added next 😢");
  }
}

async function logout() {
  try {
    if (window.auth) {
      await window.auth.signOut();
    }

    closeAllPopups();

    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('register-name').value = '';
    document.getElementById('register-email').value = '';
    document.getElementById('register-password').value = '';

    showScreen('start-screen');
  } catch (error) {
    alert(error.message);
  }
}

function loadProfile() {
  const savedName = localStorage.getItem(getUserKey('habeeName'));
  const savedMajor = localStorage.getItem(getUserKey('habeeMajor'));

  const profileName = document.getElementById('profile-name');
  const profileMajor = document.getElementById('profile-major');
  const customMajor = document.getElementById('custom-major');
  const saveBtn = document.getElementById('profile-save-btn');

  if (savedName) {
    profileName.value = savedName;
  }

  if (savedMajor) {
    let found = false;

    for (let i = 0; i < profileMajor.options.length; i++) {
      if (profileMajor.options[i].value === savedMajor) {
        profileMajor.value = savedMajor;
        found = true;
        break;
      }
    }

    if (!found) {
      profileMajor.value = 'custom';
      customMajor.style.display = 'block';
      customMajor.disabled = true;
      customMajor.value = savedMajor;
    } else {
      customMajor.style.display = 'none';
      customMajor.disabled = true;
    }
  }

  profileName.disabled = true;
  profileMajor.disabled = true;
  customMajor.disabled = true;
  saveBtn.style.display = 'none';
}

function submitLogin() {
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-password').value;
  const rememberMe = document.getElementById('remember-me');
  
  if (rememberMe && rememberMe.checked) {
    localStorage.setItem('rememberedEmail', email);
    localStorage.setItem('rememberedPassword', pass);
  } else {
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
  }
  
  login(email, pass);
}

function submitRegister() {
  register(
    document.getElementById('register-email').value,
    document.getElementById('register-password').value
  );
}

function getUserKey(key) {
  const user = window.auth && window.auth.currentUser;

  if (!user) {
    return key;
  }

  return `${key}_${user.uid}`;
}

let editingHabitId = null;

let selectedHabitDate = new Date();
let habitsStartDate = new Date();
habitsStartDate.setHours(0, 0, 0, 0);

let currentScheduleId = 'schedule-1';

function formatHabitDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getHabits() {
  const saved = localStorage.getItem(getUserKey('habeeHabits'));
  return saved ? JSON.parse(saved) : [];
}

function saveHabits(habits) {
  localStorage.setItem(getUserKey('habeeHabits'), JSON.stringify(habits));
  // Отправка в облако
  if (window.auth && window.auth.currentUser && window.setDoc) {
    window.setDoc(window.doc(window.db, "user_data", window.auth.currentUser.uid), {
      habits: habits
    }, { merge: true }).catch(e => console.log("Habit cloud error:", e));
  }
}

// --- УМНЫЕ ОЧКИ И ЛИДЕРБОРД ---
function getCurrentWeekId() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay() || 7; // Воскресенье = 7
  d.setDate(d.getDate() - day + 1); // Откатываем дату на понедельник этой недели
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; // Пример: "2026-5-4"
}

function getHabitScore() {
  const savedWeek = localStorage.getItem(getUserKey('habeeScoreWeek'));
  const currentWeek = getCurrentWeekId();
  
  // Если началась новая неделя — сбрасываем очки на ноль!
  if (savedWeek !== currentWeek) {
    localStorage.setItem(getUserKey('habeeHabitScore'), '0');
    localStorage.setItem(getUserKey('habeeScoreWeek'), currentWeek);
    return 0;
  }
  return Number(localStorage.getItem(getUserKey('habeeHabitScore')) || '0');
}

function saveHabitScore(score) {
  localStorage.setItem(getUserKey('habeeHabitScore'), String(score));
  localStorage.setItem(getUserKey('habeeScoreWeek'), getCurrentWeekId());
  // Отправка в облако (чтобы очки тоже не пропадали)
  if (window.auth && window.auth.currentUser && window.setDoc) {
    window.setDoc(window.doc(window.db, "user_data", window.auth.currentUser.uid), {
      score: score
    }, { merge: true }).catch(e => console.log("Score cloud error:", e));
  }
}

async function addHabitScore(points) {
  const newScore = getHabitScore() + points;
  saveHabitScore(newScore);
  
  // Обновляем текст на экране
  const scoreElement = document.getElementById('leaderboard-score');
  if (scoreElement) scoreElement.innerText = newScore;

  // Отправляем счет в облако Firebase
  if (window.auth && window.auth.currentUser) {
    try {
      const uid = window.auth.currentUser.uid;
      const name = localStorage.getItem(getUserKey('habeeName')) || "Student";
      
      await window.setDoc(window.doc(window.db, "users", uid), {
        score: newScore,
        weekId: getCurrentWeekId(),
        name: name,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error("Score sync failed", e);
    }
  }
}

function getDayShortName(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function renderHabitDays() {
  const row = document.getElementById('habits-days-row');
  if (!row) return;

  row.innerHTML = '';

  for (let i = 0; i < 5; i++) {
    const date = new Date(habitsStartDate);
    date.setDate(habitsStartDate.getDate() + i);

    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'habit-day-card';

    if (formatHabitDateKey(date) === formatHabitDateKey(selectedHabitDate)) {
      card.classList.add('active');
    }

    card.onclick = () => {
      selectedHabitDate = new Date(date);
      renderHabitDays();
      renderHabitsList();
    };

    card.innerHTML = `
      <span class="habit-day-name">${getDayShortName(date)}</span>
      <span class="habit-day-number">${date.getDate()}</span>
    `;

    row.appendChild(card);
  }
}

function changeHabitDays(direction) {
  habitsStartDate.setDate(habitsStartDate.getDate() + direction);
  renderHabitDays();
}

function goToToday() {
  selectedHabitDate = new Date();
  selectedHabitDate.setHours(0, 0, 0, 0);
  habitsStartDate = new Date(selectedHabitDate);
  habitsStartDate.setHours(0, 0, 0, 0);
  renderHabitDays();
  renderHabitsList();
}

function openHabitsCalendar() {
  const overlay = document.getElementById('overlay');
  const popup = document.getElementById('habits-calendar-popup');
  const input = document.getElementById('habits-date-picker');

  if (input) {
    input.value = formatHabitDateKey(selectedHabitDate);
  }

  if (overlay) overlay.style.display = 'block';
  if (popup) popup.style.display = 'block';
}

function closeHabitsCalendar() {
  const overlay = document.getElementById('overlay');
  const popup = document.getElementById('habits-calendar-popup');

  if (overlay) overlay.style.display = 'none';
  if (popup) popup.style.display = 'none';
}

function applyHabitDate() {
  const input = document.getElementById('habits-date-picker');
  if (!input || !input.value) return;

  selectedHabitDate = new Date(input.value + 'T00:00:00');
  habitsStartDate = new Date(selectedHabitDate);

  renderHabitDays();
  renderHabitsList();
  closeHabitsCalendar();
}

function openAddHabitScreen(habitId = null) {
  editingHabitId = habitId;
  renderMonthDaysGrid();

  const today = formatHabitDateKey(new Date());
  const habits = getHabits();
  const habit = habits.find(h => h.id === habitId);

  document.getElementById('habit-emoji-input').value = habit ? habit.emoji : '';
  document.getElementById('habit-name-input').value = habit ? habit.name : '';
  document.getElementById('habit-description-input').value = habit ? habit.description : '';
  document.getElementById('habit-goal-period').value = habit ? habit.goalPeriod : 'day';
  document.getElementById('habit-goal-value').value = habit ? habit.goalValue : '1';
  document.getElementById('habit-task-type').value = habit ? habit.taskType : 'everyday';
  document.getElementById('habit-start-date').value = habit ? habit.startDate : today;
  document.getElementById('habit-end-date').value = habit ? habit.endDate : '';

  document.querySelectorAll('.habit-days-options button, .month-days-grid button').forEach(btn => {
    btn.classList.remove('selected');
    if (habit && habit.taskDays && habit.taskDays.includes(btn.dataset.value)) {
      btn.classList.add('selected');
    }
  });

  toggleHabitTaskOptions();
  showScreen('add-habit-screen');
}

function closeAddHabitScreen() {
  editingHabitId = null;
  showScreen('habits-screen');
}

function toggleHabitTaskOptions() {
  const taskType = document.getElementById('habit-task-type').value;
  document.getElementById('habit-weekdays-options').style.display = taskType === 'weekdays' ? 'grid' : 'none';
  document.getElementById('habit-monthdays-options').style.display = taskType === 'monthdays' ? 'block' : 'none';
}

function toggleHabitOption(button) {
  button.classList.toggle('selected');
}

function renderMonthDaysGrid() {
  const grid = document.getElementById('month-days-grid');
  if (!grid || grid.children.length > 0) return;

  for (let i = 1; i <= 31; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = i;
    btn.dataset.value = String(i);
    btn.onclick = () => toggleHabitOption(btn);
    grid.appendChild(btn);
  }
}

function selectAllMonthDays() {
  document.querySelectorAll('#month-days-grid button').forEach(btn => btn.classList.add('selected'));
}

function setHabitNoEnd() {
  document.getElementById('habit-end-date').value = '';
}

function getSelectedOptions(selector) {
  return Array.from(document.querySelectorAll(selector + ' .selected')).map(btn => btn.dataset.value);
}

function saveHabit() {
  const habitData = {
    id: editingHabitId || 'habit-' + Date.now(),
    emoji: document.getElementById('habit-emoji-input').value.trim() || '⭐',
    name: document.getElementById('habit-name-input').value.trim(),
    description: document.getElementById('habit-description-input').value.trim(),
    goalPeriod: document.getElementById('habit-goal-period').value,
    goalValue: Number(document.getElementById('habit-goal-value').value),
    taskType: document.getElementById('habit-task-type').value,
    taskDays: [],
    startDate: document.getElementById('habit-start-date').value,
    endDate: document.getElementById('habit-end-date').value,
    completions: {}
  };

  if (!habitData.name || !habitData.goalValue || !habitData.startDate) {
    alert('Please fill in habit name, goal value, and start date.');
    return;
  }

  if (habitData.taskType === 'weekdays') {
    habitData.taskDays = getSelectedOptions('#habit-weekdays-options');
  }

  if (habitData.taskType === 'monthdays') {
    habitData.taskDays = getSelectedOptions('#month-days-grid');
  }

  let habits = getHabits();

  if (editingHabitId) {
    habits = habits.map(habit => {
      if (habit.id === editingHabitId) {
        habitData.completions = habit.completions || {};
        return habitData;
      }
      return habit;
    });
  } else {
    habits.push(habitData);
  }

  saveHabits(habits);
  closeAddHabitScreen();
}

function isHabitActiveOnDate(habit, date) {
  const dateKey = formatHabitDateKey(date);

  if (habit.startDate && dateKey < habit.startDate) return false;
  if (habit.endDate && dateKey > habit.endDate) return false;

  if (habit.taskType === 'weekdays') {
    return habit.taskDays.includes(getDayShortName(date));
  }

  if (habit.taskType === 'monthdays') {
    return habit.taskDays.includes(String(date.getDate()));
  }

  return true;
}

function deleteHabit(habitId) {
  const habits = getHabits().filter(habit => habit.id !== habitId);
  saveHabits(habits);
  renderHabitsList();
}

function toggleHabitComplete(habitId) {
  const habits = getHabits();
  const dateKey = formatHabitDateKey(selectedHabitDate);
  const habit = habits.find(item => item.id === habitId);
  if (!habit) return;

  if (!habit.completions) habit.completions = {};
  if (!habit.completions[dateKey]) habit.completions[dateKey] = { count: 0, rewarded: false };

  const entry = habit.completions[dateKey];

  if (entry.count < habit.goalValue) {
    entry.count += 1;
    if (entry.count === habit.goalValue && !entry.rewarded) {
      addHabitScore(10); // Даем 10 очков
      entry.rewarded = true;
    }
  } else {
    // СБРОС ПРИВЫЧКИ (ЧИНИМ ЧИТЕРСТВО)
    entry.count = 0;
    if (entry.rewarded) {
      addHabitScore(-10); // Отнимаем 10 очков, если награда уже была выдана!
      entry.rewarded = false;
    }
  }

  saveHabits(habits);
  renderHabitsList();
}

function renderHabitsList() {
  const list = document.getElementById('habits-list');
  if (!list) return;

  list.innerHTML = '';

  const habits = getHabits().filter(habit => isHabitActiveOnDate(habit, selectedHabitDate));
  const dateKey = formatHabitDateKey(selectedHabitDate);

  if (habits.length === 0) {
    const emptyCard = document.createElement('div');
    emptyCard.className = 'card';
    emptyCard.textContent = 'No habits for this day 💛';
    list.appendChild(emptyCard);
    return;
  }

  habits.forEach(habit => {
    const completion = habit.completions?.[dateKey] || { count: 0, rewarded: false };

    const card = document.createElement('div');
    card.className = 'habit-card';

    card.innerHTML = `
      <div class="habit-card-top">
        <div class="habit-card-left">
          <div class="habit-card-emoji">${habit.emoji || '⭐'}</div>
          <div>
            <h4 class="habit-card-title">${habit.name}</h4>
            <div class="habit-card-meta">${completion.count}/${habit.goalValue} per day</div>
          </div>
        </div>

        <div class="habit-card-actions">
          <button type="button" class="habit-edit-btn">✎</button>
          <button type="button" class="habit-check-btn ${completion.count === habit.goalValue ? 'done' : ''}">
            ${completion.count === habit.goalValue ? 'Done +10' : `Check ${completion.count + 1}`}
          </button>
          <button type="button" class="habit-delete-btn">🗑</button>
        </div>
      </div>
    `;

    card.querySelector('.habit-edit-btn').onclick = () => openAddHabitScreen(habit.id);
    card.querySelector('.habit-check-btn').onclick = () => toggleHabitComplete(habit.id);
    card.querySelector('.habit-delete-btn').onclick = () => deleteHabit(habit.id);

    list.appendChild(card);
  });
}

function initHabits() {
  selectedHabitDate = new Date();
  selectedHabitDate.setHours(0, 0, 0, 0);
  habitsStartDate = new Date(selectedHabitDate);
  habitsStartDate.setHours(0, 0, 0, 0);

  renderHabitDays();
  renderHabitsList();
}

function getDefaultScheduleLines() {
  // Выдаем 36 пустых строк вместо матрешек
  return Array(36).fill('');
}

function getDefaultPlannerItems() {
  return [
    { text: '', checked: false },
    { text: '', checked: false },
    { text: '', checked: false },
    { text: '', checked: false }
  ];
}

function getSchedules() {
  const saved = localStorage.getItem(getUserKey('habeeSchedules'));

  if (saved) {
    return JSON.parse(saved);
  }

  const defaultSchedules = [
  {
    id: 'schedule-1',
    name: 'Schedule',
    lines: getDefaultScheduleLines(),
    quickItems: getDefaultPlannerItems(),
    tasksItems: getDefaultPlannerItems(),
    projectsItems: getDefaultPlannerItems()
  }
];

  localStorage.setItem(getUserKey('habeeSchedules'), JSON.stringify(defaultSchedules));
  return defaultSchedules;
}

function saveSchedules(schedules) {
  const uid = window.auth?.currentUser?.uid;
  const key = getUserKey('habeeSchedules');

  // ЛЕЧИМ ОШИБКУ FIREBASE: убираем массивы внутри массивов (матрешки)
  const safeSchedules = schedules.map(sched => {
     if (sched.lines && Array.isArray(sched.lines[0])) {
         sched.lines = sched.lines.flat(); // Делает плоский список
     }
     return sched;
  });

  localStorage.setItem(key, JSON.stringify(safeSchedules));

  if (uid && window.db && window.setDoc) {
    console.log("Отправка Планнера в облако...");
    window.setDoc(window.doc(window.db, "user_data", uid), {
      schedules: safeSchedules
    }, { merge: true })
    .then(() => console.log("Планнер успешно в облаке! 🎉"))
    .catch(e => console.error("Ошибка Планнера:", e));
  }
}

function getCurrentSchedule() {
  const schedules = getSchedules();
  return schedules.find(schedule => schedule.id === currentScheduleId) || schedules[0];
}

function renderScheduleDropdown() {
  const dropdownList = document.getElementById('schedule-dropdown-list');
  if (!dropdownList) return;

  const schedules = getSchedules();
  dropdownList.innerHTML = '';

  schedules.forEach(schedule => {
    const row = document.createElement('div');
row.className = 'schedule-dropdown-row';

const button = document.createElement('button');
button.type = 'button';
button.className = 'schedule-dropdown-item';
button.textContent = schedule.name;

if (schedule.id === currentScheduleId) {
  button.classList.add('active');
}

button.onclick = () => selectSchedule(schedule.id);

const deleteBtn = document.createElement('button');
deleteBtn.className = 'schedule-delete-btn';
deleteBtn.textContent = '🗑';

deleteBtn.onclick = (e) => {
  e.stopPropagation();
  deleteSchedule(schedule.id);
};

row.appendChild(button);
row.appendChild(deleteBtn);

dropdownList.appendChild(row);
  });
}

function renderCurrentScheduleName() {
  const currentName = document.getElementById('current-schedule-name');
  if (!currentName) return;

  const schedule = getCurrentSchedule();
  currentName.textContent = schedule.name;
}

function renderScheduleLines() {
  const schedule = getCurrentSchedule();
  const lines = document.querySelectorAll('.schedule-editable');

  lines.forEach((line, index) => {
    // Подстраиваемся под новый безопасный формат
    const flatLines = Array.isArray(schedule.lines[0]) ? schedule.lines.flat() : schedule.lines;
    line.innerText = flatLines[index] || '';
  });
}

function saveCurrentScheduleLines() {
  const schedules = getSchedules();
  const scheduleIndex = schedules.findIndex(schedule => schedule.id === currentScheduleId);
  if (scheduleIndex === -1) return;

  const lines = document.querySelectorAll('.schedule-editable');
  const updatedLines = [];

  // Просто сохраняем всё подряд в один список без вложенности
  lines.forEach(line => {
    updatedLines.push(line.innerText || '');
  });

  schedules[scheduleIndex].lines = updatedLines;
  saveSchedules(schedules);
}

function toggleScheduleDropdown() {
  const dropdown = document.getElementById('schedule-dropdown');

  if (!dropdown) return;

  if (dropdown.style.display === 'none' || dropdown.style.display === '') {
    renderScheduleDropdown();
    dropdown.style.display = 'block';
  } else {
    dropdown.style.display = 'none';
  }
}

function selectSchedule(scheduleId) {
  currentScheduleId = scheduleId;
  renderCurrentScheduleName();
  renderScheduleDropdown();
  renderScheduleLines();
  loadPlannerPanels();
  closePlannerPanels();

  const dropdown = document.getElementById('schedule-dropdown');
  if (dropdown) {
    dropdown.style.display = 'none';
  }

  cancelScheduleNameEdit();
}

function addNewSchedule() {
  const schedules = getSchedules();

  const newSchedule = {
    id: 'schedule-' + Date.now(),
    name: 'New Schedule',
    lines: getDefaultScheduleLines(),
    quickItems: getDefaultPlannerItems(),
    tasksItems: getDefaultPlannerItems(),
    projectsItems: getDefaultPlannerItems()
  };

  schedules.push(newSchedule);
  saveSchedules(schedules);

  currentScheduleId = newSchedule.id;
  renderCurrentScheduleName();
  renderScheduleDropdown();
  renderScheduleLines();
  loadPlannerPanels();
  closePlannerPanels();

  const dropdown = document.getElementById('schedule-dropdown');
  if (dropdown) {
    dropdown.style.display = 'none';
  }

  enableScheduleNameEdit();
}

function deleteSchedule(scheduleId) {
  let schedules = getSchedules();

  if (schedules.length === 1) {
    alert("You can't delete the last schedule 😭");
    return;
  }

  schedules = schedules.filter(s => s.id !== scheduleId);
  saveSchedules(schedules);

  currentScheduleId = schedules[0].id;

  renderCurrentScheduleName();
  renderScheduleDropdown();
  renderScheduleLines();
  loadPlannerPanels();
}

function enableScheduleNameEdit() {
  const editWrap = document.getElementById('schedule-name-edit-wrap');
  const input = document.getElementById('schedule-name-input');
  const saveBtn = document.getElementById('schedule-save-btn');

  if (!editWrap || !input || !saveBtn) return;

  input.value = getCurrentSchedule().name;
  editWrap.style.display = 'block';
  saveBtn.style.display = 'inline-block';
  input.focus();
  input.select();
}

function saveScheduleName() {
  const input = document.getElementById('schedule-name-input');
  const editWrap = document.getElementById('schedule-name-edit-wrap');
  const saveBtn = document.getElementById('schedule-save-btn');

  if (!input || !editWrap || !saveBtn) return;

  const newName = input.value.trim() || 'Untitled Schedule';

  const schedules = getSchedules();
  const scheduleIndex = schedules.findIndex(schedule => schedule.id === currentScheduleId);

  if (scheduleIndex === -1) return;

  schedules[scheduleIndex].name = newName;
  saveSchedules(schedules);

  renderCurrentScheduleName();
  renderScheduleDropdown();

  editWrap.style.display = 'none';
  saveBtn.style.display = 'none';
}

function cancelScheduleNameEdit() {
  const editWrap = document.getElementById('schedule-name-edit-wrap');
  const saveBtn = document.getElementById('schedule-save-btn');

  if (editWrap) {
    editWrap.style.display = 'none';
  }

  if (saveBtn) {
    saveBtn.style.display = 'none';
  }
}

function initPlanner() {
  initPlannerSchedule();
  loadPlannerPanels();
  closePlannerPanels();
}

function togglePlannerPanel(panelId, btn) {
  const panel = document.getElementById(panelId);
  const isAlreadyOpen = panel.classList.contains('active');

  closePlannerPanels();

  if (!isAlreadyOpen) {
    panel.classList.add('active');
    btn.classList.add('active');

    const arrow = btn.querySelector('.planner-tab-arrow');
    if (arrow) {
      arrow.textContent = '›';
    }
  }
}

function closePlannerPanels() {
  const panels = document.querySelectorAll('.planner-panel');
  panels.forEach(panel => {
    panel.classList.remove('active');
  });

  const buttons = document.querySelectorAll('.planner-tab-btn');
  buttons.forEach(button => {
    button.classList.remove('active');

    const arrow = button.querySelector('.planner-tab-arrow');
    if (arrow) {
      arrow.textContent = '‹';
    }
  });
}

function createPlannerRow(text = '', checked = false) {
  const template = document.getElementById('planner-row-template');
  const row = template.content.firstElementChild.cloneNode(true);

  if (checked) {
    row.classList.add('completed');
  }

  const checkbox = row.querySelector('input[type="checkbox"]');
  const editable = row.querySelector('.planner-row-text');
  const deleteBtn = row.querySelector('.planner-delete-btn');

  checkbox.checked = checked;
  editable.innerText = text;

  checkbox.addEventListener('change', () => {
    row.classList.toggle('completed', checkbox.checked);
    savePlannerPanels();
  });

  editable.addEventListener('input', () => {
    savePlannerPanels();
  });

  deleteBtn.addEventListener('click', () => {
    row.remove();
    savePlannerPanels();
  });

  return row;
}

function addPlannerItem(containerId, text = '', checked = false) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const row = createPlannerRow(text, checked);
  container.appendChild(row);
  savePlannerPanels();
}

function savePlannerPanels() {
  const schedules = getSchedules();
  const scheduleIndex = schedules.findIndex(schedule => schedule.id === currentScheduleId);
  if (scheduleIndex === -1) return;

  const mapping = {
    'quick-items': 'quickItems',
    'tasks-items': 'tasksItems',
    'projects-items': 'projectsItems'
  };

  Object.keys(mapping).forEach(containerId => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const items = [];
    const rows = container.querySelectorAll('.planner-row');

    rows.forEach(row => {
      const checkbox = row.querySelector('input[type="checkbox"]');
      const text = row.querySelector('.planner-row-text');

      items.push({
        checked: checkbox.checked,
        text: text.innerText
      });
    });

    schedules[scheduleIndex][mapping[containerId]] = items;
  });

  saveSchedules(schedules);
}

function loadPlannerPanels() {
  const currentSchedule = getCurrentSchedule();
  if (!currentSchedule) return;

  const mapping = {
    'quick-items': currentSchedule.quickItems || getDefaultPlannerItems(),
    'tasks-items': currentSchedule.tasksItems || getDefaultPlannerItems(),
    'projects-items': currentSchedule.projectsItems || getDefaultPlannerItems()
  };

  Object.keys(mapping).forEach(containerId => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    mapping[containerId].forEach(item => {
      const row = createPlannerRow(item.text, item.checked);
      container.appendChild(row);
    });
  });
}

function initPlannerSchedule() {
  const lines = document.querySelectorAll('.schedule-editable');

  lines.forEach((line) => {
    line.setAttribute('contenteditable', 'true');

    line.addEventListener('input', () => {
      saveCurrentScheduleLines();
    });
  });

  const schedules = getSchedules();
  if (schedules.length > 0) {
    currentScheduleId = schedules[0].id;
  }

  renderCurrentScheduleName();
  renderScheduleDropdown();
  renderScheduleLines();
}

let focusDuration = 15 * 60;
let focusRemaining = focusDuration;
let focusTimerInterval = null;
let focusIsRunning = false;

function setFocusTime(minutes) {
  if (focusIsRunning) return;

  focusDuration = minutes * 60;
  focusRemaining = focusDuration;

  document.querySelectorAll('.focus-time-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  const activeBtn = document.querySelector(`[data-focus-minutes="${minutes}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  updateFocusDisplay();
}

function openCustomFocusTime() {
  if (focusIsRunning) return;

  const hSelect = document.getElementById('custom-focus-hours');
  const mSelect = document.getElementById('custom-focus-minutes');
  const sSelect = document.getElementById('custom-focus-seconds');

  // Генерируем числа, если они еще пустые
  if (hSelect && hSelect.options.length === 0) {
    for (let i = 0; i <= 12; i++) hSelect.add(new Option(i, i));
    for (let i = 0; i <= 59; i++) {
      if (mSelect) mSelect.add(new Option(i, i));
      if (sSelect) sSelect.add(new Option(i, i));
    }
  }

  document.getElementById('overlay').style.display = 'block';
  document.getElementById('focus-time-popup').style.display = 'block';
}

function closeCustomFocusTime() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('focus-time-popup').style.display = 'none';
}

function applyCustomFocusTime() {
  const hours = Number(document.getElementById('custom-focus-hours').value) || 0;
  const minutes = Number(document.getElementById('custom-focus-minutes').value) || 0;
  const seconds = Number(document.getElementById('custom-focus-seconds').value) || 0;
  
  const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;

  if (totalSeconds <= 0) {
    alert('Please choose a time.');
    return;
  }

  focusDuration = totalSeconds;
  focusRemaining = focusDuration;

  document.querySelectorAll('.focus-time-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  updateFocusDisplay();
  closeCustomFocusTime();
}

function updateFocusDisplay() {
  const timer = document.getElementById('focus-timer');
  if (!timer) return;

  const minutes = Math.floor(focusRemaining / 60);
  const seconds = focusRemaining % 60;

  timer.textContent =
    String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');

  const revealRect = document.getElementById('revealRect');
  if (revealRect) {
    if (focusIsRunning) {
      const progress = 1 - (focusRemaining / focusDuration);
      const currentY = 450 - (410 * progress);
      const currentHeight = 410 * progress;
      revealRect.setAttribute('y', currentY);
      revealRect.setAttribute('height', currentHeight);
    } else {
      revealRect.setAttribute('y', '450');
      revealRect.setAttribute('height', '0');
    }
  }
}

function startFocusSession() {
  if (focusIsRunning) return;

  focusIsRunning = true;

  document.getElementById('focus-content').classList.add('running');
  document.getElementById('focus-exit-btn').style.display = 'block';
  document.getElementById('bottom-nav').style.display = 'none';
  document.getElementById('focus-message').textContent = '';

  focusTimerInterval = setInterval(() => {
    focusRemaining -= 1;
    updateFocusDisplay();

    if (focusRemaining <= 0) {
      finishFocusSession();
    }
  }, 1000);
}

function finishFocusSession() {
  clearInterval(focusTimerInterval);
  focusTimerInterval = null;
  focusIsRunning = false;

  document.getElementById('focus-message').textContent = 'Great job! Focus session completed ✨';
  addHabitScore(20);

  setTimeout(() => {
    document.getElementById('focus-content').classList.remove('running');
    document.getElementById('focus-exit-btn').style.display = 'none';
    document.getElementById('bottom-nav').style.display = 'flex';
    focusRemaining = focusDuration;
    updateFocusDisplay();
    document.getElementById('focus-message').textContent = '';
  }, 3000);
}

function cancelFocusSession() {
  if (!focusIsRunning) return;
  
  // Убрали confirm(), выходим из фокуса моментально!
  failFocusSession();
}

function failFocusSession() {
  clearInterval(focusTimerInterval);
  focusTimerInterval = null;
  focusIsRunning = false;

  document.getElementById('focus-content').classList.remove('running');
  document.getElementById('focus-exit-btn').style.display = 'none';
  document.getElementById('bottom-nav').style.display = 'flex';

  focusRemaining = focusDuration;
  updateFocusDisplay();

  const msg = document.getElementById('focus-message');
  if (msg) {
    msg.textContent = 'Session stopped. Try again when you are ready 💛';
    setTimeout(() => { msg.textContent = ''; }, 5000);
  }
}

// --- ЗАГРУЗКА И ЗАСТАВКА (С АВТОВХОДОМ) ---
document.addEventListener('DOMContentLoaded', function () {
  const introVideo = document.getElementById('intro-video');

  // Умная функция: решает, куда направить после видео
  function goAfterIntro() {
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen && currentScreen.id === 'intro-screen') {
      // Если Firebase нас помнит - пускаем сразу в приложение!
      if (window.auth && window.auth.currentUser) {
        showScreen('habits-screen');
      } else {
        showScreen('start-screen'); // Если нет - на экран старта
      }
    }
  }

  // 1. Переключаем по окончании видео
  if (introVideo) {
    introVideo.onended = goAfterIntro;
  }

  // 2. Железобетонный план Б: переключаем через 4 секунды
  setTimeout(goAfterIntro, 4000);
});

// --- ЛИДЕРБОРД ---
function updateLeaderboardScore() {
  const score = getHabitScore(); // Берем умный счет с учетом недели
  const scoreElement = document.getElementById('leaderboard-score');
  if (scoreElement) scoreElement.innerText = score;
  
  loadLeaderboard(); // Запускаем поиск соперников
}

async function loadLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  if (!list || !window.auth || !window.auth.currentUser) return;
  
  list.innerHTML = '<div class="card" style="text-align:center;">Loading scores... 🐝</div>';
  
  try {
    const currentWeek = getCurrentWeekId();
    // Ищем в базе только тех, кто заработал очки на ЭТОЙ неделе
    const q = window.query(
      window.collection(window.db, "users"),
      window.where("weekId", "==", currentWeek)
    );
    
    const snapshot = await window.getDocs(q);
    list.innerHTML = '';
    
    if (snapshot.empty) {
      list.innerHTML = '<div class="card" style="text-align:center;">No scores yet this week! Be the first! 🏆</div>';
      return;
    }

    // Собираем всех людей, сортируем от больших очков к меньшим
    const users = [];
    snapshot.forEach((doc) => users.push(doc.data()));
    users.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    // Берем только первых 10
    const top10 = users.slice(0, 10);
    
    top10.forEach((data, index) => {
      const rank = index + 1;
      const card = document.createElement('div');
      card.className = 'card';
      card.style.display = 'flex';
      card.style.justifyContent = 'space-between';
      card.style.alignItems = 'center';
      card.style.padding = '12px 18px';
      
      // Выдаем красивые медали
      let medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `<b>${rank}.</b>`;
      
      card.innerHTML = `<span>${medal} ${data.name || 'Student'}</span> <span style="color:#59351F;"><b>${data.score}</b> pts</span>`;
      list.appendChild(card);
    });
    
  } catch (error) {
    console.error(error);
    list.innerHTML = '<div class="card" style="text-align:center;">Could not load leaderboard 😢</div>';
  }
}
// --- DAILY CHALLENGE ---
const challenges = [
  "Put your phone away 30 minutes before sleep",
  "Contact a family member or a close friend",
  "Organize your study workspace for 10 minutes",
  "Read 10 pages of a non-academic book",
  "Ensure you drink at least 2 liters of water",
  "Write down three things you are grateful for",
  "Avoid using your phone during your lunch break",
  "Take a 5-minute stretching break between tasks",
  "Practice meditation in a quiet space for 5 minutes",
  "Provide a sincere compliment to a colleague",
  "Plan your tasks and outfit for tomorrow in advance",
  "Listen to focused music without switching tracks",
  "Remove five unused applications from your device",
  "Create a priority list for the next day",
  "Engage in 15 minutes of light indoor exercise"
];

function getDailyChallenge() {
  const today = new Date();
  const dateId = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  let seed = 0;
  for (let i = 0; i < dateId.length; i++) { seed += dateId.charCodeAt(i); }
  const index = seed % challenges.length;
  return { text: challenges[index], id: dateId };
}

function loadDailyChallenge() {
  const challenge = getDailyChallenge();
  const savedStatus = localStorage.getItem(getUserKey('challengeDoneId'));
  
  const descElement = document.getElementById('challenge-desc');
  const btn = document.getElementById('challenge-btn');
  const reward = document.getElementById('challenge-reward');
  const card = document.querySelector('.challenge-card');

  if (descElement) descElement.textContent = challenge.text;

  if (savedStatus === challenge.id) {
    if (btn) btn.style.display = 'none';
    if (reward) reward.style.display = 'block';
    if (card) card.classList.add('completed');
  } else {
    if (btn) btn.style.display = 'block';
    if (reward) reward.style.display = 'none';
    if (card) card.classList.remove('completed');
  }
}

function completeChallenge() {
  const challenge = getDailyChallenge();
  localStorage.setItem(getUserKey('challengeDoneId'), challenge.id);
  addHabitScore(15);
  loadDailyChallenge();
  alert("Great job! +15 points added to your score 🐝");
}


// --- ШАБЛОНЫ ПРИВЫЧЕК ---
const habitTemplates = {
  'cat-health': [
    { id: 't1', emoji: '💧', name: 'Drink 2L of water', desc: 'Hydration is key to energy, focus, and healthy skin.', goalPeriod: 'day', goalValue: 1, taskType: 'everyday' },
    { id: 't2', emoji: '🏃‍♀️', name: '15 min exercise', desc: 'Keep your body moving. Yoga, stretching, or a quick walk.', goalPeriod: 'day', goalValue: 1, taskType: 'everyday' },
    { id: 't3', emoji: '😴', name: 'Sleep 8 hours', desc: 'Prioritize your recovery. Go to bed on time!', goalPeriod: 'day', goalValue: 1, taskType: 'everyday' }
  ],
  'cat-mental': [
    { id: 't4', emoji: '🧘‍♀️', name: '5 min meditation', desc: 'Clear your mind before starting the day. Just breathe.', goalPeriod: 'day', goalValue: 1, taskType: 'everyday' },
    { id: 't5', emoji: '📵', name: 'No phone 1h before bed', desc: 'Reduces blue light exposure and improves sleep quality dramatically.', goalPeriod: 'day', goalValue: 1, taskType: 'everyday' },
    { id: 't6', emoji: '✍️', name: 'Gratitude journal', desc: 'Write down 3 things you are grateful for today.', goalPeriod: 'day', goalValue: 1, taskType: 'everyday' }
  ],
  'cat-study': [
    { id: 't7', emoji: '📚', name: 'Read 10 pages', desc: 'Non-academic reading for personal growth.', goalPeriod: 'day', goalValue: 1, taskType: 'everyday' },
    { id: 't8', emoji: '🎯', name: '1 deep focus session', desc: 'At least one undisturbed study block using the Focus timer.', goalPeriod: 'day', goalValue: 1, taskType: 'weekdays' },
    { id: 't9', emoji: '📝', name: 'Plan tomorrow', desc: 'Write down tasks for the next day to reduce anxiety.', goalPeriod: 'day', goalValue: 1, taskType: 'everyday' }
  ]
};

function toggleCategory(catId, btn) {
  const content = document.getElementById(catId);
  content.classList.toggle('active');
  btn.classList.toggle('active');
}

function openChooseHabitScreen() {
  // Рисуем карточки шаблонов перед открытием экрана
  for (const [catId, habits] of Object.entries(habitTemplates)) {
    const container = document.getElementById(catId);
    if (!container) continue;
    container.innerHTML = '';
    habits.forEach(tmpl => {
      const card = document.createElement('div');
      card.className = 'template-card';
      card.innerHTML = `
        <div class="template-info">
          <div class="template-emoji">${tmpl.emoji}</div>
          <h4 class="template-title">${tmpl.name}</h4>
        </div>
        <button type="button" class="template-add-btn" onclick="quickAddTemplate('${tmpl.id}')">+</button>
      `;
      container.appendChild(card);
    });
  }
  showScreen('choose-habit-screen');
}

function quickAddTemplate(tmplId) {
  // Ищем какой шаблон выбрали
  let template = null;
  for (const cat of Object.values(habitTemplates)) {
    const found = cat.find(t => t.id === tmplId);
    if (found) {
      template = found;
      break;
    }
  }
  if (!template) return;

  const today = formatHabitDateKey(new Date());
  
  // Создаем готовую привычку
  const newHabit = {
    id: 'habit-' + Date.now(),
    emoji: template.emoji,
    name: template.name,
    description: template.desc,
    goalPeriod: template.goalPeriod,
    goalValue: template.goalValue,
    taskType: template.taskType,
    taskDays: [],
    startDate: today,
    endDate: '',
    completions: {}
  };

  // Для weekdays добавляем пн-пт по дефолту
  if (template.taskType === 'weekdays') {
    newHabit.taskDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  }

  // Сохраняем и возвращаемся
  let habitsList = getHabits();
  habitsList.push(newHabit);
  saveHabits(habitsList);
  
  showScreen('habits-screen');
}
