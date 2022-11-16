export async function getTodoList(owner) {
    let todoItems = [];
    let toStore = [];

    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i) == 'SAVEDOPTION') continue;
        let strItem = localStorage.getItem(localStorage.key(i));
        let item = JSON.parse(strItem);
        if (item.owner != owner) {
            toStore.push({ id: localStorage.key(i), item: strItem });
            continue;
        }
        let key = localStorage.key(i);
        todoItems[parseInt(key.slice(0, key.length - owner.length))] = item;
    }
    localStorage.clear();

    for (let obj of toStore) {
        localStorage.setItem(obj.id, obj.item);
    }

    let _todoItems = [];

    for (let index in todoItems) {
        if (todoItems[index] != undefined) {
            localStorage.setItem(index + owner, JSON.stringify(todoItems[index]));
            _todoItems.push(todoItems[index]);
        }
    }

    return _todoItems;
};

export async function createTodoItem({ owner, name }) {
    if (createTodoItem.owner == undefined) {
        let id = -1;

        for (let i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i) == 'SAVEDOPTION') continue;

            let key = localStorage.key(i);
            if (key.includes(owner)) {
                let _id = parseInt(key.slice(0, key.length - owner.length));
                id = Math.max(id, _id);
            }
        }

        id++;
        createTodoItem.owner = id;
    }

    let obj = {};
    obj['name'] = name;
    obj['done'] = false;
    obj['owner'] = owner;
    obj['id'] = createTodoItem.owner;

    localStorage.setItem(createTodoItem.owner + owner, JSON.stringify(obj));
    createTodoItem.owner++;

    return obj;
};

export function switchTodoItemDone({ element, todoItem }) {
    todoItem.done = !todoItem.done;
    let id = todoItem.id;
    let strItem = localStorage.getItem(id + todoItem.owner);
    let item = JSON.parse(strItem);
    item.done = !item.done;
    localStorage.setItem(id + todoItem.owner, JSON.stringify(item));
};

function deleteNote(id) {
    localStorage.removeItem(id);
}

export function deleteTodoItem({ element, todoItem }) {
    if (confirm('Вы уверены?')) {
        element.remove();
        deleteNote(todoItem.id + todoItem.owner);
    }
}
