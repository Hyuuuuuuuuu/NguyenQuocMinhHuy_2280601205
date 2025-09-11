LoadData();
//GET: domain:port//posts
//GET: domain:port/posts/id
async function LoadData() {
    let data = await fetch('http://localhost:3000/posts');
    let posts = await data.json();
    
    let activePosts = posts.filter(post => !post.isDelete);
    
    let body = document.getElementById("body");
    body.innerHTML = "";
    
    for (const post of activePosts) {
        body.innerHTML += convertDataToHTML(post);
    }
}

function convertDataToHTML(post) {
    let result = "<tr>";
    result += "<td>" + post.id + "</td>";
    result += "<td>" + post.title + "</td>";
    result += "<td>" + post.views + "</td>";
    result += "<td><input type='submit' value='Delete' onclick='Delete("+post.id+")'></input></td>";
    result += "</tr>";
    return result;
}

async function getNextId() {
    try {
        let response = await fetch('http://localhost:3000/posts');
        let posts = await response.json();
        
        if (posts.length === 0) {
            return 1;
        }
        
        let maxId = Math.max(...posts.map(post => parseInt(post.id) || 0));
        return maxId + 1;
    } catch (error) {
        console.error("Error getting next ID:", error);
        return 1;
    }
}

//POST: domain:port//posts + body
async function SaveData(){
    try {
        let title = document.getElementById("title").value;
        let view = document.getElementById("view").value;
        
        if (!title || !view) {
            alert("Vui lòng nhập đầy đủ title và views!");
            return;
        }
        
        let newId = await getNextId();
        
        let dataObj = {
            id: newId.toString(),
            title: title,
            views: view,
            isDelete: false
        }
        
        let createResponse = await fetch('http://localhost:3000/posts', {
            method: 'POST',
            body: JSON.stringify(dataObj),
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if (createResponse.ok) {
            console.log("Create successful:", await createResponse.json());
            
            document.getElementById("title").value = "";
            document.getElementById("view").value = "";
            
            LoadData();
        } else {
            console.error("Create failed");
        }
    } catch (error) {
        console.error("Error saving data:", error);
    }
}

async function Delete(id){
    try {

        let getResponse = await fetch('http://localhost:3000/posts/' + id);
        
        if (!getResponse.ok) {
            console.error("Post not found");
            return;
        }
        
        let post = await getResponse.json();
        
        let updatedPost = {
            ...post,
            isDelete: true
        };
        
        let response = await fetch('http://localhost:3000/posts/' + id, {
            method: 'PUT',
            body: JSON.stringify(updatedPost),
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if (response.ok) {
            console.log("Soft delete thanh cong");
            LoadData();
        } else {
            console.error("Soft delete failed");
        }
    } catch (error) {
        console.error("Error soft deleting:", error);
    }
}