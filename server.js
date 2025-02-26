const inquirer = require('inquirer');
const pool = require('./db/connection');
const consoleTable = require('console.table');

function mainMenu() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    'View All Departments',
                    'View All Roles',
                    'View All Employees',
                    'Add a Department',
                    'Add a Role',
                    'Add an Employee',
                    'Update Employee Role',
                    'Exit'
                ],
            }
        ])
        .then((answer) => {
            switch (answer.action) {
                case 'View All Departments':
                    viewDepartments();
                    break;
                case 'View All Roles':
                    viewRoles();
                    break;
                case 'View All Employees':
                    viewEmployees();
                    break;
                case 'Add a Department':
                    addDepartment();
                    break;
                case 'Add a Role':
                    addRole();
                    break;
                case 'Add an Employee':
                    addEmployee();
                    break;
                case 'Update Employee Role':
                    updateEmployeeRole();
                    break;
                default:
                    console.log('Goodbye!');
                    pool.end();
                    process.exit();
            }
        });
}

function viewDepartments() {
    pool.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        mainMenu();
    });
}

function viewRoles() {
    pool.query(
        `SELECT role.id, role.title, role.salary, department.name AS department 
         FROM role 
         JOIN department ON role.department_id = department.id`,
        (err, res) => {
            if (err) throw err;
            console.table(res.rows);
            mainMenu();
        }
    );
}

function viewEmployees() {
    pool.query(
        `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
                (SELECT first_name FROM employee WHERE id = employee.manager_id) AS manager 
         FROM employee 
         JOIN role ON employee.role_id = role.id 
         JOIN department ON role.department_id = department.id`,
        (err, res) => {
            if (err) throw err;
            console.table(res.rows);
            mainMenu();
        }
    );
}

function addEmployee() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'firstName',
                message: 'Enter the first name of the employee:',
            },
            {
                type: 'input',
                name: 'lastName',
                message: 'Enter the last name of the employee:',
            },
            {
                type: 'input',
                name: 'roleId',
                message: 'Enter the role ID for the employee:',
            },
            {
                type: 'input',
                name: 'managerId',
                message: 'Enter the manager ID for the employee (leave blank if none):',
            }
        ])
        .then((answers) => {
            console.log("User Input Received:", answers); // Debugging line
            
            const roleId = parseInt(answers.roleId);
            const managerId = answers.managerId ? parseInt(answers.managerId) : null;

            console.log("Executing SQL Query..."); // Debugging line

            pool.query(
                'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
                [answers.firstName, answers.lastName, roleId, managerId],
                (err, res) => {
                    if (err) {
                        console.error("Error adding employee:", err);
                        return mainMenu(); // Ensure we return to the main menu even after an error
                    }

                    console.log(`Employee ${answers.firstName} ${answers.lastName} added successfully!`);
                    mainMenu();
                }
            );
        })
        .catch((error) => {
            console.error("Inquirer Error:", error);
        });
}

function addRole() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter the title of the role:',
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter the salary for the role:',
            },
            {
                type: 'input',
                name: 'departmentId',
                message: 'Enter the department ID for the role:',
            }
        ])
        .then((answers) => {
            pool.query(
                'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)',
                [answers.title, answers.salary, answers.departmentId],
                (err, res) => {
                    if (err) throw err;
                    console.log(`Role ${answers.title} added successfully!`);
                    mainMenu();
                }
            );
        });
}

function addDepartment() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Enter the name of the department:',
            }
        ])
        .then((answers) => {
            pool.query(
                'INSERT INTO department (name) VALUES ($1)',
                [answers.name],
                (err, res) => {
                    if (err) throw err;
                    console.log(`Department ${answers.name} added successfully!`);
                    mainMenu();
                }
            );
        });
}
function updateEmployeeRole() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'employeeId',
                message: 'Enter the ID of the employee to update:',
            },
            {
                type: 'input',
                name: 'newRoleId',
                message: 'Enter the new role ID for the employee:',
            }
        ])
        .then((answers) => {
            pool.query(
                'UPDATE employee SET role_id = $1 WHERE id = $2',
                [answers.newRoleId, answers.employeeId],
                (err, res) => {
                    if (err) throw err;
                    console.log(`Employee ID ${answers.employeeId} updated with new role ID ${answers.newRoleId}!`);
                    mainMenu();
                }
            );
        });
}

mainMenu();