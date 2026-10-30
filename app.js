/* ============================================================
   HOME DECOR PLANNER — app.js
   Demonstrates all 6 EXP-6 concepts:
     1. Functional Modularization ("One Job Each")
     2. Separation of Structure, State & UI
     3. Object Creation & Function Parameters
     4. State Management & Data Persistence
     5. Higher-Order Array Methods (filter, map, forEach)
     6. Event Handling
   ============================================================ */


/* ============================================================
   CONCEPT 2 — Separation of Structure, State & UI
   Central application state lives here; HTML is just a shell.
   ============================================================ */
let tasks  = loadTasks();   // array of task objects (persisted state)
let filter = "all";         // active filter: "all" | "pending" | "done"

// DOM references — gathered once, reused everywhere
const taskList      = document.getElementById("taskList");
const taskInput     = document.getElementById("taskInput");
const categorySelect= document.getElementById("categorySelect");
const openCountEl   = document.getElementById("openCount");
const doneCountEl   = document.getElementById("doneCount");
const emptyState    = document.getElementById("emptyState");
const addForm       = document.getElementById("addForm");
const clearDoneBtn  = document.getElementById("clearDoneBtn");
const filterTabs    = document.querySelectorAll(".tab");


/* ============================================================
   CONCEPT 3 — Object Creation & Function Parameters
   createTask() returns a standardised task object.
   ============================================================ */
function createTask(text, category) {
  return {
    id:       Date.now(),        // unique numeric id
    text:     text,              // decor idea description
    category: category,          // room/category label
    done:     false              // completion flag
  };
}


/* ============================================================
   CONCEPT 1 — Functional Modularization ("One Job Each")
   Each function below has exactly ONE responsibility.
   ============================================================ */

/** 1a. Add a new task to the tasks array */
function addTask(text, category) {
  const task = createTask(text, category);
  tasks.push(task);
  saveAndRender();
}

/** 1b. Toggle the done/pending status of a task by id */
function toggleTask(id) {
  /* CONCEPT 5 — map() transforms each item in the array */
  tasks = tasks.map(function (task) {
    return task.id === id ? { ...task, done: !task.done } : task;
  });
  saveAndRender();
}

/** 1c. Remove a single task from the array by id */
function deleteTask(id) {
  /* CONCEPT 5 — filter() keeps only tasks whose id doesn't match */
  tasks = tasks.filter(function (task) {
    return task.id !== id;
  });
  saveAndRender();
}

/** 1d. Remove all completed tasks at once */
function clearDone() {
  /* CONCEPT 5 — filter() keeps only tasks that are NOT done */
  tasks = tasks.filter(function (task) {
    return !task.done;
  });
  saveAndRender();
}

/** 1e. Return only the tasks visible under the current filter */
function getVisibleTasks() {
  /* CONCEPT 5 — filter() selects a subset based on a condition */
  return tasks.filter(function (task) {
    if (filter === "pending") return !task.done;
    if (filter === "done")    return  task.done;
    return true;                              // filter === "all"
  });
}

/** 1f. Count tasks that are still pending */
function countPending() {
  /* CONCEPT 5 — filter() counts uncompleted tasks */
  return tasks.filter(function (task) { return !task.done; }).length;
}

/** 1g. Count tasks that are done */
function countDone() {
  return tasks.filter(function (task) { return task.done; }).length;
}


/* ============================================================
   CONCEPT 4 — State Management & Data Persistence
   saveAndRender() is the single entry-point after every mutation.
   ============================================================ */

/** Save current state to localStorage, then refresh the UI */
function saveAndRender() {
  localStorage.setItem("homeDecorTasks", JSON.stringify(tasks)); // persist
  renderTasks();                                                  // redraw UI
}

/** Load tasks from localStorage (returns [] on first visit) */
function loadTasks() {
  const raw = localStorage.getItem("homeDecorTasks");
  return raw ? JSON.parse(raw) : [];
}


/* ============================================================
   CONCEPT 2 — UI Rendering (dedicated render function)
   renderTasks() is the ONLY function that touches the DOM list.
   ============================================================ */
function renderTasks() {
  // Clear existing list content
  taskList.innerHTML = "";

  const visible = getVisibleTasks();

  // Update stat counters
  openCountEl.textContent = countPending();
  doneCountEl.textContent = countDone();

  // Show/hide empty state message
  if (visible.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  /* CONCEPT 5 — forEach() builds a DOM element for each visible task */
  visible.forEach(function (task) {
    const li = buildTaskElement(task);
    taskList.appendChild(li);
  });
}

/** Build and return a single <li> card for a task object */
function buildTaskElement(task) {
  const li = document.createElement("li");
  li.className = "task-card" + (task.done ? " done" : "");
  li.dataset.cat = task.category;

  // Checkbox circle button
  const checkBtn = document.createElement("button");
  checkBtn.className = "task-check" + (task.done ? " checked" : "");
  checkBtn.title = task.done ? "Mark as pending" : "Mark as done";
  checkBtn.textContent = task.done ? "✓" : "";

  // Text body (category label + idea text)
  const body = document.createElement("div");
  body.className = "task-body";

  const catEl = document.createElement("div");
  catEl.className = "task-category";
  catEl.textContent = getCategoryIcon(task.category) + " " + task.category;

  const textEl = document.createElement("div");
  textEl.className = "task-text";
  textEl.textContent = task.text;

  body.appendChild(catEl);
  body.appendChild(textEl);

  // Action buttons
  const actions = document.createElement("div");
  actions.className = "task-actions";

  const delBtn = document.createElement("button");
  delBtn.className = "action-btn del-btn";
  delBtn.title = "Delete this idea";
  delBtn.textContent = "🗑️";

  actions.appendChild(delBtn);

  li.appendChild(checkBtn);
  li.appendChild(body);
  li.appendChild(actions);

  /* CONCEPT 6 — Event Handling: attach listeners to card buttons */
  checkBtn.addEventListener("click", function () { toggleTask(task.id); });
  delBtn.addEventListener("click",   function () { deleteTask(task.id); });

  return li;
}

/** Return the emoji icon for a given category string */
function getCategoryIcon(category) {
  const icons = {
    "Living Room": "🛋️",
    "Bedroom":     "🛏️",
    "Kitchen":     "🍳",
    "Bathroom":    "🚿",
    "Garden":      "🌿",
    "Lighting":    "💡",
    "Art & Walls": "🖼️"
  };
  return icons[category] || "🏠";
}


/* ============================================================
   CONCEPT 6 — Event Handling
   Listeners use function references (no invocation parentheses),
   so they fire only when the event occurs.
   ============================================================ */

/** Handle new idea form submission */
function handleSubmit(event) {
  event.preventDefault();                  // prevent page refresh
  const text     = taskInput.value.trim();
  const category = categorySelect.value;
  if (!text) return;                       // guard: ignore empty input
  addTask(text, category);
  taskInput.value = "";                    // clear the input field
  taskInput.focus();
}

/** Handle filter tab clicks — updates active filter & rerenders */
function handleFilterClick(event) {
  filter = event.target.dataset.filter;   // read data-filter attribute
  // Update active tab styling
  filterTabs.forEach(function (tab) {
    tab.classList.toggle("active", tab.dataset.filter === filter);
  });
  renderTasks();
}

// Attach event listeners (passing function references, not calls)
addForm.addEventListener("submit",    handleSubmit);
clearDoneBtn.addEventListener("click", clearDone);

filterTabs.forEach(function (tab) {
  tab.addEventListener("click", handleFilterClick);
});


/* ============================================================
   INITIALISE — render on page load with persisted data
   ============================================================ */
renderTasks();
