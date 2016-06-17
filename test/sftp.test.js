describe('SFTP', function() {
  var scope = {};


  describe('connect & disconnect', function() {
    describe('connect to real sftp', function() {
      after(function(done) {
        scope.sftp && scope.sftp.disconnect(done);
      });


      it('connect to host with wrong private key file', function(done) {
        scope.sftp = new tnv.Sftp({
          host: tnv.host,
          username: tnv.username,
          port: tnv.port,
          privateKey: 'test/assets/test_sftp.pem'
        }, function(err) {
          should.exist(err);
          err.message.should.eql('permission denied');
          done();
        });
      });


      it('connect to host with correct private key file', function(done) {
        scope.sftp = new tnv.Sftp({
          host: tnv.host,
          username: tnv.username,
          port: tnv.port,
          privateKey: tnv.privateKey
        }, function(err) {
          should.not.exist(err);
          done();
        });
      });


      it('disconnect from remote host', function(done) {
        scope.sftp.disconnect(function(err) {
          should.not.exist(err);
          done();
        });
      });
    });


    describe('connection msg errors with mocked sftp', function() {
      before(function(done) {
        scope.pty = require('pty.js');
        scope.EventEmitter = require('events').EventEmitter;

        sinon.stub(scope.pty, 'spawn', function() {
          scope.emitter = new scope.EventEmitter();
          return scope.emitter;
        });

        done();
      });

      after(function() {
        scope.pty.spawn.restore();
      });


      it('Operation timed out', function(done) {
        scope.sftp = new tnv.Sftp({}, function(err) {
          err.message.should.eql('Operation timed out');
          done();
        });

        setTimeout(function() {
          scope.emitter.emit('data', 'Operation timed out');
        }, 100)
      });


      it('Connection closed', function(done) {
        scope.sftp = new tnv.Sftp({}, function(err) {
          err.message.should.eql('Connection closed');
          done();
        });

        setTimeout(function() {
          scope.emitter.emit('data', 'Connection closed');
        }, 100)
      });


      it('Connection timed out', function(done) {
        scope.sftp = new tnv.Sftp({}, function(err) {
          err.message.should.eql('Connection timed out');
          done();
        });

        setTimeout(function() {
          scope.emitter.emit('data', 'Connection timed out');
        }, 100)
      });


      it('Connection reset by peer', function(done) {
        scope.sftp = new tnv.Sftp({}, function(err) {
          err.message.should.eql('Connection reset by peer');
          done();
        });

        setTimeout(function() {
          scope.emitter.emit('data', 'Connection reset by peer');
        }, 100)
      });
    });
  });


  describe('sftp commands after connection', function() {
    before(function(done) {
      scope.sftp = new tnv.Sftp({
        host: tnv.host,
        username: tnv.username,
        port: tnv.port,
        privateKey: tnv.privateKey
      }, function(err) {
        done(err);
      });
    });


    after(function(done) {
      scope.sftp && scope.sftp.disconnect(done);
    });


    it('pwd', function(done) {
      scope.sftp.pwd(function(err, dir) {
        should.not.exist(err);
        scope.basePath = dir;
        dir.should.contain('/');
        done();
      });
    });


    it('mkdir', function(done) {
      scope.sftp.mkdir(scope.basePath + '/testDir', true, function(err) {
        should.not.exist(err);

        scope.sftp.stat('testDir', function(err, stat) {
          should.not.exist(err);
          stat.isFile().should.eql(false);
          stat.isDirectory().should.eql(true);
          done();
        });
      });
    });


    it('cd into created dir', function(done) {
      scope.sftp.cd('testDir', function(err) {
        should.not.exist(err);

        scope.sftp.pwd(function(err, dir) {
          should.not.exist(err);
          dir.should.eql(scope.basePath + '/testDir');
          done();
        });
      });
    });


    it('cd back from created dir', function(done) {
      scope.sftp.cd('..', function(err) {
        should.not.exist(err);
        scope.sftp.pwd(function(err, dir) {
          should.not.exist(err);
          dir.should.eql(scope.basePath);
          done();
        });
      });
    });


    it('read existing dir', function(done) {
      scope.sftp.readdir(scope.basePath + '/testDir', function(err) {
        should.not.exist(err);
        done();
      });
    });


    it('remove dir', function(done) {
      scope.sftp.rmdir('testDir', function(err) {
        should.not.exist(err);
        done();
      });
    });


    it('read non-existing dir', function(done) {
      scope.sftp.readdir('testDir', function(err, dir) {
        should.not.exist(err);
        dir.length.should.eql(0);
        done();
      });
    });


    it('read non-existing file', function(done) {
      scope.sftp.readFile('thisfiledoesnotexist.js', 'utf-8', function(err) {
        err.code.should.eql('ENOENT');
        done();
      });
    });


    it('write file', function(done) {
      var filePath = __dirname + '/assets/a.js',
        file = tnv.fs.readFileSync(filePath, "utf8");

      scope.sftp.writeFile('a.js', file, 'utf8', true, function(err) {
        should.not.exist(err);

        scope.sftp.stat('a.js', function(err, stat) {
          should.not.exist(err);

          tnv.fs.statSync(filePath).size.should.eql(stat.size);
          stat.isFile().should.eql(true);
          stat.isDirectory().should.eql(false);
          done();
        });
      });
    });


    it('write file (check that file exists is false)', function(done) {
      var filePath = __dirname + '/assets/a.js',
        file = tnv.fs.readFileSync(filePath, "utf8");

      scope.sftp.writeFile('a.js', file, 'utf8', false, function(err) {
        should.not.exist(err);
        done();
      });
    });


    it('read existing file (utf8)', function(done) {
      scope.sftp.readFile('a.js', 'utf-8', function(err, data) {
        should.not.exist(err);
        Buffer.isBuffer(data).should.eql(false);
        done();
      });
    });


    it('read existing file (buffer)', function(done) {
      scope.sftp.readFile('a.js', null, function(err, data) {
        should.not.exist(err);
        Buffer.isBuffer(data).should.eql(true);
        done();
      });
    });


    it('read home dir', function(done) {
      scope.sftp.readdir(scope.basePath, function(err, list) {
        should.not.exist(err);
        list.length.should.be.gt(1);
        done();
      });
    });


    it('remove file', function(done) {
      scope.sftp.unlink('a.js', function(err) {
        should.not.exist(err);
        done();
      });
    });
  });
});