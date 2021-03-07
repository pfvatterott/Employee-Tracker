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
        case 'Add Employee':
          addEmployee();
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
      nameArray.push({ last_name: res[i].last_name, first_name: res[i].first_name, dept: res[i].deptname, position: res[i].title })
    }
    console.log(console.table(nameArray));
    introQuestion();
  })
};

const viewByDepartment = () => {
  const departments = [];
  connection.query(`SELECT deptname FROM department`, (err, res) => {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      departments.push(res[i].deptname)
    }
    inquirer
      .prompt({
        type: 'list',
        name: 'deptChoice',
        message: 'Which Department?',
        choices: departments,
      }).then((answer) => {
        connection.query(`
      SELECT * 
      FROM employee
      INNER JOIN employee_role ON employee.role_id = employee_role.role_id
      INNER JOIN department ON employee_role.department_id = department.department_id
      WHERE deptname = '${answer.deptChoice}';
      `, (err, res) => {
          if (err) throw err;
          console.log(console.table(res));
          introQuestion();
        })
      })
  })
}

const viewByManager = () => {
  const managers = [];
  connection.query(`
      SELECT * 
      FROM employee
      INNER JOIN employee_role ON employee.role_id = employee_role.role_id
      INNER JOIN department ON employee_role.department_id = department.department_id
      WHERE title = 'manager';
    `, (err, res) => {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      managers.push(res[i].first_name + " " + res[i].last_name)
    }
    inquirer
      .prompt({
        type: 'list',
        name: 'managerChoice',
        message: 'Which Manager?',
        choices: managers,
      }).then((answer) => {
        // find what the managers employee ID is
        // split answer string into two variables, first and last name
        const firstAndLast = answer.managerChoice.split(" ")
        connection.query(`
          SELECT * 
          FROM employee
          INNER JOIN employee_role ON employee.role_id = employee_role.role_id
          INNER JOIN department ON employee_role.department_id = department.department_id
          WHERE first_name = '${firstAndLast[0]}' AND last_name = '${firstAndLast[1]}';
          `, (err, res) => {
          if (err) throw err;
          console.log(res[0].employee_id);
          let managerID = res[0].employee_id;
          connection.query(`
            SELECT * 
            FROM employee
            INNER JOIN employee_role ON employee.role_id = employee_role.role_id
            INNER JOIN department ON employee_role.department_id = department.department_id
            WHERE manager_id = ${managerID};
            `, (err, res) => {
            if (err) throw err;
            console.log(console.table(res));
            introQuestion();
          })
        })
      })
  })
}



const addEmployee = () => {
  let newEmployee = [];
  const deptNames = [];
  const managers = [];
  connection.query(`SELECT deptname FROM department`, (err, res) => {
      for (let i = 0; i < res.length; i++) {
        deptNames.push(res[i].deptname)
      }
    })
  inquirer
    .prompt([{
      type: 'input',
      name: 'employeeName',
      message: "What is the employee's name?",
      validate: function (value) {
        var pass = value.match(
            /^\S+\s\S+$/
        );
        if (pass) {
            return true;
        }
        return 'Please enter both the first name and last name'
    }
    },
    {
      type: 'list',
      name: 'employeeDept',
      message: 'Which Department do they belong in?',
      choices: deptNames,
    }]
    ).then((answers) => {
      newEmployee.push({firstName: answers.employeeName.split(" ")[0], lastName: answers.employeeName.split(" ")[1], deptname: answers.employeeDept})
      connection.query(`
      SELECT * 
      FROM employee
      INNER JOIN employee_role ON employee.role_id = employee_role.role_id
      INNER JOIN department ON employee_role.department_id = department.department_id
      WHERE title = 'manager' AND deptname = '${answers.employeeDept}';
      `, (managerErr, managerRes) => {
        if (managerErr) throw managerErr;
        for (let i = 0; i < managerRes.length; i++) {
          managers.push(managerRes[i].first_name + " " + managerRes[i].last_name)
        }
        inquirer
          .prompt({
            type: 'list',
            name: 'employeeManager',
            message: 'Who is their Manager?',
            choices: managers,
          })
      })

    }
    )}

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
