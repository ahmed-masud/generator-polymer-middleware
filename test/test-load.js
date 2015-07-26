/*global describe, beforeEach, it*/
'use strict';
var assert = require('assert');

describe('polymer-express generator', function () {
  it('can be imported without blowing up', function (done) {
    	var app = require('../generators/app');
    	assert(app !== undefined);
	done();
  });
});

