/* eslint-disable no-unused-vars */
const Sequelize = require('sequelize');
const db = require('./db');
const { Op } = require('sequelize')

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

User.prototype.getPeers = async function() {
  return await User.findAll({
    where: {
      mentorId: this.mentorId,
      id: {
        [Op.ne]: this.id
      }
    }
  })
}

// deny updates for various cases
User.beforeUpdate(async(user) => {
  let mentor = await User.findOne({
    where: {
      id: user.mentorId
    }
  })
  let mentees = await User.findAll({
    where:{
      mentorId: user.id
    }
  })
    // cannot update a user with a mentor who is not a teacher
  if (mentor !== null && mentor.isStudent) {
    throw new Error("Cannot assign a student a student mentor")
    // cannot change userType from student to teacher when user has a mentor
  } else if (!!user.mentorId && user.isTeacher) {
    throw new Error("Cannot make someone who has a mentor a teacher!")
    // cannot change userType from teacher to student when user has mentees
  } else if (mentees.length !== 0 && user.isStudent) {
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
