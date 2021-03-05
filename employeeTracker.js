const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

const introQuestions = [
  {
    type: 'list',
    name: 'whatdo',
    message: 'What would you like to do?',
    choices: ['View All Employees', 'View All Employees by Department', 'View All Employees by Manager', 'Add Employee', 'Remove Employee', 'Update Employee Role', 'Update Employee Manager']
  }
] 

















const connection = mysql.createConnection({
    host: 'localhost',
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: 'root',
  
    // Be sure to update with your own MySQL password!
    password: '$Uper123',
    database: 'employee_tracker',
});

connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadId}\n`);
});
