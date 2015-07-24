'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var yosay = require('yosay');
var _ = require('lodash');
var inquirer = require('inquirer');
var glob = require('yeoman-generator/node_modules/glob');



module.exports = yeoman.generators.Base.extend({

  constructor: function() {
      yeoman.generators.Base.apply(this, arguments);
      this.appname = _.kebabCase(this.appname);
      if(this.appname.indexOf('-') < 0) {
        this.appname = this.appname + '-' + 'app';
      }
      this.props = {
        appname: _.kebabCase(this.appname)
        , title: _.startCase(this.appname)
        , version: '0.0.0'
        , generator: 'polymer-express'
        , license: 'MIT'
        , serverPort: 3000
        , devProxyPort: 5000
        , addPassport: false
        , starterKit: 'minimal'
        , skipInstall: !!true
        , viewEngine: 'html'
        , viewEngineInit: ''
      };

      try  { 
        fs.accessSync(this.destinationPath('package.json'));
        this.log('I found an existing ' + chalk.cyan('package.json') + ' file, slurping it for some defaults');
        var pj = require(this.destinationPath('package.json'));

        this.props.appname = pj.name || this.props.appname;
        this.props.title = pj.title || this.props.title;
        this.props.version = pj.version || this.props.version;
        this.generator = pj.generator || this.props.generator;
        this.license = pj.license || this.props.license;
        this.starterKit = pj.starterKit || this.props.starterKit;
        this.viewEngine = pj.viewEngine || this.props.viewEngine; 
      } catch(err) {
        // do nothing here as fs.accessSync threw something
      }

      this.utils = {};
      this.utils.processGlob = function(src, dest, files) {
        for(var file in files) {
          var _src = this.templatePath(path.join(src, files[file]));
          var _dest = this.destinationPath(path.join(dest, files[file]));
          this.log('processing ' + chalk.green(src) + ' to ' + chalk.white.bold(dest));
          this.fs.copyTpl(_src, _dest, this.props);
        }
      }.bind(this)
  },


  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the stylish ' + chalk.red('Polymer Express') + ' generator!'
    ));


    var prompts = [
    {
      type: 'input',
      name: 'appname',
      message: 'Give your new polymer-express application a name',
      default: this.props.appname,
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
      default: this.props.title,
      store: true
    },
    {
      type: 'input',
      name: 'version',
      message: 'Give a starting version number',
      default: this.props.version
    },
    {
      input: 'list',
      name: 'license',
      message: 'What license do you wish to distribute your application under?',
      choices: ['MIT', 'BSD', 'GPL', 'Apache', new inquirer.Separator(), 'Proprietary'],
      default: this.props.license
    },

    {
      type: 'input',
      name: 'serverPort',
      message: 'What port do you want the server (bin/www) to run on (can also be a named pipe)?',
      default: this.props.serverPort
    },
    {
      type: 'input',
      name: 'devProxyPort',
      message: 'Please specify a proxy port on which to run the server during development',
      default: this.props.devProxyPort
    },
    {
      type: 'list',
      name: 'viewEngine',
      message: 'Which express view (templating) engine do you wish to use?',
      choices: [ 'html' , 'ejs', 'jade' ],
      default: this.props.viewEngine
    },
    {
      type: 'confirm',
      name: 'addPassport',
      message: 'Would you like to enable Passport.js for user management and session support?',
      default: this.props.addPassport
    },
    {
      type: 'list',
      name: 'starterKit',
      message: 'Which template would you like to use for your app?',
      choices: [ 'minimal', 'polymer-starter-kit' ],
      default: this.props.starterKit
    },
    {
      type: 'confirm',
      name: 'skipInstall',
      message: 'Would you like me to skip npm install & bower install?',
      default: this.props.skipInstall
    }
    ];

    this.prompt(prompts, function (props) {
      _.merge(this.props, props);
      // To access props later use this.props.someOption;
      this.props.viewEngineInit = "";
      switch(this.props.viewEngine) {
      case "html":
        this.props.viewEngineInit = "appServer.engine('html', require('ehp').renderFile);";
        break;
      }

      this.starterKitEngine = this.props.starterKit + '-' + this.props.viewEngine;
      this.starterKitDir = '._' + this.starterKitEngine;

      done();
    }.bind(this));
  },

  configuring: {

    projectfiles: function () {
      var files = {
        'minimal-html': {
          'editorconfig': '.editorconfig',
          'jshintrc': '.jshintrc',
          'bowerrc': '.bowerrc',
          'yo-rc.json': '.yo-rc.json',
          'wct.conf.json': 'wct.conf.json'
        },

        'polymer-starter-kit-html' : {

        }
      };

      for(var file in files[this.starterKitEngine]) {
        var dest = files[this.starterKitEngine][file];
        this.log(chalk.yellow('copying ') + chalk.white.bold(file));

        this.fs.copy(
          this.templatePath(file),
          this.destinationPath(dest)
        );
      }
    }
  },



  writing: {
    app: function () {
      // var done = this.async();
      var files = {
         '_package.json': 'package.json'
        ,'_bower.json': 'bower.json'
        ,'_gulpfile.js': 'gulpfile.js'
        ,'bin/_www': 'bin/www'
        ,'_appserver.js': 'appserver.js'
        ,'routes/': 'routes/'
      };
      var starterKit = this.starterKitDir;

      files[path.join(starterKit, 'elements/._appname/._appname.html')] = 
        path.join('app/elements/', this.props.appname, this.props.appname + '.html');
      files[path.join(starterKit, 'scripts/._appname.js')] = 
        path.join('app/scripts', this.props.appname +'.js');

      for (var file in files) {
        var dest = files[file];
        this.log('copying ' + chalk.bold.white(file));
        this.fs.copyTpl(
          this.templatePath(file),
          this.destinationPath(dest),
          this.props
        );
      }

      // globs from kits: destination root
      var patterns = {
         '**/*.html': 'app'
        ,'**/*.css' : 'app'
        ,'**/*.js'  : 'app'
        ,'**/*.png' : 'app'
        ,'**/*.jpg' : 'app'        
      };

      var kits = ['._common', starterKit ];
      for (var index in kits ) {
        var kit = kits[index];
        for (var pattern in patterns) {
          this.log('match ' + kit + ':' + chalk.blue(pattern));
          var matches  = glob.sync(pattern, { cwd: this.templatePath(kit) });
          this.utils.processGlob(kit, patterns[pattern], matches);
        }
      }
     // done();
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
        if ( this.npmPackages && this.npmPackages.length > 0 ){
          this.log('Installing and adding ' + chalk.green.bold('Passport.js') + ' to npm');
          this.npmInstall(this.npmPackages, { save: true });
        }
        if (!this.props.skipInstall) {
          this.installDependencies();
        }
        else {
          this.log('Skipping dependencies installation, you can run ' 
            + chalk.bold.yellow('npm install') + ' and ' + chalk.bold.yellow('bower install')
            + ' at your leisure');
        }
      }
  }
});
