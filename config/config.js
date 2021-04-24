module.exports = {
  modules: {
    server: true,
    serve: true,
    admin: true
  },
  static: ['public', 'src'],
  template: 'template',
  scss: {
    shared: '/shared.scss'
  }
};