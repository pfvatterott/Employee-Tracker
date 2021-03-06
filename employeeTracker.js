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

const createChart = () => {
  connection.query('SELECT * FROM employee', (err, res) => {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.log(console.table(res));
    connection.end();
  });
}
















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
  createChart();
});
