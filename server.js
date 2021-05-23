'use strict'
'use strict';

require('dotenv').config();

const express= require('express');
const pg = require('pg');

//const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client( { connectionString: process.env.DATABASE_URL, ssl: process.env.LOCALLY ? false : {rejectUnauthorized: false}} );
const methodOverride = require('method-override');

const superagent= require ('superagent');

const PORT=process.env.PORT || 3000;

const server = express();
server.use(express.static('./public'));

server.use(express.urlencoded({ extended: true }));
server.use(methodOverride('_method'));

server.set('view engine','ejs');

server.post('/',(req,res)=>{
let url = `https://jobs.github.com/positions.json?location=usa`
superagent.get(url)
.then((value)=>{
let data=req.body
let data1=data.map((val)=>{
    return new Jobs(val)
})
res.render('./seraches/index',{jop:data1})
})
})


server.post('/jop',(req,res)=>{
    let name=req.body.jop;
    let url = `https://jobs.github.com/positions.json?description=${name}&location=usa`
    superagent.get(url)
    .then((value)=>{
    let data=req.body
    let data1=data.map((val)=>{
        return new Jobs(val)
    })
    res.render('./seraches/result',{jop:data1})
    })
    })

function Jobs(data)
{
    this.title=data.title;
    this.company=data.company;
    this.location=data.location;
    this.url=data.url;
    this.description=data.description;
}


server.post('/jops',addhandler)
function addhandler(req,res){
    let sql=`INSERT INTO tasks (title,company,location,url,description) VALUES (1$,2$,3$,4$,5$) WHERE id=6$`
    let safevalue=[req.body.title,req.body.company,req.body.location,req.body.url,req.body.description]
    client.query(sql,safevalue)
    .then((value)=>{
    res.redirect(`/jobs/${value.value.rows[0].id}`)
    })
}
server.get('/jops:id',detailhandler)

function detailhandler(req,res){

    let sql= `SELECT * FROM tasks WHERE id=$1`
    let value=[req.params.id]
    client.query(sql,value)
    .then((value)=>{
res.render('./seraches/jopdetals',{jop:value.rows[0]})
    })
}

server.put('/updateTASK:id',updatehandler)

function updatehandler(req,res){
    let sql=`UPDATE tasks set title=$1,company=$2,location=$3,url=$4,description=$5 WHERE id=$6`
    let safevalue=[req.body.title,req.body.company,req.body.location,req.body.url,req.body.description,req.params.id]
    client.query(sql,safevalue)
    .then((value)=>{
    res.redirect(`/jobs/${req.params.id}`)
    })
}

server.delete('/deletTASK:id',deletehandler)

function deletehandler(req,res){
    let sql= `DELETE FROM tasks WHERE id=$1`
    let safevalue=[req.params.id]
    client.query(sql,safevalue)
    .then(()=>{
        res.redirect('/seraches/mylist')
    })
}

client.connect()
.then(()=>{
    server.listen(PORT,()=> console.log(`lesten ${PORT}`))
});