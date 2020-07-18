var form = document.querySelector('#addForm');
var itemsList = document.querySelector('#items');
var filter = document.querySelector('#filter');
var itemsFinishedList = document.querySelector('#items-finished');

var toDolist = {
    unfinishedList: [],
    finishedList: []
};

if(localStorage.getItem("toDolist")){
    var toDolist = JSON.parse(localStorage.getItem("toDolist"));

    for (let i = 0; i < toDolist.unfinishedList.length; i++) {
        createUnfinishedItem(toDolist.unfinishedList[i])
    }
    for (let i = 0; i < toDolist.finishedList.length; i++) {
        createFinishedItem(toDolist.finishedList[i])
    }
}

// Добавление новой задачи, прослушка события
form.addEventListener('submit', addItem);

// Фильтрация списка дел - прослушка ввода
filter.addEventListener('keyup', filterItems);

// Удаланние элемента - прослушка клика
itemsList.addEventListener("click", removeItem);
itemsFinishedList.addEventListener("click", removeItem);

//Редактирование задачи в элементе - прослушка клика
itemsList.addEventListener("click", editItem);

// Пепремещение элемента в список завершенных дел - прослушка клика
itemsList.addEventListener("click", moveItem);

// Возвращение элемента в список дел - прослушка клика
itemsFinishedList.addEventListener("click", returnItem);

// Добавление новой задачи - функция
function addItem(event) {
    // Отменяем отправку формы
    event.preventDefault();
   
    // Находим инпут с текстом для новой задачи
    var newItemInput = document.querySelector('#newItemText');
    // Получаем текст их инпута
    var newItemText = newItemInput.value;

    // Очищаем поле добавления новой задачи
    newItemInput.value = "";
    
    // Создание элемента списка с задачей
    createUnfinishedItem(newItemText)
    
    // Добавляем задачу в LocalStorage
    createObjToDolist(newItemText, "create");
}

// Фильтрация списка дел - функция
function filterItems(event) {
    //Получаем фразу для поска и переводим ее в нижний регистр
    var searchedText = event.target.value.toLowerCase();

    // 1.Получаем список всех задач
     var items = itemsList.querySelectorAll('li')

    // 2.Перебираем циклом все теги li  с задачами 
    items.forEach(function(item) {
        // Получаем текст задачи из списака и передодим его в нижний регистр
        // var itemText = item.firstChild.textContent.toLowerCase();
        var itemText = item.childNodes[2].textContent.toLowerCase();
        // var itemText = item.children[0].nextSibling.textContent.toLowerCase();

        // Проверяем вхождение искомой подстроки в текст задачи
        var result = itemText.indexOf(searchedText);
        if(result != -1) {
            // Если вхождение есть - показываем элемент с задачей
            item.style.display = 'block';
        } else {
            // Если вхождение нет - скрываем элемент с задачей
            item.style.display = 'none';
        }
    });
}

// Редактирование задачи - функция
function editItem(){

    if(event.target.hasAttribute('data-action') && event.target.getAttribute('data-action') == 'edit'){
        var currentItem = event.target.closest('.list-group-item');
        var deleteBtn = currentItem.querySelector('button[data-action="delete"]');
        var tack = deleteBtn.previousSibling;
        var editInput = currentItem.querySelector('input[type="text"]');
        var editBtn = currentItem.querySelector('button[data-action="edit"]');

        var containsClass = currentItem.classList.contains('editMode');

        if (containsClass) {
            createObjToDolist(tack.textContent, "edit", null, editInput.value); 
            
            tack.textContent = editInput.value;
            currentItem.style = "font-size: 1rem";
            editBtn.innerText = 'Редактировать';
            
        } else {
            editInput.value = tack.textContent.trim();
            currentItem.style = "font-size: 0";
            editBtn.innerText = 'Сохранить';
        }

        currentItem.classList.toggle('editMode');
    }     
}

// Удаление элемента - функция
function removeItem(event) {
    if(event.target.getAttribute('data-action') == 'delete' && event.target.hasAttribute('data-action')){
        if(confirm('Вы уверены, что хотите удалить задачу?')){
            var listID = event.target.closest('.list-group').getAttribute('id');

            if(listID === "items-finished"){
                createObjToDolist(event.target.previousSibling.textContent, "remove", "finished");  
            }else if(listID === "items"){
                createObjToDolist(event.target.previousSibling, "remove", "unfinished");
            }
            
            event.target.parentNode.remove();
        }
    } 
}

//Перемещение задачи в список заверщенных дел - функция
function moveItem(event) {
    if(event.target.getAttribute('class') == 'far fa-square') {
        var listItem = event.target.closest('.list-group-item');
        itemsFinishedList.appendChild(listItem);
        event.target.className = "far fa-check-square";

        var editInput = listItem.querySelector('input[type="text"]');
        var textNode = editInput.nextSibling;
        var newElement = document.createElement('del');
        newElement.appendChild(textNode); 

        editInput.insertAdjacentElement('afterend', newElement);
        newElement.style.color = "lightgray";

        createObjToDolist(textNode.textContent, "move");
    }
}

//Возврат задачи обратно в список дел - функция
function returnItem(event) {
    if(event.target.getAttribute('class') == 'far fa-check-square') {
        var listItem = event.target.closest('.list-group-item');
        itemsList.appendChild(listItem);
        event.target.className = "far fa-square";

        var editInput = listItem.querySelector('input[type="text"]');  
        var textNode = editInput.nextElementSibling.textContent;
        editInput.insertAdjacentText('afterend', textNode);

        editInput.nextElementSibling.remove();

        createObjToDolist(textNode, "return")
    }
}

//Формирование объекта с данными - функция
function createObjToDolist(taskValue, action, nameList, editedTaskValue){
    var indexFinItem = toDolist.finishedList.indexOf(taskValue);
    var indexUnfinItem = toDolist.unfinishedList.indexOf(taskValue);

    if(action === "move"){
        toDolist.finishedList.unshift(taskValue)
        toDolist.unfinishedList.splice(indexUnfinItem , 1);

    } else if(action === "return"){
        toDolist.unfinishedList.unshift(taskValue);
        toDolist.finishedList.splice(indexFinItem , 1);

    } else if(action === "remove"){

        if(nameList === "finished"){
            toDolist.finishedList.splice(indexFinItem , 1);
        } else if(nameList === "unfinished"){
            toDolist.unfinishedList.splice(indexUnfinItem , 1);
        }

    } else if(action === "create"){
        toDolist.unfinishedList.push(taskValue)
    } else if(action === "edit") {
        indexUnfinItem = toDolist.unfinishedList.indexOf(taskValue);
        toDolist.unfinishedList.splice(indexUnfinItem , 1, editedTaskValue);
    }

    saveToLocalStorage(toDolist);
}

// Сохранение обьекта с данными в LocalStorage - функция 
function saveToLocalStorage(obj) {
    localStorage.setItem("toDolist", JSON.stringify(obj));
}

// Создание элемента для списка невыполненых задач - функция
function createUnfinishedItem(taskValue) {
    // Создаем виртуальный элемент для новой задачи
    var newListItem = document.createElement('li');
    newListItem.className = 'list-group-item';
 
    // Создаем чекбокс в новый элемент
    var checkboxBtn = document.createElement('button');
    checkboxBtn.innerHTML = '<i class="far fa-square"></i>';
    checkboxBtn.className = 'btn btn-link btn-sm';
    checkboxBtn.setAttribute('type', 'button');
    checkboxBtn.dataset.action = 'move';
 
    // Создаем текст задачи в новый элемент
    var newTask = document.createTextNode(taskValue);

    // Создаем поле для редактирования задачи
    var editInput = document.createElement('input');
    editInput.className = 'form-control col-md-6';
    editInput.setAttribute('type', 'text');
 
    // Создаем кнопку "Редактировать"
    var editBtn = document.createElement('button');
    editBtn.innerText = 'Редактировать';
    editBtn.className = 'btn btn-light btn-sm float-right';
    editBtn.dataset.action = 'edit';
 
    // Создаем кнопку "Удалить"
    var deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Удалить';
    deleteBtn.className = 'btn btn-light btn-sm float-right';
    deleteBtn.setAttribute('type', 'button');
    deleteBtn.dataset.action = 'delete';
 
    // Добавляем все созданные элементы в тег li
    newListItem.append(checkboxBtn);
    newListItem.append(editInput);
    newListItem.append(newTask);
    newListItem.append(deleteBtn);
    newListItem.append(editBtn);
 
     // Добавляем новую задачу в список всех задач
    itemsList.prepend(newListItem);         
}

// Создание элемента для списка завершенных задач - функция
function createFinishedItem(taskValue) {

    // Создаем виртуальный элемент для новыой задачи
    var newListItem = document.createElement('li');
    newListItem.className = 'list-group-item';
 
    // Создаем чекбокс в новый элемент
    var checkboxBtn = document.createElement('button');
    checkboxBtn.innerHTML = '<i class="far fa-check-square"></i>';
    checkboxBtn.className = 'btn btn-link btn-sm';
    checkboxBtn.setAttribute('type', 'button');
    checkboxBtn.dataset.action = 'move';

    // Создаем поле для редактирования задачи
    var editInput = document.createElement('input');
    editInput.className = 'form-control col-md-6';
    editInput.setAttribute('type', 'text');

    // Создаем тег del для выполненой задачи
    var newElement = document.createElement('del');
    newElement.textContent = taskValue; 
    newElement.style.color = "lightgray";
 
    // Создаем кнопку "Редактировать"
    var editBtn = document.createElement('button');
    editBtn.innerText = 'Редактировать';
    editBtn.className = 'btn btn-light btn-sm float-right';
    editBtn.dataset.action = 'edit';
 
    // Создаем кнопку "Удалить"
    var deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Удалить';
    deleteBtn.className = 'btn btn-light btn-sm float-right';
    deleteBtn.setAttribute('type', 'button');
    deleteBtn.dataset.action = 'delete';
 
    // Добавляем все созданные элементы в тег li
    newListItem.append(checkboxBtn);
    newListItem.append(editInput);
    newListItem.append(newElement);
    newListItem.append(deleteBtn);
    newListItem.append(editBtn);
 
     // Добавляем новую задачу в список всех задач
    itemsFinishedList.prepend(newListItem);  
}

// localStorage.clear("toDolist");