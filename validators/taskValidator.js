const Joi = require('joi');

const taskSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    category: Joi.string().min(3).max(50).required(),
    status: Joi.string().valid('pending', 'in-progress', 'completed').required(),
    createdAt: Joi.date().optional() // Include createdAt as an optional field
});

module.exports = { taskSchema };