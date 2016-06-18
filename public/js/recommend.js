$.get(server+'/getTasks', function(data) {
        if(data){
            var taskList = JSON.parse(data);
            for(var task in taskList){
                var json = taskList[task];
                if(json.done === false){
                    addUndoTask(json.id, json.content);
                }else{
                    addDoneTask(json.id, json.content);
                }
            }
         }
    }).then();