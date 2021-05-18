const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// var items = ["Buy Food","Cook Food","Eat Food"];
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true});
const itemsSchema ={
  name:String
};
const Item = mongoose.model("Item",itemsSchema);
const item1 = new Item({
  name:"Practice Aptitude"
});
const item2 = new Item({
  name:"Practice Programing"
});
const item3 = new Item({
  name:"Practice Reasoning"
});


const defaultItems = [item1,item2,item3];

const listsSchema = {
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("List",listsSchema);

app.set("view engine","ejs");
app.use(express.static("public"));

app.post("/",function(req,res){
  const itemName = req.body.newItem;
  const listName = req.body.button;
  const item = new Item({
    name:itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/")
  }
  else{
    List.findOne({name:listName},function(err,result){
      if(err){
        console.log(err);
      }
      else{
        result.items.push(item);
        result.save();
        res.redirect("/"+listName);
      }
    });
  }

  console.log(item);
  console.log(listName);

});


app.get("/",function(req,res){
  Item.find({},function(err,items){

      if(items.length === 0){
        Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("SuccessFully added to the DB");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list",{kindofaday:"Today", newLists:items});
    }
  });
});


app.post("/delete",function(req,res){
  const checkItemId = req.body.checkbox;
  const itemListName = req.body.listName;
  console.log(itemListName);
  if(itemListName === "Today"){
    Item.deleteOne({_id:checkItemId},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("SuccessFully Deleted");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate(
      {name:itemListName},
      {$pull:{items:{_id:checkItemId}}},
      function(err,result){
        if(err){
          console.log(err);
        }
        else{
          console.log("Data deleted");
          res.redirect("/"+itemListName);
        }
      }
    );
  }


});

app.get('/:id', function(req, res){
  const customListName = _.capitalize(req.params.id);
  console.log(customListName);
  List.findOne({name:customListName},function(err,result){
    if(err){
              console.log(err);
    }
    else{
              if(!result){
                const list = new List({
                  name:customListName,
                  items:defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
              }
              else{
                res.render("list",{kindofaday:result.name, newLists:result.items});
                console.log("Data Already present");
              }
    }
  });
});

app.listen("3000",function(){
  console.log("Server is running in port 3000");
});
