
let isDropdownOpen = false;
let isDescending = false;

function toggleNavMenu() {
    const navDropdown = document.getElementById('navDropdown');
    navDropdown.classList.toggle('show');

    // Close other dropdowns if open
    const alertDropdown = document.getElementById('alertDropdown');
    const notificationDropdown = document.getElementById('notificationDropdown');

    if (alertDropdown && alertDropdown.classList.contains('active')) {
        alertDropdown.classList.remove('active');
    }
    if (notificationDropdown && notificationDropdown.classList.contains('active')) {
        notificationDropdown.classList.remove('active');
    }
}

function setActiveNav(element) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-menu .nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to clicked item
    element.classList.add('active');
}

function toggleSubmenu(element) {
    // Toggle expanded state
    element.classList.toggle('expanded');

    // Find next sibling that's a sub-item
    let nextElement = element.nextElementSibling;
    while (nextElement && !nextElement.classList.contains('dropdown-divider')) {
        if (nextElement.classList.contains('sub-item')) {
            nextElement.style.display = element.classList.contains('expanded') ? 'block' : 'none';
        }
        nextElement = nextElement.nextElementSibling;
    }

    // Rotate arrow
    const arrow = element.querySelector('.dropdown-arrow');
    if (arrow) {
        arrow.style.transform = element.classList.contains('expanded') ? 'rotate(180deg)' : '';
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const navDropdown = document.getElementById('navDropdown');
    const hamburgerButton = document.querySelector('.hamburger-button');

    if (!event.target.closest('.nav-dropdown') &&
        !event.target.closest('.hamburger-button') &&
        navDropdown.classList.contains('show')) {
        navDropdown.classList.remove('show');
    }
});

// Close dropdown on window resize above breakpoint
window.addEventListener('resize', function () {
    if (window.innerWidth > 1268) {
        const navDropdown = document.getElementById('navDropdown');
        if (navDropdown.classList.contains('show')) {
            navDropdown.classList.remove('show');
        }
    }
});

function toggleNotification(event) {
    const notificationIcon = event.currentTarget;
    const dropdown = document.getElementById('notificationDropdown');
    const badge = notificationIcon.querySelector('.notification-badge');

    // Close alert dropdown if open
    const alertDropdown = document.getElementById('alertDropdown');
    const alertIcon = document.querySelector('.Alert-icon');
    if (alertDropdown && alertDropdown.classList.contains('active')) {
        alertDropdown.classList.remove('active');
        alertIcon.classList.remove('active');
        alertIcon.querySelector('.alert-badge').classList.remove('clicked');
        alertIcon.querySelector('.notification-svg').style.filter = 'none';
    }

    // Toggle notification dropdown
    dropdown.classList.toggle('active');
    notificationIcon.classList.toggle('active');

    if (dropdown.classList.contains('active')) {
        badge.classList.add('clicked');
    } else {
        badge.classList.remove('clicked');
    }

    event.stopPropagation();
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('notificationDropdown');
    const notificationIcon = document.querySelector('.notification-icon');
    const badge = notificationIcon.querySelector('.notification-badge');

    if (!event.target.closest('.notification-icon') && dropdown.classList.contains('active')) {
        dropdown.classList.remove('active');
        notificationIcon.classList.remove('active');
        badge.classList.remove('clicked');
    }
});

function toggleNotificationAlert(event) {
    const alertIcon = event.currentTarget;
    const dropdown = document.getElementById('alertDropdown');
    const badge = alertIcon.querySelector('.alert-badge');

    // Close notification dropdown if open
    const notificationDropdown = document.getElementById('notificationDropdown');
    const notificationIcon = document.querySelector('.notification-icon');
    if (notificationDropdown && notificationDropdown.classList.contains('active')) {
        notificationDropdown.classList.remove('active');
        notificationIcon.classList.remove('active');
        notificationIcon.querySelector('.notification-badge').classList.remove('clicked');
    }

    // Toggle alert dropdown
    dropdown.classList.toggle('active');
    alertIcon.classList.toggle('active');

    if (dropdown.classList.contains('active')) {
        badge.classList.add('clicked');
        alertIcon.querySelector('.notification-svg').style.filter = 'brightness(0) invert(1)';
    } else {
        badge.classList.remove('clicked');
        alertIcon.querySelector('.notification-svg').style.filter = 'none';
    }

    event.stopPropagation();
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('alertDropdown');
    const alertIcon = document.querySelector('.Alert-icon'); // Fixed the selector

    if (dropdown && alertIcon) {
        const badge = alertIcon.querySelector('.alert-badge');

        if (!event.target.closest('.Alert-icon') && dropdown.classList.contains('active')) {
            dropdown.classList.remove('active');
            alertIcon.classList.remove('active');
            badge.classList.remove('clicked');
            alertIcon.querySelector('.notification-svg').style.filter = 'none';
        }
    }
});

async function loadCourses() {
    try {
        const response = await fetch('courses.json');
        const data = await response.json();
        displayCourses(data.courses);
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

function displayCourses(courses) {
    const container = document.querySelector('.cards-container');
    container.innerHTML = ''; // Clear existing cards

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
document.addEventListener('DOMContentLoaded', loadCourses);
// Additional functions (e.g., selectSort, selectTab) can be implemented similarly.


function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.class-info .dropdown');
    
    dropdowns.forEach(dropdown => {
        const select = dropdown.querySelector('select');
        
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

// Add to your existing initialization code
document.addEventListener('DOMContentLoaded', () => {
    // ...existing code...
    loadCourses().then(() => {
        setupDropdowns();
    });
});