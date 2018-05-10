let passport = require('passport')
let BasicStrategy = require('passport-http').BasicStrategy

passport.use(new BasicStrategy(
  (userid, password, done) => {
    if (userid === 'ibm' && password === 'watson') {
      done(null, true)
    } else {
      done(null, false)
    }
  }
))
