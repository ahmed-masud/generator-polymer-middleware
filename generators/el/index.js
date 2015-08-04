'use strict';
var yeoman = require('yeoman-generator');
var path = require('path');
var chalk = require('chalk');
var fs = require('fs');

module.exports = yeoman.generators.Base.extend({

  this.props = {
    addToElements: true,
    viewEngine: this._detectType() || 'html'
  };

  _showHelp: function (argument) {

  },

  _detectType: function() {
    if(fs.exists(this.destinationPath('package.json'))) {
     return require(this.destinationPath('package.json')).generator.viewEngine;
    }
    return "ejs";
  },

  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.argument('element-name', {
      desc: 'Tag name of the element to generate',
      required: true
    });

    this.option('help');
    this.option('with-docs');
    this.option('path');
    this.option('defaults'); /* non interactive defaults */

    if (this.help) {
      this._showHelp();
    }

    if ( this.elementName.indexOf('-') <= 0 ) {
      this.emit('error', new Error(
        'Element must contain a hyphen("-") and not begin with one.\n'
       +'For example:\n\t'
       +chalk.bold.white('yo polymer-express:el my')+chalk.bold.green('-')+chalk.bold.white('element')
      ));
    }

    this.props.addToElements: true;
    this.props.viewEngine: this._detectType();

    this.log(yosay(
      'Happy to generate ' + chalk.bold.yellow(this.elementName) + ' for you.'
    ));


  },

  prompting: function() {
    var done = this.async();

    var prompts = [];
    prompts.push(  {
        type: 'confirm',
        name: 'addToElements',
        message: 'I can automatically add ' + chalk.bold.white(this.elementName) + ' into elements/elements.html'
          +' would you like me to do that?',
        default: true
    });
    prompt.push({
      type: 'list',
      name: 'viewEngine',
      message: 'Is this an element element or a behavior element?',
      choices: ['element', 'behavior'],
      default: 'element'
    })
    prompt.push({
      type: 'input',
      name: 'version',
      message: 'Give your element a version number',
      default: '0.0.0'
    });

    prompt.push({
      type: 'list',
      name: 'viewEngine',
      choices: [ 'html', 'ejs', 'jade'],
      default: this.props.viewEngine
    });

    this.prompt(prompts, function(props) {
      this.props = props;
      done()
    }.bind(this));
  },

  writing: {
    this.fs.copyTpl(this.templatePath('_index.html'),
      this.destinationPath('index.html'));
  },

  install: {

  }

});
