module.exports = {

  // database: 'mongodb://root:qw12er34@ds019053.mlab.com:19053/nwen304test',
  database:'mongodb://ZhenWang:1991gaokao2009@ds015934.mlab.com:15934/newn304groupproject',
  secretKey: "qw12er34",

  facebook: {
  	// make it const
  	clientID: process.env.FACEBOOK_ID || '188826648185616',
  	clientSecret: process.env.FACEBOOK_SECRET || 'a158b766ecdb6181d123a6ea4f3b6fb0',
  	profileFields: ['emails', 'displayName'],
  	callbackURL: 'http://localhost:8080/auth/facebook/callback'
  }
}
