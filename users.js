let users = [];

function userJoin({id, username}){
    users.push({id, username});
}

function updateId({id, username}){
    const index = users.findIndex(user=>user.username === username);
    if(index > -1){
        users[index].id = id
    }
}

function removeUser(id){
    const index = users.findIndex(user=>user.id === id)
    let copy = users;
    if(index > -1){
        copy.splice(index, 1);
    }
    users = copy;
}

module.exports ={
    users,
    userJoin,
    updateId,
    removeUser
}