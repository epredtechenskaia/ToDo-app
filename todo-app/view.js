function createAppTitle(title) {
    let appTitle = document.createElement('h2');
    appTitle.innerHTML = title;
    return appTitle;
};

function createTodoItemForm() {
    let form = document.createElement('form');
    let input = document.createElement('input');
    let buttonWrapper = document.createElement('div');
    let button = document.createElement('button');

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
};

function createTodoList() {
    const list = document.createElement('ul');
    list.classList.add('list-group');
    return list;
};

function createTodoItemElement(todoItem, { onDone, onDelete }) {

    const doneClass = 'list-group-item-success';

    let ownerID = todoItem.owner;

    let item = document.createElement('li');
    let buttonGroup = document.createElement('div');
    let doneButton = document.createElement('button');
    let deleteButton = document.createElement('button');

    item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

    if (todoItem.done) {
        item.classList.add(doneClass);
    }
    item.textContent = todoItem.name;

    buttonGroup.classList.add('btn-group', 'btn-group-sm');
    doneButton.classList.add('btn', 'btn-success');
    doneButton.textContent = 'Готово';
    deleteButton.classList.add('btn', 'btn-danger');
    deleteButton.textContent = 'Удалить';

    doneButton.addEventListener('click', () => {
        onDone({ todoItem, element: item });
        item.classList.toggle(doneClass, todoItem.done);
    });

    deleteButton.addEventListener('click', () => {
        onDelete({ todoItem, element: item });
    });

    buttonGroup.append(doneButton);
    buttonGroup.append(deleteButton);
    item.append(buttonGroup);

    return item;
};

async function createTodoApp(container, {
    title,
    owner,
    todoItemList = [],
    onCreateFormSubmit,
    onDoneClick,
    onDeleteClick,
}) {
    const todoAppTitle = createAppTitle(title);
    const todoItemForm = createTodoItemForm();
    const todoList = createTodoList();
    const handlers = { onDone: onDoneClick, onDelete: onDeleteClick };


    container.append(todoAppTitle);
    container.append(todoItemForm.form);
    container.append(todoList);

    todoItemList.forEach(todoItem => {
        const todoItemElement = createTodoItemElement(todoItem, handlers);
        todoList.append(todoItemElement);
    })

    todoItemForm.form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!todoItemForm.input.value) {
            return;
        }

        const todoItem = await onCreateFormSubmit({
            owner,
            name: todoItemForm.input.value.trim(),
        });

        const todoItemElement = createTodoItemElement(todoItem, handlers);

        todoList.append(todoItemElement);
        todoItemForm.input.value = '';
    });
};

async function initApp(importName, owner) {
    const module = await
    import ('./' + importName + '.js');
    let todoItemList = await module.getTodoList(owner);
    createTodoApp(document.getElementById('todo-app'), { title: 'Мои дела', owner, todoItemList, onCreateFormSubmit: module.createTodoItem, onDoneClick: module.switchTodoItemDone, onDeleteClick: module.deleteTodoItem, });
}

export async function chooseStorageButtons(owner) {
    const serverButton = document.querySelector('#optionServer');
    const localButton = document.querySelector('#optionLocal');
    const serverLabel = document.querySelector('.label1');
    const localLabel = document.querySelector('.label2');

    if (localStorage.getItem('SAVEDOPTION') != null) {
        initApp(localStorage.getItem('SAVEDOPTION'), owner);
        if (localStorage.getItem('SAVEDOPTION') === 'api') {
            localButton.cheked = false;
            localLabel.classList.toggle('active');
            serverButton.cheked = true;
            serverLabel.classList.toggle('active');
        }
    } else {
        initApp('local', owner);
    }

    serverButton.addEventListener('input', async() => {
        localStorage.setItem('SAVEDOPTION', 'local');
        location.reload();

    });

    localButton.addEventListener('input', async() => {
        localStorage.setItem('SAVEDOPTION', 'api');
        location.reload();

    });
}
