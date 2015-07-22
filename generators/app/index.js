'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var _ = require('lodash');
var inquirer = require('inquirer');

module.exports = yeoman.generators.Base.extend({
  constructor: function() {
      yeoman.generators.Base.apply(this, arguments);
  },

  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the stylish ' + chalk.red('PolymerExpress') + ' generator!'
    ));

    var prompts = [
    {
      type: 'input',
      name: 'appname',
      message: 'Give your new polymer-express application a name',
      default: 'my-app',
      validate:  function(answer) {
        if (answer.indexOf('-') >= 0)
          return true;
        return 'Your application name must contain a hyphen ("-")';
      }
    },
    {
      type: 'input',
      name: 'title',
      message: 'Give your new polymer-express application a fancy title',
      default: _.startCase(this.appname),
      store: true
    },
    {
      type: 'input',
      name: 'version',
      message: 'Give a starting version number',
      default: '0.0.0'
    },
    {
      input: 'list',
      name: 'license',
      message: 'What license do you wish to distribute under?',
      choices: ['MIT', 'BSD', 'GPL', 'Apache', new inquirer.Separator(), 'Proprietary'],
      default: 'MIT'
    },

    {
      type: 'input',
      name: 'serverPort',
      message: 'What port do you want the server (bin/www) to run on (can also be a named pipe)?',
      default: 3000
    },
    {
      type: 'input',
      name: 'devProxyPort',
      message: 'Please specify a proxy port on which to run the server during development',
      default: 5000
    },
    {
      type: 'confirm',
      name: 'addPassport',
      message: 'Would you like to enable express/Passport.js?',
      default: false
    },
    {
      type: 'confirm',
      name: 'skipInstall',
      message: 'Would you like me to skip npm install & bower install?',
      default: true
    }
    ];

    this.prompt(prompts, function (props) {
      this.props = props;
      // To access props later use this.props.someOption;
      done();
    }.bind(this));
  },

  configuring: {

    projectfiles: function () {
      var files = {
        'editorconfig': '.editorconfig',
        'jshintrc': '.jshintrc',
        'bowerrc': '.bowerrc',
        'yo-rc.json': '.yo-rc.json',
        'wct.conf.json': 'wct.conf.json'
      };

      for(var file in files) {
        this.fs.copy(
          this.templatePath(file),
          this.destinationPath(files[file])
        );
      }
    }
  },

  writing: {
    app: function () {
      var done = this.async();
      var files = {
        '_package.json': 'package.json',
        '_bower.json': 'bower.json',
        '_gulpfile.js': 'gulpfile.js',
        'bin/_www': 'bin/www',
        '_app.js': 'app.js',
        'app/**/*.html': 'app',
        'app/**/*.css': 'app',
        'routes/': 'routes/'
      };

      for (var file in files) {
        var dest, mode = 644;
        if( typeof files[file] === "string") {
          dest = files[file];
        }
        else if (typeof files[file] === "object") {
          dest = files[file].name;
          mode = files[file].mode;
        }
        this.fs.copyTpl(
          this.templatePath(file),
          this.destinationPath(dest),
          this.props
        );
      }
      done();
    }
  },

  install: {
      prep: function() {
        this.npmPackages = [];
        if(this.props.addPassport) {
          this.npmPackages.push("passport");
        }
      },
      doit: function () {
        if ( this.npmPackages && this.npmPackages.length > 0 )
          this.npmInstall(this.npmPackages, { save: true });
        
        if (!this.props.skipInstall) {
          this.installDependencies({ skipInstall: this.props.skipInstall });
        }
        else {
          this.log('Skipping dependencies installation, you can run ' 
            + chalk.bold.yellow('npm install') + ' and ' + chalk.bold.yellow('bower install')
            + ' at your leisure');
        }
      }
  }
});
