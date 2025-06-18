document.addEventListener('DOMContentLoaded', function() {
    // Элементы интерфейса
    const instructionContainer = document.getElementById('instruction-container');
    const authContainer = document.getElementById('auth-container');
    const mainContainer = document.getElementById('main-container');
    const startBtn = document.getElementById('start-btn');
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const showLogin = document.getElementById('show-login');
    const showRegister = document.getElementById('show-register');
    const registerBtn = document.getElementById('register-btn');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userNameDisplay = document.getElementById('user-name');
    const classSelect = document.getElementById('class-select');
    const addStudentBtn = document.getElementById('add-student-btn');
    const studentForm = document.getElementById('student-form');
    const saveStudentBtn = document.getElementById('save-student-btn');
    const cancelStudentBtn = document.getElementById('cancel-student-btn');
    const addSubjectBtn = document.getElementById('add-subject-btn');
    const removeSubjectBtn = document.getElementById('remove-subject-btn');
    const gradesTable = document.getElementById('grades-table');
    
    // Данные приложения
    let teachers = JSON.parse(localStorage.getItem('teachers')) || [];
    let currentTeacher = null;
    let schoolData = JSON.parse(localStorage.getItem('schoolData')) || {
        classes: {
            '2': { students: [], subjects: ['Математика', 'Русский язык', 'Литература'] },
            '3': { students: [], subjects: ['Математика', 'Русский язык', 'Литература'] },
            '4': { students: [], subjects: ['Математика', 'Русский язык', 'Литература'] },
            '5': { students: [], subjects: ['Математика', 'Русский язык', 'Литература', 'История'] },
            '6': { students: [], subjects: ['Математика', 'Русский язык', 'Литература', 'История', 'Биология'] },
            '7': { students: [], subjects: ['Математика', 'Русский язык', 'Литература', 'История', 'Биология', 'Физика'] },
            '8': { students: [], subjects: ['Математика', 'Русский язык', 'Литература', 'История', 'Биология', 'Физика', 'Химия'] }
        }
    };
    
    // Инициализация приложения
    init();
    
    function init() {
        // Проверяем, авторизован ли пользователь
        const loggedInTeacher = localStorage.getItem('loggedInTeacher');
        if (loggedInTeacher) {
            currentTeacher = JSON.parse(loggedInTeacher);
            showMainInterface();
            return;
        }
        
        // Показываем инструкцию по умолчанию
        instructionContainer.classList.remove('hidden');
        authContainer.classList.add('hidden');
        mainContainer.classList.add('hidden');
    }
    
    // Обработчики событий
    startBtn.addEventListener('click', function() {
        instructionContainer.classList.add('hidden');
        authContainer.classList.remove('hidden');
    });
    
    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });
    
    showRegister.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });
    
    registerBtn.addEventListener('click', registerTeacher);
    loginBtn.addEventListener('click', loginTeacher);
    logoutBtn.addEventListener('click', logout);
    classSelect.addEventListener('change', renderClassData);
    addStudentBtn.addEventListener('click', showStudentForm);
    saveStudentBtn.addEventListener('click', saveStudent);
    cancelStudentBtn.addEventListener('click', hideStudentForm);
    addSubjectBtn.addEventListener('click', addSubject);
    removeSubjectBtn.addEventListener('click', removeSubject);
    
    // Функции авторизации
    function registerTeacher() {
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value.trim();
        
        if (!name || !email || !password) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        // Проверяем, есть ли уже учитель с таким email
        if (teachers.some(teacher => teacher.email === email)) {
            alert('Учитель с таким email уже зарегистрирован');
            return;
        }
        
        // Добавляем нового учителя
        const newTeacher = { name, email, password };
        teachers.push(newTeacher);
        localStorage.setItem('teachers', JSON.stringify(teachers));
        
        // Автоматически входим
        currentTeacher = newTeacher;
        localStorage.setItem('loggedInTeacher', JSON.stringify(currentTeacher));
        
        alert('Регистрация прошла успешно!');
        showMainInterface();
    }
    
    function loginTeacher() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        
        if (!email || !password) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        // Ищем учителя
        const teacher = teachers.find(t => t.email === email && t.password === password);
        
        if (!teacher) {
            alert('Неверный email или пароль');
            return;
        }
        
        currentTeacher = teacher;
        localStorage.setItem('loggedInTeacher', JSON.stringify(currentTeacher));
        showMainInterface();
    }
    
    function logout() {
        currentTeacher = null;
        localStorage.removeItem('loggedInTeacher');
        authContainer.classList.add('hidden');
        mainContainer.classList.add('hidden');
        instructionContainer.classList.remove('hidden');
        
        // Очищаем поля ввода
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('reg-name').value = '';
        document.getElementById('reg-email').value = '';
        document.getElementById('reg-password').value = '';
    }
    
    function showMainInterface() {
        authContainer.classList.add('hidden');
        mainContainer.classList.remove('hidden');
        userNameDisplay.textContent = currentTeacher.name;
        renderClassData();
    }
    
    // Функции работы с классами и учениками
    function renderClassData() {
        const selectedClass = classSelect.value;
        const classData = schoolData.classes[selectedClass];
        
        // Очищаем таблицу
        gradesTable.innerHTML = '';
        
        // Создаем заголовок таблицы
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>Ученик</th>';
        
        // Добавляем заголовки для предметов
        classData.subjects.forEach(subject => {
            headerRow.innerHTML += `<th>${subject}</th>`;
        });
        
        // Добавляем столбец для среднего балла и статуса
        headerRow.innerHTML += '<th>Средний балл</th><th>Статус</th><th>Действия</th>';
        thead.appendChild(headerRow);
        gradesTable.appendChild(thead);
        
        // Создаем тело таблицы
        const tbody = document.createElement('tbody');
        
        // Добавляем строки для каждого ученика
        classData.students.forEach((student, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${student.name}</td>`;
            
            // Добавляем ячейки для оценок по каждому предмету
            classData.subjects.forEach(subject => {
                const grade = student.grades && student.grades[subject] ? student.grades[subject] : '';
                row.innerHTML += `<td contenteditable="true" data-subject="${subject}" onblur="updateGrade(${index}, '${subject}', this)">${grade}</td>`;
            });
            
            // Рассчитываем средний балл
            const averageGrade = calculateAverageGrade(student.grades, classData.subjects);
            row.innerHTML += `<td>${averageGrade.toFixed(2)}</td>`;
            
            // Определяем статус
            const status = averageGrade >= 3.5 ? 'Успевающий' : 'Неуспевающий';
            const statusClass = averageGrade >= 3.5 ? 'passing' : 'failing';
            row.innerHTML += `<td class="${statusClass}">${status}</td>`;
            
            // Добавляем кнопку удаления
            row.innerHTML += `<td><button onclick="deleteStudent(${index})" class="btn btn-small btn-cancel">Удалить</button></td>`;
            
            tbody.appendChild(row);
        });
        
        gradesTable.appendChild(tbody);
    }
    
    function showStudentForm() {
        studentForm.classList.remove('hidden');
        document.getElementById('student-name').value = '';
    }
    
    function hideStudentForm() {
        studentForm.classList.add('hidden');
    }
    
    function saveStudent() {
        const studentName = document.getElementById('student-name').value.trim();
        if (!studentName) {
            alert('Пожалуйста, введите ФИО ученика');
            return;
        }
        
        const selectedClass = classSelect.value;
        const newStudent = {
            name: studentName,
            grades: {}
        };
        
        schoolData.classes[selectedClass].students.push(newStudent);
        saveSchoolData();
        hideStudentForm();
        renderClassData();
    }
    
    function deleteStudent(index) {
        if (confirm('Вы уверены, что хотите удалить этого ученика?')) {
            const selectedClass = classSelect.value;
            schoolData.classes[selectedClass].students.splice(index, 1);
            saveSchoolData();
            renderClassData();
        }
    }
    
    // Функции работы с предметами
    function addSubject() {
        const subjectName = prompt('Введите название нового предмета:');
        if (!subjectName) return;
        
        const selectedClass = classSelect.value;
        
        if (schoolData.classes[selectedClass].subjects.includes(subjectName)) {
            alert('Этот предмет уже есть в списке');
            return;
        }
        
        schoolData.classes[selectedClass].subjects.push(subjectName);
        
        // Добавляем поле для оценок всем ученикам
        schoolData.classes[selectedClass].students.forEach(student => {
            if (!student.grades) student.grades = {};
            student.grades[subjectName] = '';
        });
        
        saveSchoolData();
        renderClassData();
    }
    
    function removeSubject() {
        const selectedClass = classSelect.value;
        const subjects = schoolData.classes[selectedClass].subjects;
        
        if (subjects.length === 0) {
            alert('Нет предметов для удаления');
            return;
        }
        
        const subjectToRemove = prompt(`Введите название предмета для удаления (Доступные: ${subjects.join(', ')}):`);
        if (!subjectToRemove) return;
        
        if (!subjects.includes(subjectToRemove)) {
            alert('Такого предмета нет в списке');
            return;
        }
        
        if (confirm(`Вы уверены, что хотите удалить предмет "${subjectToRemove}"? Все оценки по этому предмету будут потеряны.`)) {
            // Удаляем предмет из списка
            const index = subjects.indexOf(subjectToRemove);
            subjects.splice(index, 1);
            
            // Удаляем оценки по этому предмету у всех учеников
            schoolData.classes[selectedClass].students.forEach(student => {
                if (student.grades && student.grades[subjectToRemove]) {
                    delete student.grades[subjectToRemove];
                }
            });
            
            saveSchoolData();
            renderClassData();
        }
    }
    
    // Вспомогательные функции
    function calculateAverageGrade(grades, subjects) {
        if (!grades) return 0;
        
        let sum = 0;
        let count = 0;
        
        subjects.forEach(subject => {
            if (grades[subject] && !isNaN(grades[subject])) {
                sum += parseFloat(grades[subject]);
                count++;
            }
        });
        
        return count > 0 ? sum / count : 0;
    }
    
    function saveSchoolData() {
        localStorage.setItem('schoolData', JSON.stringify(schoolData));
    }
    
    // Глобальные функции для использования в inline-обработчиках
    window.updateGrade = function(studentIndex, subject, element) {
        const selectedClass = classSelect.value;
        const grade = element.textContent.trim();
        
        // Проверяем, что оценка валидна (число от 1 до 5 или пустая строка)
        if (grade && (isNaN(grade) || grade < 1 || grade > 5)) {
            alert('Оценка должна быть числом от 1 до 5');
            element.textContent = '';
            return;
        }
        
        if (!schoolData.classes[selectedClass].students[studentIndex].grades) {
            schoolData.classes[selectedClass].students[studentIndex].grades = {};
        }
        
        schoolData.classes[selectedClass].students[studentIndex].grades[subject] = grade || '';
        saveSchoolData();
        
        // Обновляем средний балл и статус
        const row = element.parentNode;
        const averageCell = row.cells[row.cells.length - 3]; // Предпоследняя ячейка
        const statusCell = row.cells[row.cells.length - 2]; // Последняя ячейка
        
        const student = schoolData.classes[selectedClass].students[studentIndex];
        const averageGrade = calculateAverageGrade(student.grades, schoolData.classes[selectedClass].subjects);
        
        averageCell.textContent = averageGrade.toFixed(2);
        
        const status = averageGrade >= 3.5 ? 'Успевающий' : 'Неуспевающий';
        statusCell.textContent = status;
        statusCell.className = averageGrade >= 3.5 ? 'passing' : 'failing';
    };
    
    window.deleteStudent = deleteStudent;
});

document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('add-btn');
    const fileInput = document.getElementById('file-input');
    const gallery = document.getElementById('gallery');

    // Функция для добавления изображения в галерею
    addButton.addEventListener('click', () => {
        fileInput.click();  // Открываем диалог выбора файлов
    });

    // Обработчик события выбора файла
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0]; // Получаем выбранный файл

        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();

            reader.onload = function(e) {
                const imageUrl = e.target.result;

                // Создаем новый элемент галереи
                const galleryItem = document.createElement('div');
                galleryItem.classList.add('gallery-item');
                
                // Создаем тег <img> и кнопку удаления
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = 'Gallery Image';

                const deleteButton = document.createElement('button');
                deleteButton.classList.add('delete-btn');
                deleteButton.textContent = 'X';
                
                // Слушатель на кнопку удаления
                deleteButton.addEventListener('click', () => {
                    galleryItem.remove();
                });

                // Добавляем изображение и кнопку удаления в элемент галереи
                galleryItem.appendChild(img);
                galleryItem.appendChild(deleteButton);

                // Добавляем новый элемент в галерею
                gallery.appendChild(galleryItem);
            };

            reader.readAsDataURL(file);  // Преобразуем изображение в Data URL
        }
    });
});