/* eslint-disable no-unused-vars */
const Sequelize = require('sequelize');
const db = require('./db');

const User = db.define('user', {
  // Add your Sequelize fields here
  name: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true
    },
  },
  userType: {
    type: Sequelize.ENUM,
    values: ['STUDENT', 'TEACHER'],
    defaultValue: 'STUDENT',
    allowNull: false,
  },
  isStudent: {
    type: Sequelize.VIRTUAL,
    get() {
      return this.userType === 'STUDENT'
    },
    set(value) {
      throw new Error('Don\'t try to set a isStudent value!')
    }
  },
  isTeacher: {
    type: Sequelize.VIRTUAL,
    get() {
      return this.userType === 'TEACHER'
    },
    set(value) {
      throw new Error('Don\'t try to set a isTeacher value!')
    }
  }
});

User.findUnassignedStudents = async function() {
  return await User.findAll({
    where: {
      mentorId: null,
      userType: 'STUDENT'
    }
  })
}

User.findTeachersAndMentees = async function() {
  return await User.findAll({
    where: {
      userType: 'TEACHER',
    },
    include: {
      model: User,
      as: "mentees"
    }
  })
}

// deny update if try to make a student a mentor
User.beforeUpdate(async(user) => {
  let mentor = await User.findOne({
    where: {
      id: user.mentorId
    }
  })
  if (mentor !== null && mentor.isStudent) {
    throw new Error("Cannot assign a student a student mentor")
  }
})

// deny update if you try to make someone a teacher, who has a mentor
User.beforeUpdate(async(user) => {
  if(!!user.mentorId && user.isTeacher) {
    throw new Error("Cannot make someone who has a mentor a teacher!")
  }
})

// deny update if you try to make someone a student, who has mentees
User.beforeUpdate(async(user) => {
  let mentees = await User.findAll({
    where:{
      mentorId: user.id
    }
  })
  // Note to self: I don't know why the .hasMentees method isnt working or gives
  // me an error, this is the best way I could figure out how to implement
  // this hook
  if (mentees.length !== 0 && user.isStudent) {
    throw new Error("Cannot make someone who has mentees a student!")
  }
})

/**
 * We've created the association for you!
 *
 * A user can be related to another user as a mentor:
 *       SALLY (mentor)
 *         |
 *       /   \
 *     MOE   WANDA
 * (mentee)  (mentee)
 *
 * You can find the mentor of a user by the mentorId field
 * In Sequelize, you can also use the magic method getMentor()
 * You can find a user's mentees with the magic method getMentees()
 */

User.belongsTo(User, { as: 'mentor' });
User.hasMany(User, { as: 'mentees', foreignKey: 'mentorId' });

module.exports = User;
