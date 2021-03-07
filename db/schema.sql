DROP DATABASE IF EXISTS Employee_tracker;
CREATE database Employee_tracker;

USE Employee_tracker;

CREATE TABLE department (
  department_id INT(10) AUTO_INCREMENT NOT NULL,
  deptname VARCHAR(100) NOT NULL,
  PRIMARY KEY (department_id)
);

CREATE TABLE employee_role (
  role_id INT(10) AUTO_INCREMENT NOT NULL,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL NOT NULL,
  department_id INT(10) NOT NULL,
  PRIMARY KEY (role_id)
);

CREATE TABLE employee (
  employee_id INT(10) AUTO_INCREMENT NOT NULL,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT(10) NOT NULL,
  manager_id INT(10),
  PRIMARY KEY (employee_id)
);

SELECT * FROM department;
SELECT * FROM employee_role;
SELECT * FROM employee;