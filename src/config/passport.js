import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from './index.js';

const setupPassport = () => {
  passport.use(new GoogleStrategy({
    clientID: config.oauth.google.clientId,
    clientSecret: config.oauth.google.clientSecret,
    callbackURL: config.oauth.google.callbackURL,
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth profile recibido:', {
        id: profile.id,
        displayName: profile.displayName,
        emails: profile.emails,
        photos: profile.photos ? profile.photos[0] : null
      });
      
      // En una aplicación real, aquí guardarías el usuario en la base de datos
      const user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails && profile.emails[0] ? profile.emails[0].value : 'No email',
        photo: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
        provider: 'google',
        accessToken, // Para uso futuro si necesitas hacer llamadas a APIs de Google
        refreshToken // Para refrescar el token cuando expire
      };
      
      return done(null, user);
    } catch (error) {
      console.error('Error in Google OAuth strategy:', error);
      return done(error, null);
    }
  }));

  passport.serializeUser((user, done) => {
    console.log('Serializando usuario:', user.id);
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    console.log('Deserializando usuario:', user.id);
    done(null, user);
  });
};

export default setupPassport;
