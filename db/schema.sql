DROP DATABASE IF EXISTS Employee_tracker;
CREATE database Employee_tracker;

USE Employee_tracker;

CREATE TABLE department (
  id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE role (
	id INT NOT NULL,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE employee (
	id INT NOT NULL,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    manager_id INT NOT NULL,
    PRIMARY KEY (id)
);

SELECT * FROM department;
SELECT * FROM role;
SELECT * FROM employee;
