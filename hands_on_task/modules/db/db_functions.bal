import ballerina/sql;

public function insertUser(User user) returns json|error {
    sql:ParameterizedQuery query = getInsertUserQuery(user);
    sql:ExecutionResult result = check dbClient->execute(query);
    return { message: "User inserted", id: result.lastInsertId };
}

public function getUserById(int id) returns User|json|error {
    sql:ParameterizedQuery query = getUserByIdQuery(id);
    stream<User, sql:Error?> resultStream = dbClient->query(query);
    record {| User value; |}? result = check resultStream.next();
    check resultStream.close();
   
    if result is record {| User value; |} {
        return result.value;
    } else {
        return { message: "User not found" };
    }
}

public function searchUsers(string? name, string? email) returns User[]|error {
    sql:ParameterizedQuery query;
   
    if (name is string && email is string) {
        query = getSearchByNameAndEmailQuery(name, email);
    } else if (name is string) {
        query = getSearchByNameQuery(name);
    } else if (email is string) {
        query = getSearchByEmailQuery(email);
    } else {
        // This shouldn't happen in normal flow
        return error("Invalid search parameters");
    }
   
    stream<User, sql:Error?> resultStream = dbClient->query(query);
    User[] users = [];
   
    check from User user in resultStream
          do {
              users.push(user);
          };
   
    check resultStream.close();
    return users;
}

public function updateUser(int id, User user) returns json|error {
    sql:ParameterizedQuery query = getUpdateUserQuery(id, user);
    sql:ExecutionResult _ = check dbClient->execute(query);
    return { message: "User updated", id: id };
}

public function deleteUser(int id) returns json|error {
    sql:ParameterizedQuery query = getDeleteUserQuery(id);
    sql:ExecutionResult _ = check dbClient->execute(query);
    return { message: "User deleted", id: id };
}