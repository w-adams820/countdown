const modalOverlay = document.getElementById('modal-overlay');
const saveEventBtn = document.getElementById('save-event-btn');
const eventList = document.getElementById('event-list');
const heroTitle = document.getElementById('hero-title');
const heroDays = document.getElementById('hero-days');
const heroHours = document.getElementById('hero-hours');
const heroMinutes = document.getElementById('hero-minutes');
const heroSeconds = document.getElementById('hero-seconds');
const heroStatus = document.getElementById('hero-status');
const inputName = document.getElementById('input-name');
const inputDate = document.getElementById('input-date');
const toastContainer = document.getElementById('toast-container');
const eventSearch = document.getElementById('event-search');
const sortClosestBtn = document.getElementById('sort-closest');
const sortAZBtn = document.getElementById('sort-az');

let events = [];
let filteredEvents = [];
let selectedEventId = null;
let currentSort = 'closest';
const storageKey = 'chronosCountdownEvents';

function toggleModal(open) {
    if (open) {
        modalOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        inputName.focus();
    } else {
        modalOverlay.classList.add('hidden');
        document.body.style.overflow = '';
        inputName.value = '';
        inputDate.value = '';
    }
}

window.toggleModal = toggleModal;

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'rounded-xl bg-surface-container-high border border-outline-variant/60 px-4 py-3 text-sm text-primary animate-in slide-in-from-bottom duration-200';
    toast.textContent = message;

    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-active');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('toast-active');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 2600);
}

function saveEvents() {
    localStorage.setItem(storageKey, JSON.stringify(events));
}

function loadEvents() {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;

    try {
        events = JSON.parse(stored).map(event => ({
            ...event,
            date: event.date,
        }));
    } catch {
        events = [];
    }
}

function formatDateLabel(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getUpcomingEvents() {
    const now = Date.now();
    return events
        .slice()
        .sort((a, b) => {
            if (currentSort === 'az') {
                return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
            }
            const aTime = new Date(a.date).getTime();
            const bTime = new Date(b.date).getTime();
            return aTime - bTime;
        });
}

function getSelectedEvent() {
    if (!selectedEventId && filteredEvents.length) {
        return filteredEvents[0];
    }
    return filteredEvents.find(event => event.id === selectedEventId) || filteredEvents[0];
}

function updateHeroPanel() {
    const event = getSelectedEvent();
    if (!event) {
        heroTitle.textContent = 'SELECT AN EVENT';
        heroDays.textContent = '00';
        heroHours.textContent = '00';
        heroMinutes.textContent = '00';
        heroSeconds.textContent = '00';
        heroStatus.classList.add('hidden');
        return;
    }

    heroTitle.textContent = event.name.toUpperCase();
    const target = new Date(event.date).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
        heroDays.textContent = '00';
        heroHours.textContent = '00';
        heroMinutes.textContent = '00';
        heroSeconds.textContent = '00';
        heroStatus.textContent = '🎉 EVENT HAS ARRIVED!';
        heroStatus.classList.remove('hidden');
        return;
    }

    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / (1000 * 60)) % 60;
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    heroDays.textContent = String(days).padStart(2, '0');
    heroHours.textContent = String(hours).padStart(2, '0');
    heroMinutes.textContent = String(minutes).padStart(2, '0');
    heroSeconds.textContent = String(seconds).padStart(2, '0');
    heroStatus.classList.add('hidden');
}

function renderEvents() {
    filteredEvents = getUpcomingEvents().filter(item => {
        const search = eventSearch.value.trim().toLowerCase();
        return item.name.toLowerCase().includes(search);
    });

    if (!filteredEvents.length) {
        eventList.innerHTML = '<div class="col-span-full rounded-3xl border border-outline-variant/30 bg-surface-container-low p-6 text-center text-on-surface-variant">No events found. Add one to get started.</div>';
        updateHeroPanel();
        return;
    }

    eventList.innerHTML = filteredEvents
        .map(event => {
            const now = Date.now();
            const target = new Date(event.date).getTime();
            const diff = Math.max(0, target - now);
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
            const minutes = Math.floor(diff / (1000 * 60)) % 60;
            const seconds = Math.floor(diff / 1000) % 60;
            const expired = target <= now;

            return `
                <button type="button" class="group text-left rounded-3xl border border-outline-variant/30 bg-surface-container-low p-6 transition-all hover:border-primary ${selectedEventId === event.id ? 'ring-2 ring-primary/40' : ''}" data-event-id="${event.id}">
                    <div class="flex items-center justify-between gap-4 mb-4">
                        <div>
                            <h3 class="font-headline-sm text-headline-sm text-primary">${event.name}</h3>
                            <p class="mt-1 text-body-sm text-on-surface-variant">${formatDateLabel(event.date)}</p>
                        </div>
                        <span class="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">${expired ? 'Expired' : 'Upcoming'}</span>
                    </div>
                    <div class="grid grid-cols-4 gap-2 text-center">
                        <div class="rounded-2xl bg-background/80 p-3">
                            <div class="font-display-countdown-mobile text-display-countdown-mobile text-primary">${String(days).padStart(2, '0')}</div>
                            <div class="mt-2 text-[10px] uppercase tracking-[0.25em] text-outline">Days</div>
                        </div>
                        <div class="rounded-2xl bg-background/80 p-3">
                            <div class="font-display-countdown-mobile text-display-countdown-mobile text-primary">${String(hours).padStart(2, '0')}</div>
                            <div class="mt-2 text-[10px] uppercase tracking-[0.25em] text-outline">Hours</div>
                        </div>
                        <div class="rounded-2xl bg-background/80 p-3">
                            <div class="font-display-countdown-mobile text-display-countdown-mobile text-primary">${String(minutes).padStart(2, '0')}</div>
                            <div class="mt-2 text-[10px] uppercase tracking-[0.25em] text-outline">Min</div>
                        </div>
                        <div class="rounded-2xl bg-background/80 p-3">
                            <div class="font-display-countdown-mobile text-display-countdown-mobile text-primary">${String(seconds).padStart(2, '0')}</div>
                            <div class="mt-2 text-[10px] uppercase tracking-[0.25em] text-outline">Sec</div>
                        </div>
                    </div>
                </button>
            `;
        })
        .join('');

    Array.from(eventList.children).forEach(card => {
        card.addEventListener('click', () => {
            selectedEventId = card.dataset.eventId;
            renderEvents();
            updateHeroPanel();
        });
    });

    updateHeroPanel();
}

function handleSaveEvent() {
    const name = inputName.value.trim();
    const dateValue = inputDate.value;
    const selectedDate = new Date(dateValue);

    if (!name) {
        showToast('Please add an event name.');
        return;
    }

    if (!dateValue || Number.isNaN(selectedDate.getTime())) {
        showToast('Please select a valid date and time.');
        return;
    }

    const event = {
        id: `event-${Date.now()}`,
        name,
        date: selectedDate.toISOString(),
    };

    events.push(event);
    saveEvents();
    selectedEventId = event.id;
    toggleModal(false);
    renderEvents();
    showToast('Event added successfully!');
}

function handleSearch() {
    renderEvents();
}

function setSort(sortMethod) {
    currentSort = sortMethod;
    sortClosestBtn.classList.toggle('bg-primary', sortMethod === 'closest');
    sortClosestBtn.classList.toggle('text-on-primary', sortMethod === 'closest');
    sortClosestBtn.classList.toggle('bg-surface-container-high', sortMethod !== 'closest');
    sortClosestBtn.classList.toggle('text-label-caps', sortMethod !== 'closest');
    sortAZBtn.classList.toggle('bg-primary', sortMethod === 'az');
    sortAZBtn.classList.toggle('text-on-primary', sortMethod === 'az');
    sortAZBtn.classList.toggle('bg-surface-container-high', sortMethod !== 'az');
    sortAZBtn.classList.toggle('text-label-caps', sortMethod !== 'az');
    renderEvents();
}

saveEventBtn.addEventListener('click', handleSaveEvent);
eventSearch.addEventListener('input', handleSearch);
sortClosestBtn.addEventListener('click', () => setSort('closest'));
sortAZBtn.addEventListener('click', () => setSort('az'));

loadEvents();
setSort('closest');
renderEvents();
setInterval(updateHeroPanel, 1000);
