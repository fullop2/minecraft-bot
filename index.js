import { createRequire } from "module";
const require = createRequire(import.meta.url);

const config = require('./config.json');


const { Client, Intents } = require('discord.js');
const prefix="/"
const intents = new Intents(32767);
const client = new Client({ intents });

//await gooseDB.query('SHOW DATABASES');

const mongoose = require('mongoose');
const url = `mongodb+srv://minecraftbot:${config.PASSWORD}@minecraft.ffowi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

mongoose.connect(url)
.then(()=>{
    console.log('MongoDB Connected');
});

const description = mongoose.Schema({
    x: {
        type: Number
      },
    y: {
        type: Number,
        default: 0,
    },
    z: {
        type: Number
    },
    x: {
      type: String,
      maxLength: 50,
      unique: true

    },
    desc: {
      type: String,
    }
});

const Description = mongoose.model("Description", description);

client.on("messageCreate", async function(message){
    console.log(message.content);
    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    if(command === "ping"){
        message.reply('pong!');
    }
    else if(command === "add"){
        if(args.length < 4){
            message.reply('Invalid Param. /add [x] [y] [z] [desc]');
            return;
        }
        Description.create(
            {
                x: args.shift(),
                y: args.shift(),
                z: args.shift(),
                desc: args.reduce((p,c)=> p + " " + c)
            },
            (err, desc)=> {
                if (err) {
                    console.log(err);
                    return;
                }
                else{
                    message.reply(`Successfully Added : (${desc.x},${desc.y},${desc.z}) : ${desc.desc}`); 
                }
            }
        );
    }
    else if(command === "find"){
        if(args.length !== 1){
            message.reply('Invalid Param. /find [desc]');
            return;
        }
        Description.find(
            { desc: {$regex : `.*${args[0]}.*`} },
            (err, desc)=> {
                if (err) {
                    console.log(err);
                    return;
                }
                else{
                    const count = desc.length;
                    const res = desc.reduce((p,r)=>{
                        return p + `(${r.x},${r.y},${r.z}) : ${r.desc}\n`
                    },'')
                    // const res = JSON.stringify(desc);
                    message.reply(`검색 결과 : ${count}\n${res}`); 
                }
            }
        );
    }
    else if(command === "del"){
        if(args.length !== 1){
            message.reply('Invalid Param. /del [desc]');
            return;
        }
        Description.deleteOne(
            { desc: args[0] },
            (err, desc)=> {
                if (err) {
                    message.reply('Not Found'); 
                    console.log(err);
                    return;
                }
                else{
                    const res = JSON.stringify(desc);
                    message.reply(`Results : \n${res}`); 
                }
            }
        );
    }
    else if(command === "del-all-position-data"){
        if(args.length !== 0){
            message.reply('Invalid Param. /del-all');
            return;
        }
        Description.deleteMany(
            { desc: {$regex : `.*`} },
            (err, desc)=> {
                if (err) {
                    message.reply('Not Found'); 
                    console.log(err);
                    return;
                }
                else{
                    const res = JSON.stringify(desc);
                    message.reply(`Results : \n${res}`); 
                }
            }
        );
    }
    else {
        message.reply('unknown commands');
    }
});


// client.on("login", function(message){
//     if(message.author.bot) return;
//     if(message.content.startsWith(prefix)) return;

//     message.reply('pong!');
// });

client.login(config.BOT_TOKEN);