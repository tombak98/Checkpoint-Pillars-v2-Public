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
