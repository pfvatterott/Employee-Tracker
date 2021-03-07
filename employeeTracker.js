const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

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


const introQuestion = () => { 
  inquirer
    .prompt({
      type: 'list',
      name: 'introQuestion',
      message: 'What would you like to do?',
      choices: ['View All Employees', 'View All Employees by Department', 'View All Employees by Manager', 'Add Employee', 'Remove Employee', 'Update Employee Role', 'Update Employee Manager'],
    })
    .then((answer) => {
      switch (answer.introQuestion) {
        case 'View All Employees':
          viewAllEmployees();
          break;
        case 'View All Employees by Department':
          viewByDepartment();
          break;
        case 'View All Employees by Manager':
          viewByManager();
          break;
      }
    })
};

const viewAllEmployees = () => {
  connection.query(`
  SELECT * 
  FROM employee
  INNER JOIN employee_role ON employee.role_id = employee_role.role_id
  INNER JOIN department ON employee_role.department_id = department.department_id
  ORDER BY last_name;
  `, (err, res) => {
    if (err) throw err;
    let nameArray = [];
    for (let i = 0; i < res.length; i++) {
      nameArray.push({last_name: res[i].last_name, first_name: res[i].first_name, dept: res[i].deptname, position: res[i].title})
    }
    console.log(console.table(nameArray));
    introQuestion();
  })
};

const viewByDepartment = () => {
  connection.query(`SELECT deptname FROM department`, (err, res) => {
    if (err) throw err;
  })
  inquirer
    .prompt({
      type: 'list',
      name: 'deptChoice',
      message: 'Which Department?',
      choices: ['sales', 'engineering', 'finance', 'legal'],
    }).then((answer) => {
      connection.query(`
      SELECT * 
      FROM employee
      INNER JOIN employee_role ON employee.role_id = employee_role.role_id
      INNER JOIN department ON employee_role.department_id = department.department_id
      WHERE deptname = '${answer.deptChoice}';
      `, (err, res) => {
        if (err) throw err;
        console.log(console.table(res))
        introQuestion();
      })
    })
}

const viewByManager = () => {
  connection.query(`
      SELECT * 
      FROM employee
      INNER JOIN employee_role ON employee.role_id = employee_role.role_id
      INNER JOIN department ON employee_role.department_id = department.department_id
      WHERE title = 'manager';
    `, (err, res) => {
      if (err) throw err;
      console.log(res)
    })
}

connection.connect((err) => {
  if (err) throw err;
  // https://patorjk.com/software/taag/#p=display&h=0&f=Big%20Money-nw&t=Employee%0ATracker%20
  console.log(
    `
    $$$$$$$$\                         $$\                                         
    $$  _____|                        $$ |                                        
    $$ |      $$$$$$\$$$$\   $$$$$$\  $$ | $$$$$$\  $$\   $$\  $$$$$$\   $$$$$$\  
    $$$$$\    $$  _$$  _$$\ $$  __$$\ $$ |$$  __$$\ $$ |  $$ |$$  __$$\ $$  __$$\ 
    $$  __|   $$ / $$ / $$ |$$ /  $$ |$$ |$$ /  $$ |$$ |  $$ |$$$$$$$$ |$$$$$$$$ |
    $$ |      $$ | $$ | $$ |$$ |  $$ |$$ |$$ |  $$ |$$ |  $$ |$$   ____|$$   ____|
    $$$$$$$$\ $$ | $$ | $$ |$$$$$$$  |$$ |\$$$$$$  |\$$$$$$$ |\$$$$$$$\ \$$$$$$$\ 
    \________|\__| \__| \__|$$  ____/ \__| \______/  \____$$ | \_______| \_______|
                            $$ |                    $$\   $$ |                    
                            $$ |                    \$$$$$$  |                    
                            \__|                     \______/                     
    $$$$$$$$\                               $$\                                   
    \__$$  __|                              $$ |                                  
       $$ |    $$$$$$\   $$$$$$\   $$$$$$$\ $$ |  $$\  $$$$$$\   $$$$$$\          
       $$ |   $$  __$$\  \____$$\ $$  _____|$$ | $$  |$$  __$$\ $$  __$$\         
       $$ |   $$ |  \__| $$$$$$$ |$$ /      $$$$$$  / $$$$$$$$ |$$ |  \__|        
       $$ |   $$ |      $$  __$$ |$$ |      $$  _$$<  $$   ____|$$ |              
       $$ |   $$ |      \$$$$$$$ |\$$$$$$$\ $$ | \$$\ \$$$$$$$\ $$ |              
       \__|   \__|       \_______| \_______|\__|  \__| \_______|\__|              
                                                                                  
                                                                                  
                                                                                      
    `
  );
  introQuestion();
});
