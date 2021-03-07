const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '$Uper123',
  database: 'employee_tracker',
});

const introQuestion = () => {
  inquirer
    .prompt({
      type: 'list',
      name: 'introQuestion',
      message: 'What would you like to do?',
      choices: ['View All Employees', 'View All Employees by Department', 'View All Employees by Manager', 'Add Employee', 'Remove Employee', 'Update Employee Role', 'Update Employee Manager', 'Exit Program'],
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
        case 'Remove Employee':
          removeEmployee();
          break;
        case 'Update Employee Role':
          updateEmployeeRole();
          break;
        case 'Update Employee Manager':
          updateEmployeeManager();
          break;
        case 'Exit Program':
          console.log('Goodbye!');
          process.exit();
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
  connection.query(`SELECT * FROM department`, (err, res) => {
    for (let i = 0; i < res.length; i++) {
      deptNames.push(res[i].department_id + " : " + res[i].deptname)
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
      newEmployee.push({ firstName: answers.employeeName.split(" ")[0], lastName: answers.employeeName.split(" ")[1], department_id: answers.employeeDept.split(" ")[0] })
      connection.query(`
      SELECT * 
      FROM employee
      INNER JOIN employee_role ON employee.role_id = employee_role.role_id
      INNER JOIN department ON employee_role.department_id = department.department_id
      WHERE title = 'manager' AND deptname = '${answers.employeeDept.split(" ")[2]}';
      `, (managerErr, managerRes) => {
        if (managerErr) throw managerErr;
        for (let i = 0; i < managerRes.length; i++) {
          managers.push(managerRes[i].first_name + " " + managerRes[i].last_name)
        }
        managers.push('They do not have a manager');
        inquirer
          .prompt({
            type: 'list',
            name: 'employeeManager',
            message: 'Who is their Manager?',
            choices: managers,
          }).then((answers) => {
            const firstAndLast = answers.employeeManager.split(" ")
            connection.query(`
            SELECT * 
            FROM employee
            INNER JOIN employee_role ON employee.role_id = employee_role.role_id
            INNER JOIN department ON employee_role.department_id = department.department_id
            WHERE first_name = '${firstAndLast[0]}' AND last_name = '${firstAndLast[1]}';
            `, (err, res) => {
              if (err) throw err;
              newEmployee.push({ managerID: res[0].employee_id })
            })
            connection.query(`
          SELECT role_id, title, department_id FROM employee_role 
          WHERE department_id = ${newEmployee[0].department_id}
          `, (err, res) => {
              let deptTitles = [];
              if (err) throw err;
              for (let i = 0; i < res.length; i++) {
                deptTitles.push(res[i].title)
              }
              inquirer
                .prompt({
                  type: 'list',
                  name: 'employeeTitle',
                  message: 'What is their role?',
                  choices: deptTitles,
                }).then((answers) => {
                  connection.query(`
              SELECT * FROM employee_role
              WHERE title = '${answers.employeeTitle}' AND department_id = ${newEmployee[0].department_id}
              `, (err, res) => {
                    if (err) throw err;
                    newEmployee.push({ role_id: res[0].role_id });
                    connection.query(`INSERT INTO employee SET ?`,
                      {
                        first_name: newEmployee[0].firstName,
                        last_name: newEmployee[0].lastName,
                        role_id: newEmployee[2].role_id,
                        manager_id: newEmployee[1].managerID
                      },
                      (err, res) => {
                        if (err) throw err;
                        console.log(`${newEmployee[0].firstName} ${newEmployee[0].lastName} has been added!`)
                        introQuestion();
                      })
                  })
                })
            })
          })
      })
    })
}

const removeEmployee = () => {
  employeeList = [];
  connection.query(`
  SELECT first_name, last_name FROM employee
  ORDER BY last_name;
  `, (err, res) => {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      employeeList.push(res[i].first_name + " " + res[i].last_name)
    }
    inquirer
      .prompt({
        type: 'list',
        name: 'employeeList',
        message: 'Which employee would you like to remove?',
        choices: employeeList,
      }).then((answer) => {
        const firstName = answer.employeeList.split(" ")[0]
        const lastName = answer.employeeList.split(" ")[1]
        connection.query(
          `DELETE FROM employee WHERE ?`,
          [
            {
              first_name: firstName,
            },
            {
              last_name: lastName,
            },
          ],
          (err, res) => {
            if (err) throw err;
            console.log(`The employee ${firstName} ${lastName} has been removed!`);
            introQuestion();
          }
        )
      })
  })
}

const updateEmployeeRole = () => {
  employeeList = [];
  connection.query(`
  SELECT first_name, last_name FROM employee
  ORDER BY last_name;
  `, (err, res) => {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      employeeList.push(res[i].first_name + " " + res[i].last_name)
    }
    inquirer
      .prompt({
        type: 'list',
        name: 'employeeList',
        message: 'Which employee would you like to update?',
        choices: employeeList,
      }).then((answer) => {
        const firstName = answer.employeeList.split(" ")[0];
        const lastName = answer.employeeList.split(" ")[1];
        connection.query(`
        SELECT * FROM employee
        WHERE first_name = '${firstName}' and last_name = '${lastName}'
        `, (err, res) => {
          if (err) throw err;
          const employeeRole = res[0].role_id;
          connection.query(`
          SELECT * FROM employee_role
          WHERE role_id = ${employeeRole};
          `, (err, res) => {
            if (err) throw err;
            const deptID = res[0].department_id;
            connection.query(`
            SELECT * FROM employee_role
            WHERE department_id = '${deptID}'
            `, (err, res) => {
              if (err) throw err;
              let departmentArray = [];
              for (let i = 0; i < res.length; i++) {
                departmentArray.push(res[i].title)
              }
              inquirer
                .prompt({
                  type: 'list',
                  name: 'deptList',
                  message: 'Which role would you like to update the employee with?',
                  choices: departmentArray,
                }).then((answer) => {
                  connection.query(`
                    SELECT * FROM employee_role
                    WHERE department_id = ${deptID} AND title = '${answer.deptList}';
                  `, (err, res) => {
                    if (err) throw err;
                    const newRoleID = res[0].role_id;
                    connection.query(`
                    UPDATE employee
                    SET role_id = ${newRoleID}
                    WHERE first_name = '${firstName}' and last_name = '${lastName}'
                    `, (err, res) => {
                      if (err) throw err;
                      console.log(`${firstName} ${lastName} has been updated to ${answer.deptList}`);
                      introQuestion();
                    })
                  })
                })
            })
          })
        })
      })
  })
}

const updateEmployeeManager = () => {
  employeeList = [];
  connection.query(`
  SELECT first_name, last_name FROM employee
  ORDER BY last_name;
  `, (err, res) => {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      employeeList.push(res[i].first_name + " " + res[i].last_name)
    }
    inquirer
      .prompt({
        type: 'list',
        name: 'employeeList',
        message: 'Which employee would you like to update managers for?',
        choices: employeeList,
      }).then((answer) => {
        const firstName = answer.employeeList.split(" ")[0];
        const lastName = answer.employeeList.split(" ")[1];
        connection.query(`
        SELECT * FROM employee
        WHERE first_name = '${firstName}' and last_name = '${lastName}'
        `, (err, res) => {
          if (err) throw err;
          const employeeID = res[0].employee_id;
          const employeeRole = res[0].role_id;
          connection.query(`
          SELECT * FROM employee_role
          WHERE role_id = ${employeeRole};
          `, (err, res) => {
            if (err) throw err;
            const deptID = res[0].department_id;
            connection.query(`
            SELECT * FROM employee_role
            WHERE department_id = '${deptID}' AND title = 'manager';
            `, (err, res) => {
              if (err) throw err;
              connection.query(`
              SELECT * FROM employee
              WHERE role_id = ${res[0].role_id};
              `, (err, res) => {
                console.log(res)
                const managerList = [];
                for (let i = 0; i < res.length; i++) {
                  managerList.push(res[i].first_name + " " + res[i].last_name)
                }
                inquirer
                  .prompt({
                    type: 'list',
                    name: 'managerList',
                    message: 'Which manager would you like to update with?',
                    choices: managerList,
                  }).then((answer) => {
                    const managerFirstName = answer.managerList.split(" ")[0];
                    const managerLastName = answer.managerList.split(" ")[1];
                    connection.query(`
                    SELECT * FROM employee
                    WHERE first_name = '${managerFirstName}' AND last_name = '${managerLastName}'
                    `, (err, res) => {
                      if (err) throw err;
                      const managerID = res[0].employee_id;
                      connection.query(`
                      UPDATE employee
                      SET manager_id = ${managerID}
                      WHERE employee_id = ${employeeID};
                    `, (err, res) => {
                        if (err) throw err;
                        console.log(`${firstName} ${lastName}'s manager has been updated to ${managerFirstName} ${managerLastName}`);
                        introQuestion();
                      })
                    })
                  })
              })
            })
          })
        })
      })
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
