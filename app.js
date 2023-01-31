//Overall Setups

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const _ = require('lodash')
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('public'))


main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://Maximaxim:M0NG0za3ba1@cluster0.honpbsb.mongodb.net/tobuylistDB');
  
};

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your to do list"
})

const item2 = new Item({
    name: "Hit + to add"
})

const item3 = new Item({
    name: "Hit - to delete"
})

const defaultItems = [item1, item2, item3]


const listSchema = {
    name: String,
    items: [itemSchema]

}

const List = mongoose.model("List", listSchema);


app.get('/', function(req, res){
    Item.find(function(err, foundItems){
        if (foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if (err){
                    console.log(err)
                } else {
                    console.log('successfully added')
                }
            })
            res.redirect("/")
        } else {
            res.render('list', {listTitle: "Today", newListItems: foundItems})
        }
        
    });
    
        
});

app.post('/', function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });
    if (listName === "Today"){
        item.save();
        res.redirect("/")    
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect('/' + listName)
        })
    }
    
})

app.post('/delete', function(req, res){
    const checkedItem = req.body.checkbox
    const listName = req.body.listName;

    if (listName === "Today"){
        Item.findByIdAndRemove(checkedItem, function(err){
            if (!err){
                console.log("succsessfully deleted")
                res.redirect('/');
            }
    })
} else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}, function(err, foundList){
        if (!err){
            res.redirect('/' + listName);
        }

    })
}
})




app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, function(err, foundList){
        if (!err){
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save() 
                res.redirect("/" +customListName)
            } else {
                res.render('list', {listTitle: customListName, newListItems: foundList.items})
            }
        }
    })
    
    
})
 





app.get('/about', function(req, res){
    res.render('about'); 
})





app.listen(3000, function(){
    console.log("The server is running at port 3000")
})