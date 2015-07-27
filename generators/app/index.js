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
        , middleWare: 'HAPI'
        , backEnd: 'ElasticJS'
      };

      try  {
        fs.accessSync(this.destinationPath('package.json'));
        var pj = require(this.destinationPath('package.json'))['generator-settings'];
        if ( typeof pj != 'object')
          throw new Error("No settings found, skipping");
        this.log('I found an existing ' + chalk.cyan('package.json') + ' file with generator defaults');
        _.merge(this.props, pj);
      } catch(err) {
        // do nothing here as fs.accessSync threw something
      }

      this.utils = {};
      this.utils.processFiles = function(filelist) {
        for(var file in filelist) {
          var dest = filelist[file];
          this.log(chalk.yellow('copying ') + chalk.white.bold(file));

          this.fs.copyTpl(
            this.templatePath(file),
            this.destinationPath(dest),
            this.props
          );
        }
      }.bind(this);

      this.utils.processGlob = function(src, dest, files) {
        for(var file in files) {
          var _src = this.templatePath(path.join(src, files[file]));
          var _dest = this.destinationPath(path.join(dest, files[file]));
          this.log('processing ' + chalk.green(src) + ' to ' + chalk.white.bold(dest));
          this.fs.copyTpl(_src, _dest, this.props);
        }
      }.bind(this);
  },


  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the stylish ' + chalk.red('Polymer + Middleware') + ' generator!'
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
      type: 'list',
      name: 'middleWare',
      message: 'Which middleware do you prefer to use?',
      choices: [ 'None', 'Express', 'Koa', 'HAPI' ],
      default: this.props.middleWare
    },
    {
      type: 'list',
      name: 'backEnd',
      message: 'Which back-end would you prefer to use?',
      choices: ['None', 'ElasticJS', 'MongoDB'],
      default: this.props.backEnd
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
        'common': {
          'editorconfig': '.editorconfig',
          'jshintrc': '.jshintrc',
          'bowerrc': '.bowerrc',
          'yo-rc.json': '.yo-rc.json',
          'wct.conf.json': 'wct.conf.json'
        }
      };
      var filelist = {};
      _.merge(filelist, files['common']);
      _.merge(filelist, files[this.starterKitEngine]|| {});
      this.utils.processFiles(filelist);
    }
  },



  writing: {
    app: function () {
      var done = this.async();
      var files = {
         '_package.json': 'package.json'
        ,'_bower.json': 'bower.json'
        ,'_gulpfile.js': 'gulpfile.js'
        ,'bin/_www': 'bin/www'
      };
      var starterKit = this.starterKitDir;

      files[path.join(starterKit, 'elements/._appname/._appname.html')] =
        path.join('app/elements/', this.props.appname, this.props.appname + '.html');
      files[path.join(starterKit, 'elements/._appname/._appname.css')] =
        path.join('app/elements/', this.props.appname, this.props.appname + '.css');
      files[path.join(starterKit, 'scripts/._appname.js')] =
        path.join('app/scripts', this.props.appname +'.js');

      this.utils.processFiles(files);
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
     done();
   }
   , middleware: function() {
     var done = this.async();
     var files = {
       'none': {}
       , 'Express': {
         '_appserver.js': 'appserver.js'
         , 'routes/': 'routes/'
        }
       , 'Koa' : { }
       , 'HAPI': { }
     };

     // fix paths for all the files
     var _files = {};
     var _srcprefix = "._" + this.props.middleWare.toLowerCase();
     var _destprefix = ".";
     if(files[this.props.middleWare] !== null) {
       for(var key in files[this.props.middleWare]) {
         this.log(_files[path.join("._middleware", _srcprefix, key)]
          = path.join(_destprefix, files[this.props.middleWare][key]));
       }
     }
     this.utils.processFiles(_files);

     done();
   }
   , backend: function() {
     var done = this.async();
     var files = {
       'none': {}
      ,'MongoDB': {}
      ,'ElasticJS': {}
     };

     var _files = {};
     var _srcprefix = "._" + this.props.backEnd.toLowerCase();
     var _destprefix = "server";
     if(files[this.props.backEnd] !== null) {
       for(var key in files[this.props.backEnd]) {
         _files[path.join("._backend", _srcprefix, key)]
          = path.join(_destprefix, files[this.props.backEnd][key])
       }
     }
     this.utils.processFiles(_files);
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
