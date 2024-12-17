// script.js
document.getElementById('add-button').addEventListener('click', function() {
    const taskText = document.getElementById('todo-input').value;
    
    if (taskText === '') {
        alert('何か書いてください！');
        return;
    }

    const listItem = document.createElement('li');
    const taskSpan = document.createElement('span');
    taskSpan.textContent = taskText;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-button');

    listItem.appendChild(taskSpan);
    listItem.appendChild(deleteButton);
    document.getElementById('todo-list').appendChild(listItem);

    document.getElementById('todo-input').value = '';

    deleteButton.addEventListener('click', function() {
        listItem.remove();
    });
});
