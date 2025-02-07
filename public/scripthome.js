// Timer Logic (No changes here, but kept for completeness)
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

// Modal Logic (Minor changes for clarity)
const taskModal = document.getElementById('taskModal');
const taskTitleInput = document.getElementById('taskTitle');
const taskCategorySelect = document.getElementById('taskCategory');
const saveTaskButton = document.getElementById('saveTask');
const closeModalButton = document.getElementById('closeModal');
const addTaskButton = document.getElementById('addTaskButton');

let currentTask = null; // Not used for drag-and-drop, but kept for modal editing

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
        taskCategorySelect.value = 'Copywriting'; // Default category
    }
    taskModal.classList.add('show');
}

closeModalButton.addEventListener('click', () => {
    taskModal.classList.remove('show');
});

// Show tasks (Modified to include task ID)
document.addEventListener('DOMContentLoaded', async () => {
    await loadTasks(); // Use a single function for loading tasks
});

// Update overall progress
function updateOverallProgress(tasks) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0; // Avoid division by zero

    const overallProgressBar = document.getElementById('overall-progress');
    overallProgressBar.style.width = `${overallProgress}%`;
    overallProgressBar.setAttribute('aria-valuenow', overallProgress);
}

// Update category progress

function updateCategoryProgress(tasks) {
    const categories = ['Copywriting', 'Illustration', 'UI Design']; // Define your categories

    categories.forEach(category => {
        const categoryTasks = tasks.filter(task => task.category === category);
        const totalCategoryTasks = categoryTasks.length;
        const completedCategoryTasks = categoryTasks.filter(task => task.status === 'completed').length;
        const categoryProgress = totalCategoryTasks > 0 ? (completedCategoryTasks / totalCategoryTasks) * 100 : 0;

        // Find the progress bar element for this category.  We'll use a naming convention.
        const progressBarElement = document.querySelector(`.progress-bar[data-category="${category}"]`);

        if (progressBarElement) {
            progressBarElement.style.width = `${categoryProgress}%`;
            progressBarElement.setAttribute('aria-valuenow', categoryProgress);
        }
    });
}

// Save task (Modified to handle both new and updated tasks)
saveTaskButton.addEventListener('click', async () => {
    const taskData = {
        title: taskTitleInput.value,
        category: taskCategorySelect.value,
        status: currentTask ? currentTask.dataset.status : 'pending', // Use existing status if editing
    };

    const method = currentTask ? 'PUT' : 'POST'; // Determine if it's an update or a new task
    const url = currentTask ? `/api/tasks/${currentTask.dataset.id}` : '/api/tasks';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Server response:', data);
            throw new Error(`Failed to ${currentTask ? 'update' : 'save'} task`);
        }

        // Update or add task to the UI
        if (currentTask) {
            // Update existing task
            currentTask.querySelector('p').innerText = data.title;
            currentTask.dataset.category = data.category;
        } else {
            // Add new task
            const taskDiv = document.createElement('div');
            taskDiv.classList.add('task');
            taskDiv.draggable = true; // Make it draggable
            taskDiv.dataset.id = data.task._id; // Store the task ID
            taskDiv.dataset.category = data.task.category;
            taskDiv.dataset.status = data.task.status;
            taskDiv.innerHTML = `
                <span class="task-label">${data.task.category}</span>
                <p>${data.task.title}</p>
            `;
            addDragListeners(taskDiv); // Add drag-and-drop listeners
            document.querySelector(`[data-status="pending"]`).appendChild(taskDiv);
        }

        taskModal.classList.remove('show');
        await loadTasks(); // Reload tasks to ensure consistency and update progress
    } catch (error) {
        console.error('Error:', error.message);
        alert(`Failed to ${currentTask ? 'update' : 'add'} task. Please try again.`);
    }
});

// Fetch tasks from the backend
async function fetchTasks() {
    const response = await fetch('/api/tasks');
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return await response.json();
}



// Load tasks and set up drag-and-drop (Combined loading and rendering)
async function loadTasks() {
    try {
        const tasks = await fetchTasks();

        // Clear existing tasks
        document.querySelectorAll('.task').forEach(task => task.remove());

        // Render tasks
        tasks.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.classList.add('task');
            taskDiv.draggable = true; // Make it draggable
            taskDiv.dataset.id = task._id; // Store the task ID
            taskDiv.dataset.category = task.category;
            taskDiv.dataset.status = task.status;
            taskDiv.innerHTML = `
                <span class="task-label">${task.category}</span>
                <p>${task.title}</p>
            `;

            addDragListeners(taskDiv); // Add drag-and-drop listeners

            const column = document.querySelector(`[data-status="${task.status}"]`);
            if (column) column.appendChild(taskDiv);
        });

        updateOverallProgress(tasks);
        updateCategoryProgress(tasks);
    } catch (error) {
        console.error('Error loading tasks:', error.message);
        alert('Failed to load tasks. Please try again.');
    }
}

// Add drag-and-drop event listeners to a task element
function addDragListeners(taskDiv) {
    taskDiv.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', event.target.dataset.id);
        event.target.classList.add('dragging'); // Add a class for visual feedback
    });

    taskDiv.addEventListener('dragend', (event) => {
        event.target.classList.remove('dragging'); // Remove the class
    });
}

// Add drag-and-drop event listeners to the columns
document.querySelectorAll('.column').forEach(column => {
    column.addEventListener('dragover', (event) => {
        event.preventDefault(); // Allow dropping
    });

    column.addEventListener('drop', async (event) => {
        event.preventDefault();
        const taskId = event.dataTransfer.getData('text/plain');
        const newStatus = column.dataset.status;
    
        console.log("Dropped task ID:", taskId); // Log the task ID
        console.log("New status:", newStatus);   // Log the new status
    
        const taskElement = document.querySelector(`[data-id="${taskId}"]`);
    
        if (!taskElement) {
            console.error("Task element not found for ID:", taskId);
            alert("Failed to update task status. Task not found.");
            return; // Exit early if the task element is missing
        }
    
        if (!taskId || taskId.trim() === "" || !/^[0-9a-fA-F]{24}$/.test(taskId)) {
            console.error("Invalid task ID:", taskId);
            alert("Failed to update task status. Invalid task ID.");
            return; // Exit if the ID is invalid
        }
    
    
        if (taskElement.dataset.status !== newStatus) {
            // Store the original status for potential rollback
            const originalStatus = taskElement.dataset.status;
    
            // Update the task's status in the UI *first*
            taskElement.dataset.status = newStatus;
            column.appendChild(taskElement);
    
            // Update the task's status in the database
            try {
                const response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus }),
                });
    
                if (!response.ok) {
                    const errorData = await response.json(); // Try to get more error details
                    console.error("Server error:", errorData);
                    throw new Error(`Failed to update task status. Server responded with ${response.status}`);
                }
    
                console.log("Task status updated successfully!");
                await loadTasks(); // Reload to ensure consistency
    
            } catch (error) {
                console.error('Error updating task:', error.message);
                alert('Failed to update task status. Please try again.');
    
                // Revert the UI change if the update failed
                taskElement.dataset.status = originalStatus;
                document.querySelector(`[data-status="${originalStatus}"]`).appendChild(taskElement);
            }
        }
    });


// (Optional) Get category color -  You can use this if you want to style task labels
function getCategoryColor(category) {
    switch (category) {
        case 'UI Design':
            return '#007bff';
        case 'Illustration':
            return '#28a745';
        case 'Copywriting':
            return '#ffc107';
        default:
            return '#000'; // Default color
    }
}

// Authentication check (No changes, kept for completeness)
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

// Logout (No changes, kept for completeness)
function logout() {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" })
        .then(response => response.json())
        .then(data => {
            window.location.href = data.redirect; // Redirect to login
        })
        .catch(error => console.error("Logout failed:", error));
}});

if (window.location.pathname.endsWith(".html")) {
    window.history.replaceState(null, "", window.location.pathname.replace(".html", ""));
}

document.getElementById('toggle-progress-btn').addEventListener('click', function () {
        const progressContainer = document.getElementById('task-progress');
        progressContainer.classList.toggle('hidden');
    });

    document.getElementById('toggle-pomodoro-btn').addEventListener('click', function () {
        const pomodoroContainer = document.getElementById('pomodoro-container');
        pomodoroContainer.classList.toggle('hidden');
  });