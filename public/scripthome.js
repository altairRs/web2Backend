// Timer Logic
let timerInterval;
let totalSeconds = 25 * 60;
let remainingSeconds = totalSeconds;

function updateDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    document.getElementById('timer').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        if (remainingSeconds > 0) {
            remainingSeconds--;
            updateDisplay();
        } else {
            clearInterval(timerInterval);
            alert("Time's up! Take a break.");
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    stopTimer();
    remainingSeconds = totalSeconds;
    updateDisplay();
}

updateDisplay();

// Modal Logic
const taskModal = document.getElementById('taskModal');
const taskTitleInput = document.getElementById('taskTitle');
const taskCategorySelect = document.getElementById('taskCategory');
const saveTaskButton = document.getElementById('saveTask');
const closeModalButton = document.getElementById('closeModal');
const addTaskButton = document.getElementById('addTaskButton');

let currentTask = null;

addTaskButton.addEventListener('click', () => {
    openTaskModal();
});

function openTaskModal(task = null) {
    currentTask = task;
    if (task) {
        taskTitleInput.value = task.querySelector('p').innerText;
        taskCategorySelect.value = task.dataset.category;
    } else {
        taskTitleInput.value = '';
        taskCategorySelect.value = 'Copywriting';
    }
    taskModal.classList.add('show');
}

closeModalButton.addEventListener('click', () => {
    taskModal.classList.remove('show');
});

// Show tasks
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch tasks from the backend
        const response = await fetch('/api/tasks');
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const tasks = await response.json();

        // Render tasks in the appropriate columns
        tasks.forEach((task) => {
            const taskDiv = document.createElement('div');
            taskDiv.classList.add('task');
            taskDiv.dataset.category = task.category;
            taskDiv.dataset.status = task.status;
            taskDiv.innerHTML = `
                <span class="task-label">${task.category}</span>
                <p>${task.title}</p>
            `;

            const column = document.querySelector(`[data-status="${task.status}"]`);
            if (column) column.appendChild(taskDiv);
        });

        // Update overall progress
        updateOverallProgress(tasks);
    } catch (error) {
        console.error('Error loading tasks:', error.message);
        alert('Failed to load tasks. Please try again.');
    }
});

// Save task
saveTaskButton.addEventListener('click', async () => {
    const taskData = {
        title: taskTitleInput.value,
        category: taskCategorySelect.value,
        status: 'pending', // Default status for new tasks
    };

    try {
        // Send task to the backend
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Server response:', data);
            throw new Error('Failed to save task');
        }

        // Add task to the UI
        const taskDiv = document.createElement('div');
        taskDiv.classList.add('task');
        taskDiv.dataset.category = data.category;
        taskDiv.dataset.status = data.status;
        taskDiv.innerHTML = `
            <span class="task-label">${data.category}</span>
            <p>${data.title}</p>
        `;
        document.querySelector(`[data-status="pending"]`).appendChild(taskDiv);

        // Close modal
        taskModal.classList.remove('show');

        // Update overall progress
        const tasks = await fetchTasks();
        updateOverallProgress(tasks);
    } catch (error) {
        console.error('Error:', error.message);
        alert('Failed to add task. Please try again.');
    }
});

// Fetch tasks from the backend
async function fetchTasks() {
    const response = await fetch('/api/tasks');
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return await response.json();
}

// Update overall progress
function updateOverallProgress(tasks) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const overallProgress = (completedTasks / totalTasks) * 100;

    const overallProgressBar = document.getElementById('overall-progress');
    overallProgressBar.style.width = `${overallProgress}%`;
    overallProgressBar.setAttribute('aria-valuenow', overallProgress);
}

function getCategoryColor(category) {
    switch (category) {
        case 'UI Design':
            return '#007bff';
        case 'Illustration':
            return '#28a745';
        case 'Copywriting':
            return '#ffc107';
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/api/auth/check", { credentials: "include" });
        const data = await response.json();

        if (!data.authenticated) {
            window.location.href = "/login.html"; // Redirect if not logged in
        }
    } catch (error) {
        console.error("Error checking authentication:", error);
        window.location.href = "/login.html";
    }
});

function logout() {
fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    .then(response => response.json())
    .then(data => {
        window.location.href = data.redirect; // Redirect to login
    })
    .catch(error => console.error("Logout failed:", error));
}
