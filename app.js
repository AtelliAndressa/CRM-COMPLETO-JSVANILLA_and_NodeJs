const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const SERVER_PORT = 3000;
const TABLES_DIR = './tables';

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    let html = '';
    html += '<select id="categories">';
    html += '   <option value="1">Alimentação</option>';
    html += '   <option value="2">Farmácia</option>';
    html += '   <option value="3">Lazer</option>';
    html += '</select>';
    res.send(`</h1>FUNCIONANDO</h1><br /> ${html}`);
});


/////////////////////////////// POSTS ///////////////////////////////
/*
    Method: POST
    Salva usuário
    Modelo JSON:
    {
        "id": null,
        "name":"Fulano",
        "email":"fulano@teste.com",
        "phone": "99 99999 9999",
        "password":"123"
    }
*/
app.post('/create-user', (req, res) => {
    const user = req.body;
    const filePath = TABLES_DIR + '/users.json';
    if (validateUser(user)) {
        readFile(filePath)
            .then(result => {
                user.id = getNextId(result);
                user.deleted = false;
                result.push(user);
                writeFile(filePath, result)
                    .then(result => {
                        res.send(user);
                    })
                    .catch(error => {
                        res.status(500).json({ message: error.message });
                    })
            })
            .catch(error => {
                res.status(500).json({ message: error.message });
            })
    } else {
        res.status(500).json({ message: "User out of pattern" });
    }
})


/*
    Method: POST
    Salva categorias de despesas
    Modelo JSON:
    {
        "id": null,
        "name":"Categoria X",
        "user_id":1
    }
*/
app.post('/create-category', async (req, res) => {
    const category = req.body;
    const filePath = TABLES_DIR + '/categories.json';
    const errorlog = [];
    if (await validateCategory(category, errorlog)) {
        readFile(filePath)
            .then(result => {
                category.id = getNextId(result);
                category.deleted = false;
                result.push(category);
                writeFile(filePath, result)
                    .then(result => {
                        res.send(category);
                    })
                    .catch(error => {
                        res.status(500).json({ message: error.message });
                    })
            })
            .catch(error => {
                res.status(500).json({ message: error.message });
            })
    } else {
        res.status(500).json({ message: errorlog.join(' / ') });
    }
})

/*
    Method: POST
    Salva despesas por usuário e categoria
    Modelo JSON:
    {
        "id": null,
        "category_id":999,
        "user_id":999,
        "due_date":"2021-09-13",
        "release_date":"2021-06-25",
        "total":999.99
    }
*/
app.post('/create-expense', async (req, res) => {
    const expense = req.body;
    const filePath = TABLES_DIR + '/expenses.json';
    const errorlog = [];
    if (await validateExpense(expense, errorlog)) {
        readFile(filePath)
            .then(result => {
                expense.id = getNextId(result);
                expense.deleted = false;
                result.push(expense);
                writeFile(filePath, result)
                    .then(result => {
                        res.send(expense);
                    })
                    .catch(error => {
                        res.status(500).json({ message: error.message });
                    })
            })
            .catch(error => {
                res.status(500).json({ message: error.message });
            })
    } else {
        res.status(500).json({ message: errorlog.join(' / ') });
    }
})

/*
    Method: POST
    Valida login do usuário pelo email e senha
    Modelo JSON:
    {
        "email": "fulano@teste.com",
        "senha": "123"
    }
*/
app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const filePath = TABLES_DIR + '/users.json';

    if (typeof email != 'undefined' && typeof password != 'undefined') {
        readFile(filePath)
            .then(users => {
                let user = users.filter(user => {
                    return !user.deleted && user.email == email && user.password == password;
                })

                if(user.length > 0) {
                    let userToSend = {
                        "id": user[0].id,
                        "name": user[0].name,
                        "email": user[0].email,
                        "phone": user[0].phone,
                    }
                    res.send(userToSend);
                } else {
                    res.status(500).json({message: "Login failed"});
                }

            })
            .catch(error => {
                res.status(500).json({ message: error.message });
            })
    }else {
        res.status(500).json({ message: "User out of pattern" });
    }

})

/////////////////////////////// GETS ///////////////////////////////

/*
    Method: GET
    Retorna as categorias de despesas vinculadas ao usuário + despesas padrão (user_id = 0)
    Modelo JSON:
    [
        {
            "id": null,
            "name":"Categoria X",
            "user_id":1
        }
    ]
    /get-categories/user/1
*/
app.get('/get-categories/user/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    const filePath = TABLES_DIR + '/categories.json';
    readFile(filePath)
        .then(categories => {
            const categoriesToSend = categories.filter(item => {
                return (!item.deleted && (item.user_id == 0 || item.user_id == user_id));
            })
            res.send(categoriesToSend);
        })
        .catch(error => {
            res.status(500).json({ message: error.message });
        })

})

/*
    Method: GET
    Retorna os dados da categoria pelo ID
    Modelo JSON:
    [
        {
            "id": null,
            "name":"Categoria X",
        }
    ]
    /get-category/user/1/category/1
    req.params.user_id = 1
    req.params.category_id = 1

*/
app.get('/get-category/user/:user_id/category/:category_id', (req, res) => {
    const category_id = req.params.category_id;
    const user_id = req.params.user_id;
    const filePath = TABLES_DIR + '/categories.json';
    readFile(filePath)
        .then(categories => {
            const category = categories.filter(item => {
                return (!item.deleted && item.id == category_id && (item.user_id == 0 || item.user_id == user_id));
            })
            if (category.length > 0) {
                res.send(category[0]);
            } else {
                res.status(500).json({ message: `Category ${category_id} not found` });
            }
        })
        .catch(error => {
            res.status(500).json({ message: error.message });
        })

})

/*
    Method: GET
    Retorna todos os usuários do sistema
    Modelo JSON:
    [
        {
            "id": null,
            "name":"Fulano",
            "email":"fulano@teste.com",
            "phone": "99 99999 9999",
            "password":"123"
        }
    ]

*/
app.get('/get-users', (req, res) => {
    const filePath = TABLES_DIR + '/users.json';
    readFile(filePath)
        .then(users => {
            const usersToSend = users.filter((item) => {
                return !item.deleted;
            }).map((value) => {
                return {
                    id: value.id,
                    name: value.name,
                    email: value.email,
                    phone: value.phone
                }
            })
            res.send(usersToSend);
        })
        .catch(error => {
            res.status(500).json({ message: error.message });
        })

})

/*
    Method: GET
    Retorna os dados de um usuário pelo ID
    Modelo JSON:
    [
        {
            "id": null,
            "name":"Fulano",
            "email":"fulano@teste.com",
            "phone": "99 99999 9999",
            "password":"123"
        }
    ]
    /get-user/1
    req.params.id = 1

*/
app.get('/get-user/:id', (req, res) => {
    const user_id = req.params.id;
    const filePath = TABLES_DIR + '/users.json';
    readFile(filePath)
        .then(users => {
            const user = users.filter(item => {
                return !item.deleted && item.id == user_id;
            })
            if (user.length > 0) {
                const userToSend = {
                    id: user[0].id,
                    name: user[0].name,
                    email: user[0].email,
                    phone: user[0].phone
                }
                res.send(userToSend);
            } else {
                res.status(500).json({ message: `User ${user_id} not found` });
            }
        })
        .catch(error => {
            res.status(500).json({ message: error.message });
        })

})

/*
    Method: GET
    Retorna os dados de todas as despesas pelo ID do usuário
    Modelo JSON:
    [
        {
            "id": 1,
            "category_id":1,
            "user_id":6,
            "due_date":"2021-09-13",
            "release_date":"2021-06-25",
            "total":999.99
        }
    ]
    /get-expenses/user/1/
    req.params.id = 1

*/
app.get('/get-expenses/user/:id', (req, res) => {
    const user_id = req.params.id;
    const filePath = TABLES_DIR + '/expenses.json';
    readFile(filePath)
        .then(all_expenses => {
            const expenses = all_expenses.filter(item => {
                return !item.deleted && item.user_id == user_id;
            })
            if (expenses.length > 0) {
                res.send(expenses);
            } else {
                res.status(500).json({ message: `User ${user_id} doesn't have expenses to show` });
            }
        })
        .catch(error => {
            res.status(500).json({ message: error.message });
        })

})


/*
    Method: GET
    Retorna os dados de todas as despesas pelo ID do usuário e Categoria de despesas
    Modelo JSON:
    [
        {
            "id": 1,
            "category_id":1,
            "user_id":6,
            "due_date":"2021-09-13",
            "release_date":"2021-06-25",
            "total":999.99
        }
    ]
    /get-expenses/user/1/category/3
    req.params.id = 1
    req.params.category = 3

*/
app.get('/get-expenses/user/:id/category/:category', (req, res) => {
    const user_id = req.params.id;
    const category_id = req.params.category;
    const filePath = TABLES_DIR + '/expenses.json';
    readFile(filePath)
        .then(all_expenses => {
            const expenses = all_expenses.filter(item => {
                return (!item.deleted && item.user_id == user_id && item.category_id == category_id);
            })
            if (expenses.length > 0) {
                res.send(expenses);
            } else {
                res.status(500).json({ message: `User ${user_id} doesn't have expenses to show` });
            }
        })
        .catch(error => {
            res.status(500).json({ message: error.message });
        })

})

/*
    Method: GET
    Retorna os dados de uma despesa pelo ID do usuário e ID da despesa
    Modelo JSON:
    [
        {
            "id": 1,
            "category_id":1,
            "user_id":6,
            "due_date":"2021-09-13",
            "release_date":"2021-06-25",
            "total":999.99
        }
    ]
    /get-expenses/user/1/expense/3
    req.params.id = 1
    req.params.expense = 3

*/
app.get('/get-expenses/user/:id/expense/:expense', (req, res) => {
    const user_id = req.params.id;
    const expense_id = req.params.expense;
    const filePath = TABLES_DIR + '/expenses.json';
    readFile(filePath)
        .then(all_expenses => {
            const expenses = all_expenses.filter(item => {
                return (!item.deleted && item.user_id == user_id && item.id == expense_id);
            })
            if (expenses.length > 0) {
                res.send(expenses[0]);
            } else {
                res.status(500).json({ message: `User ${user_id} doesn't have expenses to show` });
            }
        })
        .catch(error => {
            res.status(500).json({ message: error.message });
        })

})

/////////////////////////////// PUTS ///////////////////////////////
/*
    Method: PUT
    Atualiza usuário
    Modelo JSON:
    {
        "id": 1,
        "name":"Fulano",
        "email":"fulano@teste.com",
        "phone": "99 99999 9999",
        "password":"123"
    }
*/
app.put('/update-user', (req, res) => {
    const user = req.body;
    const filePath = TABLES_DIR + '/users.json';
    if (validateUser(user)) {
        readFile(filePath)
            .then(users => {
                let indexOfUser = getIndexOfByID(user.id, users);

                if (indexOfUser >= 0) {
                    users[indexOfUser] = user;
                    users[indexOfUser].deleted = false;

                    writeFile(filePath, users)
                        .then(result => {
                            res.send(user);
                        })
                        .catch(error => {
                            res.status(500).json({ message: error.message });
                        })
                } else {
                    res.status(500).json({ message: `User ${user.id} not found at table /users.json` });
                }
            })
            .catch(error => {
                res.status(500).json({ message: error.message });
            })
    } else {
        res.status(500).json({ message: "User out of pattern" });
    }
})


/*
    Method: PUT
    Atualiza categorias de despesas
    Modelo JSON:
    {
        "id": 1,
        "name":"Categoria X",
        "user_id":1
    }
*/
app.put('/update-category', async (req, res) => {
    const category = req.body;
    const filePath = TABLES_DIR + '/categories.json';
    const errorlog = [];
    if (await validateCategory(category, errorlog)) {
        readFile(filePath)
            .then(categories => {
                let indexOfCategory = getIndexOfByID(category.id, categories);

                if (indexOfCategory >= 0) {
                    if (categories[indexOfCategory].user_id != 0) {
                        categories[indexOfCategory] = category;
                        categories[indexOfCategory].deleted = false;

                        writeFile(filePath, categories)
                            .then(result => {
                                res.send(category);
                            })
                            .catch(error => {
                                res.status(500).json({ message: error.message });
                            })
                    } else {
                        res.status(500).json({ message: `Category ${category.id} cannot be updated` });
                    }
                } else {
                    res.status(500).json({ message: `Category ${category.id} not found at table /categories.json` });
                }
            })
            .catch(error => {
                res.status(500).json({ message: error.message });
            })
    } else {
        res.status(500).json({ message: errorlog.join(' / ') });
    }
})

/*
    Method: PUT
    Atualiza despesas por usuário
    Modelo JSON:
    {
        "id": 1,
        "category_id":999,
        "user_id":999,
        "due_date":"2021-09-13",
        "release_date":"2021-06-25",
        "total":999.99
    }
*/
app.put('/update-expense', async (req, res) => {
    const expense = req.body;
    const filePath = TABLES_DIR + '/expenses.json';
    const errorlog = [];
    if (await validateExpense(expense, errorlog)) {
        readFile(filePath)
            .then(expenses => {
                let indexOfExpense = getIndexOfByID(expense.id, expenses);

                if (indexOfExpense >= 0) {
                    if (expenses[indexOfExpense].user_id == expense.user_id) {
                        expenses[indexOfExpense] = expense;
                        expenses[indexOfExpense].deleted = false;

                        writeFile(filePath, expenses)
                            .then(result => {
                                res.send(expense);
                            })
                            .catch(error => {
                                res.status(500).json({ message: error.message });
                            })
                    } else {
                        res.status(500).json({ message: `Expense ${expense.id} cannot be updated` });
                    }
                } else {
                    res.status(500).json({ message: `Expense ${expense.id} not found at table /expenses.json` });
                }
            })
            .catch(error => {
                res.status(500).json({ message: error.message });
            })
    } else {
        res.status(500).json({ message: errorlog.join(' / ') });
    }
})


/////////////////////////////// DELETE ///////////////////////////////
/*
    Method: DELETE
    Deleta um usuário pelo ID
    Modelo JSON:
    [
        {
            "id": 1,
            "name":"Fulano",
            "email":"fulano@teste.com",
            "phone": "99 99999 9999",
            "password":"123",
            "deleted":true
        }
    ]
    /delete-user/1
    req.params.id = 1

*/
app.delete('/delete-user/:id', (req, res) => {
    const user_id = req.params.id;
    const filePath = TABLES_DIR + '/users.json';
    readFile(filePath)
        .then(users => {
            let indexOfUser = getIndexOfByID(user_id, users);
            if (indexOfUser >= 0) {
                users[indexOfUser].deleted = true;
                writeFile(filePath, users)
                    .then(result => {
                        let userToSend = {
                            id: users[indexOfUser].id,
                            name: users[indexOfUser].name,
                            email: users[indexOfUser].email,
                            phone: users[indexOfUser].phone,
                            deleted: users[indexOfUser].deleted
                        }
                        res.send(userToSend);
                    })
                    .catch(error => {
                        res.status(500).json({ message: error.message });
                    })
            } else {
                res.status(500).json({ message: `User ${user_id} not found at table /users.json` });
            }
        })
        .catch(error => {
            res.status(500).json({ message: error.message });
        })

})

/*
    Method: DELETE
    Deleta uma categoria pelo ID
    Modelo JSON:
    [
        {
            "id": 1,
            "name":"Categoria X",
            "user_id":2
        }
    ]
    /delete-category/2/category/1
    req.params.user_id = 2
    req.params.category_id = 1

*/
app.delete('/delete-category/user/:user_id/category/:category_id', async (req, res) => {
    const user_id = req.params.user_id;
    const category_id = req.params.category_id;
    const filePath = TABLES_DIR + '/categories.json';
    const errorlog = [];

    if (await canDeleteCategory(user_id, category_id, errorlog)) {
        readFile(filePath)
            .then(categories => {
                let indexOfCategory = getIndexOfByID(category_id, categories);
                if (indexOfCategory >= 0) {
                    if (categories[indexOfCategory].user_id == user_id && categories[indexOfCategory].user_id != 0) {
                        categories[indexOfCategory].deleted = true;
                        writeFile(filePath, categories)
                            .then(result => {
                                res.send(categories[indexOfCategory]);
                            })
                            .catch(error => {
                                res.status(500).json({ message: error.message });
                            })
                    } else {
                        res.status(500).json({ message: `Category ${category_id} doesn't belong to user ${user_id}` });
                    }
                } else {
                    res.status(500).json({ message: `Category ${category_id} not found at table /categories.json` });
                }
            })
            .catch(error => {
                res.status(500).json({ message: error.message });
            })
    } else {
        res.status(500).json({ message: errorlog.join(' / ') });
    }

})

/*
    Method: DELETE
    Deleta uma despesa pelo ID e pelo usuário
    Modelo JSON:
    [
        {
            "id": 1,
            "category_id": 999,
            "user_id": 999,
            "due_date": "2021-09-13",
            "release_date": "2021-06-25",
            "total": 999.99,
            "deleted": false
    }
    ]
    /delete-expense/user/2/expense/1
    req.params.user_id = 2
    req.params.expense_id = 1

*/
app.delete('/delete-expense/user/:user_id/expense/:expense_id', (req, res) => {
    const user_id = req.params.user_id;
    const expense_id = req.params.expense_id;
    const filePath = TABLES_DIR + '/expenses.json';

    readFile(filePath)
        .then(expenses => {
            let indexOfExpense = getIndexOfByID(expense_id, expenses);
            if (indexOfExpense >= 0) {
                if (expenses[indexOfExpense].user_id == user_id) {
                    expenses[indexOfExpense].deleted = true;

                    writeFile(filePath, expenses)
                        .then(() => {
                            res.send(expenses[indexOfExpense]);
                        })
                        .catch(error => {
                            res.status(500).json({ message: error.message });
                        })

                } else {
                    res.status(500).json({ message: `User ${user_id} doesn't have any expense with ID ${expense_id}` });
                }
            } else {
                res.status(500).json({ message: `User ${user_id} doesn't have any expense with ID ${expense_id}` });
            }
        })
        .catch(error => {
            res.status(500).json({ message: error.message });
        })

})

/*
    Função que retorna o próximo ID
*/
function getNextId(data) {
    let nextId = (data.length > 0) ? (data[data.length - 1].id + 1) : 1;
    return nextId;
}

/*
    Função que lê um arquivo json e retorna os dados em formato de objeto
*/
function readFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (error, data) => {
            if (error) reject(error);
            if (typeof data == 'undefined') {
                resolve([]);
            } else {
                resolve(JSON.parse(data));
            }
        });
    })
}

/*
    Função que escreve um arquivo json
*/
function writeFile(filePath, data) {
    const writeData = (typeof data == 'string') ? data : JSON.stringify(data);
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, writeData, (error) => {
            if (error) reject(error);
            resolve('OK');
        });
    })
}

/*
    Função que valida se meu usuário possui todos os dados necessários
*/
function validateUser(user) {
    let valid = true;
    if (typeof user.name == 'undefined' || typeof user.email == 'undefined' || typeof user.phone == 'undefined' || typeof user.password == 'undefined') {
        valid = false;
    }
    return valid;
}


/*
    Função que valida se a categoria possui todos os dados necessários
*/
async function validateCategory(category, errorlog) {
    let valid = true;
    if (typeof category.name == 'undefined' || typeof category.user_id == 'undefined') {
        valid = false;
        errorlog.push("Category out of pattern");
    } else {
        let validUser = await checkDataByID(category.user_id, '/users.json', errorlog);

        if (!(validUser)) {
            valid = false;
        }
    }
    return valid;
}


/*
    Função que valida se a categoria possui todos os dados necessários
*/
async function validateExpense(expense, errorlog) {
    let valid = true;
    if (typeof expense.category_id == 'undefined' || typeof expense.user_id == 'undefined' || typeof expense.total == 'undefined' || typeof expense.due_date == 'undefined' || typeof expense.release_date == 'undefined') {
        valid = false;
        errorlog.push("Expense out of pattern");
    } else {
        let validUser = await checkDataByID(expense.user_id, '/users.json', errorlog);
        let validCategory = await checkDataByID(expense.category_id, '/categories.json', errorlog);

        if (!(validUser && validCategory)) {
            valid = false;
        }
    }
    return valid;
}

/*
    Função que valida se existe dado cadastrado no sistema pelo ID
*/
async function checkDataByID(id, file, errorlog) {
    const filePath = TABLES_DIR + file;
    try {
        const data = await readFile(filePath);
        let checkObj = data.filter(item => {
            return !item.deleted && item.id == id;
        });

        if (checkObj.length > 0) {
            return true;
        } else {
            if (typeof errorlog != 'undefined') {
                errorlog.push(`ID ${id} not found at table ${file}`);
            };
            return false;
        }
    } catch (error) {
        if (typeof errorlog != 'undefined') {
            errorlog.push(error.message)
        }
        return false;
    }
}

/*
    Função que retorna a posição do meu registro no array com base no ID
*/
function getIndexOfByID(id, data) {
    let indexOfData = -1;
    data.forEach((element, index) => {
        if (element.id == id && !element.deleted) {
            indexOfData = index;
            return false;
        }
    });
    return indexOfData;
}

/*
    Função que valida se a categoria pode ou não ser deletada
*/
async function canDeleteCategory(user_id, category_id, errorlog) {
    let valid = true;
    let validUser = await checkDataByID(user_id, '/users.json', errorlog);
    let validCategory = await checkDataByID(category_id, '/categories.json', errorlog);
    let validEmptyCategory = await checkEmptyCategory(category_id, errorlog);

    if (!(validUser && validCategory && validEmptyCategory)) {
        valid = false;
    }

    return valid;
}

/*
    Função que valida se existe dado cadastrado no sistema pelo ID
*/
async function checkEmptyCategory(category_id, errorlog) {
    const filePath = TABLES_DIR + '/expenses.json';
    try {
        const data = await readFile(filePath);
        let checkObj = data.filter(item => {
            return !item.deleted && item.category_id == category_id;
        });

        if (checkObj.length > 0) {
            if (typeof errorlog != 'undefined') {
                errorlog.push(`Category ${category_id} in use at table /expenses.json`);
            };
            return false;
        } else {
            return true;
        }
    } catch (error) {
        if (typeof errorlog != 'undefined') {
            errorlog.push(error.message)
        }
        return false;
    }
}

app.listen(SERVER_PORT, () => {
    console.log(`SERVICO RODANDO NA PORTA ${SERVER_PORT}`);
})