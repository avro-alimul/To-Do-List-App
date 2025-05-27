document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language');
    const titleElement = document.getElementById('title');
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const exportBtn = document.getElementById('exportBtn');
    const importFile = document.getElementById('importFile');
    const importButtonLabel = document.querySelector('.import-button');

    let tasks = [];

    const languages = {
        en: {
            appTitle: "Multilingual To-Do List",
            title: "To-Do List",
            placeholder: "Enter your task",
            add: "Add",
            export: "Export",
            import: "Import",
            invalidJson: "Invalid JSON file."
        },
        bn: {
            appTitle: "বহুভাষিক কাজের তালিকা",
            title: "কাজের তালিকা",
            placeholder: "আপনার কাজ লিখুন",
            add: "যোগ করুন",
            export: "রপ্তানি করুন",
            import: "আমদানি করুন",
            invalidJson: "অবৈধ JSON ফাইল।"
        }
    };

    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('language') || 'en';
    languageSelect.value = savedLanguage;

    const updateUI = (lang) => {
        const texts = languages[lang];
        document.getElementById('appTitle').textContent = texts.appTitle;
        titleElement.textContent = texts.title;
        taskInput.placeholder = texts.placeholder;
        addBtn.textContent = texts.add;
        exportBtn.textContent = texts.export;
        importButtonLabel.textContent = texts.import;
    };

    // Save language preference and update UI on change
    languageSelect.addEventListener('change', (event) => {
        const selectedLang = event.target.value;
        localStorage.setItem('language', selectedLang);
        updateUI(selectedLang);
        renderTasks(); // Re-render tasks to update potentially language-specific content if any (though not in this basic version)
    });

    // Initial UI update based on loaded language
    updateUI(savedLanguage);

    // Load tasks from localStorage
    const loadTasks = () => {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
    };

    // Save tasks to localStorage
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Render tasks to the UI
    const renderTasks = () => {
        taskList.innerHTML = ''; // Clear current list
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.textContent = task.text;
            if (task.completed) {
                li.classList.add('completed');
            }
            li.addEventListener('click', () => {
                tasks[index].completed = !tasks[index].completed;
                saveAndRender();
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'X'; // Could be internationalized if needed
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent li click event
                tasks.splice(index, 1);
                saveAndRender();
            });

            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
    };

    // Save tasks and re-render
    const saveAndRender = () => {
        saveTasks();
        renderTasks();
    };

    // Add new task
    addBtn.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            tasks.push({ text: taskText, completed: false });
            taskInput.value = '';
            saveAndRender();
        }
    });

    // Allow adding task with Enter key
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addBtn.click();
        }
    });

    // Export tasks
    exportBtn.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(tasks)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tasks.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Import tasks
    importFile.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    // Basic validation: check if each item has 'text' and 'completed' properties
                    const isValid = importedData.every(task => 
                        typeof task.text === 'string' && typeof task.completed === 'boolean'
                    );

                    if (isValid) {
                         // Optional: Ask user if they want to merge or replace
                         // For simplicity, we'll replace for now.
                        tasks = importedData;
                        saveAndRender();
                    } else {
                        alert(languages[localStorage.getItem('language') || 'en'].invalidJson);
                    }
                } else {
                    alert(languages[localStorage.getItem('language') || 'en'].invalidJson);
                }
            } catch (error) {
                alert(languages[localStorage.getItem('language') || 'en'].invalidJson);
            }
            // Clear the file input so the same file can be imported again if needed
            importFile.value = '';
        };
        reader.readAsText(file);
    });

    // Initial load and render
    loadTasks();
    renderTasks();
}); 