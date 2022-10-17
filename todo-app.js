(function() {

    let listName = '';

    //создаем и возвращаем заголовок приложения
    function createAppTitle(title) {
        let appTitle = document.createElement('h2');
        appTitle.innerHTML = title;
        return appTitle;
    }

    //создаем и возвращаем форму для создания дела
    function createTodoItemForm() {
        let form = document.createElement('form');
        let input = document.createElement('input');
        let buttonWrapper = document.createElement('div');
        let button = document.createElement('button');
        button.disabled = true;
        input.addEventListener('input', makeButtonDisabled);


        form.classList.add('input-group', 'mb-3');
        input.classList.add('form-control');
        input.placeholder = 'Введите название нового дела';
        buttonWrapper.classList.add('input-group-append');
        button.classList.add('btn', 'btn-primary');
        button.textContent = 'Добавить дело';

        buttonWrapper.append(button);
        form.append(input);
        form.append(buttonWrapper);

        return {
            form,
            input,
            button,
        }
    }

    function makeButtonDisabled() {
        let form = document.querySelector('.input-group')
        let button = document.querySelector('.btn-primary');
        let input = document.querySelector('.form-control');
        if (!input.value) {
            button.disabled = true;
        } else {
            button.disabled = false;
        }

        form.addEventListener('submit', makeButtonDisabled);

        return {
            form,
            input,
            button,
        }
    }

    //создаем и возвращаем список элементов
    function createTodoList() {
        let list = document.createElement('ul');
        list.classList.add('list-group');
        return list;
    }

    function createTodoItem(name, filer) {
        if (createTodoItem.countID == undefined)
            createTodoItem.countID = 0;

        let item = document.createElement('li');
        //кнопки помещаем в элемент, который красиво покажет их одной группе
        let buttonGroup = document.createElement('div');
        let doneButton = document.createElement('button');
        let deleteButton = document.createElement('button');

        //устанавливаем стили для элемента списка, а также для размещения кнопок
        // в его правой части с помощью flex
        item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        item.textContent = name;
        item.id = createTodoItem.countID;
        addNote(createTodoItem.countID, name, filer);
        createTodoItem.countID++;

        buttonGroup.classList.add('btn-group', 'btn-group-sm');
        doneButton.classList.add('btn', 'btn-success');
        doneButton.textContent = 'Готово';
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.textContent = 'Удалить';

        //вкладываем кнопки в отдельный элемент, чтобы они объединились в один блок
        buttonGroup.append(doneButton);
        buttonGroup.append(deleteButton);
        item.append(buttonGroup);

        //приложению нужен доступ к самому элементу и кнопкам, чтобы обрабатывать события нажатия
        return {
            item,
            doneButton,
            deleteButton,
        }
    }

    function addButtonsActionsAndAppend(todoItem, todoList) {
        todoItem.doneButton.addEventListener('click', function() {
            todoItem.item.classList.toggle('list-group-item-success');
            updateNote(todoItem.item.id);
        });
        todoItem.deleteButton.addEventListener('click', function() {
            if (confirm('Вы уверены?')) {
                todoItem.item.remove();
                deleteNote(todoItem.item.id);
            }
        });
        //создаем и добавляем в список новое дело с названием из поля для ввода
        todoList.append(todoItem.item);

    };

    function appendItemToList(item, todoList) {
        let preloadItem = createTodoItem(item.name, item.list);
        if (item.done == true) {
            updateNote(preloadItem.item.id);
            preloadItem.item.classList.toggle('list-group-item-success');
        }
        if (item.list != undefined && item.list != listName) return;
        addButtonsActionsAndAppend(preloadItem, todoList);
    }

    function predefinedTodoItems(todoItems, todoList) {
        for (item of todoItems) {
            if (item == undefined || item.name == undefined || item.name == '') continue;
            appendItemToList(item, todoList);
        }
    }

    function initLocalStorage() {
        if (localStorage.getItem(listName) != null) return false;
        localStorage.setItem(listName, 'INIT');
        return true;
    }

    function restoreLocalStorage(todoList) {
        let todoItems = [];
        let initialised = [];
        for (let i = 0; i < localStorage.length; i++) {
            let strItem = localStorage.getItem(localStorage.key(i));
            if (strItem == 'INIT') {
                initialised.push(localStorage.key(i));
                continue;
            }
            let item = JSON.parse(strItem);
            todoItems[localStorage.key(i)] = item;
        }
        localStorage.clear();
        for (init of initialised) {
            localStorage.setItem(init, 'INIT');
        }
        predefinedTodoItems(todoItems, todoList);
    };

    function deleteNote(id) {
        localStorage.removeItem(id);
    }

    function addNote(id, name, list) {
        let obj = {};
        obj['name'] = name;
        obj['done'] = false;
        obj['list'] = listName;
        if (list != undefined) obj.list = list;
        localStorage.setItem(id, JSON.stringify(obj));
    }

    function updateNote(id) {
        let strItem = localStorage.getItem(id);
        let item = JSON.parse(strItem);
        item.done = !item.done;
        localStorage.setItem(id, JSON.stringify(item));
    }

    function createTodoApp(
        container,
        title = 'Список дел',
        nameList,
        todoItems
    ) {
        let todoAppTitle = createAppTitle(title);
        let todoItemForm = createTodoItemForm();
        let todoList = createTodoList();

        listName = nameList;

        container.append(todoAppTitle);
        container.append(todoItemForm.form);
        container.append(todoList);

        restoreLocalStorage(todoList);
        if (initLocalStorage() == true && todoItems != undefined) {
            predefinedTodoItems(todoItems, todoList);
        }

        //браузер создает событие submit на форме по нажатию на enter или на кнопку создания дела
        todoItemForm.form.addEventListener('submit', function(e) {
            //эта строчка необходима, чтобы предотвратить стандартное действие браузера
            // в данном случае мы не хотим, чтобы страница перезагружалась при отправке формы
            e.preventDefault();


            //игнорируем создание элемента, если пользователь ничего не ввел в поле
            if (!todoItemForm.input.value) {
                return;
            }

            let todoItem = createTodoItem(todoItemForm.input.value);

            //добавляем обработчики на кнопки
            addButtonsActionsAndAppend(todoItem, todoList);
            //обнуляем значение в поле, чтобы не пришлось стирать его вручную
            todoItemForm.input.value = '';
        });
    }

    window.createTodoApp = createTodoApp;

})();
