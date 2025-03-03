module.exports = {
  // These are the locales you want to support in your application
  locales: ['en', 'sk'],
  
  // This is the default locale you want to be used when visiting
  // a non-locale prefixed path e.g. `/hello`
  defaultLocale: 'sk',
  
  // This is a list of locale domains and the default locale they
  // should handle (these are only required when you're using a domain strategy)
  domains: [
    // {
    //   domain: 'example.com',
    //   defaultLocale: 'en',
    // },
    // {
    //   domain: 'example.sk',
    //   defaultLocale: 'sk',
    //   // an optional http field can also be used to test
    //   // locale domains locally with http instead of https
    //   http: true,
    // },
  ],
};
