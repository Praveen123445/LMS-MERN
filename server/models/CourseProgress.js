const mongoose = require('mongoose');

const lecturesProgressSchema = new mongoose.Schema({
    lectureId : String,
    viewed : Boolean,
    dateViewed : Date
})

const CourseProgressSchema = new mongoose.Schema({
    userId : String,
    courseId : String,
    completed : Boolean,
    completionDate : Date,
    lecturesProgress : [lecturesProgressSchema]
})

module.exports = mongoose.model('Progress', CourseProgressSchema)