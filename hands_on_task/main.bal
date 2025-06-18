import ballerina/http;
import hands_on_task.db;

listener http:Listener userListener = new(9090);

service /users on userListener {
    
    resource function post insert(User user) returns json|error {
        return db:insertUser(user);
    }
    
    resource function get getById/[int id]() returns User|json|error {
        return db:getUserById(id);
    }
    
    resource function get search(string? name = (), string? email = ()) returns User[]|json|http:BadRequest|http:NotFound|error {
        if (name is () && email is ()) {
            return <http:BadRequest>{ body: { message: "No parameters given. Please provide 'name' or 'email' parameter." } };
        }
      
        User[]|error searchResult = db:searchUsers(name, email);
        
        if searchResult is error {
            return searchResult;
        }
        
        if searchResult.length() == 0 {
            return <http:NotFound>{ body: { message: "No users found" } };
        }
        
        return searchResult;
    }
    
    resource function put update/[int id](User user) returns json|error {
        return db:updateUser(id, user);
    }
    
    resource function delete remove/[int id]() returns json|error {
        return db:deleteUser(id);
    }
}