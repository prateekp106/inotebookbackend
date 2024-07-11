const { type } = require('@testing-library/user-event/dist/type');
const mongoose = require('mongoose');
const {Schema} = mongoose;


const NotesSchema = new Schema({
    user:{  //link notes with the user id 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'

    },
    title:{
        type:String,
        require:true
    },
    description:{
        type:String,
        require:true
    },
    tag:{
        type:String,
        default:"General"
    },
    Date:{
        type:Date,
        default: Date.now
    }
})

const Notes = mongoose.model('Notes', NotesSchema);
module.exports = Notes;