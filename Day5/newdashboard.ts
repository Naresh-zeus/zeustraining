let isDropdownOpen: boolean = false;
let isDescending: boolean = false;

function toggleNavMenu(): void {
    const navDropdown = document.getElementById('navDropdown') as HTMLElement;
    navDropdown.classList.toggle('show');

    // Close other dropdowns if open
    const alertDropdown = document.getElementById('alertDropdown') as HTMLElement | null;
    const notificationDropdown = document.getElementById('notificationDropdown') as HTMLElement | null;

    if (alertDropdown && alertDropdown.classList.contains('active')) {
        alertDropdown.classList.remove('active');
    }
    if (notificationDropdown && notificationDropdown.classList.contains('active')) {
        notificationDropdown.classList.remove('active');
    }
}

function setActiveNav(element: HTMLElement): void {
    document.querySelectorAll('.nav-menu .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    element.classList.add('active');
}

function toggleSubmenu(element: HTMLElement): void {
    element.classList.toggle('expanded');
    let nextElement = element.nextElementSibling as HTMLElement | null;
    while (nextElement && !nextElement.classList.contains('dropdown-divider')) {
        if (nextElement.classList.contains('sub-item')) {
            nextElement.style.display = element.classList.contains('expanded') ? 'block' : 'none';
        }
        nextElement = nextElement.nextElementSibling as HTMLElement | null;
    }
    const arrow = element.querySelector('.dropdown-arrow') as HTMLElement | null;
    if (arrow) {
        arrow.style.transform = element.classList.contains('expanded') ? 'rotate(180deg)' : '';
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event: MouseEvent) {
    const navDropdown = document.getElementById('navDropdown') as HTMLElement;
    const hamburgerButton = document.querySelector('.hamburger-button') as HTMLElement;
    const target = event.target as HTMLElement;

    if (!target.closest('.nav-dropdown') &&
        !target.closest('.hamburger-button') &&
        navDropdown.classList.contains('show')) {
        navDropdown.classList.remove('show');
    }
});

// Close dropdown on window resize above breakpoint
window.addEventListener('resize', function () {
    if (window.innerWidth > 1268) {
        const navDropdown = document.getElementById('navDropdown') as HTMLElement;
        if (navDropdown.classList.contains('show')) {
            navDropdown.classList.remove('show');
        }
    }
});

function toggleNotification(event: MouseEvent): void {
    const notificationIcon = event.currentTarget as HTMLElement;
    const dropdown = document.getElementById('notificationDropdown') as HTMLElement;
    const badge = notificationIcon.querySelector('.notification-badge') as HTMLElement;

    // Close alert dropdown if open
    const alertDropdown = document.getElementById('alertDropdown') as HTMLElement | null;
    const alertIcon = document.querySelector('.Alert-icon') as HTMLElement | null;
    if (alertDropdown && alertDropdown.classList.contains('active')) {
        alertDropdown.classList.remove('active');
        if (alertIcon) {
            alertIcon.classList.remove('active');
            const alertBadge = alertIcon.querySelector('.alert-badge') as HTMLElement | null;
            if (alertBadge) alertBadge.classList.remove('clicked');
            const alertSvg = alertIcon.querySelector('.notification-svg') as HTMLElement | null;
            if (alertSvg) alertSvg.style.filter = 'none';
        }
    }

    dropdown.classList.toggle('active');
    notificationIcon.classList.toggle('active');

    if (dropdown.classList.contains('active')) {
        badge.classList.add('clicked');
    } else {
        badge.classList.remove('clicked');
    }

    event.stopPropagation();
}

// Close notification dropdown when clicking outside
document.addEventListener('click', function (event: MouseEvent) {
    const dropdown = document.getElementById('notificationDropdown') as HTMLElement;
    const notificationIcon = document.querySelector('.notification-icon') as HTMLElement;
    const badge = notificationIcon.querySelector('.notification-badge') as HTMLElement;
    const target = event.target as HTMLElement;

    if (!target.closest('.notification-icon') && dropdown.classList.contains('active')) {
        dropdown.classList.remove('active');
        notificationIcon.classList.remove('active');
        badge.classList.remove('clicked');
    }
});

function toggleNotificationAlert(event: MouseEvent): void {
    const alertIcon = event.currentTarget as HTMLElement;
    const dropdown = document.getElementById('alertDropdown') as HTMLElement;
    const badge = alertIcon.querySelector('.alert-badge') as HTMLElement;

    // Close notification dropdown if open
    const notificationDropdown = document.getElementById('notificationDropdown') as HTMLElement | null;
    const notificationIcon = document.querySelector('.notification-icon') as HTMLElement | null;
    if (notificationDropdown && notificationDropdown.classList.contains('active')) {
        notificationDropdown.classList.remove('active');
        if (notificationIcon) {
            notificationIcon.classList.remove('active');
            const notifBadge = notificationIcon.querySelector('.notification-badge') as HTMLElement | null;
            if (notifBadge) notifBadge.classList.remove('clicked');
        }
    }

    dropdown.classList.toggle('active');
    alertIcon.classList.toggle('active');

    if (dropdown.classList.contains('active')) {
        badge.classList.add('clicked');
        const alertSvg = alertIcon.querySelector('.notification-svg') as HTMLElement | null;
        if (alertSvg) alertSvg.style.filter = 'brightness(0) invert(1)';
    } else {
        badge.classList.remove('clicked');
        const alertSvg = alertIcon.querySelector('.notification-svg') as HTMLElement | null;
        if (alertSvg) alertSvg.style.filter = 'none';
    }

    event.stopPropagation();
}

// Close alert dropdown when clicking outside
document.addEventListener('click', function (event: MouseEvent) {
    const dropdown = document.getElementById('alertDropdown') as HTMLElement | null;
    const alertIcon = document.querySelector('.Alert-icon') as HTMLElement | null;
    if (dropdown && alertIcon) {
        const badge = alertIcon.querySelector('.alert-badge') as HTMLElement | null;
        const target = event.target as HTMLElement;
        if (!target.closest('.Alert-icon') && dropdown.classList.contains('active')) {
            dropdown.classList.remove('active');
            alertIcon.classList.remove('active');
            if (badge) badge.classList.remove('clicked');
            const alertSvg = alertIcon.querySelector('.notification-svg') as HTMLElement | null;
            if (alertSvg) alertSvg.style.filter = 'none';
        }
    }
});

interface Course {
    isExpired?: boolean;
    image: string;
    title: string;
    isFavorite?: boolean;
    subject: string;
    grade: {
        level: string;
        additional: string;
    };
    units?: number;
    lessons?: number;
    topics?: number;
    classInfo: {
        name: string;
        options?: string[];
        students?: number;
        duration: {
            start: string;
            end: string;
        };
    };
}

async function loadCourses(): Promise<void> {
    try {
        const response = await fetch('courses.json');
        const data = await response.json();
        displayCourses(data.courses);
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

function displayCourses(courses: Course[]): void {
    const container = document.querySelector('.cards-container') as HTMLElement;
    container.innerHTML = '';

    courses.forEach(course => {
        const card = `
            <div class="course-card">
                <div class="card-content">
                    ${course.isExpired ? '<div class="expired-label">Expired</div>' : ''}
                    <img src="${course.image}" alt="${course.title}" class="course-image">
                    <div class="card-right">
                        <div class="card-header">
                            <h3 class="course-title">${course.title}</h3>
                            <span class="favorite-star ${!course.isFavorite ? 'grey-star' : ''}">★</span>
                        </div>
                        <div class="course-meta">
                            <span>${course.subject}</span>
                            <span>|</span>
                            <span>Grade ${course.grade.level} <span class="grade-plus">+${course.grade.additional}</span></span>
                        </div>
                        ${course.units ? `
                        <div class="course-stats">
                            <span class="stat"><strong>${course.units}</strong> Units</span>
                            <span class="stat"><strong>${course.lessons}</strong> Lessons</span>
                            <span class="stat"><strong>${course.topics}</strong> Topics</span>
                        </div>
                        ` : ''}
                        <div class="class-info">
                            <div class="dropdown">
                                <select class="class-select">
                                    ${course.classInfo.options ?
                                        course.classInfo.options.map(option =>
                                            `<option value="${option}">${option}</option>`
                                        ).join('')
                                        : `<option value="${course.classInfo.name}">${course.classInfo.name}</option>`
                                    }
                                </select>
                                <div class="dropdown-arrow"></div>
                            </div>
                            ${course.classInfo.students ? `
                            <div class="class-details">
                                <span>${course.classInfo.students} Students</span>
                                <span>|</span>
                                <span>${course.classInfo.duration.start} - ${course.classInfo.duration.end}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="action-button">
                        <img src="assets/icons/preview.svg" alt="View">
                    </button>
                    <button class="action-button">
                        <img src="assets/icons/manage course.svg" alt="Calendar">
                    </button>
                    <button class="action-button">
                        <img src="assets/icons/grade submissions.svg" alt="Add">
                    </button>
                    <button class="action-button">
                        <img src="assets/icons/reports.svg" alt="Statistics">
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

// Load courses when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadCourses().then(() => {
        setupDropdowns();
    });
});

function setupDropdowns(): void {
    const dropdowns = document.querySelectorAll('.class-info .dropdown');
    dropdowns.forEach(dropdown => {
        const select = dropdown.querySelector('select');
        if (!select) return;
        select.addEventListener('focus', () => {
            dropdown.classList.add('active');
        });
        select.addEventListener('blur', () => {
            dropdown.classList.remove('active');
        });
        select.addEventListener('change', () => {
            dropdown.classList.remove('active');
        });
    });
}