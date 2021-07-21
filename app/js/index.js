const urlAPI = "http://localhost:3000";
const categoryList = [];
const expenseList = [];


/*
    Função que valida dados do usuário antes da chamada da API
*/
function validUser(name, email, phone, password, confirmPassword, errorLog) {
    let valid = true;

    if (name == '') {
        errorLog.push("Name cannot be empty");
        valid = false;
    }

    if (email == '') {
        errorLog.push("Email cannot be empty");
        valid = false;
    }

    if (phone == '') {
        errorLog.push("Phone cannot be empty");
        valid = false;
    }

    if (password == '' || confirmPassword == '') {
        errorLog.push("Password cannot be empty");
        valid = false;
    }

    if (password != confirmPassword) {
        errorLog.push("Confirm your password properly");
        valid = false;
    }

    return valid;
}

/*
    Função que executa chamada da API para registro de usuários
*/
function registerUser() {
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById("phone").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirm-password").value;
    let errorLog = [];

    if (validUser(name, email, phone, password, confirmPassword, errorLog)) {
        const user = {
            "name": name,
            "email": email,
            "phone": phone,
            "password": password
        };
        const xhr = new XMLHttpRequest();
        xhr.open("POST", urlAPI + '/create-user');
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    document.getElementById('response').innerHTML = '<h3>User created with success!</h3>';
                } else if (xhr.status === 500) {
                    document.getElementById('response').innerHTML = '<h3>Create user failed!</h3>';
                } else {
                    document.getElementById('response').innerHTML = '<h3>The system is out, please try later!</h3>';
                }
            }
        }

        xhr.send(JSON.stringify(user));

    } else {
        alert(errorLog.join('\n'));
    }
    return false;
}
document.getElementById('btn-submit').addEventListener('click', registerUser);


/*
    Função que valida dados da despesa antes da chamada da API
*/
function validExpense(category_id, release_date, due_date, total, errorLog) {
    let valid = true;

    if (category_id == '') {
        errorLog.push("Category cannot be empty");
        valid = false;
    }

    if (release_date == '') {
        errorLog.push("Release Date cannot be empty");
        valid = false;
    }

    if (due_date == '') {
        errorLog.push("Due Date cannot be empty");
        valid = false;
    }

    if (total == '') {
        errorLog.push("Total cannot be empty");
        valid = false;
    }

    return valid;
}

/*
    Função que executa chamada da API para registro de despesas
    {
        "id": null,
        "category_id":999,
        "user_id":999,
        "due_date":"2021-09-13",
        "release_date":"2021-06-25",
        "total":999.99
    }
*/
function createExpense() {
    let category_id = document.getElementById("category").value;
    let user_id = Number(document.getElementById("user_id").value);
    let release_date = document.getElementById("input-release").value;
    let due_date = document.getElementById("input-expiration").value;
    let total = Number(document.getElementById("input-total").value);
    const errorLog = [];

    if (validExpense(category_id, release_date, due_date, total, errorLog)) {
        const expense = {
            "id": null,
            "category_id": category_id,
            "user_id": user_id,
            "due_date": due_date,
            "release_date": release_date,
            "total": total
        }
        const xhr = new XMLHttpRequest();
        xhr.open("POST", urlAPI + '/create-expense');
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    document.getElementById('response').innerHTML = '<h3>Expense created with success!</h3>';
                    changeExpensesCategory();
                } else if (xhr.status === 500) {
                    document.getElementById('response').innerHTML = '<h3>Create expense failed!</h3>';
                } else {
                    document.getElementById('response').innerHTML = '<h3>The system is out, please try later!</h3>';
                }
            }
        }

        xhr.send(JSON.stringify(expense));
    } else {
        alert(errorLog.join('\n'));
    }

}
document.getElementById('btn-create-expense').addEventListener('click', createExpense);


/*
    Função que executa chamada da API para atualização de uma despesa
    {
        "id": 9,
        "category_id":999,
        "user_id":999,
        "due_date":"2021-09-13",
        "release_date":"2021-06-25",
        "total":999.99
    }
*/
function updateExpense() {
    let category_id = document.getElementById("category_update").value;
    let expense_id = Number(document.getElementById("expense_id").value);
    let user_id = Number(document.getElementById("user_id").value);
    let release_date = document.getElementById("input-release-update").value;
    let due_date = document.getElementById("input-expiration-update").value;
    let total = Number(document.getElementById("input-total-update").value);
    const errorLog = [];

    if (validExpense(category_id, release_date, due_date, total, errorLog)) {
        const expense = {
            "id": expense_id,
            "category_id": category_id,
            "user_id": user_id,
            "due_date": due_date,
            "release_date": release_date,
            "total": total
        }
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", urlAPI + '/update-expense');
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    document.getElementById('response-update').innerHTML = '<h3>Expense updated with success!</h3>';
                    changeExpensesCategory();
                } else if (xhr.status === 500) {
                    document.getElementById('response-update').innerHTML = '<h3>Update expense failed!</h3>';
                } else {
                    document.getElementById('response-update').innerHTML = '<h3>The system is out, please try later!</h3>';
                }
            }
        }

        xhr.send(JSON.stringify(expense));
    } else {
        alert(errorLog.join('\n'));
    }

}
document.getElementById('btn-update-expense').addEventListener('click', updateExpense);


/*
    Função que executa chamada da API para deleção de uma despesa
    
    /delete-expense/user/:user_id/expense/:expense_id
*/
function deleteExpense() {

    let expense_id = document.getElementById("expense_id_delete").value;
    let user_id = document.getElementById("user_id").value;

    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", urlAPI + `/delete-expense/user/${user_id}/expense/${expense_id}`);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                document.getElementById('response-delete').innerHTML = '<h3>Expense deleted with success!</h3>';
                changeExpensesCategory();
            } else if (xhr.status === 500) {
                document.getElementById('response-delete').innerHTML = '<h3>Delete expense failed!</h3>';
            } else {
                document.getElementById('response-delete').innerHTML = '<h3>The system is out, please try later!</h3>';
            }
        }
    }

    xhr.send(null);
} 

document.getElementById('btn-delete-expense').addEventListener('click', deleteExpense);

/*
    Função que executa chamada da API para registro de categoria
    {
        "id": null,
        "name": "Category Descpription",
        "user_id": 0
    }
*/
function createCategory() {
    //1 -> Ler o conteúdo da categoria
    const category = document.getElementById('input-name').value;
    const user_id = Number(document.getElementById('user_id').value);
    //2 -> Valida categoria
    if (category == '') {
        alert('Category Description cannot be empty');
        return false;
    }
    //3 -> Formatar os dados de acordo com o modelo proposto pela API
    const categoryToSend = {
        "id": null,
        "name": category,
        "user_id": user_id
    }
    //4 -> Envio requisição para a API
    const xhr = new XMLHttpRequest();
    xhr.open("POST", urlAPI + '/create-category');
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.send(JSON.stringify(categoryToSend));

    //5 -> Imprimir a resposta
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                document.getElementById('response').innerHTML = '<h3>Category created with success!</h3>';
                document.getElementById('input-name').value = '';
                loadCategories();
            } else if (xhr.status === 500) {
                document.getElementById('response').innerHTML = '<h3>Create category failed!</h3>';
            } else {
                document.getElementById('response').innerHTML = '<h3>The system is out, please try later!</h3>';
            }
        }
    }

}
document.getElementById('btn-create-category').addEventListener('click', createCategory);

/*
    Função que executa chamada da API para consulta das categorias
    /get-categories/user/1
*/
function getCategories() {
    //1 -> Ler ID do usuário
    const user_id = document.getElementById('user_id').value;

    //2 -> Compor a minha url de acordo com o padrão estabelecido pela API
    const url = urlAPI + `/get-categories/user/${user_id}`;

    //3 -> Executar requisição
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(null);

        //4 -> Carregar o array categoryList em caso de sucesso
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    categoryList.splice(0, categoryList.length);
                    categoryList.push(...JSON.parse(xhr.responseText));
                    resolve(true);
                } else if (xhr.status === 500) {
                    alert(`Cannot get categories from User ${user_id}`);
                    reject(false);
                } else {
                    alert(`The system is out, please try later!`);
                    reject(false);
                }
            }
        }
    })

}

/*
    Função que executa chamada da API para consulta das despesas
    /get-expenses/user/1
*/
function getExpenses(category_id = "all") {
    //1 -> Ler ID do usuário
    const user_id = document.getElementById('user_id').value;
    let url = '';

    //2 -> Compor a minha url de acordo com o padrão estabelecido pela API
    if (category_id == "all") {
        url = urlAPI + `/get-expenses/user/${user_id}`;
    } else {
        url = urlAPI + `/get-expenses/user/${user_id}/category/${category_id}`;
    }


    //3 -> Executar requisição
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(null);

        //4 -> Carregar o array expenseList em caso de sucesso
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    expenseList.splice(0, expenseList.length);
                    expenseList.push(...JSON.parse(xhr.responseText));
                    resolve(true);
                } else if (xhr.status === 500) {
                    alert(`Cannot get expenses from User ${user_id}`);
                    reject(false);
                } else {
                    alert(`The system is out, please try later!`);
                    reject(false);
                }
            }
        }
    })


}

/*
    Função que executa o carregamento do select das categorias no painel principal
*/
function loadCategories() {
    let htmlOptions = '<option selected value="all">All Categories</option>';
    if (categoryList.length > 0) {
        categoryList.forEach(category => {
            htmlOptions += `<option value="${category.id}">${category.name}</option>`;
        });
        document.getElementById("categories").innerHTML = htmlOptions;
        document.getElementById("category").innerHTML = htmlOptions;
        document.getElementById("category_update").innerHTML = htmlOptions;
        document.getElementById("category_delete").innerHTML = htmlOptions;
    }
}

/*
    Função que recupera o nome da categoria pelo ID dela
*/
function getCategoryNameByID(category_id) {
    let category = [];

    if (categoryList.length > 0) {
        category = categoryList.filter(item => {
            return item.id == category_id;
        });

        if (category.length > 0) {
            return category[0].name;
        }
    }

    return 'N/A';

}

/*
    Função que executa o carregamento do select das categorias no painel principal
*/
function loadExpenses() {
    let htmlExpenses = '';
    if (expenseList.length > 0) {
        expenseList.forEach((expense, index) => {
            htmlExpenses += '<div class="expenses">';
            htmlExpenses += '    <span class="">' + expense.id + '</span>';
            htmlExpenses += '    <span class="">' + getCategoryNameByID(expense.category_id) + '</span>';
            htmlExpenses += '    <span class="">' + expense.release_date + '</span>';
            htmlExpenses += '    <span class="">' + expense.due_date + '</span>';
            htmlExpenses += '    <span class="">R$' + expense.total + '</span>';
            htmlExpenses += '    <div class="btn-expense">';
            htmlExpenses += '        <button id="btn-edit" onclick="loadExpenseData(' + index + ')">';
            htmlExpenses += '            <img src="./img/edit.svg" />';
            htmlExpenses += '        </button>';
            htmlExpenses += '        <button id="btn-delete" onclick="loadExpenseDeleteData(' + index + ')">';
            htmlExpenses += '            <img src="./img/trash.svg">';
            htmlExpenses += '        </button>';
            htmlExpenses += '    </div>';
            htmlExpenses += '</div>';
        });
        document.getElementById("expenses-table").innerHTML = htmlExpenses;
    }
}


/*
    Executa o carregamento dos dados do usuário logado
*/
async function loadUserData() {
    try {
        let canExecCategories = await getCategories();
        let canExecExpenses = await getExpenses();

        if (canExecCategories) loadCategories();
        if (canExecExpenses) loadExpenses();
    } catch (error) {
        console.log('Falhou');
    }

}

/*
    Executa o carregamento das despesas a partir da  mudança da categoria na barra de títulos de despesas
*/
async function changeExpensesCategory() {
    const category_id = document.getElementById('categories').value;
    try {
        let canExecExpenses = await getExpenses(category_id);
        if (canExecExpenses) loadExpenses();
    } catch (error) {
        console.log('Falhou a troca de categoria');
    }
}

document.getElementById('categories').addEventListener('change', changeExpensesCategory);