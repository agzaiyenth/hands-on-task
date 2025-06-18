
import ballerina/sql;

public function getInsertUserQuery(User user) returns sql:ParameterizedQuery {
    return `INSERT INTO users (name, email, age) VALUES (${user.name}, ${user.email}, ${user.age})`;
}

public function getUserByIdQuery(int id) returns sql:ParameterizedQuery {
    return `SELECT * FROM users WHERE id = ${id}`;
}

public function getSearchByNameQuery(string name) returns sql:ParameterizedQuery {
    return `SELECT * FROM users WHERE name LIKE ${"%" + name + "%"}`;
}

public function getSearchByEmailQuery(string email) returns sql:ParameterizedQuery {
    return `SELECT * FROM users WHERE email LIKE ${"%" + email + "%"}`;
}

public function getSearchByNameAndEmailQuery(string name, string email) returns sql:ParameterizedQuery {
    return `SELECT * FROM users WHERE name LIKE ${"%" + name + "%"} AND email LIKE ${"%" + email + "%"}`;
}

public function getUpdateUserQuery(int id, User user) returns sql:ParameterizedQuery {
    return `UPDATE users SET name = ${user.name}, email = ${user.email}, age = ${user.age} WHERE id = ${id}`;
}

public function getDeleteUserQuery(int id) returns sql:ParameterizedQuery {
    return `DELETE FROM users WHERE id = ${id}`;
}