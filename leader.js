let leaderBoard;
let table = document.getElementById("table");
readLeaderBoard();

function readLeaderBoard(){
    let raw  = localStorage.getItem('leaderboard');
    leaderBoard = raw.split(';').sort((a,b) => (a.split('-')[1]>b.split('-')[1]) ? -1 : 1);
    for(let record of leaderBoard){
        let temp = record.split("-");
        let name = temp[0];
        let score = temp[1];
        let row = document.createElement("tr");
        row.innerHTML = "<td>"+name+"</td><td>"+score+"</td>";
        table.append(row);
    }
}

