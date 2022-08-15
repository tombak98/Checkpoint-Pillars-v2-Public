const router = require('express').Router();
const {
  models: { User },
} = require('../db');

/**
 * All of the routes in this are mounted on /api/users
 * For instance:
 *
 * router.get('/hello', () => {...})
 *
 * would be accessible on the browser at http://localhost:3000/api/users/hello
 *
 * These route tests depend on the User Sequelize Model tests. However, it is
 * possible to pass the bulk of these tests after having properly configured
 * the User model's name and userType fields.
 */

// Add your routes here:

router.get('/unassigned', async(req,res,next) => {
  try {
    let users = await User.findUnassignedStudents()
    res.send(users)
  } catch(err) {
    next(err)
  }
})

router.get('/teachers', async(req,res,next) => {
  try {
    let users = await User.findTeachersAndMentees()
    res.send(users)
  } catch(err) {
    next(err)
  }
})

router.post('/', async(req,res,next) => {
  try {
    let [user, wasCreated] = await User.findOrCreate({
      where: {
        name: req.body.name,
      }
    })
    if (wasCreated) {
      res.status(201).send(user)
    } else {
      res.status(409).send("User with name already exists")
    }
  } catch(err) {
    next(err)
  }
})

router.delete('/:id', async(req,res,next) => {
  try {
    // Note to self, I've seen that isNaN isn't always reliable. Perhaps find a better
    // way to do this later
    if (isNaN(req.params.id)) {
      res.status(400).send("Id field should be a number")
    } else {
      let user = await User.findByPk(parseInt(req.params.id))
      if (user === null) {
        res.status(404).send("User Not Found")
      } else {
        await User.destroy({
          where: {
            id: req.params.id
          }
        })
        res.status(204).send("User Deleted")
      }
    }
  } catch(err) {
    next(err)
  }
})

module.exports = router;
